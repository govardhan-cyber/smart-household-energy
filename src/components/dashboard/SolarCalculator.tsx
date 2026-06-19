import React, { useState, useEffect } from "react";
import { Sun, ShieldCheck, HelpCircle, IndianRupee, Settings, ChevronDown, MapPin } from "lucide-react";
import { calculateBill } from "../../utils/tariffCalculator";
import { Charts } from "./Charts";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";

interface SolarCalculatorProps {
  tariffState: string;
  activeTheme: "light" | "dark";
}

// Reusable Animated Number Component
const AnimatedNumber: React.FC<{
  value: number;
  duration?: number;
  formatter?: (v: number) => string;
}> = ({ value, duration = 500, formatter = (v) => Math.round(v).toString() }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
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

// Solar Readiness Score Component
const SolarReadinessScore: React.FC<{ 
  score: number; 
  stateName: string; 
  recommendedKw: number; 
  roofArea: number; 
}> = ({ score, stateName, recommendedKw, roofArea }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    setAnimatedScore(0);
    const duration = 1200;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = progress * (2 - progress);
      setAnimatedScore(Math.round(easedProgress * score));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate(performance.now());
  }, [score]);

  let statusText = "Good Candidate";
  if (score >= 85) {
    statusText = "Excellent Candidate";
  } else if (score < 60) {
    statusText = "Low Feasibility";
  }

  const circumference = 188.5; // 2 * pi * 30
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-left h-[210px] sm:h-[180px] overflow-hidden">
      <div className="space-y-3.5 flex-1">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-550 block">Solar Readiness</span>
          <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight mt-0.5">{statusText}</h4>
        </div>
        <div className="text-[10px] text-slate-500 dark:text-slate-450 space-y-2 pt-0.5">
          <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 pb-1">
            <span>Roof Area</span>
            <span className="font-extrabold text-slate-800 dark:text-slate-200">{roofArea} sq ft</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 pb-1">
            <span>Solar Yield</span>
            <span className="font-extrabold text-slate-800 dark:text-slate-200">{recommendedKw * 120} kWh/mo</span>
          </div>
          <div className="flex justify-between">
            <span>DISCOM</span>
            <span className="font-extrabold text-slate-800 dark:text-slate-200 truncate max-w-[80px]" title={stateName}>{stateName}</span>
          </div>
        </div>
      </div>
      
      <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="40"
            cy="40"
            r="30"
            className="stroke-slate-100 dark:stroke-slate-800"
            strokeWidth="7"
            fill="transparent"
          />
          <circle
            cx="40"
            cy="40"
            r="30"
            className="stroke-amber-500 dark:stroke-primary-green transition-all duration-300 ease-out"
            strokeWidth="7"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-lg font-display font-black text-slate-900 dark:text-white leading-none">{animatedScore}</span>
          <span className="text-[8px] font-bold text-slate-400 uppercase mt-0.5 tracking-wider">/ 100</span>
        </div>
      </div>
    </div>
  );
};


