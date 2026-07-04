import { describe, it, expect } from "vitest";
import { calculateBill, getSlabsForState } from "./tariffCalculator";

describe("tariffCalculator", () => {
  describe("calculateBill", () => {
    it("should calculate correctly with a custom flat rate", () => {
      const result = calculateBill(150, "custom", 6.5);
      expect(result.totalUnits).toBe(150);
      expect(result.grossEnergyCharge).toBe(975); // 150 * 6.5
      expect(result.subsidy).toBe(0);
      expect(result.netEnergyCharge).toBe(975);
      expect(result.stateName).toContain("Custom Tariff");
    });

    it("should calculate correctly with custom flat rate and TOD ratio multipliers", () => {
      const todRatio = {
        peakPercent: 20,    // Multiplier 1.2
        normalPercent: 60,  // Multiplier 1.0
        offPeakPercent: 20  // Multiplier 0.85
      };
      // Weighted multiplier = 0.2 * 1.2 + 0.6 * 1.0 + 0.2 * 0.85 = 0.24 + 0.60 + 0.17 = 1.01
      const result = calculateBill(200, "custom", 5.5, todRatio);
      expect(result.totalUnits).toBe(200);
      // Base gross = 200 * 5.5 = 1100
      // Weighted gross = 1100 * 1.01 = 1111
      expect(result.grossEnergyCharge).toBe(1111);
      expect(result.netEnergyCharge).toBe(1111);
    });

    it("should calculate correctly under Andhra Pradesh (ap_apspdcl) slab structure", () => {
      // 100 units under ap_apspdcl:
      // - First 30 units @ ₹1.90 = 57
      // - Next 45 units @ ₹3.00 = 135
      // - Next 25 units @ ₹4.50 = 112.50
      // Gross = 304.50
      // Subsidy = 184.50 (fixed)
      // Net = 120.00
      const result = calculateBill(100, "ap_apspdcl");
      expect(result.totalUnits).toBe(100);
      expect(result.grossEnergyCharge).toBe(304.50);
      expect(result.subsidy).toBe(184.50);
      expect(result.netEnergyCharge).toBe(120);
      expect(result.stateName).toContain("Andhra Pradesh");
    });

    it("should floor net energy charge at zero when subsidy exceeds gross charge", () => {
      // 20 units under ap_apspdcl:
      // - 20 units @ ₹1.90 = 38
      // Gross = 38
      // Subsidy = 184.50
      // Net = Math.max(0, 38 - 184.50) = 0
      const result = calculateBill(20, "ap_apspdcl");
      expect(result.totalUnits).toBe(20);
      expect(result.grossEnergyCharge).toBe(38);
      expect(result.subsidy).toBe(184.50);
      expect(result.netEnergyCharge).toBe(0);
    });
  });

  describe("getSlabsForState", () => {
    it("should return the correct custom slab structure", () => {
      const slabs = getSlabsForState("custom", 6.8);
      expect(slabs).toHaveLength(1);
      expect(slabs[0].limit).toBe("All consumption");
      expect(slabs[0].rate).toBe("₹6.80");
      expect(slabs[0].max).toBe(Infinity);
    });

    it("should return the correct state slabs structure for ap_apspdcl", () => {
      const slabs = getSlabsForState("ap_apspdcl");
      expect(slabs.length).toBeGreaterThanOrEqual(5);
      expect(slabs[0].limit).toBe("0 – 30 units");
      expect(slabs[0].prev).toBe(0);
    });
  });
});
