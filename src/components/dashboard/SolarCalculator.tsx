import React from "react";
import { motion } from "framer-motion";
import { useSolarCalculatorState } from "../../hooks/useSolarCalculatorState";
import { SolarFormInputs } from "./solar/SolarFormInputs";
import { SolarResultsPanel } from "./solar/SolarResultsPanel";
import { SolarSizingGuide } from "./solar/SolarSizingGuide";
import { Charts } from "./Charts";

interface SolarCalculatorProps {
  tariffState: string;
  activeTheme: "light" | "dark";
}

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
  const solarState = useSolarCalculatorState(tariffState);

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

      {/* Inputs & Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <SolarFormInputs solarState={solarState} activeTheme={activeTheme} />
        <SolarResultsPanel solarState={solarState} />
      </div>

      {/* Solar Return on Investment Analytics Charts */}
      <motion.div
        variants={itemVariants}
        className="w-full"
      >
        <Charts 
          activeTheme={activeTheme} 
          liveTotalUnits={solarState.kwhNeeded}
          recommendedKw={solarState.recommendedKw}
          tariffState={solarState.tariffKey}
          customFlatRate={7.5}
          mode="solar"
          solarPaybackData={solarState.roiOutput.paybackData}
          solarSavingsData={solarState.roiOutput.monthlySavingsData}
        />
      </motion.div>

      {/* Sizing & Guide reference section */}
      <SolarSizingGuide 
        handleSelectReferenceSize={solarState.handleSelectReferenceSize} 
        activeTheme={activeTheme} 
      />
    </motion.div>
  );
};
