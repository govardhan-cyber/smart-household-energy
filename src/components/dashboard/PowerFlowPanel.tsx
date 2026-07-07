import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Leaf, Moon, CloudSun, RefreshCw } from "lucide-react";
import type { ApplianceItem } from "../../utils/tariffCalculator";

interface TooltipCardProps {
  active: boolean;
  title: string;
  status: string;
  statusClass: string;
  rows: { label: string; value: string; valueClass?: string }[];
  footerLabel?: string;
  footerValue?: string;
  footerValueClass?: string;
}

function TooltipCard({ active, title, status, statusClass, rows, footerLabel, footerValue, footerValueClass }: TooltipCardProps) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95, x: "-50%" }}
          animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
          exit={{ opacity: 0, y: 8, scale: 0.95, x: "-50%" }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute bottom-full left-1/2 mb-3 z-50 w-60 p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-white backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 shadow-2xl pointer-events-none select-none text-[11px]"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
            <span className="font-black tracking-tight text-slate-800 dark:text-slate-200">{title}</span>
            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${statusClass}`}>
              {status}
            </span>
          </div>
          <div className="space-y-1.5 font-medium">
            {rows.map((row, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-slate-450 dark:text-slate-500">{row.label}</span>
                <span className={`font-mono text-slate-700 dark:text-slate-350 font-bold ${row.valueClass || ''}`}>{row.value}</span>
              </div>
            ))}
            {footerLabel && (
              <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-1.5 mt-1.5">
                <span className="text-slate-450 dark:text-slate-500 font-semibold">{footerLabel}</span>
                <span className={`font-mono font-bold ${footerValueClass || 'text-slate-700 dark:text-slate-250'}`}>
                  {footerValue}
                </span>
              </div>
            )}
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white/95 dark:border-t-slate-900/95" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface SimModeSelectorProps {
  simMode: 'auto' | 'sunny' | 'cloudy' | 'night' | 'eco';
  onChange: (mode: 'auto' | 'sunny' | 'cloudy' | 'night' | 'eco') => void;
}

function SimModeSelector({ simMode, onChange }: SimModeSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-1 bg-slate-200/40 dark:bg-slate-900/40 p-0.5 rounded-xl border border-slate-200/40 dark:border-slate-800/40 text-[10px] font-bold text-slate-600 dark:text-slate-400 select-none">
      <button 
        onClick={() => onChange('auto')}
        title="Automatic Live Drift Simulator"
        className={`px-2.5 py-1 rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-1 ${
          simMode === 'auto' 
            ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/20 dark:border-slate-700/30' 
            : 'hover:text-slate-800 dark:hover:text-slate-200'
        }`}
      >
        <RefreshCw className={`w-3 h-3 ${simMode === 'auto' ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
        <span>Auto</span>
      </button>
      <button 
        onClick={() => onChange('sunny')}
        title="Simulate Peak Solar Generation & Net Metering Export"
        className={`px-2.5 py-1 rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-1 ${
          simMode === 'sunny' 
            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm border border-transparent' 
            : 'hover:text-slate-800 dark:hover:text-slate-200'
        }`}
      >
        <Sun className="w-3 h-3" />
        <span>Noon Export</span>
      </button>
      <button 
        onClick={() => onChange('cloudy')}
        title="Simulate Overcast Low Generation"
        className={`px-2.5 py-1 rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-1 ${
          simMode === 'cloudy' 
            ? 'bg-sky-500 text-white shadow-sm' 
            : 'hover:text-slate-800 dark:hover:text-slate-200'
        }`}
      >
        <CloudSun className="w-3 h-3" />
        <span>Cloudy</span>
      </button>
      <button 
        onClick={() => onChange('night')}
        title="Simulate Evening Peak Demand (Zero Solar)"
        className={`px-2.5 py-1 rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-1 ${
          simMode === 'night' 
            ? 'bg-indigo-600 text-white shadow-sm' 
            : 'hover:text-slate-800 dark:hover:text-slate-200'
        }`}
      >
        <Moon className="w-3 h-3" />
        <span>Peak Demand</span>
      </button>
      <button 
        onClick={() => onChange('eco')}
        title="Simulate Net-Zero Off-Grid Self Sufficiency"
        className={`px-2.5 py-1 rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-1 ${
          simMode === 'eco' 
            ? 'bg-emerald-600 text-white shadow-sm' 
            : 'hover:text-slate-800 dark:hover:text-slate-200'
        }`}
      >
        <Leaf className="w-3 h-3" />
        <span>Net Zero</span>
      </button>
    </div>
  );
}

