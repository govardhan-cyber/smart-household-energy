import React, { useState } from "react";
import { 
  Sparkles, Download, Printer, TrendingDown, ChevronRight, RefreshCw, Leaf 
} from "lucide-react";

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
      return "hover:shadow-[0_0_25px_rgba(16,185,129,0.18)] hover:border-emerald-500/30 dark:hover:shadow-[0_0_35px_rgba(16,185,129,0.25)] dark:hover:border-emerald-500/40";
    case "Medium":
      return "hover:shadow-[0_0_25px_rgba(245,158,11,0.18)] hover:border-amber-500/30 dark:hover:shadow-[0_0_35px_rgba(245,158,11,0.25)] dark:hover:border-amber-500/40";
    case "Low":
    case "Minor":
    default:
      return "hover:shadow-[0_0_25px_rgba(99,102,241,0.15)] hover:border-indigo-500/30 dark:hover:shadow-[0_0_35px_rgba(99,102,241,0.22)] dark:hover:border-indigo-500/40";
  }
};

import { calculateBill } from "../../utils/tariffCalculator";
import type { ApplianceItem } from "../../utils/tariffCalculator";

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
  const sliderLabel = isAcActive ? "AC usage reduced" : "Heavy appliance usage reduced";
  
  const reducedUnits = (simulableUnits * reduction) / 100;
  const newUnits = Math.max(0, analysisResult.totalUnits - reducedUnits);
  
  // Calculate simulated bill
  const currentBillResult = calculateBill(analysisResult.totalUnits, stateKey, customFlatRate);
  const simulatedBillResult = calculateBill(newUnits, stateKey, customFlatRate);
  
  const savings = Math.max(0, currentBillResult.netEnergyCharge - simulatedBillResult.netEnergyCharge);
  return (
    <div className="space-y-6 text-left">
      {/* Top Section: Header & Total Potential Savings Badge */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-green" />
            Energy Saving Recommendations
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Personalized tips to reduce your electricity bill.
          </p>
          
          {/* Export Actions for Step 4 */}
          <div className="flex gap-2 mt-3 no-print">
            <button
              onClick={onExportCSV}
              className="flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] font-semibold hover:bg-slate-50 dark:hover:bg-slate-850 dark:text-white transition-all"
              title="Download CSV report"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Export CSV
            </button>
            <button
              onClick={onPrint}
              className="flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] font-semibold hover:bg-slate-50 dark:hover:bg-slate-850 dark:text-white transition-all"
              title="Print / Save PDF report"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              Print PDF
            </button>
          </div>
        </div>

        {/* Total Potential Savings Badge */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 self-start md:self-auto">
          <div className="p-2 bg-green-600/10 rounded-lg text-green-600 dark:text-green-400">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider block">
              Total Potential Savings
            </span>
            <h4 className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400 mt-0.5">
              ₹{analysisResult.savingsPotential.toFixed(1)}/mo
            </h4>
          </div>
        </div>
      </div>

      {/* Recommendations list (Professional styled grid layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {analysisResult.recommendations.map((tip) => {
          const difficulty = tip.difficulty || "Easy";
          const impact = tip.impact || (tip.badge === "High" ? "High" : tip.badge === "Medium" ? "Medium" : "Low");
          
          const difficultyColors = {
            Easy: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-primary-green dark:border-green-900/30",
            Medium: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30",
            Hard: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30"
          };

          const impactColors = {
            High: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-450 border-emerald-500/20",
            Medium: "bg-blue-500/10 text-blue-700 dark:text-blue-455 border-blue-500/20",
            Low: "bg-slate-500/10 text-slate-700 dark:text-slate-450 border-slate-500/20"
          };

          const glowClass = getGlowClasses(tip.badge);

          return (
            <div
              key={tip.id}
              className={`group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-6 flex flex-col justify-between gap-4 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden ${glowClass}`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-150 dark:border-slate-800 shrink-0 group-hover:scale-105 group-hover:bg-white dark:group-hover:bg-slate-800 transition-all duration-300">
                    {tip.icon}
                  </div>
                  <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded-full ${tip.badgeColor}`}>
                    {tip.badge} SAVINGS
                  </span>
                </div>
                <div className="space-y-1.5 text-left">
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {tip.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-450 font-normal leading-relaxed">
                    {tip.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-slate-100 dark:border-slate-850/80 pt-3 mt-1">
                <div className="text-left space-y-1">
                  <span className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Savings</span>
                  <span className="text-sm sm:text-base font-mono font-bold text-emerald-600 dark:text-primary-green leading-none">
                    ₹{tip.savings.toFixed(0)}/mo
                  </span>
                </div>
                
                <div className="text-left space-y-1">
                  <span className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Difficulty</span>
                  <span className={`inline-block text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${difficultyColors[difficulty] || difficultyColors.Easy}`}>
                    {difficulty}
                  </span>
                </div>
                
                <div className="text-left space-y-1">
                  <span className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Impact</span>
                  <span className={`inline-block text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${impactColors[impact] || impactColors.Medium}`}>
                    {impact}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🕒 Smart Scheduling & Time-of-Day (ToD) Savings */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <span className="text-xl">🕒</span>
            Smart Appliance Scheduling & ToD Projections
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-normal">
            Utility dynamic load profiles suggest running heavy appliances during off-peak windows or adjusting thermo settings to maximize slab reduction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(() => {
            const activeSchedules = SCHEDULING_ITEMS.filter(item => activeApplianceIds.includes(item.id));
            if (activeSchedules.length > 0) {
              return activeSchedules.map(item => (
                <div 
                  key={item.id}
                  className="group p-4 rounded-xl border border-cyan-150 dark:border-cyan-900/40 bg-cyan-50/10 dark:bg-cyan-950/5 flex items-start gap-4 hover:-translate-y-0.5 transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:border-cyan-400/30 dark:hover:shadow-[0_0_30px_rgba(6,182,212,0.22)] dark:hover:border-cyan-500/40"
                >
                  <div className="p-2.5 bg-cyan-500/10 rounded-lg text-cyan-600 dark:text-cyan-400 shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <span className="text-lg font-bold">{item.icon}</span>
                  </div>
                  <div className="space-y-1 text-left">
                    <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white block leading-tight">
                      {item.title}
                    </span>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                      {item.description}
                    </p>
                    <span className="inline-block text-[9px] sm:text-[10px] font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/35 px-2 py-0.5 rounded mt-1">
                      {item.savingsText}
                    </span>
                  </div>
                </div>
              ));
            } else {
              return (
                <div className="group p-4 rounded-xl border border-cyan-150 dark:border-cyan-900/40 bg-cyan-50/10 dark:bg-cyan-950/5 flex items-start gap-4 md:col-span-2 hover:-translate-y-0.5 transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:border-cyan-400/30 dark:hover:shadow-[0_0_30px_rgba(6,182,212,0.22)] dark:hover:border-cyan-500/40">
                  <div className="p-2.5 bg-cyan-500/10 rounded-lg text-cyan-600 dark:text-cyan-400 shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <span className="text-lg font-bold">⚡</span>
                  </div>
                  <div className="space-y-1 text-left">
                    <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white block leading-tight">
                      General Time-of-Day Scheduling Advice
                    </span>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-450 leading-relaxed font-normal">
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
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider text-left flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
          Before vs After Savings Simulator
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-normal">
          Drag the slider to dynamically simulate the financial and environmental impact of reducing your heavy cooling load.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Slider Controls */}
          <div className="md:col-span-5 space-y-3.5 bg-slate-50/50 dark:bg-slate-900/25 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                {sliderLabel}
              </span>
              <span className="text-sm font-extrabold text-primary-green font-mono">
                {reduction}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={reduction}
              onChange={(e) => setReduction(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-green"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
              <span>0% (No change)</span>
              <span>100% (Fully Off)</span>
            </div>
          </div>

          {/* Results Grid */}
          <div className="md:col-span-7 grid grid-cols-3 gap-3">
            {/* Current Usage */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800 text-center">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Current Usage</span>
              <span className="text-sm sm:text-base font-mono font-bold text-slate-800 dark:text-white mt-1 block">
                {Math.round(analysisResult.totalUnits)} kWh
              </span>
            </div>

            {/* Simulated Usage */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800 text-center">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">New Usage</span>
              <span className="text-sm sm:text-base font-mono font-bold text-primary-blue dark:text-primary-green mt-1 block">
                {Math.round(newUnits)} kWh
              </span>
            </div>

            {/* Estimated Savings */}
            <div className="p-3 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-xl border border-emerald-500/10 dark:border-emerald-500/25 text-center">
              <span className="text-[10px] sm:text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest block">Savings</span>
              <span className="text-sm sm:text-base font-mono font-bold text-emerald-600 dark:text-primary-green mt-1 block">
                ₹{Math.round(savings)}/mo
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Before vs After Recommendations comparison card */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-left">
          Before vs After Recommendations
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bill Comparison */}
          <div className="space-y-1.5">
            <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 block text-left">
              Bill (₹)
            </span>
            <div className="flex items-center gap-2">
              <div className="flex-1 py-2 px-3 rounded-xl bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-900/50 text-center font-bold text-sm sm:text-base">
                {analysisResult.billing.netEnergyCharge.toFixed(1)}
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="flex-1 py-2 px-3 rounded-xl bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200 dark:border-green-900/50 text-center font-bold text-sm sm:text-base">
                {analysisResult.billAfter.toFixed(1)}
              </div>
            </div>
          </div>

          {/* Usage Comparison */}
          <div className="space-y-1.5">
            <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 block text-left">
              Usage (kWh)
            </span>
            <div className="flex items-center gap-2">
              <div className="flex-1 py-2 px-3 rounded-xl bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-900/50 text-center font-bold text-sm sm:text-base">
                {analysisResult.totalUnits.toFixed(1)}
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="flex-1 py-2 px-3 rounded-xl bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200 dark:border-green-900/50 text-center font-bold text-sm sm:text-base">
                {analysisResult.usageAfter.toFixed(1)}
              </div>
            </div>
          </div>

          {/* Carbon Comparison */}
          <div className="space-y-1.5">
            <span className="text-xs sm:text-sm font-semibold text-slate-555 dark:text-slate-400 block text-left flex items-center gap-1">
              <Leaf className="w-3.5 h-3.5 text-green-600 dark:text-primary-green" />
              CO2 Footprint (kg)
            </span>
            <div className="flex items-center gap-2">
              <div className="flex-1 py-2 px-3 rounded-xl bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-900/50 text-center font-bold text-sm sm:text-base">
                {analysisResult.beforeCo2.toFixed(1)} <span className="text-[9px] block text-slate-400">({analysisResult.beforeTrees.toFixed(0)} trees)</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="flex-1 py-2 px-3 rounded-xl bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200 dark:border-green-900/50 text-center font-bold text-sm sm:text-base">
                {analysisResult.afterCo2.toFixed(1)} <span className="text-[9px] block text-green-600 dark:text-primary-green">(-{analysisResult.savedTrees.toFixed(0)} tr)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom navigation buttons */}
      <div className="flex items-center justify-between pt-5 border-t border-slate-200 dark:border-slate-800">
        <div className="flex gap-2">
          <button
            onClick={onBack}
            className="h-10 px-4 flex items-center justify-center text-xs sm:text-sm font-semibold rounded-lg text-slate-600 dark:text-slate-400 bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 hover:bg-slate-50 transition-all"
          >
            Back
          </button>
          <button
            onClick={onReset}
            className="h-10 px-4 flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold rounded-lg text-slate-600 dark:text-slate-400 bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 hover:bg-slate-50 transition-all"
          >
            <RefreshCw className="w-3 h-3" />
            Reset
          </button>
        </div>
        <button
          onClick={onReset}
          className="h-10 px-4 flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold rounded-lg text-slate-800 dark:text-slate-200 bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 hover:bg-slate-50 transition-all"
        >
          <RefreshCw className="w-3 h-3" />
          Start Over
        </button>
      </div>
    </div>
  );
};
