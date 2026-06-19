import React, { useState, useEffect } from "react";
import { 
  Sun, TrendingUp, TrendingDown, ArrowRight, 
  Settings, Award, ShieldCheck, 
  Leaf, Compass, Play
} from "lucide-react";
import { motion } from "framer-motion";

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
    <h1 className="text-2xl sm:text-3.5xl font-display font-black text-slate-900 dark:text-white tracking-tight">
      {greeting}
      {userName ? `, ${userName}` : ""} 👋
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
      <p className="text-sm sm:text-base font-semibold text-slate-655 dark:text-slate-300">
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
      <p className="text-sm sm:text-base font-semibold text-slate-655 dark:text-slate-300">
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
  let badgeColor = "bg-slate-100 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-350";
  if (type === "positive") {
    badgeColor = "bg-green-50 border-green-200 text-green-600 dark:bg-green-950/20 dark:border-green-900/40 dark:text-primary-green";
  } else if (type === "negative") {
    badgeColor = "bg-red-50 border-red-200 text-red-500 dark:bg-red-950/20 dark:border-red-900/40 dark:text-red-400";
  } else if (type === "neutral") {
    badgeColor = "bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-500";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${badgeColor}`}>
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
      className="bg-gradient-to-br from-white via-slate-50/20 to-blue-50/10 dark:from-slate-900 dark:via-slate-950/40 dark:to-green-950/10 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden text-left flex flex-col md:flex-row md:items-center justify-between gap-6"
    >
      {/* Decorative Glow accent */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-48 h-48 bg-primary-blue/5 dark:bg-primary-green/5 rounded-full blur-2xl pointer-events-none"></div>
      
      <div className="space-y-3.5 z-10">
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

      <div className="flex-shrink-0 z-10 self-stretch sm:self-auto flex items-center md:justify-end">
        <button
          onClick={onRunAudit}
          className="w-full sm:w-auto h-12 px-6 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider rounded-2xl text-white bg-primary-blue hover:bg-primary-blue/90 dark:bg-primary-green dark:text-slate-950 dark:hover:bg-primary-green/90 transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
        >
          Run Energy Audit
          <ArrowRight className="w-4 h-4" />
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

  return (
    <div className={`bg-gradient-to-br from-white to-slate-50/30 dark:from-slate-900 dark:to-slate-950/20 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 border-l-4 ${borderColorClass} shadow-sm text-left flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 hover:shadow-md transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850 group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
      <div className="mt-4">
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
export const EnergyHealthScore: React.FC<{ score: number }> = ({ score }) => {
  let status: "Excellent" | "Good" | "Average" | "Needs Improvement" = "Excellent";
  let colorClass = "text-green-500 dark:text-primary-green";
  let bgClass = "bg-green-50/30 dark:bg-green-950/10 border-green-200 dark:border-green-900/40";
  let desc = "Your household energy configuration is optimal.";

  if (score < 60) {
    status = "Needs Improvement";
    colorClass = "text-red-500 dark:text-red-400";
    bgClass = "bg-red-50/30 dark:bg-red-950/10 border-red-200 dark:border-red-900/40";
    desc = "High energy waste detected. Upgrade appliances or adjust hours.";
  } else if (score < 75) {
    status = "Average";
    colorClass = "text-orange-500 dark:text-warning-orange";
    bgClass = "bg-orange-50/30 dark:bg-orange-950/10 border-orange-200 dark:border-orange-900/40";
    desc = "Potential savings are available. Focus on cooling and geyser hours.";
  } else if (score < 90) {
    status = "Good";
    colorClass = "text-blue-500 dark:text-blue-400";
    bgClass = "bg-blue-50/30 dark:bg-blue-950/10 border-blue-200 dark:border-blue-900/40";
    desc = "Solid efficiency. Minor habits adjustments can unlock more savings.";
  }

  return (
    <div className={`p-6 rounded-3xl border text-left flex flex-col sm:flex-row items-center justify-between gap-6 ${bgClass} shadow-sm hover:shadow transition-shadow duration-300`}>
      <div className="space-y-2 max-w-sm">
        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-550">
          <Award className={`w-4 h-4 ${colorClass}`} />
          Energy Health Score
        </div>
        <h3 className={`text-xl font-display font-black leading-tight ${colorClass}`}>
          {status} Status
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {desc} Check insights to improve your score.
        </p>
      </div>

      <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="56"
            cy="56"
            r="46"
            className="stroke-slate-200 dark:stroke-slate-800"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="56"
            cy="56"
            r="46"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={289}
            strokeDashoffset={289 - (score / 100) * 289}
            strokeLinecap="round"
            className={`transition-all duration-1000 ease-out ${colorClass}`}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-2xl font-display font-black text-slate-850 dark:text-white leading-none">
            {score}
          </span>
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-555 uppercase mt-0.5">
            / 100
          </span>
        </div>
      </div>
    </div>
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
export const QuickActionPanel: React.FC<{
  onRunAudit: () => void;
  onGoToSolar: () => void;
  onGoToSettings: () => void;
}> = ({ onRunAudit, onGoToSolar, onGoToSettings }) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-left">
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
          Quick Actions
        </h3>
        <p className="text-[10px] text-slate-400 dark:text-slate-550 mt-0.5">
          Speed up your energy diagnostics workflow.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={onRunAudit}
          className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-150 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-slate-700 dark:bg-slate-950/20 transition-all text-center gap-1.5"
        >
          <Award className="w-5 h-5 text-primary-blue dark:text-primary-green" />
          <span className="text-[10px] font-bold text-slate-750 dark:text-slate-300">Run Audit</span>
        </button>
        <button
          onClick={onGoToSolar}
          className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-150 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-slate-700 dark:bg-slate-950/20 transition-all text-center gap-1.5"
        >
          <Sun className="w-5 h-5 text-amber-500" />
          <span className="text-[10px] font-bold text-slate-750 dark:text-slate-300">Solar Sheet</span>
        </button>
        <button
          onClick={onGoToSettings}
          className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-150 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-slate-700 dark:bg-slate-950/20 transition-all text-center gap-1.5"
        >
          <Settings className="w-5 h-5 text-slate-500" />
          <span className="text-[10px] font-bold text-slate-750 dark:text-slate-300">Settings</span>
        </button>
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
