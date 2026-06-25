import React, { useState } from "react";
import { 
  Sparkles, Download, Printer, TrendingDown, RefreshCw, Leaf, 
  ArrowRight, Award
} from "lucide-react";
import { motion } from "framer-motion";
import { calculateBill } from "../../utils/tariffCalculator";
import type { ApplianceItem } from "../../utils/tariffCalculator";

interface Recommendation {
  id: string;
  title: string;
  description: string;
  savings: number;
  badge: "High" | "Medium" | "Low" | "Minor";
  badgeColor: string;
  icon: any;
  difficulty?: "Easy" | "Medium" | "Hard";
  impact?: "High" | "Medium" | "Low";
}

interface AnalysisResult {
  totalUnits: number;
  billing: {
    netEnergyCharge: number;
    stateName: string;
  };
  savingsPotential: number;
  usageAfter: number;
  billAfter: number;
  recommendations: Recommendation[];
  beforeCo2: number;
  beforeTrees: number;
  afterCo2: number;
  afterTrees: number;
  savedCo2: number;
  savedTrees: number;
}

const SCHEDULING_ITEMS = [
  {
    id: "ac",
    icon: "🌡️",
    title: "Optimize AC Temperature Setpoint",
    description: "Setting AC to 24°C instead of 18°C reduces continuous compressor load by ~35%.",
    savingsText: "Save ₹350/month"
  },
  {
    id: "washing_machine",
    icon: "🌙",
    title: "Run Washing Machine After 10 PM",
    description: "Shift heavy wash loads to off-peak periods (10 PM – 6 AM) to align with national grid load management directives.",
    savingsText: "Save ₹120/month"
  },
  {
    id: "water_heater",
    icon: "⚡",
    title: "Pre-heat Water Geyser Off-Peak",
    description: "Program storage geysers to run before 7:00 AM. Avoid peak hours (8 AM – 11 AM) to prevent slab surges.",
    savingsText: "Save ₹180/month"
  },
  {
    id: "tv",
    icon: "🔌",
    title: "Automate TV Standby Shutoff",
    description: "Phantom power draws 10W-20W continuously when set-top boxes and LED TVs are left on standby overnight.",
    savingsText: "Save ₹90/month"
  },
  {
    id: "fridge",
    icon: "❄️",
    title: "Optimize Refrigerator Vent & Placement",
    description: "Keep a 5-10cm gap from walls and clean condenser coils twice a year to maintain optimal heat exchange.",
    savingsText: "Save ₹100/month"
  },
  {
    id: "lights",
    icon: "💡",
    title: "Maximize Natural Daylighting",
    description: "Position workspaces near windows and turn off LEDs in empty rooms. Consider motion sensor triggers.",
    savingsText: "Save ₹80/month"
  },
  {
    id: "fan",
    icon: "🌀",
    title: "Set Fan Direction & Speed",
    description: "Ensure ceiling fans rotate counter-clockwise to push cool air down, and run them at lower regulator speeds.",
    savingsText: "Save ₹60/month"
  }
];

const getGlowClasses = (badge: "High" | "Medium" | "Low" | "Minor") => {
  switch (badge) {
    case "High":
      return "hover:shadow-[0_0_30px_rgba(16,185,129,0.18)] hover:border-emerald-500/30 dark:hover:shadow-[0_0_40px_rgba(16,185,129,0.25)] dark:hover:border-emerald-500/40";
    case "Medium":
      return "hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] hover:border-orange-500/30 dark:hover:shadow-[0_0_40px_rgba(249,115,22,0.22)] dark:hover:border-orange-500/40";
    case "Low":
    case "Minor":
    default:
      return "hover:shadow-[0_0_30px_rgba(37,99,235,0.12)] hover:border-blue-500/30 dark:hover:shadow-[0_0_40px_rgba(37,99,235,0.2)] dark:hover:border-blue-500/40";
  }
};

interface SavingsAdvisorProps {
  analysisResult: AnalysisResult;
  activeApplianceIds: string[];
  onExportCSV: () => void;
  onPrint: () => void;
  onBack: () => void;
  onReset: () => void;
  stateKey?: string;
  customFlatRate?: number;
  activeAppliances?: ApplianceItem[];
}

