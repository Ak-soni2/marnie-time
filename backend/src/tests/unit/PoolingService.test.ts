import { PoolingService } from "../../core/domain/services/PoolingService.js";

describe("PoolingService", () => {

    test("pool creation works", () => {
        const result = PoolingService.createPool([
            { ship_id: "A", cb: 200 },
            { ship_id: "B", cb: -100 }
        ]);

        expect(result.length).toBe(2);
    });

});