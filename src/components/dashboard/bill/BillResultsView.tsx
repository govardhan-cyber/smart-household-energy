import React from "react";
import { motion, type Variants } from "framer-motion";
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip
} from "recharts";
import { 
  FileText, User, Hash, Fingerprint, MapPin, Calendar, 
  Sparkles, Leaf, Zap, IndianRupee, Award, TrendingUp, Wind, Coins 
} from "lucide-react";
import type { BillRecord } from "../../../pages/BillAnalyzer";

interface BillResultsViewProps {
  activeBill: BillRecord;
  calcs: {
    co2: number;
    score: number;
    grade: string;
    forecastAmount: number;
    confidence: number;
    pieData: { name: string; value: number }[];
    recommendations: { title: string; desc: string; savings: number; difficulty: string; impact: string }[];
  } | null;
  handleExplainWithAI: () => void;
  PIE_COLORS: string[];
}

const getRecIcon = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes("ac") || t.includes("cool") || t.includes("temp")) return <Wind className="w-4 h-4 text-sky-500" />;
  if (t.includes("fan") || t.includes("bldc") || t.includes("motor")) return <Zap className="w-4 h-4 text-amber-500" />;
  if (t.includes("standby") || t.includes("unplug") || t.includes("phantom") || t.includes("idle")) return <Coins className="w-4 h-4 text-emerald-500" />;
  return <Award className="w-4 h-4 text-indigo-500" />;
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants: Variants = {
  hidden: { y: 15, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 110,
      damping: 15
    }
  }
};