export const SavingsAdvisor: React.FC<SavingsAdvisorProps> = ({
  analysisResult,
  activeApplianceIds = [],
  onExportCSV,
  onPrint,
  onBack,
  onReset,
  stateKey = "ap",
  customFlatRate = 7.5,
  activeAppliances = []
}) => {
  const [reduction, setReduction] = useState(20);

  // Find AC usage or fallback
  const acApp = activeAppliances.find(a => a.id === "ac");
  const acUnits = acApp ? acApp.quantity * (acApp.watts / 1000) * acApp.hours * 30 : 0;
  
  const isAcActive = acUnits > 0;
  const simulableUnits = isAcActive ? acUnits : (analysisResult.totalUnits * 0.4);
  const sliderLabel = isAcActive ? "AC consumption reduced" : "Heavy appliance load reduced";
  
  const reducedUnits = (simulableUnits * reduction) / 100;
  const newUnits = Math.max(0, analysisResult.totalUnits - reducedUnits);
  
  // Calculate simulated bill
  const currentBillResult = calculateBill(analysisResult.totalUnits, stateKey, customFlatRate);
  const simulatedBillResult = calculateBill(newUnits, stateKey, customFlatRate);
  
  const savings = Math.max(0, currentBillResult.netEnergyCharge - simulatedBillResult.netEnergyCharge);

  // Animation variants
  const listVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 260,
        damping: 22
      }
    }
  } as const;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-8 text-left w-full mx-auto"
    >
      {/* Top Banner Card: Interactive Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-blue via-blue-650 to-indigo-700 dark:from-primary-green dark:via-emerald-650 dark:to-teal-800 rounded-3xl p-6 sm:p-8 shadow-lg shadow-primary-blue/10 dark:shadow-none text-white flex flex-col md:flex-row md:items-center justify-between gap-6 group">
        <div className="absolute -right-24 -top-24 w-64 h-64 blur-3xl opacity-20 rounded-full bg-white pointer-events-none group-hover:scale-125 transition-transform duration-700" />
        <div className="absolute -left-16 -bottom-16 w-48 h-48 blur-2xl opacity-10 rounded-full bg-cyan-400 pointer-events-none group-hover:scale-125 transition-transform duration-700" />
        <div className="absolute inset-0 hero-dot-grid opacity-[0.04] pointer-events-none" />

        <div className="space-y-3 relative z-10 text-left max-w-xl">
          <div className="inline-flex items-center gap-2 bg-white/10 dark:bg-slate-950/20 border border-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-blue-100 dark:text-primary-green">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 dark:text-primary-green animate-pulse" />
            Saving Advisory Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white leading-tight">
            Energy Saving Recommendations
          </h1>
          <p className="text-xs sm:text-sm font-medium text-blue-100/80 dark:text-emerald-100/80 leading-relaxed">
            Personalized conservation strategies designed to optimize slab utilization thresholds and shrink your carbon footprints.
          </p>
          
          {/* Export Actions for Step 4 */}
          <div className="flex gap-2.5 pt-1.5 no-print">
            <button
              onClick={onExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-white/20 hover:border-white/40 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer active:scale-95 shadow-sm"
              title="Download CSV report"
            >
              <Download className="w-4 h-4 text-white" />
              Export CSV Report
            </button>
            <button
              onClick={onPrint}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-white/20 hover:border-white/40 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer active:scale-95 shadow-sm"
              title="Print / Save PDF report"
            >
              <Printer className="w-4 h-4 text-white" />
              Print PDF
            </button>
          </div>
        </div>

        {/* Total Potential Savings Badge */}
        <div className="relative z-10 flex items-center gap-4 p-4.5 rounded-2xl bg-white/10 dark:bg-slate-950/30 border border-white/20 dark:border-primary-green/20 self-start md:self-auto shadow-md hover:border-white/30 transition-all duration-300">
          <div className="p-3 bg-white/25 dark:bg-emerald-500/10 rounded-xl text-white dark:text-primary-green">
            <TrendingDown className="w-6 h-6 animate-bounce" />
          </div>
          <div className="text-left">
            <span className="text-[9px] font-black text-blue-100 dark:text-emerald-100/80 uppercase tracking-widest block">
              Total Potential Savings
            </span>
            <h4 className="text-xl sm:text-2xl font-black text-white mt-0.5 font-display tracking-tight">
              ₹{analysisResult.savingsPotential.toFixed(1)}<span className="text-xs font-bold text-blue-100/80">/mo</span>
            </h4>
          </div>
        </div>
      </div>

      {/* Recommendations list (Professional styled grid layout) */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest text-left block">
          Customized Saving Actions
        </h3>
        
        <motion.div 
          variants={listVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {analysisResult.recommendations.map((tip) => {
            const difficulty = tip.difficulty || "Easy";
            const impact = tip.impact || (tip.badge === "High" ? "High" : tip.badge === "Medium" ? "Medium" : "Low");
            
            const difficultyColors = {
              Easy: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-primary-green dark:border-green-900/30",
              Medium: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-955/20 dark:text-amber-400 dark:border-amber-900/30",
              Hard: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30"
            };

            const impactColors = {
              High: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-450 border-emerald-500/20",
              Medium: "bg-blue-500/10 text-blue-700 dark:text-blue-455 border-blue-500/20",
              Low: "bg-slate-500/10 text-slate-700 dark:text-slate-450 border-slate-500/20"
            };

            const glowClass = getGlowClasses(tip.badge);
            const savingsPercent = Math.min(100, Math.round((tip.savings / Math.max(1, analysisResult.savingsPotential)) * 100));

            return (
              <motion.div
                key={tip.id}
                variants={itemVariants}
                className={`group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col justify-between gap-5 hover:border-slate-350 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden ${glowClass}`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-150 dark:border-slate-850 shrink-0 group-hover:scale-110 group-hover:text-primary-blue dark:group-hover:text-primary-green transition-all duration-300">
                      {tip.icon}
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 border rounded-full ${tip.badgeColor}`}>
                      {tip.badge} SAVINGS
                    </span>
                  </div>
                  <div className="space-y-2 text-left">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug group-hover:text-primary-blue dark:group-hover:text-primary-green transition-colors">
                      {tip.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                      {tip.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5 pt-2">
                  {/* Miniature progress contribution bar */}
                  <div className="space-y-1 text-left">
                    <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase">
                      <span>Savings Share</span>
                      <span>{savingsPercent}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${savingsPercent}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="h-full bg-gradient-to-r from-primary-blue to-emerald-500 dark:from-primary-green dark:to-emerald-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-t border-slate-100 dark:border-slate-850 pt-3.5">
                    <div className="text-left space-y-1">
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-wider block">Savings</span>
                      <span className="text-sm sm:text-base font-mono font-black text-emerald-600 dark:text-primary-green leading-none">
                        ₹{tip.savings.toFixed(0)}<span className="text-[10px] font-bold">/mo</span>
                      </span>
                    </div>
                    
                    <div className="text-left space-y-1">
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-555 uppercase tracking-wider block">Difficulty</span>
                      <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${difficultyColors[difficulty] || difficultyColors.Easy}`}>
                        {difficulty}
                      </span>
                    </div>
                    
                    <div className="text-left space-y-1">
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-555 uppercase tracking-wider block">Impact</span>
                      <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${impactColors[impact] || impactColors.Medium}`}>
                        {impact}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* 🕒 Smart Scheduling & Time-of-Day (ToD) Savings */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="text-left">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <span className="p-1 bg-cyan-500/10 text-cyan-600 rounded-lg text-lg">🕒</span>
            Smart Appliance Load Scheduling
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
            Shift high-draw appliances to off-peak slots to minimize slab surges and maintain low bill bands.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {(() => {
            const activeSchedules = SCHEDULING_ITEMS.filter(item => activeApplianceIds.includes(item.id));
            if (activeSchedules.length > 0) {
              return activeSchedules.map(item => (
                <div 
                  key={item.id}
                  className="group p-4 rounded-2xl border border-cyan-150 dark:border-cyan-900/30 bg-cyan-50/5 dark:bg-cyan-950/5 flex items-start gap-4 hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.12)] hover:border-cyan-300/30 dark:hover:border-cyan-500/30"
                >
                  <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-600 dark:text-cyan-400 shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <span className="text-xl font-bold">{item.icon}</span>
                  </div>
                  <div className="space-y-1 text-left">
                    <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white block leading-tight group-hover:text-cyan-500 transition-colors">
                      {item.title}
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                      {item.description}
                    </p>
                    <span className="inline-block text-[9px] font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 dark:bg-cyan-950/40 px-2.5 py-1 rounded-md mt-1 border border-cyan-500/10">
                      {item.savingsText}
                    </span>
                  </div>
                </div>
              ));
            } else {
              return (
                <div className="group p-5 rounded-2xl border border-cyan-150 dark:border-cyan-900/30 bg-cyan-50/5 dark:bg-cyan-950/5 flex items-start gap-4 md:col-span-2 hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.12)] hover:border-cyan-300/30">
                  <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-600 dark:text-cyan-400 shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <span className="text-xl font-bold">⚡</span>
                  </div>
                  <div className="space-y-1.5 text-left">
                    <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white block leading-tight">
                      General Time-of-Day Scheduling Advice
                    </span>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-450 leading-relaxed font-semibold">
                      Shift high-draw appliances (water pumps, electric chargers, heavy cooking appliances) to early morning or late night to optimize slab utilization.
                    </p>
                  </div>
                </div>
              );
            }
          })()}
        </div>
      </div>

      {/* ─── BEFORE VS AFTER SAVINGS SIMULATOR ────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="text-left">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
            Interactive Savings Simulator
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-semibold leading-relaxed">
            Drag the slider to dynamically simulate the financial and environmental impact of reducing heavy appliance loads.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Slider Controls */}
          <div className="lg:col-span-5 space-y-4 bg-slate-50/50 dark:bg-slate-950/30 p-5 rounded-2xl border border-slate-150 dark:border-slate-850">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {sliderLabel}
              </span>
              <span className="text-base font-black text-primary-green font-mono">
                {reduction}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={reduction}
              onChange={(e) => setReduction(parseInt(e.target.value))}
              className="premium-slider bg-slate-200 dark:bg-slate-800 cursor-pointer accent-primary-green"
            />
            <div className="flex justify-between text-[9px] text-slate-400 font-black uppercase tracking-wider">
              <span>0% (No change)</span>
              <span>100% (Fully Off)</span>
            </div>
          </div>

          {/* Results Grid */}
          <div className="lg:col-span-7 grid grid-cols-3 gap-3.5">
            {/* Current Usage */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/20 rounded-2xl border border-slate-150 dark:border-slate-850 text-center flex flex-col justify-center">
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Current Usage</span>
              <span className="text-sm sm:text-base font-mono font-black text-slate-800 dark:text-white mt-1 block">
                {Math.round(analysisResult.totalUnits)} <span className="text-[10px] font-bold text-slate-400">kWh</span>
              </span>
            </div>

            {/* Simulated Usage */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/20 rounded-2xl border border-slate-150 dark:border-slate-850 text-center flex flex-col justify-center">
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">New Usage</span>
              <span className="text-sm sm:text-base font-mono font-black text-primary-blue dark:text-primary-green mt-1 block">
                {Math.round(newUnits)} <span className="text-[10px] font-bold text-slate-400">kWh</span>
              </span>
            </div>

            {/* Estimated Savings */}
            <div className="p-4 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-2xl border border-emerald-500/10 dark:border-emerald-500/20 text-center flex flex-col justify-center shadow-sm">
              <span className="text-[9px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest block">Savings</span>
              <span className="text-sm sm:text-base font-mono font-black text-emerald-600 dark:text-primary-green mt-1 block">
                ₹{Math.round(savings)}<span className="text-[10px] font-bold">/mo</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Before vs After Recommendations comparison card */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest text-left flex items-center gap-1.5">
          <Award className="w-4 h-4 text-emerald-500" />
          Comparative Dashboard Analysis
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bill Comparison */}
          <div className="space-y-2 bg-slate-50/50 dark:bg-slate-955/20 p-4.5 rounded-2xl border border-slate-150 dark:border-slate-850">
            <span className="text-xs font-bold text-slate-650 dark:text-slate-400 block text-left">
              Bill Projection (₹)
            </span>
            <div className="flex items-center gap-2 pt-1">
              <div className="flex-1 py-3 px-3 rounded-xl bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200/50 dark:border-red-900/20 text-center font-black text-sm sm:text-base font-mono shadow-sm">
                ₹{analysisResult.billing.netEnergyCharge.toFixed(0)}
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="flex-1 py-3 px-3 rounded-xl bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200/50 dark:border-green-900/20 text-center font-black text-sm sm:text-base font-mono shadow-sm">
                ₹{analysisResult.billAfter.toFixed(0)}
              </div>
            </div>
          </div>

          {/* Usage Comparison */}
          <div className="space-y-2 bg-slate-50/50 dark:bg-slate-955/20 p-4.5 rounded-2xl border border-slate-150 dark:border-slate-855">
            <span className="text-xs font-bold text-slate-650 dark:text-slate-400 block text-left">
              Energy Usage (kWh)
            </span>
            <div className="flex items-center gap-2 pt-1">
              <div className="flex-1 py-3 px-3 rounded-xl bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200/50 dark:border-red-900/20 text-center font-black text-sm sm:text-base font-mono shadow-sm">
                {analysisResult.totalUnits.toFixed(0)} <span className="text-[9px] font-bold block text-slate-400">kWh</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="flex-1 py-3 px-3 rounded-xl bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200/50 dark:border-green-900/20 text-center font-black text-sm sm:text-base font-mono shadow-sm">
                {analysisResult.usageAfter.toFixed(0)} <span className="text-[9px] font-bold block text-primary-green">kWh</span>
              </div>
            </div>
          </div>

          {/* Carbon Comparison */}
          <div className="space-y-2 bg-slate-50/50 dark:bg-slate-955/20 p-4.5 rounded-2xl border border-slate-150 dark:border-slate-855">
            <span className="text-xs font-bold text-slate-655 dark:text-slate-400 block text-left flex items-center gap-1.5">
              <Leaf className="w-4 h-4 text-green-600 dark:text-primary-green" />
              Carbon Footprint (kg CO₂)
            </span>
            <div className="flex items-center gap-2 pt-1">
              <div className="flex-1 py-2 px-2.5 rounded-xl bg-red-50 text-red-700 dark:bg-red-955/20 dark:text-red-400 border border-red-200/50 dark:border-red-900/20 text-center font-bold text-xs sm:text-sm font-mono shadow-sm">
                {analysisResult.beforeCo2.toFixed(0)} kg <span className="text-[8px] font-semibold block text-slate-400">({analysisResult.beforeTrees.toFixed(0)} trees)</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="flex-1 py-2 px-2.5 rounded-xl bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200/50 dark:border-green-900/20 text-center font-bold text-xs sm:text-sm font-mono shadow-sm">
                {analysisResult.afterCo2.toFixed(0)} kg <span className="text-[8px] font-bold block text-primary-green">(-{analysisResult.savedTrees.toFixed(0)} tr offset)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom navigation buttons */}
      <div className="flex items-center justify-between pt-5 border-t border-slate-200 dark:border-slate-800 no-print">
        <div className="flex gap-3">
          <motion.button
            onClick={onBack}
            whileHover={{ y: -1, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2.5 flex items-center justify-center text-xs font-bold rounded-full text-slate-700 dark:text-slate-350 bg-white border-2 border-slate-200 hover:border-slate-350 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700 transition-all cursor-pointer shadow-sm"
          >
            Back to Inputs
          </motion.button>
          <motion.button
            onClick={onReset}
            whileHover={{ y: -1, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="group px-5 py-2.5 flex items-center justify-center gap-1.5 text-xs font-bold rounded-full text-slate-750 dark:text-slate-300 bg-white border-2 border-slate-200 hover:border-slate-350 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700 transition-all cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-300 ease-out" />
            Reset Planner
          </motion.button>
        </div>
        <motion.button
          onClick={onReset}
          whileHover={{ 
            y: -2, 
            scale: 1.03, 
            boxShadow: "0 8px 20px -6px rgba(37, 99, 235, 0.3)" 
          }}
          whileTap={{ scale: 0.98 }}
          className="group px-6 py-2.5 flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider rounded-full text-white bg-gradient-to-r from-primary-blue to-blue-700 dark:from-primary-green dark:to-emerald-650 dark:text-slate-950 transition-all shadow-md shadow-primary-blue/15 dark:shadow-none cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500 ease-out" />
          Start New Audit
        </motion.button>
      </div>
    </motion.div>
  );
};
