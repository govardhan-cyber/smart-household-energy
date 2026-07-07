import React from "react";
import { Sun, Layers, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

interface SolarSizingGuideProps {
  handleSelectReferenceSize: (targetBill: number, targetSpace: number) => void;
  activeTheme: "light" | "dark";
}

export const SolarSizingGuide: React.FC<SolarSizingGuideProps> = ({
  handleSelectReferenceSize,
  activeTheme
}) => {
  return (
    <motion.div
      whileHover={{ 
        y: -5, 
        scale: 1.006, 
        boxShadow: "0 20px 40px -15px rgba(0,0,0,0.1)" 
      }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className="backdrop-blur-md bg-white/70 dark:bg-slate-950/45 p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800/60 shadow-[0_8px_32px_rgba(0,0,0,0.03)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.2)] relative overflow-hidden"
    >
      {/* Top decorative glow */}
      <div className="absolute -right-16 -top-16 w-36 h-36 blur-3xl opacity-15 rounded-full bg-amber-500 pointer-events-none" />

      {/* Card Header — compact inline */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 16, ease: "linear" }}
            className="p-3 bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 rounded-2xl shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
          >
            <Sun className="w-5 h-5 animate-pulse" />
          </motion.div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-800 dark:text-white uppercase tracking-wider leading-none font-display text-left">
              Rooftop Solar Quick Sizing Reference
            </h3>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1 text-left">
              Standard guidelines · India · 540W modules
            </p>
          </div>
        </div>
        <div className="px-3 py-1.5 bg-amber-50/80 dark:bg-amber-955/30 text-amber-600 dark:text-amber-400 rounded-xl text-[10px] sm:text-xs font-black border border-amber-100/50 dark:border-amber-900/50 uppercase tracking-wider shrink-0 shadow-sm">
          2026 Guidelines
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-150/40 dark:border-slate-800/40 overflow-hidden bg-white/30 dark:bg-slate-950/20 shadow-inner">
        {/* Header Row */}
        <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-slate-50/30 dark:bg-slate-950/30 border-b border-slate-150/20 dark:border-slate-800/20 text-[10px] sm:text-xs font-black text-slate-405 dark:text-slate-500 uppercase tracking-wider text-left">
          <div className="col-span-3">System Size</div>
          <div className="col-span-2">Panels (540W)</div>
          <div className="col-span-2">Space Needed</div>
          <div className="col-span-2">Cost (w/ Subsidy)</div>
          <div className="col-span-3 text-right">25-Yr Savings</div>
        </div>

        {/* Data Rows */}
        {[
          { size: "1 kW",  panels: "~2",  space: "100 sq ft",   cost: "~₹60,000",    savings: "~₹5.3 Lakhs",   dot: "bg-sky-400",     badge: "Standard",    targetBill: 1500,  targetSpace: 100  },
          { size: "2 kW",  panels: "~4",  space: "200 sq ft",   cost: "~₹1.15 Lakh", savings: "~₹10.74 Lakhs", dot: "bg-sky-400",     badge: "Standard",    targetBill: 3000,  targetSpace: 200  },
          { size: "3 kW",  panels: "~6",  space: "300 sq ft",   cost: "~₹1.32 Lakh", savings: "~₹16.11 Lakhs", dot: "bg-amber-400",   badge: "Popular",     targetBill: 4500,  targetSpace: 300  },
          { size: "4 kW",  panels: "~8",  space: "450 sq ft",   cost: "~₹1.77 Lakh", savings: "~₹21.48 Lakhs", dot: "bg-amber-400",   badge: "Medium Home", targetBill: 6000,  targetSpace: 400  },
          { size: "5 kW",  panels: "~10", space: "500 sq ft",   cost: "~₹2.32 Lakh", savings: "~₹33.46 Lakhs", dot: "bg-emerald-400", badge: "Heavy Usage", targetBill: 7500,  targetSpace: 500  },
          { size: "10 kW", panels: "~19", space: "1,000 sq ft", cost: "~₹4.87 Lakh", savings: "~₹66.92 Lakhs", dot: "bg-indigo-400",  badge: "Commercial",  targetBill: 15000, targetSpace: 1000 },
        ].map((row, idx, arr) => (
          <motion.div
            key={idx}
            whileHover={{ 
              backgroundColor: activeTheme === "dark" ? "rgba(245,158,11,0.08)" : "rgba(245,158,11,0.045)", 
              x: 8 
            }}
            transition={{ type: "spring", stiffness: 400, damping: 24 }}
            whileTap={{ scale: 0.995 }}
            onClick={() => handleSelectReferenceSize(row.targetBill, row.targetSpace)}
            className={`grid grid-cols-12 gap-2 px-4 py-3.5 items-center cursor-pointer group/row transition-colors duration-200 text-left ${idx < arr.length - 1 ? "border-b border-slate-150/15 dark:border-slate-800/15" : ""}`}
          >
            {/* 1. Size + badge */}
            <div className="col-span-3 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full shrink-0 ${row.dot} group-hover/row:scale-130 transition-transform duration-250`} />
              <span className="font-bold text-sm text-slate-850 dark:text-slate-100 group-hover/row:text-amber-500 dark:group-hover/row:text-amber-400 tabular-nums transition-colors duration-250">{row.size}</span>
              <span className="hidden sm:inline text-[9px] font-black text-slate-400 dark:text-slate-500 bg-slate-150/40 dark:bg-slate-800/40 px-2 py-0.5 rounded-md tracking-wider uppercase group-hover/row:bg-slate-200 dark:group-hover/row:bg-slate-700 transition-colors duration-250">{row.badge}</span>
            </div>

            {/* 2. Panels */}
            <div className="col-span-2 flex items-center gap-1.5 text-xs font-semibold text-slate-550 dark:text-slate-400 group-hover/row:text-slate-700 dark:group-hover/row:text-slate-300 transition-colors duration-250">
              <Layers className="w-3.5 h-3.5 text-slate-350 dark:text-slate-600 shrink-0 group-hover/row:text-indigo-400 transition-colors duration-250" />
              {row.panels} panels
            </div>

            {/* 3. Space */}
            <div className="col-span-2 text-xs font-semibold text-slate-550 dark:text-slate-400 group-hover/row:text-slate-750 dark:group-hover/row:text-slate-300 transition-colors duration-250">{row.space}</div>

            {/* 4. Cost */}
            <div className="col-span-2 text-xs font-black text-slate-750 dark:text-slate-200 group-hover/row:text-slate-900 dark:group-hover/row:text-white transition-colors duration-250">{row.cost}</div>

            {/* 5. Savings */}
            <div className="col-span-3 flex justify-end">
              <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/10 px-3 py-1.5 rounded-xl group-hover/row:bg-emerald-500 group-hover/row:text-white dark:group-hover/row:text-slate-950 group-hover/row:border-emerald-500 group-hover/row:shadow-md transition-all duration-250">
                {row.savings}
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0 group-hover/row:translate-x-0.5 group-hover/row:-translate-y-0.5 transition-transform duration-250" />
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-[9px] text-slate-455 dark:text-slate-600 leading-relaxed pt-3 text-left">
        *Costs based on SolarSquare starting prices, March 2026. Savings assume 3% annual tariff escalation &amp; 1% degradation. Actual results vary by configuration and local DISCOM policies.
      </div>
    </motion.div>
  );
};