export function PowerFlowPanel({ totalUnits, activeAppliances }: { totalUnits: number; activeAppliances: ApplianceItem[] }) {
  const [simMode, setSimMode] = useState<'auto' | 'sunny' | 'cloudy' | 'night' | 'eco'>('auto');
  const [baseSolar, setBaseSolar] = useState(0.35);
  const [baseHome, setBaseHome] = useState(0.77);
  const [voltage, setVoltage] = useState(230.1);
  const [frequency, setFrequency] = useState(50.01);
  const [solarTemp, setSolarTemp] = useState(41.8);
  const [activeTooltip, setActiveTooltip] = useState<'grid' | 'solar' | 'home' | null>(null);

  // Sync baselines on mode change
  useEffect(() => {
    if (simMode === 'sunny') {
      setBaseSolar(2.45);
      setBaseHome(0.95);
      setSolarTemp(44.5);
    } else if (simMode === 'cloudy') {
      setBaseSolar(0.28);
      setBaseHome(1.20);
      setSolarTemp(29.4);
    } else if (simMode === 'night') {
      setBaseSolar(0.00);
      setBaseHome(1.85);
      setSolarTemp(21.5);
    } else if (simMode === 'eco') {
      setBaseSolar(1.20);
      setBaseHome(1.20);
      setSolarTemp(38.6);
    }
  }, [simMode]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Small drifts for telemetry realism
      setVoltage(v => {
        const drift = (Math.random() - 0.5) * 0.4;
        return Math.round(Math.min(233.0, Math.max(227.0, v + drift)) * 10) / 10;
      });
      setFrequency(f => {
        const drift = (Math.random() - 0.5) * 0.02;
        return Math.round(Math.min(50.05, Math.max(49.95, f + drift)) * 100) / 100;
      });
      setSolarTemp(t => {
        if (simMode === 'night') return Math.round((21.0 + (Math.random() - 0.5) * 0.4) * 10) / 10;
        const drift = (Math.random() - 0.5) * 0.2;
        const targetTemp = simMode === 'sunny' ? 44.5 : simMode === 'cloudy' ? 29.4 : 38.6;
        return Math.round(Math.min(targetTemp + 3, Math.max(targetTemp - 3, t + drift)) * 10) / 10;
      });

      if (simMode === 'auto') {
        setBaseSolar(s => {
          const drift = (Math.random() - 0.5) * 0.04;
          return Math.round(Math.min(1.80, Math.max(0.10, s + drift)) * 100) / 100;
        });
        setBaseHome(h => {
          const drift = (Math.random() - 0.5) * 0.05;
          return Math.round(Math.min(2.20, Math.max(0.40, h + drift)) * 100) / 100;
        });
      } else {
        // Mode-specific slight drifts
        setBaseSolar(s => {
          if (simMode === 'night') return 0;
          const drift = (Math.random() - 0.5) * 0.02;
          const target = simMode === 'sunny' ? 2.45 : simMode === 'cloudy' ? 0.28 : 1.20;
          return Math.round(Math.min(target + 0.1, Math.max(target - 0.1, s + drift)) * 100) / 100;
        });
        setBaseHome(h => {
          const drift = (Math.random() - 0.5) * 0.03;
          const target = simMode === 'sunny' ? 0.95 : simMode === 'cloudy' ? 1.20 : simMode === 'night' ? 1.85 : 1.20;
          return Math.round(Math.min(target + 0.15, Math.max(target - 0.15, h + drift)) * 100) / 100;
        });
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [simMode]);

  const solarPower = baseSolar;
  const homePower = baseHome;
  const gridPower = Math.round((homePower - solarPower) * 100) / 100;
  const isExporting = gridPower < 0;
  const totalDemand = homePower;

  // Calculate speeds based on physical power load
  const getSpeed = (power: number) => {
    const absPower = Math.abs(power);
    if (absPower < 0.05) return 0; // stopped
    return Math.max(0.6, Math.min(3.2, 1.5 / absPower));
  };

  const gridSpeed = getSpeed(gridPower);
  const solarSpeed = getSpeed(solarPower);

  // SVG paths - dynamic direction
  const gridPath = isExporting 
    ? "M 100 40 C 50 40, 50 20, 0 20" 
    : "M 0 20 C 50 20, 50 40, 100 40";
  const solarPath = "M 0 60 C 50 60, 50 40, 100 40";

  // Animation configurations
  const gridAnimStyle = gridSpeed > 0 ? {
    animation: `${isExporting ? 'flow-dash-reverse' : 'flow-dash'} ${gridSpeed}s linear infinite`
  } : {
    strokeDashoffset: 0
  };

  const solarAnimStyle = solarSpeed > 0 ? {
    animation: `flow-dash ${solarSpeed}s linear infinite`
  } : {
    strokeDashoffset: 0
  };

  // Home heartbeat speed (based on load)
  const homePulseSpeed = Math.max(0.5, Math.min(2.5, 1.8 / Math.max(0.1, homePower)));

  return (
    <div className="relative bg-gradient-to-br from-white/95 via-slate-50/70 to-blue-50/30 dark:from-slate-900/90 dark:via-slate-950/60 dark:to-blue-950/20 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm p-6 hover:shadow-md transition-all duration-300">
      
      {/* Decoupled background with overflow-hidden to prevent clipping tooltips */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
        <div className="absolute -left-10 -top-10 w-36 h-36 bg-blue-500/8 dark:bg-blue-600/6 rounded-full blur-2xl" />
        <div className="absolute -right-10 -bottom-10 w-36 h-36 bg-indigo-500/8 dark:bg-indigo-600/6 rounded-full blur-2xl" />
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.015] bg-[linear-gradient(to_right,rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.1)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:20px_20px]" />
      </div>

      <div className="relative z-10 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 border-b border-slate-200/40 dark:border-slate-800/40 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 relative flex shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-450 opacity-75"></span>
            </div>
            <h3 className="text-sm font-black text-slate-800 dark:text-white tracking-tight">Live Household Power Flow</h3>
          </div>
          <SimModeSelector simMode={simMode} onChange={setSimMode} />
        </div>

        {/* Nodes and Flow Layout */}
        <div className="flex items-center justify-between gap-4 w-full relative">
          
          {/* Left Column: Power Sources (Grid & Solar) */}
          <div className="flex flex-col gap-8 shrink-0 z-10">
            
            {/* Grid Node Card */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveTooltip('grid')}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              <div 
                onClick={() => setActiveTooltip(prev => prev === 'grid' ? null : 'grid')}
                className="flex items-center gap-3 p-3 rounded-2xl bg-white/40 dark:bg-slate-900/30 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/40 shadow-sm hover:shadow-md hover:scale-[1.02] cursor-pointer transition-all duration-305 select-none w-[170px]"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 shrink-0 ${
                  isExporting 
                    ? 'bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 dark:text-emerald-450' 
                    : gridPower === 0
                    ? 'bg-slate-500/10 dark:bg-slate-500/15 border border-slate-500/30 text-slate-500 dark:text-slate-400'
                    : 'bg-blue-500/10 dark:bg-blue-600/15 border border-blue-500/25 dark:border-blue-500/35 text-blue-500 dark:text-blue-400'
                }`}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <line x1="5" y1="6" x2="19" y2="6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    <line x1="12" y1="10" x2="6" y2="6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
                    <line x1="12" y1="10" x2="18" y2="6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
                    <circle cx="5" cy="6" r="2.2" className="fill-current animate-pulse" />
                    <circle cx="19" cy="6" r="2.2" className="fill-current animate-pulse" />
                    <circle cx="3" cy="12" r="2.2" className="fill-current animate-pulse" />
                    <circle cx="21" cy="12" r="2.2" className="fill-current animate-pulse" />
                  </svg>
                </div>
                <div className="text-left min-w-0">
                  <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate">
                    {isExporting ? 'Grid Export' : 'Grid Import'}
                  </p>
                  <p className={`text-sm font-black mt-0.5 tracking-tight font-display ${
                    isExporting 
                      ? 'text-emerald-600 dark:text-emerald-455' 
                      : gridPower === 0
                      ? 'text-slate-500 dark:text-slate-400'
                      : 'text-blue-600 dark:text-blue-400'
                  }`}>
                    {Math.abs(gridPower).toFixed(2)} kW
                  </p>
                </div>
              </div>

              <TooltipCard 
                active={activeTooltip === 'grid'} 
                title="Grid Telemetry"
                status={isExporting ? 'Net Crediting' : gridPower === 0 ? 'Balanced' : 'Active Import'}
                statusClass={
                  isExporting 
                    ? 'bg-emerald-500/10 text-emerald-650 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/10' 
                    : gridPower === 0
                    ? 'bg-slate-500/10 text-slate-600 dark:text-slate-450 border border-slate-500/20 dark:border-slate-800/25'
                    : 'bg-blue-500/10 text-blue-650 dark:text-blue-400 border border-blue-500/20 dark:border-blue-500/10'
                }
                rows={[
                  { label: "AC Line Voltage", value: `${voltage.toFixed(1)} V` },
                  { label: "Grid Frequency", value: `${frequency.toFixed(2)} Hz` },
                  { label: "Power Factor", value: "0.98 (Lag)" },
                  { label: "Grid Direction", value: isExporting ? 'Home → Grid' : gridPower === 0 ? 'Idle (Zero Draw)' : 'Grid → Home', valueClass: isExporting ? 'text-emerald-650 dark:text-emerald-400' : gridPower === 0 ? 'text-slate-600 dark:text-slate-455' : 'text-blue-600 dark:text-blue-400' }
                ]}
                footerLabel="Today's Net Exchange"
                footerValue={`${isExporting ? '-' : '+'}${(Math.abs(gridPower) * 2.2).toFixed(1)} kWh`}
              />
            </div>

            {/* Solar Node Card */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveTooltip('solar')}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              <div 
                onClick={() => setActiveTooltip(prev => prev === 'solar' ? null : 'solar')}
                className={`flex items-center gap-3 p-3 rounded-2xl bg-white/40 dark:bg-slate-900/30 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/40 shadow-sm hover:shadow-md hover:scale-[1.02] cursor-pointer transition-all duration-300 select-none w-[170px] ${
                  solarPower === 0 ? 'opacity-50 hover:opacity-85' : ''
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 shrink-0 ${
                  solarPower > 0 
                    ? 'bg-amber-500/10 dark:bg-amber-600/15 border border-amber-500/25 dark:border-amber-500/35 text-amber-500' 
                    : 'bg-slate-500/10 dark:bg-slate-500/15 border border-slate-500/20 dark:border-slate-850 text-slate-400 dark:text-slate-500'
                }`}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="17" cy="7" r="3" className={`stroke-amber-500 dark:stroke-amber-400 ${solarPower > 0 ? 'fill-amber-400 dark:fill-amber-300 animate-spin-slow' : 'fill-slate-200 dark:fill-slate-800'}`} strokeWidth="1.2" style={{ transformOrigin: '17px 7px' }} />
                    <line x1="17" y1="2" x2="17" y2="3" className="stroke-amber-500 dark:stroke-amber-400" strokeWidth="1.2" strokeLinecap="round" />
                    <line x1="21" y1="3" x2="22" y2="2" className="stroke-amber-500 dark:stroke-amber-400" strokeWidth="1.2" strokeLinecap="round" />
                    <line x1="22" y1="7" x2="21" y2="7" className="stroke-amber-500 dark:stroke-amber-400" strokeWidth="1.2" strokeLinecap="round" />
                    <line x1="13" y1="11" x2="12" y2="12" className="stroke-amber-500 dark:stroke-amber-400" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
                    
                    <rect x="3" y="10" width="14" height="11" rx="1.5" transform="rotate(-10 3 10)" className="stroke-emerald-600 dark:stroke-emerald-450 fill-emerald-50/20 dark:fill-emerald-950/20" strokeWidth="1.6" />
                    <line x1="4.5" y1="13.5" x2="17.5" y2="11.2" className="stroke-emerald-600 dark:stroke-emerald-455" strokeWidth="1" opacity="0.8" />
                    <line x1="5.5" y1="18.5" x2="18.5" y2="16.2" className="stroke-emerald-600 dark:stroke-emerald-450" strokeWidth="1" opacity="0.8" />
                    <line x1="11" y1="10.5" x2="13.2" y2="21.5" className="stroke-emerald-600 dark:stroke-emerald-450" strokeWidth="1" opacity="0.8" />
                  </svg>
                </div>
                <div className="text-left min-w-0">
                  <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate">Solar Output</p>
                  <p className={`text-sm font-black mt-0.5 tracking-tight font-display ${
                    solarPower > 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-500'
                  }`}>
                    {solarPower.toFixed(2)} kW
                  </p>
                </div>
              </div>

              <TooltipCard 
                active={activeTooltip === 'solar'} 
                title="Solar Array Status"
                status={solarPower > 1.8 ? 'Peak Solar' : solarPower > 0 ? 'Generating' : 'Off-Line'}
                statusClass={
                  solarPower > 1.8 
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 dark:border-amber-500/10' 
                    : solarPower > 0 
                    ? 'bg-emerald-500/10 text-emerald-650 dark:text-emerald-405 border border-emerald-500/20 dark:border-emerald-500/10' 
                    : 'bg-slate-500/10 text-slate-600 dark:text-slate-455 border border-slate-500/20 dark:border-slate-800/25'
                }
                rows={[
                  { label: "Solar Irradiance", value: `${Math.round(solarPower * 330)} W/m²` },
                  { label: "Panel Cell Temp", value: `${solarTemp.toFixed(1)} °C` },
                  { label: "Inverter Efficiency", value: solarPower > 0 ? '97.6%' : '0.0%' },
                  { label: "System Capacity", value: "3.0 kWp" }
                ]}
                footerLabel="CO₂ Avoided Rate"
                footerValue={`${(solarPower * 0.42).toFixed(2)} kg/hr`}
                footerValueClass="text-emerald-650 dark:text-emerald-400"
              />
            </div>
          </div>

          {/* Center Column: Animated Curved Flow Paths */}
          <div className="flex-1 h-32 relative select-none">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 80" preserveAspectRatio="none">
              <defs>
                <filter id="glow-pf-improved" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="1.8" result="blur1" />
                  <feGaussianBlur stdDeviation="3.6" result="blur2" />
                  <feMerge>
                    <feMergeNode in="blur2" />
                    <feMergeNode in="blur1" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              
              {/* Grid Conduit Path (Base Track) */}
              <path
                d="M 0 20 C 50 20, 50 40, 100 40"
                fill="none"
                stroke={isExporting ? "#059669" : "#2563eb"}
                strokeWidth="3.5"
                strokeOpacity="0.06"
              />
              {/* Grid Conduit Path (Active Core) */}
              <path
                d="M 0 20 C 50 20, 50 40, 100 40"
                fill="none"
                stroke={isExporting ? "#10b981" : "#3b82f6"}
                strokeWidth="1.4"
                strokeDasharray="4,6"
                strokeOpacity={gridPower === 0 ? "0.15" : "0.75"}
                style={gridAnimStyle}
                className="transition-all duration-500"
              />

              {/* Solar Conduit Path (Base Track) */}
              <path
                d="M 0 60 C 50 60, 50 40, 100 40"
                fill="none"
                stroke="#059669"
                strokeWidth="3.5"
                strokeOpacity="0.06"
              />
              {/* Solar Conduit Path (Active Core) */}
              <path
                d="M 0 60 C 50 60, 50 40, 100 40"
                fill="none"
                stroke="#10b981"
                strokeWidth="1.4"
                strokeDasharray="4,6"
                strokeOpacity={solarPower === 0 ? "0.1" : "0.75"}
                style={solarAnimStyle}
                className="transition-all duration-500"
              />

              {/* Flowing Energy Particles - Grid Conduits */}
              {gridSpeed > 0 && (
                <>
                  <circle r="2.8" fill={isExporting ? "#10b981" : "#60a5fa"} filter="url(#glow-pf-improved)" opacity="0.9">
                    <animateMotion dur={`${gridSpeed * 2}s`} repeatCount="indefinite" path={gridPath} />
                  </circle>
                  <circle r="2.8" fill={isExporting ? "#10b981" : "#60a5fa"} filter="url(#glow-pf-improved)" opacity="0.9">
                    <animateMotion dur={`${gridSpeed * 2}s`} begin={`${gridSpeed}s`} repeatCount="indefinite" path={gridPath} />
                  </circle>
                </>
              )}

              {/* Flowing Energy Particles - Solar Conduits */}
              {solarSpeed > 0 && (
                <>
                  <circle r="2.8" fill="#10b981" filter="url(#glow-pf-improved)" opacity="0.9">
                    <animateMotion dur={`${solarSpeed * 2}s`} repeatCount="indefinite" path={solarPath} />
                  </circle>
                  <circle r="2.8" fill="#10b981" filter="url(#glow-pf-improved)" opacity="0.9">
                    <animateMotion dur={`${solarSpeed * 2}s`} begin={`${solarSpeed}s`} repeatCount="indefinite" path={solarPath} />
                  </circle>
                </>
              )}
            </svg>
          </div>

          {/* Right Column: Home Destination */}
          <div 
            className="relative shrink-0 z-10"
            onMouseEnter={() => setActiveTooltip('home')}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <div 
              onClick={() => setActiveTooltip(prev => prev === 'home' ? null : 'home')}
              className="flex items-center gap-3 p-3 rounded-2xl bg-white/40 dark:bg-slate-900/30 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/40 shadow-sm hover:shadow-md hover:scale-[1.02] cursor-pointer transition-all duration-305 select-none w-[185px]"
            >
              <div className="text-right min-w-0 flex-1">
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-555 uppercase tracking-wider truncate">Home Load</p>
                <p className="text-base font-black text-slate-800 dark:text-white mt-0.5 tracking-tight font-display">{totalDemand.toFixed(2)} kW</p>
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 leading-none">
                  Cum. {Math.round(totalUnits)} kWh
                </span>
              </div>
              
              <div className="relative w-14 h-14 rounded-2xl bg-indigo-500/10 dark:bg-indigo-600/15 border border-indigo-500/25 dark:border-indigo-500/35 flex flex-col items-center justify-center shadow-inner hover:scale-105 transition-transform duration-305 shrink-0">
                <div 
                  className="absolute inset-0 rounded-2xl border border-indigo-400/40 opacity-0 pointer-events-none animate-pulse-ring"
                  style={{ animationDuration: `${homePulseSpeed}s` }}
                />

                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="6" y="11" width="12" height="11" rx="1" className="stroke-indigo-500 dark:stroke-indigo-400 fill-indigo-50/40 dark:fill-indigo-950/30" strokeWidth="1.6" />
                  <path d="M4 11L12 4L20 11" className="stroke-indigo-600 dark:stroke-indigo-455" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="10" y="16" width="4" height="6" rx="0.5" className="stroke-indigo-500 dark:stroke-indigo-405 fill-indigo-100 dark:fill-indigo-900" strokeWidth="1" />
                  <rect x="8" y="13" width="2.5" height="2.5" rx="0.5" className={`fill-amber-350 dark:fill-amber-400 ${homePower > 0 ? 'animate-window-glow' : 'opacity-60'}`} style={{ animationDuration: '3s' }} />
                  <rect x="13.5" y="13" width="2.5" height="2.5" rx="0.5" className={`fill-amber-350 dark:fill-amber-400 ${homePower > 0 ? 'animate-window-glow' : 'opacity-60'}`} style={{ animationDuration: '3s', animationDelay: '0.7s' }} />
                  <path d="M9 3C10.5 1.8 13.5 1.8 15 3" className="stroke-emerald-500 dark:stroke-emerald-450" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M10.5 5C11.3 4.2 12.7 4.2 13.5 5" className="stroke-emerald-500 dark:stroke-emerald-455" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="12" cy="7" r="1" className="fill-emerald-500 dark:fill-emerald-450" />
                </svg>
              </div>
            </div>

            <TooltipCard 
              active={activeTooltip === 'home'} 
              title="Household Consumption"
              status={homePower > 1.5 ? 'Heavy Load' : homePower > 0.8 ? 'Moderate' : 'Eco Mode'}
              statusClass={
                homePower > 1.5 
                  ? 'bg-red-500/10 text-red-650 dark:text-red-400 border border-red-500/20 dark:border-red-500/10' 
                  : homePower > 0.8
                  ? 'bg-blue-500/10 text-blue-650 dark:text-blue-400 border border-blue-500/20 dark:border-blue-500/10'
                  : 'bg-emerald-500/10 text-emerald-650 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/10'
              }
              rows={[
                { label: "Total Power Draw", value: `${homePower.toFixed(2)} kW` },
                { label: "Calculated Current", value: `${(Math.round((homePower * 1000) / voltage * 100) / 100).toFixed(2)} A` },
                { label: "Supply Connection", value: "L1 (Single-Phase)" },
                { label: "Grid Quality Index", value: "Stable (THD < 3%)", valueClass: "text-emerald-650 dark:text-emerald-400 font-bold" }
              ]}
              footerLabel="Active Appliances"
              footerValue={`${activeAppliances.length} configured`}
            />
          </div>
        </div>
      </div>
      
      {/* Inline styles for custom flowing path animations and responsive effects */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes flow-dash {
          to {
            stroke-dashoffset: -20;
          }
        }
        @keyframes flow-dash-reverse {
          to {
            stroke-dashoffset: 20;
          }
        }
        @keyframes pulse-ring {
          0% {
            transform: scale(0.9);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.3);
            opacity: 0;
          }
        }
        @keyframes window-glow {
          0%, 100% {
            opacity: 0.8;
            filter: drop-shadow(0 0 1px rgba(245,158,11,0.5));
          }
          50% {
            opacity: 1;
            filter: drop-shadow(0 0 4px rgba(245,158,11,0.9));
          }
        }
        .animate-pulse-ring {
          animation: pulse-ring 1.8s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }
        .animate-window-glow {
          animation: window-glow 3s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin 12s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}} />
    </div>
  );
}
