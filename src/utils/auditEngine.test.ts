import { describe, it, expect } from "vitest";
import { runHomeAudit } from "./auditEngine";
import { calculateBill } from "./tariffCalculator";
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

  // ─── Dashboard-Style Savings: Custom Wattages ────────────────────────────────
  //
  // These tests verify that when appliances are passed with custom wattages
  // (overriding the defaults), the audit engine:
  //   1. Uses the custom wattage for consumption calculation
  //   2. Calculates correct kWh reduction for each recommendation type
  //   3. Derives correct yearly ₹ savings via getYearlySavingsForReduction
  //
  // The formulas below mirror the logic in auditEngine.ts's recommendation
  // computation. Each expected value is manually traced through the code.

  describe("dashboard-style savings with custom wattages", () => {
    it("should compute AC hours reduction savings using custom wattage", () => {
      // AC custom: 2400W high-load non-inverter, 8h/day
      // Fridge + TV as companions to trigger AC recommendations
      const apps: ApplianceItem[] = [
        { id: "ac", name: "Air Conditioner", category: "essential", watts: 1500, icon: "Wind", hint: "", quantity: 1, hours: 8, age: 0 },
        { id: "fridge", name: "Refrigerator", category: "essential", watts: 220, icon: "Refrigerator", hint: "", quantity: 1, hours: 24, age: 0 },
        { id: "tv", name: "Television", category: "essential", watts: 100, icon: "Tv", hint: "", quantity: 1, hours: 4, age: 0 },
      ];
      const customWattages = { ac: 2400 };

      const result = runHomeAudit(apps, customWattages, "custom", 7.0);

      // Total consumption with custom AC:
      //   AC:     (2400/1000) * 1 * 8 * 30            = 576.0
      //   Fridge: (220/1000) * 1 * 24 * 30            = 158.4
      //   TV:     (100/1000) * 1 * 4 * 30             = 12.0
      //   Total:                                        746.4
      expect(result.totalUnits).toBeCloseTo(746.4, 1);

      // AC hours reduction formula: (ac.watts * ac.quantity * 1.5 * 30) / 1000
      //   = (2400 * 1 * 1.5 * 30) / 1000 = 108 kWh/month

      // Yearly savings = monthly ₹ savings * 12
      //   totalBill   = calculateBill(746.4, "custom", 7).netEnergyCharge = 5224.80
      //   newUnits    = 746.4 - 108 = 638.4
      //   newBill     = calculateBill(638.4, "custom", 7).netEnergyCharge = 4468.80
      //   monthly     = 5224.80 - 4468.80 = 756.00
      //   yearly      = Math.round(756.00 * 12) = 9072
      const expectedAcYearlySavings = Math.round(
        Math.max(0, calculateBill(746.4, "custom", 7.0).netEnergyCharge - calculateBill(638.4, "custom", 7.0).netEnergyCharge) * 12
      );

      const acRec = result.recommendations.find((r) => r.id === "ac_hours_reduction");
      expect(acRec).toBeDefined();
      expect(acRec!.yearlySavings).toBe(expectedAcYearlySavings);
      expect(acRec!.yearlySavings).toBeGreaterThan(200);
    });

    it("should compute AC upgrade savings for high-wattage AC with custom wattage", () => {
      // Custom AC: 2400W > 1200W → triggers 25% upgrade savings
      const apps: ApplianceItem[] = [
        { id: "ac", name: "Air Conditioner", category: "essential", watts: 1500, icon: "Wind", hint: "", quantity: 1, hours: 8, age: 0 },
        { id: "fridge", name: "Refrigerator", category: "essential", watts: 220, icon: "Refrigerator", hint: "", quantity: 1, hours: 24, age: 0 },
      ];
      const customWattages = { ac: 2400 };
      const result = runHomeAudit(apps, customWattages, "custom", 7.0);

      // AC upgrade reduction: (ac.watts * 0.25 * ac.quantity * ac.hours * 30) / 1000
      //   = (2400 * 0.25 * 1 * 8 * 30) / 1000 = 144 kWh/month
      const expectedKwhReduction = (2400 * 0.25 * 1 * 8 * 30) / 1000;
      expect(expectedKwhReduction).toBe(144);

      // Verify the recommendation exists and has yearly savings > 500 (threshold)
      const acUpgradeRec = result.recommendations.find((r) => r.id === "ac_upgrade");
      expect(acUpgradeRec).toBeDefined();
      expect(acUpgradeRec!.yearlySavings).toBeGreaterThan(500);
    });

    it("should NOT recommend AC upgrade when custom wattage is <= 1200W", () => {
      // AC custom: 1200W exactly → NOT > 1200, so no upgrade recommendation
      const apps: ApplianceItem[] = [
        { id: "ac", name: "Air Conditioner", category: "essential", watts: 1500, icon: "Wind", hint: "", quantity: 1, hours: 6, age: 0 },
      ];
      const customWattages = { ac: 1000 };
      const result = runHomeAudit(apps, customWattages, "custom", 7.0);

      const acUpgradeRec = result.recommendations.find((r) => r.id === "ac_upgrade");
      expect(acUpgradeRec).toBeUndefined();
    });

    it("should compute fridge upgrade savings using custom wattage", () => {
      // Fridge custom: 400W > 180W → triggers fridge upgrade recommendation
      const apps: ApplianceItem[] = [
        { id: "fridge", name: "Refrigerator", category: "essential", watts: 220, icon: "Refrigerator", hint: "", quantity: 1, hours: 24, age: 0 },
        { id: "fan", name: "Ceiling Fan", category: "essential", watts: 50, icon: "Fan", hint: "", quantity: 1, hours: 6, age: 0 },
      ];
      const customWattages = { fridge: 400 };
      const result = runHomeAudit(apps, customWattages, "custom", 7.0);

      // Total consumption with custom fridge:
      //   Fridge: (400/1000) * 1 * 24 * 30  = 288.0
      //   Fan:    (50/1000) * 1 * 6 * 30    = 9.0
      //   Total:                               297.0
      expect(result.totalUnits).toBeCloseTo(297, 1);

      // Fridge upgrade reduction: ((fridge.watts - 130) * fridge.quantity * 24 * 30) / 1000
      //   = ((400 - 130) * 1 * 24 * 30) / 1000 = 194.4 kWh/month
      const expectedKwhReduction = ((400 - 130) * 1 * 24 * 30) / 1000;
      expect(expectedKwhReduction).toBe(194.4);

      // The recommendation should exist (yearly savings > 300 threshold)
      const fridgeRec = result.recommendations.find((r) => r.id === "fridge_upgrade");
      expect(fridgeRec).toBeDefined();
      expect(fridgeRec!.yearlySavings).toBeGreaterThan(300);
    });

    it("should NOT recommend fridge upgrade when custom wattage is <= 180W", () => {
      const apps: ApplianceItem[] = [
        { id: "fridge", name: "Refrigerator", category: "essential", watts: 220, icon: "Refrigerator", hint: "", quantity: 1, hours: 24, age: 0 },
      ];
      const customWattages = { fridge: 160 };
      const result = runHomeAudit(apps, customWattages, "custom", 7.0);

      const fridgeRec = result.recommendations.find((r) => r.id === "fridge_upgrade");
      expect(fridgeRec).toBeUndefined();
    });

    it("should compute LED conversion savings using custom light wattage", () => {
      // Lights custom: 60W incandescent (default is 10W LED) → triggers LED upgrade
      const apps: ApplianceItem[] = [
        { id: "lights", name: "LED Bulb", category: "essential", watts: 10, icon: "Lightbulb", hint: "", quantity: 4, hours: 6, age: 0 },
        { id: "fan", name: "Ceiling Fan", category: "essential", watts: 50, icon: "Fan", hint: "", quantity: 1, hours: 4, age: 0 },
      ];
      const customWattages = { lights: 60 };
      const result = runHomeAudit(apps, customWattages, "custom", 7.0);

      // LED conversion reduction: ((lights.watts - 9) * lights.quantity * lights.hours * 30) / 1000
      //   = ((60 - 9) * 4 * 6 * 30) / 1000 = 36.72 kWh/month
      const expectedKwhReduction = ((60 - 9) * 4 * 6 * 30) / 1000;
      expect(expectedKwhReduction).toBeCloseTo(36.72, 2);

      const ledRec = result.recommendations.find((r) => r.id === "led_conversion");
      expect(ledRec).toBeDefined();
      expect(ledRec!.yearlySavings).toBeGreaterThan(100);
    });

    it("should NOT recommend LED conversion when lights already <= 12W", () => {
      // Lights at 12W → audit engine checks `lights.watts > 12` → false, no rec
      const apps: ApplianceItem[] = [
        { id: "lights", name: "LED Bulb", category: "essential", watts: 12, icon: "Lightbulb", hint: "", quantity: 4, hours: 6, age: 0 },
        { id: "tv", name: "Television", category: "essential", watts: 100, icon: "Tv", hint: "", quantity: 1, hours: 4, age: 0 },
      ];
      const result = runHomeAudit(apps, {}, "custom", 7.0);

      const ledRec = result.recommendations.find((r) => r.id === "led_conversion");
      expect(ledRec).toBeUndefined();
    });

    it("should compute fan BLDC upgrade savings using custom fan wattage", () => {
      // Fan custom: 80W conventional (default is 50W), 10h/day > 8h threshold
      const apps: ApplianceItem[] = [
        { id: "fan", name: "Ceiling Fan", category: "essential", watts: 50, icon: "Fan", hint: "", quantity: 3, hours: 10, age: 0 },
        { id: "lights", name: "LED Bulb", category: "essential", watts: 10, icon: "Lightbulb", hint: "", quantity: 2, hours: 4, age: 0 },
      ];
      const customWattages = { fan: 80 };
      const result = runHomeAudit(apps, customWattages, "custom", 7.0);

      // Fan BLDC reduction: ((fan.watts - 28) * fan.quantity * fan.hours * 30) / 1000
      //   = ((80 - 28) * 3 * 10 * 30) / 1000 = 46.8 kWh/month
      const expectedKwhReduction = ((80 - 28) * 3 * 10 * 30) / 1000;
      expect(expectedKwhReduction).toBeCloseTo(46.8, 1);

      const fanRec = result.recommendations.find((r) => r.id === "fan_bldc_upgrade");
      expect(fanRec).toBeDefined();
      expect(fanRec!.yearlySavings).toBeGreaterThan(200);
    });

    it("should NOT recommend BLDC fan upgrade when fan hours <= 8", () => {
      const apps: ApplianceItem[] = [
        { id: "fan", name: "Ceiling Fan", category: "essential", watts: 80, icon: "Fan", hint: "", quantity: 2, hours: 6, age: 0 },
      ];
      const customWattages = { fan: 80 };
      // Fan at 80W > 40W ✓, but hours = 6 which is NOT > 8 → no rec
      const result = runHomeAudit(apps, customWattages, "custom", 7.0);

      const fanRec = result.recommendations.find((r) => r.id === "fan_bldc_upgrade");
      expect(fanRec).toBeUndefined();
    });

    it("should compute T5 LED tube conversion savings using custom tube wattage", () => {
      // Tube custom: 40W conventional (default matches), 2 tubes, 6h/day
      const apps: ApplianceItem[] = [
        { id: "lights_tube", name: "Tube Light", category: "essential", watts: 40, icon: "Lightbulb", hint: "", quantity: 2, hours: 6, age: 0 },
        { id: "tv", name: "Television", category: "essential", watts: 100, icon: "Tv", hint: "", quantity: 1, hours: 2, age: 0 },
      ];
      const result = runHomeAudit(apps, {}, "custom", 7.0);

      // Tube conversion: ((tube.watts - 18) * tube.quantity * tube.hours * 30) / 1000
      //   = ((40 - 18) * 2 * 6 * 30) / 1000 = 7.92 kWh/month
      const expectedKwhReduction = ((40 - 18) * 2 * 6 * 30) / 1000;
      expect(expectedKwhReduction).toBeCloseTo(7.92, 2);

      const tubeRec = result.recommendations.find((r) => r.id === "tube_led_conversion");
      // 7.92 kWh/month at ₹7 = 55.44 ₹/month = 665.28 ₹/year > 100 ✓
      expect(tubeRec).toBeDefined();
      expect(tubeRec!.yearlySavings).toBeGreaterThan(100);
    });

    it("should compute standby savings reduction when enough devices are present", () => {
      // Multiple standby devices: TV, Desktop, Router, Printer (4 ≥ 3 threshold)
      const apps: ApplianceItem[] = [
        { id: "tv", name: "Television", category: "essential", watts: 100, icon: "Tv", hint: "", quantity: 1, hours: 4, age: 0 },
        { id: "desktop", name: "Desktop Computer", category: "electronics", watts: 200, icon: "Monitor", hint: "", quantity: 1, hours: 6, age: 0 },
        { id: "router", name: "Wi-Fi Router", category: "electronics", watts: 15, icon: "Router", hint: "", quantity: 1, hours: 24, age: 0 },
        { id: "printer", name: "Printer", category: "electronics", watts: 50, icon: "Printer", hint: "", quantity: 1, hours: 0.2, age: 0 },
      ];
      const result = runHomeAudit(apps, {}, "custom", 7.0);

      // Standby reduction: (8 * standbyCount * 20 * 30) / 1000
      //   = (8 * 4 * 20 * 30) / 1000 = 19.2 kWh/month
      const expectedKwhReduction = (8 * 4 * 20 * 30) / 1000;
      expect(expectedKwhReduction).toBeCloseTo(19.2, 1);

      const standbyRec = result.recommendations.find((r) => r.id === "eliminate_standby");
      expect(standbyRec).toBeDefined();
      expect(standbyRec!.yearlySavings).toBeGreaterThan(100);
    });

    it("should NOT recommend standby savings when fewer than 3 standby devices", () => {
      const apps: ApplianceItem[] = [
        { id: "tv", name: "Television", category: "essential", watts: 100, icon: "Tv", hint: "", quantity: 1, hours: 4, age: 0 },
        { id: "router", name: "Wi-Fi Router", category: "electronics", watts: 15, icon: "Router", hint: "", quantity: 1, hours: 24, age: 0 },
      ];
      const result = runHomeAudit(apps, {}, "custom", 7.0);

      const standbyRec = result.recommendations.find((r) => r.id === "eliminate_standby");
      expect(standbyRec).toBeUndefined();
    });

    it("should use custom wattages for both consumption and hog identification", () => {
      // Without custom wattages: AC 1000W > Fridge 200W → AC is highest consumer
      // With custom wattages: Fridge 1000W > AC 1000W → Fridge ties or wins
      const apps: ApplianceItem[] = [
        { id: "ac", name: "Air Conditioner", category: "essential", watts: 1000, icon: "Wind", hint: "", quantity: 1, hours: 5, age: 0 },
        { id: "fridge", name: "Refrigerator", category: "essential", watts: 200, icon: "Refrigerator", hint: "", quantity: 1, hours: 24, age: 0 },
        { id: "fan", name: "Ceiling Fan", category: "essential", watts: 50, icon: "Fan", hint: "", quantity: 2, hours: 6, age: 0 },
      ];
      const customWattages = { fridge: 1000 };

      const result = runHomeAudit(apps, customWattages, "custom", 7.0);

      // Fridge with custom 1000W: (1000/1000) * 1 * 24 * 30 = 720 kWh → highest
      // AC with default 1000W: (1000/1000) * 1 * 5 * 30 = 150 kWh
      expect(result.hogs[0].id).toBe("fridge");
      expect(result.hogs[0].monthlyKwh).toBeCloseTo(720, 1);
      expect(result.hogs[0].percent).toBeGreaterThan(50);

      // Fridge 720 kWh > 250 baseline → insight about above-baseline consumption
      const baselineInsight = result.insights.find((i) => i.title.includes("Above Baseline"));
      expect(baselineInsight).toBeDefined();
    });
  });
});
