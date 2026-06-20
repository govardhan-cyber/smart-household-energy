import React from "react";
import { Link } from "react-router-dom";
import { Settings, ArrowRight, ShieldCheck, Leaf, TrendingUp, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

export const Home: React.FC = () => {
  const { user } = useAuth();

  // Custom SVGs matching the screenshot precisely
  const ACIcon = () => (
    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <rect x={3} y={6} width={18} height={10} rx={2} />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 16v2M10 16v2M14 16v2M18 16v2M7 11h10" />
    </svg>
  );

  const FridgeIcon = () => (
    <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <rect x={5} y={3} width={14} height={18} rx={2} />
      <line x1={5} y1={10} x2={19} y2={10} strokeWidth={2.5} />
      <line x1={9} y1={6} x2={9} y2={8} strokeWidth={2.5} />
      <line x1={9} y1={13} x2={9} y2={16} strokeWidth={2.5} />
    </svg>
  );

  const FanIcon = () => (
    <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <circle cx={12} cy={12} r={3} />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9c-2-2-5-1-5 2s2 5 5 2M12 15c2 2 5 1 5-2s-2-5-5-2M9 12c-2 2-1 5 2 5s5-2 2-5M15 12c2-2 1-5-2-5s-5 2-2 5" />
    </svg>
  );

  const MiniChartSVG = () => (
    <svg className="w-20 h-8 text-emerald-500 shrink-0" viewBox="0 0 100 30" fill="none">
      <defs>
        <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0 25 Q15 5, 30 15 T60 10 T90 5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M0 25 Q15 5, 30 15 T60 10 T90 5 L90 30 L0 30 Z"
        fill="url(#chart-grad)"
      />
      <circle cx="90" cy="5" r="2.5" fill="currentColor" />
    </svg>
  );

  const HouseBackgroundSVG = () => (
    <svg className="w-full h-full text-slate-200/90 dark:text-slate-800/40" viewBox="0 0 200 200" fill="none">
      {/* Sun */}
      <circle cx="160" cy="50" r="10" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
      {/* Sun Rays */}
      <path d="M 160 30 L 160 36 M 160 64 L 160 70 M 140 50 L 146 50 M 174 50 L 180 50" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M 146 36 L 150 40 M 170 60 L 174 64 M 146 64 L 150 60 M 170 40 L 174 36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      
      {/* Dotted paths connecting sun to solar roof */}
      <path d="M 150 58 Q 120 70 95 100" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 3" />
      <path d="M 155 60 Q 135 85 115 108" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 3" />
      
      {/* Curved dotted line going left */}
      <path d="M 150 45 Q 90 20 50 60" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 3" />

      {/* House outline */}
      {/* Front Wall */}
      <path d="M 50 150 L 50 115 L 85 90 L 120 115 L 120 150 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      {/* Side Wall (Isometric projection) */}
      <path d="M 120 115 L 165 95 L 165 130 L 120 150" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      {/* Main Roof */}
      <path d="M 85 90 L 130 70 L 165 95 L 120 115 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="currentColor" fillOpacity="0.03" />
      {/* Front Gable Roof Edge */}
      <path d="M 50 115 L 85 90 L 120 115" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      
      {/* Door */}
      <rect x="75" y="125" width="18" height="25" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      {/* Window front */}
      <rect x="58" y="123" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      {/* Window side */}
      <path d="M 135 118 L 150 111 L 150 121 L 135 128 Z" stroke="currentColor" strokeWidth="1.5" />

      {/* Solar Panel array on main roof */}
      <path d="M 98 87 L 125 75 L 148 92 L 121 104 Z" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.1" />
      {/* Panel grid lines */}
      <line x1="111.5" y1="81" x2="134.5" y2="98" stroke="currentColor" strokeWidth="1" />
      <line x1="109.5" y1="92" x2="136.5" y2="80" stroke="currentColor" strokeWidth="0.8" />
    </svg>
  );

  const LeftLeavesSVG = () => (
    <svg className="absolute left-0 top-[28%] w-[120px] h-[280px] pointer-events-none -z-10" viewBox="0 0 100 200" fill="none">
      {/* Stem */}
      <path d="M -5 180 C 15 160 30 130 20 80" stroke="#10b981" strokeWidth="2.5" strokeOpacity="0.15" strokeLinecap="round" />
      {/* Leaves with green gradients/opacity */}
      {/* Leaf 1 */}
      <path d="M 5 155 C 15 138 35 138 40 152 C 28 164 12 164 5 155 Z" fill="#10b981" fillOpacity="0.3" stroke="#10b981" strokeWidth="1" strokeOpacity="0.4" />
      {/* Leaf 2 */}
      <path d="M 18 130 C 30 112 48 116 48 130 C 35 144 22 139 18 130 Z" fill="#059669" fillOpacity="0.35" stroke="#059669" strokeWidth="1" strokeOpacity="0.4" />
      {/* Leaf 3 */}
      <path d="M 23 105 C 33 87 50 92 50 105 C 37 120 28 115 23 105 Z" fill="#047857" fillOpacity="0.25" stroke="#047857" strokeWidth="1" strokeOpacity="0.3" />
      {/* Leaf 4 */}
      <path d="M 20 80 C 25 65 38 67 40 76 C 33 85 24 85 20 80 Z" fill="#34d399" fillOpacity="0.4" stroke="#10b981" strokeWidth="1" strokeOpacity="0.4" />
    </svg>
  );

  return (
    <div className="flex-1 bg-[#070b15] text-slate-100 relative overflow-hidden flex flex-col justify-between py-12 lg:py-16">
      {/* Decorative Glow Blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none -z-10"></div>
      <div className="absolute top-40 right-10 w-96 h-96 rounded-full bg-blue-500/5 blur-[120px] pointer-events-none -z-10"></div>
      
      {/* Left Leaf decoration */}
      <LeftLeavesSVG />

      {/* House outline decoration absolute background placement (centered overlay) */}
      <div className="absolute right-[33%] top-[12%] lg:top-[8%] w-[380px] h-[380px] pointer-events-none -z-10 hidden lg:block opacity-60">
        <HouseBackgroundSVG />
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col justify-center gap-12 lg:gap-16">
        
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6 text-left relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-950/20 border border-emerald-900/40 text-xs font-semibold text-emerald-400"
            >
              <Settings className="w-3.5 h-3.5" />
              Built for AP DISCOM tariffs
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-[54px] font-display font-extrabold text-white tracking-tight leading-[1.1]"
            >
              See where your <span className="text-blue-450">energy</span> goes — then <span className="text-emerald-400">cut the next bill.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-sm sm:text-base text-slate-400 max-w-xl leading-relaxed font-medium"
            >
              Pick appliances, adjust usage, and get an instant monthly estimate with slab-aware billing and practical savings tips for your home.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2"
            >
              <Link
                to={user ? "/dashboard" : "/register"}
                className="px-6 py-3.5 flex items-center justify-center gap-2 text-sm font-bold text-slate-950 bg-[#10b981] hover:bg-[#059669] rounded-xl transition-all shadow-lg shadow-emerald-500/10 cursor-pointer"
              >
                <span>Create free account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to={user ? "/dashboard" : "/login"}
                className="px-6 py-3.5 flex items-center justify-center text-sm font-bold text-slate-300 bg-slate-900/50 hover:bg-slate-800/60 rounded-xl border border-slate-800 transition-colors cursor-pointer"
              >
                I already have one
              </Link>
            </motion.div>

            {/* Social Proof Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex items-center gap-3 pt-6 border-t border-slate-800/60 w-fit"
            >
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full bg-emerald-500 text-[10px] font-bold text-white flex items-center justify-center border border-slate-950 shadow-sm uppercase">AP</div>
                <div className="w-7 h-7 rounded-full bg-blue-600 text-[10px] font-bold text-white flex items-center justify-center border border-slate-950 shadow-sm">GV</div>
                <div className="w-7 h-7 rounded-full bg-sky-500 text-[10px] font-bold text-white flex items-center justify-center border border-slate-950 shadow-sm">KR</div>
                <div className="w-7 h-7 rounded-full bg-slate-800 text-[9px] font-bold text-slate-400 flex items-center justify-center border border-slate-950 shadow-sm">+2k</div>
              </div>
              <div className="text-xs text-slate-400 font-medium">
                <span>Trusted by </span>
                <span className="font-bold text-white">2,000+ households</span>
                <span className="block mt-0.5">in Andhra Pradesh</span>
              </div>
            </motion.div>
          </div>

          {/* Hero Right Visual Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-5 relative flex items-center justify-center"
          >
            {/* Visual Dashboard Mockup Card */}
            <div className="w-full max-w-[420px] bg-[#0b101f] border border-slate-800/80 rounded-[2.2rem] p-6 shadow-2xl flex flex-col gap-5 text-left relative z-10">
              
              {/* Header metrics info */}
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    THIS MONTH
                  </span>
                  <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                    Estimated Monthly Bill
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-[10px] font-extrabold text-emerald-400 border border-emerald-500/20 shrink-0">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  18% lower
                </span>
              </div>

              {/* Estimated values */}
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Estimated bill
                  </span>
                  <span className="text-5xl font-extrabold text-white tracking-tight block">
                    ₹459
                  </span>
                  <span className="text-xs font-semibold text-slate-400 block pt-0.5">
                    132 kWh projected usage
                  </span>
                </div>
                <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                  <MiniChartSVG />
                </div>
              </div>

              {/* Progress bars list */}
              <div className="space-y-4 pt-1">
                {/* AC cooling */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-955/20 flex items-center justify-center shrink-0">
                    <ACIcon />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs font-bold text-slate-200">AC cooling</span>
                      <span className="text-[11px] font-semibold text-red-400 font-mono">72 kWh</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full w-[70%]" />
                    </div>
                  </div>
                </div>

                {/* Fridge */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-955/20 flex items-center justify-center shrink-0">
                    <FridgeIcon />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs font-bold text-slate-200">Fridge</span>
                      <span className="text-[11px] font-semibold text-orange-400 font-mono">36 kWh</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full w-[45%]" />
                    </div>
                  </div>
                </div>

                {/* Fans & lights */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-950/20 flex items-center justify-center shrink-0">
                    <FanIcon />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs font-bold text-slate-200">Fans & lights</span>
                      <span className="text-[11px] font-semibold text-emerald-400 font-mono">24 kWh</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-[25%]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Best next action */}
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 flex items-start gap-3 mt-1 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Leaf className="w-4 h-4" />
                </div>
                <div className="space-y-0.5 text-xs text-left">
                  <h4 className="font-extrabold text-white">Best next action</h4>
                  <p className="text-slate-400 leading-relaxed font-semibold">
                    Shift AC runtime by one hour and set cooling to 26 C to reduce peak usage.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Large Stats Impact Banner */}
        <div className="py-8 px-6 bg-[#0b101f] border border-slate-800/80 rounded-3xl shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 blur-2xl bg-emerald-500/5 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 blur-2xl bg-blue-500/5 pointer-events-none" />
          
          {/* Stat 1 */}
          <div className="space-y-1 relative z-10 md:border-r border-slate-800/80 last:border-0 pb-4 md:pb-0 border-b md:border-b-0">
            <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono tracking-tight block">
              12,000+
            </span>
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              Households Analyzed
            </span>
            <span className="text-[11px] text-slate-450 block font-medium">
              across AP, TS, & KA
            </span>
          </div>

          {/* Stat 2 */}
          <div className="space-y-1 relative z-10 md:border-r border-slate-800/80 last:border-0 pb-4 md:pb-0 border-b md:border-b-0">
            <span className="text-3xl sm:text-4xl font-extrabold text-blue-400 font-mono tracking-tight block">
              ₹5.2 Lakh+
            </span>
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              Estimated Savings
            </span>
            <span className="text-[11px] text-slate-450 block font-medium">
              from slab optimization
            </span>
          </div>

          {/* Stat 3 */}
          <div className="space-y-1 relative z-10">
            <span className="text-3xl sm:text-4xl font-extrabold text-sky-400 font-mono tracking-tight block">
              98.7%
            </span>
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              Billing Accuracy Claim
            </span>
            <span className="text-[11px] text-slate-450 block font-medium">
              verified against actual DISCOM bills
            </span>
          </div>
        </div>

        {/* Bottom Feature Quick Actions Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-slate-800/60">
          
          {/* Card 1: Insights */}
          <Link
            to={user ? "/dashboard" : "/register"}
            className="p-4 sm:p-5 flex items-center gap-4 bg-emerald-950/10 border border-emerald-900/20 rounded-2xl hover:bg-emerald-950/20 transition-all duration-300 text-left group cursor-pointer relative overflow-hidden"
          >
            <div className="absolute -right-12 -top-12 w-36 h-36 blur-2xl opacity-15 rounded-full pointer-events-none bg-emerald-400 group-hover:scale-125 transition-transform duration-500" />
            <div className="w-12 h-12 rounded-xl bg-emerald-950/30 border border-emerald-900/30 text-emerald-400 flex items-center justify-center shrink-0 relative z-10">
              <Leaf className="w-5.5 h-5.5" />
            </div>
            <div className="flex-1 min-w-0 relative z-10">
              <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                Personalized Insights
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium leading-snug">
                Get AI-powered tips for your home.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-500 shrink-0 group-hover:translate-x-1 transition-transform relative z-10" />
          </Link>

          {/* Card 2: Estimation */}
          <Link
            to={user ? "/analyzer" : "/register"}
            className="p-4 sm:p-5 flex items-center gap-4 bg-blue-950/10 border border-blue-900/20 rounded-2xl hover:bg-blue-950/20 transition-all duration-300 text-left group cursor-pointer relative overflow-hidden"
          >
            <div className="absolute -right-12 -top-12 w-36 h-36 blur-2xl opacity-15 rounded-full pointer-events-none bg-blue-400 group-hover:scale-125 transition-transform duration-500" />
            <div className="w-12 h-12 rounded-xl bg-blue-955/30 border border-blue-900/30 text-blue-400 flex items-center justify-center shrink-0 relative z-10">
              <TrendingUp className="w-5.5 h-5.5" />
            </div>
            <div className="flex-1 min-w-0 relative z-10">
              <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                Accurate Estimation
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium leading-snug">
                Slab-accurate billing as per AP DISCOM.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-blue-500 shrink-0 group-hover:translate-x-1 transition-transform relative z-10" />
          </Link>

          {/* Card 3: Secure */}
          <Link
            to={user ? "/profile" : "/register"}
            className="p-4 sm:p-5 flex items-center gap-4 bg-purple-950/10 border border-purple-900/20 rounded-2xl hover:bg-purple-950/20 transition-all duration-300 text-left group cursor-pointer relative overflow-hidden"
          >
            <div className="absolute -right-12 -top-12 w-36 h-36 blur-2xl opacity-15 rounded-full pointer-events-none bg-teal-400 group-hover:scale-125 transition-transform duration-500" />
            <div className="w-12 h-12 rounded-xl bg-purple-950/30 border border-purple-900/30 text-purple-400 flex items-center justify-center shrink-0 relative z-10">
              <ShieldCheck className="w-5.5 h-5.5" />
            </div>
            <div className="flex-1 min-w-0 relative z-10">
              <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                Secure & Private
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium leading-snug">
                Your data is encrypted and safe with us.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-purple-500 shrink-0 group-hover:translate-x-1 transition-transform relative z-10" />
          </Link>

          {/* Card 4: Solar */}
          <Link
            to={user ? "/dashboard" : "/register"}
            className="p-4 sm:p-5 flex items-center gap-4 bg-amber-955/10 border border-amber-900/20 rounded-2xl hover:bg-amber-955/20 transition-all duration-300 text-left group cursor-pointer relative overflow-hidden"
          >
            <div className="absolute -right-12 -top-12 w-36 h-36 blur-2xl opacity-15 rounded-full pointer-events-none bg-orange-400 group-hover:scale-125 transition-transform duration-500" />
            <div className="w-12 h-12 rounded-xl bg-amber-955/30 border border-amber-900/30 text-amber-500 flex items-center justify-center shrink-0 relative z-10">
              <Sun className="w-5.5 h-5.5" />
            </div>
            <div className="flex-1 min-w-0 relative z-10">
              <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-550 transition-colors">
                Solar Ready
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium leading-snug">
                Analyze potential savings with solar energy.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-500 shrink-0 group-hover:translate-x-1 transition-transform relative z-10" />
          </Link>

        </div>

        {/* Redesigned CTA Banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-[#0B0F19] to-slate-950 border border-slate-900 rounded-3xl p-8 sm:p-12 text-center shadow-xl space-y-6 group">
          {/* Radial Glows */}
          <div className="absolute -left-12 -top-12 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
          <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="flex flex-col items-center space-y-4 relative z-10">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Take Control
            </div>

            {/* Heading */}
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight max-w-2xl leading-tight">
              Start optimizing your <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">home energy bills</span> today.
            </h2>

            {/* Description */}
            <p className="text-sm text-slate-400 max-w-md font-medium leading-relaxed">
              Join thousands of households across AP and TS analyzing their consumption, optimizing slabs, and planning solar upgrades.
            </p>

            {/* Action button */}
            <div className="pt-4">
              <Link
                to={user ? "/dashboard" : "/register"}
                className="px-8 py-4 inline-flex items-center gap-2.5 text-base font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 rounded-2xl shadow-lg shadow-emerald-400/10 hover:scale-[1.03] transition-all cursor-pointer"
              >
                <span>Start now</span>
                <ArrowRight className="w-5 h-5 text-slate-950" />
              </Link>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
