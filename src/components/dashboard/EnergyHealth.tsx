import React, { useState, useEffect } from "react";
import { 
  Zap, Sun, Lightbulb, Wind, Snowflake, Sparkles, CheckCircle2
} from "lucide-react";
import type { ApplianceItem, TariffResult } from "../../utils/tariffCalculator";

// Count-up/down animation component
const AnimatedNumber: React.FC<{
  value: number;
  duration?: number;
}> = ({ value, duration = 400 }) => {
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

  return <span>{Math.round(displayValue)}</span>;
};

interface EnergyHealthProps {
  liveTotalUnits: number;
  liveBill: TariffResult;
  liveSavingsPotential: number;
  solarOffsetPercent: number;
  recommendedKw: number;
  activeAppliances: ApplianceItem[];
  appliances: ApplianceItem[];
}

export const EnergyHealth: React.FC<EnergyHealthProps> = ({
  liveTotalUnits,
  liveBill,
  liveSavingsPotential,
  solarOffsetPercent,
  recommendedKw,
  activeAppliances,
  appliances
}) => {
  // 1. Calculate health score dynamically
  const calculateScoreInfo = () => {
    if (activeAppliances.length === 0) {
      return {
        score: 100,
        status: "Excellent" as const,
        themeClass: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/50 stroke-green-500",
        explanation: "Add appliances to begin auditing your home's energy health."
      };
    }

    let score = 100;
    const details: string[] = [];

    // A. Monthly consumption penalty (max 30 pts)
    if (liveTotalUnits > 250) {
      const excess = liveTotalUnits - 250;
      const penalty = Math.min(30, (excess / 250) * 15);
      score -= penalty;
      details.push("usage exceeds 250 kWh baseline");
    } else {
      const savings = 250 - liveTotalUnits;
      const bonus = Math.min(5, (savings / 250) * 10);
      score += bonus;
    }

    // B. Savings opportunity penalty (max 30 pts)
    const billCharge = liveBill.netEnergyCharge || 1;
    const savingsRatio = liveSavingsPotential / billCharge;
    if (savingsRatio > 0.05) {
      const savingsPenalty = Math.min(30, savingsRatio * 50);
      score -= savingsPenalty;
      details.push("unlocked saving opportunities");
    }

    // C. Solar offset bonus (max 15 pts)
    if (solarOffsetPercent > 0) {
      const solarBonus = Math.min(15, (solarOffsetPercent / 100) * 15);
      score += solarBonus;
    } else {
      details.push("no solar offset configured");
    }

    // D. Appliance specific runtime penalties (max 25 pts)
    const ac = appliances.find(a => a.id === "ac" && a.quantity > 0);
    if (ac && ac.hours > 6) {
      score -= 10;
      details.push(`long AC runtime (${ac.hours} hrs/day)`);
    }

    const lights = appliances.find(a => a.id === "lights" && a.quantity > 0);
    const tube = appliances.find(a => a.id === "lights_tube" && a.quantity > 0);
    if ((lights && lights.watts > 12) || (tube && tube.watts > 18)) {
      score -= 5;
      details.push("conventional high-wattage lighting");
    }

    const fridge = appliances.find(a => a.id === "fridge" && a.quantity > 0);
    if (fridge && fridge.hours < 24) {
      // Refrigerator should run 24 hours normally. If they configured lower or multiple units:
      if (fridge.quantity > 1) {
        score -= 5;
        details.push("multiple refrigerators");
      }
    }

    const finalScore = Math.max(10, Math.min(100, Math.round(score)));

    let status: "Excellent" | "Good" | "Average" | "Needs Improvement" = "Good";
    let themeClass = "";
    let explanation = "";

    if (finalScore >= 85) {
      status = "Excellent";
      themeClass = "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/50 stroke-green-500";
      explanation = "Your home is highly energy-efficient! You have low consumption relative to baseline and minor energy waste.";
    } else if (finalScore >= 70) {
      status = "Good";
      themeClass = "text-primary-blue dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50 stroke-blue-500";
      explanation = "Good energy habits. You can improve further by upgrading to LEDs or optimizing AC daily runtime.";
    } else if (finalScore >= 50) {
      status = "Average";
      themeClass = "text-warning-orange bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/50 stroke-orange-500";
      explanation = "Average energy efficiency. High-power appliances like AC or water heaters are impacting your score.";
    } else {
      status = "Needs Improvement";
      themeClass = "text-alert-red bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50 stroke-red-500";
      explanation = "High energy waste detected. Consider reducing appliance operating hours, installing solar, or upgrading to 5-star devices.";
    }

    if (details.length > 0) {
      explanation += ` Key factors: ${details.join(", ")}.`;
    }

    return { score: finalScore, status, themeClass, explanation };
  };

  const { score, status, themeClass, explanation } = calculateScoreInfo();

  // 2. Generate personalized insights dynamically
  const generateInsights = () => {
    if (activeAppliances.length === 0) return [];

    const insights = [];
    const avgRate = liveTotalUnits > 0 ? (liveBill.netEnergyCharge / liveTotalUnits) : 6.5;

    // AC Insight
    const acApp = appliances.find(a => a.id === "ac" && a.quantity > 0);
    if (acApp) {
      const acSavedKwh = acApp.quantity * (acApp.watts / 1000) * (acApp.hours > 2 ? 2 : acApp.hours * 0.5) * 30;
      const acSavingsPerMonth = acSavedKwh * avgRate;
      const acAnnualSavings = acSavingsPerMonth * 12;
      insights.push({
        id: "ac",
        title: "AC Optimization Opportunity",
        description: `Your AC runs for ${acApp.hours} hrs/day. Reducing runtime by 2 hours could save ~₹${Math.round(acAnnualSavings).toLocaleString()}/year.`,
        badge: `${acApp.hours > 6 ? "High Load" : "Optimize"}`,
        badgeColor: "bg-red-50 dark:bg-red-950/20 text-alert-red border border-red-200 dark:border-red-900/40",
        icon: <Wind className="w-5 h-5 text-alert-red" />
      });
    }

    // Fridge Insight
    const fridgeApp = appliances.find(a => a.id === "fridge" && a.quantity > 0);
    if (fridgeApp) {
      // 5-star rating saves ~15% energy vs standard model
      const fridgeUnits = fridgeApp.quantity * (fridgeApp.watts / 1000) * fridgeApp.hours * 30;
      const fridgeSavedUnits = fridgeUnits * 0.15;
      const fridgeSavingsPerMonth = fridgeSavedUnits * avgRate;
      const fridgeAnnualSavings = fridgeSavingsPerMonth * 12;
      insights.push({
        id: "fridge",
        title: "Upgrade to 5-Star Refrigerator",
        description: `Switching to a 5-star energy rated refrigerator could save you ₹${Math.round(fridgeAnnualSavings).toLocaleString()}/year in continuous running charges.`,
        badge: "Up to 15% Save",
        badgeColor: "bg-green-50 dark:bg-green-950/20 text-primary-green border border-green-200 dark:border-green-900/40",
        icon: <Snowflake className="w-5 h-5 text-primary-green" />
      });
    }

    // Solar Insight
    if (solarOffsetPercent > 0) {
      insights.push({
        id: "solar",
        title: "Roof Solar Potential Active",
        description: `Your roof space supports a ${recommendedKw} kW system. It is estimated to offset ${solarOffsetPercent}% of your grid electricity demand.`,
        badge: "Clean Energy",
        badgeColor: "bg-amber-50 dark:bg-amber-950/20 text-amber-500 border border-amber-200 dark:border-amber-900/40",
        icon: <Sun className="w-5 h-5 text-amber-500" />
      });
    }

    // Lights Upgrade Insight
    const lightsApp = appliances.find(a => a.id === "lights" && a.quantity > 0);
    if (lightsApp && lightsApp.watts > 12) {
      const lightsUnits = lightsApp.quantity * (lightsApp.watts / 1000) * lightsApp.hours * 30;
      const lightsSavedUnits = lightsUnits * 0.75; // Switching to 9W LEDs
      const lightsSavingsPerMonth = lightsSavedUnits * avgRate;
      const lightsAnnualSavings = lightsSavingsPerMonth * 12;
      insights.push({
        id: "lights",
        title: "Switch Bulbs to LEDs",
        description: `Your current LED bulb wattage profile (${lightsApp.watts}W) is high. Upgrading to 9W LEDs could save you ₹${Math.round(lightsAnnualSavings).toLocaleString()}/year.`,
        badge: "75% Light Save",
        badgeColor: "bg-green-50 dark:bg-green-950/20 text-primary-green border border-green-200 dark:border-green-900/40",
        icon: <Lightbulb className="w-5 h-5 text-primary-green" />
      });
    }

    const tubeApp = appliances.find(a => a.id === "lights_tube" && a.quantity > 0);
    if (tubeApp && tubeApp.watts > 18) {
      const tubeUnits = tubeApp.quantity * (tubeApp.watts / 1000) * tubeApp.hours * 30;
      const tubeSavedUnits = tubeUnits * ((tubeApp.watts - 18) / tubeApp.watts); // Upgrading to 18W T5 LED
      const tubeSavingsPerMonth = tubeSavedUnits * avgRate;
      const tubeAnnualSavings = tubeSavingsPerMonth * 12;
      insights.push({
        id: "lights_tube",
        title: "Upgrade to T5 LED Tubes",
        description: `Your current tube light wattage profile (${tubeApp.watts}W) is high. Upgrading to 18W T5 LEDs could save you ₹${Math.round(tubeAnnualSavings).toLocaleString()}/year.`,
        badge: "Tube LED Upgrade",
        badgeColor: "bg-green-50 dark:bg-green-950/20 text-primary-green border border-green-200 dark:border-green-900/40",
        icon: <Lightbulb className="w-5 h-5 text-primary-green" />
      });
    }

    // Standby Power Insight
    if (liveTotalUnits > 100) {
      const standbyUnits = liveTotalUnits * 0.05;
      const standbySavingsPerMonth = standbyUnits * avgRate;
      const standbyAnnualSavings = standbySavingsPerMonth * 12;
      insights.push({
        id: "standby",
        title: "Eliminate Standby Loads",
        description: `Standby power draws ~5% of your energy. Unplugging appliances when not in use saves ₹${Math.round(standbyAnnualSavings).toLocaleString()}/year.`,
        badge: "Easy Fix",
        badgeColor: "bg-slate-50 dark:bg-slate-800 text-slate-550 dark:text-slate-400 border border-slate-200 dark:border-slate-700",
        icon: <Zap className="w-5 h-5 text-slate-550 dark:text-slate-400" />
      });
    }

    // Sort insights to put high load/priority first
    return insights.slice(0, 3);
  };

  const insights = generateInsights();

  // SVG parameters for circular progress gauge
  const radius = 40;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * score) / 100;

  // Determine stroke color class
  const getStrokeColor = () => {
    if (score >= 85) return "stroke-green-500";
    if (score >= 70) return "stroke-blue-500";
    if (score >= 50) return "stroke-orange-500";
    return "stroke-red-500";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 no-print">
      {/* Energy Health Score Card */}
      <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between items-start text-left relative overflow-hidden group hover:shadow-md transition-all duration-300">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-20 h-20 bg-slate-50 dark:bg-slate-800/20 rounded-full blur-xl pointer-events-none"></div>
        
        <div className="w-full">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest">
              Energy Health Score
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${themeClass.split(' stroke-')[0]}`}>
              {status}
            </span>
          </div>

          {/* Circle Gauge Container */}
          <div className="flex items-center gap-5 my-6">
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  className="stroke-slate-100 dark:stroke-slate-800"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  className={`${getStrokeColor()} transition-all duration-700 ease-out`}
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-display font-extrabold text-slate-900 dark:text-white leading-none">
                  <AnimatedNumber value={score} />
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">/100</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Home Rating</h4>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-455 leading-tight">
                Calculated in real-time based on active appliance configuration and opportunities.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <p className="text-xs text-slate-655 dark:text-slate-400 leading-relaxed">
            {explanation}
          </p>
        </div>
      </div>

      {/* Smart Insights Panel */}
      <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between text-left hover:shadow-md transition-all duration-300">
        <div className="w-full">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-500 dark:text-yellow-400" />
              Smart Energy Insights
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              {insights.length} recommendations
            </span>
          </div>

          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800/80">
            {insights.length > 0 ? (
              insights.map(insight => (
                <div key={insight.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-4 group">
                  <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 group-hover:scale-105 transition-transform shrink-0">
                    {insight.icon}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary-blue dark:group-hover:text-primary-green transition-colors">
                        {insight.title}
                      </h4>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide shrink-0 ${insight.badgeColor}`}>
                        {insight.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
                      {insight.description}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-550">
                <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
                <p className="text-sm font-bold">No active inefficiencies detected</p>
                <p className="text-xs mt-0.5">Please add appliances to generate insights.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
