import React, { useState, useEffect } from 'react';
import { Zap, Sun, Activity, BarChart3, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface CopilotInsightsBarProps {
  compact?: boolean;
  userId?: string;
  onNavigate?: (path: string) => void;
  onAction?: (prompt: string) => void;
}

const CopilotInsightsBar: React.FC<CopilotInsightsBarProps> = ({ 
  compact = false, 
  userId,
  onNavigate,
  onAction
}) => {
  const [insights, setInsights] = useState<{ bill: string; solar: string; score: string; units: string }>({
    bill: '₹--', solar: '₹--', score: '--', units: '--'
  });
  
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning ☀️');
    else if (hour < 17) setGreeting('Good afternoon 🌤️');
    else if (hour < 21) setGreeting('Good evening 🌆');
    else setGreeting('Good night 🌙');
  }, []);

  useEffect(() => {
    try {
      // 1. Read cached report data
      const reportKeys = Object.keys(localStorage).filter(k => k.startsWith('she_reports_cache_'));
      if (reportKeys.length > 0) {
        const reportData = JSON.parse(localStorage.getItem(reportKeys[0]) || '[]');
        const latest = Array.isArray(reportData) ? reportData[0] : reportData;
        if (latest) {
          if (latest.estimatedBill) setInsights(prev => ({ ...prev, bill: `₹${Math.round(latest.estimatedBill)}` }));
          if (latest.totalUnits) setInsights(prev => ({ ...prev, units: `${Math.round(latest.totalUnits)} kWh` }));
          if (latest.totalUnits && latest.savingsPotential) {
            const score = Math.max(0, Math.min(100, Math.round(100 - (latest.savingsPotential / (latest.estimatedBill || 1)) * 100)));
            setInsights(prev => ({ ...prev, score: `${score}/100` }));
          }
        }
      }



      // 3. Read cached solar data
      const solarKeys = Object.keys(localStorage).filter(k => k.startsWith('she_solar_cache_'));
      if (solarKeys.length > 0) {
        const solarData = JSON.parse(localStorage.getItem(solarKeys[0]) || '{}');
        if (solarData.monthlySavings) setInsights(prev => ({ ...prev, solar: `₹${Math.round(solarData.monthlySavings)}` }));
      }
    } catch { /* graceful fallback */ }
  }, [userId]);

  const cards = [
    { 
      icon: <Zap className={compact ? 'w-3.5 h-3.5' : 'w-4.5 h-4.5'} />, 
      label: 'EST. BILL', 
      value: insights.bill, 
      color: 'text-amber-500 dark:text-amber-300', 
      actionColor: 'text-amber-600 dark:text-amber-400 underline decoration-amber-400/50',
      actionBadge: 'text-amber-700 dark:text-amber-300 bg-amber-500/15 border-amber-400/30',
      iconBg: 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-400/20 dark:border-amber-400/30',
      bg: 'from-amber-500/10 via-amber-400/5 to-white/10 dark:from-amber-500/20 dark:via-amber-600/5 dark:to-slate-900/40',
      border: 'border-amber-300/60 dark:border-amber-500/30 hover:border-amber-400 dark:hover:border-amber-400 hover:shadow-[0_8px_30px_rgba(245,158,11,0.25)]',
      actionLabel: 'View Audit',
      path: '/dashboard'
    },
    { 
      icon: <Sun className={compact ? 'w-3.5 h-3.5' : 'w-4.5 h-4.5'} />, 
      label: 'SOLAR', 
      value: insights.solar, 
      color: 'text-rose-500 dark:text-rose-300', 
      actionColor: 'text-rose-600 dark:text-rose-400 underline decoration-rose-400/50',
      actionBadge: 'text-rose-700 dark:text-rose-300 bg-rose-500/15 border-rose-400/30',
      iconBg: 'bg-rose-500/10 dark:bg-rose-500/20 border-rose-400/20 dark:border-rose-400/30',
      bg: 'from-rose-500/10 via-rose-400/5 to-white/10 dark:from-rose-500/20 dark:via-rose-600/5 dark:to-slate-900/40',
      border: 'border-rose-300/60 dark:border-rose-500/30 hover:border-rose-400 dark:hover:border-rose-400 hover:shadow-[0_8px_30px_rgba(244,63,94,0.25)]',
      actionLabel: 'Solar ROI',
      path: '/dashboard',
      tab: 'solar'
    },
    { 
      icon: <Activity className={compact ? 'w-3.5 h-3.5' : 'w-4.5 h-4.5'} />, 
      label: 'SCORE', 
      value: insights.score, 
      color: 'text-emerald-500 dark:text-emerald-300', 
      actionColor: 'text-emerald-600 dark:text-emerald-400 underline decoration-emerald-400/50',
      actionBadge: 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border-emerald-400/30',
      iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-400/20 dark:border-emerald-400/30',
      bg: 'from-emerald-500/10 via-emerald-400/5 to-white/10 dark:from-emerald-500/20 dark:via-emerald-600/5 dark:to-slate-900/40',
      border: 'border-emerald-300/60 dark:border-emerald-500/30 hover:border-emerald-400 dark:hover:border-emerald-400 hover:shadow-[0_8px_30px_rgba(16,185,129,0.25)]',
      actionLabel: 'Run Audit',
      path: '/dashboard',
      tab: 'audit'
    },
    { 
      icon: <BarChart3 className={compact ? 'w-3.5 h-3.5' : 'w-4.5 h-4.5'} />, 
      label: 'UNITS', 
      value: insights.units, 
      color: 'text-cyan-500 dark:text-cyan-300', 
      actionColor: 'text-cyan-600 dark:text-cyan-400 underline decoration-cyan-400/50',
      actionBadge: 'text-cyan-700 dark:text-cyan-300 bg-cyan-500/15 border-cyan-400/30',
      iconBg: 'bg-cyan-500/10 dark:bg-cyan-500/20 border-cyan-400/20 dark:border-cyan-400/30',
      bg: 'from-cyan-500/10 via-cyan-400/5 to-white/10 dark:from-cyan-500/20 dark:via-cyan-600/5 dark:to-slate-900/40',
      border: 'border-cyan-300/60 dark:border-cyan-500/30 hover:border-cyan-400 dark:hover:border-cyan-400 hover:shadow-[0_8px_30px_rgba(6,182,212,0.25)]',
      actionLabel: 'Add Appliance',
      prompt: 'FIND_APPLIANCE_PROMPT'
    }
  ];

  const handleCardClick = (c: typeof cards[0]) => {
    if (c.path && onNavigate) {
      onNavigate(c.tab ? `${c.path}?tab=${c.tab}` : c.path);
    } else if (c.prompt && onAction) {
      onAction(c.prompt);
    }
  };

  if (compact) {
    return (
      <div className="flex gap-2 px-3 py-2 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl relative z-10 shrink-0 shadow-2xs overflow-x-auto scrollbar-hide">
        {cards.map((c, i) => {
          const isEmpty = c.value === '₹--' || c.value === '--';
          return (
            <button 
              key={i} 
              onClick={() => handleCardClick(c)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-2xl bg-gradient-to-r ${c.bg} border ${c.border} flex-1 min-w-[105px] sm:min-w-0 shadow-2xs cursor-pointer hover:scale-[1.04] active:scale-[0.97] transition-all group relative overflow-hidden text-left shrink-0`}
            >
              {/* Glass sheen highlight */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 dark:via-white/25 to-transparent pointer-events-none" />

              <div className={`${c.iconBg} ${c.color} w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border border-white/20 shadow-2xs group-hover:scale-110 transition-transform`}>
                {c.icon}
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate leading-tight">
                  {c.label}
                </div>
                <div className="text-[11px] font-display font-black text-slate-900 dark:text-white truncate leading-tight mt-0.5">
                  {isEmpty ? (
                    <span className={`text-[9px] font-bold ${c.actionColor} underline-offset-2`}>
                      + {c.actionLabel}
                    </span>
                  ) : (
                    c.value
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="px-4 pt-3.5 pb-2 relative z-10">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[13px] font-display font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
          {greeting}
        </span>
        <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-slate-100/80 dark:bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-200/60 dark:border-slate-700/60">
          Telemetry Insights
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {cards.map((c, i) => {
          const isEmpty = c.value === '₹--' || c.value === '--';
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 450, damping: 22, delay: i * 0.03 }}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCardClick(c)}
              className={`bg-gradient-to-br ${c.bg} border ${c.border} rounded-2xl p-3 text-center backdrop-blur-xl transition-all cursor-pointer shadow-2xs hover:shadow-md group relative overflow-hidden will-change-transform flex flex-col justify-between min-h-[92px]`}
            >
              {/* Glass Reflection Highlight Arc */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 dark:via-white/20 to-transparent pointer-events-none" />

              <div>
                <div className={`${c.iconBg} ${c.color} w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-1.5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 border border-white/20 shadow-2xs`}>
                  {c.icon}
                </div>
                
                <div className="text-[14px] font-display font-black text-slate-950 dark:text-white leading-tight tracking-tight">
                  {isEmpty ? (
                    <span className={`text-[10px] font-extrabold ${c.actionBadge} uppercase tracking-wider block py-0.5 px-1.5 rounded-md border`}>
                      + {c.actionLabel}
                    </span>
                  ) : (
                    c.value
                  )}
                </div>
              </div>
              
              <div className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1 flex items-center justify-center gap-0.5">
                {c.label}
                {!isEmpty && <ArrowUpRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CopilotInsightsBar;
