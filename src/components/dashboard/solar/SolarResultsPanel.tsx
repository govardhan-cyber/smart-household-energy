import React from "react";
import { Zap, Layers } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedNumber } from "./AnimatedNumber";
import { SolarReadinessScore } from "./SolarReadinessScore";
import type { UseSolarCalculatorStateReturn } from "../../../hooks/useSolarCalculatorState";

interface SolarResultsPanelProps {
  solarState: UseSolarCalculatorStateReturn;
}

export const SolarResultsPanel: React.FC<SolarResultsPanelProps> = ({
  solarState
}) => {
  const {
    roofArea,
    selectedState,
    tariffIncrease,
    recommendedKw,
    totalUpfrontInvestment,
    firstYearSavings,
    twentyFiveYearNetSavings,
    paybackPeriodVal,
    panelsNeeded,
    conclusion,
    readinessScore,
    co2Reduction,
    treesEquivalent,
    isMounted,
    roofTilt,
    setRoofTilt,
    roofOrientation,
    setRoofOrientation,
    shadedPanels,
    togglePanelShaded,
    getFullStateName,
    roiOutput,
    spaceUtilizedPercent
  } = solarState;

  const { paybackData, totalNoSolarCost25Years, totalSolarCost25Years } = roiOutput;

  // Sizing diagnostics derived states
  const shadedCount = Object.values(shadedPanels).filter(Boolean).length;

  const renderRoofMockup = () => {
    const orientationMultiplier = roofOrientation === "south" ? 1.0 : 0.85;
    const tiltMultiplier = roofTilt === "flat" ? 0.90 : 1.0;
    const shadingFactor = panelsNeeded > 0 
      ? 1 - (Math.min(panelsNeeded, shadedCount) / panelsNeeded) * 0.60
      : 1.0;
    const systemOutputPercent = Math.round(orientationMultiplier * tiltMultiplier * shadingFactor * 100);

    // Sun visual positions
    let sunX = 190, sunY = 15, sunGlow = "rgba(245, 158, 11, 0.4)";
    if (roofOrientation === "east") {
      sunX = 60; sunY = 25; sunGlow = "rgba(249, 115, 22, 0.3)";
    } else if (roofOrientation === "west") {
      sunX = 320; sunY = 25; sunGlow = "rgba(249, 115, 22, 0.3)";
    }

    // Bilinear interpolation for panels on isometric roof
    const y_front = roofTilt === "flat" ? 95 : 115;
    const y_back = roofTilt === "flat" ? 55 : 65;

    const cols = 4;
    const rows = Math.max(1, Math.ceil(panelsNeeded / cols));
    const du = 0.82 / cols;
    const dv = 0.82 / rows;

    const getIsoXY = (u: number, v: number) => {
      const lx = 60 + v * (160 - 60);
      const ly = y_front + v * (y_back - y_front);
      const rx = 240 + v * (340 - 240);
      const ry = y_front + v * (y_back - y_front);
      return {
        x: lx + u * (rx - lx),
        y: ly + u * (ry - ly)
      };
    };

    return (
      <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md p-4 rounded-3xl border border-slate-200/60 dark:border-slate-800/50 text-center relative overflow-hidden flex flex-col justify-between shadow-sm space-y-3 group hover:shadow-md hover:border-indigo-500/30 transition-all duration-300 [backface-visibility:hidden] [transform-style:preserve-3d]">
        {/* Top right corner glowing wash */}
        <div className="absolute -right-6 -top-6 w-24 h-24 blur-xl opacity-20 dark:opacity-10 rounded-full bg-indigo-500 pointer-events-none group-hover:scale-150 transition-all duration-500" />
        
        {/* Title */}
        <div className="flex justify-between items-center text-left relative z-10">
          <div>
            <span className="text-[9px] font-black text-slate-455 dark:text-slate-500 uppercase tracking-widest block mb-0.5">
              ROOFTOP PLACEMENT MAP
            </span>
            <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase font-display">
              Isometric Rooftop Planner
            </h4>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`flex h-1.5 w-1.5 rounded-full ${
              systemOutputPercent >= 90
                ? "bg-emerald-500"
                : systemOutputPercent >= 70
                ? "bg-amber-500"
                : "bg-rose-500"
            } animate-pulse`} />
            <span className={`text-[9.5px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider shadow-sm backdrop-blur-sm ${
              systemOutputPercent >= 90
                ? "bg-green-500/10 border-green-500/20 text-primary-green"
                : systemOutputPercent >= 70
                ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                : "bg-red-500/10 border-red-500/20 text-red-500"
            }`}>
              Yield: {systemOutputPercent}%
            </span>
          </div>
        </div>

        {/* SVG Canvas */}
        <div className="flex-1 flex items-center justify-center py-2 bg-slate-50/40 dark:bg-slate-955/40 backdrop-blur-sm rounded-[20px] border border-slate-200/40 dark:border-slate-800/30 relative min-h-[125px] overflow-hidden shadow-inner">
          {/* Sun Glow */}
          <div 
            className="absolute rounded-full pointer-events-none transition-all duration-500"
            style={{ 
              left: sunX + 45, 
              top: sunY + 5, 
              width: 50, 
              height: 50, 
              boxShadow: `0 0 45px 15px ${sunGlow}`,
              backgroundColor: "transparent"
            }}
          />

          <svg viewBox="0 0 400 180" className="w-full h-auto max-w-[340px] relative z-10">
            <defs>
              {/* Technical Blueprint Grid Pattern */}
              <pattern id="blueprintGrid" width="16" height="16" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="0.75" fill="currentColor" className="text-slate-300/40 dark:text-slate-700/30" />
              </pattern>
              
              {/* Glowing Gradient for Active Sun */}
              <radialGradient id="sunRadial" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFFBEB" />
                <stop offset="20%" stopColor="#FDE68A" />
                <stop offset="100%" stopColor="#F59E0B" />
              </radialGradient>

              {/* Ambient Shadow Filter */}
              <filter id="sunFilter" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Front Wall Blueprint Gradient */}
              <linearGradient id="frontWallGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(226, 232, 240, 0.25)" />
                <stop offset="100%" stopColor="rgba(148, 163, 184, 0.03)" />
              </linearGradient>

              {/* Side Wall Blueprint Gradient */}
              <linearGradient id="sideWallGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgba(203, 213, 225, 0.2)" />
                <stop offset="100%" stopColor="rgba(71, 85, 105, 0.02)" />
              </linearGradient>

              {/* Roof Blueprint Gradient */}
              <linearGradient id="roofGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(99, 102, 241, 0.16)" />
                <stop offset="100%" stopColor="rgba(99, 102, 241, 0.02)" />
              </linearGradient>

              {/* Active Monocrystalline Panel Gradient */}
              <linearGradient id="activePanel" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#312e81" />
                <stop offset="40%" stopColor="#4338ca" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>

              {/* Shaded Obsidian Panel Gradient */}
              <linearGradient id="shadedPanel" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>

              {/* Window Glass Gradient */}
              <linearGradient id="windowGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgba(6, 182, 212, 0.3)" />
                <stop offset="100%" stopColor="rgba(6, 182, 212, 0.04)" />
              </linearGradient>
            </defs>

            {/* Grid background layer */}
            <rect width="400" height="180" fill="url(#blueprintGrid)" rx="16" />

            {/* Dotted radiation rays from Sun to Roof corners & center */}
            <line x1={sunX} y1={sunY} x2="120" y2={(y_front + y_back) / 2} stroke="rgba(245, 158, 11, 0.18)" strokeWidth="0.8" strokeDasharray="3 3" className="transition-all duration-500" />
            <line x1={sunX} y1={sunY} x2="200" y2={(y_front + y_back) / 2} stroke="rgba(245, 158, 11, 0.22)" strokeWidth="1" strokeDasharray="3 3" className="transition-all duration-500" />
            <line x1={sunX} y1={sunY} x2="280" y2={(y_front + y_back) / 2} stroke="rgba(245, 158, 11, 0.18)" strokeWidth="0.8" strokeDasharray="3 3" className="transition-all duration-500" />

            {/* Sun */}
            <circle cx={sunX} cy={sunY} r="8" fill="url(#sunRadial)" filter="url(#sunFilter)" className="transition-all duration-500" />
            <circle cx={sunX} cy={sunY} r="13" fill="none" stroke="#F59E0B" strokeWidth="1.2" strokeDasharray="4 4" className="animate-spin transition-all duration-500" style={{ animationDuration: "16s" }} />

            {/* House structure */}
            {/* Front Wall */}
            <polygon 
              points={`60,${y_front} 240,${y_front} 240,165 60,165`} 
              fill="url(#frontWallGrad)"
              className="stroke-slate-300/80 dark:stroke-slate-700/60 stroke-[1.2px] transition-all duration-500" 
            />
            {/* Side Wall */}
            <polygon 
              points={`240,${y_front} 340,${y_back} 340,120 240,165`} 
              fill="url(#sideWallGrad)"
              className="stroke-slate-300/80 dark:stroke-slate-700/60 stroke-[1.2px] transition-all duration-500" 
            />
            
            {/* Door */}
            <rect x="130" y="125" width="40" height="40" rx="4" className="fill-slate-200/30 dark:fill-slate-905/40 stroke-slate-350 dark:stroke-slate-750 stroke-[1.2px]" />
            <circle cx="162" cy="145" r="1.5" fill="#B45309" />

            {/* Window */}
            <polygon 
              points="270,125 310,110 310,95 270,110" 
              fill="url(#windowGrad)"
              className="stroke-cyan-500/40 dark:stroke-cyan-500/20 stroke-[1px]" 
            />
            <line x1="290" y1="117.5" x2="290" y2="102.5" stroke="rgba(34, 211, 238, 0.4)" strokeWidth="0.8" />

            {/* Roof plane */}
            <polygon 
              points={`60,${y_front} 160,${y_back} 340,${y_back} 240,${y_front}`} 
              fill="url(#roofGrad)"
              className="stroke-indigo-400/40 dark:stroke-indigo-500/30 stroke-[2px] transition-all duration-500" 
            />

            {/* SOLAR PANELS */}
            {Array.from({ length: panelsNeeded }).map((_, idx) => {
              const r = Math.floor(idx / cols);
              const c = idx % cols;

              const u_start = 0.08 + c * (0.84 / cols);
              const v_start = 0.08 + r * (0.84 / rows);

              const pA = getIsoXY(u_start, v_start);
              const pB = getIsoXY(u_start + du, v_start);
              const pC = getIsoXY(u_start + du, v_start + dv);
              const pD = getIsoXY(u_start, v_start + dv);

              const isShaded = !!shadedPanels[idx];

              return (
                <polygon
                  key={idx}
                  points={`${pA.x},${pA.y} ${pB.x},${pB.y} ${pC.x},${pC.y} ${pD.x},${pD.y}`}
                  onClick={() => togglePanelShaded(idx)}
                  fill={isShaded ? "url(#shadedPanel)" : "url(#activePanel)"}
                  className={`cursor-pointer transition-all duration-300 stroke-[1.2px] ${
                    isShaded
                      ? "stroke-rose-500/50 hover:stroke-rose-400"
                      : "stroke-indigo-300/40 dark:stroke-indigo-400/40 hover:stroke-cyan-300"
                  }`}
                />
              );
            })}
          </svg>

          {/* Hint Overlay */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-slate-900/80 dark:bg-slate-950/70 backdrop-blur-md border border-white/10 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full pointer-events-none tracking-wide select-none whitespace-nowrap z-20 shadow-sm">
            💡 CLICK PANELS TO TOGGLE SHADING
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-850 relative z-10">
          <div className="flex justify-between items-center gap-4 text-left text-[11px] font-bold">
            {/* Tilt Control */}
            <div className="flex-1 flex flex-col gap-1">
              <span className="text-slate-400 uppercase text-[9px] tracking-wider">Roof Tilt</span>
              <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-800/85">
                <button
                  onClick={() => setRoofTilt("inclined")}
                  className={`flex-1 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    roofTilt === "inclined"
                      ? "bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-emerald-500 dark:to-teal-500 text-white shadow-sm shadow-indigo-500/25 dark:shadow-emerald-500/20 transform scale-[1.02]"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/30 dark:hover:bg-slate-800/40"
                  }`}
                >
                  Pitched (15°)
                </button>
                <button
                  onClick={() => setRoofTilt("flat")}
                  className={`flex-1 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    roofTilt === "flat"
                      ? "bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-emerald-500 dark:to-teal-500 text-white shadow-sm shadow-indigo-500/25 dark:shadow-emerald-500/20 transform scale-[1.02]"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/30 dark:hover:bg-slate-800/40"
                  }`}
                >
                  Flat (0°)
                </button>
              </div>
            </div>

            {/* Orientation Control */}
            <div className="flex-1 flex flex-col gap-1">
              <span className="text-slate-400 uppercase text-[9px] tracking-wider">Orientation</span>
              <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-800/85">
                <button
                  onClick={() => setRoofOrientation("south")}
                  className={`flex-1 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    roofOrientation === "south"
                      ? "bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-emerald-500 dark:to-teal-500 text-white shadow-sm shadow-indigo-500/25 dark:shadow-emerald-500/20 transform scale-[1.02]"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/30 dark:hover:bg-slate-800/40"
                  }`}
                >
                  South
                </button>
                <button
                  onClick={() => setRoofOrientation("east")}
                  className={`flex-1 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    roofOrientation === "east"
                      ? "bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-emerald-500 dark:to-teal-500 text-white shadow-sm shadow-indigo-500/25 dark:shadow-emerald-500/20 transform scale-[1.02]"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/30 dark:hover:bg-slate-800/40"
                  }`}
                >
                  East
                </button>
                <button
                  onClick={() => setRoofOrientation("west")}
                  className={`flex-1 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    roofOrientation === "west"
                      ? "bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-emerald-500 dark:to-teal-500 text-white shadow-sm shadow-indigo-500/25 dark:shadow-emerald-500/20 transform scale-[1.02]"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/30 dark:hover:bg-slate-800/40"
                  }`}
                >
                  West
                </button>
              </div>
            </div>
          </div>
          
          {/* Glass Badges for Stats Row */}
          <div className="flex justify-between items-center gap-2 mt-1 font-display">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100/50 dark:bg-slate-955/30 rounded-xl border border-slate-200/30 dark:border-slate-850/40 text-[9px] font-bold text-slate-500 dark:text-slate-400 select-none">
              <Layers className="w-3.5 h-3.5 text-indigo-500 dark:text-primary-green shrink-0" />
              <span>Panels: <span className="font-extrabold text-slate-700 dark:text-white">{panelsNeeded}</span> ({shadedCount} Shaded)</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100/50 dark:bg-slate-955/30 rounded-xl border border-slate-200/30 dark:border-slate-850/40 text-[9px] font-bold text-slate-500 dark:text-slate-400 select-none">
              <SunIconMini />
              <span>Coverage: <span className="font-extrabold text-slate-700 dark:text-white">{spaceUtilizedPercent}%</span></span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLifetimeTimeline = () => {
    const yr1 = firstYearSavings;
    let yr5 = 0;
    for (let i = 1; i <= 5; i++) {
      yr5 += firstYearSavings * Math.pow(1 + tariffIncrease / 100, i - 1);
    }
    const yr10 = paybackData[10]?.savings || (firstYearSavings * 10);
    const yr25 = twentyFiveYearNetSavings + totalUpfrontInvestment;

    return (
      <div className="backdrop-blur-md bg-white/70 dark:bg-slate-950/45 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/60 shadow-[0_8px_32px_rgba(0,0,0,0.03)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.2)] space-y-5 text-left relative overflow-hidden group hover:border-slate-350 dark:hover:border-slate-700 transition-all duration-300">
        {/* Specular Reflective Gloss Sheen */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000 ease-out pointer-events-none" />
        <div className="absolute -right-6 -top-6 w-24 h-24 blur-xl opacity-20 dark:opacity-10 rounded-full bg-blue-500 pointer-events-none group-hover:scale-150 transition-all duration-500" />
        
        <div className="relative z-10">
          <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-555 uppercase tracking-widest block mb-1">
            LIFETIME CUMULATIVE RETURN
          </h4>
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase font-display">
            Lifetime Savings Timeline
          </h3>
        </div>
        
        <div className="relative border-l-2 border-slate-100 dark:border-slate-800/80 ml-3.5 pl-0 space-y-6 py-2 z-10">
          {[
            { label: "Year 1", amount: yr1 },
            { label: "Year 5", amount: yr5 },
            { label: `Year ${paybackPeriodVal.toFixed(1)} (Break-even)`, amount: totalUpfrontInvestment, isPayback: true },
            { label: "Year 10", amount: yr10 },
            { label: "Year 25", amount: yr25 }
          ].sort((a, b) => a.amount - b.amount).map((item, idx) => {
            const pctOfTotal = yr25 > 0 ? Math.round((item.amount / yr25) * 100) : 0;
            return (
              <div key={idx} className="relative pl-6">
                {item.isPayback ? (
                  <>
                    {/* Timeline Dot (pulsing emerald) */}
                    <div className="absolute left-[-7px] top-[18px] w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
                    
                    <div className="flex flex-col gap-1 bg-gradient-to-r from-emerald-500/8 via-teal-500/4 to-emerald-500/8 dark:from-emerald-500/15 dark:via-teal-500/5 dark:to-emerald-500/10 p-3.5 rounded-2xl border border-emerald-500/20 my-1 hover:border-emerald-500/40 transition-all shadow-[0_4px_16px_rgba(16,185,129,0.05)]">
                      <div className="flex justify-between items-center text-xs font-black text-emerald-600 dark:text-primary-green">
                        <span className="flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 fill-current animate-bounce mt-[-1px]" />
                          YOU RECOVER SETUP COST HERE
                        </span>
                        <span className="bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-0.5 rounded-lg text-[10px] border border-emerald-500/20">
                          Year <AnimatedNumber value={paybackPeriodVal} formatter={(v) => v.toFixed(1)} />
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-550 dark:text-slate-405 leading-normal font-medium mt-0.5">
                        Upfront setup costs are completely recovered! Future savings represent net surplus profit.
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    {/* Timeline Dot */}
                    <div className={`absolute left-[-7px] top-[5px] w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 shadow-sm ${
                      item.label === "Year 25"
                        ? "bg-emerald-500 shadow-[0_0_6px_#10b981]"
                        : "bg-blue-500"
                    }`} />
                    
                    <div className="flex justify-between text-[11px] font-bold items-baseline">
                      <span className="text-slate-550 dark:text-slate-400 flex items-center gap-1.5">
                        {item.label}
                        {item.label !== "Year 25" && (
                          <span className="text-[9px] font-semibold text-slate-405 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md leading-none">
                            {pctOfTotal}% of total
                          </span>
                        )}
                      </span>
                      <span className="text-slate-800 dark:text-white font-extrabold flex items-baseline gap-0.5">
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">₹</span>
                        <AnimatedNumber value={item.amount} formatter={(v) => Math.round(v).toLocaleString('en-IN')} />
                      </span>
                    </div>
                    
                    <div className="h-2 w-full bg-slate-100/60 dark:bg-slate-800/40 border border-slate-100/10 rounded-full overflow-hidden relative">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          item.label === "Year 25"
                            ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-primary-green"
                            : "bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-400"
                        }`}
                        style={{ width: isMounted ? `${Math.min(100, (item.amount / (yr25 || 1)) * 100)}%` : "0%" }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="lg:col-span-6 space-y-6">
      <div className="space-y-6 relative">
        {/* ── 1. Hero Recommendation Card ── */}
        <motion.div 
          whileHover={{ 
            y: -7, 
            scale: 1.015, 
            boxShadow: "0 22px 40px -10px rgba(16,185,129,0.22)" 
          }}
          transition={{ type: "spring", stiffness: 350, damping: 22 }}
          className="p-7 rounded-3xl border border-emerald-500/25 dark:border-emerald-500/35 flex flex-col justify-between min-h-[240px] bg-gradient-to-br from-emerald-500/12 via-sky-500/8 to-teal-500/6 dark:from-emerald-950/25 dark:via-sky-950/15 dark:to-teal-950/10 shadow-md relative overflow-hidden text-left group hover:shadow-[0_16px_48px_rgba(16,185,129,0.2)] hover:border-emerald-500/50 transition-all duration-300 cursor-pointer"
        >
          {/* Multi-layered glows */}
          <div className="absolute -right-8 -top-8 w-48 h-48 blur-3xl opacity-25 dark:opacity-15 rounded-full bg-emerald-400 pointer-events-none group-hover:scale-110 transition-all duration-700" />
          <div className="absolute -left-12 -bottom-12 w-36 h-36 blur-2xl opacity-15 dark:opacity-10 rounded-full bg-sky-400 pointer-events-none group-hover:scale-110 transition-all duration-700" />
          <div className="absolute top-1/2 right-8 -translate-y-1/2 opacity-[0.04] dark:opacity-[0.06] pointer-events-none">
            <svg width="120" height="120" viewBox="0 0 120 120"><circle cx="60" cy="60" r="55" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="8 4"/><circle cx="60" cy="60" r="40" fill="none" stroke="#10b981" strokeWidth="0.8" strokeDasharray="5 5"/><circle cx="60" cy="60" r="25" fill="none" stroke="#10b981" strokeWidth="0.6"/></svg>
          </div>
          
          <div className="space-y-2 relative z-10">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <SunIconMiniSpin />
              <span>Solar Recommendation</span>
            </span>
            {/* Jumbo kW display */}
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-5xl font-display font-black tracking-tight bg-gradient-to-r from-emerald-600 via-teal-500 to-sky-500 dark:from-emerald-400 dark:via-teal-400 dark:to-sky-400 bg-clip-text text-transparent">
                <AnimatedNumber value={recommendedKw} formatter={(v) => v.toFixed(1)} />
              </h3>
              <span className="text-xl font-black text-slate-700 dark:text-slate-200">kW System</span>
            </div>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
              <span className="text-base">₹</span>
              <AnimatedNumber value={firstYearSavings} formatter={(v) => Math.round(v).toLocaleString('en-IN')} />
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">/ year saved</span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Payback in <span className="text-slate-700 dark:text-slate-200 font-black"><AnimatedNumber value={paybackPeriodVal} formatter={(v) => v.toFixed(1)} /> yrs</span>
              </span>
              <span className="h-3.5 w-px bg-slate-300 dark:bg-slate-700" />
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                <span className="text-slate-700 dark:text-slate-200 font-black">{panelsNeeded}</span> panels needed
              </span>
            </div>
          </div>
          
          {/* Shimmer CTA button */}
          <motion.button 
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              window.dispatchEvent(new CustomEvent("she_trigger_chat", { 
                detail: { message: `I want to install the recommended ${recommendedKw.toFixed(1)} kW Solar System. What are the installation steps, required solar panel brands, and subsidy approval procedures?` } 
              }));
            }}
            type="button"
            className="mt-5 px-7 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider shadow-lg hover:shadow-[0_10px_28px_rgba(16,185,129,0.4)] cursor-pointer relative z-10 overflow-hidden group/btn w-fit"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Zap className="w-4 h-4" /> Install Solar Now
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
          </motion.button>
        </motion.div>

        {/* 2. Readiness & Roof Space side-by-side grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SolarReadinessScore 
            score={readinessScore} 
            stateName={getFullStateName(selectedState)} 
            recommendedKw={recommendedKw}
            roofArea={roofArea}
          />
          {renderRoofMockup()}
        </div>

        {/* ── 3. Feasibility Review ── */}
        <motion.div 
          whileHover={{ 
            y: -6, 
            scale: 1.015, 
            boxShadow: "0 16px 32px -8px rgba(0,0,0,0.12)" 
          }}
          transition={{ type: "spring", stiffness: 350, damping: 20 }}
          className={`rounded-3xl overflow-hidden border shadow-sm cursor-pointer transition-all duration-250 ${conclusion.colorClass}`}
        >
          <div className="flex items-stretch">
            {/* Left color stripe */}
            <div className={`w-1.5 shrink-0 ${paybackPeriodVal <= 5 ? 'bg-emerald-500' : paybackPeriodVal <= 8 ? 'bg-green-500' : paybackPeriodVal <= 12 ? 'bg-amber-500' : 'bg-slate-400'}`} />
            <div className="flex-1 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Feasibility Review</span>
                <span className={`text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-wide ${conclusion.colorClass}`}>{conclusion.badge}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Financial Score", value: `${Math.max(0, Math.round(100 - (paybackPeriodVal * 3)))}%`, icon: "📊", color: "text-slate-800 dark:text-white" },
                  { label: "25yr Profit",    value: `₹${Math.round(twentyFiveYearNetSavings).toLocaleString('en-IN')}`, icon: "💹", color: "text-emerald-600 dark:text-emerald-400" },
                  { label: "Break-Even",     value: `${paybackPeriodVal.toFixed(1)} yrs`, icon: "⏱", color: "text-blue-600 dark:text-blue-400" },
                  { label: "Risk Level",     value: paybackPeriodVal > 10 ? "Medium" : "Low", icon: "🛡", color: "text-slate-800 dark:text-white" },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/50 dark:bg-slate-900/30 p-3 rounded-2xl border border-current/10 space-y-0.5">
                    <span className="text-[9px] font-bold text-slate-405 uppercase tracking-wider flex items-center gap-1">
                      <span>{stat.icon}</span>{stat.label}
                    </span>
                    <p className={`text-sm font-extrabold ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-normal">{conclusion.message}</p>
            </div>
          </div>
        </motion.div>

        {/* ── 4. Metric Cards Grid ── */}
        <div className="grid grid-cols-2 gap-4 text-left">
          {[
            { label: "💰 Investment",    value: `₹${Math.round(totalUpfrontInvestment).toLocaleString('en-IN')}`, sub: "After PM Surya Ghar Subsidy", topColor: "from-blue-400 to-indigo-500",   glowColor: "bg-blue-500",  glow: "card-client-blue",   delay: 0 },
            { label: "📈 Annual Return", value: `₹${Math.round(firstYearSavings).toLocaleString('en-IN')}`, sub: "Year 1 savings estimate",      topColor: "from-emerald-400 to-teal-500", glowColor: "bg-emerald-500", glow: "card-client-emerald", delay: 75 },
            { label: "⚡ Monthly Savings",value: `₹${Math.round(firstYearSavings / 12).toLocaleString('en-IN')}`, sub: "Estimated grid bill cut", topColor: "from-cyan-400 to-sky-500",  glowColor: "bg-cyan-500",  glow: "card-client-cyan",    delay: 150 },
            { label: "🏆 25yr ROI",      value: `${totalUpfrontInvestment > 0 ? ((twentyFiveYearNetSavings + totalUpfrontInvestment) / totalUpfrontInvestment).toFixed(1) : '0.0'}x`, sub: "25-year cumulative yield", topColor: "from-amber-400 to-orange-500", glowColor: "bg-amber-500",  glow: "card-client-amber",   delay: 225 },
          ].map((card, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: card.delay / 1000, type: "spring", stiffness: 280, damping: 26 }}
              className={`card-client ${card.glow} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col justify-between h-[120px] shadow-sm relative overflow-hidden cursor-pointer text-left transition-all duration-300`}
            >
              {/* Gradient top border */}
              <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${card.topColor}`} />
              <div className={`absolute -right-4 -top-4 w-16 h-16 blur-lg opacity-10 dark:opacity-8 rounded-full ${card.glowColor} pointer-events-none`} />
              <div className="p-4 pt-5 flex flex-col justify-between h-full relative z-10">
                <span className="text-[9.5px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest">{card.label}</span>
                <p className="text-xl font-display font-black text-slate-900 dark:text-white leading-tight">{card.value}</p>
                <span className="text-[9px] text-slate-450 dark:text-slate-550 block">{card.sub}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 5. Lifetime Savings Timeline */}
        {renderLifetimeTimeline()}

        {/* ── 6. Environmental Offset Card ── */}
        <motion.div
          whileHover={{ 
            y: -7, 
            scale: 1.02, 
            boxShadow: "0 18px 36px -10px rgba(16,185,129,0.18)" 
          }}
          transition={{ type: "spring", stiffness: 350, damping: 22 }}
          className="p-6 rounded-3xl border border-green-500/25 dark:border-green-500/30 space-y-4 text-left shadow-sm relative overflow-hidden group hover:shadow-[0_12px_40px_rgba(16,185,129,0.15)] hover:border-green-500/45 transition-all duration-300 cursor-pointer"
          style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(20,184,166,0.08) 50%, rgba(16,185,129,0.04) 100%)" }}
        >
          {/* Dot wave pattern background */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{
            backgroundImage: "radial-gradient(circle, #10b981 1px, transparent 1px)",
            backgroundSize: "20px 20px"
          }} />
          <div className="absolute -right-6 -top-6 w-28 h-28 blur-2xl opacity-20 dark:opacity-15 rounded-full bg-emerald-400 pointer-events-none group-hover:scale-125 transition-all duration-700" />

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌱</span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block">Carbon Reduction</span>
                <span className="text-[9px] font-semibold text-slate-405 dark:text-slate-500">Annual environmental impact</span>
              </div>
            </div>
            <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Clean Energy</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 relative z-10">
            <motion.div whileHover={{ y: -3, scale: 1.03 }} className="space-y-1.5 bg-white/60 dark:bg-slate-955/30 p-4 rounded-2xl border border-emerald-500/15 dark:border-emerald-900/20 cursor-pointer">
              <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase block font-bold tracking-wider">Annual CO₂ Offset</span>
              <p className="text-2xl font-black text-slate-800 dark:text-white flex items-baseline gap-1">
                <AnimatedNumber value={co2Reduction} formatter={(v) => v.toFixed(1)} />
                <span className="text-xs font-bold text-slate-400">Tons</span>
              </p>
              <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000" style={{ width: isMounted ? `${Math.min(100, co2Reduction * 20)}%` : '0%' }} />
              </div>
            </motion.div>
            <motion.div whileHover={{ y: -3, scale: 1.03 }} className="space-y-1.5 bg-white/60 dark:bg-slate-955/30 p-4 rounded-2xl border border-emerald-500/15 dark:border-emerald-900/20 cursor-pointer">
              <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase block font-bold tracking-wider">Tree Equivalent</span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 flex items-baseline gap-1">
                🌳 <AnimatedNumber value={treesEquivalent} />
                <span className="text-xs font-bold text-emerald-500">Trees</span>
              </p>
              <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-1000" style={{ width: isMounted ? `${Math.min(100, treesEquivalent / 5)}%` : '0%' }} />
              </div>
            </motion.div>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-450 leading-normal border-t border-emerald-500/10 pt-3 relative z-10">
            Calculated using grid displacement factors. Offsets your domestic coal power generation footprint over 25 years.
          </p>
        </motion.div>

        {/* ── 7. 25-Year Cost Comparison ── */}
        <div className="bg-slate-50/70 dark:bg-slate-950/20 p-5 rounded-3xl border border-slate-200 dark:border-slate-800/80 space-y-6 text-left shadow-sm relative z-10">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest leading-none font-display">25-Year Lifetime Cost Comparison</h4>
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-0.5 rounded-full shadow-sm">at {tariffIncrease}% inflation</span>
          </div>

          {/* Bar chart */}
          <div className="flex items-end gap-6 h-40 pt-4 px-2 select-none">
            {/* No Solar bar */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="flex-1 flex flex-col items-center gap-2.5 group cursor-pointer"
            >
              <span className="text-xs font-black text-rose-500 dark:text-rose-450 group-hover:scale-110 transition-transform duration-200 leading-none">
                ₹{Math.round(totalNoSolarCost25Years / 100000).toLocaleString('en-IN')}L
              </span>
              <div className="w-full relative h-28 rounded-2xl overflow-hidden bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/45 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)]">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: isMounted ? '100%' : '0%' }}
                  transition={{ type: "spring", stiffness: 60, delay: 0.1 }}
                  className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-rose-500 to-pink-400 rounded-t-2xl shadow-[0_4px_16px_rgba(244,63,94,0.3)] flex items-end justify-center overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000 ease-out" />
                </motion.div>
              </div>
              <span className="text-[10px] font-black text-slate-455 dark:text-slate-500 uppercase tracking-widest text-center leading-none">
                Grid Only
              </span>
            </motion.div>

            {/* Solar bar */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="flex-1 flex flex-col items-center gap-2.5 group cursor-pointer"
            >
              <span className="text-xs font-black text-emerald-500 dark:text-emerald-455 group-hover:scale-110 transition-transform duration-200 leading-none">
                ₹{Math.round(totalSolarCost25Years / 100000).toLocaleString('en-IN')}L
              </span>
              <div className="w-full relative h-28 rounded-2xl overflow-hidden bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/45 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)]">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: isMounted ? `${Math.max(12, Math.round((totalSolarCost25Years / totalNoSolarCost25Years) * 100))}%` : '0%' }}
                  transition={{ type: "spring", stiffness: 60, delay: 0.2 }}
                  className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-2xl shadow-[0_4px_16px_rgba(16,185,129,0.3)] flex items-end justify-center overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000 ease-out" />
                </motion.div>
              </div>
              <span className="text-[10px] font-black text-emerald-500 dark:text-emerald-455 uppercase tracking-widest text-center leading-none">
                With Solar
              </span>
            </motion.div>

            {/* Savings column */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="flex-1 flex flex-col items-center gap-2.5 group cursor-pointer"
            >
              <span className="text-xs font-black text-indigo-500 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-200 leading-none">
                ₹{Math.round(twentyFiveYearNetSavings / 100000).toLocaleString('en-IN')}L
              </span>
              <div className="w-full relative h-28 rounded-2xl overflow-hidden bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/45 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)]">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: isMounted ? `${Math.max(12, Math.round((twentyFiveYearNetSavings / totalNoSolarCost25Years) * 100))}%` : '0%' }}
                  transition={{ type: "spring", stiffness: 60, delay: 0.3 }}
                  className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-indigo-500 to-blue-450 rounded-t-2xl shadow-[0_4px_16px_rgba(99,102,241,0.3)] flex items-end justify-center overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000 ease-out" />
                </motion.div>
              </div>
              <span className="text-[10px] font-black text-indigo-555 dark:text-indigo-400 uppercase tracking-widest text-center leading-none">
                Net Saved
              </span>
            </motion.div>
          </div>

          {/* Summary row */}
          <motion.div 
            whileHover={{ 
              y: -3, 
              scale: 1.012, 
              boxShadow: "0 12px 20px -8px rgba(16,185,129,0.25)" 
            }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-emerald-500/10 dark:from-emerald-950/30 dark:via-teal-950/15 dark:to-emerald-950/30 border border-emerald-500/20 dark:border-emerald-500/30 p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:border-emerald-500/50 transition-all duration-300 shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-500/15 dark:bg-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
                <SparklesIcon />
              </div>
              <div className="text-left">
                <span className="text-xs font-black text-slate-800 dark:text-slate-200 block uppercase tracking-wider leading-none">Total Net Lifetime Savings</span>
                <span className="text-[10px] text-slate-400 block pt-1 font-medium leading-none">25-year projection including module degradation</span>
              </div>
            </div>
            <span className="font-black text-emerald-600 dark:text-emerald-400 text-lg flex items-center gap-0.5">
              <span className="text-xs font-extrabold">₹</span><AnimatedNumber value={twentyFiveYearNetSavings} formatter={(v) => Math.round(v).toLocaleString('en-IN')} />
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const SunIconMini = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sun w-3.5 h-3.5 text-amber-500 shrink-0 animate-pulse">
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2"/>
    <path d="M12 20v2"/>
    <path d="m4.93 4.93 1.41 1.41"/>
    <path d="m17.66 17.66 1.41 1.41"/>
    <path d="M2 12h2"/>
    <path d="M20 12h2"/>
    <path d="m6.34 17.66-1.41 1.41"/>
    <path d="m19.07 4.93-1.41 1.41"/>
  </svg>
);

const SunIconMiniSpin = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sun w-3.5 h-3.5 animate-spin" style={{ animationDuration: "12s" }}>
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2"/>
    <path d="M12 20v2"/>
    <path d="m4.93 4.93 1.41 1.41"/>
    <path d="m17.66 17.66 1.41 1.41"/>
    <path d="M2 12h2"/>
    <path d="M20 12h2"/>
    <path d="m6.34 17.66-1.41 1.41"/>
    <path d="m19.07 4.93-1.41 1.41"/>
  </svg>
);

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles w-4 h-4 animate-pulse">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/>
    <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5Z"/>
    <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z"/>
  </svg>
);
