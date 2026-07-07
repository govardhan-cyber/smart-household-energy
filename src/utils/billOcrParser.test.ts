import { describe, it, expect } from "vitest";
import { parseOcrWithHeuristics } from "./billOcrParser";

describe("APEPDCL Bill Parser Heuristics Tests", () => {
  it("should accurately parse Bill 1: M.V. RAMANAYYA", () => {
    const ocrText = `
      M.V.RAMANAYYA,
      Service Number 131102A202034345
      Bill Number 48223315006
      Amount Due (Rs) 561.35
      Disconnection Date 03-Jun-2026
      Unique Service Number 23315006
      Bill Date 05-May-2026
      Billed Units 132
      Due Date 19-May-2026

      Meter Readings
      R.M.D. 1.10
      Present Reading (kWh)  2667
      Previous Reading (kWh) 2535
      Present Reading (kVAh) 0
      Previous Reading (kVAh) 0
      Multiplying Factor 1
      Billed Units 132
      Meter Present Status 1 (LIVE)
      Meter Previous Status 1 (LIVE)
      Previous Reading Date 07-APR-2026

      Energy & Other Charges (Rs.)
      Energy Charges 643.50
      Fixed Charges 10.00
      Customer Charges 50.00
      Electricity Duty 7.92
      Total Amount 752.00
      Govt. Subsidy 184.50
      Net Bill Amount 561.35
    `;

    const result = parseOcrWithHeuristics(ocrText);

    expect(result.consumerName).toBe("M.V.RAMANAYYA");
    expect(result.serviceNumber).toBe("131102A202034345");
    expect(result.customerID).toBe("23315006");
    expect(result.previousReading).toBe(2535);
    expect(result.currentReading).toBe(2667);
    expect(result.unitsConsumed).toBe(132);
    expect(result.totalAmount).toBe(752);
    expect(result.governmentSubsidy).toBe(185);
    expect(result.netBill).toBe(561); // Net Bill Amount: 561
    expect(result.fixedCharge).toBe(60); // 10 + 50 = 60
    expect(result.tax).toBe(8); // 7.92 -> 8
  });

  it("should accurately parse Bill 2: DUPANAKUMAR (Solar Net-Metered)", () => {
    const ocrText = `
      DUPANAKUMAR JAYA BHARATA REDDY,
      Service Number 131450J086300691
      Bill Number 746
      Amount Due (Rs) 945.56
      Disconnection Date 30-May-2026
      Unique Service Number 30338570
      Bill Date 01-May-2026
      Billed Units 529
      Due Date 15-May-2026

      Meter Readings
      R.M.D. 4.28
      Present Reading (kWh)  3909
      Previous Reading (kWh) 3380
      Present Reading (kVAh) 4054
      Previous Reading (kVAh) 3508
      Multiplying Factor 1
      Billed Units 529
      Solar Present Reading (kWh)  3302
      Solar Previous Reading (kWh) 2973
      Solar Export Units 329
      Net Billed Units 0
      Meter Present Status 1 (LIVE)
      Meter Previous Status 1 (LIVE)
      Previous Reading Date 01-APR-2026

      Solar Details
      Export units 329
      Import units 529
      Solar Installed Capacity(kW) 3.00

      Energy & Other Charges (Rs.)
      Energy Charges 1051.50
      Fixed Charges 30.00
      Customer Charges 50.00
      Electricity Duty 31.74
      Total Amount 1166.00
      Govt. Subsidy 184.50
      Net Bill Amount 945.56
    `;

    const result = parseOcrWithHeuristics(ocrText);

    expect(result.consumerName).toBe("DUPANAKUMAR JAYA BHARATA REDDY");
    expect(result.serviceNumber).toBe("131450J086300691");
    expect(result.customerID).toBe("30338570");
    expect(result.previousReading).toBe(3380);
    expect(result.currentReading).toBe(3909);
    expect(result.totalAmount).toBe(1166);
    expect(result.governmentSubsidy).toBe(185);
    expect(result.netBill).toBe(946); // Net Bill Amount: 946
    expect(result.fixedCharge).toBe(80); // 30 + 50 = 80
    expect(result.tax).toBe(32); // 31.74 -> 32
  });

  it("should accurately parse Bill 3: TIRLANGI RANGARAO", () => {
    const ocrText = `
      TIRLANGI RANGARAO,
      Service Number 131203S151000114
      Bill Number 670623299662
      Amount Due (Rs) 543.31
      Disconnection Date 04-Jun-2026
      Unique Service Number 23299662
      Bill Date 06-May-2026
      Billed Units 124
      Due Date 20-May-2026

      Meter Readings
      R.M.D. 0.35
      Present Reading (kWh)  2518
      Previous Reading (kWh) 2394
      Present Reading (kVAh) 0
      Previous Reading (kVAh) 0
      Multiplying Factor 1
      Billed Units 124
      Meter Present Status 1 (LIVE)
      Meter Previous Status 1 (LIVE)
      Previous Reading Date 05-APR-2026

      Energy & Other Charges (Rs.)
      Energy Charges 596.67
      Fixed Charges 10.00
      Customer Charges 45.00
      Electricity Duty 7.44
      Total Amount 733.00
      Govt. Subsidy 184.17
      Net Bill Amount 543.31
    `;

    const result = parseOcrWithHeuristics(ocrText);

    expect(result.consumerName).toBe("TIRLANGI RANGARAO");
    expect(result.serviceNumber).toBe("131203S151000114");
    expect(result.customerID).toBe("23299662");
    expect(result.previousReading).toBe(2394);
    expect(result.currentReading).toBe(2518);
    expect(result.unitsConsumed).toBe(124);
    expect(result.totalAmount).toBe(733);
    expect(result.governmentSubsidy).toBe(184);
    expect(result.netBill).toBe(543);
    expect(result.fixedCharge).toBe(55); // 10 + 45 = 55
    expect(result.tax).toBe(7);
  });

  it("should accurately parse Bill 4: SANAPALANARASINGA RAO", () => {
    const ocrText = `
      SANAPALANARASINGA RAO,
      Service Number 131407G060000068
      Bill Number 26069762
      Amount Due (Rs) 626.58
      Disconnection Date 07-Jun-2026
      Unique Service Number 26069762
      Bill Date 09-May-2026
      Billed Units 141
      Due Date 23-May-2026

      Meter Readings
      R.M.D. 1.60
      Present Reading (kWh)  6102
      Previous Reading (kWh) 5961
      Present Reading (kVAh) 0
      Previous Reading (kVAh) 0
      Multiplying Factor 1
      Billed Units 141
      Meter Present Status 1 (LIVE)
      Meter Previous Status 1 (LIVE)
      Previous Reading Date 09-APR-2026

      Energy & Other Charges (Rs.)
      Energy Charges 697.50
      Fixed Charges 20.00
      Customer Charges 50.00
      Electricity Duty 8.46
      Total Amount 835.00
      Govt. Subsidy 184.50
      Net Bill Amount 626.58
    `;

    const result = parseOcrWithHeuristics(ocrText);

    expect(result.consumerName).toBe("SANAPALANARASINGA RAO");
    expect(result.serviceNumber).toBe("131407G060000068");
    expect(result.customerID).toBe("26069762");
    expect(result.previousReading).toBe(5961);
    expect(result.currentReading).toBe(6102);
    expect(result.unitsConsumed).toBe(141);
    expect(result.totalAmount).toBe(835);
    expect(result.governmentSubsidy).toBe(185);
    expect(result.netBill).toBe(627);
    expect(result.fixedCharge).toBe(70); // 20 + 50 = 70
    expect(result.tax).toBe(8);
  });

  it("should accurately parse Bill 5: V. JAGANNADHA RAO", () => {
    const ocrText = `
      V. JAGANNADHA RAO,
      Service Number 131102A202017225
      Bill Number 238423322495
      Amount Due (Rs) 603.41
      Disconnection Date 09-Jun-2026
      Unique Service Number 23322495
      Bill Date 11-May-2026
      Billed Units 123
      Due Date 25-May-2026

      Meter Readings
      R.M.D. 1.33
      Present Reading (kWh)  1303
      Previous Reading (kWh) 1180
      Present Reading (kVAh) 0
      Previous Reading (kVAh) 0
      Multiplying Factor 1
      Billed Units 123
      Meter Present Status 1 (LIVE)
      Meter Previous Status 1 (LIVE)
      Previous Reading Date 10-APR-2026

      Energy & Other Charges (Rs.)
      Energy Charges 591.84
      Fixed Charges 40.00
      Customer Charges 45.00
      Electricity Duty 7.38
      Total Amount 825.00
      Govt. Subsidy 183.84
      Net Bill Amount 603.41
    `;

    const result = parseOcrWithHeuristics(ocrText);

    expect(result.consumerName).toBe("V. JAGANNADHA RAO");
    expect(result.serviceNumber).toBe("131102A202017225");
    expect(result.customerID).toBe("23322495");
    expect(result.previousReading).toBe(1180);
    expect(result.currentReading).toBe(1303);
    expect(result.unitsConsumed).toBe(123);
    expect(result.totalAmount).toBe(825);
    expect(result.governmentSubsidy).toBe(184);
    expect(result.netBill).toBe(603);
    expect(result.fixedCharge).toBe(85); // 40 + 45 = 85
    expect(result.tax).toBe(7);
  });
});
