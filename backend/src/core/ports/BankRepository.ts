export interface BankRepository {
    saveBankEntry(shipId: string, year: number, amount: number): Promise<void>;
    getBankedAmount(shipId: string, year: number): Promise<number>;
}