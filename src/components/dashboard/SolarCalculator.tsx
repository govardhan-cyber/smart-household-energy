import React, { useState, useEffect } from "react";
import { Sun, ShieldCheck, HelpCircle, IndianRupee, Settings, MapPin, Home, Zap, Building2, Leaf, Info, Layers, ArrowUpRight } from "lucide-react";
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
    let startTimestamp: number | null = null;
    const startValue = animatedScore;
    const endValue = score;
    if (startValue === endValue) return;

    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / 800, 1);
      const easedProgress = progress * (2 - progress);
      const current = startValue + easedProgress * (endValue - startValue);
      setAnimatedScore(Math.round(current));
      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [score]);

  let statusText = "Good Candidate";
  let badgeColor = "bg-green-500/10 text-green-700 dark:text-primary-green border-green-500/20";
  let badgeText = "Good Potential";
  let textExplanation = "Score >75 indicates high suitability.";
  
  if (score >= 85) {
    statusText = "Excellent Candidate";
    badgeColor = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    badgeText = "Excellent Potential";
    textExplanation = "Score >85 indicates outstanding setup.";
  } else if (score < 60) {
    statusText = "Low Feasibility";
    badgeColor = "bg-rose-500/10 text-rose-600 dark:text-rose-455 border-rose-500/20";
    badgeText = "Low Feasibility";
    textExplanation = "Score <60 suggests lower generation.";
  }

  const circumference = 163.3; // 2 * pi * 26
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-[0_0_25px_-5px_rgba(245,158,11,0.2)] hover:border-amber-500/20 transition-all duration-300 flex flex-col justify-between text-left space-y-4 relative overflow-hidden group [backface-visibility:hidden] [transform-style:preserve-3d]">
      {/* Top right corner glowing wash */}
      <div className="absolute -right-6 -top-6 w-24 h-24 blur-xl opacity-20 dark:opacity-10 rounded-full bg-amber-500 pointer-events-none group-hover:scale-150 transition-all duration-500" />
      
      {/* Top Row: Title block and circular gauge side-by-side */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-850 pb-3 relative z-10">
        <div className="flex gap-2.5">
          <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl h-9.5 w-9.5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Sun className="w-5 h-5 animate-spin" style={{ animationDuration: "20s" }} />
          </div>
          <div>
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest block">
              SOLAR READINESS
            </span>
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase leading-tight mt-1">
              {statusText}
            </h3>
            <p className="text-[9.5px] text-slate-500 dark:text-slate-450 mt-0.5 leading-tight">
              High suitability for residential solar setup.
            </p>
          </div>
        </div>

        {/* Circular Gauge */}
        <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r="26"
              className="stroke-slate-100 dark:stroke-slate-800"
              strokeWidth="5"
              fill="transparent"
            />
            <circle
              cx="32"
              cy="32"
              r="26"
              className="stroke-amber-500 dark:stroke-primary-green transition-all duration-300 ease-out"
              strokeWidth="5"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-base font-display font-black text-slate-900 dark:text-white leading-none">
              {animatedScore}
            </span>
            <span className="text-[7.5px] font-bold text-slate-400 uppercase mt-0.5 tracking-wider">
              / 100
            </span>
          </div>
        </div>
      </div>

      {/* Middle Block: List and Potential Badge side-by-side */}
      <div className="flex items-center justify-between gap-4 my-1 relative z-10">
        {/* Left Side: Compact row items */}
        <div className="flex-1 space-y-2.5">
          {/* Roof Area */}
          <div className="flex items-center gap-2.5 group/item">
            <div className="p-1.5 bg-green-500/10 text-green-600 dark:text-primary-green rounded-lg shrink-0 group-hover/item:scale-110 transition-transform">
              <Home className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[9.5px] text-slate-400 dark:text-slate-55 block leading-none">Usable Area</span>
              <span className="text-xs font-bold text-green-650 dark:text-primary-green mt-1 block">
                {roofArea} sq ft
              </span>
            </div>
          </div>

          {/* Solar Yield */}
          <div className="flex items-center gap-2.5 group/item">
            <div className="p-1.5 bg-blue-500/10 text-blue-500 rounded-lg shrink-0 group-hover/item:scale-110 transition-transform">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[9.5px] text-slate-400 dark:text-slate-55 block leading-none">Solar Yield</span>
              <span className="text-xs font-bold text-blue-500 mt-1 block">
                {Math.round(recommendedKw * 120)} kWh/mo
              </span>
            </div>
          </div>

          {/* DISCOM */}
          <div className="flex items-center gap-2.5 group/item">
            <div className="p-1.5 bg-purple-500/10 text-purple-505 dark:text-purple-400 rounded-lg shrink-0 group-hover/item:scale-110 transition-transform">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[9.5px] text-slate-400 dark:text-slate-55 block leading-none">DISCOM Provider</span>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 mt-1 block truncate max-w-[125px]" title={stateName}>
                {stateName}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Badge & description */}
        <div className="flex flex-col items-center shrink-0 w-28 text-center space-y-1">
          <span className={`text-[8.5px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider ${badgeColor}`}>
            {badgeText}
          </span>
          <p className="text-[9px] text-slate-455 dark:text-slate-500 font-bold leading-normal mt-1">
            {textExplanation}
          </p>
        </div>
      </div>

      {/* Bottom Group: Alert & Footer grouped together to eliminate awkward vertical stretching gaps */}
      <div className="space-y-2.5 mt-auto relative z-10">
        {/* Bottom Block: Compact Good Fit Alert */}
        <div className="p-3 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 dark:border-emerald-500/20 rounded-2xl flex items-center justify-between gap-2.5 text-left hover:border-emerald-500/30 transition-all duration-300">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-primary-green rounded-xl shrink-0">
              <Leaf className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-405 block">
                Why it's a good fit
              </span>
              <span className="text-[9.5px] font-semibold text-slate-500 dark:text-slate-400 leading-snug block mt-0.5">
                Ample roof space & high yield for maximum savings.
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent("she_trigger_chat", { 
                detail: { message: `Analyze my solar readiness parameters. My roof is ${roofArea} sq ft in ${stateName}. Explain why this is a good fit.` } 
              }));
            }}
            type="button"
            className="p-1 text-emerald-600 dark:text-primary-green hover:bg-emerald-500/15 rounded-lg transition-all text-xs font-black shrink-0 cursor-pointer"
            title="View Details"
          >
            ➔
          </button>
        </div>

        {/* Footer Info Callout */}
        <div className="flex items-center gap-1.5 text-[8.5px] font-bold text-slate-400 dark:text-slate-550 pt-2 border-t border-slate-100 dark:border-slate-850">
          <Info className="w-3 h-3" />
          <span>Score based on roof, yield, and DISCOM provider.</span>
        </div>
      </div>
    </div>
  );
};


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.25,
      ease: "easeInOut" as const
    }
  }
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSelectReferenceSize = (targetBill: number, targetSpace: number) => {
    setMonthlyBill(targetBill);
    setRoofArea(targetSpace);
    
    // Smooth scroll to the top of the planner inputs card
    setTimeout(() => {
      const plannerCard = document.getElementById("solar-savings-planner-card");
      if (plannerCard) {
        plannerCard.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 50);
  };

  const [tariffIncrease, setTariffIncrease] = useState<number>(4); 
  const [panelDegradation, setPanelDegradation] = useState<number>(0.8); 
  const [maintenanceRate, setMaintenanceRate] = useState<number>(1.0); 

  // Custom visual states for isometric roof planner
  const [roofTilt, setRoofTilt] = useState<"flat" | "inclined">("inclined");
  const [roofOrientation, setRoofOrientation] = useState<"south" | "east" | "west">("south");
  const [shadedPanels, setShadedPanels] = useState<Record<number, boolean>>({}); 


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
  
  const orientationMultiplier = roofOrientation === "south" ? 1.0 : 0.85;
  const tiltMultiplier = roofTilt === "flat" ? 0.90 : 1.0;
  
  // Calculate panels needed dynamically to compute shading factor
  const panelWattageTmp = solarTech === "topcon" ? 580 : 500;
  const panelsNeededTmp = Math.ceil((recommendedKw * 1000) / panelWattageTmp);
  const shadedCount = Object.values(shadedPanels).filter(Boolean).length;
  const shadingFactor = panelsNeededTmp > 0 
    ? 1 - (Math.min(panelsNeededTmp, shadedCount) / panelsNeededTmp) * 0.60
    : 1.0;

  const solarEfficiencyFactor = orientationMultiplier * tiltMultiplier * shadingFactor;
  const monthlyGeneration = recommendedKw * 120 * solarEfficiencyFactor; // kWh

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

  // Custom visual component helpers
  const togglePanelShaded = (idx: number) => {
    setShadedPanels(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const renderRoofMockup = () => {
    const orientationMultiplier = roofOrientation === "south" ? 1.0 : 0.85;
    const tiltMultiplier = roofTilt === "flat" ? 0.90 : 1.0;
    const shadedCount = Object.values(shadedPanels).filter(Boolean).length;
    const shadingFactor = panelsNeeded > 0 
      ? 1 - (Math.min(panelsNeeded, shadedCount) / panelsNeeded) * 0.60
      : 1.0;
    const systemOutputPercent = Math.round(orientationMultiplier * tiltMultiplier * shadingFactor * 100);

    // Sun visual positions
    let sunX = 190, sunY = 15, sunGlow = "rgba(245, 158, 11, 0.4)";
    if (roofOrientation === "east") {
      sunX = 60; sunY = 25; sunGlow = "rgba(249, 115, 22, 0.3)";
    } else if (roofOrientation === "west") {
      sunX = 320; sunY = 25; sunGlow = "rgba(249, 115, 22, 0.3)";
    }

    // Bilinear interpolation for panels on isometric roof
    const y_front = roofTilt === "flat" ? 95 : 115;
    const y_back = roofTilt === "flat" ? 55 : 65;

    const cols = 4;
    const rows = Math.max(1, Math.ceil(panelsNeeded / cols));
    const du = 0.82 / cols;
    const dv = 0.82 / rows;

    const getIsoXY = (u: number, v: number) => {
      const lx = 60 + v * (160 - 60);
      const ly = y_front + v * (y_back - y_front);
      const rx = 240 + v * (340 - 240);
      const ry = y_front + v * (y_back - y_front);
      return {
        x: lx + u * (rx - lx),
        y: ly + u * (ry - ly)
      };
    };

    return (
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 text-center relative overflow-hidden flex flex-col justify-between shadow-sm space-y-3 group hover:shadow-[0_0_25px_-5px_rgba(99,102,241,0.2)] hover:border-indigo-500/20 transition-all duration-300 [backface-visibility:hidden] [transform-style:preserve-3d]">
        {/* Top right corner glowing wash */}
        <div className="absolute -right-6 -top-6 w-24 h-24 blur-xl opacity-20 dark:opacity-10 rounded-full bg-indigo-500 pointer-events-none group-hover:scale-150 transition-all duration-500" />
        
        {/* Title */}
        <div className="flex justify-between items-center text-left relative z-10">
          <div>
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest block mb-0.5">
              ROOFTOP PLACEMENT MAP
            </span>
            <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase">
              Isometric Rooftop Planner
            </h4>
          </div>
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${
            systemOutputPercent >= 90
              ? "bg-green-500/10 border-green-500/20 text-primary-green"
              : systemOutputPercent >= 70
              ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
              : "bg-red-500/10 border-red-500/20 text-red-500"
          }`}>
            Yield: {systemOutputPercent}%
          </span>
        </div>

        {/* SVG Canvas */}
        <div className="flex-1 flex items-center justify-center py-1 bg-slate-50/55 dark:bg-slate-950/20 rounded-2xl border border-slate-100 dark:border-slate-800/80 relative min-h-[125px] overflow-hidden">
          {/* Sun Glow */}
          <div 
            className="absolute rounded-full pointer-events-none transition-all duration-500"
            style={{ 
              left: sunX + 45, 
              top: sunY + 5, 
              width: 50, 
              height: 50, 
              boxShadow: `0 0 45px 15px ${sunGlow}`,
              backgroundColor: "transparent"
            }}
          />

          <svg viewBox="0 0 400 180" className="w-full h-auto max-w-[340px] relative z-10">
            {/* Sun */}
            <circle cx={sunX} cy={sunY} r="8" fill="#FBBF24" className="transition-all duration-500 animate-pulse" />
            <circle cx={sunX} cy={sunY} r="12" fill="none" stroke="#F59E0B" strokeWidth="1" strokeDasharray="3 3" className="animate-spin transition-all duration-500" style={{ animationDuration: "12s" }} />

            {/* Sun Rays */}
            <line x1={sunX} y1={sunY + 12} x2={sunX} y2={sunY + 22} stroke="#FBBF24" strokeWidth="1.5" className="transition-all duration-500" />
            <line x1={sunX - 12} y1={sunY} x2={sunX - 22} y2={sunY} stroke="#FBBF24" strokeWidth="1.5" className="transition-all duration-500" />
            <line x1={sunX + 12} y1={sunY} x2={sunX + 22} y2={sunY} stroke="#FBBF24" strokeWidth="1.5" className="transition-all duration-500" />
            <line x1={sunX - 9} y1={sunY + 9} x2={sunX - 16} y2={sunY + 16} stroke="#FBBF24" strokeWidth="1.5" className="transition-all duration-500" />
            <line x1={sunX + 9} y1={sunY + 9} x2={sunX + 16} y2={sunY + 16} stroke="#FBBF24" strokeWidth="1.5" className="transition-all duration-500" />

            {/* House structure */}
            {/* Front Wall */}
            <polygon 
              points={`60,${y_front} 240,${y_front} 240,165 60,165`} 
              className="fill-slate-100 dark:fill-slate-800 stroke-slate-200 dark:stroke-slate-850 stroke-[1.5px] transition-all duration-500" 
            />
            {/* Side Wall */}
            <polygon 
              points={`240,${y_front} 340,${y_back} 340,120 240,165`} 
              className="fill-slate-150 dark:fill-slate-750 stroke-slate-200 dark:stroke-slate-850 stroke-[1.5px] transition-all duration-500" 
            />
            
            {/* Door */}
            <rect x="130" y="125" width="40" height="40" rx="4" className="fill-slate-200 dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-850" />
            <circle cx="162" cy="145" r="1.5" fill="#B45309" />

            {/* Window */}
            <polygon 
              points="270,125 310,110 310,95 270,110" 
              className="fill-cyan-500/10 dark:fill-cyan-500/5 stroke-slate-300 dark:stroke-slate-850" 
            />
            <line x1="290" y1="117.5" x2="290" y2="102.5" stroke="#94A3B8" strokeWidth="1" />

            {/* Roof plane */}
            <polygon 
              points={`60,${y_front} 160,${y_back} 340,${y_back} 240,${y_front}`} 
              className="fill-slate-250 dark:fill-slate-700 stroke-slate-350 dark:stroke-slate-800 stroke-[2px] transition-all duration-500" 
            />

            {/* SOLAR PANELS */}
            {Array.from({ length: panelsNeeded }).map((_, idx) => {
              const r = Math.floor(idx / cols);
              const c = idx % cols;

              const u_start = 0.08 + c * (0.84 / cols);
              const v_start = 0.08 + r * (0.84 / rows);

              const pA = getIsoXY(u_start, v_start);
              const pB = getIsoXY(u_start + du, v_start);
              const pC = getIsoXY(u_start + du, v_start + dv);
              const pD = getIsoXY(u_start, v_start + dv);

              const isShaded = !!shadedPanels[idx];

              return (
                <polygon
                  key={idx}
                  points={`${pA.x},${pA.y} ${pB.x},${pB.y} ${pC.x},${pC.y} ${pD.x},${pD.y}`}
                  onClick={() => togglePanelShaded(idx)}
                  className={`cursor-pointer transition-all duration-300 stroke-[1.5px] ${
                    isShaded
                      ? "fill-slate-750 dark:fill-slate-850 stroke-slate-500 hover:fill-slate-650 hover:stroke-slate-400"
                      : "fill-indigo-600 dark:fill-indigo-500 stroke-indigo-400 hover:fill-cyan-400 dark:hover:fill-cyan-400 hover:stroke-white"
                  }`}
                />
              );
            })}
          </svg>

          {/* Hint Overlay */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-slate-950/80 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full pointer-events-none tracking-wide select-none">
            💡 CLICK PANELS TO TOGGLE SHADING
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-850 relative z-10">
          <div className="flex justify-between items-center gap-4 text-left text-[11px] font-bold">
            {/* Tilt Control */}
            <div className="flex-1 flex flex-col gap-1">
              <span className="text-slate-400 uppercase text-[9px] tracking-wider">Roof Tilt</span>
              <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-800/85">
                <button
                  onClick={() => setRoofTilt("inclined")}
                  className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    roofTilt === "inclined"
                      ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/35 dark:border-slate-700/50"
                      : "text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300"
                  }`}
                >
                  Pitched (15°)
                </button>
                <button
                  onClick={() => setRoofTilt("flat")}
                  className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    roofTilt === "flat"
                      ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/35 dark:border-slate-700/50"
                      : "text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300"
                  }`}
                >
                  Flat (0°)
                </button>
              </div>
            </div>

            {/* Orientation Control */}
            <div className="flex-1 flex flex-col gap-1">
              <span className="text-slate-400 uppercase text-[9px] tracking-wider">Orientation</span>
              <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-800/85">
                <button
                  onClick={() => setRoofOrientation("south")}
                  className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    roofOrientation === "south"
                      ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/35 dark:border-slate-700/50"
                      : "text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300"
                  }`}
                >
                  South
                </button>
                <button
                  onClick={() => setRoofOrientation("east")}
                  className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    roofOrientation === "east"
                      ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/35 dark:border-slate-700/50"
                      : "text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300"
                  }`}
                >
                  East
                </button>
                <button
                  onClick={() => setRoofOrientation("west")}
                  className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    roofOrientation === "west"
                      ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/35 dark:border-slate-700/50"
                      : "text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300"
                  }`}
                >
                  West
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between text-[9.5px] font-bold uppercase tracking-wider text-slate-455 dark:text-slate-555 mt-0.5">
            <span>Panels: {panelsNeeded} ({shadedCount} Shaded)</span>
            <span>Coverage: {spaceUtilizedPercent}%</span>
          </div>
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
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-left relative overflow-hidden group hover:shadow-[0_0_20px_-5px_rgba(59,130,246,0.15)] hover:border-blue-500/20 transition-all duration-300">
        <div className="absolute -right-6 -top-6 w-24 h-24 blur-xl opacity-20 dark:opacity-10 rounded-full bg-blue-500 pointer-events-none group-hover:scale-150 transition-all duration-500" />
        
        <div className="relative z-10">
          <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-555 uppercase tracking-widest block mb-1">
            LIFETIME CUMULATIVE RETURN
          </h4>
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">
            Lifetime Savings Timeline
          </h3>
        </div>
        
        <div className="space-y-4 pt-2.5 relative z-10">
          {[
            { label: "Year 1", amount: yr1 },
            { label: "Year 5", amount: yr5 },
            { label: `Year ${paybackPeriodVal.toFixed(1)} (Break-even)`, amount: installationCost, isPayback: true },
            { label: "Year 10", amount: yr10 },
            { label: "Year 25", amount: yr25 }
          ].sort((a, b) => a.amount - b.amount).map((item, idx) => (
            <div key={idx} className="relative">
              {item.isPayback ? (
                <div className="flex flex-col gap-1 bg-green-500/10 dark:bg-green-500/20 p-3.5 rounded-2xl border border-green-500/20 my-1.5 hover:border-green-500/40 transition-all">
                  <div className="flex justify-between items-center text-xs font-black text-green-600 dark:text-primary-green">
                    <span>⚡ YOU RECOVER SETUP COST HERE</span>
                    <span>Year <AnimatedNumber value={paybackPeriodVal} formatter={(v) => v.toFixed(1)} /></span>
                  </div>
                  <div className="text-[10px] text-slate-550 dark:text-slate-400 leading-normal font-medium mt-0.5">
                    Upfront setup costs are completely recovered! Future savings represent net surplus profit.
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-550 dark:text-slate-400">{item.label}</span>
                    <span className="text-slate-900 dark:text-white">
                      ₹<AnimatedNumber value={item.amount} formatter={(v) => Math.round(v).toLocaleString('en-IN')} />
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        item.label === "Year 25"
                          ? "bg-gradient-to-r from-emerald-500 to-primary-green"
                          : "bg-gradient-to-r from-blue-500 to-cyan-400"
                      }`}
                      style={{ width: isMounted ? `${Math.min(100, (item.amount / (yr25 || 1)) * 100)}%` : "0%" }}
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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 text-left"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Inputs */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-6 space-y-6"
        >
          <div id="solar-savings-planner-card" className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 relative overflow-hidden group">
            {/* Top right corner glowing wash */}
            <div className="absolute -right-6 -top-6 w-24 h-24 blur-xl opacity-15 dark:opacity-5 rounded-full bg-amber-500 pointer-events-none group-hover:scale-150 transition-all duration-500" />
            
            {/* Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 relative z-10">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform duration-300">
                <Sun className="w-6 h-6 animate-spin" style={{ animationDuration: "15s" }} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Solar Savings Planner</h3>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                  Configure your rooftop space, monthly bill, and solar cell technology.
                </p>
              </div>
            </div>

            {/* State & City Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
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
                  ].map(st => {
                    const isActive = selectedState === st.code;
                    return (
                      <button
                        key={st.code}
                        onClick={() => setSelectedState(st.code)}
                        type="button"
                        className={`py-2.5 px-1 text-xs font-bold rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 ${
                          isActive
                            ? "border-primary-blue bg-blue-500/5 text-primary-blue shadow-[0_4px_20px_-5px_rgba(59,130,246,0.25)] dark:border-primary-green dark:bg-green-500/5 dark:text-primary-green dark:shadow-[0_4px_20px_-5px_rgba(16,185,129,0.25)]"
                            : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-705 text-slate-655 dark:text-slate-400"
                        }`}
                      >
                        <MapPin className={`w-4 h-4 transition-colors duration-300 ${
                          isActive
                            ? "text-primary-blue dark:text-primary-green animate-bounce"
                            : "text-slate-450 dark:text-slate-500"
                        }`} />
                        <span className="text-[10px] tracking-wide uppercase font-black">{st.short}</span>
                      </button>
                    );
                  })}
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
                  className="w-full bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-primary-blue dark:focus:border-primary-green hover:border-slate-350 dark:hover:border-slate-700 transition-all duration-200"
                >
                  <option value="pune">Pune (Maharashtra)</option>
                  <option value="bangalore">Bangalore (Karnataka)</option>
                  <option value="ahmedabad">Ahmedabad (Gujarat)</option>
                  <option value="lucknow">Lucknow (Uttar Pradesh)</option>
                </select>
              </div>
            </div>

            {/* Panel Technology Selection */}
            <div className="space-y-2 relative z-10">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider block">
                Solar Cell Technology
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSolarTech("topcon")}
                  type="button"
                  className={`p-4 rounded-2xl border text-left transition-all duration-300 relative flex flex-col justify-between cursor-pointer hover:scale-[1.02] active:scale-[0.98] group ${
                    solarTech === "topcon"
                      ? "border-primary-green bg-green-500/5 dark:bg-green-950/10 shadow-[0_4px_20px_-5px_rgba(16,185,129,0.25)]"
                      : "border-slate-200 bg-white dark:border-slate-850 dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className={`absolute top-2 right-2 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider transition-all ${
                    solarTech === "topcon"
                      ? "bg-green-500 text-slate-950 animate-pulse"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                  }`}>
                    Recommended ⭐
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5 mt-2.5">
                      <span>TOPCon Premium</span>
                      {solarTech === "topcon" && <ShieldCheck className="w-3.5 h-3.5 text-primary-green" />}
                    </div>
                    <div className="text-[10px] text-slate-550 dark:text-slate-450 mt-2 space-y-1">
                      <div>Efficiency: <span className="font-bold text-slate-750 dark:text-slate-200">26%</span></div>
                      <div>Lifespan: <span className="font-bold text-slate-750 dark:text-slate-200">30 Years</span></div>
                      <div className="text-amber-500 font-bold">★★★★★</div>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setSolarTech("mono-perc")}
                  type="button"
                  className={`p-4 rounded-2xl border text-left transition-all duration-300 relative flex flex-col justify-between cursor-pointer hover:scale-[1.02] active:scale-[0.98] group ${
                    solarTech === "mono-perc"
                      ? "border-primary-blue bg-blue-500/5 dark:bg-blue-950/10 shadow-[0_4px_20px_-5px_rgba(59,130,246,0.25)]"
                      : "border-slate-200 bg-white dark:border-slate-850 dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div>
                    <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5 mt-2.5">
                      <span>Mono-PERC Standard</span>
                      {solarTech === "mono-perc" && <ShieldCheck className="w-3.5 h-3.5 text-primary-blue" />}
                    </div>
                    <div className="text-[10px] text-slate-550 dark:text-slate-455 mt-2 space-y-1">
                      <div>Efficiency: <span className="font-bold text-slate-755 dark:text-slate-200">22.5%</span></div>
                      <div>Lifespan: <span className="font-bold text-slate-755 dark:text-slate-200">25 Years</span></div>
                      <div className="text-amber-500 font-bold">★★★★☆</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Input 1: Monthly Electricity Bill (₹) */}
            <div className="space-y-4 pt-2 relative z-10">
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
                  className="absolute top-0 bg-primary-blue text-white px-2.5 py-1 rounded-xl text-[10px] font-bold transform -translate-x-1/2 whitespace-nowrap shadow-[0_4px_12px_rgba(59,130,246,0.3)] transition-all duration-75 after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-primary-blue"
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
            <div className="space-y-4 pt-2 relative z-10">
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
                  className="absolute top-0 bg-amber-500 text-white px-2.5 py-1 rounded-xl text-[10px] font-bold transform -translate-x-1/2 whitespace-nowrap shadow-[0_4px_12px_rgba(245,158,11,0.3)] transition-all duration-75 after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-amber-500"
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
            <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-500 dark:text-slate-400 leading-relaxed space-y-1 relative z-10">
              <span className="font-bold text-slate-850 dark:text-slate-350 block mb-1">How Sizing Works:</span>
              <p>
                To offset a bill of <span className="font-semibold text-slate-700 dark:text-slate-300">₹<AnimatedNumber value={monthlyBill} formatter={(v) => Math.round(v).toLocaleString('en-IN')} /></span> in {getFullStateName(selectedState)}, your house requires a <span className="font-semibold text-slate-705 dark:text-slate-300"><AnimatedNumber value={kwNeededByUsage} formatter={(v) => v.toFixed(1)} /> kW</span> system.
              </p>
              <p>
                Capped by your roof area limit of <span className="font-semibold text-slate-705 dark:text-slate-300"><AnimatedNumber value={maxKwBySpace} formatter={(v) => v.toFixed(1)} /> kW</span> (100 sq ft per kW), the recommended sizing is <span className="font-semibold text-slate-705 dark:text-slate-300"><AnimatedNumber value={recommendedKw} formatter={(v) => v.toFixed(1)} /> kW</span>.
              </p>
            </div>

            {/* Detailed Net Metering breakdown */}
            <div className="p-4 bg-blue-50/10 dark:bg-slate-955/25 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-505 dark:text-slate-400 space-y-2 relative z-10">
              <span className="font-bold text-slate-855 dark:text-slate-300 block">Net Metering Billing Breakdown:</span>
              <div className="grid grid-cols-2 gap-y-1.5 text-left font-medium">
                <div className="text-slate-450 dark:text-slate-400">Estimated Monthly Consumption:</div>
                <div className="font-bold text-slate-800 dark:text-slate-205 text-right"><AnimatedNumber value={kwhNeeded} /> kWh (units)</div>
                <div className="text-slate-450 dark:text-slate-400">Estimated Monthly Solar Generation:</div>
                <div className="font-bold text-slate-800 dark:text-slate-205 text-right"><AnimatedNumber value={monthlyGeneration} /> kWh / month</div>
                <div className="text-slate-450 dark:text-slate-400">New Net Grid Consumption:</div>
                <div className="font-bold text-slate-800 dark:text-slate-250 text-right"><AnimatedNumber value={newUnits} /> kWh / month</div>
                <div className="text-slate-450 dark:text-slate-400">Marginal Slab Savings percentage:</div>
                <div className="font-extrabold text-primary-green text-right"><AnimatedNumber value={billCoveragePercent} />%</div>
                <div className="border-t border-slate-100 dark:border-slate-800 pt-1.5 mt-0.5 text-slate-700 dark:text-slate-300">Monthly Bill with Solar Panels:</div>
                <div className="font-black text-primary-blue dark:text-primary-green text-right border-t border-slate-100 dark:border-slate-800 pt-1.5 mt-0.5">₹<AnimatedNumber value={newBill} formatter={(v) => Math.round(v).toLocaleString('en-IN')} /></div>
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-550 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                *Calculated using actual DISCOM slab rates in the {getFullStateName(selectedState)} database.
              </div>
            </div>

            {/* Financial Modeling Assumptions (Always Open) */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/20 relative z-10">
              <div className="w-full flex justify-between items-center p-4 text-xs font-bold text-slate-700 dark:text-slate-305 border-b border-slate-200 dark:border-slate-800">
                <span className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-slate-400" />
                  Financial Modeling Assumptions
                </span>
              </div>

              <div className="p-4 space-y-4 text-xs bg-white dark:bg-slate-900/50">
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
                    className="premium-slider w-full cursor-pointer h-2 rounded-full appearance-none outline-none"
                    style={{
                      background: activeTheme === "dark"
                        ? `linear-gradient(to right, #10b981 0%, #10b981 ${(tariffIncrease / 15) * 100}%, #1e293b ${(tariffIncrease / 15) * 100}%, #1e293b 100%)`
                        : `linear-gradient(to right, #2563eb 0%, #2563eb ${(tariffIncrease / 15) * 100}%, #e2e8f0 ${(tariffIncrease / 15) * 100}%, #e2e8f0 100%)`
                    }}
                  />
                  <span className="text-[10px] text-slate-400 block font-medium">Typical range: 3% to 6% per year as utility costs rise.</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between font-semibold text-slate-655 dark:text-slate-400">
                    <span>Annual Module Degradation</span>
                    <span className="text-amber-505 font-bold text-amber-500">{panelDegradation}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="2.0"
                    step="0.1"
                    value={panelDegradation}
                    onChange={(e) => setPanelDegradation(parseFloat(e.target.value))}
                    className="premium-slider w-full cursor-pointer h-2 rounded-full appearance-none outline-none"
                    style={{
                      background: activeTheme === "dark"
                        ? `linear-gradient(to right, #f59e0b 0%, #f59e0b ${((panelDegradation - 0.1) / 1.9) * 100}%, #1e293b ${((panelDegradation - 0.1) / 1.9) * 100}%, #1e293b 100%)`
                        : `linear-gradient(to right, #f59e0b 0%, #f59e0b ${((panelDegradation - 0.1) / 1.9) * 100}%, #e2e8f0 ${((panelDegradation - 0.1) / 1.9) * 100}%, #e2e8f0 100%)`
                    }}
                  />
                  <span className="text-[10px] text-slate-400 block font-medium">Premium panels (TOPCon) degrade slower (~0.4% - 0.8%) than Mono-PERC (~0.8% - 1.2%).</span>
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
                    className="premium-slider w-full cursor-pointer h-2 rounded-full appearance-none outline-none"
                    style={{
                      background: activeTheme === "dark"
                        ? `linear-gradient(to right, #10b981 0%, #10b981 ${(maintenanceRate / 5) * 100}%, #1e293b ${(maintenanceRate / 5) * 100}%, #1e293b 100%)`
                        : `linear-gradient(to right, #2563eb 0%, #2563eb ${(maintenanceRate / 5) * 100}%, #e2e8f0 ${(maintenanceRate / 5) * 100}%, #e2e8f0 100%)`
                    }}
                  />
                  <span className="text-[10px] text-slate-400 block font-medium">Inverter servicing, panel cleaning, and wiring maintenance.</span>
                </div>
              </div>
            </div>

            {/* AI Solar Advisor Widget */}
            <div className="bg-slate-50 dark:bg-slate-950/40 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 text-left relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-lg">🤖</span>
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Ask Solar AI Advisor</h4>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-405 leading-normal">
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
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-primary-blue dark:hover:border-primary-green hover:shadow-[0_4px_12px_rgba(59,130,246,0.15)] text-slate-700 dark:text-slate-300 text-left transition-all duration-200 cursor-pointer hover:scale-[1.02] leading-normal"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Panel details sub-section */}
          <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 text-xs text-left space-y-1 shadow-sm relative overflow-hidden group hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.15)] transition-all duration-300">
            <div className="absolute -right-4 -top-4 w-16 h-16 blur-lg opacity-15 dark:opacity-5 rounded-full bg-emerald-500 pointer-events-none group-hover:scale-150 transition-all duration-500" />
            <span className="font-bold text-slate-855 dark:text-slate-300 block mb-1 relative z-10">Rooftop Module Details:</span>
            <div className="grid grid-cols-2 gap-y-1 text-slate-500 dark:text-slate-400 relative z-10">
              <div>Modules Needed:</div>
              <div className="font-bold text-slate-800 dark:text-slate-200 text-right">{panelsNeeded} panels ({panelWattage}W)</div>
              <div>Single Panel Dimensions:</div>
              <div className="font-bold text-slate-800 dark:text-slate-200 text-right">{panelSizeLabel}</div>
              <div>Single Panel Weight:</div>
              <div className="font-bold text-slate-800 dark:text-slate-200 text-right">~{panelWeight} kg</div>
              <div>Internal Efficiency:</div>
              <div className="font-extrabold text-primary-green text-right">
                {panelEfficiency.toFixed(1)}%
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: ROI Outputs */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-6 space-y-6"
        >
          <div className="space-y-6 relative">

            {/* 1. Centerpiece Hero Result Card */}
            <div 
              className="p-6 rounded-3xl border border-emerald-500/20 dark:border-emerald-500/30 flex flex-col justify-between min-h-[220px] bg-gradient-to-br from-emerald-500/10 via-sky-500/10 to-teal-500/5 dark:from-emerald-950/20 dark:via-sky-950/20 dark:to-teal-950/10 shadow-sm relative overflow-hidden text-left group hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.25)] hover:border-emerald-500/40 transition-all duration-300"
            >
              {/* Glowing decorative background elements */}
              <div className="absolute -right-6 -top-6 w-32 h-32 blur-2xl opacity-30 dark:opacity-20 rounded-full bg-emerald-500 pointer-events-none group-hover:scale-125 transition-all duration-500" />
              <div className="absolute -left-10 -bottom-10 w-24 h-24 blur-xl opacity-20 dark:opacity-10 rounded-full bg-sky-500 pointer-events-none group-hover:scale-125 transition-all duration-500" />
              
              <div className="space-y-1 relative z-10">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-primary-green flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 animate-spin-slow" />
                  <span>Solar Recommendation</span>
                </span>
                <h3 className="text-3xl font-display font-black text-slate-900 dark:text-white mt-1.5 tracking-tight">
                  <AnimatedNumber value={recommendedKw} formatter={(v) => v.toFixed(1)} /> kW System
                </h3>
                <div className="text-lg font-black text-emerald-600 dark:text-primary-green mt-2.5 flex items-center gap-1">
                  ₹<AnimatedNumber value={firstYearSavings} formatter={(v) => Math.round(v).toLocaleString('en-IN')} /> Saved Every Year
                </div>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                  Payback in <AnimatedNumber value={paybackPeriodVal} formatter={(v) => v.toFixed(1)} /> Years
                </div>
              </div>
              
              <button 
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("she_trigger_chat", { 
                    detail: { message: `I want to install the recommended ${recommendedKw.toFixed(1)} kW Solar System. What are the installation steps, required solar panel brands, and subsidy approval procedures?` } 
                  }));
                }}
                type="button"
                className="mt-4 px-6 h-11 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider transition-all hover:scale-105 active:scale-95 w-fit shadow-md hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer relative z-10"
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
            <div className={`p-5 rounded-3xl border ${conclusion.colorClass} space-y-4 text-left shadow-sm relative overflow-hidden group`}>
              <div className="absolute -right-4 -top-4 w-16 h-16 blur-lg opacity-15 dark:opacity-10 rounded-full bg-emerald-500 pointer-events-none group-hover:scale-150 transition-all duration-500" />
              <div className="flex justify-between items-center relative z-10">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-555">
                  Feasibility Review
                </span>
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wide ${conclusion.colorClass}`}>
                  {conclusion.badge}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs font-semibold relative z-10">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Financial Score</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-white">
                    <AnimatedNumber value={Math.round(100 - (paybackPeriodVal * 3))} />%
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Expected Profit</span>
                  <span className="text-sm font-extrabold text-primary-green">
                    ₹<AnimatedNumber value={twentyFiveYearNetSavings} formatter={(v) => Math.round(v).toLocaleString('en-IN')} />
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Break-Even</span>
                  <span className="text-sm font-extrabold text-primary-blue dark:text-blue-400">
                    <AnimatedNumber value={paybackPeriodVal} formatter={(v) => v.toFixed(1)} /> Years
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Risk Level</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-white">{paybackPeriodVal > 10 ? "Medium" : "Low"}</span>
                </div>
              </div>
            </div>

            {/* 4. Stripe/Tesla style metric grid */}
            <div className="grid grid-cols-2 gap-4 text-left">
              {/* Card 1: Investment */}
              <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col justify-between h-[115px] shadow-sm relative overflow-hidden group hover:shadow-[0_0_20px_-5px_rgba(59,130,246,0.15)] hover:border-blue-500/20 transition-all duration-300">
                <div className="absolute -right-4 -top-4 w-16 h-16 blur-lg opacity-15 dark:opacity-10 rounded-full bg-blue-500 pointer-events-none group-hover:scale-150 transition-all duration-500" />
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-555 uppercase tracking-widest relative z-10">💰 Investment</span>
                <p className="text-xl font-display font-black text-slate-900 dark:text-white leading-tight mt-2 relative z-10">
                  ₹<AnimatedNumber value={installationCost} formatter={(v) => Math.round(v).toLocaleString('en-IN')} />
                </p>
                <span className="text-[9px] text-slate-455 dark:text-slate-500 block relative z-10">After PM Surya Ghar Subsidy</span>
              </div>

              {/* Card 2: Annual Return */}
              <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col justify-between h-[115px] shadow-sm relative overflow-hidden group hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.15)] hover:border-emerald-500/20 transition-all duration-300">
                <div className="absolute -right-4 -top-4 w-16 h-16 blur-lg opacity-15 dark:opacity-10 rounded-full bg-emerald-500 pointer-events-none group-hover:scale-150 transition-all duration-500" />
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-555 uppercase tracking-widest relative z-10">📈 Annual Return</span>
                <p className="text-xl font-display font-black text-primary-green leading-tight mt-2 relative z-10">
                  ₹<AnimatedNumber value={firstYearSavings} formatter={(v) => Math.round(v).toLocaleString('en-IN')} />
                </p>
                <span className="text-[9px] text-slate-455 dark:text-slate-500 block relative z-10">Year 1 savings estimate</span>
              </div>

              {/* Card 3: Monthly Savings */}
              <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col justify-between h-[115px] shadow-sm relative overflow-hidden group hover:shadow-[0_0_20px_-5px_rgba(59,130,246,0.15)] hover:border-cyan-500/20 transition-all duration-300">
                <div className="absolute -right-4 -top-4 w-16 h-16 blur-lg opacity-15 dark:opacity-10 rounded-full bg-cyan-500 pointer-events-none group-hover:scale-150 transition-all duration-500" />
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-555 uppercase tracking-widest relative z-10">⚡ Monthly Savings</span>
                <p className="text-xl font-display font-black text-primary-blue dark:text-blue-400 leading-tight mt-2 relative z-10">
                  ₹<AnimatedNumber value={Math.round(firstYearSavings / 12)} formatter={(v) => Math.round(v).toLocaleString('en-IN')} />
                </p>
                <span className="text-[9px] text-slate-455 dark:text-slate-500 block relative z-10">Estimated grid bill cut</span>
              </div>

              {/* Card 4: ROI */}
              <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col justify-between h-[115px] shadow-sm relative overflow-hidden group hover:shadow-[0_0_20px_-5px_rgba(245,158,11,0.15)] hover:border-amber-500/20 transition-all duration-300">
                <div className="absolute -right-4 -top-4 w-16 h-16 blur-lg opacity-15 dark:opacity-10 rounded-full bg-amber-500 pointer-events-none group-hover:scale-150 transition-all duration-500" />
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-555 uppercase tracking-widest relative z-10">🏆 ROI</span>
                <p className="text-xl font-display font-black text-amber-500 leading-tight mt-2 relative z-10">
                  <AnimatedNumber value={installationCost > 0 ? ((twentyFiveYearNetSavings + installationCost) / installationCost) : 0.0} formatter={(v) => v.toFixed(1)} />x
                </p>
                <span className="text-[9px] text-slate-455 dark:text-slate-500 block relative z-10">25-Year cumulative yield</span>
              </div>
            </div>

            {/* 5. Lifetime Savings Timeline */}
            {renderLifetimeTimeline()}

            {/* 6. Environmental Offset Card */}
            <div className="bg-gradient-to-br from-green-500/5 via-emerald-500/10 to-teal-500/5 dark:from-emerald-950/10 dark:via-emerald-950/20 dark:to-teal-950/10 p-6 rounded-3xl border border-green-500/20 dark:border-green-500/30 space-y-4 text-left shadow-sm relative overflow-hidden group hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)] transition-all duration-300">
              <div className="absolute -right-4 -top-4 w-16 h-16 blur-lg opacity-25 dark:opacity-15 rounded-full bg-emerald-500 pointer-events-none group-hover:scale-150 transition-all duration-500" />
              <div className="flex items-center gap-2 relative z-10">
                <span className="text-lg">🌱</span>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-650 dark:text-primary-green">Carbon Reduction</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 relative z-10">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase block font-bold">Annual Offset</span>
                  <p className="text-xl font-black text-slate-900 dark:text-white">
                    <AnimatedNumber value={co2Reduction} formatter={(v) => v.toFixed(1)} /> Tons CO₂
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase block font-bold">Tree Equivalent</span>
                  <p className="text-xl font-black text-primary-green flex items-center gap-1">
                    🌳 <AnimatedNumber value={treesEquivalent} /> Trees
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-slate-550 dark:text-slate-450 leading-normal border-t border-slate-100 dark:border-slate-800/80 pt-2.5 relative z-10">
                Calculated using grid displacement factors. Offsets your domestic coal power generation footprint over 25 years.
              </p>
            </div>

            {/* No Solar vs Solar Installed Side-by-Side Comparison */}
            <div className="bg-slate-50 dark:bg-slate-955/45 p-5 rounded-3xl border border-slate-200 dark:border-slate-800/80 space-y-4 text-left shadow-sm relative overflow-hidden group hover:shadow-[0_0_20px_-5px_rgba(59,130,246,0.15)] transition-all duration-300">
              <div className="absolute -right-4 -top-4 w-16 h-16 blur-lg opacity-15 dark:opacity-5 rounded-full bg-blue-500 pointer-events-none group-hover:scale-150 transition-all duration-500" />
              <h4 className="text-xs font-black text-slate-905 dark:text-white uppercase tracking-wider relative z-10">
                25-Year Lifetime Cost Comparison
              </h4>
              <div className="grid grid-cols-2 gap-4 relative z-10">
                <div className="space-y-1 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">No Solar (Grid Only)</span>
                  <p className="text-base font-extrabold text-slate-850 dark:text-white mt-1">
                    ₹<AnimatedNumber value={totalNoSolarCost25Years} formatter={(v) => Math.round(v).toLocaleString('en-IN')} />
                  </p>
                  <span className="text-[9px] text-slate-400 dark:text-slate-550 block">Bills inflated at {tariffIncrease}% p.a.</span>
                </div>
                <div className="space-y-1 p-3.5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-colors">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-primary-green uppercase font-black">Solar Installed</span>
                  <p className="text-base font-extrabold text-primary-green mt-1">
                    ₹<AnimatedNumber value={totalSolarCost25Years} formatter={(v) => Math.round(v).toLocaleString('en-IN')} />
                  </p>
                  <span className="text-[9px] text-slate-400 dark:text-slate-555 block">System cost + bills + {maintenanceRate}% maint.</span>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl flex items-center justify-between text-xs relative z-10 hover:border-emerald-500/20 transition-colors">
                <span className="font-semibold text-slate-550 dark:text-slate-400">Total Net Lifetime Savings:</span>
                <span className="font-extrabold text-primary-green text-sm">
                  ₹<AnimatedNumber value={twentyFiveYearNetSavings} formatter={(v) => Math.round(v).toLocaleString('en-IN')} />
                </span>
              </div>
            </div>

            {/* Security details note */}
            <div className="flex items-center gap-2 text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span>Slab calculations match active {getFullStateName(selectedState)} net metering rules.</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Sizing and Tech Guide reference section */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 relative overflow-hidden"
      >
        {/* Top decorative glow */}
        <div className="absolute -right-16 -top-16 w-36 h-36 blur-3xl opacity-10 rounded-full bg-amber-500 pointer-events-none" />

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 rounded-2xl shrink-0 shadow-sm">
              <Sun className="w-5.5 h-5.5 animate-pulse" />
            </div>
            <div className="text-left">
              <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                Rooftop Solar Quick Sizing Reference
              </h3>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                Standard guidelines for planning domestic systems in India based on 540W solar modules.
              </p>
            </div>
          </div>
          <div className="self-start sm:self-center px-3 py-1 bg-amber-50 dark:bg-amber-955/40 text-amber-600 dark:text-amber-400 rounded-xl text-[10px] font-black border border-amber-100 dark:border-amber-900/50 uppercase tracking-wider">
            2026 Guidelines
          </div>
        </div>

        {/* Sizing Grid Container */}
        <div className="space-y-3.5">
          {/* Header Row (Visible on Desktop) */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider text-[9px] border-b border-slate-100 dark:border-slate-800/60 text-left">
            <div className="col-span-3 pl-2">Solar System Size</div>
            <div className="col-span-2">Number of Panels (540W)</div>
            <div className="col-span-2">Shadow-Free Space Needed</div>
            <div className="col-span-2">Cost in Pune (with Subsidy)*</div>
            <div className="col-span-3 text-right">25-Yr Expected Savings*</div>
          </div>

          {/* Cards List */}
          <div className="space-y-2.5">
            {[
              { size: "1 kW", panels: "~2 panels", space: "100 sq ft", cost: "~₹60,000", savings: "~₹5.3 Lakhs", color: "bg-sky-500", shadow: "shadow-[0_0_8px_rgba(14,165,233,0.3)]", badge: "Standard", targetBill: 1500, targetSpace: 100 },
              { size: "2 kW", panels: "~4 panels", space: "200 sq ft", cost: "~₹1.15 Lakh", savings: "~₹10.74 Lakhs", color: "bg-sky-500", shadow: "shadow-[0_0_8px_rgba(14,165,233,0.3)]", badge: "Standard", targetBill: 3000, targetSpace: 200 },
              { size: "3 kW", panels: "~6 panels", space: "300 sq ft", cost: "~₹1.32 Lakh", savings: "~₹16.11 Lakhs", color: "bg-amber-500", shadow: "shadow-[0_0_8px_rgba(245,158,11,0.3)]", badge: "Popular", targetBill: 4500, targetSpace: 300 },
              { size: "4 kW", panels: "~8 panels", space: "450 sq ft", cost: "~₹1.77 Lakh", savings: "~₹21.48 Lakhs", color: "bg-amber-500", shadow: "shadow-[0_0_8px_rgba(245,158,11,0.3)]", badge: "Medium Home", targetBill: 6000, targetSpace: 400 },
              { size: "5 kW", panels: "~10 panels", space: "500 sq ft", cost: "~₹2.32 Lakh", savings: "~₹33.46 Lakhs", color: "bg-emerald-500", shadow: "shadow-[0_0_8px_rgba(16,185,129,0.3)]", badge: "Heavy Usage", targetBill: 7500, targetSpace: 500 },
              { size: "10 kW", panels: "~19 panels", space: "1,000 sq ft", cost: "~₹4.87 Lakh", savings: "~₹66.92 Lakhs", color: "bg-indigo-500", shadow: "shadow-[0_0_8px_rgba(99,102,241,0.3)]", badge: "Commercial", targetBill: 15000, targetSpace: 1000 }
            ].map((row, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.995 }}
                onClick={() => handleSelectReferenceSize(row.targetBill, row.targetSpace)}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800/85 bg-white/40 dark:bg-slate-950/20 hover:bg-white dark:hover:bg-slate-900/60 hover:border-amber-500/40 dark:hover:border-amber-500/30 hover:shadow-md hover:shadow-slate-200/10 dark:hover:shadow-black/10 transition-all duration-300 cursor-pointer group/row grid grid-cols-12 gap-3.5 items-center relative overflow-hidden text-left"
              >
                {/* Glowing left capacity stripe */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${row.color} ${row.shadow} transition-all duration-300`} />
                
                {/* 1. Size column */}
                <div className="col-span-12 md:col-span-3 pl-3.5 flex items-center gap-2.5">
                  <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200 tabular-nums">
                    {row.size}
                  </span>
                  <span className="text-[8px] font-black text-slate-450 dark:text-slate-500 uppercase bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200/20 dark:border-slate-700/30 tracking-wider">
                    {row.badge}
                  </span>
                </div>

                {/* 2. Panels column */}
                <div className="col-span-6 md:col-span-2 flex items-center gap-2 text-slate-700 dark:text-slate-350 font-semibold text-xs">
                  <Layers className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                  <span>{row.panels}</span>
                </div>

                {/* 3. Space column */}
                <div className="col-span-6 md:col-span-2 flex items-center gap-2 text-slate-700 dark:text-slate-350 font-semibold text-xs">
                  <Home className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                  <span>{row.space}</span>
                </div>

                {/* 4. Cost column */}
                <div className="col-span-6 md:col-span-2 flex items-center gap-1">
                  <span className="text-[9px] font-bold text-slate-450 md:hidden uppercase mr-1">Cost:</span>
                  <span className="font-extrabold text-slate-850 dark:text-slate-200 tabular-nums text-xs">
                    {row.cost}
                  </span>
                </div>

                {/* 5. Savings column */}
                <div className="col-span-6 md:col-span-3 flex justify-end items-center">
                  <div className="inline-flex items-center gap-1 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-primary-green px-3 py-1.5 rounded-xl border border-emerald-500/20 dark:border-emerald-500/30 text-xs font-black shadow-sm group-hover/row:shadow-md transition-shadow duration-200">
                    <span>{row.savings}</span>
                    <ArrowUpRight className="w-4 h-4 text-emerald-500 dark:text-primary-green shrink-0" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="text-[10px] text-slate-400 dark:text-slate-555 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4 text-left">
          *Costs are based on SolarSquare base variant starting prices as of March 2026. Savings calculation considers a 3% annual tariff escalation rate and a 1% annual plant degradation rate. Actual costs and generation vary by configuration and local DISCOM policies.
        </div>
      </motion.div>

      {/* Solar Return on Investment Analytics Charts */}
      <motion.div variants={itemVariants}>
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
      </motion.div>
    </motion.div>
  );
};
