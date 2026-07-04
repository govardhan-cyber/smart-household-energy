import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Zap, Leaf } from "lucide-react";

export const LiveGridStatusWidget: React.FC = () => {
  const [frequency, setFrequency] = useState(50.02);
  const [freqHistory, setFreqHistory] = useState<number[]>([
    50.02, 50.01, 50.03, 50.02, 50.00, 50.01, 50.02, 50.03, 50.02, 50.01, 50.02, 50.01
  ]);
  const [gridLoad, setGridLoad] = useState(74);
  const [renewableMix, setRenewableMix] = useState(42);

  useEffect(() => {
    const freqInterval = setInterval(() => {
      setFrequency(prev => {
        const drift = (Math.random() - 0.5) * 0.015;
        const newVal = prev + drift;
        const clamped = Math.round(Math.min(50.05, Math.max(49.95, newVal)) * 100) / 100;
        
        setFreqHistory(history => {
          return [...history.slice(1), clamped];
        });
        
        return clamped;
      });
    }, 2500);

    const loadInterval = setInterval(() => {
      setGridLoad(prev => {
        const drift = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
        const newVal = Math.min(85, Math.max(60, prev + drift));
        setRenewableMix(mix => {
          const mixDrift = (Math.random() - 0.5) * 2 - (drift * 0.5);
          return Math.min(60, Math.max(30, Math.round(mix + mixDrift)));
        });
        return newVal;
      });
    }, 4000);

    return () => {
      clearInterval(freqInterval);
      clearInterval(loadInterval);
    };
  }, []);

  const svgWidth = 140;
  const svgHeight = 30;
  const points = freqHistory.map((val, idx) => {
    const x = idx * (svgWidth / (freqHistory.length - 1));
    const y = 5 + ((50.05 - val) / 0.1) * (svgHeight - 10);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  
  const pathData = `M ${points.join(" L ")}`;
  const areaData = `${pathData} L ${svgWidth},${svgHeight} L 0,${svgHeight} Z`;

  return (
    <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200/55 dark:border-slate-800/65 shadow-md rounded-3xl p-5 space-y-5 text-left relative overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/5 dark:bg-blue-600/5 blur-xl pointer-events-none rounded-full" />
      
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-850">
        <h4 className="text-[11px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-wider flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-yellow-500" />
          Grid Status
        </h4>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 relative flex">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          </span>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Stable</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <span className="text-[11px] font-bold text-slate-455 dark:text-slate-500">Frequency</span>
          <span className="text-sm font-black text-slate-800 dark:text-slate-200">{frequency.toFixed(2)} Hz</span>
        </div>
        
        <div className="h-8 w-full flex items-end">
          <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="freqGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={areaData} fill="url(#freqGrad)" />
            <path d={pathData} fill="none" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-baseline text-[11px] font-bold text-slate-455 dark:text-slate-500">
          <span>Active Load</span>
          <span className="text-slate-700 dark:text-slate-350 font-semibold">{gridLoad}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary-blue dark:bg-blue-500 rounded-full transition-all duration-1000 ease-out" 
            style={{ width: `${gridLoad}%` }} 
          />
        </div>
      </div>

      <div className="space-y-2 pt-1">
        <div className="flex justify-between text-[11px] font-bold text-slate-455 dark:text-slate-500">
          <span>Renewables Mix</span>
          <span className="text-emerald-500 font-bold">{renewableMix}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden flex">
          <div 
            className="h-full bg-emerald-500 rounded-l-full transition-all duration-1000 ease-out" 
            style={{ width: `${renewableMix}%` }} 
          />
          <div 
            className="h-full bg-slate-400 dark:bg-slate-650 rounded-r-full transition-all duration-1000 ease-out" 
            style={{ width: `${100 - renewableMix}%` }} 
          />
        </div>
        <div className="flex justify-between text-[9px] text-slate-400 font-semibold pt-0.5">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Solar/Wind
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-650" />
            Grid Fossil
          </span>
        </div>
      </div>
    </div>
  );
};

interface CarbonSavingsWidgetProps {
  analysisResult?: {
    savedCo2?: number;
    savedTrees?: number;
  };
}

export const CarbonSavingsWidget: React.FC<CarbonSavingsWidgetProps> = ({ analysisResult }) => {
  const { user } = useAuth();
  const [liveCo2, setLiveCo2] = useState(22.4);
  const [savedTrees, setSavedTrees] = useState(12.2);

  // Sync with report cache or prop
  useEffect(() => {
    if (analysisResult?.savedCo2) {
      setLiveCo2(analysisResult.savedCo2);
      setSavedTrees(analysisResult.savedTrees || 12.2);
      return;
    }

    if (!user) return;
    const cacheKey = `she_reports_cache_${user.uid}`;
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        const reports = JSON.parse(cachedData);
        if (reports && reports.length > 0) {
          const latest = reports[0];
          setLiveCo2(latest.savedCo2 || 22.4);
          setSavedTrees(latest.savedTrees || (latest.savedCo2 ? latest.savedCo2 / 1.83 : 12.2));
        }
      } catch (e) {
        console.error("Error reading cached report for side widget:", e);
      }
    }
  }, [user, analysisResult]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCo2(prev => prev + 0.00012);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const svgWidth = 140;
  const svgHeight = 40;
  const benchY = 28;
  const userYPoints = [26, 25, 20, 17, 14];
  const userPoints = userYPoints.map((y, idx) => {
    const x = idx * (svgWidth / (userYPoints.length - 1));
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const pathData = `M ${userPoints.join(" L ")}`;
  const areaData = `${pathData} L ${svgWidth},${svgHeight} L 0,${svgHeight} Z`;

  return (
    <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200/55 dark:border-slate-800/65 shadow-md rounded-3xl p-5 space-y-5 text-left relative overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/5 dark:bg-emerald-600/5 blur-xl pointer-events-none rounded-full" />
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes sway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(4deg); }
        }
        .animate-sway {
          animation: sway 3s ease-in-out infinite;
          transform-origin: bottom center;
        }
      `}} />

      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-850">
        <h4 className="text-[11px] font-black text-slate-400 dark:text-slate-555 uppercase tracking-wider flex items-center gap-1.5">
          <Leaf className="w-3.5 h-3.5 text-emerald-500" />
          Carbon Saved
        </h4>
        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-green-50/80 dark:bg-green-950/35 border border-green-200/50 dark:border-green-900/50 text-emerald-600 dark:text-primary-green">
          Grade A
        </span>
      </div>

      <div className="space-y-1">
        <span className="text-[10px] font-bold text-slate-455 dark:text-slate-500 block uppercase tracking-wider">CO₂ Offset (Est. Monthly)</span>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            {liveCo2.toFixed(4)}
          </span>
          <span className="text-[11px] font-bold text-slate-455 dark:text-slate-500">kg</span>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 bg-green-50/30 dark:bg-green-950/10 border border-green-150/40 dark:border-green-900/20 rounded-2xl">
        <div className="p-2 bg-emerald-100 dark:bg-emerald-950/40 rounded-xl text-emerald-600 dark:text-primary-green shrink-0 animate-sway">
          <Leaf className="w-5 h-5" />
        </div>
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold text-slate-455 dark:text-slate-500 block">Tree Equivalent</span>
          <span className="text-sm font-black text-slate-850 dark:text-emerald-400">
            {savedTrees.toFixed(1)} Trees
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-[10px] font-bold text-slate-455 dark:text-slate-500 block uppercase tracking-wider">7-Day Trend vs Peer Avg</span>
        
        <div className="h-10 w-full relative">
          <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="carbonGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line x1="0" y1={benchY} x2={svgWidth} y2={benchY} stroke="#f43f5e" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.6" />
            <path d={areaData} fill="url(#carbonGrad)" />
            <path d={pathData} fill="none" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex justify-between text-[9px] text-slate-400 font-semibold">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Your Energy
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-[1.2px] bg-red-400 border-dashed border-t-[1.2px]" />
            Peer Baseline
          </span>
        </div>
      </div>
    </div>
  );
};
