import React from "react";
import { 
  Wind, Flame, Tv, Fan, Laptop, Lightbulb, Zap, ChevronRight, Check,
  Refrigerator, WashingMachine, Microwave, CookingPot, Coffee, Blender,
  Monitor, Router, Gamepad2, Printer, Filter, Thermometer, Droplet, GlassWater,
  ShieldCheck, Cpu
} from "lucide-react";
import type { ApplianceItem } from "../../utils/tariffCalculator";
import { motion, AnimatePresence } from "framer-motion";

// Mapping icons to appliances
const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case "Refrigerator": return <Refrigerator className="w-5.5 h-5.5" />;
    case "Wind": return <Wind className="w-5.5 h-5.5" />;
    case "Fan": return <Fan className="w-5.5 h-5.5" />;
    case "Lightbulb": return <Lightbulb className="w-5.5 h-5.5" />;
    case "Tv": return <Tv className="w-5.5 h-5.5" />;
    case "WashingMachine": return <WashingMachine className="w-5.5 h-5.5" />;
    case "Flame": return <Flame className="w-5.5 h-5.5" />;
    case "Microwave": return <Microwave className="w-5.5 h-5.5" />;
    case "CookingPot": return <CookingPot className="w-5.5 h-5.5" />;
    case "Coffee": return <Coffee className="w-5.5 h-5.5" />;
    case "Blender": return <Blender className="w-5.5 h-5.5" />;
    case "Laptop": return <Laptop className="w-5.5 h-5.5" />;
    case "Monitor": return <Monitor className="w-5.5 h-5.5" />;
    case "Router": return <Router className="w-5.5 h-5.5" />;
    case "Gamepad2": return <Gamepad2 className="w-5.5 h-5.5" />;
    case "Printer": return <Printer className="w-5.5 h-5.5" />;
    case "Filter": return <Filter className="w-5.5 h-5.5" />;
    case "Thermometer": return <Thermometer className="w-5.5 h-5.5" />;
    case "Droplet": return <Droplet className="w-5.5 h-5.5" />;
    case "GlassWater": return <GlassWater className="w-5.5 h-5.5" />;
    default: return <Zap className="w-5.5 h-5.5" />;
  }
};

const CATEGORIES = [
  { id: "essential", name: "Essential Appliances (Must Add)" },
  { id: "kitchen", name: "Kitchen Appliances" },
  { id: "electronics", name: "Electronics" },
  { id: "comfort", name: "Home Comfort" },
  { id: "water", name: "Water Related" }
];

const getCategoryIcon = (catId: string) => {
  switch (catId) {
    case "essential": return <ShieldCheck className="w-4 h-4 text-primary-blue dark:text-primary-green" />;
    case "kitchen": return <CookingPot className="w-4 h-4 text-amber-500" />;
    case "electronics": return <Cpu className="w-4 h-4 text-purple-500" />;
    case "comfort": return <Wind className="w-4 h-4 text-cyan-500" />;
    case "water": return <Droplet className="w-4 h-4 text-blue-500" />;
    default: return <Zap className="w-4 h-4 text-slate-400" />;
  }
};

interface ApplianceSelectorProps {
  appliances: ApplianceItem[];
  toggleAppliance: (appId: string) => void;
  onNext: () => void;
  hasSelection: boolean;
}

export const ApplianceSelector: React.FC<ApplianceSelectorProps> = ({
  appliances,
  toggleAppliance,
  onNext,
  hasSelection
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="border-b border-slate-100 dark:border-slate-850 pb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white text-left">Select appliances in your home</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 text-left mt-1 font-medium">
          Click each card to toggle appliances on or off. You'll specify quantities on the next step.
        </p>
      </div>

      {/* Staggered Grid List */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8 max-h-[420px] overflow-y-auto pr-2 py-2"
      >
        {CATEGORIES.map(category => {
          const categoryAppliances = appliances.filter(app => app.category === category.id);
          if (categoryAppliances.length === 0) return null;
          return (
            <div key={category.id} className="space-y-4">
              {/* Category Header */}
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2 text-left">
                {getCategoryIcon(category.id)}
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-550 dark:text-slate-450">
                  {category.name}
                </h4>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {categoryAppliances.map(app => {
                  const isSelected = app.quantity > 0;
                  return (
                    <motion.button
                      key={app.id}
                      variants={cardVariants}
                      onClick={() => toggleAppliance(app.id)}
                      className={`group p-4 flex flex-col items-start justify-between text-left h-[120px] rounded-2xl border hover:-translate-y-1 hover:shadow-md active:scale-[0.98] transition-all duration-200 [backface-visibility:hidden] [transform-style:preserve-3d] relative overflow-hidden cursor-pointer ${
                        isSelected
                          ? "border-primary-blue bg-gradient-to-br from-blue-50/40 to-blue-100/10 dark:border-primary-green dark:from-green-950/15 dark:to-green-950/5 shadow-[0_0_15px_-3px_rgba(37,99,235,0.15)] dark:shadow-[0_0_15px_-3px_rgba(16,185,129,0.15)]"
                          : "border-slate-200 bg-gradient-to-br from-white to-slate-50/30 dark:border-slate-800 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950/10 shadow-sm"
                      }`}
                    >
                      {/* Active state ambient glow */}
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 0.22 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute -right-6 -top-6 w-16 h-16 blur-xl bg-primary-blue dark:bg-primary-green pointer-events-none rounded-full"
                          />
                        )}
                      </AnimatePresence>

                      {/* Active state check indicator */}
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary-blue dark:bg-primary-green text-white dark:text-slate-950 flex items-center justify-center shadow-sm z-20"
                          >
                            <Check className="w-3 h-3 stroke-[3]" />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Icon */}
                      <div className={`p-2.5 rounded-xl border transition-all relative z-10 ${
                        isSelected
                          ? "bg-primary-blue text-white dark:bg-primary-green dark:text-slate-950 border-transparent shadow-sm"
                          : "bg-slate-50 dark:bg-slate-800/80 text-slate-500 border-slate-200 dark:border-slate-800"
                      }`}>
                        {getIconComponent(app.icon)}
                      </div>
                      
                      {/* Labels */}
                      <div className="w-full relative z-10">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {app.name}
                        </h4>
                        <span className="text-[10px] font-semibold text-slate-450 dark:text-slate-500 block truncate mt-0.5">
                          {app.hint}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Navigation Footer */}
      <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
        <motion.button
          onClick={onNext}
          disabled={!hasSelection}
          whileHover={!hasSelection ? {} : { scale: 1.02 }}
          whileTap={!hasSelection ? {} : { scale: 0.98 }}
          className="h-11 px-6 flex items-center justify-center gap-1.5 text-sm font-bold rounded-xl text-white bg-primary-blue hover:bg-primary-blue/90 dark:bg-primary-green dark:text-slate-950 dark:hover:bg-primary-green/90 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          Next: Configure Usage
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
};
