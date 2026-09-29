import React from 'react';
import { Search, History, Home, TrendingUp, Sun, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuickActionsGridProps {
  onAction: (prompt: string) => void;
  onNavigate: (path: string) => void;
  onPromptFindAppliance: () => void;
}

const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({ onAction, onNavigate, onPromptFindAppliance }) => {
  const actions = [
    { 
      icon: <Search className="w-5 h-5" />, 
      label: 'Find Appliance', 
      desc: 'Wattage spec lookup',
      color: 'text-cyan-600 dark:text-cyan-300', 
      iconBg: 'bg-cyan-500/10 dark:bg-cyan-500/20 border border-cyan-400/25 dark:border-cyan-400/35 shadow-[0_0_12px_rgba(6,182,212,0.2)]',
      bg: 'from-cyan-500/10 via-sky-500/5 to-white/10 dark:from-cyan-500/20 dark:via-blue-600/5 dark:to-slate-900/40', 
      border: 'border-cyan-200/50 dark:border-cyan-500/20 hover:border-cyan-400 dark:hover:border-cyan-400 hover:shadow-[0_8px_30px_rgba(6,182,212,0.35)]', 
      handler: onPromptFindAppliance 
    },
    { 
      icon: <History className="w-5 h-5" />, 
      label: 'Audit History', 
      desc: 'Logs & saved reports',
      color: 'text-violet-600 dark:text-violet-300', 
      iconBg: 'bg-violet-500/10 dark:bg-violet-500/20 border border-violet-400/25 dark:border-violet-400/35 shadow-[0_0_12px_rgba(139,92,246,0.2)]',
      bg: 'from-purple-500/10 via-violet-500/5 to-white/10 dark:from-violet-500/20 dark:via-purple-600/5 dark:to-slate-900/40', 
      border: 'border-violet-200/50 dark:border-violet-500/20 hover:border-violet-400 dark:hover:border-violet-400 hover:shadow-[0_8px_30px_rgba(139,92,246,0.35)]', 
      handler: () => onNavigate('/history') 
    },
    { 
      icon: <Home className="w-5 h-5" />, 
      label: 'Home Audit', 
      desc: 'Appliance inventory',
      color: 'text-blue-600 dark:text-blue-300', 
      iconBg: 'bg-blue-500/10 dark:bg-blue-500/20 border border-blue-400/25 dark:border-blue-400/35 shadow-[0_0_12px_rgba(59,130,246,0.2)]',
      bg: 'from-blue-500/10 via-indigo-500/5 to-white/10 dark:from-blue-500/20 dark:via-indigo-600/5 dark:to-slate-900/40', 
      border: 'border-blue-200/50 dark:border-blue-500/20 hover:border-blue-400 dark:hover:border-blue-400 hover:shadow-[0_8px_30px_rgba(59,130,246,0.35)]', 
      handler: () => onNavigate('/dashboard') 
    },
    { 
      icon: <TrendingUp className="w-5 h-5" />, 
      label: 'Predict Usage', 
      desc: 'Monthly forecast',
      color: 'text-emerald-600 dark:text-emerald-300', 
      iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-400/25 dark:border-emerald-400/35 shadow-[0_0_12px_rgba(16,185,129,0.2)]',
      bg: 'from-emerald-500/10 via-teal-500/5 to-white/10 dark:from-emerald-500/20 dark:via-teal-600/5 dark:to-slate-900/40', 
      border: 'border-emerald-200/50 dark:border-emerald-500/20 hover:border-emerald-400 dark:hover:border-emerald-400 hover:shadow-[0_8px_30px_rgba(16,185,129,0.35)]', 
      handler: () => onAction('Predict my monthly electricity usage and estimated bill based on my current appliances') 
    },
    { 
      icon: <Sun className="w-5 h-5" />, 
      label: 'Solar Savings', 
      desc: 'ROI calculator',
      color: 'text-amber-600 dark:text-amber-300', 
      iconBg: 'bg-amber-500/10 dark:bg-amber-500/20 border border-amber-400/25 dark:border-amber-400/35 shadow-[0_0_12px_rgba(245,158,11,0.25)]',
      bg: 'from-amber-500/10 via-orange-500/5 to-white/10 dark:from-amber-500/20 dark:via-orange-600/5 dark:to-slate-900/40', 
      border: 'border-amber-200/50 dark:border-amber-500/20 hover:border-amber-400 dark:hover:border-amber-400 hover:shadow-[0_8px_30px_rgba(245,158,11,0.35)]', 
      handler: () => onAction('Should I install solar panels? What size, cost, and payback period is recommended?') 
    },
    { 
      icon: <Leaf className="w-5 h-5" />, 
      label: 'Smart Savings', 
      desc: '₹500 reduction plan',
      color: 'text-lime-650 dark:text-lime-300', 
      iconBg: 'bg-lime-500/10 dark:bg-lime-500/20 border border-lime-400/25 dark:border-lime-400/35 shadow-[0_0_12px_rgba(132,204,22,0.2)]',
      bg: 'from-lime-500/10 via-emerald-500/5 to-white/10 dark:from-lime-500/20 dark:via-emerald-600/5 dark:to-slate-900/40', 
      border: 'border-lime-200/50 dark:border-lime-500/20 hover:border-lime-400 dark:hover:border-lime-400 hover:shadow-[0_8px_30px_rgba(132,204,22,0.35)]', 
      handler: () => onAction('Analyze my appliances and suggest specific ways to reduce my electricity bill by ₹500') 
    }
  ];

  return (
    <div className="px-4 pb-2 relative z-10">
      <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2.5">
        AI Tools Launchpad
      </span>
      <div className="grid grid-cols-3 gap-2.5">
        {actions.map((act, i) => (
          <motion.button
            key={i}
            type="button"
            onClick={act.handler}
            initial={{ opacity: 0, scale: 0.94, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 24, delay: i * 0.02 }}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.96 }}
            className={`flex flex-col items-center gap-1.5 px-2.5 py-3 bg-gradient-to-br ${act.bg} border ${act.border} rounded-2xl cursor-pointer transition-all duration-200 backdrop-blur-lg shadow-xs hover:shadow-lg group relative overflow-hidden will-change-transform`}
          >
            {/* Top Specular Sheen */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/40 to-transparent pointer-events-none" />
            
            <div className={`${act.color} ${act.iconBg} p-2 rounded-xl group-hover:scale-115 group-hover:rotate-3 transition-all duration-300`}>
              {act.icon}
            </div>
            
            <span className="text-[12px] font-display font-black text-slate-900 dark:text-white leading-tight text-center transition-colors">
              {act.label}
            </span>
            
            <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400 leading-none text-center">
              {act.desc}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default QuickActionsGrid;
