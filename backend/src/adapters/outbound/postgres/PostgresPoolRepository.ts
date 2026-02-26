import { pool } from "../../../infrastructure/db/connection.js";
import type { PoolRepository } from "../../../core/ports/PoolRepository.js";

export class PostgresPoolRepository implements PoolRepository {
    async createPool(year: number, members: { ship_id: string, cb_before: number, cb_after: number }[]): Promise<number> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const poolResult = await client.query(
                "INSERT INTO pools (year) VALUES ($1) RETURNING id",
                [year]
            );
            const poolId = poolResult.rows[0].id;

            for (const m of members) {
                await client.query(
                    "INSERT INTO pool_members (pool_id, ship_id, cb_before, cb_after) VALUES ($1, $2, $3, $4)",
                    [poolId, m.ship_id, m.cb_before, m.cb_after]
                );
            }

            await client.query('COMMIT');
            return poolId;
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }
}