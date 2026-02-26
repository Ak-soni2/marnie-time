export class BankingService {

  static bank(cb: number) {
    if (cb <= 0) throw new Error("Cannot bank non-positive CB");
    return cb;
  }

  static apply(deficit: number, available: number, amount: number) {
    if (amount > available) throw new Error("Insufficient banked amount");
    if (deficit >= 0) throw new Error("No deficit to apply");
    return deficit + amount;
  }
}