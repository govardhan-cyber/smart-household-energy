import { calculateBill } from "./tariffCalculator";

export interface SolarSimulationInput {
  monthlyBill: number;
  roofArea: number;
  selectedState: string;
  selectedCity: string;
  solarTech: "mono-perc" | "topcon";
  roofTilt: "flat" | "inclined";
  roofOrientation: "south" | "east" | "west";
  shadedPanelsCount: number;
  isHybrid: boolean;
  batteryKwh: number;
  batteryType: "lithium" | "lead-acid";
  netMeteringPolicy: "net-metering" | "net-billing";
  buybackRate: number;
  todShiftPercent: number;
  tariffIncrease: number;
  panelDegradation: number;
  maintenanceRate: number;
}

export interface YearSimulationResult {
  year: string;
  Balance: number;
  savings: number;
}

export interface SolarSavingsItem {
  name: string;
  "Original Bill": number;
  "With Solar Bill": number;
  Savings: number;
}

export interface SolarSimulationOutput {
  kwhNeeded: number;
  recommendedKw: number;
  installationCost: number;
  batteryCost: number;
  totalUpfrontInvestment: number;
  solarEfficiencyFactor: number;
  monthlyGeneration: number;
  monthlySavings: number;
  firstYearSavings: number;
  tenYearNetSavings: number;
  twentyFiveYearNetSavings: number;
  paybackPeriodVal: number;
  paybackData: YearSimulationResult[];
  panelsNeeded: number;
  oldBill: number;
  monthlySavingsData: SolarSavingsItem[];
  totalNoSolarCost25Years: number;
  totalSolarCost25Years: number;
}

// Map state selector codes to tariffService keys
export const getTariffKey = (stateCode: string): string => {
  const code = stateCode.toLowerCase();
  if (code === "ts") return "telangana";
  if (code === "ka") return "karnataka";
  return code; 
};

// Sub-subsidy cost estimator
export const getEstimatedCost = (kw: number, city: string): number => {
  const prices: Record<string, number[]> = {
    lucknow: [85000, 97000, 152000, 207000, 452000],
    ahmedabad: [110000, 122000, 167000, 222000, 477000],
    pune: [115000, 132000, 177000, 232000, 487000],
    bangalore: [145000, 162000, 207000, 292000, 552000]
  };
  const activeCityPrices = prices[city] || prices["pune"]!;
  
  if (kw <= 2) {
    return Math.round(activeCityPrices[0] * (kw / 2));
  }
  if (kw <= 3) {
    return Math.round(activeCityPrices[0] + (activeCityPrices[1] - activeCityPrices[0]) * (kw - 2));
  }
  if (kw <= 4) {
    return Math.round(activeCityPrices[1] + (activeCityPrices[2] - activeCityPrices[1]) * (kw - 3));
  }
  if (kw <= 5) {
    return Math.round(activeCityPrices[2] + (activeCityPrices[3] - activeCityPrices[2]) * (kw - 4));
  }
  if (kw <= 10) {
    return Math.round(activeCityPrices[3] + ((activeCityPrices[4] - activeCityPrices[3]) / 5) * (kw - 5));
  }
  return Math.round((activeCityPrices[4] / 10) * kw);
};

// Unit estimator from bill amount (₹)
export const estimateUnitsFromBill = (bill: number, stateKey: string): number => {
  if (bill <= 0) return 0;

  let low = 0;
  let high = 5000;
  let bestUnits = 0;
  let minDiff = Infinity;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const calc = calculateBill(mid, stateKey);
    const diff = Math.abs(calc.netEnergyCharge - bill);

    if (diff < minDiff) {
      minDiff = diff;
      bestUnits = mid;
    }

    if (calc.netEnergyCharge < bill) {
      low = mid + 1;
    } else if (calc.netEnergyCharge > bill) {
      high = mid - 1;
    } else {
      return mid;
    }
  }

  // Neighbor scan to guarantee global minimum around binary search convergence
  for (let u = Math.max(0, bestUnits - 3); u <= Math.min(5000, bestUnits + 3); u++) {
    const calc = calculateBill(u, stateKey);
    const diff = Math.abs(calc.netEnergyCharge - bill);
    if (diff < minDiff) {
      minDiff = diff;
      bestUnits = u;
    }
  }

  return bestUnits;
};

