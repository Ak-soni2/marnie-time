export interface PoolRepository {
    createPool(year: number, members: { ship_id: string, cb_before: number, cb_after: number }[]): Promise<number>;
}