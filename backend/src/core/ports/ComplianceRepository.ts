export interface ComplianceRepository {
    save(shipId: string, year: number, cb: number): Promise<void>;
    findByShipAndYear(shipId: string, year: number): Promise<{ cb: number } | null>;
}