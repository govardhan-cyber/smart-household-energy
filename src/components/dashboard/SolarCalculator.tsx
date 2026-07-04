import React, { useState, useEffect } from "react";
import { Sun, ShieldCheck, HelpCircle, IndianRupee, Settings, MapPin, Home, Zap, Building2, Leaf, Info, Layers, ArrowUpRight, Scale, Ruler, MessageSquare, ArrowRight, Sparkles } from "lucide-react";
import { calculateSolarROI } from "../../utils/solarCalculator";
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
        <motion.button
          onClick={() => {
            window.dispatchEvent(new CustomEvent("she_trigger_chat", { 
              detail: { message: `Analyze my solar readiness parameters. My roof is ${roofArea} sq ft in ${stateName}. Explain why this is a good fit.` } 
            }));
          }}
          whileHover={{ y: -3, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="button"
          className="w-full p-3.5 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 dark:from-emerald-900/10 dark:to-teal-900/5 border border-emerald-500/15 dark:border-emerald-500/20 rounded-2xl flex items-center justify-between gap-3 text-left cursor-pointer transition-colors duration-200 hover:border-emerald-500/35 hover:shadow-[0_4px_20px_rgba(16,185,129,0.06)] group/fit relative overflow-hidden"
        >
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-primary-green rounded-xl shrink-0 shadow-sm">
              <Leaf className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-400 block uppercase tracking-wider">
                Why it's a good fit
              </span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-snug block mt-0.5">
                Ample roof space & high yield for maximum savings.
              </span>
            </div>
          </div>
          <div className="p-1.5 bg-emerald-500/10 text-emerald-600 dark:text-primary-green rounded-lg shrink-0 group-hover/fit:bg-emerald-500 group-hover/fit:text-white transition-colors duration-250">
            <ArrowRight className="w-3.5 h-3.5 group-hover/fit:translate-x-0.5 transition-transform duration-250" />
          </div>
        </motion.button>

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
      staggerChildren: 0.09,
      delayChildren: 0.04
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 28
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

  useEffect(() => {
    if (selectedState === "ka") {
      setSelectedCity("bangalore");
    } else {
      setSelectedCity("pune");
    }
  }, [selectedState]);

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

  // New Hybrid Solar, Battery Storage, Net Metering Policy and TOD Load Shifting states
  const [isHybrid, setIsHybrid] = useState<boolean>(false);
  const [batteryKwh, setBatteryKwh] = useState<number>(5);
  const [batteryType, setBatteryType] = useState<"lithium" | "lead-acid">("lithium");
  const netMeteringPolicy = "net-metering";
  const buybackRate = 3.5;
  const todShiftPercent = 0;
  const [showTariffExpl, setShowTariffExpl] = useState<boolean>(false);
  const [showDegradationExpl, setShowDegradationExpl] = useState<boolean>(false);
  const [showMaintenanceExpl, setShowMaintenanceExpl] = useState<boolean>(false);



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

  const shadedPanelsCount = Object.values(shadedPanels).filter(Boolean).length;

  const roiOutput = calculateSolarROI({
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
  });

  const {
    kwhNeeded,
    recommendedKw,
    totalUpfrontInvestment,
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
  } = roiOutput;

  // Derived sizing diagnostics (for JSX display)
  const kwNeededByUsage = kwhNeeded / 120;
  const maxKwBySpace = roofArea / 100;
  // Derived net-metering values (for JSX display)
  const newUnits = Math.max(0, kwhNeeded - monthlyGeneration);
  const newBill = Math.max(0, oldBill - monthlySavings);

  // Technology details for specifications section in JSX
  const panelWattage = solarTech === "topcon" ? 580 : 500;
  const panelEfficiency = solarTech === "topcon" ? 26 : 22.5;
  const panelWeight = solarTech === "topcon" ? 32 : 27;
  const panelSizeLabel = solarTech === "topcon" ? "~2.1 m × 1.1 m" : "~2.0 m × 1.0 m";

  // Cache planner outputs to local storage when configurations change
  useEffect(() => {
    if (user?.uid) {
      const cacheKey = `she_solar_cache_${user.uid}`;
      const solarCache = {
        recommendedKw,
        installationCost: totalUpfrontInvestment,
        monthlyGeneration,
        monthlySavings,
        paybackPeriodVal,
        panelsNeeded,
        tenYearNetSavings,
        twentyFiveYearNetSavings,
        selectedCity,
        solarTech,
        roofArea,
        monthlyBillInput: monthlyBill,
        isHybrid,
        batteryKwh,
        batteryType,
        netMeteringPolicy,
        buybackRate,
        todShiftPercent
      };
      localStorage.setItem(cacheKey, JSON.stringify(solarCache));
    }
  }, [user?.uid, recommendedKw, totalUpfrontInvestment, monthlyGeneration, monthlySavings, paybackPeriodVal, panelsNeeded, tenYearNetSavings, twentyFiveYearNetSavings, selectedCity, solarTech, roofArea, monthlyBill, isHybrid, batteryKwh, batteryType, netMeteringPolicy, buybackRate, todShiftPercent]);

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
      <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md p-4 rounded-3xl border border-slate-200/60 dark:border-slate-800/50 text-center relative overflow-hidden flex flex-col justify-between shadow-sm space-y-3 group hover:shadow-md hover:border-indigo-500/30 transition-all duration-300 [backface-visibility:hidden] [transform-style:preserve-3d]">
        {/* Top right corner glowing wash */}
        <div className="absolute -right-6 -top-6 w-24 h-24 blur-xl opacity-20 dark:opacity-10 rounded-full bg-indigo-500 pointer-events-none group-hover:scale-150 transition-all duration-500" />
        
        {/* Title */}
        <div className="flex justify-between items-center text-left relative z-10">
          <div>
            <span className="text-[9px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest block mb-0.5">
              ROOFTOP PLACEMENT MAP
            </span>
            <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase font-display">
              Isometric Rooftop Planner
            </h4>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`flex h-1.5 w-1.5 rounded-full ${
              systemOutputPercent >= 90
                ? "bg-emerald-500"
                : systemOutputPercent >= 70
                ? "bg-amber-500"
                : "bg-rose-500"
            } animate-pulse`} />
            <span className={`text-[9.5px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider shadow-sm backdrop-blur-sm ${
              systemOutputPercent >= 90
                ? "bg-green-500/10 border-green-500/20 text-primary-green"
                : systemOutputPercent >= 70
                ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                : "bg-red-500/10 border-red-500/20 text-red-500"
            }`}>
              Yield: {systemOutputPercent}%
            </span>
          </div>
        </div>

        {/* SVG Canvas */}
        <div className="flex-1 flex items-center justify-center py-2 bg-slate-50/40 dark:bg-slate-950/40 backdrop-blur-sm rounded-[20px] border border-slate-200/40 dark:border-slate-800/30 relative min-h-[125px] overflow-hidden shadow-inner">
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
            <defs>
              {/* Technical Blueprint Grid Pattern */}
              <pattern id="blueprintGrid" width="16" height="16" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="0.75" fill="currentColor" className="text-slate-300/40 dark:text-slate-700/30" />
              </pattern>
              
              {/* Glowing Gradient for Active Sun */}
              <radialGradient id="sunRadial" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFFBEB" />
                <stop offset="20%" stopColor="#FDE68A" />
                <stop offset="100%" stopColor="#F59E0B" />
              </radialGradient>

              {/* Ambient Shadow Filter */}
              <filter id="sunFilter" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Front Wall Blueprint Gradient */}
              <linearGradient id="frontWallGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(226, 232, 240, 0.25)" />
                <stop offset="100%" stopColor="rgba(148, 163, 184, 0.03)" />
              </linearGradient>

              {/* Side Wall Blueprint Gradient */}
              <linearGradient id="sideWallGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgba(203, 213, 225, 0.2)" />
                <stop offset="100%" stopColor="rgba(71, 85, 105, 0.02)" />
              </linearGradient>

              {/* Roof Blueprint Gradient */}
              <linearGradient id="roofGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(99, 102, 241, 0.16)" />
                <stop offset="100%" stopColor="rgba(99, 102, 241, 0.02)" />
              </linearGradient>

              {/* Active Monocrystalline Panel Gradient */}
              <linearGradient id="activePanel" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#312e81" />
                <stop offset="40%" stopColor="#4338ca" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>

              {/* Shaded Obsidian Panel Gradient */}
              <linearGradient id="shadedPanel" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>

              {/* Window Glass Gradient */}
              <linearGradient id="windowGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgba(6, 182, 212, 0.3)" />
                <stop offset="100%" stopColor="rgba(6, 182, 212, 0.04)" />
              </linearGradient>
            </defs>

            {/* Grid background layer */}
            <rect width="400" height="180" fill="url(#blueprintGrid)" rx="16" />

            {/* Dotted radiation rays from Sun to Roof corners & center */}
            <line x1={sunX} y1={sunY} x2="120" y2={(y_front + y_back) / 2} stroke="rgba(245, 158, 11, 0.18)" strokeWidth="0.8" strokeDasharray="3 3" className="transition-all duration-500" />
            <line x1={sunX} y1={sunY} x2="200" y2={(y_front + y_back) / 2} stroke="rgba(245, 158, 11, 0.22)" strokeWidth="1" strokeDasharray="3 3" className="transition-all duration-500" />
            <line x1={sunX} y1={sunY} x2="280" y2={(y_front + y_back) / 2} stroke="rgba(245, 158, 11, 0.18)" strokeWidth="0.8" strokeDasharray="3 3" className="transition-all duration-500" />

            {/* Sun */}
            <circle cx={sunX} cy={sunY} r="8" fill="url(#sunRadial)" filter="url(#sunFilter)" className="transition-all duration-500" />
            <circle cx={sunX} cy={sunY} r="13" fill="none" stroke="#F59E0B" strokeWidth="1.2" strokeDasharray="4 4" className="animate-spin transition-all duration-500" style={{ animationDuration: "16s" }} />

            {/* House structure */}
            {/* Front Wall */}
            <polygon 
              points={`60,${y_front} 240,${y_front} 240,165 60,165`} 
              fill="url(#frontWallGrad)"
              className="stroke-slate-300/80 dark:stroke-slate-700/60 stroke-[1.2px] transition-all duration-500" 
            />
            {/* Side Wall */}
            <polygon 
              points={`240,${y_front} 340,${y_back} 340,120 240,165`} 
              fill="url(#sideWallGrad)"
              className="stroke-slate-300/80 dark:stroke-slate-700/60 stroke-[1.2px] transition-all duration-500" 
            />
            
            {/* Door */}
            <rect x="130" y="125" width="40" height="40" rx="4" className="fill-slate-200/30 dark:fill-slate-905/40 stroke-slate-350 dark:stroke-slate-750 stroke-[1.2px]" />
            <circle cx="162" cy="145" r="1.5" fill="#B45309" />

            {/* Window */}
            <polygon 
              points="270,125 310,110 310,95 270,110" 
              fill="url(#windowGrad)"
              className="stroke-cyan-500/40 dark:stroke-cyan-500/20 stroke-[1px]" 
            />
            <line x1="290" y1="117.5" x2="290" y2="102.5" stroke="rgba(34, 211, 238, 0.4)" strokeWidth="0.8" />

            {/* Roof plane */}
            <polygon 
              points={`60,${y_front} 160,${y_back} 340,${y_back} 240,${y_front}`} 
              fill="url(#roofGrad)"
              className="stroke-indigo-400/40 dark:stroke-indigo-500/30 stroke-[2px] transition-all duration-500" 
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
                  fill={isShaded ? "url(#shadedPanel)" : "url(#activePanel)"}
                  className={`cursor-pointer transition-all duration-300 stroke-[1.2px] ${
                    isShaded
                      ? "stroke-rose-500/50 hover:stroke-rose-400"
                      : "stroke-indigo-300/40 dark:stroke-indigo-400/40 hover:stroke-cyan-300"
                  }`}
                />
              );
            })}
          </svg>

          {/* Hint Overlay (optimized with whitespace-nowrap and glass design to prevent text wrapping layout bugs) */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-slate-900/80 dark:bg-slate-950/70 backdrop-blur-md border border-white/10 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full pointer-events-none tracking-wide select-none whitespace-nowrap z-20 shadow-sm">
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
                  className={`flex-1 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    roofTilt === "inclined"
                      ? "bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-emerald-500 dark:to-teal-500 text-white shadow-sm shadow-indigo-500/25 dark:shadow-emerald-500/20 transform scale-[1.02]"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/30 dark:hover:bg-slate-800/40"
                  }`}
                >
                  Pitched (15°)
                </button>
                <button
                  onClick={() => setRoofTilt("flat")}
                  className={`flex-1 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    roofTilt === "flat"
                      ? "bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-emerald-500 dark:to-teal-500 text-white shadow-sm shadow-indigo-500/25 dark:shadow-emerald-500/20 transform scale-[1.02]"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/30 dark:hover:bg-slate-800/40"
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
                  className={`flex-1 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    roofOrientation === "south"
                      ? "bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-emerald-500 dark:to-teal-500 text-white shadow-sm shadow-indigo-500/25 dark:shadow-emerald-500/20 transform scale-[1.02]"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/30 dark:hover:bg-slate-800/40"
                  }`}
                >
                  South
                </button>
                <button
                  onClick={() => setRoofOrientation("east")}
                  className={`flex-1 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    roofOrientation === "east"
                      ? "bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-emerald-500 dark:to-teal-500 text-white shadow-sm shadow-indigo-500/25 dark:shadow-emerald-500/20 transform scale-[1.02]"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/30 dark:hover:bg-slate-800/40"
                  }`}
                >
                  East
                </button>
                <button
                  onClick={() => setRoofOrientation("west")}
                  className={`flex-1 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    roofOrientation === "west"
                      ? "bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-emerald-500 dark:to-teal-500 text-white shadow-sm shadow-indigo-500/25 dark:shadow-emerald-500/20 transform scale-[1.02]"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/30 dark:hover:bg-slate-800/40"
                  }`}
                >
                  West
                </button>
              </div>
            </div>
          </div>
          
          {/* Glass Badges for Stats Row */}
          <div className="flex justify-between items-center gap-2 mt-1 font-display">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100/50 dark:bg-slate-950/30 rounded-xl border border-slate-200/30 dark:border-slate-850/40 text-[9px] font-bold text-slate-500 dark:text-slate-400 select-none">
              <Layers className="w-3.5 h-3.5 text-indigo-500 dark:text-primary-green shrink-0" />
              <span>Panels: <span className="font-extrabold text-slate-700 dark:text-white">{panelsNeeded}</span> ({shadedCount} Shaded)</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100/50 dark:bg-slate-950/30 rounded-xl border border-slate-200/30 dark:border-slate-850/40 text-[9px] font-bold text-slate-500 dark:text-slate-400 select-none">
              <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0 animate-pulse" />
              <span>Coverage: <span className="font-extrabold text-slate-700 dark:text-white">{spaceUtilizedPercent}%</span></span>
            </div>
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
    const yr25 = twentyFiveYearNetSavings + totalUpfrontInvestment;

    return (
      <div className="backdrop-blur-md bg-white/70 dark:bg-slate-950/45 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/60 shadow-[0_8px_32px_rgba(0,0,0,0.03)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.2)] space-y-5 text-left relative overflow-hidden group hover:border-slate-350 dark:hover:border-slate-700 transition-all duration-300">
        {/* Specular Reflective Gloss Sheen */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000 ease-out pointer-events-none" />
        <div className="absolute -right-6 -top-6 w-24 h-24 blur-xl opacity-20 dark:opacity-10 rounded-full bg-blue-500 pointer-events-none group-hover:scale-150 transition-all duration-500" />
        
        <div className="relative z-10">
          <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-555 uppercase tracking-widest block mb-1">
            LIFETIME CUMULATIVE RETURN
          </h4>
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase font-display">
            Lifetime Savings Timeline
          </h3>
        </div>
        
        <div className="relative border-l-2 border-slate-100 dark:border-slate-800/80 ml-3.5 pl-0 space-y-6 py-2 z-10">
          {[
            { label: "Year 1", amount: yr1 },
            { label: "Year 5", amount: yr5 },
            { label: `Year ${paybackPeriodVal.toFixed(1)} (Break-even)`, amount: totalUpfrontInvestment, isPayback: true },
            { label: "Year 10", amount: yr10 },
            { label: "Year 25", amount: yr25 }
          ].sort((a, b) => a.amount - b.amount).map((item, idx) => {
            const pctOfTotal = yr25 > 0 ? Math.round((item.amount / yr25) * 100) : 0;
            return (
              <div key={idx} className="relative pl-6">
                {item.isPayback ? (
                  <>
                    {/* Timeline Dot (pulsing emerald) */}
                    <div className="absolute left-[-7px] top-[18px] w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
                    
                    <div className="flex flex-col gap-1 bg-gradient-to-r from-emerald-500/8 via-teal-500/4 to-emerald-500/8 dark:from-emerald-500/15 dark:via-teal-500/5 dark:to-emerald-500/10 p-3.5 rounded-2xl border border-emerald-500/20 my-1 hover:border-emerald-500/40 transition-all shadow-[0_4px_16px_rgba(16,185,129,0.05)]">
                      <div className="flex justify-between items-center text-xs font-black text-emerald-600 dark:text-primary-green">
                        <span className="flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 fill-current animate-bounce mt-[-1px]" />
                          YOU RECOVER SETUP COST HERE
                        </span>
                        <span className="bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-0.5 rounded-lg text-[10px] border border-emerald-500/20">
                          Year <AnimatedNumber value={paybackPeriodVal} formatter={(v) => v.toFixed(1)} />
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-550 dark:text-slate-405 leading-normal font-medium mt-0.5">
                        Upfront setup costs are completely recovered! Future savings represent net surplus profit.
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    {/* Timeline Dot */}
                    <div className={`absolute left-[-7px] top-[5px] w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 shadow-sm ${
                      item.label === "Year 25"
                        ? "bg-emerald-500 shadow-[0_0_6px_#10b981]"
                        : "bg-blue-500"
                    }`} />
                    
                    <div className="flex justify-between text-[11px] font-bold items-baseline">
                      <span className="text-slate-550 dark:text-slate-400 flex items-center gap-1.5">
                        {item.label}
                        {item.label !== "Year 25" && (
                          <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md leading-none">
                            {pctOfTotal}% of total
                          </span>
                        )}
                      </span>
                      <span className="text-slate-800 dark:text-white font-extrabold flex items-baseline gap-0.5">
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">₹</span>
                        <AnimatedNumber value={item.amount} formatter={(v) => Math.round(v).toLocaleString('en-IN')} />
                      </span>
                    </div>
                    
                    <div className="h-2 w-full bg-slate-100/60 dark:bg-slate-800/40 border border-slate-100/10 rounded-full overflow-hidden relative">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          item.label === "Year 25"
                            ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-primary-green"
                            : "bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-400"
                        }`}
                        style={{ width: isMounted ? `${Math.min(100, (item.amount / (yr25 || 1)) * 100)}%` : "0%" }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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
      {/* ── Hero Banner Strip ── */}
      <motion.div
        variants={itemVariants}
        className="flex flex-wrap items-center gap-2 px-1"
      >
        {[
          { label: "⚡ Real-time ROI", color: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50" },
          { label: "🏛 DISCOM Integrated", color: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50" },
          { label: "☀️ PM Surya Ghar Ready", color: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50" },
          { label: "🌱 Carbon Offset Tracked", color: "bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800/50" },
        ].map((badge, i) => (
          <motion.span
            key={badge.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.07, type: "spring", stiffness: 280, damping: 22 }}
            className={`text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-wider ${badge.color}`}
          >
            {badge.label}
          </motion.span>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Inputs */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-6 space-y-6"
        >
          <div id="solar-savings-planner-card" className="backdrop-blur-md bg-white/70 dark:bg-slate-955/45 p-6 sm:p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/60 shadow-xl space-y-6 relative overflow-hidden group">
            {/* Specular Reflective Gloss Sheen */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000 ease-out pointer-events-none" />
            {/* Ambient glows */}
            <div className="absolute -right-8 -top-8 w-40 h-40 blur-3xl opacity-10 dark:opacity-5 rounded-full bg-amber-400 pointer-events-none group-hover:scale-125 transition-all duration-700" />
            <div className="absolute -left-8 -bottom-8 w-32 h-32 blur-3xl opacity-5 dark:opacity-3 rounded-full bg-sky-400 pointer-events-none" />

            {/* Header */}
            <div className="flex items-center gap-3.5 pb-5 border-b border-slate-100 dark:border-slate-800/80 relative z-10">
              {/* Glowing animated sun ring */}
              <div className="relative shrink-0">
                <div className="absolute inset-0 rounded-2xl bg-amber-400/30 dark:bg-amber-500/20 animate-ping" style={{ animationDuration: "3s" }} />
                <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-400/10 dark:from-amber-500/20 dark:to-orange-500/10 text-amber-500 border border-amber-200/50 dark:border-amber-500/20 relative z-10 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                  <Sun className="w-6 h-6 animate-spin" style={{ animationDuration: "15s" }} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Solar Savings Planner</h3>
                  {/* Live indicator */}
                  <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    Live
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                  Configure your rooftop space, monthly bill &amp; solar technology.
                </p>
              </div>
            </div>

            {/* ── Installation State Selector ── */}
            <div className="space-y-3 relative z-10">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-sky-500" /> Installation State
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { code: "ap", label: "Andhra Pradesh", short: "AP", color: "from-sky-500/10 to-blue-500/5 border-sky-500/60 text-sky-700 dark:text-sky-400 shadow-sky-500/10" },
                  { code: "ts", label: "Telangana",      short: "TS", color: "from-violet-500/10 to-purple-500/5 border-violet-500/60 text-violet-700 dark:text-violet-400 shadow-violet-500/10" },
                  { code: "ka", label: "Karnataka",      short: "KA", color: "from-emerald-500/10 to-teal-500/5 border-emerald-500/60 text-emerald-700 dark:text-emerald-400 shadow-emerald-500/10" },
                ].map(st => {
                  const isActive = selectedState === st.code;
                  return (
                    <motion.button
                      key={st.code}
                      onClick={() => setSelectedState(st.code)}
                      whileHover={{ 
                        scale: 1.05, 
                        y: -5,
                        boxShadow: isActive ? "0 10px 20px -5px rgba(59,130,246,0.2)" : "0 8px 16px -6px rgba(0,0,0,0.1)"
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 22 }}
                      whileTap={{ scale: 0.96 }}
                      type="button"
                      className={`py-3 px-2 rounded-2xl border text-center transition-colors duration-200 flex flex-col items-center gap-0.5 cursor-pointer relative overflow-hidden ${
                        isActive
                          ? `bg-gradient-to-br ${st.color} shadow-[0_4px_20px_-4px_var(--tw-shadow-color)]`
                          : "border-slate-200/80 bg-slate-50/50 dark:border-slate-800/80 dark:bg-slate-900/30 hover:border-slate-350 dark:hover:border-slate-700"
                      }`}
                    >
                      {isActive && <div className="absolute inset-0 bg-gradient-to-br opacity-30 animate-pulse" style={{ animationDuration: "2s" }} />}
                      <span className={`text-lg font-black leading-none relative z-10 ${isActive ? "" : "text-slate-500 dark:text-slate-400"}`}>{st.short}</span>
                      <span className={`text-[8px] font-bold uppercase tracking-wider leading-none relative z-10 ${isActive ? "" : "text-slate-450 dark:text-slate-500"}`}>{st.label}</span>
                      {isActive && <MapPin className="w-2.5 h-2.5 mt-0.5 relative z-10 animate-bounce" />}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* ── Solar Cell Technology ── */}
            <div className="space-y-3 relative z-10">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-emerald-500" /> Solar Cell Technology
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* TOPCon */}
                <motion.button
                  onClick={() => setSolarTech("topcon")}
                  whileHover={{ 
                    y: -7, 
                    scale: 1.03, 
                    boxShadow: "0 16px 28px -6px rgba(16,185,129,0.22)" 
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 20 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  className={`p-4 rounded-3xl border text-left transition-colors duration-250 relative flex flex-col gap-3 cursor-pointer overflow-hidden ${
                    solarTech === "topcon"
                      ? "border-emerald-500/70 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 dark:from-emerald-950/25 dark:to-teal-950/10 shadow-[0_6px_24px_-4px_rgba(16,185,129,0.25)]"
                      : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50 hover:border-emerald-400/50 hover:bg-emerald-50/20 dark:hover:border-emerald-800/40"
                  }`}
                >
                  {/* Recommended badge */}
                  <div className={`absolute top-2.5 right-2.5 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    solarTech === "topcon" ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  }`}>⭐ Best</div>

                  {/* SVG Panel Illustration */}
                  <svg width="40" height="28" viewBox="0 0 40 28" className={`transition-opacity duration-200 ${solarTech === "topcon" ? "opacity-100" : "opacity-40"}`}>
                    <defs>
                      <linearGradient id="tc1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#10b981"/><stop offset="100%" stopColor="#0d9488"/></linearGradient>
                    </defs>
                    {[[0,0],[14,0],[28,0],[0,10],[14,10],[28,10],[0,20],[14,20],[28,20]].map((coords,i)=>{
                      const [px,py] = coords;
                      return <rect key={i} x={px+1} y={py+1} width="11" height="8" rx="1" fill="url(#tc1)" opacity="0.85"/>;
                    })}
                  </svg>

                  <div>
                    <div className={`text-xs font-black flex items-center gap-1.5 ${solarTech === "topcon" ? "text-emerald-700 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300"}`}>
                      TOPCon Premium
                      {solarTech === "topcon" && <ShieldCheck className="w-3.5 h-3.5 animate-pulse" />}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-450 mt-1.5 space-y-1">
                      <div className="flex justify-between"><span>Efficiency</span><span className="font-bold text-slate-700 dark:text-slate-200">26%</span></div>
                      <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500" style={{ width: "96%" }} />
                      </div>
                      <div className="flex justify-between"><span>Lifespan</span><span className="font-bold text-slate-700 dark:text-slate-200">30 Yrs</span></div>
                    </div>
                    <div className="text-[10px] text-amber-500 font-bold mt-1.5">★★★★★</div>
                  </div>
                </motion.button>

                {/* Mono-PERC */}
                <motion.button
                  onClick={() => setSolarTech("mono-perc")}
                  whileHover={{ 
                    y: -7, 
                    scale: 1.03, 
                    boxShadow: "0 16px 28px -6px rgba(59,130,246,0.22)" 
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 20 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  className={`p-4 rounded-3xl border text-left transition-colors duration-250 relative flex flex-col gap-3 cursor-pointer overflow-hidden ${
                    solarTech === "mono-perc"
                      ? "border-blue-500/70 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 dark:from-blue-950/25 dark:to-indigo-950/10 shadow-[0_6px_24px_-4px_rgba(59,130,246,0.25)]"
                      : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50 hover:border-blue-400/50 hover:bg-blue-50/20 dark:hover:border-blue-800/40"
                  }`}
                >
                  {/* Value badge */}
                  <div className={`absolute top-2.5 right-2.5 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    solarTech === "mono-perc" ? "bg-blue-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  }`}>Value</div>

                  {/* SVG Panel Illustration */}
                  <svg width="40" height="28" viewBox="0 0 40 28" className={`transition-opacity duration-200 ${solarTech === "mono-perc" ? "opacity-100" : "opacity-40"}`}>
                    <defs>
                      <linearGradient id="mp1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#3b82f6"/><stop offset="100%" stopColor="#6366f1"/></linearGradient>
                    </defs>
                    {[[0,0],[14,0],[28,0],[0,10],[14,10],[28,10],[0,20],[14,20],[28,20]].map((coords,i)=>{
                      const [px,py] = coords;
                      return <rect key={i} x={px+1} y={py+1} width="11" height="8" rx="1" fill="url(#mp1)" opacity="0.85"/>;
                    })}
                  </svg>

                  <div>
                    <div className={`text-xs font-black flex items-center gap-1.5 ${solarTech === "mono-perc" ? "text-blue-700 dark:text-blue-400" : "text-slate-700 dark:text-slate-300"}`}>
                      Mono-PERC
                      {solarTech === "mono-perc" && <ShieldCheck className="w-3.5 h-3.5 animate-pulse" />}
                    </div>
                    <div className="text-[10px] text-slate-550 dark:text-slate-450 mt-1.5 space-y-1">
                      <div className="flex justify-between"><span>Efficiency</span><span className="font-bold text-slate-700 dark:text-slate-200">22.5%</span></div>
                      <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full transition-all duration-500" style={{ width: "83%" }} />
                      </div>
                      <div className="flex justify-between"><span>Lifespan</span><span className="font-bold text-slate-700 dark:text-slate-200">25 Yrs</span></div>
                    </div>
                    <div className="text-[10px] text-amber-500 font-bold mt-1.5">★★★★☆</div>
                  </div>
                </motion.button>
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
              {/* Quick preset chips */}
              <div className="flex gap-1.5 flex-wrap">
                {[2000, 5000, 8000, 12000].map(v => (
                  <button key={v} type="button" onClick={() => setMonthlyBill(v)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border cursor-pointer transition-all duration-150 ${
                      monthlyBill === v
                        ? "bg-blue-500 text-white border-blue-500 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-600"
                    }`}>
                    ₹{(v/1000).toFixed(0)}K
                  </button>
                ))}
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
                  className="premium-slider slider-orange w-full cursor-pointer h-2 rounded-full appearance-none outline-none"
                  style={{
                    background: `linear-gradient(to right, #f59e0b 0%, #facc15 ${roofPercent}%, ${activeTheme === 'dark' ? '#1e293b' : '#e2e8f0'} ${roofPercent}%, ${activeTheme === 'dark' ? '#1e293b' : '#e2e8f0'} 100%)`
                  }}
                />
              </div>
              {/* Quick preset chips */}
              <div className="flex gap-1.5 flex-wrap">
                {[200, 400, 700, 1000].map(v => (
                  <button key={v} type="button" onClick={() => setRoofArea(v)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border cursor-pointer transition-all duration-150 ${
                      roofArea === v
                        ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-amber-400 hover:text-amber-600 dark:hover:border-amber-600"
                    }`}>
                    {v} ft²
                  </button>
                ))}
              </div>
            </div>

            {/* Hybrid Backup Battery Storage */}
            <div className="border border-slate-200/40 dark:border-slate-800/40 rounded-2xl overflow-hidden bg-white/20 dark:bg-slate-950/20 relative z-10 shadow-sm">
              <div className="w-full flex items-center gap-2 p-4 text-xs font-black text-slate-700 dark:text-slate-300 bg-slate-50/40 dark:bg-slate-950/30 border-b border-slate-200/30 dark:border-slate-800/40">
                <Layers className="w-4 h-4 text-slate-405" />
                Hybrid Backup Battery Storage
              </div>

              <div className="p-4 space-y-4 text-xs bg-transparent">
                {/* Hybrid Storage Toggle */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-655 dark:text-slate-400">Hybrid Backup Battery Storage</span>
                    <button
                      type="button"
                      onClick={() => setIsHybrid(!isHybrid)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                        isHybrid ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          isHybrid ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {isHybrid && (
                    <div className="space-y-3 pt-2 bg-slate-50/50 dark:bg-slate-950/20 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                      {/* Battery Capacity */}
                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold text-slate-655 dark:text-slate-400">
                          <span>Battery Storage Capacity</span>
                          <span className="text-emerald-500 font-bold">{batteryKwh} kWh</span>
                        </div>
                        <input
                          type="range"
                          min="2.5"
                          max="20"
                          step="2.5"
                          value={batteryKwh}
                          onChange={(e) => setBatteryKwh(parseFloat(e.target.value))}
                          className="premium-slider w-full cursor-pointer h-2 rounded-full appearance-none outline-none"
                          style={{
                            background: activeTheme === "dark"
                              ? `linear-gradient(to right, #10b981 0%, #10b981 ${((batteryKwh - 2.5) / 17.5) * 100}%, #1e293b ${((batteryKwh - 2.5) / 17.5) * 100}%, #1e293b 100%)`
                              : `linear-gradient(to right, #10b981 0%, #10b981 ${((batteryKwh - 2.5) / 17.5) * 100}%, #e2e8f0 ${((batteryKwh - 2.5) / 17.5) * 100}%, #e2e8f0 100%)`
                          }}
                        />
                      </div>

                      {/* Battery Chemistry */}
                      <div className="space-y-1">
                        <span className="font-semibold text-slate-500 dark:text-slate-455 block text-[10px]">Battery Chemistry</span>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setBatteryType("lithium")}
                            className={`py-1 px-2 rounded-lg border text-[10px] font-bold cursor-pointer transition-all duration-200 ${
                              batteryType === "lithium"
                                ? "bg-emerald-500 text-white border-emerald-500 shadow-sm animate-none"
                                : "bg-slate-50 dark:bg-slate-900 text-slate-550 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                          >
                            Lithium (10yr life)
                          </button>
                          <button
                            type="button"
                            onClick={() => setBatteryType("lead-acid")}
                            className={`py-1 px-2 rounded-lg border text-[10px] font-bold cursor-pointer transition-all duration-200 ${
                              batteryType === "lead-acid"
                                ? "bg-emerald-500 text-white border-emerald-500 shadow-sm animate-none"
                                : "bg-slate-50 dark:bg-slate-900 text-slate-555 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                          >
                            Lead-Acid (4yr life)
                          </button>
                        </div>
                        <span className="text-[9px] text-slate-400 block pt-1 leading-normal">
                          {batteryType === "lithium" 
                            ? "Est. cost: ₹15,000/kWh upfront. Long life with high depth-of-discharge." 
                            : "Est. cost: ₹7,000/kWh upfront. Economical but needs replacement every 4 years."}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {(() => {
              const isCapped = maxKwBySpace < kwNeededByUsage;
              return (
                <motion.div 
                  key={`diagnostics-${isCapped}-${monthlyBill}-${roofArea}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  whileHover={{ y: -3, scale: 1.005 }}
                  className={`p-4 rounded-r-2xl rounded-l-lg border-l-4 text-xs leading-relaxed relative z-10 transition-colors duration-250 cursor-pointer ${
                    isCapped 
                      ? "border-orange-500 border-y-transparent border-r-transparent bg-orange-500/5 dark:bg-orange-950/10 text-slate-650 dark:text-slate-350 shadow-[0_4px_16px_rgba(245,158,11,0.02)]"
                      : "border-blue-500 border-y-transparent border-r-transparent bg-blue-500/5 dark:bg-blue-950/10 text-slate-650 dark:text-slate-350 shadow-[0_4px_16px_rgba(59,130,246,0.01)]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl shrink-0 ${
                      isCapped ? "bg-orange-500/10 text-orange-600 dark:text-orange-400" : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    }`}>
                      {isCapped ? <Scale className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                    </div>
                    <div className="space-y-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-black uppercase tracking-widest text-[9px] text-slate-400 dark:text-slate-500">
                          Sizing Diagnostics
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                          isCapped ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                        }`}>
                          {isCapped ? "Capped by Space" : "Optimized Sizing"}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium opacity-90 leading-normal">
                        {isCapped ? (
                          <>
                            To fully offset your bill of <span className="font-extrabold text-orange-600 dark:text-orange-400">₹{monthlyBill.toLocaleString('en-IN')}</span> in {getFullStateName(selectedState)}, you require a <span className="font-extrabold text-orange-600 dark:text-orange-400">{kwNeededByUsage.toFixed(1)} kW</span> system. Since your roof area limits capacity to <span className="font-extrabold text-orange-600 dark:text-orange-400">{maxKwBySpace.toFixed(1)} kW</span>, the recommended system size is capped at <span className="font-extrabold text-orange-600 dark:text-orange-400">{recommendedKw.toFixed(1)} kW</span>.
                          </>
                        ) : (
                          <>
                            Your electricity bill of <span className="font-extrabold text-blue-650 dark:text-blue-400">₹{monthlyBill.toLocaleString('en-IN')}</span> in {getFullStateName(selectedState)} requires a <span className="font-extrabold text-blue-650 dark:text-blue-400">{kwNeededByUsage.toFixed(1)} kW</span> system. This fits comfortably within your roof area limit of <span className="font-extrabold text-blue-650 dark:text-blue-400">{maxKwBySpace.toFixed(1)} kW</span>.
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })()}

            {/* Detailed Net Metering breakdown */}
            <motion.div 
              whileHover={{ y: -3, scale: 1.008 }}
              className="p-5 bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 text-xs relative z-10 shadow-sm space-y-4 hover:shadow-[0_8px_30px_rgba(59,130,246,0.04)] hover:border-slate-300 dark:hover:border-slate-700 transition-colors duration-250 cursor-pointer"
            >
              <span className="font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest block text-[9px] text-left">
                Net Metering Calculations
              </span>
              
              <div className="space-y-2">
                {[
                  { label: "Estimated Monthly Consumption", val: `${Math.round(kwhNeeded).toLocaleString('en-IN')} kWh`, icon: Zap, color: "text-blue-500 bg-blue-500/10" },
                  { label: "Estimated Monthly Solar Generation", val: `${Math.round(monthlyGeneration).toLocaleString('en-IN')} kWh`, icon: Sun, color: "text-amber-500 bg-amber-500/10" },
                  { label: "New Net Grid Consumption", val: `${Math.max(0, Math.round(newUnits)).toLocaleString('en-IN')} kWh`, icon: Scale, color: "text-slate-400 bg-slate-100 dark:bg-slate-800 dark:text-slate-400" },
                  { label: "Slab Savings Coverage", val: `${Math.round(billCoveragePercent)}%`, icon: Leaf, color: "text-emerald-500 bg-emerald-500/10" }
                ].map((row, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-100/40 dark:border-slate-800/30 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/45 px-2 rounded-2xl transition-all duration-250 cubic-bezier(0.16, 1, 0.3, 1) hover:translate-x-2.5 cursor-pointer">
                    <div className="flex items-center gap-2.5 text-slate-550 dark:text-slate-455 text-left">
                      <div className={`p-1.5 rounded-lg shrink-0 ${row.color}`}>
                        <row.icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold text-slate-500 dark:text-slate-400 text-[11px]">{row.label}</span>
                    </div>
                    <span className="px-3 py-1 text-slate-800 dark:text-slate-200 bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-805/60 rounded-xl font-extrabold text-[11px] shadow-sm min-w-[75px] text-right inline-block">
                      {row.val}
                    </span>
                  </div>
                ))}
              </div>

              {/* Monthly Bill with Solar Panels Highlight panel */}
              <motion.div 
                whileHover={{ scale: 1.015 }}
                className="bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-transparent dark:from-emerald-950/10 dark:via-teal-950/5 p-4 rounded-2xl border border-emerald-500/20 hover:border-emerald-500/45 shadow-[0_4px_20px_rgba(16,185,129,0.02)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.08)] transition-colors duration-250 cursor-pointer flex justify-between items-center mt-3"
              >
                <div className="text-left">
                  <span className="text-[10px] font-black text-emerald-600 dark:text-primary-green uppercase tracking-wider block">Monthly Bill with Solar</span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-medium mt-0.5">After slab-rate net metering</span>
                </div>
                <div className="flex items-center gap-2 text-right">
                  <span className="text-emerald-600 dark:text-primary-green text-lg font-black flex items-baseline gap-0.5">
                    <span className="text-[11px] font-extrabold">₹</span>
                    <AnimatedNumber value={newBill} formatter={(v) => Math.round(v).toLocaleString('en-IN')} />
                  </span>
                  {newBill === 0 && (
                    <span className="flex h-2 w-2 relative shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  )}
                </div>
              </motion.div>
            </motion.div>

            <div className="text-[9px] text-slate-400 dark:text-slate-555 pt-1 text-center font-medium leading-normal border-t border-slate-100 dark:border-slate-800/60">
              *Calculated using actual DISCOM slab rates in the {getFullStateName(selectedState)} database.
            </div>
          </div>

          {/* Financial Modeling Assumptions (Always Open) */}
            <div className="backdrop-blur-md bg-white/70 dark:bg-slate-955/45 border border-slate-200/50 dark:border-slate-800/60 rounded-3xl overflow-hidden relative z-10 shadow-sm">
              {/* Header */}
              <div className="w-full flex items-center gap-2 p-4 text-xs font-black text-slate-700 dark:text-slate-350 bg-slate-50/40 dark:bg-slate-950/30 border-b border-slate-150 dark:border-slate-800/55">
                <Settings className="w-4 h-4 text-slate-405" />
                Financial Modeling Assumptions
              </div>

              {/* Content — always visible */}
              <div className="p-4 space-y-4 text-xs bg-transparent">
                <div className="space-y-2">
                  <div className="flex justify-between items-center font-semibold text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      Annual Tariff Rate Increase
                      <HelpCircle 
                        className={`w-3.5 h-3.5 cursor-pointer transition-colors duration-150 ${showTariffExpl ? 'text-blue-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`} 
                        onClick={() => setShowTariffExpl(!showTariffExpl)} 
                      />
                    </span>
                    <span className="text-primary-blue dark:text-primary-green font-bold">{tariffIncrease}%</span>
                  </div>
                  {showTariffExpl && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100/40 dark:border-blue-900/20 p-2.5 rounded-xl text-[10px] text-slate-500 dark:text-slate-400 text-left leading-normal font-medium"
                    >
                      Utility electricity rates rise every year. We project this percentage hike annually to calculate how much grid power will cost in the future.
                    </motion.div>
                  )}
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
                  <div className="flex justify-between items-center font-semibold text-slate-655 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      Annual Module Degradation
                      <HelpCircle 
                        className={`w-3.5 h-3.5 cursor-pointer transition-colors duration-150 ${showDegradationExpl ? 'text-amber-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`} 
                        onClick={() => setShowDegradationExpl(!showDegradationExpl)} 
                      />
                    </span>
                    <span className="text-amber-505 font-bold text-amber-500">{panelDegradation}%</span>
                  </div>
                  {showDegradationExpl && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-amber-50/40 dark:bg-amber-950/10 border border-amber-100/40 dark:border-amber-900/20 p-2.5 rounded-xl text-[10px] text-slate-500 dark:text-slate-400 text-left leading-normal font-medium"
                    >
                      Solar panels slowly lose a tiny bit of power generation capability every year. Typically premium panels lose less than 1% capacity per year.
                    </motion.div>
                  )}
                  <input
                    type="range"
                    min="0.1"
                    max="2.0"
                    step="0.1"
                    value={panelDegradation}
                    onChange={(e) => setPanelDegradation(parseFloat(e.target.value))}
                    className="premium-slider slider-orange w-full cursor-pointer h-2 rounded-full appearance-none outline-none"
                    style={{
                      background: activeTheme === "dark"
                        ? `linear-gradient(to right, #f59e0b 0%, #f59e0b ${((panelDegradation - 0.1) / 1.9) * 100}%, #1e293b ${((panelDegradation - 0.1) / 1.9) * 100}%, #1e293b 100%)`
                        : `linear-gradient(to right, #f59e0b 0%, #f59e0b ${((panelDegradation - 0.1) / 1.9) * 100}%, #e2e8f0 ${((panelDegradation - 0.1) / 1.9) * 100}%, #e2e8f0 100%)`
                    }}
                  />
                  <span className="text-[10px] text-slate-400 block font-medium">Premium panels (TOPCon) degrade slower (~0.4% - 0.8%) than Mono-PERC (~0.8% - 1.2%).</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center font-semibold text-slate-655 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      Annual Maintenance Cost
                      <HelpCircle 
                        className={`w-3.5 h-3.5 cursor-pointer transition-colors duration-150 ${showMaintenanceExpl ? 'text-emerald-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`} 
                        onClick={() => setShowMaintenanceExpl(!showMaintenanceExpl)} 
                      />
                    </span>
                    <span className="text-slate-700 dark:text-slate-350 font-bold">{maintenanceRate}% <span className="font-normal text-slate-400">of cost</span></span>
                  </div>
                  {showMaintenanceExpl && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100/40 dark:border-emerald-900/20 p-2.5 rounded-xl text-[10px] text-slate-500 dark:text-slate-400 text-left leading-normal font-medium"
                    >
                      Covers standard recurring maintenance like cleaning dust off the panels, checking electrical inverter connections, and replacement wiring.
                    </motion.div>
                  )}
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
            <div className="backdrop-blur-md bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-indigo-500/10 border border-indigo-200/50 dark:border-indigo-800/40 p-5 rounded-3xl shadow-sm relative overflow-hidden group">
              {/* Specular Reflective Gloss Sheen */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000 ease-out pointer-events-none" />
              {/* Glowing Background Wash */}
              <div className="absolute -right-12 -top-12 w-32 h-32 blur-2xl opacity-15 dark:opacity-10 rounded-full bg-indigo-500 pointer-events-none group-hover:scale-150 transition-all duration-700" />
              <div className="absolute -left-12 -bottom-12 w-32 h-32 blur-2xl opacity-10 dark:opacity-5 rounded-full bg-purple-500 pointer-events-none group-hover:scale-150 transition-all duration-700" />

              <div className="flex items-center gap-3 relative z-10 pb-1">
                <div className="p-2 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(99,102,241,0.15)] dark:shadow-none animate-pulse">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest leading-none font-display">Ask Solar AI Advisor</h4>
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mt-0.5">Instant Consultation</span>
                </div>
              </div>

              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 leading-normal relative z-10">
                Click a question below to analyze your recommended <span className="text-indigo-600 dark:text-indigo-400 font-bold">{recommendedKw.toFixed(1)} kW</span> system:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px] font-bold relative z-10">
                {[
                  "Can solar eliminate my bill?",
                  "Should I wait another year?",
                  "What size system should I buy?",
                  "Can I charge an EV with this system?"
                ].map((q, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.015, y: -0.5 }}
                    whileTap={{ scale: 0.985 }}
                    type="button"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent("she_trigger_chat", { 
                        detail: { message: `${q} Based on my Solar Planner recommendation: a ${recommendedKw.toFixed(1)} kW system, costs ₹${totalUpfrontInvestment.toLocaleString('en-IN')}, saves ₹${firstYearSavings.toLocaleString('en-IN')}/year, payback in ${paybackPeriodVal.toFixed(1)} years.` } 
                      }));
                    }}
                    className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/60 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-gradient-to-r hover:from-indigo-50/30 hover:to-purple-50/20 dark:hover:from-indigo-950/20 dark:hover:to-purple-950/15 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-[0_4px_16px_rgba(99,102,241,0.08)] dark:hover:shadow-none text-slate-700 dark:text-slate-350 text-left transition-colors duration-200 cursor-pointer flex justify-between items-center gap-2 group/btn font-semibold"
                  >
                    <span className="leading-snug">{q}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover/btn:text-indigo-500 dark:group-hover/btn:text-indigo-400 transition-colors shrink-0 duration-200" />
                  </motion.button>
                ))}
              </div>
            </div>

          {/* Panel details sub-section */}
          <div className="bg-slate-50/50 dark:bg-slate-900/30 p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm relative overflow-hidden group hover:shadow-[0_0_25px_-5px_rgba(99,102,241,0.15)] hover:border-indigo-500/20 transition-all duration-300">
            <div className="absolute -right-6 -top-6 w-24 h-24 blur-xl opacity-20 dark:opacity-10 rounded-full bg-indigo-500 pointer-events-none group-hover:scale-150 transition-all duration-500" />
            
            <div className="flex items-center gap-2 mb-3 relative z-10">
              <div className="p-1.5 bg-indigo-500/10 text-indigo-555 rounded-lg">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                  SYSTEM COMPONENTS
                </span>
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase leading-tight mt-0.5 font-display">
                  Rooftop Module Details
                </h4>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 relative z-10">
              {/* Card 1: Modules Needed */}
              <motion.div 
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-white/60 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-200/40 dark:border-slate-850/60 flex flex-col justify-between hover:border-indigo-500/35 hover:shadow-[0_8px_24px_rgba(99,102,241,0.06)] dark:hover:shadow-none transition-colors duration-250 cursor-pointer group/spec"
              >
                <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 mb-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Required Modules</span>
                </div>
                <div>
                  <div className="text-sm font-extrabold text-slate-850 dark:text-white leading-tight">
                    {panelsNeeded} Panels
                  </div>
                  <div className="text-[9px] font-semibold text-slate-500 dark:text-slate-455 mt-0.5 leading-none">
                    {panelWattage}W Rating ({solarTech === "topcon" ? "TOPCon" : "Mono-PERC"})
                  </div>
                </div>
              </motion.div>

              {/* Card 2: Dimensions */}
              <motion.div 
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-white/60 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-200/40 dark:border-slate-850/60 flex flex-col justify-between hover:border-indigo-500/35 hover:shadow-[0_8px_24px_rgba(99,102,241,0.06)] dark:hover:shadow-none transition-colors duration-250 cursor-pointer group/spec"
              >
                <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 mb-1.5">
                  <Ruler className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Dimensions</span>
                </div>
                <div>
                  <div className="text-sm font-extrabold text-slate-850 dark:text-white leading-tight">
                    {panelSizeLabel.replace("~", "")}
                  </div>
                  <div className="text-[9px] font-semibold text-slate-500 dark:text-slate-455 mt-0.5 leading-none">
                    Per Module Size
                  </div>
                </div>
              </motion.div>

              {/* Card 3: Weight */}
              <motion.div 
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-white/60 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-200/40 dark:border-slate-850/60 flex flex-col justify-between hover:border-indigo-500/35 hover:shadow-[0_8px_24px_rgba(99,102,241,0.06)] dark:hover:shadow-none transition-colors duration-250 cursor-pointer group/spec"
              >
                <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 mb-1.5">
                  <Scale className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Weight Load</span>
                </div>
                <div>
                  <div className="text-sm font-extrabold text-slate-850 dark:text-white leading-tight">
                    ~{panelWeight} kg
                  </div>
                  <div className="text-[9px] font-semibold text-slate-500 dark:text-slate-455 mt-0.5 leading-none">
                    Total Load: {panelsNeeded * panelWeight} kg
                  </div>
                </div>
              </motion.div>

              {/* Card 4: Efficiency */}
              <motion.div 
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-white/60 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-200/40 dark:border-slate-850/60 flex flex-col justify-between hover:border-indigo-500/35 hover:shadow-[0_8px_24px_rgba(99,102,241,0.06)] dark:hover:shadow-none transition-colors duration-250 cursor-pointer group/spec"
              >
                <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 mb-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-500 shrink-0 animate-pulse" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Efficiency</span>
                </div>
                <div>
                  <div className="text-sm font-extrabold text-emerald-600 dark:text-primary-green leading-tight">
                    {panelEfficiency.toFixed(1)}%
                  </div>
                  <div className="text-[9px] font-semibold text-slate-500 dark:text-slate-455 mt-0.5 leading-none">
                    Cell Conversion
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: ROI Outputs */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-6 space-y-6"
        >
          <div className="space-y-6 relative">
            {/* ── 1. Hero Recommendation Card ── */}
            <motion.div 
              whileHover={{ 
                y: -7, 
                scale: 1.015, 
                boxShadow: "0 22px 40px -10px rgba(16,185,129,0.22)" 
              }}
              transition={{ type: "spring", stiffness: 350, damping: 22 }}
              className="p-7 rounded-3xl border border-emerald-500/25 dark:border-emerald-500/35 flex flex-col justify-between min-h-[240px] bg-gradient-to-br from-emerald-500/12 via-sky-500/8 to-teal-500/6 dark:from-emerald-950/25 dark:via-sky-950/15 dark:to-teal-950/10 shadow-md relative overflow-hidden text-left group hover:shadow-[0_16px_48px_rgba(16,185,129,0.2)] hover:border-emerald-500/50 transition-all duration-300 cursor-pointer"
            >
              {/* Multi-layered glows */}
              <div className="absolute -right-8 -top-8 w-48 h-48 blur-3xl opacity-25 dark:opacity-15 rounded-full bg-emerald-400 pointer-events-none group-hover:scale-110 transition-all duration-700" />
              <div className="absolute -left-12 -bottom-12 w-36 h-36 blur-2xl opacity-15 dark:opacity-10 rounded-full bg-sky-400 pointer-events-none group-hover:scale-110 transition-all duration-700" />
              <div className="absolute top-1/2 right-8 -translate-y-1/2 opacity-[0.04] dark:opacity-[0.06] pointer-events-none">
                <svg width="120" height="120" viewBox="0 0 120 120"><circle cx="60" cy="60" r="55" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="8 4"/><circle cx="60" cy="60" r="40" fill="none" stroke="#10b981" strokeWidth="0.8" strokeDasharray="5 5"/><circle cx="60" cy="60" r="25" fill="none" stroke="#10b981" strokeWidth="0.6"/></svg>
              </div>
              
              <div className="space-y-2 relative z-10">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "12s" }} />
                  <span>Solar Recommendation</span>
                </span>
                {/* Jumbo kW display */}
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-5xl font-display font-black tracking-tight bg-gradient-to-r from-emerald-600 via-teal-500 to-sky-500 dark:from-emerald-400 dark:via-teal-400 dark:to-sky-400 bg-clip-text text-transparent">
                    <AnimatedNumber value={recommendedKw} formatter={(v) => v.toFixed(1)} />
                  </h3>
                  <span className="text-xl font-black text-slate-700 dark:text-slate-200">kW System</span>
                </div>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
                  <span className="text-base">₹</span>
                  <AnimatedNumber value={firstYearSavings} formatter={(v) => Math.round(v).toLocaleString('en-IN')} />
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">/ year saved</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Payback in <span className="text-slate-700 dark:text-slate-200 font-black"><AnimatedNumber value={paybackPeriodVal} formatter={(v) => v.toFixed(1)} /> yrs</span>
                  </span>
                  <span className="h-3.5 w-px bg-slate-300 dark:bg-slate-700" />
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    <span className="text-slate-700 dark:text-slate-200 font-black">{panelsNeeded}</span> panels needed
                  </span>
                </div>
              </div>
              
              {/* Shimmer CTA button */}
              <motion.button 
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("she_trigger_chat", { 
                    detail: { message: `I want to install the recommended ${recommendedKw.toFixed(1)} kW Solar System. What are the installation steps, required solar panel brands, and subsidy approval procedures?` } 
                  }));
                }}
                type="button"
                className="mt-5 px-7 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider shadow-lg hover:shadow-[0_10px_28px_rgba(16,185,129,0.4)] cursor-pointer relative z-10 overflow-hidden group/btn w-fit"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Install Solar Now
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
              </motion.button>
            </motion.div>

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

            {/* ── 3. Feasibility Review ── */}
            <motion.div 
              whileHover={{ 
                y: -6, 
                scale: 1.015, 
                boxShadow: "0 16px 32px -8px rgba(0,0,0,0.12)" 
              }}
              transition={{ type: "spring", stiffness: 350, damping: 20 }}
              className={`rounded-3xl overflow-hidden border shadow-sm cursor-pointer transition-all duration-250 ${conclusion.colorClass}`}
            >
              <div className="flex items-stretch">
                {/* Left color stripe */}
                <div className={`w-1.5 shrink-0 ${paybackPeriodVal <= 5 ? 'bg-emerald-500' : paybackPeriodVal <= 8 ? 'bg-green-500' : paybackPeriodVal <= 12 ? 'bg-amber-500' : 'bg-slate-400'}`} />
                <div className="flex-1 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Feasibility Review</span>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-wide ${conclusion.colorClass}`}>{conclusion.badge}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Financial Score", value: `${Math.max(0, Math.round(100 - (paybackPeriodVal * 3)))}%`, icon: "📊", color: "text-slate-800 dark:text-white" },
                      { label: "25yr Profit",    value: `₹${Math.round(twentyFiveYearNetSavings).toLocaleString('en-IN')}`, icon: "💹", color: "text-emerald-600 dark:text-emerald-400" },
                      { label: "Break-Even",     value: `${paybackPeriodVal.toFixed(1)} yrs`, icon: "⏱", color: "text-blue-600 dark:text-blue-400" },
                      { label: "Risk Level",     value: paybackPeriodVal > 10 ? "Medium" : "Low", icon: "🛡", color: "text-slate-800 dark:text-white" },
                    ].map((stat, i) => (
                      <div key={i} className="bg-white/50 dark:bg-slate-900/30 p-3 rounded-2xl border border-current/10 space-y-0.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <span>{stat.icon}</span>{stat.label}
                        </span>
                        <p className={`text-sm font-extrabold ${stat.color}`}>{stat.value}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-normal">{conclusion.message}</p>
                </div>
              </div>
            </motion.div>

            {/* ── 4. Metric Cards Grid (gradient top-border + stagger) ── */}
            <div className="grid grid-cols-2 gap-4 text-left">
              {[
                { label: "💰 Investment",    value: `₹${Math.round(totalUpfrontInvestment).toLocaleString('en-IN')}`, sub: "After PM Surya Ghar Subsidy", topColor: "from-blue-400 to-indigo-500",   glowColor: "bg-blue-500",  glow: "card-client-blue",   delay: 0 },
                { label: "📈 Annual Return", value: `₹${Math.round(firstYearSavings).toLocaleString('en-IN')}`, sub: "Year 1 savings estimate",      topColor: "from-emerald-400 to-teal-500", glowColor: "bg-emerald-500", glow: "card-client-emerald", delay: 75 },
                { label: "⚡ Monthly Savings",value: `₹${Math.round(firstYearSavings / 12).toLocaleString('en-IN')}`, sub: "Estimated grid bill cut", topColor: "from-cyan-400 to-sky-500",  glowColor: "bg-cyan-500",  glow: "card-client-cyan",    delay: 150 },
                { label: "🏆 25yr ROI",      value: `${totalUpfrontInvestment > 0 ? ((twentyFiveYearNetSavings + totalUpfrontInvestment) / totalUpfrontInvestment).toFixed(1) : '0.0'}x`, sub: "25-year cumulative yield", topColor: "from-amber-400 to-orange-500", glowColor: "bg-amber-500",  glow: "card-client-amber",   delay: 225 },
              ].map((card, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: card.delay / 1000, type: "spring", stiffness: 280, damping: 26 }}
                  className={`card-client ${card.glow} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col justify-between h-[120px] shadow-sm relative overflow-hidden cursor-pointer text-left transition-all duration-300`}
                >
                  {/* Gradient top border */}
                  <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${card.topColor}`} />
                  <div className={`absolute -right-4 -top-4 w-16 h-16 blur-lg opacity-10 dark:opacity-8 rounded-full ${card.glowColor} pointer-events-none`} />
                  <div className="p-4 pt-5 flex flex-col justify-between h-full relative z-10">
                    <span className="text-[9.5px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest">{card.label}</span>
                    <p className="text-xl font-display font-black text-slate-900 dark:text-white leading-tight">{card.value}</p>
                    <span className="text-[9px] text-slate-450 dark:text-slate-500 block">{card.sub}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* 5. Lifetime Savings Timeline */}
            {renderLifetimeTimeline()}

            {/* ── 6. Environmental Offset Card ── */}
            <motion.div
              whileHover={{ 
                y: -7, 
                scale: 1.02, 
                boxShadow: "0 18px 36px -10px rgba(16,185,129,0.18)" 
              }}
              transition={{ type: "spring", stiffness: 350, damping: 22 }}
              className="p-6 rounded-3xl border border-green-500/25 dark:border-green-500/30 space-y-4 text-left shadow-sm relative overflow-hidden group hover:shadow-[0_12px_40px_rgba(16,185,129,0.15)] hover:border-green-500/45 transition-all duration-300 cursor-pointer"
              style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(20,184,166,0.08) 50%, rgba(16,185,129,0.04) 100%)" }}
            >
              {/* Dot wave pattern background */}
              <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{
                backgroundImage: "radial-gradient(circle, #10b981 1px, transparent 1px)",
                backgroundSize: "20px 20px"
              }} />
              <div className="absolute -right-6 -top-6 w-28 h-28 blur-2xl opacity-20 dark:opacity-15 rounded-full bg-emerald-400 pointer-events-none group-hover:scale-125 transition-all duration-700" />

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌱</span>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block">Carbon Reduction</span>
                    <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500">Annual environmental impact</span>
                  </div>
                </div>
                <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Clean Energy</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 relative z-10">
                <motion.div whileHover={{ y: -3, scale: 1.03 }} className="space-y-1.5 bg-white/60 dark:bg-slate-950/30 p-4 rounded-2xl border border-emerald-500/15 dark:border-emerald-900/20 cursor-pointer">
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase block font-bold tracking-wider">Annual CO₂ Offset</span>
                  <p className="text-2xl font-black text-slate-800 dark:text-white flex items-baseline gap-1">
                    <AnimatedNumber value={co2Reduction} formatter={(v) => v.toFixed(1)} />
                    <span className="text-xs font-bold text-slate-400">Tons</span>
                  </p>
                  <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000" style={{ width: isMounted ? `${Math.min(100, co2Reduction * 20)}%` : '0%' }} />
                  </div>
                </motion.div>
                <motion.div whileHover={{ y: -3, scale: 1.03 }} className="space-y-1.5 bg-white/60 dark:bg-slate-950/30 p-4 rounded-2xl border border-emerald-500/15 dark:border-emerald-900/20 cursor-pointer">
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase block font-bold tracking-wider">Tree Equivalent</span>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 flex items-baseline gap-1">
                    🌳 <AnimatedNumber value={treesEquivalent} />
                    <span className="text-xs font-bold text-emerald-500">Trees</span>
                  </p>
                  <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-1000" style={{ width: isMounted ? `${Math.min(100, treesEquivalent / 5)}%` : '0%' }} />
                  </div>
                </motion.div>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-450 leading-normal border-t border-emerald-500/10 pt-3 relative z-10">
                Calculated using grid displacement factors. Offsets your domestic coal power generation footprint over 25 years.
              </p>
            </motion.div>

            {/* ── 7. 25-Year Cost Comparison (Bar Chart Style) ── */}
            <div className="bg-slate-50/70 dark:bg-slate-950/20 p-5 rounded-3xl border border-slate-200 dark:border-slate-800/80 space-y-6 text-left shadow-sm relative z-10">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest leading-none font-display">25-Year Lifetime Cost Comparison</h4>
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-0.5 rounded-full shadow-sm">at {tariffIncrease}% inflation</span>
              </div>

              {/* Bar chart */}
              <div className="flex items-end gap-6 h-40 pt-4 px-2 select-none">
                {/* No Solar bar */}
                <motion.div 
                  whileHover={{ y: -4 }}
                  className="flex-1 flex flex-col items-center gap-2.5 group cursor-pointer"
                >
                  <span className="text-xs font-black text-rose-500 dark:text-rose-450 group-hover:scale-110 transition-transform duration-200 leading-none">
                    ₹{Math.round(totalNoSolarCost25Years / 100000).toLocaleString('en-IN')}L
                  </span>
                  <div className="w-full relative h-28 rounded-2xl overflow-hidden bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/45 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)]">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: isMounted ? '100%' : '0%' }}
                      transition={{ type: "spring", stiffness: 60, delay: 0.1 }}
                      className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-rose-500 to-pink-400 rounded-t-2xl shadow-[0_4px_16px_rgba(244,63,94,0.3)] flex items-end justify-center overflow-hidden"
                      style={{ height: '100%' }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000 ease-out" />
                    </motion.div>
                  </div>
                  <span className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest text-center leading-none">
                    Grid Only
                  </span>
                </motion.div>

                {/* Solar bar */}
                <motion.div 
                  whileHover={{ y: -4 }}
                  className="flex-1 flex flex-col items-center gap-2.5 group cursor-pointer"
                >
                  <span className="text-xs font-black text-emerald-500 dark:text-emerald-450 group-hover:scale-110 transition-transform duration-200 leading-none">
                    ₹{Math.round(totalSolarCost25Years / 100000).toLocaleString('en-IN')}L
                  </span>
                  <div className="w-full relative h-28 rounded-2xl overflow-hidden bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/45 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)]">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: isMounted ? `${Math.max(12, Math.round((totalSolarCost25Years / totalNoSolarCost25Years) * 100))}%` : '0%' }}
                      transition={{ type: "spring", stiffness: 60, delay: 0.2 }}
                      className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-2xl shadow-[0_4px_16px_rgba(16,185,129,0.3)] flex items-end justify-center overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000 ease-out" />
                    </motion.div>
                  </div>
                  <span className="text-[10px] font-black text-emerald-500 dark:text-emerald-450 uppercase tracking-widest text-center leading-none">
                    With Solar
                  </span>
                </motion.div>

                {/* Savings column */}
                <motion.div 
                  whileHover={{ y: -4 }}
                  className="flex-1 flex flex-col items-center gap-2.5 group cursor-pointer"
                >
                  <span className="text-xs font-black text-indigo-500 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-200 leading-none">
                    ₹{Math.round(twentyFiveYearNetSavings / 100000).toLocaleString('en-IN')}L
                  </span>
                  <div className="w-full relative h-28 rounded-2xl overflow-hidden bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/45 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)]">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: isMounted ? `${Math.max(12, Math.round((twentyFiveYearNetSavings / totalNoSolarCost25Years) * 100))}%` : '0%' }}
                      transition={{ type: "spring", stiffness: 60, delay: 0.3 }}
                      className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-indigo-500 to-blue-450 rounded-t-2xl shadow-[0_4px_16px_rgba(99,102,241,0.3)] flex items-end justify-center overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000 ease-out" />
                    </motion.div>
                  </div>
                  <span className="text-[10px] font-black text-indigo-550 dark:text-indigo-400 uppercase tracking-widest text-center leading-none">
                    Net Saved
                  </span>
                </motion.div>
              </div>

              {/* Summary row */}
              <motion.div 
                whileHover={{ 
                  y: -3, 
                  scale: 1.012, 
                  boxShadow: "0 12px 20px -8px rgba(16,185,129,0.25)" 
                }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-emerald-500/10 dark:from-emerald-950/30 dark:via-teal-950/15 dark:to-emerald-950/30 border border-emerald-500/25 p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:border-emerald-500/50 transition-all duration-300 shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-500/15 dark:bg-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200 block uppercase tracking-wider leading-none">Total Net Lifetime Savings</span>
                    <span className="text-[10px] text-slate-400 block pt-1 font-medium leading-none">25-year projection including module degradation</span>
                  </div>
                </div>
                <span className="font-black text-emerald-600 dark:text-emerald-400 text-lg flex items-center gap-0.5">
                  <span className="text-xs font-extrabold">₹</span><AnimatedNumber value={twentyFiveYearNetSavings} formatter={(v) => Math.round(v).toLocaleString('en-IN')} />
                </span>
              </motion.div>
            </div>


          </div>
        </motion.div>
      </div>

      {/* Sizing and Tech Guide reference section */}
      <motion.div
        variants={itemVariants}
        whileHover={{ 
          y: -5, 
          scale: 1.006, 
          boxShadow: "0 20px 40px -15px rgba(0,0,0,0.1)" 
        }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="backdrop-blur-md bg-white/70 dark:bg-slate-950/45 p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800/60 shadow-[0_8px_32px_rgba(0,0,0,0.03)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.2)] relative overflow-hidden"
      >
        {/* Top decorative glow */}
        <div className="absolute -right-16 -top-16 w-36 h-36 blur-3xl opacity-15 rounded-full bg-amber-500 pointer-events-none" />

        {/* Card Header — compact inline */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 16, ease: "linear" }}
              className="p-3 bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 rounded-2xl shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
            >
              <Sun className="w-5 h-5 animate-pulse" />
            </motion.div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-800 dark:text-white uppercase tracking-wider leading-none font-display">
                Rooftop Solar Quick Sizing Reference
              </h3>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1">
                Standard guidelines · India · 540W modules
              </p>
            </div>
          </div>
          <div className="px-3 py-1.5 bg-amber-50/80 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-xl text-[10px] sm:text-xs font-black border border-amber-100/50 dark:border-amber-900/50 uppercase tracking-wider shrink-0 shadow-sm">
            2026 Guidelines
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-slate-150/40 dark:border-slate-800/40 overflow-hidden bg-white/30 dark:bg-slate-950/20 shadow-inner">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-slate-50/30 dark:bg-slate-950/30 border-b border-slate-150/20 dark:border-slate-800/20 text-[10px] sm:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <div className="col-span-3">System Size</div>
            <div className="col-span-2">Panels (540W)</div>
            <div className="col-span-2">Space Needed</div>
            <div className="col-span-2">Cost (w/ Subsidy)</div>
            <div className="col-span-3 text-right">25-Yr Savings</div>
          </div>

          {/* Data Rows */}
          {[
            { size: "1 kW",  panels: "~2",  space: "100 sq ft",   cost: "~₹60,000",    savings: "~₹5.3 Lakhs",   dot: "bg-sky-400",     badge: "Standard",    targetBill: 1500,  targetSpace: 100  },
            { size: "2 kW",  panels: "~4",  space: "200 sq ft",   cost: "~₹1.15 Lakh", savings: "~₹10.74 Lakhs", dot: "bg-sky-400",     badge: "Standard",    targetBill: 3000,  targetSpace: 200  },
            { size: "3 kW",  panels: "~6",  space: "300 sq ft",   cost: "~₹1.32 Lakh", savings: "~₹16.11 Lakhs", dot: "bg-amber-400",   badge: "Popular",     targetBill: 4500,  targetSpace: 300  },
            { size: "4 kW",  panels: "~8",  space: "450 sq ft",   cost: "~₹1.77 Lakh", savings: "~₹21.48 Lakhs", dot: "bg-amber-400",   badge: "Medium Home", targetBill: 6000,  targetSpace: 400  },
            { size: "5 kW",  panels: "~10", space: "500 sq ft",   cost: "~₹2.32 Lakh", savings: "~₹33.46 Lakhs", dot: "bg-emerald-400", badge: "Heavy Usage", targetBill: 7500,  targetSpace: 500  },
            { size: "10 kW", panels: "~19", space: "1,000 sq ft", cost: "~₹4.87 Lakh", savings: "~₹66.92 Lakhs", dot: "bg-indigo-400",  badge: "Commercial",  targetBill: 15000, targetSpace: 1000 },
          ].map((row, idx, arr) => (
            <motion.div
              key={idx}
              whileHover={{ 
                backgroundColor: activeTheme === "dark" ? "rgba(245,158,11,0.08)" : "rgba(245,158,11,0.045)", 
                x: 8 
              }}
              transition={{ type: "spring", stiffness: 400, damping: 24 }}
              whileTap={{ scale: 0.995 }}
              onClick={() => handleSelectReferenceSize(row.targetBill, row.targetSpace)}
              className={`grid grid-cols-12 gap-2 px-4 py-3.5 items-center cursor-pointer group/row transition-colors duration-200 text-left ${idx < arr.length - 1 ? "border-b border-slate-150/15 dark:border-slate-800/15" : ""}`}
            >
              {/* 1. Size + badge */}
              <div className="col-span-3 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full shrink-0 ${row.dot} group-hover/row:scale-130 transition-transform duration-250`} />
                <span className="font-bold text-sm text-slate-850 dark:text-slate-100 group-hover/row:text-amber-500 dark:group-hover/row:text-amber-400 tabular-nums transition-colors duration-250">{row.size}</span>
                <span className="hidden sm:inline text-[9px] font-black text-slate-400 dark:text-slate-500 bg-slate-150/40 dark:bg-slate-800/40 px-2 py-0.5 rounded-md tracking-wider uppercase group-hover/row:bg-slate-200 dark:group-hover/row:bg-slate-700 transition-colors duration-250">{row.badge}</span>
              </div>

              {/* 2. Panels */}
              <div className="col-span-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover/row:text-slate-700 dark:group-hover/row:text-slate-300 transition-colors duration-250">
                <Layers className="w-3.5 h-3.5 text-slate-350 dark:text-slate-600 shrink-0 group-hover/row:text-indigo-400 transition-colors duration-250" />
                {row.panels} panels
              </div>

              {/* 3. Space */}
              <div className="col-span-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover/row:text-slate-700 dark:group-hover/row:text-slate-300 transition-colors duration-250">
                <Home className="w-3.5 h-3.5 text-slate-350 dark:text-slate-600 shrink-0 group-hover/row:text-sky-400 transition-colors duration-250" />
                {row.space}
              </div>

              {/* 4. Cost */}
              <div className="col-span-2 text-xs font-bold text-slate-700 dark:text-slate-300 tabular-nums group-hover/row:text-slate-900 dark:group-hover/row:text-white transition-colors duration-250">
                {row.cost}
              </div>

              {/* 5. Savings */}
              <div className="col-span-3 flex justify-end">
                <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/10 px-3 py-1.5 rounded-xl group-hover/row:bg-emerald-500 group-hover/row:text-white dark:group-hover/row:text-slate-950 group-hover/row:border-emerald-500 group-hover/row:shadow-md transition-all duration-250">
                  {row.savings}
                  <ArrowUpRight className="w-3.5 h-3.5 shrink-0 group-hover/row:translate-x-0.5 group-hover/row:-translate-y-0.5 transition-transform duration-250" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-[9px] text-slate-400 dark:text-slate-600 leading-relaxed pt-3 text-left">
          *Costs based on SolarSquare starting prices, March 2026. Savings assume 3% annual tariff escalation &amp; 1% degradation. Actual results vary by configuration and local DISCOM policies.
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