export const SolarCalculator: React.FC<SolarCalculatorProps> = ({
  tariffState,
  activeTheme
}) => {
  const { user } = useAuth();
  
  // Input States
  const [monthlyBill, setMonthlyBill] = useState<number>(3000); 
  const [roofArea, setRoofArea] = useState<number>(300); 
  const [selectedState, setSelectedState] = useState<string>(tariffState || "ap");
  const [solarTech, setSolarTech] = useState<"mono-perc" | "topcon">("topcon");
  const [selectedCity, setSelectedCity] = useState<string>("pune");
  const [isCalculating, setIsCalculating] = useState(false);

  const [tariffIncrease, setTariffIncrease] = useState<number>(4); 
  const [panelDegradation, setPanelDegradation] = useState<number>(0.8); 
  const [maintenanceRate, setMaintenanceRate] = useState<number>(1.0); 
  const [expandAssumptions, setExpandAssumptions] = useState<boolean>(false);

  useEffect(() => {
    setIsCalculating(true);
    const timer = setTimeout(() => setIsCalculating(false), 350);
    return () => clearTimeout(timer);
  }, [solarTech, selectedState, selectedCity, monthlyBill, roofArea]);

  // Map state selector codes to tariffService keys
  const getTariffKey = (stateCode: string) => {
    const code = stateCode.toLowerCase();
    if (code === "ts") return "telangana";
    if (code === "ka") return "karnataka";
    return code; 
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
  // - 1 kW needs ~100 sq ft shadow-free space
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
  let totalSolarCost25Years = installationCost; 

  for (let y = 1; y <= 25; y++) {
    let yearlyBillNoSolar = 0;
    let yearlyBillWithSolar = 0;

    months.forEach((_, idx) => {
      const currentMultiplier = seasonalMultipliers[currentMonthIdx] || 1.0;
      const baseUnits = kwhNeeded;
      const monthUnits = Math.round(baseUnits * (seasonalMultipliers[idx] / currentMultiplier));
      
      const oldBillBase = calculateBill(monthUnits, tariffKey).netEnergyCharge;
      const oldBillInflated = oldBillBase * Math.pow(1 + tariffIncrease / 100, y - 1);
      yearlyBillNoSolar += oldBillInflated;

      const baseSolarGen = recommendedKw * 120;
      const monthSolarGen = Math.round(baseSolarGen * solarMultipliers[idx]);
      const degradedGen = monthSolarGen * Math.pow(1 - panelDegradation / 100, y - 1);
      const netUnits = Math.max(0, monthUnits - degradedGen);

      const newBillBase = calculateBill(netUnits, tariffKey).netEnergyCharge;
      const newBillInflated = newBillBase * Math.pow(1 + tariffIncrease / 100, y - 1);
      yearlyBillWithSolar += newBillInflated;
    });

    const maintenanceCost = (maintenanceRate / 100) * installationCost * Math.pow(1.02, y - 1);
    const netSavingsThisYear = Math.max(0, yearlyBillNoSolar - yearlyBillWithSolar - maintenanceCost);
    cumulativeSavings += netSavingsThisYear;

    const currentBalance = -installationCost + cumulativeSavings;

    totalNoSolarCost25Years += yearlyBillNoSolar;
    totalSolarCost25Years += yearlyBillWithSolar + maintenanceCost;

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
      const prevBalance = -installationCost + (cumulativeSavings - netSavingsThisYear);
      const diff = currentBalance - prevBalance;
      const fraction = diff > 0 ? Math.abs(prevBalance) / diff : 0;
      paybackPeriodVal = (y - 1) + fraction;
      foundPayback = true;
    }
  }

  if (!foundPayback) {
    paybackPeriodVal = 26; 
  }

  // Cache planner outputs to local storage when configurations change
  useEffect(() => {
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
        colorClass: "bg-green-50/50 text-green-700 border-green-200/50 dark:bg-green-950/15 dark:text-primary-green dark:border-green-900/30",
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

  // Derive Solar Readiness Score (Stated formula targeting ~92 baseline)
  const readinessScore = Math.max(30, Math.min(100, Math.round(
    Math.min(30, (roofArea / 450) * 30) +
    Math.min(45, (monthlyGeneration / (kwhNeeded || 1)) * 45) +
    Math.max(0, Math.min(25, (12 - paybackPeriodVal) * 2.5 + 10)) +
    (solarTech === "topcon" ? 4 : 0)
  )));

  // Environmental offsets
  const co2Reduction = (monthlyGeneration * 12 * 0.8) / 1000; // tons of CO2 per year
  const treesEquivalent = Math.round(co2Reduction * 45);

  // Floating bubbles percentage calculations
  const billPercent = ((monthlyBill - 1000) / 14000) * 100;
  const roofPercent = ((roofArea - 50) / 1450) * 100;

  // Custom visual components
  const renderRoofMockup = () => {
    return (
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 text-center relative overflow-hidden flex flex-col justify-between h-[180px] shadow-sm">
        <div className="absolute top-2.5 right-2.5 text-amber-500 text-lg animate-pulse">☀</div>
        <div className="flex-1 flex items-center justify-center pt-2">
          <div className="relative w-44 h-20 bg-slate-105 dark:bg-slate-950 rounded-xl flex flex-wrap items-center justify-center p-2.5 gap-1 border-b-[3px] border-slate-300 dark:border-slate-850">
            <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 border-l-[88px] border-r-[88px] border-b-[20px] border-l-transparent border-r-transparent border-b-slate-200 dark:border-b-slate-900 w-0 h-0"></div>
            {Array.from({ length: Math.min(12, panelsNeeded) }).map((_, idx) => (
              <div 
                key={idx} 
                className="w-8 h-6 bg-gradient-to-br from-blue-700 to-indigo-900 border border-blue-400/20 rounded shadow flex items-center justify-center text-[7px] text-white/50 font-bold"
                style={{ transform: "skewX(-8deg)" }}
              >
                █
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-between text-[9px] font-black uppercase tracking-wider text-slate-450 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-850">
          <span>Panels: {panelsNeeded}</span>
          <span>Coverage: {spaceUtilizedPercent}%</span>
          <span>Unused: {100 - spaceUtilizedPercent}%</span>
        </div>
      </div>
    );
  };

  const renderLifetimeTimeline = () => {
    const yr1 = firstYearSavings;
    let yr5 = 0;
    for (let i = 1; i <= 5; i++) {
      yr5 += firstYearSavings * Math.pow(1 + tariffIncrease / 100, i - 1);
    }
    const yr10 = paybackData[10]?.savings || (firstYearSavings * 10);
    const yr25 = twentyFiveYearNetSavings + installationCost;

    return (
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-left">
        <div>
          <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">
            LIFETIME CUMULATIVE RETURN
          </h4>
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">
            Lifetime Savings Timeline
          </h3>
        </div>
        
        <div className="space-y-4 pt-2.5">
          {[
            { label: "Year 1", amount: yr1 },
            { label: "Year 5", amount: yr5 },
            { label: `Year ${paybackPeriodVal.toFixed(1)} (Break-even)`, amount: installationCost, isPayback: true },
            { label: "Year 10", amount: yr10 },
            { label: "Year 25", amount: yr25 }
          ].sort((a, b) => a.amount - b.amount).map((item, idx) => (
            <div key={idx} className="relative">
              {item.isPayback ? (
                <div className="flex flex-col gap-1 bg-green-500/10 dark:bg-green-500/20 p-3.5 rounded-2xl border border-green-500/20 my-1.5">
                  <div className="flex justify-between items-center text-xs font-black text-green-600 dark:text-primary-green">
                    <span>⚡ YOU RECOVER COST HERE</span>
                    <span>Year {paybackPeriodVal.toFixed(1)}</span>
                  </div>
                  <div className="text-[10px] text-slate-550 dark:text-slate-400 leading-normal">
                    Upfront setup costs are completely recovered! Future savings represent net surplus profit.
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-550 dark:text-slate-400">{item.label}</span>
                    <span className="text-slate-900 dark:text-white">₹{Math.round(item.amount).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        item.label === "Year 25"
                          ? "bg-gradient-to-r from-emerald-500 to-primary-green"
                          : "bg-gradient-to-r from-blue-500 to-cyan-400"
                      }`}
                      style={{ width: `${Math.min(100, (item.amount / (yr25 || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 text-left">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Inputs */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            
            {/* Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
                <Sun className="w-6 h-6 animate-spin-slow" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Solar Savings Planner (2026 Edition)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Configure your rooftop space, monthly bill, and solar cell technology.
                </p>
              </div>
            </div>

            {/* State & City Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Location State */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider block">
                  Installation State
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { code: "ap", label: "Andhra Pradesh", short: "AP" },
                    { code: "ts", label: "Telangana", short: "TS" },
                    { code: "ka", label: "Karnataka", short: "KA" }
                  ].map(st => (
                    <button
                      key={st.code}
                      onClick={() => setSelectedState(st.code)}
                      type="button"
                      className={`py-2.5 px-1 text-xs font-bold rounded-2xl border transition-all duration-205 flex flex-col items-center justify-center gap-1.5 ${
                        selectedState === st.code
                          ? "border-primary-blue bg-blue-500/5 text-primary-blue shadow-[0_0_15px_rgba(59,130,246,0.25)] dark:border-primary-green dark:bg-green-500/5 dark:text-primary-green dark:shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                          : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50 hover:border-slate-350 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <MapPin className={`w-4 h-4 transition-colors ${
                        selectedState === st.code
                          ? "text-primary-blue dark:text-primary-green"
                          : "text-slate-400 dark:text-slate-500"
                      }`} />
                      <span className="text-[10px] tracking-wide uppercase font-black">{st.short}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cost Basis City (2026 subsidy lookup) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider block">
                  Subsidy Price Lookup City
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-primary-blue dark:focus:border-primary-green"
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
              <label className="text-xs font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider block">
                Solar Cell Technology
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSolarTech("topcon")}
                  type="button"
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 relative flex flex-col justify-between ${
                    solarTech === "topcon"
                      ? "border-primary-green bg-green-500/5 dark:bg-green-950/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                      : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50"
                  }`}
                >
                  <div className="absolute top-2 right-2 bg-green-500 text-slate-950 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                    Recommended ⭐
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900 dark:text-white">TOPCon Premium</div>
                    <div className="text-[10px] text-slate-550 dark:text-slate-450 mt-2 space-y-1">
                      <div>Efficiency: <span className="font-bold text-slate-700 dark:text-slate-300">26%</span></div>
                      <div>Lifespan: <span className="font-bold text-slate-700 dark:text-slate-300">30 Years</span></div>
                      <div className="text-amber-500 font-bold">★★★★★</div>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setSolarTech("mono-perc")}
                  type="button"
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 relative flex flex-col justify-between ${
                    solarTech === "mono-perc"
                      ? "border-primary-blue bg-blue-500/5 dark:bg-blue-950/10 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                      : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50"
                  }`}
                >
                  <div>
                    <div className="text-xs font-black text-slate-900 dark:text-white">Mono-PERC Standard</div>
                    <div className="text-[10px] text-slate-550 dark:text-slate-455 mt-2 space-y-1">
                      <div>Efficiency: <span className="font-bold text-slate-700 dark:text-slate-300">22.5%</span></div>
                      <div>Lifespan: <span className="font-bold text-slate-700 dark:text-slate-300">25 Years</span></div>
                      <div className="text-amber-500 font-bold">★★★★☆</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Input 1: Monthly Electricity Bill (₹) */}
            <div className="space-y-4 pt-2 relative">
              <div className="flex justify-between items-center text-sm font-bold text-slate-700 dark:text-slate-350">
                <span className="flex items-center gap-1">
                  Average Monthly Bill
                  <span className="text-[10px] text-slate-450 font-normal hover:text-slate-500 cursor-pointer" title="Your typical monthly electricity bill amount. Used to estimate your energy needs.">
                    <HelpCircle className="w-3.5 h-3.5 inline" />
                  </span>
                </span>
                <span className="text-primary-blue dark:text-primary-green text-base font-extrabold flex items-center">
                  <IndianRupee className="w-4 h-4 mr-0.5" />
                  <AnimatedNumber value={monthlyBill} formatter={(v) => Math.round(v).toLocaleString('en-IN')} />
                </span>
              </div>
              
              <div className="relative pt-6 pb-2">
                {/* Floating Bubble */}
                <div 
                  className="absolute top-0 bg-primary-blue text-white px-2 py-0.5 rounded-lg text-[10px] font-bold transform -translate-x-1/2 whitespace-nowrap shadow-md transition-all duration-75 after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-primary-blue"
                  style={{ left: `${billPercent}%` }}
                >
                  ₹{monthlyBill.toLocaleString('en-IN')}
                </div>
                <input
                  type="range"
                  min="1000"
                  max="15000"
                  step="500"
                  value={monthlyBill}
                  onChange={(e) => setMonthlyBill(parseInt(e.target.value))}
                  className="premium-slider w-full cursor-pointer h-2 rounded-full appearance-none outline-none"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #06b6d4 ${billPercent}%, ${activeTheme === 'dark' ? '#1e293b' : '#e2e8f0'} ${billPercent}%, ${activeTheme === 'dark' ? '#1e293b' : '#e2e8f0'} 100%)`
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-550">
                <span>₹1,000</span>
                <span>₹5,000</span>
                <span>₹10,000</span>
                <span>₹15,000</span>
              </div>
            </div>

            {/* Input 2: Roof Space Area (sq ft) */}
            <div className="space-y-4 pt-2 relative">
              <div className="flex justify-between items-center text-sm font-bold text-slate-700 dark:text-slate-350">
                <span className="flex items-center gap-1">
                  Available Roof Space Area
                  <span className="text-[10px] text-slate-450 font-normal hover:text-slate-555 cursor-pointer" title="Usable shadow-free flat rooftop area. 1 kW of solar capacity needs ~100 square feet.">
                    <HelpCircle className="w-3.5 h-3.5 inline" />
                  </span>
                </span>
                <span className="text-amber-500 text-base font-extrabold">
                  <AnimatedNumber value={roofArea} /> sq ft
                </span>
              </div>
              
              <div className="relative pt-6 pb-2">
                {/* Floating Bubble */}
                <div 
                  className="absolute top-0 bg-amber-500 text-white px-2.5 py-0.5 rounded-lg text-[10px] font-bold transform -translate-x-1/2 whitespace-nowrap shadow-md transition-all duration-75 after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-amber-500"
                  style={{ left: `${roofPercent}%` }}
                >
                  {roofArea} sq ft
                </div>
                <input
                  type="range"
                  min="50"
                  max="1500"
                  step="50"
                  value={roofArea}
                  onChange={(e) => setRoofArea(parseInt(e.target.value))}
                  className="premium-slider w-full cursor-pointer h-2 rounded-full appearance-none outline-none"
                  style={{
                    background: `linear-gradient(to right, #f59e0b 0%, #facc15 ${roofPercent}%, ${activeTheme === 'dark' ? '#1e293b' : '#e2e8f0'} ${roofPercent}%, ${activeTheme === 'dark' ? '#1e293b' : '#e2e8f0'} 100%)`
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-550">
                <span>50 sq ft</span>
                <span>500 sq ft</span>
                <span>1,000 sq ft</span>
                <span>1,500 sq ft</span>
              </div>
            </div>

            {/* Sizing Logic Explanation */}
            <div className="p-4 bg-slate-50 dark:bg-slate-955/40 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-500 dark:text-slate-400 leading-relaxed space-y-1">
              <span className="font-bold text-slate-850 dark:text-slate-300 block mb-1">How Sizing Works:</span>
              <p>
                To offset a bill of <span className="font-semibold text-slate-700 dark:text-slate-300">₹<AnimatedNumber value={monthlyBill} formatter={(v) => Math.round(v).toLocaleString('en-IN')} /></span> in {getFullStateName(selectedState)}, your house requires a <span className="font-semibold text-slate-705 dark:text-slate-300"><AnimatedNumber value={kwNeededByUsage} formatter={(v) => v.toFixed(1)} /> kW</span> system.
              </p>
              <p>
                Capped by your roof area limit of <span className="font-semibold text-slate-705 dark:text-slate-300"><AnimatedNumber value={maxKwBySpace} formatter={(v) => v.toFixed(1)} /> kW</span> (100 sq ft per kW), the recommended sizing is <span className="font-semibold text-slate-705 dark:text-slate-300"><AnimatedNumber value={recommendedKw} formatter={(v) => v.toFixed(1)} /> kW</span>.
              </p>
            </div>

            {/* Detailed Net Metering breakdown */}
            <div className="p-4 bg-blue-50/10 dark:bg-slate-950/20 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-505 dark:text-slate-400 space-y-2">
              <span className="font-bold text-slate-850 dark:text-slate-300 block">Net Metering Billing Breakdown:</span>
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
                  <div className="space-y-2">
                    <div className="flex justify-between font-semibold text-slate-600 dark:text-slate-400">
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

                  <div className="space-y-2">
                    <div className="flex justify-between font-semibold text-slate-655 dark:text-slate-400">
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

                  <div className="space-y-2">
                    <div className="flex justify-between font-semibold text-slate-655 dark:text-slate-400">
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

            {/* AI Solar Advisor Widget */}
            <div className="bg-slate-50 dark:bg-slate-950/40 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 text-left">
              <div className="flex items-center gap-2">
                <span className="text-lg">🤖</span>
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Ask Solar AI Advisor</h4>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                Click a question below to consult the AI agent about your solar recommendation:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-bold">
                {[
                  "Can solar eliminate my bill?",
                  "Should I wait another year?",
                  "What size system should I buy?",
                  "Can I charge an EV with this system?"
                ].map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent("she_trigger_chat", { 
                        detail: { message: `${q} Based on my Solar Planner recommendation: a ${recommendedKw.toFixed(1)} kW system, costs ₹${installationCost.toLocaleString('en-IN')}, saves ₹${firstYearSavings.toLocaleString('en-IN')}/year, payback in ${paybackPeriodVal.toFixed(1)} years.` } 
                      }));
                    }}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-primary-blue dark:hover:border-primary-green hover:shadow-sm text-left transition-all leading-normal text-slate-700 dark:text-slate-300"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Panel details sub-section */}
          <div className="bg-slate-50 dark:bg-slate-955/40 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 text-xs text-left space-y-1 shadow-sm">
            <span className="font-bold text-slate-850 dark:text-slate-300 block mb-1">Rooftop Module Details:</span>
            <div className="grid grid-cols-2 gap-y-1 text-slate-500 dark:text-slate-400">
              <div>Modules Needed:</div>
              <div className="font-semibold text-slate-800 dark:text-slate-200 text-right">{panelsNeeded} panels ({panelWattage}W)</div>
              <div>Single Panel Dimensions:</div>
              <div className="font-semibold text-slate-800 dark:text-slate-200 text-right">{panelSizeLabel}</div>
              <div>Single Panel Weight:</div>
              <div className="font-semibold text-slate-800 dark:text-slate-200 text-right">~{panelWeight} kg</div>
              <div>Internal Efficiency:</div>
              <div className="font-semibold text-primary-green text-right">
                {panelEfficiency.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: ROI Outputs */}
        <div className="lg:col-span-6 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 relative"
          >
            {/* Loading Overlay */}
            {isCalculating && (
              <div className="absolute inset-0 z-20 bg-white/70 dark:bg-slate-900/75 backdrop-blur-[1px] flex flex-col items-center justify-center space-y-3 transition-opacity">
                <div className="w-8 h-8 border-3 border-slate-200 border-t-primary-blue dark:border-t-primary-green rounded-full animate-spin"></div>
                <span className="text-xs font-bold text-slate-550 dark:text-slate-400">Recalculating solar metrics...</span>
              </div>
            )}

            {/* 1. Centerpiece Hero Result Card */}
            <div 
              style={{
                background: "linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(56, 189, 248, 0.15))"
              }}
              className="p-6 rounded-3xl border border-green-200/40 dark:border-green-950/20 flex flex-col justify-between min-h-[220px] shadow-sm relative overflow-hidden text-left"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <span>☀</span> Solar Recommendation
                </span>
                <h3 className="text-3xl font-display font-black text-slate-900 dark:text-white mt-1.5">
                  {recommendedKw.toFixed(1)} kW System
                </h3>
                <div className="text-base font-extrabold text-green-600 dark:text-primary-green mt-2.5">
                  ₹{firstYearSavings.toLocaleString('en-IN')} Saved Every Year
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Payback in {paybackPeriodVal.toFixed(1)} Years
                </div>
              </div>
              
              <button 
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("she_trigger_chat", { 
                    detail: { message: `I want to install the recommended ${recommendedKw.toFixed(1)} kW Solar System. What are the installation steps, required solar panel brands, and subsidy approval procedures?` } 
                  }));
                }}
                type="button"
                className="mt-4 px-6 h-11 bg-primary-green hover:bg-primary-green/90 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] w-fit shadow-md hover:shadow-lg"
              >
                Install Solar
              </button>
            </div>

            {/* 2. Readiness & Roof Space side-by-side grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SolarReadinessScore 
                score={readinessScore} 
                stateName={getFullStateName(selectedState)} 
                recommendedKw={recommendedKw}
                roofArea={roofArea}
              />
              {renderRoofMockup()}
            </div>

            {/* 3. Feasibility Review Callout */}
            <div className={`p-5 rounded-3xl border ${conclusion.colorClass} space-y-4 text-left shadow-sm`}>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-550">
                  Feasibility Review
                </span>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full border border-green-600/30 bg-green-500/10 text-green-600 dark:text-primary-green uppercase tracking-wide">
                  {conclusion.badge}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs font-semibold">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Financial Score</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-white">{Math.round(100 - (paybackPeriodVal * 3))}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Expected Profit</span>
                  <span className="text-sm font-extrabold text-primary-green">₹{twentyFiveYearNetSavings.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Break-Even</span>
                  <span className="text-sm font-extrabold text-primary-blue dark:text-blue-400">{paybackPeriodVal.toFixed(1)} Years</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Risk Level</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-white">{paybackPeriodVal > 10 ? "Medium" : "Low"}</span>
                </div>
              </div>
            </div>

            {/* 4. Stripe/Tesla style metric grid */}
            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col justify-between h-[110px] shadow-sm relative group hover:border-slate-350 dark:hover:border-slate-700 transition-colors">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-555 uppercase tracking-widest">💰 Investment</span>
                <p className="text-xl font-display font-black text-slate-900 dark:text-white leading-tight mt-2">
                  ₹{installationCost.toLocaleString('en-IN')}
                </p>
                <span className="text-[9px] text-slate-450 dark:text-slate-500 block">After PM Surya Ghar Subsidy</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col justify-between h-[110px] shadow-sm relative group hover:border-slate-350 dark:hover:border-slate-700 transition-colors">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-555 uppercase tracking-widest">📈 Annual Return</span>
                <p className="text-xl font-display font-black text-primary-green leading-tight mt-2">
                  ₹{firstYearSavings.toLocaleString('en-IN')}
                </p>
                <span className="text-[9px] text-slate-455 dark:text-slate-500 block">Year 1 savings estimate</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col justify-between h-[110px] shadow-sm relative group hover:border-slate-350 dark:hover:border-slate-700 transition-colors">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-555 uppercase tracking-widest">⚡ Monthly Savings</span>
                <p className="text-xl font-display font-black text-primary-blue dark:text-blue-400 leading-tight mt-2">
                  ₹{Math.round(firstYearSavings / 12).toLocaleString('en-IN')}
                </p>
                <span className="text-[9px] text-slate-455 dark:text-slate-500 block">Estimated grid bill cut</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col justify-between h-[110px] shadow-sm relative group hover:border-slate-350 dark:hover:border-slate-700 transition-colors">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-555 uppercase tracking-widest">🏆 ROI</span>
                <p className="text-xl font-display font-black text-amber-500 leading-tight mt-2">
                  {installationCost > 0 ? ((twentyFiveYearNetSavings + installationCost) / installationCost).toFixed(1) : "0.0"}x
                </p>
                <span className="text-[9px] text-slate-455 dark:text-slate-500 block">25-Year cumulative yield</span>
              </div>
            </div>

            {/* 5. Lifetime Savings Timeline */}
            {renderLifetimeTimeline()}

            {/* 6. Environmental Offset Card */}
            <div className="bg-gradient-to-br from-green-500/5 via-emerald-500/10 to-teal-500/5 p-6 rounded-3xl border border-green-500/20 space-y-4 text-left shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-lg">🌱</span>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-450 dark:text-slate-400">Carbon Reduction</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase block font-bold">Annual Offset</span>
                  <p className="text-xl font-black text-slate-900 dark:text-white">
                    {co2Reduction.toFixed(1)} Tons CO₂
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase block font-bold">Tree Equivalent</span>
                  <p className="text-xl font-black text-primary-green">
                    🌳 {treesEquivalent} Trees
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-slate-550 dark:text-slate-450 leading-normal border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
                Calculated using grid displacement factors. Offsets your domestic coal power generation footprint over 25 years.
              </p>
            </div>

            {/* No Solar vs Solar Installed Side-by-Side Comparison */}
            <div className="bg-slate-50 dark:bg-slate-950/45 p-5 rounded-3xl border border-slate-200 dark:border-slate-800/80 space-y-4 text-left shadow-sm">
              <h4 className="text-xs font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider">
                25-Year Lifetime Cost Comparison
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-105 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">No Solar (Grid Only)</span>
                  <p className="text-base font-extrabold text-slate-850 dark:text-white mt-1">
                    ₹{Math.round(totalNoSolarCost25Years).toLocaleString('en-IN')}
                  </p>
                  <span className="text-[9px] text-slate-400 block">Bills inflated at {tariffIncrease}% p.a.</span>
                </div>
                <div className="space-y-1 p-3.5 rounded-2xl bg-green-500/5 dark:bg-green-950/5 border border-primary-green/20">
                  <span className="text-[10px] font-bold text-primary-green uppercase">Solar Installed</span>
                  <p className="text-base font-extrabold text-primary-green mt-1">
                    ₹{Math.round(totalSolarCost25Years).toLocaleString('en-IN')}
                  </p>
                  <span className="text-[9px] text-slate-400 block">System cost + bills + {maintenanceRate}% maintenance.</span>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-550 dark:text-slate-400">Total Net Lifetime Savings:</span>
                <span className="font-extrabold text-primary-green text-sm">
                  ₹{Math.round(twentyFiveYearNetSavings).toLocaleString('en-IN')}
                </span>
              </div>
            </div>


            {/* Security details note */}
            <div className="flex items-center gap-2 text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span>Slab calculations match active {getFullStateName(selectedState)} net metering rules.</span>
            </div>
          </motion.div>
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

        <div className="text-[10px] text-slate-400 dark:text-slate-555 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4">
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
