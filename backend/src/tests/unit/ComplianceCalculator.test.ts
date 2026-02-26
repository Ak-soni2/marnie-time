import { ComplianceCalculator } from "../../core/domain/services/ComplianceCalculator.js";

describe("ComplianceCalculator", () => {

    test("computeCB works correctly", () => {
        const cb = ComplianceCalculator.computeCB(90, 5000);
        expect(typeof cb).toBe("number");
    });

    test("percent diff works", () => {
        const diff = ComplianceCalculator.computePercentDiff(90, 95);
        expect(diff).toBeCloseTo(5.555, 1);
    });

});