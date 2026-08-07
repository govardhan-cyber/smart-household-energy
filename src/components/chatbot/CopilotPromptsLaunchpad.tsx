import React from 'react';
import { Sparkles, Zap, Sun, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface CopilotPromptsLaunchpadProps {
  onSelectPrompt: (prompt: string) => void;
  user: { tariffState?: string; customFlatRate?: number } | null;
}

const CopilotPromptsLaunchpad: React.FC<CopilotPromptsLaunchpadProps> = ({ onSelectPrompt, user }) => {
  const launchpadItems = [
    {
      icon: <Sparkles className="w-4 h-4 text-emerald-500" />,
      tag: "SAVINGS TIPS",
      title: "Reduce Bill by ₹500/mo",
      desc: "3 instant customized actions for your appliances",
      prompt: "Analyze my current home appliances and give me 3 actionable steps to save ₹500/month on electricity.",
      border: "border-slate-200/50 dark:border-slate-800/40 hover:border-emerald-400/80 hover:shadow-[0_6px_25px_rgba(16,185,129,0.2)]",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/15"
    },
    {
      icon: <Zap className="w-4 h-4 text-amber-500" />,
      tag: "LIGHTING AUDIT",
      title: "LED vs Tube Light Savings",
      desc: "Compare annual running costs of 9W LED vs 40W Tube",
      prompt: "What is the annual cost difference between a 9W LED bulb and a 40W conventional tube light?",
      border: "border-slate-200/50 dark:border-slate-800/40 hover:border-amber-400/80 hover:shadow-[0_6px_25px_rgba(245,158,11,0.2)]",
      bg: "bg-amber-500/10 dark:bg-amber-500/15"
    },
    {
      icon: <Sun className="w-4 h-4 text-orange-500" />,
      tag: "SOLAR ROI",
      title: "Rooftop Solar Payback",
      desc: "Calculate payback timeline for a 3kW solar plant",
      prompt: "Should I install solar panels? What size, cost, and payback period is recommended for a typical Indian home?",
      border: "border-slate-200/50 dark:border-slate-800/40 hover:border-orange-400/80 hover:shadow-[0_6px_25px_rgba(249,115,22,0.2)]",
      bg: "bg-orange-500/10 dark:bg-orange-500/15"
    },
    {
      icon: <Activity className="w-4 h-4 text-cyan-500" />,
      tag: "AC EFFICIENCY",
      title: "Best AC Set Temperature",
      desc: "Find optimal thermostat setting for 1.5 Ton AC",
      prompt: "What temperature setting for a 1.5 Ton Inverter AC gives the best energy savings without sacrificing comfort?",
      border: "border-slate-200/50 dark:border-slate-800/40 hover:border-cyan-400/80 hover:shadow-[0_6px_25px_rgba(6,182,212,0.2)]",
      bg: "bg-cyan-500/10 dark:bg-cyan-500/15"
    }
  ];

  return (
    <div className="px-4 py-2 relative z-10 space-y-3 pb-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
          Recommended Copilot Prompts
        </span>
        <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Click to start
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {launchpadItems.map((item, idx) => (
          <motion.button
            key={idx}
            type="button"
            onClick={() => onSelectPrompt(item.prompt)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 450, damping: 22, delay: idx * 0.04 }}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="p-3 bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl text-left backdrop-blur-lg transition-all cursor-pointer shadow-xs hover:shadow-md group relative overflow-hidden will-change-transform"
          >
            {/* Top Specular Sheen */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent pointer-events-none" />

            <div className="flex items-center justify-between mb-1.5">
              <div className={`p-1.5 rounded-xl ${item.bg} group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">{item.tag}</span>
            </div>
            <h4 className="text-[12px] font-display font-black text-slate-900 dark:text-white leading-tight group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
              {item.title}
            </h4>
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
              {item.desc}
            </p>
          </motion.button>
        ))}
      </div>

      {/* DISCOM Region Pill */}
      <div className="mt-2 flex items-center justify-between px-3.5 py-2 bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 rounded-xl backdrop-blur-lg shadow-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px]">📍</span>
          <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Region: {user?.tariffState ? user.tariffState.toUpperCase() : 'AP DISCOM'}
          </span>
        </div>
        <span className="text-[10px] font-extrabold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20">
          Rate: {user?.customFlatRate ? `₹${user.customFlatRate}/kWh` : '₹7.5/kWh (Slab)'}
        </span>
      </div>
      
      {/* Divider */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent mt-4" />
    </div>
  );
};

export default CopilotPromptsLaunchpad;
