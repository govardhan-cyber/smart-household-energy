import React from "react";
import { motion } from "framer-motion";
import { Zap, SlidersHorizontal, BarChart3, Leaf, Check } from "lucide-react";

interface DashboardStepProgressProps {
  currentStep: number;
  setCurrentStep: (step: 1 | 2 | 3 | 4) => void;
  activeAppliancesLength: number;
}

export const DashboardStepProgress: React.FC<DashboardStepProgressProps> = ({
  currentStep,
  setCurrentStep,
  activeAppliancesLength
}) => {
  return (
    <div id="wizard-progress-bar" className="relative bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl px-8 py-6 rounded-2xl border border-white/50 dark:border-slate-700/50 shadow-md no-print max-w-4xl mx-auto w-full overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-blue/[0.03] via-transparent to-primary-green/[0.03] dark:from-primary-blue/[0.06] dark:to-primary-green/[0.06] pointer-events-none rounded-2xl" />

      <div className="relative flex items-center w-full">
        {[
          { step: 1, label: "Appliances",     sub: "Select devices",   Icon: Zap,               color: "from-blue-500 to-primary-blue",   glow: "shadow-blue-500/40"   },
          { step: 2, label: "Usage",           sub: "Set hours & days", Icon: SlidersHorizontal, color: "from-violet-500 to-indigo-500",   glow: "shadow-violet-500/40" },
          { step: 3, label: "Analysis",        sub: "Review usage",     Icon: BarChart3,         color: "from-emerald-500 to-teal-500",    glow: "shadow-emerald-500/40"},
          { step: 4, label: "Recommendations", sub: "Save energy",      Icon: Leaf,              color: "from-teal-400 to-primary-green",  glow: "shadow-teal-500/40"   },
        ].map((s, idx, arr) => {
          const isCompleted = currentStep > s.step;
          const isActive    = currentStep === s.step;
          const isClickable = s.step <= currentStep || activeAppliancesLength > 0;
          return (
            <React.Fragment key={s.step}>
              {/* Step node */}
              <motion.button
                disabled={!isClickable}
                onClick={() => setCurrentStep(s.step as 1 | 2 | 3 | 4)}
                whileHover={isClickable ? { scale: 1.06, y: -2 } : {}}
                whileTap={isClickable ? { scale: 0.95 } : {}}
                className={`flex flex-col items-center gap-3 shrink-0 focus:outline-none transition-all duration-300 ${isClickable ? "cursor-pointer" : "cursor-not-allowed opacity-30"}`}
              >
                {/* Circle */}
                <div className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isCompleted
                    ? `bg-gradient-to-br ${s.color} shadow-lg ${s.glow}`
                    : isActive
                    ? `bg-gradient-to-br ${s.color} shadow-xl ${s.glow}`
                    : "bg-slate-100/90 dark:bg-slate-800/70 border-2 border-slate-200/80 dark:border-slate-700/60"
                }`}>
                  {/* Outer pulse ring for active */}
                  {isActive && (
                    <>
                      <span className="absolute -inset-1 rounded-full animate-ping opacity-30 bg-gradient-to-br from-primary-blue to-primary-green" />
                      <span className="absolute -inset-0.5 rounded-full border-2 border-primary-blue/40 dark:border-primary-green/40" />
                    </>
                  )}
                  {isCompleted ? (
                    <Check className="w-6 h-6 text-white stroke-[2.5]" />
                  ) : isActive ? (
                    <s.Icon className="w-6 h-6 text-white drop-shadow-sm" />
                  ) : (
                    <span className="text-base font-bold text-slate-400 dark:text-slate-500 font-display">{s.step}</span>
                  )}
                </div>

                {/* Labels */}
                <div className="flex flex-col items-center leading-tight gap-0.5">
                  <span className={`text-xs sm:text-[13px] font-bold transition-colors duration-300 font-display whitespace-nowrap ${
                    isActive    ? "text-slate-900 dark:text-white"
                    : isCompleted ? "text-slate-600 dark:text-slate-300"
                    : "text-slate-400 dark:text-slate-500"
                  }`}>
                    {s.label}
                  </span>
                  <span className={`text-[10px] hidden sm:block font-medium tracking-wide transition-colors duration-300 whitespace-nowrap ${
                    isActive    ? "text-slate-500 dark:text-slate-400"
                    : isCompleted ? "text-slate-400 dark:text-slate-500"
                    : "text-slate-300 dark:text-slate-600"
                  }`}>
                    {s.sub}
                  </span>
                </div>
              </motion.button>

              {/* Connector */}
              {idx < arr.length - 1 && (
                <div className="flex-1 mx-4 mb-10 space-y-1">
                  <div className="h-[2px] rounded-full bg-slate-200/80 dark:bg-slate-700/60 relative overflow-hidden">
                    <motion.div
                      className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${s.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: currentStep > s.step ? "100%" : "0%" }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
