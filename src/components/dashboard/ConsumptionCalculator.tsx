import React, { useState } from "react";
import { 
  Wind, Flame, Tv, Fan, Laptop, Lightbulb, Zap, Plus, Minus,
  Refrigerator, WashingMachine, Microwave, CookingPot, Coffee, Blender,
  Monitor, Router, Gamepad2, Printer, Filter, Thermometer, Droplet, GlassWater,
  ChevronDown, SlidersHorizontal, AlertTriangle
} from "lucide-react";
import type { ApplianceItem } from "../../utils/tariffCalculator";
import { getApplianceDecayRate } from "../../utils/tariffCalculator";
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

// Styling badge color themes
const getApplianceColorClasses = (appId: string) => {
  switch (appId) {
    case "ac":
      return "bg-gradient-to-br from-blue-500/10 to-sky-500/10 text-blue-600 dark:text-blue-400 border-blue-150/30 dark:border-blue-900/20";
    case "fridge":
      return "bg-gradient-to-br from-cyan-500/10 to-teal-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-100/30 dark:border-cyan-900/20";
    case "fan":
      return "bg-gradient-to-br from-slate-400/10 to-slate-550/10 text-slate-600 dark:text-slate-400 border-slate-300/30 dark:border-slate-800/20";
    case "lights":
    case "lights_tube":
      return "bg-gradient-to-br from-yellow-500/10 to-amber-500/10 text-yellow-600 dark:text-yellow-450 border-yellow-100/30 dark:border-yellow-900/20";
    case "tv":
      return "bg-gradient-to-br from-purple-500/10 to-indigo-500/10 text-purple-600 dark:text-purple-400 border-purple-100/30 dark:border-purple-900/20";
    case "washing_machine":
      return "bg-gradient-to-br from-pink-500/10 to-rose-500/10 text-pink-600 dark:text-pink-400 border-pink-100/30 dark:border-pink-900/20";
    case "water_heater":
      return "bg-gradient-to-br from-orange-500/10 to-red-500/10 text-orange-600 dark:text-orange-450 border-orange-100/30 dark:border-orange-900/20";
    default:
      return "bg-gradient-to-br from-primary-blue/10 to-accent-neon/10 text-primary-blue dark:text-primary-green border-blue-100/30 dark:border-blue-900/20";
  }
};

interface ConsumptionCalculatorProps {
  activeAppliances: ApplianceItem[];
  updateQuantity: (appId: string, increment: number) => void;
  updateHours: (appId: string, hours: number) => void;
  updateUnitHours: (appId: string, unitIndex: number, hours: number) => void;
  updateWatts: (appId: string, watts: number) => void;
  updateAge: (appId: string, age: number) => void;
  updateUnitAge: (appId: string, unitIndex: number, age: number) => void;
  activeTheme: "light" | "dark";
  isAnalyzing: boolean;
  onBack: () => void;
  onAnalyze: () => void;
}

