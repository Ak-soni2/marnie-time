import { pool } from "../../../infrastructure/db/connection.js";
import type { ComplianceRepository } from "../../../core/ports/ComplianceRepository.js";

export class PostgresComplianceRepository implements ComplianceRepository {
    async save(shipId: string, year: number, cb: number): Promise<void> {
        const query = `
      INSERT INTO ship_compliance (ship_id, year, cb)
      VALUES ($1, $2, $3)
      ON CONFLICT (id) DO NOTHING; -- Assuming simple insert for this assignment
    `;
        await pool.query(query, [shipId, year, cb]);
    }

    async findByShipAndYear(shipId: string, year: number): Promise<{ cb: number } | null> {
        const result = await pool.query(
            "SELECT cb FROM ship_compliance WHERE ship_id = $1 AND year = $2 ORDER BY id DESC LIMIT 1",
            [shipId, year]
        );
        return result.rows[0] || null;
    }
}