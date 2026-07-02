import React, { useState } from "react";
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

const FILTER_CATEGORIES = [
  { id: "all", name: "All Categories" },
  { id: "essential", name: "Essential" },
  { id: "kitchen", name: "Kitchen" },
  { id: "electronics", name: "Electronics" },
  { id: "comfort", name: "Comfort" },
  { id: "water", name: "Water" }
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
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [hasAnimated, setHasAnimated] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setHasAnimated(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.04
      }
    }
  };

  const categoryVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.02
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    }
  };

  const currentContainerVariants = hasAnimated ? undefined : containerVariants;
  const currentCategoryVariants = hasAnimated ? undefined : categoryVariants;
  const currentCardVariants = hasAnimated ? undefined : cardVariants;

  const activeCategories = activeCategory === "all"
    ? CATEGORIES
    : CATEGORIES.filter(c => c.id === activeCategory);

  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div className="border-b border-white/10 dark:border-slate-800/50 pb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white text-left font-display">Select appliances in your home</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 text-left mt-1 font-medium">
          Click each card to toggle appliances on or off. You'll specify quantities on the next step.
        </p>
      </div>

      {/* Glassmorphic Category Filter Tabs */}
      <div className="flex items-center justify-start gap-1 p-1 bg-slate-100/40 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/40 dark:border-slate-800/40 rounded-2xl overflow-x-auto no-scrollbar scroll-smooth py-1 px-1 relative z-20 select-none">
        {FILTER_CATEGORIES.map(category => {
          const isActive = activeCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`relative px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer whitespace-nowrap z-10 ${
                isActive 
                  ? "text-primary-blue dark:text-primary-green" 
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-350"
              }`}
            >
              {category.name}
              {isActive && (
                <motion.div
                  layoutId="activeCategoryPill"
                  className="absolute inset-0 bg-white dark:bg-slate-800 rounded-xl shadow-sm z-[-1] border border-slate-200/50 dark:border-slate-700/50"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Grid Container */}
      <motion.div 
        variants={currentContainerVariants}
        initial={hasAnimated ? undefined : "hidden"}
        animate={hasAnimated ? undefined : "show"}
        className="space-y-8 max-h-[440px] overflow-y-auto pr-2 py-2 scroll-smooth"
      >
        <AnimatePresence mode="popLayout">
          {activeCategories.map(category => {
            const categoryAppliances = appliances.filter(app => app.category === category.id);
            if (categoryAppliances.length === 0) return null;
            return (
              <motion.div 
                key={category.id} 
                variants={currentCategoryVariants}
                className="space-y-4"
              >
                {/* Category Header */}
                <div className="flex items-center gap-2 border-b border-white/10 dark:border-slate-800/50 pb-2 text-left">
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
                        variants={currentCardVariants}
                        whileHover={hasAnimated ? {} : "hover"}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleAppliance(app.id)}
                        className={`group card-client p-4 flex flex-col items-start justify-between text-left h-[120px] rounded-2xl border transition-[border-color,background-color,box-shadow] duration-300 relative overflow-hidden cursor-pointer ${
                          isSelected
                            ? "border-primary-blue/80 bg-primary-blue/10 dark:border-primary-green/80 dark:bg-primary-green/10 backdrop-blur-xl shadow-[0_8px_32px_rgba(37,99,235,0.08)] dark:shadow-[0_8px_32px_rgba(16,185,129,0.08)]"
                            : "border-white/20 bg-white/30 backdrop-blur-xl dark:border-slate-800/40 dark:bg-slate-950/20 shadow-sm hover:border-slate-350/50 dark:hover:border-slate-700/50 hover:shadow-md"
                        }`}
                      >
                        {/* Active state ambient glow */}
                        <AnimatePresence>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1.2, opacity: 0.28 }}
                              exit={{ scale: 0, opacity: 0 }}
                              className="absolute -right-6 -top-6 w-16 h-16 blur-xl bg-primary-blue dark:bg-primary-green pointer-events-none rounded-full"
                            />
                          )}
                        </AnimatePresence>

                        {/* Active state check indicator */}
                        <AnimatePresence>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0, rotate: -25, opacity: 0 }}
                              animate={{ scale: 1, rotate: 0, opacity: 1 }}
                              exit={{ scale: 0, rotate: 25, opacity: 0 }}
                              transition={{ type: "spring", stiffness: 450, damping: 20 }}
                              className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary-blue dark:bg-primary-green text-white dark:text-slate-950 flex items-center justify-center shadow-sm z-20"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Icon with micro-bounce and rotate */}
                        <motion.div 
                          variants={{
                            hover: { scale: 1.1, rotate: [0, -6, 6, -3, 3, 0], transition: { duration: 0.4 } }
                          }}
                          className={`p-2.5 rounded-xl border transition-all relative z-10 ${
                            isSelected
                              ? "bg-primary-blue text-white dark:bg-primary-green dark:text-slate-950 border-transparent shadow-md"
                              : "bg-white/20 dark:bg-slate-900/30 text-slate-500 border-white/10 dark:border-white/5 group-hover:bg-white/40 dark:group-hover:bg-slate-900/50"
                          }`}
                        >
                          {getIconComponent(app.icon)}
                        </motion.div>
                        
                        {/* Labels */}
                        <div className="w-full relative z-10">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {app.name}
                          </h4>
                          <span className="text-[10px] font-semibold text-slate-455 dark:text-slate-500 block truncate mt-0.5">
                            {app.hint}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Navigation Footer */}
      <div className="flex justify-end pt-4 border-t border-white/10 dark:border-slate-800/50">
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
}
