import React from "react";
import { motion } from "framer-motion";

interface SearchPipelineProps {
  currentStep: number;
}

export const SEARCH_STEPS = [
  { icon: "🔍", label: "Analyzing appliance..." },
  { icon: "🌐", label: "Searching manufacturer database..." },
  { icon: "⚡", label: "Matching product specifications..." },
  { icon: "📊", label: "Calculating power consumption..." },
  { icon: "✅", label: "Done" }
];

const SearchPipelineSteps: React.FC<SearchPipelineProps> = ({ currentStep }) => {
  return (
    <div className="flex justify-start">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/35 dark:bg-slate-900/40 rounded-2xl rounded-tl-none px-3.5 py-3 border border-white/20 dark:border-slate-800/40 shadow-sm backdrop-blur-md space-y-1.5 max-w-[85%]"
      >
        {SEARCH_STEPS.map((step, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: idx <= currentStep ? 1 : 0.3, x: 0 }}
            transition={{ delay: idx * 0.15, duration: 0.2 }}
            className={`flex items-center gap-2 text-[10px] font-semibold ${
              idx < currentStep ? 'text-emerald-600 dark:text-emerald-400' :
              idx === currentStep ? 'text-slate-800 dark:text-white' :
              'text-slate-400 dark:text-slate-600'
            }`}
          >
            <span className="text-xs">{idx < currentStep ? '✅' : step.icon}</span>
            <span>{step.label}</span>
            {idx === currentStep && idx < SEARCH_STEPS.length - 1 && (
              <motion.span
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="inline-block w-1 h-1 rounded-full bg-current ml-1"
              />
            )}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default SearchPipelineSteps;
