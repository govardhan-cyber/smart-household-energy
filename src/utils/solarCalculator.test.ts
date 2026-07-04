import { describe, it, expect } from "vitest";
import { 
  getTariffKey, 
  getEstimatedCost, 
  estimateUnitsFromBill, 
  calculateSolarROI 
} from "./solarCalculator";

describe("solarCalculator utility", () => {
  describe("getTariffKey", () => {
    it("should map state selector codes correctly", () => {
      expect(getTariffKey("AP")).toBe("ap");
      expect(getTariffKey("TS")).toBe("telangana");
      expect(getTariffKey("KA")).toBe("karnataka");
      expect(getTariffKey("custom")).toBe("custom");
    });
  });

  describe("getEstimatedCost", () => {
    it("should calculate correct estimated cost for systems under PM Surya Ghar rules", () => {
      // Pune pricing: 2kW = 115000, 3kW = 132000, 4kW = 177000, 5kW = 232000
      const cost2kW = getEstimatedCost(2, "pune");
      expect(cost2kW).toBe(115000);

      const cost3kW = getEstimatedCost(3, "pune");
      expect(cost3kW).toBe(132000);

      // Mid-value interpolation (e.g. 2.5 kW)
      const cost2_5kW = getEstimatedCost(2.5, "pune");
      expect(cost2_5kW).toBe(Math.round(115000 + (132000 - 115000) * 0.5));
    });
  });

  describe("estimateUnitsFromBill", () => {
    it("should estimate units matching corresponding slab tariffs", () => {
      // In AP, a net energy bill of around ₹459 maps to ~132 units
      const unitsAP = estimateUnitsFromBill(459, "ap");
      expect(unitsAP).toBe(163);
    });
  });

  describe("calculateSolarROI", () => {
    it("should correctly simulate 25-year timeline, including compounding degradation", () => {
      const output = calculateSolarROI({
        monthlyBill: 3000,
        roofArea: 300,
        selectedState: "ap",
        selectedCity: "pune",
        solarTech: "topcon",
        roofTilt: "inclined",
        roofOrientation: "south",
        shadedPanelsCount: 0,
        isHybrid: false,
        batteryKwh: 0,
        batteryType: "lithium",
        netMeteringPolicy: "net-metering",
        buybackRate: 3,
        todShiftPercent: 0,
        tariffIncrease: 4,
        panelDegradation: 0.8,
        maintenanceRate: 1.0
      });

      // Payback year and cost structures check
      expect(output.recommendedKw).toBeGreaterThanOrEqual(1);
      expect(output.totalUpfrontInvestment).toBeGreaterThan(0);
      expect(output.paybackData.length).toBe(16); // Yr 0 to Yr 15 (16 entries)
      expect(output.paybackPeriodVal).toBeGreaterThan(0);
      expect(output.paybackPeriodVal).toBeLessThan(25); // Should pay back before 25 years under standard 3000/mo bill
      
      // Degradation year-over-year balance check
      const year0 = output.paybackData[0];
      const year1 = output.paybackData[1];
      expect(year0.year).toBe("Yr 0");
      expect(year0.Balance).toBe(-output.totalUpfrontInvestment);
      expect(year1.Balance).toBeGreaterThan(year0.Balance); // Cumulative savings improves balance
    });

    it("should handle battery costs and replacement intervals in hybrid systems", () => {
      const outputLeadAcid = calculateSolarROI({
        monthlyBill: 5000,
        roofArea: 500,
        selectedState: "ap",
        selectedCity: "pune",
        solarTech: "mono-perc",
        roofTilt: "inclined",
        roofOrientation: "south",
        shadedPanelsCount: 0,
        isHybrid: true,
        batteryKwh: 10,
        batteryType: "lead-acid", // 4-year replacement interval
        netMeteringPolicy: "net-metering",
        buybackRate: 3,
        todShiftPercent: 0,
        tariffIncrease: 4,
        panelDegradation: 0.8,
        maintenanceRate: 1.0
      });

      const outputLithium = calculateSolarROI({
        monthlyBill: 5000,
        roofArea: 500,
        selectedState: "ap",
        selectedCity: "pune",
        solarTech: "mono-perc",
        roofTilt: "inclined",
        roofOrientation: "south",
        shadedPanelsCount: 0,
        isHybrid: true,
        batteryKwh: 10,
        batteryType: "lithium", // 10-year replacement interval
        netMeteringPolicy: "net-metering",
        buybackRate: 3,
        todShiftPercent: 0,
        tariffIncrease: 4,
        panelDegradation: 0.8,
        maintenanceRate: 1.0
      });

      // Lead-acid battery cost per kWh is 7000, Lithium is 15000
      expect(outputLeadAcid.batteryCost).toBe(70000);
      expect(outputLithium.batteryCost).toBe(150000);
    });
  });
});
