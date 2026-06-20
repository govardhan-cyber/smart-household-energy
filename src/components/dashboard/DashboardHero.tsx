import React, { useState, useEffect } from "react";
import { 
  Sun, TrendingUp, TrendingDown, ArrowRight, 
  Settings, Award, ShieldCheck, 
  Leaf, Compass, Play,
  ChevronDown, ChevronUp, Zap, Sparkles, HelpCircle, MessageSquare,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── 0. REUSABLE ANIMATED NUMBER COMPONENT ──────────────────────────────────
export const AnimatedNumber: React.FC<{
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

// ─── 1. PERSONALIZED GREETING ────────────────────────────────────────────────
export const PersonalizedGreeting: React.FC<{ userName?: string }> = ({ userName }) => {
  const [greeting, setGreeting] = useState("Welcome Back");

  useEffect(() => {
    const updateGreeting = () => {
      const hr = new Date().getHours();
      if (hr >= 5 && hr < 12) {
        setGreeting("Good Morning");
      } else if (hr >= 12 && hr < 17) {
        setGreeting("Good Afternoon");
      } else if (hr >= 17 && hr < 19) {
        setGreeting("Good Evening");
      } else {
        setGreeting("Good Night");
      }
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <h1 className="text-2xl sm:text-3.5xl font-display font-black text-slate-900 dark:text-white tracking-tight flex flex-wrap items-center">
      <span>{greeting}</span>
      {userName && (
        <span className="bg-gradient-to-r from-primary-blue via-blue-500 to-accent-neon dark:from-primary-green dark:to-accent-neon bg-clip-text text-transparent ml-2 font-black">
          {userName}
        </span>
      )}
      <span className="ml-2">👋</span>
    </h1>
  );
};

// ─── 2. HERO INSIGHT ENGINE ──────────────────────────────────────────────────
export const HeroInsight: React.FC<{
  savingsOpportunity: number;
  solarOffsetPercent: number;
  consumptionWarning?: string; // e.g. "+14% this month"
  positiveAchievement?: string; // e.g. "-9% energy drop"
}> = ({
  savingsOpportunity,
  solarOffsetPercent,
  consumptionWarning,
  positiveAchievement
}) => {
  // Determine the highest priority insight
  if (savingsOpportunity > 200) {
    return (
      <p className="text-sm sm:text-base font-semibold text-slate-655 dark:text-slate-350">
        Your home could save{" "}
        <span className="text-primary-blue dark:text-primary-green font-black">
          ₹{Math.round(savingsOpportunity).toLocaleString("en-IN")}
        </span>{" "}
        per month.
      </p>
    );
  }

  if (solarOffsetPercent > 30) {
    return (
      <p className="text-sm sm:text-base font-semibold text-slate-655 dark:text-slate-350">
        Your roof could offset{" "}
        <span className="text-amber-500 font-black">{solarOffsetPercent}%</span> of
        your annual electricity usage.
      </p>
    );
  }

  if (consumptionWarning) {
    return (
      <p className="text-sm sm:text-base font-semibold text-red-500 dark:text-red-400">
        Warning: Your electricity consumption increased{" "}
        <span className="font-black">{consumptionWarning}</span> this month.
      </p>
    );
  }

  if (positiveAchievement) {
    return (
      <p className="text-sm sm:text-base font-semibold text-emerald-600 dark:text-primary-green">
        Great job! Your energy use dropped{" "}
        <span className="font-black">{positiveAchievement}</span> this month.
      </p>
    );
  }

  return (
    <p className="text-sm sm:text-base font-semibold text-slate-500 dark:text-slate-450">
      Your energy dashboard is fully configured. Optimize appliances below.
    </p>
  );
};

// ─── 3. TREND COMPARISON BADGE ────────────────────────────────────────────────
export const TrendComparison: React.FC<{
  label: string;
  value: string;
  trend: "up" | "down" | "neutral";
  type: "positive" | "negative" | "neutral";
}> = ({ label, value, trend, type }) => {
  let badgeColor = "bg-slate-100/80 border-slate-200/60 text-slate-600 dark:bg-slate-800/40 dark:border-slate-700/60 dark:text-slate-300";
  if (type === "positive") {
    badgeColor = "bg-green-500/8 border-green-500/20 text-green-600 dark:bg-green-500/10 dark:border-green-500/20 dark:text-primary-green";
  } else if (type === "negative") {
    badgeColor = "bg-red-500/8 border-red-500/20 text-red-500 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-450";
  } else if (type === "neutral") {
    badgeColor = "bg-amber-500/8 border-amber-500/20 text-amber-600 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-extrabold border shadow-sm backdrop-blur-sm ${badgeColor}`}>
      {trend === "up" && <TrendingUp className="w-3.5 h-3.5" />}
      {trend === "down" && <TrendingDown className="w-3.5 h-3.5" />}
      <span>
        {value} {label}
      </span>
    </span>
  );
};

// ─── 4. DASHBOARD HERO COORDINATOR ───────────────────────────────────────────
export const DashboardHero: React.FC<{
  userName?: string;
  savingsOpportunity: number;
  solarOffsetPercent: number;
  consumptionWarning?: string;
  positiveAchievement?: string;
  trends: {
    label: string;
    value: string;
    trend: "up" | "down" | "neutral";
    type: "positive" | "negative" | "neutral";
  }[];
  onRunAudit: () => void;
}> = ({
  userName,
  savingsOpportunity,
  solarOffsetPercent,
  consumptionWarning,
  positiveAchievement,
  trends,
  onRunAudit
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-gradient-to-br from-white/90 via-slate-50/50 to-blue-50/30 dark:from-slate-900/90 dark:via-slate-950/50 dark:to-emerald-950/5 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative overflow-hidden text-left flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:shadow-md transition-shadow duration-300"
    >
      {/* Decorative Glow Blob Accents */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-blue-500/10 dark:bg-blue-600/8 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-750"></div>
      <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-emerald-500/8 dark:bg-emerald-600/6 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-750"></div>
      
      {/* Blueprint Grid Mesh Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] absolute inset-0" />

      <div className="space-y-3.5 z-10 relative">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <PersonalizedGreeting userName={userName} />
        </div>
        
        <HeroInsight
          savingsOpportunity={savingsOpportunity}
          solarOffsetPercent={solarOffsetPercent}
          consumptionWarning={consumptionWarning}
          positiveAchievement={positiveAchievement}
        />

        {/* Render comparison trend badges */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {trends.map((tr, idx) => (
            <TrendComparison 
              key={idx}
              label={tr.label}
              value={tr.value}
              trend={tr.trend}
              type={tr.type}
            />
          ))}
        </div>
      </div>

      <div className="flex-shrink-0 z-10 self-stretch sm:self-auto flex items-center md:justify-end relative">
        <button
          onClick={onRunAudit}
          className="w-full sm:w-auto h-12 px-6 inline-flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider rounded-2xl text-white bg-primary-blue hover:bg-primary-blue/90 dark:bg-primary-green dark:text-slate-950 dark:hover:bg-primary-green/90 transition-all shadow-md hover:shadow-lg hover:scale-[1.03] hover:shadow-primary-blue/10 dark:hover:shadow-primary-green/10 active:scale-[0.98] group cursor-pointer"
        >
          Run Energy Audit
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
        </button>
      </div>
    </motion.div>
  );
};

// ─── 5. KPI CARD ─────────────────────────────────────────────────────────────
export const KpiCard: React.FC<{
  title: string;
  value: number;
  subtext: string;
  icon: React.ReactNode;
  borderColorClass: string;
  isCurrency?: boolean;
  isPercent?: boolean;
}> = ({
  title,
  value,
  subtext,
  icon,
  borderColorClass,
  isCurrency = false,
  isPercent = false
}) => {
  const formatter = (v: number) => {
    const rounded = Math.round(v);
    if (isCurrency) return `₹${rounded.toLocaleString("en-IN")}`;
    if (isPercent) return `${rounded}%`;
    return rounded.toString();
  };

  // Map border classes to custom glowing background colors
  const glowColorMap: Record<string, string> = {
    "border-l-primary-blue": "bg-blue-400 dark:bg-blue-600",
    "border-l-warning-orange": "bg-orange-400 dark:bg-orange-600",
    "border-l-primary-green": "bg-emerald-400 dark:bg-emerald-600",
    "border-l-amber-500": "bg-amber-400 dark:bg-amber-600",
  };
  const glowBgClass = glowColorMap[borderColorClass] || "bg-slate-400 dark:bg-slate-600";

  return (
    <div className={`bg-gradient-to-br from-white to-slate-50/30 dark:from-slate-900 dark:to-slate-950/20 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 border-l-4 ${borderColorClass} shadow-sm text-left flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 hover:shadow-md transition-all duration-300`}>
      {/* Top right corner glowing wash */}
      <div className={`absolute -right-12 -top-12 w-36 h-36 blur-2xl opacity-20 dark:opacity-10 rounded-full pointer-events-none ${glowBgClass} group-hover:scale-125 transition-transform duration-500`} />

      <div className="flex items-center justify-between relative z-10">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850 group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
      <div className="mt-4 relative z-10">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-display font-black text-slate-900 dark:text-white leading-none">
            <AnimatedNumber value={value} formatter={formatter} />
          </span>
          {!isCurrency && !isPercent && (
            <span className="text-xs font-bold text-slate-400 dark:text-slate-550">kWh</span>
          )}
        </div>
        <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-500 mt-2 leading-relaxed">
          {subtext}
        </p>
      </div>
    </div>
  );
};

// ─── 6. ENERGY HEALTH SCORE CARD ──────────────────────────────────────────────
export const calculateScoreForReport = (report: any) => {
  if (!report || !report.appliances || report.appliances.length === 0) return 100;
  let score = 100;
  
  // A. Monthly consumption penalty
  if (report.totalUnits > 250) {
    const excess = report.totalUnits - 250;
    const penalty = Math.min(30, (excess / 250) * 15);
    score -= penalty;
  } else {
    const savings = 250 - report.totalUnits;
    const bonus = Math.min(5, (savings / 250) * 10);
    score += bonus;
  }

  // B. Savings opportunity penalty
  const billCharge = report.estimatedBill || 1;
  const savingsRatio = report.savingsPotential / billCharge;
  if (savingsRatio > 0.05) {
    const savingsPenalty = Math.min(30, savingsRatio * 50);
    score -= savingsPenalty;
  }

  // C. Solar offset bonus
  const solarOffsetPercent = report.totalUnits > 0 && report.usageAfter !== undefined 
    ? Math.min(100, Math.round(((report.totalUnits - report.usageAfter) / report.totalUnits) * 100))
    : 0;
  if (solarOffsetPercent > 0) {
    const solarBonus = Math.min(15, (solarOffsetPercent / 100) * 15);
    score += solarBonus;
  }

  // D. Appliance specific runtime penalties
  const ac = report.appliances.find((a: any) => a.name?.toLowerCase() === "air conditioner" || a.name?.toLowerCase() === "ac" || a.id === "ac");
  if (ac && ac.hours > 6) {
    score -= 10;
  }

  const lights = report.appliances.find((a: any) => a.name?.toLowerCase() === "lights" || a.name?.toLowerCase() === "tube light" || a.id === "lights");
  if (lights && lights.watts > 12) {
    score -= 5;
  }

  const fridge = report.appliances.find((a: any) => a.name?.toLowerCase() === "refrigerator" || a.name?.toLowerCase() === "fridge" || a.id === "fridge");
  if (fridge && fridge.quantity > 1) {
    score -= 5;
  }

  return Math.max(10, Math.min(100, Math.round(score)));
};

export interface EnergyHealthScoreProps {
  score: number;
  reports?: any[];
  totalUnits?: number;
  savingsPotential?: number;
  solarOffsetPercent?: number;
  appliances?: {
    id: string;
    name: string;
    quantity: number;
    hours: number;
    watts: number;
    age?: number;
    unitAges?: number[];
  }[];
}

export const EnergyHealthScore: React.FC<EnergyHealthScoreProps> = ({ 
  score,
  reports = [],
  totalUnits = 0,
  savingsPotential = 0,
  solarOffsetPercent = 0,
  appliances = []
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showDetails, setShowDetails] = useState(true);
  const [showAiExpl, setShowAiExpl] = useState(false);
  
  // Staged animation state reveals
  const [showGrade, setShowGrade] = useState(false);
  const [showSavings, setShowSavings] = useState(false);

  // Animate the score counting up on load/update
  useEffect(() => {
    setAnimatedScore(0);
    setShowGrade(false);
    setShowSavings(false);

    const start = 0;
    const end = score;
    if (start === end) {
      setAnimatedScore(end);
      setShowGrade(true);
      setShowSavings(true);
      return;
    }

    const duration = 1200; // 1.2s to count up
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = progress * (2 - progress); // Ease out quad
      
      setAnimatedScore(Math.round(start + easedProgress * (end - start)));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setTimeout(() => setShowGrade(true), 150);
        setTimeout(() => setShowSavings(true), 300);
      }
    };

    requestAnimationFrame(animate);
  }, [score]);

  // Compute Letter Grade & Status Colors
  let grade = "D";
  let statusText = "Needs Improvement";
  let subtext = "Low efficiency home";
  let gradientStart = "#EF4444";
  let gradientEnd = "#DC2626";
  let glowColor = "rgba(239, 68, 68, 0.2)";

  if (score >= 90) {
    grade = "A+";
    statusText = "Excellent";
    subtext = "Top 5% Efficient Homes";
    gradientStart = "#22C55E";
    gradientEnd = "#38BDF8";
    glowColor = "rgba(34, 197, 94, 0.2)";
  } else if (score >= 80) {
    grade = "A";
    statusText = "Very Good";
    subtext = "Top 18% Efficient Homes";
    gradientStart = "#22C55E";
    gradientEnd = "#84CC16";
    glowColor = "rgba(34, 197, 94, 0.25)";
  } else if (score >= 70) {
    grade = "B";
    statusText = "Good";
    subtext = "Above Average Efficiency";
    gradientStart = "#FACC15";
    gradientEnd = "#F59E0B";
    glowColor = "rgba(250, 204, 21, 0.2)";
  } else if (score >= 60) {
    grade = "C";
    statusText = "Average";
    subtext = "Typical Energy Profile";
    gradientStart = "#FB923C";
    gradientEnd = "#EA580C";
    glowColor = "rgba(251, 146, 60, 0.2)";
  }

  // Calculate dynamic sub-score breakdown (max sum matches `score` exactly)
  const rawConsumption = Math.max(10, Math.min(50, Math.round(
    totalUnits > 250 
      ? 40 - Math.min(30, ((totalUnits - 250) / 250) * 15) 
      : 40 + Math.min(10, ((250 - totalUnits) / 250) * 10)
  )));

  const acApp = appliances.find(a => a.id === "ac" && a.quantity > 0);
  const lightsApp = appliances.find(a => a.id === "lights" && a.quantity > 0);
  const fridgeApp = appliances.find(a => a.id === "fridge" && a.quantity > 0);
  const billCharge = totalUnits * 7.5;
  const savingsRatio = savingsPotential / (billCharge || 1);

  const rawEfficiency = Math.max(5, Math.min(20, Math.round(
    20 - (acApp && acApp.hours > 6 ? 6 : 0)
       - (lightsApp && lightsApp.watts > 12 ? 3 : 0)
       - (fridgeApp && fridgeApp.quantity > 1 ? 3 : 0)
       - Math.min(8, savingsRatio * 25)
  )));

  const rawCarbon = Math.max(5, Math.min(20, Math.round(
    20 - Math.min(15, (totalUnits / 500) * 15)
  )));

  const rawSolar = Math.max(1, Math.min(10, Math.round(
    solarOffsetPercent > 0 
      ? 3 + Math.min(7, (solarOffsetPercent / 100) * 7) 
      : 5
  )));

  const rawSum = rawConsumption + rawEfficiency + rawCarbon + rawSolar;
  const diff = score - rawSum;

  let subConsumption = rawConsumption;
  let subEfficiency = rawEfficiency;
  let subCarbon = rawCarbon;
  let subSolar = rawSolar;

  if (diff !== 0) {
    const oldCons = subConsumption;
    subConsumption = Math.max(10, Math.min(50, subConsumption + diff));
    const remainingDiff = diff - (subConsumption - oldCons);
    
    if (remainingDiff !== 0) {
      const oldCarbon = subCarbon;
      subCarbon = Math.max(5, Math.min(20, subCarbon + remainingDiff));
      const remainingDiff2 = remainingDiff - (subCarbon - oldCarbon);
      
      if (remainingDiff2 !== 0) {
        subEfficiency = Math.max(5, Math.min(20, subEfficiency + remainingDiff2));
      }
    }
  }

  // Calculate score trend compared to previous reports
  const [trend, setTrend] = useState<{
    text: string;
    type: "up" | "down" | "neutral";
    value: number;
  }>({ text: "Initial Baseline", type: "neutral", value: 0 });

  useEffect(() => {
    if (reports && reports.length > 0) {
      const latestSavedReport = reports[0];
      const prevScore = calculateScoreForReport(latestSavedReport);
      const diffScore = score - prevScore;
      
      if (diffScore > 0) {
        setTrend({ text: `+${diffScore} Since Last Audit`, type: "up", value: diffScore });
      } else if (diffScore < 0) {
        setTrend({ text: `-${Math.abs(diffScore)} Since Last Audit`, type: "down", value: Math.abs(diffScore) });
      } else {
        setTrend({ text: "Steady progress", type: "neutral", value: 0 });
      }
    } else {
      setTrend({ text: "Initial Baseline Started", type: "neutral", value: 0 });
    }
  }, [reports, score]);

  // Construct tailored AI explanations
  const getExplanationPoints = () => {
    const positives: string[] = [];
    const negatives: string[] = [];

    if (totalUnits <= 250) {
      positives.push(`Monthly usage is highly efficient at ${totalUnits} kWh (below 250 kWh target).`);
    } else {
      negatives.push(`Monthly usage (${totalUnits} kWh) is elevated, incurring higher slab charges.`);
    }

    if (savingsRatio > 0.15) {
      negatives.push(`Potential savings of ₹${Math.round(savingsPotential)}/mo are active (could cut bill by ${(savingsRatio * 100).toFixed(0)}%).`);
    } else if (savingsPotential > 0) {
      positives.push(`Wasted energy potential is minimal (savings capped at ₹${Math.round(savingsPotential)}/mo).`);
    }

    if (solarOffsetPercent > 0) {
      positives.push(`Solar setup successfully offsets ${solarOffsetPercent}% of grid dependency.`);
    }

    if (acApp && acApp.hours > 6) {
      negatives.push(`High AC runtime (${acApp.hours} hrs/day) increases consumption.`);
    } else if (acApp && acApp.quantity > 0) {
      positives.push(`AC usage is kept within highly optimized runtime limits (${acApp.hours} hrs/day).`);
    }

    if (fridgeApp && fridgeApp.quantity > 1) {
      negatives.push("Multiple refrigerators running simultaneously multiplies your base load.");
    }

    let hasDecayAC = acApp?.unitAges?.some(age => age >= 5) ?? false;
    let hasDecayFridge = fridgeApp?.unitAges?.some(age => age >= 5) ?? false;
    const fanApp = appliances.find(a => a.id === "fan");
    let hasDecayFan = fanApp?.unitAges?.some(age => age >= 5) ?? false;

    if (hasDecayAC || hasDecayFridge || hasDecayFan) {
      const decayingApps = [];
      if (hasDecayAC) decayingApps.push("AC");
      if (hasDecayFridge) decayingApps.push("Fridge");
      if (hasDecayFan) decayingApps.push("Fan");
      negatives.push(`Efficiency decay (loss of up to 15%) detected on aging ${decayingApps.join(", ")} units.`);
    }

    return { positives, negatives };
  };

  const { positives, negatives } = getExplanationPoints();

  // Opens ChatBot with preset prompt
  const handleConsultAI = () => {
    window.dispatchEvent(new CustomEvent("she_trigger_chat", { 
      detail: { message: `Analyze my Energy Health Score of ${score}/100 (Grade ${grade}, Status: ${statusText}). My appliances details: ${appliances.map(a => `${a.name}: ${a.quantity}x (${a.hours}h/day)`).join(", ")}. How can I improve my score?` } 
    }));
  };

  const circumference = 339.3; // 2 * pi * 54
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden text-left hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 relative w-full"
      style={{
        boxShadow: `0 4px 20px -2px rgba(0,0,0,0.05), 0 0 25px ${glowColor}`
      }}
    >
      {/* SVG Linear Gradient Definitions */}
      <svg className="absolute w-0 h-0">
        <defs>
          <linearGradient id="premiumScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientStart} />
            <stop offset="100%" stopColor={gradientEnd} />
          </linearGradient>
        </defs>
      </svg>

      {/* Main card body */}
      <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 cursor-pointer" onClick={() => setShowDetails(!showDetails)}>
        <div className="space-y-3.5 flex-1">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-550">
            <Award className="w-4.5 h-4.5 text-slate-400" />
            <span>Energy Health Score</span>
            {showDetails ? <ChevronUp className="w-3.5 h-3.5 ml-1 text-slate-400 dark:text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 ml-1 text-slate-400 dark:text-slate-500" />}
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-display font-black text-slate-900 dark:text-white leading-tight">
              {statusText} Status
            </h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-450 leading-relaxed">
              {subtext}
            </p>
          </div>

          {/* Trend Indicator */}
          <div className="flex items-center gap-1.5 pt-1">
            {trend.type === "up" ? (
              <div className="flex items-center gap-1 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-primary-green px-2.5 py-1 rounded-full text-[10px] font-bold border border-green-150 dark:border-green-900/30">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{trend.text}</span>
              </div>
            ) : trend.type === "down" ? (
              <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 px-2.5 py-1 rounded-full text-[10px] font-bold border border-red-150 dark:border-red-900/30">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>{trend.text}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-full text-[10px] font-bold border border-slate-200 dark:border-slate-750">
                <span>{trend.text}</span>
              </div>
            )}
          </div>
        </div>

        {/* Premium Score Ring */}
        <div className="flex flex-col items-center gap-2.5 shrink-0">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background circle track */}
              <circle
                cx="72"
                cy="72"
                r="54"
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="14"
                fill="transparent"
              />
              {/* Foreground animated progress */}
              <circle
                cx="72"
                cy="72"
                r="54"
                stroke="url(#premiumScoreGradient)"
                strokeWidth="14"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300 ease-out"
              />
            </svg>
            
            <div className="absolute flex flex-col items-center justify-center text-center">
              {/* Score Number */}
              <span className="text-3xl font-display font-black text-slate-900 dark:text-white leading-none">
                {animatedScore}
              </span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-0.5 tracking-wider">
                / 100
              </span>
            </div>
          </div>

          {/* Letter Grade (Animated reveal) outside the circle! */}
          <AnimatePresence>
            {showGrade && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-slate-950 dark:bg-slate-800 text-white dark:text-primary-green px-3 py-1 rounded-full text-[10px] font-black tracking-wide uppercase shadow-md border border-slate-750"
              >
                Grade {grade}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Staged savings reveal */}
      <AnimatePresence>
        {showSavings && savingsPotential > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="px-6 pb-5 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4"
          >
            <span className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-550 tracking-wider">Potential Savings:</span>
            <span className="text-xs font-black text-primary-green bg-green-50/60 dark:bg-green-950/20 px-3 py-1 rounded-xl border border-green-100 dark:border-green-900/30">
              ₹{Math.round(savingsPotential)} / month
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Expandable Detailed Breakdown Panel */}
      <AnimatePresence>
        {showDetails && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 px-6 py-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-450 dark:text-slate-500 flex items-center gap-1">
                <span>Detailed Performance Breakdown</span>
                {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </h4>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAiExpl(!showAiExpl);
                }}
                className="flex items-center gap-1 text-[10px] font-extrabold text-primary-blue dark:text-primary-green hover:underline cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showAiExpl ? "Show Scores" : "Explain Score"}</span>
              </button>
            </div>

            {!showAiExpl ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Consumption */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      Consumption
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{subConsumption} <span className="text-slate-400">/ 50</span></span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-1000" 
                      style={{ width: `${(subConsumption / 50) * 100}%` }}
                    />
                  </div>
                </div>

                {/* 2. Efficiency */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <Sparkles className="w-3.5 h-3.5 text-primary-green" />
                      Appliance Efficiency
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{subEfficiency} <span className="text-slate-400">/ 20</span></span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-1000" 
                      style={{ width: `${(subEfficiency / 20) * 100}%` }}
                    />
                  </div>
                </div>

                {/* 3. Carbon Impact */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <Leaf className="w-3.5 h-3.5 text-green-500" />
                      Carbon Impact
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{subCarbon} <span className="text-slate-400">/ 20</span></span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000" 
                      style={{ width: `${(subCarbon / 20) * 100}%` }}
                    />
                  </div>
                </div>

                {/* 4. Solar Potential */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <Sun className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                      Solar Gen Potential
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{subSolar} <span className="text-slate-400">/ 10</span></span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all duration-1000" 
                      style={{ width: `${(subSolar / 10) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Real-time Dynamic AI Audit Logs Panel */
              <div className="space-y-3.5 text-xs text-slate-655 dark:text-slate-350">
                <div className="space-y-2 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner max-h-44 overflow-y-auto">
                  <div className="font-bold text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-slate-800">
                    Why is my score {score}?
                  </div>
                  
                  {positives.map((p, idx) => (
                    <div key={idx} className="flex gap-2 items-start text-green-600 dark:text-primary-green">
                      <span className="font-bold shrink-0">✓</span>
                      <span>{p}</span>
                    </div>
                  ))}

                  {negatives.map((n, idx) => (
                    <div key={idx} className="flex gap-2 items-start text-red-500 dark:text-red-400">
                      <span className="font-bold shrink-0">⚠</span>
                      <span>{n}</span>
                    </div>
                  ))}
                  
                  {positives.length === 0 && negatives.length === 0 && (
                    <p className="text-slate-400 italic">Configure your appliances in the audit tabs to generate real-time AI logs.</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleConsultAI}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[10px] font-bold text-white bg-primary-blue hover:bg-primary-blue/90 dark:bg-primary-green dark:text-slate-950 dark:hover:bg-primary-green/90 transition-all cursor-pointer shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Consult AI Advisor</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};


// ─── 7. INSIGHT CARD ──────────────────────────────────────────────────────────
export const InsightCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  impact: string;
  difficulty?: string;
}> = ({ icon, title, description, impact, difficulty = "Easy" }) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 shadow-sm flex flex-col justify-between space-y-4 hover:-translate-y-0.5 transition-all">
      <div className="space-y-2.5 text-left">
        <div className="flex items-center justify-between">
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-350">
            {icon}
          </div>
          <span className="text-[9px] font-extrabold px-1.5 py-0.5 border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800 text-slate-550 dark:text-slate-300 rounded-lg uppercase tracking-wide">
            {difficulty}
          </span>
        </div>
        <div>
          <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide truncate">
            {title}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      <div className="border-t border-slate-50 dark:border-slate-850 pt-3 flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-555 uppercase">Estimated Impact:</span>
        <span className="text-xs font-black text-primary-green font-display">{impact}</span>
      </div>
    </div>
  );
};

// ─── 8. QUICK ACTION PANEL ───────────────────────────────────────────────────
// ─── 8. QUICK ACTION PANEL ───────────────────────────────────────────────────
export interface QuickActionPanelProps {
  onRunAudit: () => void;
  onGoToSolar: () => void;
  onGoToSettings: () => void;
  reports?: any[];
}

export const QuickActionPanel: React.FC<QuickActionPanelProps> = ({ 
  onRunAudit, 
  onGoToSolar, 
  onGoToSettings,
  reports = []
}) => {
  const getRecentActivities = () => {
    if (reports && reports.length > 0) {
      const latest = reports[0];
      const activities = ["Audit completed"];
      
      let scoreDiff = 5; // default/baseline improvement
      if (reports.length > 1) {
        const prev = reports[1];
        const prevScore = calculateScoreForReport(prev);
        const curScore = calculateScoreForReport(latest);
        const diff = curScore - prevScore;
        scoreDiff = diff > 0 ? diff : 0;
      }
      activities.push(`Score improved +${scoreDiff}`);
      
      const savings = latest.savingsPotential > 0 ? Math.round(latest.savingsPotential) : 420;
      activities.push(`Potential savings ₹${savings}`);
      
      return activities;
    }
    
    return [
      "Audit completed",
      "Score improved +5",
      "Potential savings ₹420"
    ];
  };

  const recentActivities = getRecentActivities();

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-left">
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
          Quick Actions
        </h3>
        <p className="text-[10px] text-slate-400 dark:text-slate-550 mt-0.5">
          Speed up your energy diagnostics workflow.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Card 1: Energy Audit */}
        <div 
          onClick={onRunAudit}
          style={{
            background: "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))"
          }}
          className="p-5 rounded-3xl border border-green-200/40 dark:border-green-900/20 flex flex-col justify-between h-[280px] transition-all duration-[250ms] ease-in-out hover:-translate-y-[6px] hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_12px_30px_rgba(0,0,0,0.3)] cursor-pointer group text-left"
        >
          <div className="space-y-4">
            <div className="p-3 bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-primary-green rounded-2xl w-fit">
              <Zap className="w-14 h-14 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="space-y-1 mt-1">
              <h4 className="text-base font-display font-black text-slate-900 dark:text-white leading-tight">
                Run Energy Audit
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-450 leading-normal">
                Analyze your home
              </p>
              <p className="text-xs font-bold text-green-600 dark:text-primary-green leading-normal">
                Save up to ₹500/mo
              </p>
            </div>
          </div>
          <button className="flex items-center gap-1.5 text-[10px] font-black text-green-600 dark:text-primary-green group-hover:translate-x-1 transition-transform duration-300 w-fit">
            <span>Start Audit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: Solar Planner */}
        <div 
          onClick={onGoToSolar}
          style={{
            background: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))"
          }}
          className="p-5 rounded-3xl border border-amber-200/40 dark:border-amber-900/20 flex flex-col justify-between h-[280px] transition-all duration-[250ms] ease-in-out hover:-translate-y-[6px] hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_12px_30px_rgba(0,0,0,0.3)] cursor-pointer group text-left"
        >
          <div className="space-y-4">
            <div className="p-3 bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 rounded-2xl w-fit">
              <Sun className="w-14 h-14 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="space-y-1 mt-1">
              <h4 className="text-base font-display font-black text-slate-900 dark:text-white leading-tight">
                Solar Planner
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-450 leading-normal">
                Calculate ROI
              </p>
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 leading-normal">
                Payback in 4.5 yrs
              </p>
            </div>
          </div>
          <button className="flex items-center gap-1.5 text-[10px] font-black text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform duration-300 w-fit">
            <span>Plan Solar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: Settings */}
        <div 
          onClick={onGoToSettings}
          style={{
            background: "linear-gradient(135deg, rgba(56,189,248,0.15), rgba(56,189,248,0.05))"
          }}
          className="p-5 rounded-3xl border border-sky-200/40 dark:border-sky-900/20 flex flex-col justify-between h-[280px] transition-all duration-[250ms] ease-in-out hover:-translate-y-[6px] hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_12px_30px_rgba(0,0,0,0.3)] cursor-pointer group text-left"
        >
          <div className="space-y-4">
            <div className="p-3 bg-sky-500/10 dark:bg-sky-500/20 text-sky-500 rounded-2xl w-fit">
              <Settings className="w-14 h-14 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="space-y-1 mt-1">
              <h4 className="text-base font-display font-black text-slate-900 dark:text-white leading-tight">
                Settings
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-450 leading-normal">
                Manage preferences
              </p>
              <p className="text-xs font-bold text-sky-600 dark:text-sky-400 leading-normal">
                Update profile
              </p>
            </div>
          </div>
          <button className="flex items-center gap-1.5 text-[10px] font-black text-sky-600 dark:text-sky-400 group-hover:translate-x-1 transition-transform duration-300 w-fit">
            <span>Configure</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-slate-100 dark:border-slate-800" />

      {/* Recent Activity */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-550">
          Recent Activity
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {recentActivities.map((act, idx) => (
            <div 
              key={idx} 
              className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-850"
            >
              <div className="p-1.5 rounded-lg bg-green-500/10 text-green-500 dark:bg-green-950/20 dark:text-primary-green shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">
                {act}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── 9. DASHBOARD WELCOME STATE (EMPTY DATA STATE) ───────────────────────────
export const DashboardWelcomeState: React.FC<{ onStartAudit: () => void }> = ({ onStartAudit }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-8 sm:p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-6 max-w-4xl mx-auto"
    >
      <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 bg-primary-blue/5 dark:bg-primary-green/5 rounded-full animate-pulse"></div>
        <div className="relative p-5 rounded-full bg-slate-50 dark:bg-slate-950/40 text-primary-blue dark:text-primary-green border border-slate-100 dark:border-slate-800 shadow-inner">
          <Compass className="w-10 h-10 animate-spin-slow" />
        </div>
      </div>

      <div className="space-y-2 max-w-lg mx-auto">
        <h2 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white tracking-tight">
          Welcome to Smart Household Energy
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Add appliances or upload a bill to receive personalized energy insights. Your smart assistant will automatically calculate slab consumption and rank efficiency.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={onStartAudit}
          className="w-full sm:w-auto h-11 px-6 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider rounded-xl text-white bg-primary-blue hover:bg-primary-blue/90 dark:bg-primary-green dark:text-slate-950 dark:hover:bg-primary-green/90 transition-all shadow-md active:scale-[0.98]"
        >
          Start Energy Audit
          <Play className="w-3.5 h-3.5 fill-current" />
        </button>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-850 max-w-md mx-auto grid grid-cols-3 gap-4 text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wide">
        <div className="flex flex-col items-center gap-1">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Slab Accurate</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Leaf className="w-4 h-4 text-emerald-500" />
          <span>Eco Auditing</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Sun className="w-4 h-4 text-amber-500" />
          <span>Solar Sizing</span>
        </div>
      </div>
    </motion.div>
  );
};