// Master ROI projection calculator
export const calculateSolarROI = (input: SolarSimulationInput): SolarSimulationOutput => {
  const {
    monthlyBill,
    roofArea,
    selectedState,
    selectedCity,
    solarTech,
    roofTilt,
    roofOrientation,
    shadedPanelsCount,
    isHybrid,
    batteryKwh,
    batteryType,
    netMeteringPolicy,
    buybackRate,
    todShiftPercent,
    tariffIncrease,
    panelDegradation,
    maintenanceRate
  } = input;

  const tariffKey = getTariffKey(selectedState);
  const kwhNeeded = estimateUnitsFromBill(monthlyBill, tariffKey);

  const kwNeededByUsage = kwhNeeded / 120;
  const maxKwBySpace = roofArea / 100;

  // Recommended system size in kW, capped by space, rounded to nearest 0.5 kW
  const recommendedKw = Math.max(
    1,
    Math.round(Math.min(kwNeededByUsage, maxKwBySpace) * 2) / 2
  );

  const installationCost = getEstimatedCost(recommendedKw, selectedCity);

  const orientationMultiplier = roofOrientation === "south" ? 1.0 : 0.85;
  const tiltMultiplier = roofTilt === "flat" ? 0.90 : 1.0;
  
  const panelWattage = solarTech === "topcon" ? 580 : 500;
  const panelsNeeded = Math.ceil((recommendedKw * 1000) / panelWattage);

  const shadingFactor = panelsNeeded > 0 
    ? 1 - (Math.min(panelsNeeded, shadedPanelsCount) / panelsNeeded) * 0.60
    : 1.0;

  const solarEfficiencyFactor = orientationMultiplier * tiltMultiplier * shadingFactor;
  const monthlyGeneration = recommendedKw * 120 * solarEfficiencyFactor;

  let batteryCost = 0;
  const batteryCostPerKwh = batteryType === "lead-acid" ? 7000 : 15000;
  if (isHybrid && batteryKwh > 0) {
    batteryCost = batteryKwh * batteryCostPerKwh;
  }
  const totalUpfrontInvestment = installationCost + batteryCost;

  // Time-of-Day ratios for load shifting
  const shiftedPeakPercent = 20 * (1 - todShiftPercent / 100);
  const shiftedOffPeakPercent = 20 + (20 * (todShiftPercent / 100));
  const todRatio = {
    peakPercent: shiftedPeakPercent,
    normalPercent: 60,
    offPeakPercent: shiftedOffPeakPercent
  };

  const oldBillCalc = calculateBill(
    kwhNeeded, 
    tariffKey, 
    7.5, 
    todShiftPercent > 0 ? todRatio : undefined
  );
  const oldBill = oldBillCalc.netEnergyCharge;

  let newBill: number;
  if (netMeteringPolicy === "net-metering") {
    const newUnits = Math.max(0, kwhNeeded - monthlyGeneration);
    const newBillCalc = calculateBill(
      newUnits, 
      tariffKey, 
      7.5, 
      todShiftPercent > 0 ? todRatio : undefined
    );
    newBill = newBillCalc.netEnergyCharge;
  } else {
    // Net Billing (Buyback)
    if (monthlyGeneration > kwhNeeded) {
      const excess = monthlyGeneration - kwhNeeded;
      const buybackCredit = excess * buybackRate;
      const fixedChargesAndTax = calculateBill(
        0, 
        tariffKey, 
        7.5, 
        todShiftPercent > 0 ? todRatio : undefined
      ).netEnergyCharge;
      newBill = Math.max(0, fixedChargesAndTax - buybackCredit);
    } else {
      const newUnits = kwhNeeded - monthlyGeneration;
      const newBillCalc = calculateBill(
        newUnits, 
        tariffKey, 
        7.5, 
        todShiftPercent > 0 ? todRatio : undefined
      );
      newBill = newBillCalc.netEnergyCharge;
    }
  }

  const monthlySavings = Math.max(0, Math.round(oldBill - newBill));

  // Multi-year financial timeline calculation
  const seasonalMultipliers = [0.75, 0.7, 0.85, 1.05, 1.15, 1.1, 0.95, 0.9, 0.85, 0.8, 0.75, 0.75];
  const solarMultipliers = [0.95, 1.05, 1.15, 1.2, 1.15, 0.9, 0.7, 0.75, 0.9, 1.0, 0.95, 0.9];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonthIdx = new Date().getMonth();

  // Generate 12-Month Solar Savings simulation
  const monthlySavingsData = months.map((m, idx) => {
    const currentMultiplier = seasonalMultipliers[currentMonthIdx] || 1.0;
    const baseUnits = kwhNeeded;
    const monthUnits = Math.round(baseUnits * (seasonalMultipliers[idx] / currentMultiplier));
    
    const calcResult = calculateBill(
      monthUnits, 
      tariffKey, 
      7.5, 
      todShiftPercent > 0 ? todRatio : undefined
    );
    const oldB = calcResult.netEnergyCharge;
    
    const baseSolarGen = recommendedKw * 120;
    const monthSolarGen = Math.round(baseSolarGen * solarMultipliers[idx] * solarEfficiencyFactor);
    
    let newB: number;
    if (netMeteringPolicy === "net-metering") {
      const monthNetUnits = Math.max(0, monthUnits - monthSolarGen);
      const newCalcResult = calculateBill(
        monthNetUnits, 
        tariffKey, 
        7.5, 
        todShiftPercent > 0 ? todRatio : undefined
      );
      newB = newCalcResult.netEnergyCharge;
    } else {
      // Net Billing
      if (monthSolarGen > monthUnits) {
        const excess = monthSolarGen - monthUnits;
        const buybackCredit = excess * buybackRate;
        const fixedChargesAndTax = calculateBill(
          0, 
          tariffKey, 
          7.5, 
          todShiftPercent > 0 ? todRatio : undefined
        ).netEnergyCharge;
        newB = Math.max(0, fixedChargesAndTax - buybackCredit);
      } else {
        const monthNetUnits = monthUnits - monthSolarGen;
        const newCalcResult = calculateBill(
          monthNetUnits, 
          tariffKey, 
          7.5, 
          todShiftPercent > 0 ? todRatio : undefined
        );
        newB = newCalcResult.netEnergyCharge;
      }
    }
    
    const savings = Math.max(0, oldB - newB);
    
    return {
      name: m,
      "Original Bill": Math.round(oldB),
      "With Solar Bill": Math.round(newB),
      Savings: Math.round(savings)
    };
  });

  const firstYearSavings = monthlySavingsData.reduce((sum, d) => sum + d.Savings, 0);

  // Payback Simulation & 25-Year Long Term Modeling
  const paybackData: YearSimulationResult[] = [];
  let cumulativeSavings = 0;
  let paybackPeriodVal = 0;
  let foundPayback = false;

  // Year 0 entry
  paybackData.push({
    year: "Yr 0",
    Balance: -totalUpfrontInvestment,
    savings: 0
  });

  let tenYearNetSavings = 0;
  let twentyFiveYearNetSavings = 0;
  let totalNoSolarCost25Years = 0;
  let totalSolarCost25Years = totalUpfrontInvestment;

  for (let y = 1; y <= 25; y++) {
    let yearlyBillNoSolar = 0;
    let yearlyBillWithSolar = 0;

    months.forEach((_, idx) => {
      const currentMultiplier = seasonalMultipliers[currentMonthIdx] || 1.0;
      const baseUnits = kwhNeeded;
      const monthUnits = Math.round(baseUnits * (seasonalMultipliers[idx] / currentMultiplier));
      
      const oldBillBase = calculateBill(
        monthUnits, 
        tariffKey, 
        7.5, 
        todShiftPercent > 0 ? todRatio : undefined
      ).netEnergyCharge;
      const oldBillInflated = oldBillBase * Math.pow(1 + tariffIncrease / 100, y - 1);
      yearlyBillNoSolar += oldBillInflated;

      const baseSolarGen = recommendedKw * 120;
      const monthSolarGen = Math.round(baseSolarGen * solarMultipliers[idx] * solarEfficiencyFactor);
      const degradedGen = monthSolarGen * Math.pow(1 - panelDegradation / 100, y - 1);
      
      let newBillBase: number;
      if (netMeteringPolicy === "net-metering") {
        const netUnits = Math.max(0, monthUnits - degradedGen);
        newBillBase = calculateBill(
          netUnits, 
          tariffKey, 
          7.5, 
          todShiftPercent > 0 ? todRatio : undefined
        ).netEnergyCharge;
      } else {
        // Net Billing
        if (degradedGen > monthUnits) {
          const excess = degradedGen - monthUnits;
          const buybackCredit = excess * buybackRate;
          const fixedChargesAndTax = calculateBill(
            0, 
            tariffKey, 
            7.5, 
            todShiftPercent > 0 ? todRatio : undefined
          ).netEnergyCharge;
          newBillBase = Math.max(0, fixedChargesAndTax - buybackCredit);
        } else {
          const netUnits = monthUnits - degradedGen;
          newBillBase = calculateBill(
            netUnits, 
            tariffKey, 
            7.5, 
            todShiftPercent > 0 ? todRatio : undefined
          ).netEnergyCharge;
        }
      }

      const newBillInflated = newBillBase * Math.pow(1 + tariffIncrease / 100, y - 1);
      yearlyBillWithSolar += newBillInflated;
    });

    const maintenanceCost = (maintenanceRate / 100) * installationCost * Math.pow(1.02, y - 1);
    
    let replacementCostThisYear = 0;
    if (isHybrid && batteryKwh > 0 && y > 1) {
      const replacementInterval = batteryType === "lead-acid" ? 4 : 10;
      if ((y - 1) % replacementInterval === 0) {
        const baseBatteryCost = batteryKwh * (batteryType === "lead-acid" ? 7000 : 15000);
        replacementCostThisYear = baseBatteryCost * Math.pow(1.02, y - 1);
      }
    }

    const netSavingsThisYear = Math.max(
      -replacementCostThisYear,
      yearlyBillNoSolar - yearlyBillWithSolar - maintenanceCost - replacementCostThisYear
    );
    cumulativeSavings += netSavingsThisYear;

    const currentBalance = -totalUpfrontInvestment + cumulativeSavings;

    totalNoSolarCost25Years += yearlyBillNoSolar;
    totalSolarCost25Years += yearlyBillWithSolar + maintenanceCost + replacementCostThisYear;

    if (y <= 15) {
      paybackData.push({
        year: `Yr ${y}`,
        Balance: Math.round(currentBalance),
        savings: Math.round(cumulativeSavings)
      });
    }

    if (y === 10) {
      tenYearNetSavings = currentBalance;
    }
    if (y === 25) {
      twentyFiveYearNetSavings = currentBalance;
    }

    if (currentBalance >= 0 && !foundPayback) {
      const prevBalance = -totalUpfrontInvestment + (cumulativeSavings - netSavingsThisYear);
      const diff = currentBalance - prevBalance;
      const fraction = diff > 0 ? Math.abs(prevBalance) / diff : 0;
      paybackPeriodVal = (y - 1) + fraction;
      foundPayback = true;
    }
  }

  if (!foundPayback) {
    paybackPeriodVal = 26; 
  }

  return {
    kwhNeeded,
    recommendedKw,
    installationCost,
    batteryCost,
    totalUpfrontInvestment,
    solarEfficiencyFactor,
    monthlyGeneration,
    monthlySavings,
    firstYearSavings,
    tenYearNetSavings,
    twentyFiveYearNetSavings,
    paybackPeriodVal,
    paybackData,
    panelsNeeded,
    oldBill,
    monthlySavingsData,
    totalNoSolarCost25Years,
    totalSolarCost25Years
  };
};