export const ConsumptionCalculator: React.FC<ConsumptionCalculatorProps> = ({
  activeAppliances,
  updateQuantity,
  updateHours,
  updateUnitHours,
  updateWatts,
  updateAge,
  updateUnitAge,
  activeTheme,
  isAnalyzing,
  onBack,
  onAnalyze
}) => {
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({});
  const [hasAnimated, setHasAnimated] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setHasAnimated(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const listVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.03
      }
    }
  };

  const itemVariants = {
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

  const currentListVariants = listVariants;
  const currentItemVariants = itemVariants;

  const toggleUnits = (appId: string) => {
    setExpandedUnits(prev => ({
      ...prev,
      [appId]: !prev[appId]
    }));
  };

  const getPresetsForAppliance = (appId: string) => {
    switch (appId) {
      case "ac":
        return [
          { label: "Inverter 5★", value: 1200 },
          { label: "Standard 3★", value: 1500 },
          { label: "Non-Inverter", value: 2000 }
        ];
      case "fridge":
        return [
          { label: "Single Door", value: 150 },
          { label: "Double Door", value: 250 },
          { label: "Side-by-Side", value: 400 }
        ];
      case "fan":
        return [
          { label: "BLDC Fan", value: 35 },
          { label: "Standard", value: 75 }
        ];
      case "tv":
        return [
          { label: "LED 32\"", value: 60 },
          { label: "Smart 55\"", value: 120 },
          { label: "OLED", value: 200 }
        ];
      case "lights":
        return [
          { label: "9W LED", value: 9 },
          { label: "12W LED", value: 12 },
          { label: "15W LED", value: 15 }
        ];
      case "lights_tube":
        return [
          { label: "T5 LED", value: 18 },
          { label: "Conventional", value: 40 }
        ];
      case "washing_machine":
        return [
          { label: "Front Load", value: 500 },
          { label: "Top Load", value: 800 }
        ];
      case "water_heater":
        return [
          { label: "Instant", value: 1500 },
          { label: "Storage", value: 2500 }
        ];
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white text-left font-display">Configure appliances usage</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-left mt-1 font-medium">
            Adjust how many units you own and how many hours they run daily.
          </p>
        </div>
        <button 
          onClick={onBack}
          className="text-xs font-extrabold text-primary-blue hover:text-primary-blue/80 dark:text-primary-green hover:underline cursor-pointer transition-colors"
        >
          Modify Selection
        </button>
      </div>

      {/* Appliance Config List */}
      <motion.div 
        variants={currentListVariants}
        initial={hasAnimated ? false : "hidden"}
        animate="show"
        className="space-y-4 max-h-[410px] overflow-y-auto pr-2 py-2 text-left"
      >
        {activeAppliances.length === 0 ? (
          <div className="py-12 px-4 text-center space-y-4 border border-dashed border-slate-200 dark:border-slate-850 rounded-[24px] bg-white/60 dark:bg-slate-900/30 backdrop-blur-md">
            <Zap className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto animate-pulse" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">No appliances added yet</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                Please select the appliances in your home from Step 1 to configure their usage profiles.
              </p>
            </div>
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 h-9 px-4 text-xs font-bold rounded-xl text-white bg-primary-blue hover:bg-primary-blue/90 dark:bg-primary-green dark:text-slate-950 dark:hover:bg-primary-green/90 transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              Add Appliances
            </button>
          </div>
        ) : (
          activeAppliances.map(app => {
            const isUnitsExpanded = !!expandedUnits[app.id];
            return (
              <motion.div 
                key={app.id} 
                variants={currentItemVariants}
                className="p-5 rounded-[24px] border border-slate-200/50 dark:border-slate-800/40 bg-white/60 dark:bg-slate-900/30 backdrop-blur-md shadow-sm hover:shadow-md hover:border-slate-350 dark:hover:border-slate-700/80 transition-colors duration-300 relative overflow-hidden space-y-4"
              >
                {/* Appliance Info and Quantity control */}
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${getApplianceColorClasses(app.id)} shadow-sm transition-transform duration-300 hover:scale-[1.05]`}>
                      {getIconComponent(app.icon)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">{app.name}</h4>
                      <div className="flex items-center gap-1.5 mt-1 select-none">
                        <input
                          type="number"
                          min="1"
                          max="10000"
                          value={app.watts}
                          onChange={(e) => updateWatts(app.id, Math.max(1, parseInt(e.target.value) || 0))}
                          className="w-20 px-2.5 py-1 text-xs font-bold bg-slate-50/70 dark:bg-slate-850 border border-slate-200 dark:border-slate-850 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-blue/30 dark:focus:ring-primary-green/30 text-center transition-all shadow-inner font-mono"
                        />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-550">Watts</span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center space-y-0.5 flex-col items-end select-none">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">How many units?</span>
                    <div className="flex items-center bg-slate-50/80 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-1 mt-1 shadow-inner">
                      <motion.button
                        onClick={() => updateQuantity(app.id, -1)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-7 h-7 flex items-center justify-center rounded-xl hover:bg-white dark:hover:bg-slate-750 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer shadow-sm border border-transparent hover:border-slate-200/50 dark:hover:border-slate-700/50 bg-transparent"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </motion.button>
                      <span className="w-8 text-center text-sm font-extrabold text-slate-850 dark:text-white font-display">
                        {app.quantity}
                      </span>
                      <motion.button
                        onClick={() => updateQuantity(app.id, 1)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-7 h-7 flex items-center justify-center rounded-xl hover:bg-white dark:hover:bg-slate-750 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer shadow-sm border border-transparent hover:border-slate-200/50 dark:hover:border-slate-700/50 bg-transparent"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Presets Row */}
                {getPresetsForAppliance(app.id) && (
                  <div className="flex flex-wrap items-center gap-1.5 bg-slate-50/30 dark:bg-slate-950/10 p-2 rounded-[14px] border border-slate-200/40 dark:border-slate-800/20 relative z-10 select-none">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-450 dark:text-slate-500 mr-1">Presets:</span>
                    {getPresetsForAppliance(app.id)!.map((preset, idx) => {
                      const isActive = app.watts === preset.value;
                      return (
                        <button
                          key={idx}
                          onClick={() => updateWatts(app.id, preset.value)}
                          className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-all duration-200 cursor-pointer ${
                            isActive
                              ? "border-primary-blue bg-blue-50/70 text-primary-blue dark:border-primary-green dark:bg-green-950/40 dark:text-primary-green shadow-sm"
                              : "border-slate-200/60 bg-white dark:border-slate-800/80 dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-450 shadow-sm"
                          }`}
                        >
                          {preset.label} ({preset.value}W)
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Single Unit Configurations */}
                {app.quantity <= 1 ? (
                  <div className="space-y-4 relative z-10">
                    {/* Usage Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                        <span>Daily usage duration</span>
                        <span className="text-primary-blue dark:text-primary-green font-extrabold">
                          {app.hours} hrs/day
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="24"
                        step="0.5"
                        value={app.hours}
                        onChange={(e) => updateHours(app.id, parseFloat(e.target.value))}
                        className="premium-slider w-full cursor-pointer"
                        style={{
                          background: activeTheme === "dark"
                            ? `linear-gradient(to right, #10b981 0%, #22d3ee ${(app.hours / 24) * 100}%, #1e293b ${(app.hours / 24) * 100}%, #1e293b 100%)`
                            : `linear-gradient(to right, #2563eb 0%, #06b6d4 ${(app.hours / 24) * 100}%, #e2e8f0 ${(app.hours / 24) * 100}%, #e2e8f0 100%)`
                        }}
                      />
                    </div>

                    {/* Age Slider (AC, Fridge, Fan only) */}
                    {["ac", "fridge", "fan"].includes(app.id) && (
                      <div className="space-y-2 pt-2 border-t border-slate-150 dark:border-slate-850">
                        <div className="flex justify-between text-xs font-bold text-slate-550 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            Appliance Age
                            {app.age && app.age >= 5 ? (
                              <span className="text-[9px] text-amber-500 font-extrabold flex items-center gap-0.5 animate-pulse">
                                <AlertTriangle className="w-3 h-3 text-amber-500" /> ({Math.round(app.age * getApplianceDecayRate(app.id) * 100)}% Decay)
                              </span>
                            ) : null}
                          </span>
                          <span className="text-primary-blue dark:text-primary-green font-extrabold">
                            {app.age || 0} years old
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="15"
                          step="1"
                          value={app.age || 0}
                          onChange={(e) => updateAge(app.id, parseInt(e.target.value) || 0)}
                          className="premium-slider w-full cursor-pointer"
                          style={{
                            background: activeTheme === "dark"
                              ? `linear-gradient(to right, #10b981 0%, #22d3ee ${((app.age || 0) / 15) * 100}%, #1e293b ${((app.age || 0) / 15) * 100}%, #1e293b 100%)`
                              : `linear-gradient(to right, #2563eb 0%, #06b6d4 ${((app.age || 0) / 15) * 100}%, #e2e8f0 ${((app.age || 0) / 15) * 100}%, #e2e8f0 100%)`
                          }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  /* Multiple Units configuration - Collapsible details */
                  <div className="space-y-2 relative z-10">
                    <button
                      onClick={() => toggleUnits(app.id)}
                      className="flex items-center justify-between w-full py-2.5 px-3.5 bg-slate-50/80 hover:bg-slate-100 dark:bg-slate-850/40 dark:hover:bg-slate-850 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-350 border border-slate-200/50 dark:border-slate-800 transition-all cursor-pointer shadow-sm"
                    >
                      <span className="flex items-center gap-1.5">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-primary-blue dark:text-primary-green" />
                        Configure {app.quantity} units individually
                      </span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-355 ${isUnitsExpanded ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence initial={false}>
                      {isUnitsExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 mt-2.5 bg-slate-50/40 dark:bg-slate-950/20 border border-slate-200/40 dark:border-slate-800/30 rounded-2xl space-y-4 shadow-inner relative z-10">
                            {/* Unit Hours */}
                            <div className="space-y-3">
                              <div className="flex justify-between items-center text-xs font-bold text-slate-550 dark:text-slate-400 border-b border-slate-200/40 dark:border-slate-800/20 pb-2">
                                <span>Unit Durations</span>
                                <span className="text-primary-blue dark:text-primary-green text-[10px]">
                                  Avg: {app.hours} hrs/day
                                </span>
                              </div>
                              <div className="space-y-3">
                                {Array.from({ length: app.quantity }).map((_, idx) => {
                                  const currentHours = app.unitHours?.[idx] !== undefined ? app.unitHours[idx] : app.hours;
                                  const pct = (currentHours / 24) * 100;
                                  return (
                                    <div key={idx} className="space-y-1">
                                      <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-slate-455">
                                        <span>Unit #{idx + 1} Usage</span>
                                        <span className="text-primary-blue dark:text-primary-green font-semibold">
                                          {currentHours} hrs/day
                                        </span>
                                      </div>
                                      <input
                                        type="range"
                                        min="0"
                                        max="24"
                                        step="0.5"
                                        value={currentHours}
                                        onChange={(e) => updateUnitHours(app.id, idx, parseFloat(e.target.value))}
                                        className="premium-slider w-full cursor-pointer"
                                        style={{
                                          background: activeTheme === "dark"
                                            ? `linear-gradient(to right, #10b981 0%, #22d3ee ${pct}%, #1e293b ${pct}%, #1e293b 100%)`
                                            : `linear-gradient(to right, #2563eb 0%, #06b6d4 ${pct}%, #e2e8f0 ${pct}%, #e2e8f0 100%)`
                                        }}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Unit Ages (AC, Fridge, Fan only) */}
                            {["ac", "fridge", "fan"].includes(app.id) && (
                              <div className="space-y-3 pt-3 border-t border-slate-200/40 dark:border-slate-850">
                                <div className="flex justify-between items-center text-xs font-bold text-slate-550 dark:text-slate-400 border-b border-slate-200/40 dark:border-slate-800/20 pb-2">
                                  <span>Unit Ages</span>
                                  <span className="text-primary-blue dark:text-primary-green text-[10px]">
                                    Avg: {app.age || 0} yrs
                                  </span>
                                </div>
                                <div className="space-y-3">
                                  {Array.from({ length: app.quantity }).map((_, idx) => {
                                    const currentAge = app.unitAges?.[idx] !== undefined ? app.unitAges[idx] : (app.age || 0);
                                    const pct = (currentAge / 15) * 100;
                                    const decayPct = Math.round(currentAge * getApplianceDecayRate(app.id) * 100);
                                    return (
                                      <div key={idx} className="space-y-1">
                                        <div className="flex justify-between text-[11px] font-bold text-slate-550 dark:text-slate-455">
                                          <span className="flex items-center gap-1">
                                            Unit #{idx + 1} Age
                                            {currentAge >= 5 ? (
                                              <span className="text-[9px] text-amber-500 font-extrabold flex items-center gap-0.5 animate-pulse">
                                                <AlertTriangle className="w-3 h-3" /> ({decayPct}% Decay)
                                              </span>
                                            ) : null}
                                          </span>
                                          <span className="text-primary-blue dark:text-primary-green font-semibold">
                                            {currentAge} yrs
                                          </span>
                                        </div>
                                        <input
                                          type="range"
                                          min="0"
                                          max="15"
                                          step="1"
                                          value={currentAge}
                                          onChange={(e) => updateUnitAge(app.id, idx, parseInt(e.target.value) || 0)}
                                          className="premium-slider w-full cursor-pointer"
                                          style={{
                                            background: activeTheme === "dark"
                                              ? `linear-gradient(to right, #10b981 0%, #22d3ee ${pct}%, #1e293b ${pct}%, #1e293b 100%)`
                                              : `linear-gradient(to right, #2563eb 0%, #06b6d4 ${pct}%, #e2e8f0 ${pct}%, #e2e8f0 100%)`
                                          }}
                                        />
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="h-11 px-5 flex items-center justify-center text-sm font-bold rounded-xl text-slate-600 dark:text-slate-400 bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 hover:scale-[1.01] transition-all cursor-pointer shadow-sm hover:shadow"
        >
          Back
        </motion.button>
        <motion.button
          onClick={onAnalyze}
          disabled={isAnalyzing || activeAppliances.length === 0}
          whileHover={isAnalyzing || activeAppliances.length === 0 ? {} : { scale: 1.02 }}
          whileTap={isAnalyzing || activeAppliances.length === 0 ? {} : { scale: 0.98 }}
          className="h-11 px-6 flex items-center justify-center gap-1.5 text-sm font-bold rounded-xl text-white bg-primary-blue hover:bg-primary-blue/90 dark:bg-primary-green dark:text-slate-950 dark:hover:bg-primary-green/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer"
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white dark:border-slate-950/30 dark:border-t-slate-950 animate-spin rounded-full"></div>
              Analyzing...
            </>
          ) : (
            <>
              Analyze & Save
              <Zap className="w-4.5 h-4.5" />
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};