export const BillResultsView: React.FC<BillResultsViewProps> = ({
  activeBill,
  calcs,
  handleExplainWithAI,
  PIE_COLORS
}) => {
  return (
    <>
      {/* ─── DYNAMIC METRICS SECTION ────────────────────────────────────────── */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6 print:grid-cols-2 print:gap-4 print-background-content"
      >
        
        {/* Card 1: Extracted Consumption */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -8, scale: 1.025, transition: { type: "spring", stiffness: 380, damping: 18 } }}
          className="bg-gradient-to-br from-white to-slate-50/30 dark:from-slate-900 dark:to-slate-950/20 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 border-l-4 border-l-primary-blue shadow-sm text-left flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow duration-300"
        >
          <div className="absolute -right-12 -top-12 w-36 h-36 blur-2xl opacity-20 dark:opacity-10 rounded-full pointer-events-none bg-blue-400 dark:bg-blue-600 group-hover:scale-125 transition-transform duration-500" />
          
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
              Extracted Consumption
            </span>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5 text-primary-blue dark:text-blue-400" />
            </div>
          </div>
          
          <div className="mt-4 relative z-10">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-display font-black text-slate-900 dark:text-white leading-none">
                {activeBill.parsedData.unitsConsumed}
              </span>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-555">
                kWh
              </span>
            </div>
            <p className="text-[10px] font-semibold text-slate-505 dark:text-slate-500 mt-2 leading-relaxed uppercase">
              {activeBill.parsedData.billingPeriod || "Monthly period"}
            </p>
          </div>
        </motion.div>

        {/* Card 2: Extracted Bill Amount */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -8, scale: 1.025, transition: { type: "spring", stiffness: 380, damping: 18 } }}
          className="bg-gradient-to-br from-white to-slate-50/30 dark:from-slate-900 dark:to-slate-950/20 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 border-l-4 border-l-amber-500 shadow-sm text-left flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow duration-300"
        >
          <div className="absolute -right-12 -top-12 w-36 h-36 blur-2xl opacity-20 dark:opacity-10 rounded-full pointer-events-none bg-amber-400 dark:bg-amber-600 group-hover:scale-125 transition-transform duration-500" />
          
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider">
              Extracted Bill Amount
            </span>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850 group-hover:scale-110 transition-transform">
              <IndianRupee className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          
          <div className="mt-4 relative z-10">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-display font-black text-amber-600 dark:text-amber-400 leading-none">
                ₹{activeBill.parsedData.totalAmount}
              </span>
            </div>
            <p className="text-[10px] font-semibold text-slate-505 dark:text-slate-500 mt-2 leading-relaxed uppercase">
              Tariff: {activeBill.parsedData.tariffCategory || "Domestic"}
            </p>
          </div>
        </motion.div>

        {/* Card 3: Energy Efficiency Score */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -8, scale: 1.025, transition: { type: "spring", stiffness: 380, damping: 18 } }}
          className="bg-gradient-to-br from-white to-slate-50/30 dark:from-slate-900 dark:to-slate-950/20 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 border-l-4 border-l-primary-green shadow-sm text-left flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow duration-300"
        >
          <div className="absolute -right-12 -top-12 w-36 h-36 blur-2xl opacity-20 dark:opacity-10 rounded-full pointer-events-none bg-emerald-400 dark:bg-emerald-600 group-hover:scale-125 transition-transform duration-500" />
          
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider">
              Energy Efficiency Score
            </span>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850 group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5 text-primary-green dark:text-green-400" />
            </div>
          </div>
          
          <div className="mt-4 relative z-10">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-display font-black text-slate-900 dark:text-white leading-none">
                {calcs?.score}
              </span>
              <span className="text-xs font-bold text-slate-450 dark:text-slate-555">
                /100
              </span>
              {calcs?.grade && (
                <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-primary-green uppercase tracking-wider">
                  {calcs.grade} Grade
                </span>
              )}
            </div>
            <p className="text-[10px] font-semibold text-slate-505 dark:text-slate-500 mt-2 leading-relaxed uppercase">
              BEE Grade Rating
            </p>
          </div>
        </motion.div>

        {/* Card 4: Cost Forecast */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -8, scale: 1.025, transition: { type: "spring", stiffness: 380, damping: 18 } }}
          className="bg-gradient-to-br from-white to-slate-50/30 dark:from-slate-900 dark:to-slate-950/20 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 border-l-4 border-l-cyan-500 shadow-sm text-left flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow duration-300"
        >
          <div className="absolute -right-12 -top-12 w-36 h-36 blur-2xl opacity-20 dark:opacity-10 rounded-full pointer-events-none bg-cyan-400 dark:bg-cyan-600 group-hover:scale-125 transition-transform duration-500" />
          
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider">
              Cost Forecast (Next Month)
            </span>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
          </div>
          <div className="mt-4 relative z-10">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-display font-black text-cyan-600 dark:text-cyan-400 leading-none">
                ₹{calcs?.forecastAmount}
              </span>
            </div>
            <p className="text-[10px] font-semibold text-slate-505 dark:text-slate-500 mt-2 leading-relaxed uppercase">
              Confidence Index: {calcs?.confidence}%
            </p>
          </div>
        </motion.div>

      </motion.div>

      {/* ─── MAIN RESULTS GRID ────────────────────────────────────────────────── */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
      >
        
        {/* Left Column: Bill Summary Metadata (col span 4) */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-4 space-y-6"
        >
          
          {/* Consumer details (Card 1) */}
          <motion.div 
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-white/40 dark:bg-slate-950/20 backdrop-blur-xl border border-white/20 dark:border-slate-800/40 rounded-3xl p-5 shadow-lg dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-xl hover:border-primary-blue/30 dark:hover:border-primary-green/30 transition-all duration-300 relative overflow-hidden group space-y-4"
          >
            <div className="absolute -right-10 -top-10 w-24 h-24 blur-xl opacity-20 dark:opacity-10 rounded-full pointer-events-none bg-primary-blue dark:bg-primary-green group-hover:scale-150 transition-transform duration-500" />
            <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/10 dark:border-slate-800/50 pb-2.5 relative z-10">
              <FileText className="w-4 h-4 text-primary-blue" />
              Consumer Metadata
            </h3>
            
            <div className="space-y-3 text-xs sm:text-sm relative z-10">
              <div className="p-3 rounded-2xl bg-white/20 dark:bg-slate-900/30 border border-white/10 dark:border-white/5 hover:bg-white/35 dark:hover:bg-slate-900/50 transition-colors duration-200 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-primary-blue dark:text-primary-green mt-0.5 shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Consumer Name</span>
                  <p className="font-extrabold text-slate-850 dark:text-slate-250 mt-0.5 truncate">{activeBill.parsedData.consumerName}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-white/20 dark:bg-slate-900/30 border border-white/10 dark:border-white/5 hover:bg-white/35 dark:hover:bg-slate-900/50 transition-colors duration-200 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 dark:text-indigo-400 mt-0.5 shrink-0">
                    <Hash className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest block">Connection No</span>
                    <p className="font-mono font-bold text-slate-850 dark:text-slate-200 mt-0.5 truncate">{activeBill.parsedData.serviceNumber}</p>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-white/20 dark:bg-slate-900/30 border border-white/10 dark:border-white/5 hover:bg-white/35 dark:hover:bg-slate-900/50 transition-colors duration-200 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-955/40 text-purple-500 dark:text-purple-400 mt-0.5 shrink-0">
                    <Fingerprint className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-555 uppercase tracking-widest block">Customer ID</span>
                    <p className="font-mono font-bold text-slate-850 dark:text-slate-200 mt-0.5 truncate">{activeBill.parsedData.customerID}</p>
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-white/20 dark:bg-slate-900/30 border border-white/10 dark:border-white/5 hover:bg-white/35 dark:hover:bg-slate-900/50 transition-colors duration-200 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 dark:text-primary-green mt-0.5 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Billing Address</span>
                  <p className="font-semibold text-slate-705 dark:text-slate-350 mt-0.5 leading-relaxed text-xs">{activeBill.parsedData.address}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bill Details (Card 2) */}
          <motion.div 
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-white/40 dark:bg-slate-950/20 backdrop-blur-xl border border-white/20 dark:border-slate-800/40 rounded-3xl p-5 shadow-lg dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-xl hover:border-amber-500/30 dark:hover:border-amber-400/20 transition-all duration-300 relative overflow-hidden group space-y-4"
          >
            <div className="absolute -right-10 -top-10 w-24 h-24 blur-xl opacity-20 dark:opacity-10 rounded-full pointer-events-none bg-amber-400 dark:bg-amber-600 group-hover:scale-150 transition-transform duration-500" />
            <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/10 dark:border-slate-800/50 pb-2.5 relative z-10">
              <Calendar className="w-4 h-4 text-amber-500" />
              Billing Information
            </h3>
            
            <div className="space-y-3 text-xs sm:text-sm relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-white/20 dark:bg-slate-900/30 border border-white/10 dark:border-white/5 hover:bg-white/35 dark:hover:bg-slate-900/50 transition-colors duration-200">
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Bill Date</span>
                  <p className="font-extrabold text-slate-850 dark:text-slate-250 mt-1">{activeBill.parsedData.billDate}</p>
                </div>
                <div className="p-3 rounded-2xl bg-red-50/20 dark:bg-red-955/15 border border-red-200/20 dark:border-red-900/20 hover:bg-red-50/30 dark:hover:bg-red-955/20 transition-colors duration-200 shadow-sm shadow-red-100/5 dark:shadow-none">
                  <span className="text-[9px] font-bold text-red-500 dark:text-red-400 uppercase tracking-widest block">Due Date</span>
                  <p className="font-extrabold text-red-655 dark:text-red-455 mt-1">{activeBill.parsedData.dueDate}</p>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/20 dark:bg-slate-900/30 border border-white/10 dark:border-white/5 hover:bg-white/35 dark:hover:bg-slate-900/50 transition-colors duration-200">
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-555 uppercase tracking-widest block mb-2">Meter Readings</span>
                <div className="grid grid-cols-2 divide-x divide-slate-150 dark:divide-slate-800 text-xs">
                  <div className="pr-3">
                    <span className="text-[8px] font-bold text-slate-400 uppercase block tracking-wider">Previous</span>
                    <span className="text-sm font-extrabold text-slate-700 dark:text-slate-300 mt-0.5 block">{activeBill.parsedData.previousReading} <span className="text-[9px] text-slate-400 font-semibold font-sans">kWh</span></span>
                  </div>
                  <div className="pl-3">
                    <span className="text-[8px] font-bold text-slate-400 uppercase block tracking-wider">Current</span>
                    <span className="text-sm font-extrabold text-slate-700 dark:text-slate-300 mt-0.5 block">{activeBill.parsedData.currentReading} <span className="text-[9px] text-slate-400 font-semibold font-sans">kWh</span></span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Explain My Bill (Card 3) */}
          <motion.div 
            className="card-client card-client-blue dark:card-client-emerald bg-gradient-to-b from-white/60 to-white/30 dark:from-slate-900/40 dark:to-slate-900/10 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/60 rounded-3xl p-5 shadow-lg dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative overflow-hidden group space-y-4"
          >
            <div className="absolute -right-12 -top-12 w-28 h-28 blur-2xl opacity-20 dark:opacity-10 rounded-full pointer-events-none bg-blue-500 dark:bg-emerald-500 group-hover:scale-150 transition-transform duration-700" />
            <div className="absolute -left-12 -bottom-12 w-28 h-28 blur-2xl opacity-10 dark:opacity-5 rounded-full pointer-events-none bg-emerald-500 dark:bg-cyan-500 group-hover:scale-150 transition-transform duration-700" />
            
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000 ease-out pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
              <h3 className="flex items-center gap-1.5 text-[10px] font-black text-slate-855 dark:text-white uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5 text-primary-blue dark:text-primary-green animate-pulse" />
                Explain My Bill
              </h3>
              <span className="text-[9px] font-black text-primary-blue dark:text-primary-green border border-blue-500/20 dark:border-emerald-500/20 bg-blue-500/10 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-widest shadow-sm">
                AI Intelligence
              </span>
            </div>

            <div className="space-y-1 relative z-10 text-left">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                Get a complete, natural language breakdown of fixed tariffs, variable slab changes, and taxes inside this bill scan.
              </p>
            </div>

            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExplainWithAI}
              className="w-full flex items-center justify-center gap-1.5 py-3 px-4 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 dark:from-emerald-500 dark:via-emerald-600 dark:to-teal-600 dark:text-slate-950 shadow-md shadow-blue-500/20 dark:shadow-emerald-500/10 hover:shadow-lg hover:shadow-blue-500/25 dark:hover:shadow-emerald-500/15 cursor-pointer transition-all relative z-10 border border-blue-400/20 dark:border-emerald-400/20"
            >
              <Sparkles className="w-3.5 h-3.5 animate-spin-slow" style={{ animationDuration: "8s" }} />
              Explain with AI
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Right Column: Visuals & Recommendations (col span 8) */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Cost breakdown Pie Chart (Card 4) */}
            <motion.div 
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-white/40 dark:bg-slate-955/20 backdrop-blur-xl border border-white/20 dark:border-slate-800/40 rounded-3xl p-5 shadow-lg dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-xl hover:border-slate-350 dark:hover:border-slate-750 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between"
            >
              <div className="absolute -right-10 -top-10 w-24 h-24 blur-xl opacity-15 dark:opacity-5 rounded-full pointer-events-none bg-blue-500 dark:bg-emerald-500 group-hover:scale-150 transition-transform duration-500" />
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 relative z-10">
                Charge Structure Breakdown
              </h4>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2 relative z-10">
                <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart role="img" aria-label="Donut chart showing electricity bill charge structure breakdown">
                      <Pie
                        data={calcs?.pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={48}
                        outerRadius={64}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {calcs?.pieData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} className="focus:outline-none" />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${value}`} />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Screen Reader Table Fallback */}
                  <div className="sr-only">
                    <table>
                      <caption>Electricity Bill Charge Structure Breakdown</caption>
                      <thead>
                        <tr>
                          <th scope="col">Category</th>
                          <th scope="col">Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {calcs?.pieData.map((d, i) => (
                          <tr key={i}>
                            <th scope="row">{d.name}</th>
                            <td>₹{d.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[8px] font-bold text-slate-455 dark:text-slate-550 uppercase tracking-widest leading-none">Total Bill</span>
                    <span className="text-base font-extrabold text-slate-800 dark:text-white mt-1">₹{activeBill.parsedData.totalAmount}</span>
                  </div>
                </div>

                {/* Legend Items */}
                <div className="flex-1 w-full space-y-2">
                  {calcs?.pieData.map((d, i) => {
                    const total = calcs.pieData.reduce((acc, curr) => acc + curr.value, 0) || 1;
                    const pct = ((d.value / total) * 100).toFixed(1);
                    return (
                      <motion.div 
                        key={i}
                        whileHover={{ x: 4 }}
                        className="flex items-center justify-between p-2 rounded-xl bg-white/20 dark:bg-slate-900/30 border border-white/10 dark:border-white/5 hover:bg-white/40 dark:hover:bg-slate-900/50 transition-all duration-205"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse" style={{ backgroundColor: PIE_COLORS[i] }} />
                          <span className="text-[10px] font-bold text-slate-650 dark:text-slate-400 truncate">{d.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-[10px] text-right shrink-0">
                          <span className="font-extrabold text-slate-850 dark:text-white">₹{d.value}</span>
                          <span className="text-[9px] text-slate-450 dark:text-slate-500 font-bold">({pct}%)</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Carbon Footprint Gauge (Card 5) */}
            <motion.div 
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-white/40 dark:bg-slate-950/20 backdrop-blur-xl border border-white/20 dark:border-slate-800/40 rounded-3xl p-5 shadow-lg dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-xl hover:border-emerald-500/30 dark:hover:border-emerald-450/20 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between"
            >
              <div className="absolute -right-10 -top-10 w-24 h-24 blur-xl opacity-15 dark:opacity-5 rounded-full pointer-events-none bg-emerald-500 dark:bg-teal-500 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                  <Leaf className="w-4 h-4 text-emerald-500" />
                  Carbon Footprint
                </h4>
                <p className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">CO₂ Emission Index</p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 mt-3 relative z-10">
                {/* Circular Gauge */}
                <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <defs>
                      <linearGradient id="carbonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>
                    <circle cx="48" cy="48" r="40" className="stroke-slate-100 dark:stroke-slate-800 fill-none" strokeWidth="5.5" />
                    <motion.circle 
                      cx="48" 
                      cy="48" 
                      r="40" 
                      className="fill-none" 
                      stroke="url(#carbonGradient)"
                      strokeWidth="5.5" 
                      strokeDasharray={251.2}
                      initial={{ strokeDashoffset: 251.2 }}
                      animate={{ strokeDashoffset: 251.2 - (251.2 * Math.min(100, (calcs?.co2 || 0) / 400 * 100)) / 100 }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      strokeLinecap="round"
                      filter="url(#glow)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="text-[8px] text-slate-450 dark:text-slate-555 font-bold uppercase tracking-widest leading-none">Emission</span>
                    <span className="text-sm font-extrabold text-slate-850 dark:text-white mt-1 leading-none">
                      {Math.round(calcs?.co2 || 0)}
                    </span>
                    <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-1 leading-none">kg CO₂</span>
                  </div>
                </div>
                
                {/* Metrics & Environmental Impact Card */}
                <div className="flex-1 w-full space-y-2.5">
                  <div className="grid grid-cols-2 gap-2 text-left">
                    <div className="p-2.5 rounded-2xl bg-white/20 dark:bg-slate-900/30 border border-white/10 dark:border-white/5 hover:bg-white/40 dark:hover:bg-slate-900/50 transition-colors duration-200">
                      <span className="text-[8px] font-bold text-slate-400 dark:text-slate-555 uppercase block tracking-widest">UNITS</span>
                      <span className="text-[10px] font-mono font-bold text-slate-800 dark:text-white mt-0.5 block">{activeBill.parsedData.unitsConsumed} <span className="text-[8px] text-slate-400 font-bold font-sans">kWh</span></span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-white/20 dark:bg-slate-900/30 border border-white/10 dark:border-white/5 hover:bg-white/40 dark:hover:bg-slate-900/50 transition-colors duration-200">
                      <span className="text-[8px] font-bold text-slate-400 dark:text-slate-555 uppercase block tracking-widest">FACTOR</span>
                      <span className="text-[10px] font-mono font-bold text-slate-800 dark:text-white mt-0.5 block">0.82 <span className="text-[8px] text-slate-400 font-bold font-sans">kg/kWh</span></span>
                    </div>
                  </div>

                  {/* Tree offset block */}
                  <div className="p-2.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-955/10 dark:to-teal-955/10 border border-emerald-100/20 dark:border-emerald-900/25 rounded-2xl flex gap-2.5 items-center text-left">
                    <div className="p-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 dark:text-primary-green shrink-0 animate-pulse">
                      <Leaf className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-[9.5px] leading-normal font-semibold text-slate-655 dark:text-slate-350">
                      Offset needs <span className="font-extrabold text-emerald-600 dark:text-primary-green text-xs">{Math.round((calcs?.co2 || 0) / 1.83)} trees</span>/mo.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* AI Insights list (Card 6) */}
          <motion.div 
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-white/40 dark:bg-slate-950/20 backdrop-blur-xl border border-white/20 dark:border-slate-800/40 rounded-3xl p-5 shadow-lg dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-xl hover:border-slate-350 dark:hover:border-slate-750 transition-all duration-300 text-left space-y-4 relative overflow-hidden group"
          >
            <div className="absolute -right-10 -top-10 w-24 h-24 blur-xl opacity-15 dark:opacity-5 rounded-full pointer-events-none bg-emerald-500 dark:bg-teal-500 group-hover:scale-150 transition-transform duration-500" />
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/10 dark:border-slate-800/50 pb-2.5 relative z-10">
              <Sparkles className="w-4 h-4 text-primary-green animate-pulse" />
              AI Energy Insights
            </h4>
            
            <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-semibold relative z-10">
              {activeBill.parsedData.energyInsights.map((insight, idx) => (
                <motion.li 
                  key={idx} 
                  whileHover={{ x: 3 }}
                  className="flex gap-3.5 items-start p-2 rounded-2xl bg-white/20 dark:bg-slate-900/30 border border-white/10 dark:border-white/5 hover:bg-white/35 dark:hover:bg-slate-900/50 hover:border-white/30 dark:hover:border-slate-800 transition-all duration-200"
                >
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white text-[10px] font-black shrink-0 mt-0.5 shadow-md shadow-emerald-500/20">
                    0{idx + 1}
                  </span>
                  <p className="leading-relaxed font-normal text-slate-655 dark:text-slate-300 pt-0.5">{insight}</p>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Recommendations savings cards (Card 7) */}
          <motion.div 
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-white/40 dark:bg-slate-955/20 backdrop-blur-xl border border-white/20 dark:border-slate-800/40 rounded-3xl p-5 shadow-lg dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-xl hover:border-slate-350 dark:hover:border-slate-750 transition-all duration-300 text-left space-y-4 relative overflow-hidden group print:border-slate-300 print:shadow-none"
          >
            <div className="absolute -right-10 -top-10 w-24 h-24 blur-xl opacity-15 dark:opacity-5 rounded-full pointer-events-none bg-amber-400 dark:bg-indigo-500 group-hover:scale-150 transition-transform duration-500" />
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 relative z-10">
              <Award className="w-4 h-4 text-amber-500" />
              Personalized Energy Saving Recommendations
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10 print:grid-cols-3 print:gap-3">
              {calcs?.recommendations.map((rec, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ y: -6, boxShadow: "0 10px 20px -5px rgba(0, 0, 0, 0.05), 0 8px 16px -6px rgba(0, 0, 0, 0.05)" }}
                  className="p-4 bg-white/20 dark:bg-slate-900/30 backdrop-blur-md rounded-2xl border border-white/10 dark:border-white/5 flex flex-col justify-between gap-3.5 text-xs hover:border-primary-blue/20 dark:hover:border-primary-green/20 transition-all duration-300"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 shadow-sm shrink-0">
                        {getRecIcon(rec.title)}
                      </div>
                      <h5 className="font-extrabold text-slate-850 dark:text-white text-xs sm:text-[13px] leading-snug">{rec.title}</h5>
                    </div>
                    <p className="text-[10.5px] sm:text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">{rec.desc}</p>
                  </div>
                  <div className="flex justify-between items-center border-t border-white/10 dark:border-slate-800/80 pt-2.5 mt-1">
                    <span className="text-[9px] text-slate-450 dark:text-slate-550 font-extrabold uppercase tracking-widest">Savings</span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-primary-green font-mono font-extrabold text-[11px] sm:text-xs shadow-sm">
                      ₹{rec.savings}/mo
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>
      </motion.div>
    </>
  );
};
