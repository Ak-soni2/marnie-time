import { BankingService } from "../../core/domain/services/BankingService.js";

describe("BankingService", () => {

    test("bank throws on negative", () => {
        expect(() => BankingService.bank(-10)).toThrow();
    });

    test("apply reduces deficit", () => {
        const result = BankingService.apply(-100, 200, 100);
        expect(result).toBe(0);
    });

});