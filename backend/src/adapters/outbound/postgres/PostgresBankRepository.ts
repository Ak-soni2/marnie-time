import { pool } from "../../../infrastructure/db/connection.js";
import type { BankRepository } from "../../../core/ports/BankRepository.js";

export class PostgresBankRepository implements BankRepository {
    async saveBankEntry(shipId: string, year: number, amount: number): Promise<void> {
        await pool.query(
            "INSERT INTO bank_entries (ship_id, year, amount) VALUES ($1, $2, $3)",
            [shipId, year, amount]
        );
    }

    async getBankedAmount(shipId: string, year: number): Promise<number> {
        const result = await pool.query(
            "SELECT SUM(amount) as total FROM bank_entries WHERE ship_id = $1 AND year <= $2",
            [shipId, year]
        );
        return parseFloat(result.rows[0]?.total) || 0;
    }
}