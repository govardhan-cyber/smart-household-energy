import React, { useState } from "react";
import { Sun, ShieldCheck, HelpCircle, IndianRupee, Settings, ChevronDown, CheckCircle, AlertTriangle } from "lucide-react";
import { calculateBill } from "../../utils/tariffCalculator";
import { Charts } from "./Charts";
import { useAuth } from "../../context/AuthContext";

interface SolarCalculatorProps {
  tariffState: string;
  activeTheme: "light" | "dark";
}

// Count-up/down animation component for premium feel
const AnimatedNumber: React.FC<{
  value: number;
  duration?: number;
  formatter?: (v: number) => string;
}> = ({ value, duration = 400, formatter = (v) => Math.round(v).toString() }) => {
  const [displayValue, setDisplayValue] = useState(value);

  React.useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = displayValue;
    const endValue = value;
    
    if (startValue === endValue) return;

    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easedProgress = progress * (2 - progress); // Ease out quad
      const current = startValue + easedProgress * (endValue - startValue);
      setDisplayValue(current);
      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };
    
    animationFrameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [value, duration]);

  return <span>{formatter(displayValue)}</span>;
};

export const SolarCalculator: React.FC<SolarCalculatorProps> = ({
  tariffState,
  activeTheme
}) => {
  const { user } = useAuth();
  // Input States
  const [monthlyBill, setMonthlyBill] = useState<number>(3000); // Monthly Bill in ₹
  const [roofArea, setRoofArea] = useState<number>(300); // Roof Area in sq ft
  const [selectedState, setSelectedState] = useState<string>(tariffState || "ap");
  const [solarTech, setSolarTech] = useState<"mono-perc" | "topcon">("topcon");
  const [selectedCity, setSelectedCity] = useState<string>("pune");
  const [isCalculating, setIsCalculating] = useState(false);

  const [tariffIncrease, setTariffIncrease] = useState<number>(4); // annual tariff inflation in %
  const [panelDegradation, setPanelDegradation] = useState<number>(0.8); // annual module degradation in %
  const [maintenanceRate, setMaintenanceRate] = useState<number>(1.0); // annual maintenance cost in % of installation cost
  const [expandAssumptions, setExpandAssumptions] = useState<boolean>(false);

  React.useEffect(() => {
    setIsCalculating(true);
    const timer = setTimeout(() => setIsCalculating(false), 350);
    return () => clearTimeout(timer);
  }, [solarTech]);

  // Map state selector codes to tariffService keys
  const getTariffKey = (stateCode: string) => {
    const code = stateCode.toLowerCase();
    if (code === "ts") return "telangana";
    if (code === "ka") return "karnataka";
    return code; // "ap" or "custom"
  };

  const getFullStateName = (stateCode: string) => {
    switch (stateCode.toLowerCase()) {
      case "ap": return "Andhra Pradesh";
      case "ts": return "Telangana";
      case "ka": return "Karnataka";
      case "telangana": return "Telangana";
      case "karnataka": return "Karnataka";
      case "custom": return "Custom Profile";
      default: return "Andhra Pradesh";
    }
  };

  const tariffKey = getTariffKey(selectedState);

  // Helper to estimate units (kWh) from bill amount (₹)
  const estimateUnitsFromBill = (bill: number, stateKey: string) => {
    let bestUnits = 0;
    let minDiff = Infinity;
    for (let u = 0; u <= 4000; u++) {
      const calc = calculateBill(u, stateKey);
      const diff = Math.abs(calc.netEnergyCharge - bill);
      if (diff < minDiff) {
        minDiff = diff;
        bestUnits = u;
      }
      if (calc.netEnergyCharge > bill + 100) break;
    }
    return bestUnits;
  };

  // 1. Current usage estimation
  const kwhNeeded = estimateUnitsFromBill(monthlyBill, tariffKey);

  // 2. Solar sizing logic:
  // - 1 kW of solar needs ~100 sq ft of shadow-free area
  // - 1 kW produces ~120 kWh per month
  const kwNeededByUsage = kwhNeeded / 120;
  const maxKwBySpace = roofArea / 100;

  // Recommended system size in kW, capped by roof space, rounded to nearest 0.5 kW (min 1 kW)
  const recommendedKw = Math.max(
    1,
    Math.round(Math.min(kwNeededByUsage, maxKwBySpace) * 2) / 2
  );

  // Dynamic cost lookup based on 2026 pricing table (after PM Surya Ghar subsidy)
  const getEstimatedCost = (kw: number, city: string) => {
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

  const installationCost = getEstimatedCost(recommendedKw, selectedCity);
  const monthlyGeneration = recommendedKw * 120; // kWh

  // Technology details
  const panelWattage = solarTech === "topcon" ? 580 : 500;
  const panelsNeeded = Math.ceil((recommendedKw * 1000) / panelWattage);
  const panelEfficiency = solarTech === "topcon" ? 26 : 22.5;
  const panelWeight = solarTech === "topcon" ? 32 : 27;
  const panelSizeLabel = solarTech === "topcon" ? "~2.1 m × 1.1 m" : "~2.0 m × 1.0 m";
  // 3. Net metering simulation using real slab tariffs
  const oldBillCalc = calculateBill(kwhNeeded, tariffKey);
  const oldBill = oldBillCalc.netEnergyCharge;

  const newUnits = Math.max(0, kwhNeeded - monthlyGeneration);
  const newBillCalc = calculateBill(newUnits, tariffKey);
  const newBill = newBillCalc.netEnergyCharge;

  const monthlySavings = Math.max(0, Math.round(oldBill - newBill));

  // Multi-year financial timeline calculation
  const seasonalMultipliers = [0.75, 0.7, 0.85, 1.05, 1.15, 1.1, 0.95, 0.9, 0.85, 0.8, 0.75, 0.75];
  const solarMultipliers = [0.95, 1.05, 1.15, 1.2, 1.15, 0.9, 0.7, 0.75, 0.9, 1.0, 0.95, 0.9];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonthIdx = new Date().getMonth();

  // Generate 12-Month Solar Savings simulation (seasonal model for the first year)
  const monthlySavingsData = months.map((m, idx) => {
    const currentMultiplier = seasonalMultipliers[currentMonthIdx] || 1.0;
    const baseUnits = kwhNeeded;
    const monthUnits = Math.round(baseUnits * (seasonalMultipliers[idx] / currentMultiplier));
    
    const calcResult = calculateBill(monthUnits, tariffKey);
    const oldB = calcResult.netEnergyCharge;
    
    const baseSolarGen = recommendedKw * 120;
    const monthSolarGen = Math.round(baseSolarGen * solarMultipliers[idx]);
    const netUnits = Math.max(0, monthUnits - monthSolarGen);
    
    const newCalcResult = calculateBill(netUnits, tariffKey);
    const newB = newCalcResult.netEnergyCharge;
    
    const savings = Math.max(0, oldB - newB);
    
    return {
      name: m,
      "Original Bill": Math.round(oldB),
      "With Solar Bill": Math.round(newB),
      Savings: Math.round(savings)
    };
  });

  const firstYearSavings = monthlySavingsData.reduce((sum, d) => sum + d.Savings, 0);

  // 15-Year Payback Simulation & 25-Year Long Term Modeling
  const paybackData: any[] = [];
  let cumulativeSavings = 0;
  let paybackPeriodVal = 0;
  let foundPayback = false;

  // Year 0 entry
  paybackData.push({
    year: "Yr 0",
    Balance: -installationCost,
    savings: 0,
    cost: -installationCost
  });

  let tenYearNetSavings = 0;
  let twentyFiveYearNetSavings = 0;
  let totalNoSolarCost25Years = 0;
  let totalSolarCost25Years = installationCost; // starts with installation cost

  for (let y = 1; y <= 25; y++) {
    let yearlyBillNoSolar = 0;
    let yearlyBillWithSolar = 0;

    months.forEach((_, idx) => {
      const currentMultiplier = seasonalMultipliers[currentMonthIdx] || 1.0;
      const baseUnits = kwhNeeded;
      const monthUnits = Math.round(baseUnits * (seasonalMultipliers[idx] / currentMultiplier));
      
      // Inflated No-Solar Bill
      const oldBillBase = calculateBill(monthUnits, tariffKey).netEnergyCharge;
      const oldBillInflated = oldBillBase * Math.pow(1 + tariffIncrease / 100, y - 1);
      yearlyBillNoSolar += oldBillInflated;

      // Degraded Solar Gen
      const baseSolarGen = recommendedKw * 120;
      const monthSolarGen = Math.round(baseSolarGen * solarMultipliers[idx]);
      const degradedGen = monthSolarGen * Math.pow(1 - panelDegradation / 100, y - 1);
      const netUnits = Math.max(0, monthUnits - degradedGen);

      // Inflated Solar Bill
      const newBillBase = calculateBill(netUnits, tariffKey).netEnergyCharge;
      const newBillInflated = newBillBase * Math.pow(1 + tariffIncrease / 100, y - 1);
      yearlyBillWithSolar += newBillInflated;
    });

    const maintenanceCost = (maintenanceRate / 100) * installationCost * Math.pow(1.02, y - 1);
    
    // Net savings this year
    const netSavingsThisYear = Math.max(0, yearlyBillNoSolar - yearlyBillWithSolar - maintenanceCost);
    cumulativeSavings += netSavingsThisYear;

    const currentBalance = -installationCost + cumulativeSavings;

    // Accumulate total costs
    totalNoSolarCost25Years += yearlyBillNoSolar;
    totalSolarCost25Years += yearlyBillWithSolar + maintenanceCost;

    // Push first 15 years to timeline chart
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

    // Check payback break-even
    if (currentBalance >= 0 && !foundPayback) {
      const prevBalance = -installationCost + (cumulativeSavings - netSavingsThisYear);
      const diff = currentBalance - prevBalance;
      const fraction = diff > 0 ? Math.abs(prevBalance) / diff : 0;
      paybackPeriodVal = (y - 1) + fraction;
      foundPayback = true;
    }
  }

  if (!foundPayback) {
    paybackPeriodVal = 26; // representing 25+ years
  }

  React.useEffect(() => {
    if (user?.uid) {
      const cacheKey = `she_solar_cache_${user.uid}`;
      const solarCache = {
        recommendedKw,
        installationCost,
        monthlyGeneration,
        monthlySavings,
        paybackPeriodVal,
        panelsNeeded,
        tenYearNetSavings,
        twentyFiveYearNetSavings,
        selectedCity,
        solarTech,
        roofArea,
        monthlyBillInput: monthlyBill
      };
      localStorage.setItem(cacheKey, JSON.stringify(solarCache));
    }
  }, [user?.uid, recommendedKw, installationCost, monthlyGeneration, monthlySavings, paybackPeriodVal, panelsNeeded, tenYearNetSavings, twentyFiveYearNetSavings, selectedCity, solarTech, roofArea, monthlyBill]);

  // Percentages
  const billCoveragePercent = oldBill > 0 ? Math.min(100, Math.round((monthlySavings / oldBill) * 100)) : 0;
  const spaceUtilizedPercent = Math.min(100, Math.round(((recommendedKw * 100) / roofArea) * 100));

  // Worth It Conclusion mapping
  const getWorthItConclusion = (payback: number) => {
    if (payback <= 5) {
      return {
        badge: "Excellent Return",
        colorClass: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-primary-green dark:border-green-900/40",
        iconColor: "text-green-500",
        message: "Highly Worth It! The system pays for itself extremely fast, giving you nearly two decades of free electricity."
      };
    }
    if (payback <= 8) {
      return {
        badge: "Highly Recommended",
        colorClass: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-primary-green dark:border-green-900/40",
        iconColor: "text-green-500",
        message: "Worth It! A very strong financial return. Your upfront investment is recovered quickly, yielding major long-term savings."
      };
    }
    if (payback <= 12) {
      return {
        badge: "Moderate Return",
        colorClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/40",
        iconColor: "text-amber-500",
        message: "Recommended. A solid investment. It takes slightly longer to break even, but still saves substantial money over the panel lifetime."
      };
    }
    return {
      badge: "Long-Term Payback",
      colorClass: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800",
      iconColor: "text-slate-400",
      message: "Long payback period. It will take over 12 years to recover the system cost. Solar is still viable for environmental reasons or energy independence."
    };
  };

  const conclusion = getWorthItConclusion(paybackPeriodVal);

  return (
    <div className="space-y-8 text-left">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Inputs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            
            {/* Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-105 dark:border-slate-800">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
                <Sun className="w-6 h-6 animate-spin-slow" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Solar Savings Estimator (2026 Edition)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Configure your rooftop space, monthly bill, and solar cell technology.
                </p>
              </div>
            </div>

            {/* State & City Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Location State */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-404 dark:text-slate-550 uppercase tracking-wider block">
                  Installation State
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { code: "ap", label: "AP" },
                    { code: "ts", label: "TS" },
                    { code: "ka", label: "KA" }
                  ].map(st => (
                    <button
                      key={st.code}
                      onClick={() => setSelectedState(st.code)}
                      className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all ${
                        selectedState === st.code
                          ? "border-primary-blue bg-blue-50/20 text-primary-blue dark:border-primary-green dark:bg-green-950/20 dark:text-primary-green"
                          : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50 hover:border-slate-350 dark:hover:border-slate-700"
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cost Basis City (2026 subsidy lookup) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-405 dark:text-slate-550 uppercase tracking-wider block">
                  Subsidy Price Lookup City
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary-blue dark:focus:border-primary-green"
                >
                  <option value="pune">Pune (Maharashtra)</option>
                  <option value="bangalore">Bangalore (Karnataka)</option>
                  <option value="ahmedabad">Ahmedabad (Gujarat)</option>
                  <option value="lucknow">Lucknow (Uttar Pradesh)</option>
                </select>
              </div>
            </div>

            {/* Panel Technology Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-405 dark:text-slate-550 uppercase tracking-wider block">
                Solar Cell Technology
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSolarTech("topcon")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    solarTech === "topcon"
                      ? "border-primary-green bg-green-50/10 dark:bg-green-950/10"
                      : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50"
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900 dark:text-white">TOPCon (Premium)</div>
                  <div className="text-[10px] text-slate-400 mt-1">Efficiency: 26% | Slower Degradation | High Temp Performance</div>
                </button>
                <button
                  onClick={() => setSolarTech("mono-perc")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    solarTech === "mono-perc"
                      ? "border-primary-blue bg-blue-50/10 dark:bg-blue-950/10"
                      : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50"
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Mono-PERC (Standard)</div>
                  <div className="text-[10px] text-slate-400 mt-1">Efficiency: 22.5% | P-type Silicon | Cost-Effective choice</div>
                </button>
              </div>
            </div>

            {/* Input 1: Monthly Electricity Bill (₹) */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-sm font-bold text-slate-700 dark:text-slate-350">
                <span className="flex items-center gap-1">
                  Average Monthly Bill
                  <span className="text-[10px] text-slate-400 font-normal hover:text-slate-500 cursor-pointer" title="Your typical monthly electricity bill amount. Used to estimate your energy needs.">
                    <HelpCircle className="w-3.5 h-3.5 inline" />
                  </span>
                </span>
                <span className="text-primary-blue dark:text-primary-green text-base font-extrabold flex items-center">
                  <IndianRupee className="w-4 h-4 mr-0.5" />
                  <AnimatedNumber value={monthlyBill} formatter={(v) => Math.round(v).toLocaleString('en-IN')} />
                </span>
              </div>
              <input
                type="range"
                min="1000"
                max="15000"
                step="500"
                value={monthlyBill}
                onChange={(e) => setMonthlyBill(parseInt(e.target.value))}
                className="premium-slider w-full cursor-pointer"
                style={{
                  background: activeTheme === "dark"
                    ? `linear-gradient(to right, #10b981 0%, #10b981 ${((monthlyBill - 1000) / 14000) * 100}%, #1e293b ${((monthlyBill - 1000) / 14000) * 100}%, #1e293b 100%)`
                    : `linear-gradient(to right, #2563eb 0%, #2563eb ${((monthlyBill - 1000) / 14000) * 100}%, #e2e8f0 ${((monthlyBill - 1000) / 14000) * 100}%, #e2e8f0 100%)`
                }}
              />
              <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-550">
                <span>₹1,000</span>
                <span>₹5,000</span>
                <span>₹10,000</span>
                <span>₹15,000</span>
              </div>
            </div>

            {/* Input 2: Roof Space Area (sq ft) */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-sm font-bold text-slate-700 dark:text-slate-350">
                <span className="flex items-center gap-1">
                  Available Roof Space Area
                  <span className="text-[10px] text-slate-400 font-normal hover:text-slate-555 cursor-pointer" title="Usable shadow-free flat rooftop area. 1 kW of solar capacity needs ~100 square feet.">
                    <HelpCircle className="w-3.5 h-3.5 inline" />
                  </span>
                </span>
                <span className="text-amber-500 text-base font-extrabold">
                  <AnimatedNumber value={roofArea} /> sq ft
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="1500"
                step="50"
                value={roofArea}
                onChange={(e) => setRoofArea(parseInt(e.target.value))}
                className="premium-slider w-full cursor-pointer"
                style={{
                  background: activeTheme === "dark"
                    ? `linear-gradient(to right, #f59e0b 0%, #f59e0b ${((roofArea - 50) / 1450) * 100}%, #1e293b ${((roofArea - 50) / 1450) * 100}%, #1e293b 100%)`
                    : `linear-gradient(to right, #f59e0b 0%, #f59e0b ${((roofArea - 50) / 1450) * 100}%, #e2e8f0 ${((roofArea - 50) / 1450) * 100}%, #e2e8f0 100%)`
                }}
              />
              <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-550">
                <span>50 sq ft</span>
                <span>500 sq ft</span>
                <span>1,000 sq ft</span>
                <span>1,500 sq ft</span>
              </div>
            </div>

            {/* Sizing Logic Explanation */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-500 dark:text-slate-400 leading-relaxed space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-300 block mb-1">How Sizing Works:</span>
              <p>
                To offset a bill of <span className="font-semibold text-slate-700 dark:text-slate-300">₹<AnimatedNumber value={monthlyBill} formatter={(v) => Math.round(v).toLocaleString('en-IN')} /></span> in {getFullStateName(selectedState)}, your house requires a <span className="font-semibold text-slate-700 dark:text-slate-300"><AnimatedNumber value={kwNeededByUsage} formatter={(v) => v.toFixed(1)} /> kW</span> system.
              </p>
              <p>
                Capped by your roof area limit of <span className="font-semibold text-slate-700 dark:text-slate-300"><AnimatedNumber value={maxKwBySpace} formatter={(v) => v.toFixed(1)} /> kW</span> (100 sq ft per kW), the recommended sizing is <span className="font-semibold text-slate-700 dark:text-slate-300"><AnimatedNumber value={recommendedKw} formatter={(v) => v.toFixed(1)} /> kW</span>.
              </p>
            </div>

            {/* Detailed Net Metering breakdown */}
            <div className="p-4 bg-blue-50/10 dark:bg-slate-950/20 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-2">
              <span className="font-bold text-slate-800 dark:text-slate-300 block">Net Metering Billing Breakdown:</span>
              <div className="grid grid-cols-2 gap-y-1 text-left">
                <div>Estimated Monthly Consumption:</div>
                <div className="font-semibold text-slate-850 dark:text-slate-200 text-right"><AnimatedNumber value={kwhNeeded} /> kWh (units)</div>
                <div>Estimated Monthly Solar Generation:</div>
                <div className="font-semibold text-slate-850 dark:text-slate-200 text-right"><AnimatedNumber value={monthlyGeneration} /> kWh / month</div>
                <div>New Net Grid Consumption:</div>
                <div className="font-semibold text-slate-850 dark:text-slate-200 text-right"><AnimatedNumber value={newUnits} /> kWh / month</div>
                <div>Marginal Slab Savings percentage:</div>
                <div className="font-semibold text-primary-green text-right"><AnimatedNumber value={billCoveragePercent} />%</div>
                <div className="border-t border-slate-100 dark:border-slate-800 pt-1.5 mt-0.5">Monthly Bill with Solar Panels:</div>
                <div className="font-semibold text-primary-blue dark:text-primary-green text-right border-t border-slate-100 dark:border-slate-800 pt-1.5 mt-0.5">₹<AnimatedNumber value={newBill} formatter={(v) => Math.round(v).toLocaleString('en-IN')} /></div>
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-550 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                *Calculated using actual DISCOM slab rates in the {getFullStateName(selectedState)} database.
              </div>
            </div>

            {/* Collapsible Assumptions Accordion */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/20">
              <button
                type="button"
                onClick={() => setExpandAssumptions(!expandAssumptions)}
                className="w-full flex justify-between items-center p-4 text-xs font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-slate-400" />
                  Financial Modeling Assumptions
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandAssumptions ? "rotate-180" : ""}`} />
              </button>

              {expandAssumptions && (
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-4 text-xs bg-white dark:bg-slate-900/50">
                  {/* Tariff increase slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between font-semibold text-slate-650 dark:text-slate-400">
                      <span>Annual Tariff Rate Increase</span>
                      <span className="text-primary-blue dark:text-primary-green font-bold">{tariffIncrease}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="15"
                      step="0.5"
                      value={tariffIncrease}
                      onChange={(e) => setTariffIncrease(parseFloat(e.target.value))}
                      className="premium-slider w-full cursor-pointer"
                      style={{
                        background: activeTheme === "dark"
                          ? `linear-gradient(to right, #10b981 0%, #10b981 ${(tariffIncrease / 15) * 100}%, #1e293b ${(tariffIncrease / 15) * 100}%, #1e293b 100%)`
                          : `linear-gradient(to right, #2563eb 0%, #2563eb ${(tariffIncrease / 15) * 100}%, #e2e8f0 ${(tariffIncrease / 15) * 100}%, #e2e8f0 100%)`
                      }}
                    />
                    <span className="text-[10px] text-slate-400 block">Typical range: 3% to 6% per year as utility costs rise.</span>
                  </div>

                  {/* Degradation slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between font-semibold text-slate-650 dark:text-slate-400">
                      <span>Annual Module Degradation</span>
                      <span className="text-amber-500 font-bold">{panelDegradation}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="2.0"
                      step="0.1"
                      value={panelDegradation}
                      onChange={(e) => setPanelDegradation(parseFloat(e.target.value))}
                      className="premium-slider w-full cursor-pointer"
                      style={{
                        background: activeTheme === "dark"
                          ? `linear-gradient(to right, #f59e0b 0%, #f59e0b ${((panelDegradation - 0.1) / 1.9) * 100}%, #1e293b ${((panelDegradation - 0.1) / 1.9) * 100}%, #1e293b 100%)`
                          : `linear-gradient(to right, #f59e0b 0%, #f59e0b ${((panelDegradation - 0.1) / 1.9) * 100}%, #e2e8f0 ${((panelDegradation - 0.1) / 1.9) * 100}%, #e2e8f0 100%)`
                      }}
                    />
                    <span className="text-[10px] text-slate-400 block">Premium panels (TOPCon) degrade slower (~0.4% - 0.8%) than Mono-PERC (~0.8% - 1.2%).</span>
                  </div>

                  {/* Maintenance rate slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between font-semibold text-slate-650 dark:text-slate-400">
                      <span>Annual Maintenance Cost</span>
                      <span className="text-slate-700 dark:text-slate-350 font-bold">{maintenanceRate}% <span className="font-normal text-slate-400">of cost</span></span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="5.0"
                      step="0.25"
                      value={maintenanceRate}
                      onChange={(e) => setMaintenanceRate(parseFloat(e.target.value))}
                      className="premium-slider w-full cursor-pointer"
                      style={{
                        background: activeTheme === "dark"
                          ? `linear-gradient(to right, #10b981 0%, #10b981 ${(maintenanceRate / 5) * 100}%, #1e293b ${(maintenanceRate / 5) * 100}%, #1e293b 100%)`
                          : `linear-gradient(to right, #2563eb 0%, #2563eb ${(maintenanceRate / 5) * 100}%, #e2e8f0 ${(maintenanceRate / 5) * 100}%, #e2e8f0 100%)`
                      }}
                    />
                    <span className="text-[10px] text-slate-400 block">Inverter servicing, panel cleaning, and wiring maintenance.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: ROI Outputs */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 relative overflow-hidden">
            {/* Loading Overlay */}
            {isCalculating && (
              <div className="absolute inset-0 z-10 bg-white/70 dark:bg-slate-900/75 backdrop-blur-[1px] flex flex-col items-center justify-center space-y-3 transition-opacity">
                <div className="w-8 h-8 border-3 border-slate-200 border-t-primary-blue dark:border-t-primary-green rounded-full animate-spin"></div>
                <span className="text-xs font-bold text-slate-550 dark:text-slate-400">Recalculating solar metrics...</span>
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">ROI & Financial Outputs</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Estimates based on 2026 PM Surya Ghar policy standards.
              </p>
            </div>

            {/* Recommended System Card */}
            <div className="bg-gradient-to-br from-white to-green-50/20 dark:from-slate-900 dark:to-green-950/10 p-5 rounded-2xl border border-primary-green/30 dark:border-primary-green/20 shadow-sm text-left">
              <span className="text-[10px] font-bold text-slate-405 dark:text-slate-555 uppercase tracking-wider block">
                Recommended Solar System
              </span>
              <p className="text-3xl font-display font-extrabold text-primary-green mt-1 flex items-baseline gap-1">
                <AnimatedNumber value={recommendedKw} formatter={(v) => v.toFixed(1)} /> <span className="text-base font-bold text-slate-400 dark:text-slate-550">kW Capacity</span>
              </p>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
                <div 
                  className="h-full bg-primary-green rounded-full"
                  style={{ width: `${spaceUtilizedPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] font-bold text-slate-400 dark:text-slate-550 mt-2">
                <span>Space Utilized: <AnimatedNumber value={spaceUtilizedPercent} />%</span>
                <span>Bill Coverage: <AnimatedNumber value={billCoveragePercent} />%</span>
              </div>
            </div>

            {/* Worth It / Not Worth It Conclusion Card */}
            <div className={`p-5 rounded-2xl border ${conclusion.colorClass} space-y-3 text-left`}>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Feasibility Review
                </span>
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-current">
                  {conclusion.badge}
                </span>
              </div>
              <div className="flex gap-3">
                <div className={`shrink-0 ${conclusion.iconColor} mt-0.5`}>
                  {paybackPeriodVal <= 12 ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {paybackPeriodVal <= 25 ? (
                      <>
                        Worth it index is high. You recover your initial ₹<strong>{(installationCost).toLocaleString('en-IN')}</strong> in <span className="font-bold text-primary-blue dark:text-blue-400">{paybackPeriodVal.toFixed(1)} years</span>.
                      </>
                    ) : (
                      <>
                        System payback exceeds 25 years under current parameters.
                      </>
                    )}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {conclusion.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Financial ROI Milestones Grid */}
            <div className="grid grid-cols-2 gap-3 text-left">
              {/* Card 1: System Cost */}
              <div className="bg-slate-50 dark:bg-slate-950/40 p-4 border border-slate-200 dark:border-slate-850 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">System Cost (Net)</span>
                <p className="text-sm font-extrabold text-slate-850 dark:text-white">
                  ₹<AnimatedNumber value={installationCost} formatter={(v) => Math.round(v).toLocaleString('en-IN')} />
                </p>
                <span className="text-[9px] text-slate-450 block">After PM Surya Ghar Subsidy</span>
              </div>

              {/* Card 2: Annual Savings */}
              <div className="bg-slate-50 dark:bg-slate-950/40 p-4 border border-slate-200 dark:border-slate-855 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase block">Annual Savings</span>
                <p className="text-sm font-extrabold text-primary-green">
                  ₹<AnimatedNumber value={firstYearSavings} formatter={(v) => Math.round(v).toLocaleString('en-IN')} />
                </p>
                <span className="text-[9px] text-slate-455 block">Year 1 savings estimate</span>
              </div>

              {/* Card 3: Payback Period */}
              <div className="bg-slate-50 dark:bg-slate-950/40 p-4 border border-slate-200 dark:border-slate-855 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase block">Payback Period</span>
                <p className="text-sm font-extrabold text-primary-blue dark:text-blue-400">
                  {paybackPeriodVal <= 25 ? (
                    <><AnimatedNumber value={paybackPeriodVal} formatter={(v) => v.toFixed(1)} /> Years</>
                  ) : (
                    "25+ Years"
                  )}
                </p>
                <span className="text-[9px] text-slate-455 block">Break-even timeline</span>
              </div>

              {/* Card 4: 10-Year Savings */}
              <div className="bg-slate-50 dark:bg-slate-950/40 p-4 border border-slate-200 dark:border-slate-855 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-slate-455 dark:text-slate-400 uppercase block">10-Year Net ROI</span>
                <p className={`text-sm font-extrabold ${tenYearNetSavings >= 0 ? "text-primary-green" : "text-amber-500"}`}>
                  ₹<AnimatedNumber value={tenYearNetSavings} formatter={(v) => Math.round(v).toLocaleString('en-IN')} />
                </p>
                <span className="text-[9px] text-slate-455 block">{tenYearNetSavings >= 0 ? "Net surplus profit" : "Amortized balance"}</span>
              </div>

              {/* Card 5 (Full Width): 25-Year Net ROI */}
              <div className="col-span-2 bg-gradient-to-br from-white to-green-50/10 dark:from-slate-900 dark:to-green-950/5 p-4 border border-primary-green/30 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-primary-green uppercase block">25-Year Cumulative Net Profit</span>
                  <span className="text-[9px] text-slate-455 block">Includes degradation & maintenance</span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-extrabold text-primary-green">
                    ₹<AnimatedNumber value={twentyFiveYearNetSavings} formatter={(v) => Math.round(v).toLocaleString('en-IN')} />
                  </p>
                  <span className="text-[9px] text-slate-400 font-medium">~{installationCost > 0 ? ((twentyFiveYearNetSavings + installationCost) / installationCost).toFixed(1) : 0}x return</span>
                </div>
              </div>
            </div>

            {/* No Solar vs Solar Installed Side-by-Side Comparison */}
            <div className="bg-slate-50 dark:bg-slate-950/45 p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 space-y-4 text-left">
              <h4 className="text-xs font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider">
                25-Year Lifetime Cost Comparison
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {/* No Solar */}
                <div className="space-y-1 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">No Solar (Grid Only)</span>
                  <p className="text-base font-extrabold text-slate-850 dark:text-white mt-1">
                    ₹<AnimatedNumber value={totalNoSolarCost25Years} formatter={(v) => Math.round(v).toLocaleString('en-IN')} />
                  </p>
                  <span className="text-[9px] text-slate-400 block">Bills inflated at {tariffIncrease}% p.a.</span>
                </div>
                {/* Solar Installed */}
                <div className="space-y-1 p-3.5 rounded-xl bg-green-50/10 dark:bg-green-950/5 border border-primary-green/20">
                  <span className="text-[10px] font-bold text-primary-green uppercase">Solar Installed</span>
                  <p className="text-base font-extrabold text-primary-green mt-1">
                    ₹<AnimatedNumber value={totalSolarCost25Years} formatter={(v) => Math.round(v).toLocaleString('en-IN')} />
                  </p>
                  <span className="text-[9px] text-slate-400 block">System cost + bills + {maintenanceRate}% maintenance.</span>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-550 dark:text-slate-400">Total Net Lifetime Savings:</span>
                <span className="font-extrabold text-primary-green text-sm">
                  ₹<AnimatedNumber value={twentyFiveYearNetSavings} formatter={(v) => Math.round(v).toLocaleString('en-IN')} />
                </span>
              </div>
            </div>

            {/* Panel details sub-section */}
            <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-left space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-300 block mb-1">Rooftop Module Details:</span>
              <div className="grid grid-cols-2 gap-y-1 text-slate-500 dark:text-slate-400">
                <div>Modules Needed:</div>
                <div className="font-semibold text-slate-800 dark:text-slate-200 text-right"><AnimatedNumber value={panelsNeeded} /> panels ({panelWattage}W)</div>
                <div>Single Panel Dimensions:</div>
                <div className="font-semibold text-slate-800 dark:text-slate-200 text-right">{panelSizeLabel}</div>
                <div>Single Panel Weight:</div>
                <div className="font-semibold text-slate-800 dark:text-slate-200 text-right">~{panelWeight} kg</div>
                <div>Internal Efficiency:</div>
                <div className="font-semibold text-primary-green text-right">
                  <AnimatedNumber value={panelEfficiency} formatter={(v) => v.toFixed(1)} />%
                </div>
              </div>
            </div>


            {/* Security details note */}
            <div className="flex items-center gap-2 text-xs text-slate-405 border-t border-slate-100 dark:border-slate-800 pt-4">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span>Slab calculations match active {getFullStateName(selectedState)} net metering rules.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sizing and Tech Guide reference section */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Rooftop Solar Quick Sizing Reference (2026 Guidelines)</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            General reference parameters for planning residential rooftop systems in India using standard 540W solar modules.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-455 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Solar System Size</th>
                <th className="py-3 px-4">Number of Panels (540W)</th>
                <th className="py-3 px-4">Shadow-Free Space Needed</th>
                <th className="py-3 px-4">Cost in Pune (with Subsidy)*</th>
                <th className="py-3 px-4">25-Yr Expected Savings*</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-655 dark:text-slate-350">
              {[
                { size: "1 kW", panels: "~2 panels", space: "100 sq ft", cost: "~₹60,000", savings: "~₹5.3 Lakhs" },
                { size: "2 kW", panels: "~4 panels", space: "200 sq ft", cost: "~₹1.15 Lakh", savings: "~₹10.74 Lakhs" },
                { size: "3 kW", panels: "~6 panels", space: "300 sq ft", cost: "~₹1.32 Lakh", savings: "~₹16.11 Lakhs" },
                { size: "4 kW", panels: "~8 panels", space: "400 sq ft", cost: "~₹1.77 Lakh", savings: "~₹21.48 Lakhs" },
                { size: "5 kW", panels: "~10 panels", space: "500 sq ft", cost: "~₹2.32 Lakh", savings: "~₹33.46 Lakhs" },
                { size: "10 kW", panels: "~19 panels", space: "1,000 sq ft", cost: "~₹4.87 Lakh", savings: "~₹66.92 Lakhs" }
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">{row.size}</td>
                  <td className="py-3 px-4">{row.panels}</td>
                  <td className="py-3 px-4">{row.space}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">{row.cost}</td>
                  <td className="py-3 px-4 text-primary-green font-semibold">{row.savings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-[10px] text-slate-400 dark:text-slate-550 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4">
          *Costs are based on SolarSquare base variant starting prices as of March 2026. Savings calculation considers a 3% annual tariff escalation rate and a 1% annual plant degradation rate. Actual costs and generation vary by configuration and local DISCOM policies.
        </div>
      </div>

      {/* Solar Return on Investment Analytics Charts */}
      <Charts 
        activeTheme={activeTheme} 
        liveTotalUnits={kwhNeeded}
        recommendedKw={recommendedKw}
        tariffState={tariffKey}
        customFlatRate={7.5}
        mode="solar"
        solarPaybackData={paybackData}
        solarSavingsData={monthlySavingsData}
      />
    </div>
  );
};
