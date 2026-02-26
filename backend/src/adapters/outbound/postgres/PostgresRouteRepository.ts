import { pool } from "../../../infrastructure/db/connection.js";
import type { Route } from "../../../core/domain/entities/Route.js";
import type { RouteRepository } from "../../../core/ports/RouteRepository.js";

export class PostgresRouteRepository implements RouteRepository {

    async findAll(): Promise<Route[]> {
        const result = await pool.query("SELECT * FROM routes");
        return result.rows;
    }

    async findBaseline(): Promise<Route | null> {
        const result = await pool.query("SELECT * FROM routes WHERE is_baseline = true LIMIT 1");
        return result.rows[0] || null;
    }

    async setBaseline(route_id: string): Promise<void> {
        await pool.query("UPDATE routes SET is_baseline = false");
        await pool.query("UPDATE routes SET is_baseline = true WHERE route_id = $1", [route_id]);
    }
}