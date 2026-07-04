import { describe, it, expect } from "vitest";
import { runHomeAudit } from "./auditEngine";
import type { ApplianceItem } from "./tariffCalculator";

describe("auditEngine", () => {
  const mockFridge: ApplianceItem = {
    id: "fridge",
    name: "Refrigerator",
    category: "essential",
    watts: 200,
    icon: "Refrigerator",
    hint: "Double Door",
    quantity: 1,
    hours: 24,
    age: 0
  };

  const mockLights: ApplianceItem = {
    id: "lights",
    name: "LED Bulb",
    category: "essential",
    watts: 10,
    icon: "Lightbulb",
    hint: "LED Bulbs",
    quantity: 5,
    hours: 8,
    age: 0
  };

  const mockAC: ApplianceItem = {
    id: "ac",
    name: "Air Conditioner",
    category: "essential",
    watts: 1000,
    icon: "Wind",
    hint: "Split AC",
    quantity: 1,
    hours: 5,
    age: 0
  };

  it("should run audit and calculate total consumption correctly for new appliances", () => {
    // Refrigerator usage: (200W * 1 * 24h * 30 days) / 1000 = 144 kWh
    // LED Bulbs usage: (10W * 5 * 8h * 30 days) / 1000 = 12 kWh
    // Total consumption: 144 + 12 = 156 kWh
    const result = runHomeAudit([mockFridge, mockLights], {}, "custom", 6.0);

    expect(result.totalUnits).toBeCloseTo(156, 1);
    expect(result.totalBill).toBeCloseTo(156 * 6.0, 1); // 156 * 6 = 936
    expect(result.hogs).toHaveLength(2);
    expect(result.hogs[0].id).toBe("fridge"); // highest consumer
    expect(result.hogs[0].monthlyKwh).toBeCloseTo(144, 1);
    expect(result.hogs[0].percent).toBe(92);
  });

  it("should filter out appliances with zero quantity or hours", () => {
    const zeroQtyFridge = { ...mockFridge, quantity: 0 };
    const zeroHoursLights = { ...mockLights, hours: 0 };
    const result = runHomeAudit([zeroQtyFridge, zeroHoursLights, mockAC], {}, "custom", 6.0);

    // Only AC is active: (1000W * 1 * 5h * 30 days) / 1000 = 150 kWh
    expect(result.totalUnits).toBeCloseTo(150, 1);
    expect(result.hogs).toHaveLength(1);
    expect(result.hogs[0].id).toBe("ac");
  });

  it("should apply aging decay penalty to consumption calculations", () => {
    // Decay rate for fridge: 1.5% per year (0.015)
    // 10 years old fridge: 200W * (1 + 10 * 0.015) = 200W * 1.15 = 230W
    // Consumption: (230W * 24h * 30 days) / 1000 = 165.6 kWh (vs 144 kWh for new fridge)
    const agedFridge = { ...mockFridge, age: 10, unitAges: [10] };
    const result = runHomeAudit([agedFridge], {}, "custom", 5.0);

    expect(result.totalUnits).toBeCloseTo(165.6, 1);
  });

  it("should generate proper solar recommendations and health scores", () => {
    const result = runHomeAudit([mockFridge, mockLights, mockAC], {}, "custom", 7.0);

    // Total monthly kWh: 144 (fridge) + 12 (lights) + 150 (AC) = 306 kWh
    expect(result.score).toBeGreaterThanOrEqual(10);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.solarAdvice).toBeDefined();
    expect(result.solarAdvice.sizeKw).toBeGreaterThan(0);
    expect(result.solarAdvice.yearlySavings).toBeGreaterThan(0);
  });
});
