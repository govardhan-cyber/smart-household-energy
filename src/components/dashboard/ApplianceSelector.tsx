import React from "react";
import { 
  Wind, Flame, Tv, Fan, Laptop, Lightbulb, Zap, ChevronRight,
  Refrigerator, WashingMachine, Microwave, CookingPot, Coffee, Blender,
  Monitor, Router, Gamepad2, Printer, Filter, Thermometer, Droplet, GlassWater
} from "lucide-react";
import type { ApplianceItem } from "../../utils/tariffCalculator";

// Mapping icons to appliances
const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case "Refrigerator": return <Refrigerator className="w-5 h-5" />;
    case "Wind": return <Wind className="w-5 h-5" />;
    case "Fan": return <Fan className="w-5 h-5" />;
    case "Lightbulb": return <Lightbulb className="w-5 h-5" />;
    case "Tv": return <Tv className="w-5 h-5" />;
    case "WashingMachine": return <WashingMachine className="w-5 h-5" />;
    case "Flame": return <Flame className="w-5 h-5" />;
    case "Microwave": return <Microwave className="w-5 h-5" />;
    case "CookingPot": return <CookingPot className="w-5 h-5" />;
    case "Coffee": return <Coffee className="w-5 h-5" />;
    case "Blender": return <Blender className="w-5 h-5" />;
    case "Laptop": return <Laptop className="w-5 h-5" />;
    case "Monitor": return <Monitor className="w-5 h-5" />;
    case "Router": return <Router className="w-5 h-5" />;
    case "Gamepad2": return <Gamepad2 className="w-5 h-5" />;
    case "Printer": return <Printer className="w-5 h-5" />;
    case "Filter": return <Filter className="w-5 h-5" />;
    case "Thermometer": return <Thermometer className="w-5 h-5" />;
    case "Droplet": return <Droplet className="w-5 h-5" />;
    case "GlassWater": return <GlassWater className="w-5 h-5" />;
    default: return <Zap className="w-5 h-5" />;
  }
};

const CATEGORIES = [
  { id: "essential", name: "Essential Appliances (Must Add)" },
  { id: "kitchen", name: "Kitchen Appliances" },
  { id: "electronics", name: "Electronics" },
  { id: "comfort", name: "Home Comfort" },
  { id: "water", name: "Water Related" }
];

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
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white text-left">Select appliances in your home</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 text-left mt-1 font-medium">
          Click each card to toggle appliances on or off. You'll specify quantities on the next step.
        </p>
      </div>

      <div className="space-y-8 max-h-[420px] overflow-y-auto pr-1">
        {CATEGORIES.map(category => {
          const categoryAppliances = appliances.filter(app => app.category === category.id);
          if (categoryAppliances.length === 0) return null;
          return (
            <div key={category.id} className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-1.5 text-left">
                {category.name}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {categoryAppliances.map(app => {
                  const isSelected = app.quantity > 0;
                  return (
                    <button
                      key={app.id}
                      onClick={() => toggleAppliance(app.id)}
                      className={`group p-4 flex flex-col items-start justify-between text-left h-[120px] rounded-2xl border transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md active:scale-[0.97] relative overflow-hidden cursor-pointer ${
                        isSelected
                          ? "border-primary-blue bg-gradient-to-br from-blue-50/30 to-blue-100/10 dark:border-primary-green dark:bg-gradient-to-br dark:from-green-950/10 dark:to-green-950/5 shadow-sm"
                          : "border-slate-200 bg-gradient-to-br from-white to-slate-50/30 dark:border-slate-800 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950/10"
                      }`}
                    >
                      {/* Active state ambient glow */}
                      <div className={`absolute -right-8 -top-8 w-16 h-16 blur-xl opacity-20 pointer-events-none rounded-full transition-colors ${
                        isSelected ? "bg-primary-blue dark:bg-primary-green" : "bg-transparent"
                      }`} />



                      <div className={`p-2.5 rounded-xl border transition-all relative z-10 ${
                        isSelected
                          ? "bg-primary-blue text-white dark:bg-primary-green dark:text-slate-950 border-transparent"
                          : "bg-slate-50 dark:bg-slate-800/80 text-slate-500 border-slate-200 dark:border-slate-800"
                      }`}>
                        {getIconComponent(app.icon)}
                      </div>
                      <div className="w-full relative z-10">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {app.name}
                        </h4>
                        <span className="text-[10px] font-semibold text-slate-450 dark:text-slate-500 block truncate mt-0.5">
                          {app.hint}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={onNext}
          disabled={!hasSelection}
          className="h-11 px-6 flex items-center justify-center gap-1.5 text-sm font-bold rounded-xl text-white bg-primary-blue hover:bg-primary-blue/90 dark:bg-primary-green dark:text-slate-950 dark:hover:bg-primary-green/90 transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none cursor-pointer"
        >
          Next: Configure Usage
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

