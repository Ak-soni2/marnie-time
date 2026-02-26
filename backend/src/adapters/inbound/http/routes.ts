import { Router, type Request, type Response } from "express";
import { PostgresRouteRepository } from "../../outbound/postgres/PostgresRouteRepository.js";
import { PostgresComplianceRepository } from "../../outbound/postgres/PostgresComplianceRepository.js";
import { PostgresBankRepository } from "../../outbound/postgres/PostgresBankRepository.js";
import { PostgresPoolRepository } from "../../outbound/postgres/PostgresPoolRepository.js";
import { ComplianceCalculator } from "../../../core/domain/services/ComplianceCalculator.js";
import { BankingService } from "../../../core/domain/services/BankingService.js";
import { PoolingService } from "../../../core/domain/services/PoolingService.js";

const router = Router();
const routeRepo = new PostgresRouteRepository();
const complianceRepo = new PostgresComplianceRepository();
const bankRepo = new PostgresBankRepository();
const poolRepo = new PostgresPoolRepository();

router.get("/routes", async (_req: Request, res: Response) => {
    try {
        const routes = await routeRepo.findAll();
        res.json(routes);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/routes/:id/baseline", async (req: Request, res: Response) => {
    try {
        await routeRepo.setBaseline(req.params.id as string);
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/routes/comparison", async (_req: Request, res: Response) => {
    try {
        const baseline = await routeRepo.findBaseline();
        const routes = await routeRepo.findAll();

        const result = routes.map(r => ({
            route_id: r.route_id,
            ghg_intensity: r.ghg_intensity,
            percentDiff: baseline
                ? ComplianceCalculator.computePercentDiff(
                    baseline.ghg_intensity,
                    r.ghg_intensity
                )
                : 0,
            compliant: r.ghg_intensity <= ComplianceCalculator.TARGET_2025
        }));

        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET /compliance/cb?shipId&year
router.get("/compliance/cb", async (req, res: any) => {
    try {
        const shipId = req.query.shipId as string;
        const year = Number(req.query.year);
        if (!shipId || !year) return res.status(400).json({ error: "Missing shipId or year" });

        // In a real system, we'd fetch the ship's actual fuel consumption. 
        // Here we map shipId to route_id from seed data.
        const route = (await routeRepo.findAll()).find(r => r.route_id === shipId && r.year === year);
        if (!route) return res.status(404).json({ error: "Ship data not found for given year" });

        const cb = ComplianceCalculator.computeCB(route.ghg_intensity, route.fuel_consumption);

        const existing = await complianceRepo.findByShipAndYear(shipId, year);
        if (!existing) {
            await complianceRepo.save(shipId, year, cb);
        }

        res.json({ cb });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET /compliance/adjusted-cb?shipId&year
router.get("/compliance/adjusted-cb", async (req, res: any) => {
    try {
        const shipId = req.query.shipId as string;
        const year = Number(req.query.year);
        if (!shipId || !year) return res.status(400).json({ error: "Missing shipId or year" });

        const comp = await complianceRepo.findByShipAndYear(shipId, year);
        if (!comp) return res.status(404).json({ error: "Compliance data not found" });

        res.json({ cb: comp.cb });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET /banking/records?shipId&year
router.get("/banking/records", async (req, res: any) => {
    try {
        const shipId = req.query.shipId as string;
        const year = Number(req.query.year);
        if (!shipId || !year) return res.status(400).json({ error: "Missing shipId or year" });

        const amount = await bankRepo.getBankedAmount(shipId, year);
        res.json({ banked_amount: amount });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// POST /banking/bank
router.post("/banking/bank", async (req, res: any) => {
    try {
        const { shipId, year, amount } = req.body;
        BankingService.bank(amount); // validates positive

        // Decrease CB from compliance repository effectively (or abstract into usecase, simplifying here)
        const comp = await complianceRepo.findByShipAndYear(shipId, year);
        if (!comp || comp.cb < amount) {
            return res.status(400).json({ error: "Insufficient compliance balance to bank" });
        }

        const newCb = comp.cb - amount;
        await bankRepo.saveBankEntry(shipId, year, amount);
        await complianceRepo.save(shipId, year, newCb);

        res.json({ success: true, cb_before: comp.cb, banked: amount, cb_after: newCb });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

// POST /banking/apply
router.post("/banking/apply", async (req, res: any) => {
    try {
        const { shipId, year, amount } = req.body;
        const banked = await bankRepo.getBankedAmount(shipId, year);

        const comp = await complianceRepo.findByShipAndYear(shipId, year);
        if (!comp) return res.status(404).json({ error: "Compliance data not found" });

        const newCb = BankingService.apply(comp.cb, banked, amount); // validates rules

        // Apply means using banked amount, so we log negative entry
        await bankRepo.saveBankEntry(shipId, year, -amount);
        await complianceRepo.save(shipId, year, newCb);

        res.json({ success: true, cb_before: comp.cb, applied: amount, cb_after: newCb });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

// POST /pools
router.post("/pools", async (req, res: any) => {
    try {
        const { year, members } = req.body; // members: { ship_id, cb }[]
        if (!year || !Array.isArray(members) || members.length === 0) {
            return res.status(400).json({ error: "Invalid pool request" });
        }

        const resultMembers = PoolingService.createPool(members);

        // Save to pool repo
        const poolMembersToSave = members.map(m => {
            const resMem = resultMembers.find(rm => rm.ship_id === m.ship_id);
            return {
                ship_id: m.ship_id,
                cb_before: m.cb,
                cb_after: resMem ? resMem.cb_after : m.cb
            };
        });

        const poolId = await poolRepo.createPool(year, poolMembersToSave);

        // Update ship compliances
        for (const m of poolMembersToSave) {
            await complianceRepo.save(m.ship_id, year, m.cb_after);
        }

        res.json({ pool_id: poolId, members: poolMembersToSave });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

export default router;