import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, AlertTriangle, ShieldCheck, Sparkles } from "lucide-react";

// Count-up/down animation component for premium feel
export const AnimatedNumber: React.FC<{
  value: number;
  duration?: number;
  formatter?: (v: number) => string;
}> = ({ value, duration = 400, formatter = (v) => Math.round(v).toString() }) => {
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

interface DashboardSidebarSummaryProps {
  liveTotalUnits: number;
  liveBill: { netEnergyCharge: number; stateName: string };
  isAboveBenchmark: boolean;
  benchmarkDiffPercent: number;
  benchmarkCharge: number;
  benchmarkUnits: number;
  user: any;
}

export const DashboardSidebarSummary: React.FC<DashboardSidebarSummaryProps> = ({
  liveTotalUnits,
  liveBill,
  isAboveBenchmark,
  benchmarkDiffPercent,
  benchmarkCharge,
  benchmarkUnits,
  user
}) => {
  return (
    <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-6 sm:p-7 rounded-[32px] border border-white/20 dark:border-slate-800/40 shadow-2xl space-y-6 text-left relative overflow-hidden">
      {/* Decorative top-right color accent */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br from-primary-blue to-primary-green dark:from-primary-green dark:to-emerald-400 opacity-20 blur-xl pointer-events-none rounded-full" />
      
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Summary</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Calculations based on selected options.
        </p>
      </div>

      {/* Total units card */}
      <div className="relative overflow-hidden bg-white/25 dark:bg-slate-950/15 backdrop-blur-md p-5 rounded-2xl border border-white/40 dark:border-slate-800/20 shadow-sm space-y-4 transition-all duration-300 card-client card-client-blue group cursor-default">
        <div className="absolute -right-6 -top-6 w-28 h-28 bg-primary-blue/5 dark:bg-primary-green/5 blur-xl pointer-events-none rounded-full" />
        
        <div className="flex items-center justify-between relative z-10">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider font-display">
            Estimated Monthly Usage
          </span>
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100/30 dark:border-blue-900/30 text-primary-blue dark:text-primary-green shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1 relative z-10">
          <span className="text-4xl font-display font-extrabold text-slate-900 dark:text-white leading-none">
            <AnimatedNumber value={liveTotalUnits} />
          </span>
          <span className="text-xs font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider ml-1">kWh (Units)</span>
        </div>
      </div>

      {/* Estimated bill card */}
      <div className="relative overflow-hidden bg-white/25 dark:bg-slate-950/15 backdrop-blur-md p-5 rounded-2xl border border-white/40 dark:border-slate-800/20 shadow-sm space-y-4 transition-all duration-300 card-client card-client-emerald group cursor-default">
        <div className="absolute -right-6 -top-6 w-28 h-28 bg-primary-blue/10 dark:bg-primary-green/10 blur-xl pointer-events-none rounded-full" />
        
        <div className="flex items-center justify-between relative z-10">
           <span className="text-xs font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider font-display">
            Estimated Monthly Bill
          </span>
          <span className="text-[10px] text-green-600 dark:text-primary-green font-extrabold uppercase tracking-wider bg-green-50/90 dark:bg-green-950/40 px-2.5 py-0.5 rounded-full border border-green-200/50 dark:border-green-900/40 backdrop-blur-md shadow-sm transition-transform duration-300 group-hover:scale-105">
            After Subsidy
          </span>
        </div>
        <div className="flex items-baseline gap-1.5 relative z-10">
          <span className="text-4xl font-display font-extrabold text-primary-blue dark:text-primary-green leading-none">
            ₹<AnimatedNumber value={liveBill.netEnergyCharge} />
          </span>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-450 truncate max-w-[160px]" title={`${liveBill.stateName} Net`}>
            {liveBill.stateName} Net
          </span>
        </div>
      </div>      {/* Benchmarking Comparison Banner */}
      <div className={`p-4 rounded-2xl border border-l-4 text-xs font-bold flex items-start gap-3 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md cursor-default group ${
        isAboveBenchmark 
          ? "bg-red-500/8 border-red-500/20 border-l-red-500 text-red-750 dark:bg-red-955/10 dark:border-red-900/30 dark:text-red-400" 
          : "bg-emerald-500/8 border-emerald-500/20 border-l-emerald-500 text-emerald-755 dark:bg-green-950/10 dark:border-green-900/30 dark:text-emerald-400"
      }`}>
        {isAboveBenchmark ? (
          <>
            <div className="p-1.5 rounded-xl bg-red-500/15 dark:bg-red-900/30 text-red-650 dark:text-red-400 shadow-inner transition-transform duration-300 group-hover:scale-110">
              <AlertTriangle className="w-4 h-4 shrink-0" />
            </div>
            <div className="space-y-0.5">
              <span className="font-bold">You spend {benchmarkDiffPercent}% more than similar homes.</span>
              <span className="block text-[10px] text-slate-500 dark:text-slate-455 font-semibold mt-0.5">
                Average household bill: ₹{benchmarkCharge.toFixed(0)} ({benchmarkUnits} kWh)
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="p-1.5 rounded-xl bg-emerald-500/15 dark:bg-green-900/30 text-emerald-600 dark:text-emerald-400 shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
              <Sparkles className="w-4.5 h-4.5 shrink-0 text-emerald-500 dark:text-emerald-400 animate-pulse" />
            </div>
            <div className="space-y-0.5">
              <span className="font-bold">Great job! You spend {benchmarkDiffPercent}% less than similar homes.</span>
              <span className="block text-[10px] text-slate-500 dark:text-slate-455 font-semibold mt-0.5">
                Average household bill: ₹{benchmarkCharge.toFixed(0)} ({benchmarkUnits} kWh)
              </span>
            </div>
          </>
        )}
      </div>

      {/* Budget Progress Tracker */}
      {user && (
        <div className="relative overflow-hidden bg-white/25 dark:bg-slate-955/15 backdrop-blur-md p-5 rounded-2xl border border-white/40 dark:border-slate-800/20 shadow-sm space-y-4 transition-all duration-300 card-client card-client-cyan group cursor-default">
          <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-blue-500/5 dark:bg-green-500/5 blur-xl pointer-events-none rounded-full" />
          
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider relative z-10 font-display">
            <span>Budget Tracking</span>
            <span className="text-slate-700 dark:text-slate-350 font-sans group-hover:text-slate-900 dark:group-hover:text-white transition-colors duration-200">
              ₹<AnimatedNumber value={liveBill.netEnergyCharge} /> / ₹{user.monthlyBudgetBill || 3000}
            </span>
          </div>
          
          {/* Progress Bar */}
          {(() => {
            const budgetLimit = user.monthlyBudgetBill || 3000;
            const percent = Math.min(100, Math.round((liveBill.netEnergyCharge / budgetLimit) * 100));
            const isExceeded = liveBill.netEnergyCharge > budgetLimit;
            return (
              <div className="space-y-3.5 relative z-10">
                <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden shadow-inner p-0.5 relative">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ type: "spring", stiffness: 80, damping: 15 }}
                    className={`h-full rounded-full relative overflow-hidden ${
                      isExceeded 
                        ? "bg-gradient-to-r from-red-500 to-rose-600 shadow-[0_0_10px_rgba(239,68,68,0.4)]" 
                        : percent > 80 
                          ? "bg-gradient-to-r from-orange-400 to-amber-505 shadow-[0_0_10px_rgba(245,158,11,0.4)]" 
                          : "bg-gradient-to-r from-primary-blue to-primary-green dark:from-primary-green dark:to-emerald-400 shadow-[0_0_10px_rgba(37,99,235,0.25)]"
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/15 to-transparent pointer-events-none" />
                  </motion.div>
                </div>
                
                {/* Budget warning alert card */}
                {isExceeded && (
                  <div className="flex items-start gap-2.5 p-3 bg-red-50/80 border border-red-200/50 rounded-xl dark:bg-alert-red/10 dark:border-alert-red/20 text-alert-red dark:text-red-400 text-[10px] font-extrabold mt-1.5 shadow-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0 animate-pulse text-alert-red dark:text-red-400" />
                    <span>Budget Exceeded! Reduce AC or other device hours to meet target.</span>
                  </div>
                )}
                {!isExceeded && percent > 80 && (
                  <div className="flex items-start gap-2.5 p-3 bg-orange-50/80 border border-orange-200/50 rounded-xl dark:bg-warning-orange/10 dark:border-warning-orange/20 text-warning-orange dark:text-orange-400 text-[10px] font-extrabold mt-1.5 shadow-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-warning-orange dark:text-orange-400" />
                    <span>Approaching budget limit (over 80% used). Consider optimizing usage.</span>
                  </div>
                )}
                {!isExceeded && percent <= 80 && (
                  <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-green-600 dark:text-primary-green uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-primary-green animate-ping" />
                    <span>Safe Zone: Within target budget</span>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Privacy note */}
      <div className="flex items-center gap-2 text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4 group/privacy cursor-default">
        <ShieldCheck className="w-4 h-4 text-green-500 transition-transform duration-300 group-hover/privacy:scale-110 group-hover/privacy:rotate-12" />
        <span className="group-hover/privacy:text-slate-500 dark:group-hover/privacy:text-slate-350 transition-colors duration-300">SaaS encryption active. Data is private to your profile.</span>
      </div>
    </div>
  );
};
