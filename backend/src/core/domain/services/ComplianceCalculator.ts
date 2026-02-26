export class ComplianceCalculator {
  static TARGET_2025 = 89.3368;

  static computeEnergy(fuelConsumption: number) {
    return fuelConsumption * 41000;
  }

  static computeCB(actual: number, fuelConsumption: number) {
    const energy = this.computeEnergy(fuelConsumption);
    return (this.TARGET_2025 - actual) * energy;
  }

  static computePercentDiff(baseline: number, comparison: number) {
    return ((comparison / baseline) - 1) * 100;
  }
}