import React, { useState, useEffect } from "react";
import { Sun, Home, Zap, Building2, Leaf, Info, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface SolarReadinessScoreProps {
  score: number;
  stateName: string;
  recommendedKw: number;
  roofArea: number;
}

export const SolarReadinessScore: React.FC<SolarReadinessScoreProps> = ({
  score,
  stateName,
  recommendedKw,
  roofArea
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = animatedScore;
    const endValue = score;
    if (startValue === endValue) return;

    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / 800, 1);
      const easedProgress = progress * (2 - progress);
      const current = startValue + easedProgress * (endValue - startValue);
      setAnimatedScore(Math.round(current));
      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [score]);

  let statusText = "Good Candidate";
  let badgeColor = "bg-green-500/10 text-green-700 dark:text-primary-green border-green-500/20";
  let badgeText = "Good Potential";
  let textExplanation = "Score >75 indicates high suitability.";
  
  if (score >= 85) {
    statusText = "Excellent Candidate";
    badgeColor = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    badgeText = "Excellent Potential";
    textExplanation = "Score >85 indicates outstanding setup.";
  } else if (score < 60) {
    statusText = "Low Feasibility";
    badgeColor = "bg-rose-500/10 text-rose-600 dark:text-rose-455 border-rose-500/20";
    badgeText = "Low Feasibility";
    textExplanation = "Score <60 suggests lower generation.";
  }

  const circumference = 163.3; // 2 * pi * 26
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-[0_0_25px_-5px_rgba(245,158,11,0.2)] hover:border-amber-500/20 transition-all duration-300 flex flex-col justify-between text-left space-y-4 relative overflow-hidden group [backface-visibility:hidden] [transform-style:preserve-3d]">
      {/* Top right corner glowing wash */}
      <div className="absolute -right-6 -top-6 w-24 h-24 blur-xl opacity-20 dark:opacity-10 rounded-full bg-amber-500 pointer-events-none group-hover:scale-150 transition-all duration-500" />
      
      {/* Top Row: Title block and circular gauge side-by-side */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-850 pb-3 relative z-10">
        <div className="flex gap-2.5">
          <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl h-9.5 w-9.5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Sun className="w-5 h-5 animate-spin" style={{ animationDuration: "20s" }} />
          </div>
          <div>
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest block">
              SOLAR READINESS
            </span>
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase leading-tight mt-1">
              {statusText}
            </h3>
            <p className="text-[9.5px] text-slate-500 dark:text-slate-455 mt-0.5 leading-tight">
              High suitability for residential solar setup.
            </p>
          </div>
        </div>

        {/* Circular Gauge */}
        <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r="26"
              className="stroke-slate-100 dark:stroke-slate-800"
              strokeWidth="5"
              fill="transparent"
            />
            <circle
              cx="32"
              cy="32"
              r="26"
              className="stroke-amber-500 dark:stroke-primary-green transition-all duration-300 ease-out"
              strokeWidth="5"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-base font-display font-black text-slate-900 dark:text-white leading-none">
              {animatedScore}
            </span>
            <span className="text-[7.5px] font-bold text-slate-400 uppercase mt-0.5 tracking-wider">
              / 100
            </span>
          </div>
        </div>
      </div>

      {/* Middle Block: List and Potential Badge side-by-side */}
      <div className="flex items-center justify-between gap-4 my-1 relative z-10">
        {/* Left Side: Compact row items */}
        <div className="flex-1 space-y-2.5">
          {/* Roof Area */}
          <div className="flex items-center gap-2.5 group/item">
            <div className="p-1.5 bg-green-500/10 text-green-605 dark:text-primary-green rounded-lg shrink-0 group-hover/item:scale-110 transition-transform">
              <Home className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[9.5px] text-slate-400 dark:text-slate-55 block leading-none">Usable Area</span>
              <span className="text-xs font-bold text-green-650 dark:text-primary-green mt-1 block">
                {roofArea} sq ft
              </span>
            </div>
          </div>

          {/* Solar Yield */}
          <div className="flex items-center gap-2.5 group/item">
            <div className="p-1.5 bg-blue-500/10 text-blue-500 rounded-lg shrink-0 group-hover/item:scale-110 transition-transform">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[9.5px] text-slate-400 dark:text-slate-55 block leading-none">Solar Yield</span>
              <span className="text-xs font-bold text-blue-500 mt-1 block">
                {Math.round(recommendedKw * 120)} kWh/mo
              </span>
            </div>
          </div>

          {/* DISCOM */}
          <div className="flex items-center gap-2.5 group/item">
            <div className="p-1.5 bg-purple-500/10 text-purple-505 dark:text-purple-400 rounded-lg shrink-0 group-hover/item:scale-110 transition-transform">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[9.5px] text-slate-400 dark:text-slate-55 block leading-none">DISCOM Provider</span>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 mt-1 block truncate max-w-[125px]" title={stateName}>
                {stateName}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Badge & description */}
        <div className="flex flex-col items-center shrink-0 w-28 text-center space-y-1">
          <span className={`text-[8.5px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider ${badgeColor}`}>
            {badgeText}
          </span>
          <p className="text-[9px] text-slate-455 dark:text-slate-500 font-bold leading-normal mt-1">
            {textExplanation}
          </p>
        </div>
      </div>

      {/* Bottom Group: Alert & Footer grouped together to eliminate awkward vertical stretching gaps */}
      <div className="space-y-2.5 mt-auto relative z-10">
        {/* Bottom Block: Compact Good Fit Alert */}
        <motion.button
          onClick={() => {
            window.dispatchEvent(new CustomEvent("she_trigger_chat", { 
              detail: { message: `Analyze my solar readiness parameters. My roof is ${roofArea} sq ft in ${stateName}. Explain why this is a good fit.` } 
            }));
          }}
          whileHover={{ y: -3, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="button"
          className="w-full p-3.5 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 dark:from-emerald-900/10 dark:to-teal-900/5 border border-emerald-500/15 dark:border-emerald-500/20 rounded-2xl flex items-center justify-between gap-3 text-left cursor-pointer transition-colors duration-200 hover:border-emerald-500/35 hover:shadow-[0_4px_20px_rgba(16,185,129,0.06)] group/fit relative overflow-hidden"
        >
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-primary-green rounded-xl shrink-0 shadow-sm">
              <Leaf className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-400 block uppercase tracking-wider">
                Why it's a good fit
              </span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-snug block mt-0.5">
                Ample roof space & high yield for maximum savings.
              </span>
            </div>
          </div>
          <div className="p-1.5 bg-emerald-500/10 text-emerald-600 dark:text-primary-green rounded-lg shrink-0 group-hover/fit:bg-emerald-500 group-hover/fit:text-white transition-colors duration-250">
            <ArrowRight className="w-3.5 h-3.5 group-hover/fit:translate-x-0.5 transition-transform duration-250" />
          </div>
        </motion.button>

        {/* Footer Info Callout */}
        <div className="flex items-center gap-1.5 text-[8.5px] font-bold text-slate-400 dark:text-slate-550 pt-2 border-t border-slate-100 dark:border-slate-850">
          <Info className="w-3 h-3" />
          <span>Score based on roof, yield, and DISCOM provider.</span>
        </div>
      </div>
    </div>
  );
};
