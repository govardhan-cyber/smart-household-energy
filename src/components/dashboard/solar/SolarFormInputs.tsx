import React from "react";
import { MapPin, Zap, ShieldCheck, HelpCircle, IndianRupee, Layers, Scale, Leaf, Settings, MessageSquare, ArrowUpRight, Ruler } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedNumber } from "./AnimatedNumber";
import type { UseSolarCalculatorStateReturn } from "../../../hooks/useSolarCalculatorState";

interface SolarFormInputsProps {
  solarState: UseSolarCalculatorStateReturn;
  activeTheme: "light" | "dark";
}

export const SolarFormInputs: React.FC<SolarFormInputsProps> = ({
  solarState,
  activeTheme
}) => {
  const {
    monthlyBill,
    setMonthlyBill,
    roofArea,
    setRoofArea,
    selectedState,
    setSelectedState,
    solarTech,
    setSolarTech,
    isHybrid,
    setIsHybrid,
    batteryKwh,
    setBatteryKwh,
    batteryType,
    setBatteryType,
    tariffIncrease,
    setTariffIncrease,
    panelDegradation,
    setPanelDegradation,
    maintenanceRate,
    setMaintenanceRate,
    showTariffExpl,
    setShowTariffExpl,
    showDegradationExpl,
    setShowDegradationExpl,
    showMaintenanceExpl,
    setShowMaintenanceExpl,
    recommendedKw,
    totalUpfrontInvestment,
    firstYearSavings,
    paybackPeriodVal,
    panelsNeeded,
    kwhNeeded,
    monthlyGeneration,
    newBill,
    billCoveragePercent,
    kwNeededByUsage,
    maxKwBySpace,
    newUnits,
    panelWattage,
    panelEfficiency,
    panelWeight,
    panelSizeLabel,
    billPercent,
    roofPercent,
    getFullStateName
  } = solarState;

  const isCapped = maxKwBySpace < kwNeededByUsage;

  return (
    <div className="lg:col-span-6 space-y-6">
      <div id="solar-savings-planner-card" className="backdrop-blur-md bg-white/70 dark:bg-slate-955/45 p-6 sm:p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/60 shadow-xl space-y-6 relative overflow-hidden group">
        {/* Specular Reflective Gloss Sheen */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000 ease-out pointer-events-none" />
        {/* Ambient glows */}
        <div className="absolute -right-8 -top-8 w-40 h-40 blur-3xl opacity-10 dark:opacity-5 rounded-full bg-amber-400 pointer-events-none group-hover:scale-125 transition-all duration-700" />
        <div className="absolute -left-8 -bottom-8 w-32 h-32 blur-3xl opacity-5 dark:opacity-3 rounded-full bg-sky-400 pointer-events-none" />

        {/* Header */}
        <div className="flex items-center gap-3.5 pb-5 border-b border-slate-100 dark:border-slate-800/80 relative z-10">
          {/* Glowing animated sun ring */}
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-2xl bg-amber-400/30 dark:bg-amber-500/20 animate-ping" style={{ animationDuration: "3s" }} />
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-400/10 dark:from-amber-500/20 dark:to-orange-500/10 text-amber-500 border border-amber-200/50 dark:border-amber-500/20 relative z-10 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
              <SunIcon />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Solar Savings Planner</h3>
              {/* Live indicator */}
              <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                Live
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              Configure your rooftop space, monthly bill &amp; solar technology.
            </p>
          </div>
        </div>

        {/* ── Installation State Selector ── */}
        <div className="space-y-3 relative z-10">
          <label className="text-[10px] font-black text-slate-400 dark:text-slate-555 uppercase tracking-widest flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-sky-500" /> Installation State
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { code: "ap", label: "Andhra Pradesh", short: "AP", color: "from-sky-500/10 to-blue-500/5 border-sky-500/60 text-sky-700 dark:text-sky-400 shadow-sky-500/10" },
              { code: "ts", label: "Telangana",      short: "TS", color: "from-violet-500/10 to-purple-500/5 border-violet-500/60 text-violet-700 dark:text-violet-400 shadow-violet-500/10" },
              { code: "ka", label: "Karnataka",      short: "KA", color: "from-emerald-500/10 to-teal-500/5 border-emerald-500/60 text-emerald-700 dark:text-emerald-400 shadow-emerald-500/10" },
            ].map(st => {
              const isActive = selectedState === st.code;
              return (
                <motion.button
                  key={st.code}
                  onClick={() => setSelectedState(st.code)}
                  whileHover={{ 
                    scale: 1.05, 
                    y: -5,
                    boxShadow: isActive ? "0 10px 20px -5px rgba(59,130,246,0.2)" : "0 8px 16px -6px rgba(0,0,0,0.1)"
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  className={`py-3 px-2 rounded-2xl border text-center transition-colors duration-200 flex flex-col items-center gap-0.5 cursor-pointer relative overflow-hidden ${
                    isActive
                      ? `bg-gradient-to-br ${st.color} shadow-[0_4px_20px_-4px_var(--tw-shadow-color)]`
                      : "border-slate-200/80 bg-slate-50/50 dark:border-slate-800/80 dark:bg-slate-900/30 hover:border-slate-350 dark:hover:border-slate-700"
                  }`}
                >
                  {isActive && <div className="absolute inset-0 bg-gradient-to-br opacity-30 animate-pulse" style={{ animationDuration: "2s" }} />}
                  <span className={`text-lg font-black leading-none relative z-10 ${isActive ? "" : "text-slate-500 dark:text-slate-400"}`}>{st.short}</span>
                  <span className={`text-[8px] font-bold uppercase tracking-wider leading-none relative z-10 ${isActive ? "" : "text-slate-455 dark:text-slate-500"}`}>{st.label}</span>
                  {isActive && <MapPin className="w-2.5 h-2.5 mt-0.5 relative z-10 animate-bounce" />}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ── Solar Cell Technology ── */}
        <div className="space-y-3 relative z-10">
          <label className="text-[10px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-emerald-500" /> Solar Cell Technology
          </label>
          <div className="grid grid-cols-2 gap-3">
            {/* TOPCon */}
            <motion.button
              onClick={() => setSolarTech("topcon")}
              whileHover={{ 
                y: -7, 
                scale: 1.03, 
                boxShadow: "0 16px 28px -6px rgba(16,185,129,0.22)" 
              }}
              transition={{ type: "spring", stiffness: 350, damping: 20 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              className={`p-4 rounded-3xl border text-left transition-colors duration-250 relative flex flex-col gap-3 cursor-pointer overflow-hidden ${
                solarTech === "topcon"
                  ? "border-emerald-500/70 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 dark:from-emerald-950/25 dark:to-teal-950/10 shadow-[0_6px_24px_-4px_rgba(16,185,129,0.25)]"
                  : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50 hover:border-emerald-400/50 hover:bg-emerald-50/20 dark:hover:border-emerald-800/40"
              }`}
            >
              {/* Recommended badge */}
              <div className={`absolute top-2.5 right-2.5 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                solarTech === "topcon" ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
              }`}>⭐ Best</div>

              {/* SVG Panel Illustration */}
              <svg width="40" height="28" viewBox="0 0 40 28" className={`transition-opacity duration-200 ${solarTech === "topcon" ? "opacity-100" : "opacity-40"}`}>
                <defs>
                  <linearGradient id="tc1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#10b981"/><stop offset="100%" stopColor="#0d9488"/></linearGradient>
                </defs>
                {[[0,0],[14,0],[28,0],[0,10],[14,10],[28,10],[0,20],[14,20],[28,20]].map((coords,i)=>{
                  const [px,py] = coords;
                  return <rect key={i} x={px+1} y={py+1} width="11" height="8" rx="1" fill="url(#tc1)" opacity="0.85"/>;
                })}
              </svg>

              <div>
                <div className={`text-xs font-black flex items-center gap-1.5 ${solarTech === "topcon" ? "text-emerald-700 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300"}`}>
                  TOPCon Premium
                  {solarTech === "topcon" && <ShieldCheck className="w-3.5 h-3.5 animate-pulse" />}
                </div>
                <div className="text-[10px] text-slate-550 dark:text-slate-455 mt-1.5 space-y-1">
                  <div className="flex justify-between"><span>Efficiency</span><span className="font-bold text-slate-700 dark:text-slate-200">26%</span></div>
                  <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500" style={{ width: "96%" }} />
                  </div>
                  <div className="flex justify-between"><span>Lifespan</span><span className="font-bold text-slate-700 dark:text-slate-200">30 Yrs</span></div>
                </div>
                <div className="text-[10px] text-amber-500 font-bold mt-1.5">★★★★★</div>
              </div>
            </motion.button>

            {/* Mono-PERC */}
            <motion.button
              onClick={() => setSolarTech("mono-perc")}
              whileHover={{ 
                y: -7, 
                scale: 1.03, 
                boxShadow: "0 16px 28px -6px rgba(59,130,246,0.22)" 
              }}
              transition={{ type: "spring", stiffness: 350, damping: 20 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              className={`p-4 rounded-3xl border text-left transition-colors duration-250 relative flex flex-col gap-3 cursor-pointer overflow-hidden ${
                solarTech === "mono-perc"
                  ? "border-blue-500/70 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 dark:from-blue-950/25 dark:to-indigo-950/10 shadow-[0_6px_24px_-4px_rgba(59,130,246,0.25)]"
                  : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50 hover:border-blue-400/50 hover:bg-blue-50/20 dark:hover:border-blue-800/40"
              }`}
            >
              {/* Value badge */}
              <div className={`absolute top-2.5 right-2.5 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                solarTech === "mono-perc" ? "bg-blue-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
              }`}>Value</div>

              {/* SVG Panel Illustration */}
              <svg width="40" height="28" viewBox="0 0 40 28" className={`transition-opacity duration-200 ${solarTech === "mono-perc" ? "opacity-100" : "opacity-40"}`}>
                <defs>
                  <linearGradient id="mp1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#3b82f6"/><stop offset="100%" stopColor="#6366f1"/></linearGradient>
                </defs>
                {[[0,0],[14,0],[28,0],[0,10],[14,10],[28,10],[0,20],[14,20],[28,20]].map((coords,i)=>{
                  const [px,py] = coords;
                  return <rect key={i} x={px+1} y={py+1} width="11" height="8" rx="1" fill="url(#mp1)" opacity="0.85"/>;
                })}
              </svg>

              <div>
                <div className={`text-xs font-black flex items-center gap-1.5 ${solarTech === "mono-perc" ? "text-blue-700 dark:text-blue-400" : "text-slate-700 dark:text-slate-300"}`}>
                  Mono-PERC
                  {solarTech === "mono-perc" && <ShieldCheck className="w-3.5 h-3.5 animate-pulse" />}
                </div>
                <div className="text-[10px] text-slate-555 dark:text-slate-455 mt-1.5 space-y-1">
                  <div className="flex justify-between"><span>Efficiency</span><span className="font-bold text-slate-700 dark:text-slate-200">22.5%</span></div>
                  <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full transition-all duration-500" style={{ width: "83%" }} />
                  </div>
                  <div className="flex justify-between"><span>Lifespan</span><span className="font-bold text-slate-700 dark:text-slate-200">25 Yrs</span></div>
                </div>
                <div className="text-[10px] text-amber-500 font-bold mt-1.5">★★★★☆</div>
              </div>
            </motion.button>
          </div>
        </div>

        {/* Input 1: Monthly Electricity Bill (₹) */}
        <div className="space-y-4 pt-2 relative z-10">
          <div className="flex justify-between items-center text-sm font-bold text-slate-700 dark:text-slate-350">
            <span className="flex items-center gap-1">
              Average Monthly Bill
              <span className="text-[10px] text-slate-450 font-normal hover:text-slate-500 cursor-pointer" title="Your typical monthly electricity bill amount. Used to estimate your energy needs.">
                <HelpCircle className="w-3.5 h-3.5 inline" />
              </span>
            </span>
            <span className="text-primary-blue dark:text-primary-green text-base font-extrabold flex items-center">
              <IndianRupee className="w-4 h-4 mr-0.5" />
              <AnimatedNumber value={monthlyBill} formatter={(v) => Math.round(v).toLocaleString('en-IN')} />
            </span>
          </div>
          
          <div className="relative pt-6 pb-2">
            {/* Floating Bubble */}
            <div 
              className="absolute top-0 bg-primary-blue text-white px-2.5 py-1 rounded-xl text-[10px] font-bold transform -translate-x-1/2 whitespace-nowrap shadow-[0_4px_12px_rgba(59,130,246,0.3)] transition-all duration-75 after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-primary-blue"
              style={{ left: `${billPercent}%` }}
            >
              ₹{monthlyBill.toLocaleString('en-IN')}
            </div>
            <input
              type="range"
              min="1000"
              max="15000"
              step="500"
              value={monthlyBill}
              onChange={(e) => setMonthlyBill(parseInt(e.target.value))}
              className="premium-slider w-full cursor-pointer h-2 rounded-full appearance-none outline-none"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #06b6d4 ${billPercent}%, ${activeTheme === 'dark' ? '#1e293b' : '#e2e8f0'} ${billPercent}%, ${activeTheme === 'dark' ? '#1e293b' : '#e2e8f0'} 100%)`
              }}
            />
          </div>
          {/* Quick preset chips */}
          <div className="flex gap-1.5 flex-wrap">
            {[2000, 5000, 8000, 12000].map(v => (
              <button key={v} type="button" onClick={() => setMonthlyBill(v)}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border cursor-pointer transition-all duration-150 ${
                  monthlyBill === v
                    ? "bg-blue-500 text-white border-blue-500 shadow-sm"
                    : "bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-600"
                }`}>
                ₹{(v/1000).toFixed(0)}K
              </button>
            ))}
          </div>
        </div>

        {/* Input 2: Roof Space Area (sq ft) */}
        <div className="space-y-4 pt-2 relative z-10">
          <div className="flex justify-between items-center text-sm font-bold text-slate-700 dark:text-slate-350">
            <span className="flex items-center gap-1">
              Available Roof Space Area
              <span className="text-[10px] text-slate-450 font-normal hover:text-slate-555 cursor-pointer" title="Usable shadow-free flat rooftop area. 1 kW of solar capacity needs ~100 square feet.">
                <HelpCircle className="w-3.5 h-3.5 inline" />
              </span>
            </span>
            <span className="text-amber-500 text-base font-extrabold">
              <AnimatedNumber value={roofArea} /> sq ft
            </span>
          </div>
          
          <div className="relative pt-6 pb-2">
            {/* Floating Bubble */}
            <div 
              className="absolute top-0 bg-amber-500 text-white px-2.5 py-1 rounded-xl text-[10px] font-bold transform -translate-x-1/2 whitespace-nowrap shadow-[0_4px_12px_rgba(245,158,11,0.3)] transition-all duration-75 after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-amber-500"
              style={{ left: `${roofPercent}%` }}
            >
              {roofArea} sq ft
            </div>
            <input
              type="range"
              min="50"
              max="1500"
              step="50"
              value={roofArea}
              onChange={(e) => setRoofArea(parseInt(e.target.value))}
              className="premium-slider slider-orange w-full cursor-pointer h-2 rounded-full appearance-none outline-none"
              style={{
                background: `linear-gradient(to right, #f59e0b 0%, #facc15 ${roofPercent}%, ${activeTheme === 'dark' ? '#1e293b' : '#e2e8f0'} ${roofPercent}%, ${activeTheme === 'dark' ? '#1e293b' : '#e2e8f0'} 100%)`
              }}
            />
          </div>
          {/* Quick preset chips */}
          <div className="flex gap-1.5 flex-wrap">
            {[200, 400, 700, 1000].map(v => (
              <button key={v} type="button" onClick={() => setRoofArea(v)}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border cursor-pointer transition-all duration-150 ${
                  roofArea === v
                    ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                    : "bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-amber-400 hover:text-amber-600 dark:hover:border-amber-600"
                }`}>
                {v} ft²
              </button>
            ))}
          </div>
        </div>

        {/* Hybrid Backup Battery Storage */}
        <div className="border border-slate-200/40 dark:border-slate-800/40 rounded-2xl overflow-hidden bg-white/20 dark:bg-slate-950/20 relative z-10 shadow-sm">
          <div className="w-full flex items-center gap-2 p-4 text-xs font-black text-slate-700 dark:text-slate-350 bg-slate-50/40 dark:bg-slate-950/30 border-b border-slate-200/30 dark:border-slate-800/40">
            <Layers className="w-4 h-4 text-slate-405" />
            Hybrid Backup Battery Storage
          </div>

          <div className="p-4 space-y-4 text-xs bg-transparent">
            {/* Hybrid Storage Toggle */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-655 dark:text-slate-400">Hybrid Backup Battery Storage</span>
                <button
                  type="button"
                  onClick={() => setIsHybrid(!isHybrid)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                    isHybrid ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isHybrid ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {isHybrid && (
                <div className="space-y-3 pt-2 bg-slate-50/50 dark:bg-slate-950/20 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                  {/* Battery Capacity */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold text-slate-655 dark:text-slate-400">
                      <span>Battery Storage Capacity</span>
                      <span className="text-emerald-500 font-bold">{batteryKwh} kWh</span>
                    </div>
                    <input
                      type="range"
                      min="2.5"
                      max="20"
                      step="2.5"
                      value={batteryKwh}
                      onChange={(e) => setBatteryKwh(parseFloat(e.target.value))}
                      className="premium-slider w-full cursor-pointer h-2 rounded-full appearance-none outline-none"
                      style={{
                        background: activeTheme === "dark"
                          ? `linear-gradient(to right, #10b981 0%, #10b981 ${((batteryKwh - 2.5) / 17.5) * 100}%, #1e293b ${((batteryKwh - 2.5) / 17.5) * 100}%, #1e293b 100%)`
                          : `linear-gradient(to right, #10b981 0%, #10b981 ${((batteryKwh - 2.5) / 17.5) * 100}%, #e2e8f0 ${((batteryKwh - 2.5) / 17.5) * 100}%, #e2e8f0 100%)`
                      }}
                    />
                  </div>

                  {/* Battery Chemistry */}
                  <div className="space-y-1">
                    <span className="font-semibold text-slate-500 dark:text-slate-455 block text-[10px]">Battery Chemistry</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setBatteryType("lithium")}
                        className={`py-1 px-2 rounded-lg border text-[10px] font-bold cursor-pointer transition-all duration-200 ${
                          batteryType === "lithium"
                            ? "bg-emerald-500 text-white border-emerald-500 shadow-sm animate-none"
                            : "bg-slate-50 dark:bg-slate-900 text-slate-550 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        Lithium (10yr life)
                      </button>
                      <button
                        type="button"
                        onClick={() => setBatteryType("lead-acid")}
                        className={`py-1 px-2 rounded-lg border text-[10px] font-bold cursor-pointer transition-all duration-200 ${
                          batteryType === "lead-acid"
                            ? "bg-emerald-500 text-white border-emerald-500 shadow-sm animate-none"
                            : "bg-slate-50 dark:bg-slate-900 text-slate-555 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        Lead-Acid (4yr life)
                      </button>
                    </div>
                    <span className="text-[9px] text-slate-400 block pt-1 leading-normal">
                      {batteryType === "lithium" 
                        ? "Est. cost: ₹15,000/kWh upfront. Long life with high depth-of-discharge." 
                        : "Est. cost: ₹7,000/kWh upfront. Economical but needs replacement every 4 years."}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <motion.div 
          key={`diagnostics-${isCapped}-${monthlyBill}-${roofArea}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          whileHover={{ y: -3, scale: 1.005 }}
          className={`p-4 rounded-r-2xl rounded-l-lg border-l-4 text-xs leading-relaxed relative z-10 transition-colors duration-250 cursor-pointer ${
            isCapped 
              ? "border-orange-500 border-y-transparent border-r-transparent bg-orange-500/5 dark:bg-orange-950/10 text-slate-650 dark:text-slate-350 shadow-[0_4px_16px_rgba(245,158,11,0.02)]"
              : "border-blue-500 border-y-transparent border-r-transparent bg-blue-500/5 dark:bg-blue-955/10 text-slate-650 dark:text-slate-350 shadow-[0_4px_16px_rgba(59,130,246,0.01)]"
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-xl shrink-0 ${
              isCapped ? "bg-orange-500/10 text-orange-600 dark:text-orange-400" : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
            }`}>
              {isCapped ? <Scale className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            </div>
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-2">
                <span className="font-black uppercase tracking-widest text-[9px] text-slate-400 dark:text-slate-500">
                  Sizing Diagnostics
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                  isCapped ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                }`}>
                  {isCapped ? "Capped by Space" : "Optimized Sizing"}
                </span>
              </div>
              <p className="text-[11px] font-medium opacity-90 leading-normal">
                {isCapped ? (
                  <>
                    To fully offset your bill of <span className="font-extrabold text-orange-600 dark:text-orange-400">₹{monthlyBill.toLocaleString('en-IN')}</span> in {getFullStateName(selectedState)}, you require a <span className="font-extrabold text-orange-600 dark:text-orange-400">{kwNeededByUsage.toFixed(1)} kW</span> system. Since your roof area limits capacity to <span className="font-extrabold text-orange-600 dark:text-orange-400">{maxKwBySpace.toFixed(1)} kW</span>, the recommended system size is capped at <span className="font-extrabold text-orange-600 dark:text-orange-400">{recommendedKw.toFixed(1)} kW</span>.
                  </>
                ) : (
                  <>
                    Your electricity bill of <span className="font-extrabold text-blue-650 dark:text-blue-400">₹{monthlyBill.toLocaleString('en-IN')}</span> in {getFullStateName(selectedState)} requires a <span className="font-extrabold text-blue-650 dark:text-blue-400">{kwNeededByUsage.toFixed(1)} kW</span> system. This fits comfortably within your roof area limit of <span className="font-extrabold text-blue-650 dark:text-blue-400">{maxKwBySpace.toFixed(1)} kW</span>.
                  </>
                )}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Detailed Net Metering breakdown */}
        <motion.div 
          whileHover={{ y: -3, scale: 1.008 }}
          className="p-5 bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 text-xs relative z-10 shadow-sm space-y-4 hover:shadow-[0_8px_30px_rgba(59,130,246,0.04)] hover:border-slate-300 dark:hover:border-slate-700 transition-colors duration-250 cursor-pointer"
        >
          <span className="font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest block text-[9px] text-left">
            Net Metering Calculations
          </span>
          
          <div className="space-y-2">
            {[
              { label: "Estimated Monthly Consumption", val: `${Math.round(kwhNeeded).toLocaleString('en-IN')} kWh`, icon: Zap, color: "text-blue-500 bg-blue-500/10" },
              { label: "Estimated Monthly Solar Generation", val: `${Math.round(monthlyGeneration).toLocaleString('en-IN')} kWh`, icon: SunIcon, color: "text-amber-500 bg-amber-500/10" },
              { label: "New Net Grid Consumption", val: `${Math.max(0, Math.round(newUnits)).toLocaleString('en-IN')} kWh`, icon: Scale, color: "text-slate-400 bg-slate-100 dark:bg-slate-800 dark:text-slate-400" },
              { label: "Slab Savings Coverage", val: `${Math.round(billCoveragePercent)}%`, icon: Leaf, color: "text-emerald-500 bg-emerald-500/10" }
            ].map((row, idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-100/40 dark:border-slate-800/30 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/45 px-2 rounded-2xl transition-all duration-250 cubic-bezier(0.16, 1, 0.3, 1) hover:translate-x-2.5 cursor-pointer">
                <div className="flex items-center gap-2.5 text-slate-550 dark:text-slate-455 text-left">
                  <div className={`p-1.5 rounded-lg shrink-0 ${row.color}`}>
                    <row.icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold text-slate-500 dark:text-slate-400 text-[11px]">{row.label}</span>
                </div>
                <span className="px-3 py-1 text-slate-800 dark:text-slate-200 bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-850/60 rounded-xl font-extrabold text-[11px] shadow-sm min-w-[75px] text-right inline-block">
                  {row.val}
                </span>
              </div>
            ))}
          </div>

          {/* Monthly Bill with Solar Panels Highlight panel */}
          <motion.div 
            whileHover={{ scale: 1.015 }}
            className="bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-transparent dark:from-emerald-950/10 dark:via-teal-950/5 p-4 rounded-2xl border border-emerald-500/20 hover:border-emerald-500/45 shadow-[0_4px_20px_rgba(16,185,129,0.02)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.08)] transition-colors duration-250 cursor-pointer flex justify-between items-center mt-3"
          >
            <div className="text-left">
              <span className="text-[10px] font-black text-emerald-600 dark:text-primary-green uppercase tracking-wider block">Monthly Bill with Solar</span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-medium mt-0.5">After slab-rate net metering</span>
            </div>
            <div className="flex items-center gap-2 text-right">
              <span className="text-emerald-600 dark:text-primary-green text-lg font-black flex items-baseline gap-0.5">
                <span className="text-[11px] font-extrabold">₹</span>
                <AnimatedNumber value={newBill} formatter={(v) => Math.round(v).toLocaleString('en-IN')} />
              </span>
              {newBill === 0 && (
                <span className="flex h-2 w-2 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
            </div>
          </motion.div>
        </motion.div>

        <div className="text-[9px] text-slate-400 dark:text-slate-555 pt-1 text-center font-medium leading-normal border-t border-slate-100 dark:border-slate-800/60">
          *Calculated using actual DISCOM slab rates in the {getFullStateName(selectedState)} database.
        </div>
      </div>

      {/* Financial Modeling Assumptions (Always Open) */}
      <div className="backdrop-blur-md bg-white/70 dark:bg-slate-955/45 border border-slate-200/50 dark:border-slate-800/60 rounded-3xl overflow-hidden relative z-10 shadow-sm">
        {/* Header */}
        <div className="w-full flex items-center gap-2 p-4 text-xs font-black text-slate-700 dark:text-slate-350 bg-slate-50/40 dark:bg-slate-950/30 border-b border-slate-150 dark:border-slate-800/55">
          <Settings className="w-4 h-4 text-slate-405" />
          Financial Modeling Assumptions
        </div>

        {/* Content — always visible */}
        <div className="p-4 space-y-4 text-xs bg-transparent">
          <div className="space-y-2">
            <div className="flex justify-between items-center font-semibold text-slate-605 dark:text-slate-400">
              <span className="flex items-center gap-1">
                Annual Tariff Rate Increase
                <HelpCircle 
                  className={`w-3.5 h-3.5 cursor-pointer transition-colors duration-150 ${showTariffExpl ? 'text-blue-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`} 
                  onClick={() => setShowTariffExpl(!showTariffExpl)} 
                />
              </span>
              <span className="text-primary-blue dark:text-primary-green font-bold">{tariffIncrease}%</span>
            </div>
            {showTariffExpl && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-blue-50/40 dark:bg-blue-950/10 border border-blue-100/40 dark:border-blue-900/20 p-2.5 rounded-xl text-[10px] text-slate-500 dark:text-slate-400 text-left leading-normal font-medium"
              >
                Calculates cumulative savings based on compounding rate inflation. Higher utility price spikes make solar even more profitable.
              </motion.div>
            )}
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={tariffIncrease}
              onChange={(e) => setTariffIncrease(parseInt(e.target.value))}
              className="premium-slider w-full cursor-pointer h-2 rounded-full appearance-none outline-none"
              style={{
                background: activeTheme === "dark"
                  ? `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((tariffIncrease - 1) / 9) * 100}%, #1e293b ${((tariffIncrease - 1) / 9) * 100}%, #1e293b 100%)`
                  : `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((tariffIncrease - 1) / 9) * 100}%, #e2e8f0 ${((tariffIncrease - 1) / 9) * 100}%, #e2e8f0 100%)`
              }}
            />
            <span className="text-[10px] text-slate-400 block font-medium">Standard residential rate escalation is 3% - 5% annually.</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center font-semibold text-slate-655 dark:text-slate-400">
              <span className="flex items-center gap-1">
                Annual Module Degradation
                <HelpCircle 
                  className={`w-3.5 h-3.5 cursor-pointer transition-colors duration-150 ${showDegradationExpl ? 'text-amber-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-305'}`} 
                  onClick={() => setShowDegradationExpl(!showDegradationExpl)} 
                />
              </span>
              <span className="text-amber-505 font-bold">{panelDegradation}%</span>
            </div>
            {showDegradationExpl && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-amber-50/40 dark:bg-amber-955/10 border border-amber-100/40 dark:border-amber-900/20 p-2.5 rounded-xl text-[10px] text-slate-500 dark:text-slate-400 text-left leading-normal font-medium"
              >
                Solar panels lose a fraction of their output efficiency each year. We account for this compounding decay over the 25-year lifespan.
              </motion.div>
            )}
            <input
              type="range"
              min="0.1"
              max="2.0"
              step="0.1"
              value={panelDegradation}
              onChange={(e) => setPanelDegradation(parseFloat(e.target.value))}
              className="premium-slider slider-orange w-full cursor-pointer h-2 rounded-full appearance-none outline-none"
              style={{
                background: activeTheme === "dark"
                  ? `linear-gradient(to right, #f59e0b 0%, #f59e0b ${((panelDegradation - 0.1) / 1.9) * 100}%, #1e293b ${((panelDegradation - 0.1) / 1.9) * 100}%, #1e293b 100%)`
                  : `linear-gradient(to right, #f59e0b 0%, #f59e0b ${((panelDegradation - 0.1) / 1.9) * 100}%, #e2e8f0 ${((panelDegradation - 0.1) / 1.9) * 100}%, #e2e8f0 100%)`
              }}
            />
            <span className="text-[10px] text-slate-400 block font-medium">Premium panels (TOPCon) degrade slower (~0.4% - 0.8%) than Mono-PERC (~0.8% - 1.2%).</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center font-semibold text-slate-655 dark:text-slate-400">
              <span className="flex items-center gap-1">
                Annual Maintenance Cost
                <HelpCircle 
                  className={`w-3.5 h-3.5 cursor-pointer transition-colors duration-150 ${showMaintenanceExpl ? 'text-emerald-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`} 
                  onClick={() => setShowMaintenanceExpl(!showMaintenanceExpl)} 
                />
              </span>
              <span className="text-slate-700 dark:text-slate-350 font-bold">{maintenanceRate}% <span className="font-normal text-slate-400">of cost</span></span>
            </div>
            {showMaintenanceExpl && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100/40 dark:border-emerald-900/20 p-2.5 rounded-xl text-[10px] text-slate-500 dark:text-slate-400 text-left leading-normal font-medium"
              >
                Covers standard recurring maintenance like cleaning dust off the panels, checking electrical inverter connections, and replacement wiring.
              </motion.div>
            )}
            <input
              type="range"
              min="0.0"
              max="5.0"
              step="0.25"
              value={maintenanceRate}
              onChange={(e) => setMaintenanceRate(parseFloat(e.target.value))}
              className="premium-slider w-full cursor-pointer h-2 rounded-full appearance-none outline-none"
              style={{
                background: activeTheme === "dark"
                  ? `linear-gradient(to right, #10b981 0%, #10b981 ${(maintenanceRate / 5) * 100}%, #1e293b ${(maintenanceRate / 5) * 100}%, #1e293b 100%)`
                  : `linear-gradient(to right, #2563eb 0%, #2563eb ${(maintenanceRate / 5) * 100}%, #e2e8f0 ${(maintenanceRate / 5) * 100}%, #e2e8f0 100%)`
              }}
            />
            <span className="text-[10px] text-slate-400 block font-medium">Inverter servicing, panel cleaning, and wiring maintenance.</span>
          </div>
        </div>
      </div>

      {/* AI Solar Advisor Widget */}
      <div className="backdrop-blur-md bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-indigo-500/10 border border-indigo-200/50 dark:border-indigo-800/40 p-5 rounded-3xl shadow-sm relative overflow-hidden group">
        {/* Specular Reflective Gloss Sheen */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000 ease-out pointer-events-none" />
        {/* Glowing Background Wash */}
        <div className="absolute -right-12 -top-12 w-32 h-32 blur-2xl opacity-15 dark:opacity-10 rounded-full bg-indigo-500 pointer-events-none group-hover:scale-150 transition-all duration-700" />
        <div className="absolute -left-12 -bottom-12 w-32 h-32 blur-2xl opacity-10 dark:opacity-5 rounded-full bg-purple-500 pointer-events-none group-hover:scale-150 transition-all duration-700" />

        <div className="flex items-center gap-3 relative z-10 pb-1">
          <div className="p-2 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(99,102,241,0.15)] dark:shadow-none animate-pulse">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest leading-none font-display">Ask Solar AI Advisor</h4>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mt-0.5">Instant Consultation</span>
          </div>
        </div>

        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 leading-normal relative z-10">
          Click a question below to analyze your recommended <span className="text-indigo-600 dark:text-indigo-400 font-bold">{recommendedKw.toFixed(1)} kW</span> system:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px] font-bold relative z-10">
          {[
            "Can solar eliminate my bill?",
            "Should I wait another year?",
            "What size system should I buy?",
            "Can I charge an EV with this system?"
          ].map((q, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.015, y: -0.5 }}
              whileTap={{ scale: 0.985 }}
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent("she_trigger_chat", { 
                  detail: { message: `${q} Based on my Solar Planner recommendation: a ${recommendedKw.toFixed(1)} kW system, costs ₹${totalUpfrontInvestment.toLocaleString('en-IN')}, saves ₹${firstYearSavings.toLocaleString('en-IN')}/year, payback in ${paybackPeriodVal.toFixed(1)} years.` } 
                }));
              }}
              className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/60 hover:border-indigo-400 dark:hover:border-indigo-505 hover:bg-gradient-to-r hover:from-indigo-50/30 hover:to-purple-50/20 dark:hover:from-indigo-950/20 dark:hover:to-purple-950/15 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-[0_4px_16px_rgba(99,102,241,0.08)] dark:hover:shadow-none text-slate-700 dark:text-slate-350 text-left transition-colors duration-200 cursor-pointer flex justify-between items-center gap-2 group/btn font-semibold"
            >
              <span className="leading-snug">{q}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover/btn:text-indigo-500 dark:group-hover/btn:text-indigo-400 transition-colors shrink-0 duration-200" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Panel details sub-section */}
      <div className="bg-slate-50/50 dark:bg-slate-900/30 p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm relative overflow-hidden group hover:shadow-[0_0_25px_-5px_rgba(99,102,241,0.15)] hover:border-indigo-505/20 transition-all duration-300">
        <div className="absolute -right-6 -top-6 w-24 h-24 blur-xl opacity-20 dark:opacity-10 rounded-full bg-indigo-500 pointer-events-none group-hover:scale-150 transition-all duration-500" />
        
        <div className="flex items-center gap-2 mb-3 relative z-10">
          <div className="p-1.5 bg-indigo-500/10 text-indigo-555 rounded-lg">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
              SYSTEM COMPONENTS
            </span>
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase leading-tight mt-0.5 font-display">
              Rooftop Module Details
            </h4>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 relative z-10">
          {/* Card 1: Modules Needed */}
          <motion.div 
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-white/60 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-200/40 dark:border-slate-850/60 flex flex-col justify-between hover:border-indigo-500/35 hover:shadow-[0_8px_24px_rgba(99,102,241,0.06)] dark:hover:shadow-none transition-colors duration-250 cursor-pointer group/spec"
          >
            <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 mb-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Required Modules</span>
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-850 dark:text-white leading-tight">
                {panelsNeeded} Panels
              </div>
              <div className="text-[9px] font-semibold text-slate-500 dark:text-slate-455 mt-0.5 leading-none">
                {panelWattage}W Rating ({solarTech === "topcon" ? "TOPCon" : "Mono-PERC"})
              </div>
            </div>
          </motion.div>

          {/* Card 2: Dimensions */}
          <motion.div 
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-white/60 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-200/40 dark:border-slate-850/60 flex flex-col justify-between hover:border-indigo-500/35 hover:shadow-[0_8px_24px_rgba(99,102,241,0.06)] dark:hover:shadow-none transition-colors duration-250 cursor-pointer group/spec"
          >
            <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 mb-1.5">
              <Ruler className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Dimensions</span>
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-850 dark:text-white leading-tight">
                {panelSizeLabel.replace("~", "")}
              </div>
              <div className="text-[9px] font-semibold text-slate-500 dark:text-slate-455 mt-0.5 leading-none">
                Per Module Size
              </div>
            </div>
          </motion.div>

          {/* Card 3: Weight */}
          <motion.div 
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-white/60 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-200/40 dark:border-slate-850/60 flex flex-col justify-between hover:border-indigo-500/35 hover:shadow-[0_8px_24px_rgba(99,102,241,0.06)] dark:hover:shadow-none transition-colors duration-250 cursor-pointer group/spec"
          >
            <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 mb-1.5">
              <Scale className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Weight Load</span>
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-850 dark:text-white leading-tight">
                ~{panelWeight} kg
              </div>
              <div className="text-[9px] font-semibold text-slate-500 dark:text-slate-455 mt-0.5 leading-none">
                Total Load: {panelsNeeded * panelWeight} kg
              </div>
            </div>
          </motion.div>

          {/* Card 4: Efficiency */}
          <motion.div 
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-white/60 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-200/40 dark:border-slate-850/60 flex flex-col justify-between hover:border-indigo-500/35 hover:shadow-[0_8px_24px_rgba(99,102,241,0.06)] dark:hover:shadow-none transition-colors duration-250 cursor-pointer group/spec"
          >
            <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 mb-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-500 shrink-0 animate-pulse" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Efficiency</span>
            </div>
            <div>
              <div className="text-sm font-extrabold text-emerald-600 dark:text-primary-green leading-tight">
                {panelEfficiency.toFixed(1)}%
              </div>
              <div className="text-[9px] font-semibold text-slate-500 dark:text-slate-455 mt-0.5 leading-none">
                Cell Conversion
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sun w-6 h-6 animate-spin" style={{ animationDuration: "15s" }}>
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
