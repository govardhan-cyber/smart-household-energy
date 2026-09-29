import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Zap, ExternalLink, FileText, Layout, History, HelpCircle,
  ShieldCheck, Lock, Cpu, Leaf, Globe, ArrowRight, IndianRupee, Sparkles, MessageSquare
} from "lucide-react";
import { ReportIssueModal } from "./ReportIssueModal";

// Count-up helper component for stats
const AnimatedStat: React.FC<{
  target: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}> = ({ target, duration = 1500, suffix = "", prefix = "", decimals = 0 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentVal = progress * target;
      setCount(currentVal);
      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };
    animationFrameId = window.requestAnimationFrame(step);

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [target, duration]);

  const formatted = count.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};

export const Footer: React.FC = () => {
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [supportInitialType, setSupportInitialType] = useState<string>("Bug Report");

  const handleLinkClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenSupportModal = (type: string) => {
    setSupportInitialType(type);
    setIsSupportOpen(true);
  };

  return (
    <>
      <footer className="relative w-full bg-white/40 dark:bg-slate-950/40 backdrop-blur-lg border-t border-slate-200/50 dark:border-slate-800/65 transition-colors duration-300 mt-auto overflow-hidden">
      {/* Specular Reflective Gloss Sheen top highlight */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
      
      {/* Ambient background glows */}
      <div className="absolute -left-20 -bottom-20 w-64 h-64 blur-3xl opacity-10 dark:opacity-5 rounded-full bg-blue-500 pointer-events-none" />
      <div className="absolute -right-20 -bottom-20 w-64 h-64 blur-3xl opacity-10 dark:opacity-5 rounded-full bg-emerald-500 pointer-events-none" />

      {/* SECTION 1: Full-Width Final CTA */}
      <div className="w-full relative py-16 md:py-20 overflow-hidden border-b border-slate-200/50 dark:border-slate-800/60 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white">
        {/* Grid mesh overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0c_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0c_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        {/* Radial gradient glow lights */}
        <div className="absolute -left-10 -top-10 w-96 h-96 bg-cyan-400 rounded-full blur-3xl opacity-30 pointer-events-none animate-pulse duration-4000" />
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-30 pointer-events-none animate-pulse duration-6000" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-5">
          <h3 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight max-w-3xl mx-auto leading-tight drop-shadow-sm">
            Ready to Take Control of Your Energy Costs?
          </h3>
          <p className="text-sm sm:text-base text-blue-50/90 max-w-xl mx-auto leading-relaxed">
            Join smart households in Andhra Pradesh modeling consumption slabs, predicting billing structures, and saving up to 60% on grid power.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
            <Link 
              to="/dashboard" 
              onClick={handleLinkClick}
              className="w-full sm:w-auto px-7 py-3 bg-white text-blue-600 hover:text-blue-700 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 text-center flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Calculate Energy Savings</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link 
              to="/history" 
              onClick={handleLinkClick}
              className="w-full sm:w-auto px-7 py-3 bg-blue-700/40 hover:bg-blue-700/60 text-white font-bold rounded-xl border border-white/20 hover:border-white/40 backdrop-blur-sm transition-all duration-300 transform hover:-translate-y-0.5 text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>View Audit History</span>
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION 2: Animated Stats Bridge Cards */}
      <div className="hidden sm:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Stat 1: Homes Audited */}
          <div className="relative overflow-hidden bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-md dark:shadow-2xl hover:shadow-[0_0_25px_rgba(59,130,246,0.15)] dark:hover:shadow-[0_0_35px_rgba(59,130,246,0.25)] hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all duration-300 hover:-translate-y-1 group">
            {/* Glow background highlight */}
            <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="flex items-center justify-between mb-1.5 relative z-10">
              <span className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-550 uppercase">
                Homes Audited
              </span>
              <Globe className="w-4 h-4 text-blue-500 dark:text-cyan-400 animate-[spin_12s_linear_infinite] group-hover:animate-[spin_3s_linear_infinite]" />
            </div>
            <div className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white relative z-10">
              <AnimatedStat target={12450} suffix="+" />
            </div>
            <p className="text-xs text-slate-550 dark:text-slate-400 mt-0.5 leading-relaxed font-medium relative z-10">
              Residential audits in Andhra Pradesh
            </p>
          </div>

          {/* Stat 2: Prediction Accuracy */}
          <div className="relative overflow-hidden bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-md dark:shadow-2xl hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] dark:hover:shadow-[0_0_35px_rgba(16,185,129,0.25)] hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-1 group">
            {/* Glow background highlight */}
            <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="flex items-center justify-between mb-1.5 relative z-10">
              <span className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-555 uppercase">
                AI Accuracy
              </span>
              <Cpu className="w-4 h-4 text-emerald-500 dark:text-emerald-400 animate-pulse duration-2000 group-hover:scale-110 group-hover:rotate-6 transition-all" />
            </div>
            <div className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white relative z-10">
              <AnimatedStat target={99.4} suffix="%" decimals={1} />
            </div>
            <p className="text-xs text-slate-555 dark:text-slate-400 mt-0.5 leading-relaxed font-medium relative z-10">
              Tariff slab matching confidence
            </p>
          </div>

          {/* Stat 3: kWh Analysed */}
          <div className="relative overflow-hidden bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-md dark:shadow-2xl hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] dark:hover:shadow-[0_0_35px_rgba(6,182,212,0.25)] hover:border-cyan-500/40 dark:hover:border-cyan-500/40 transition-all duration-300 hover:-translate-y-1 group">
            {/* Glow background highlight */}
            <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-cyan-500/10 dark:bg-cyan-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="flex items-center justify-between mb-1.5 relative z-10">
              <span className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-555 uppercase">
                kWh Analysed
              </span>
              <Zap className="w-4 h-4 text-cyan-500 dark:text-cyan-400 group-hover:animate-bounce group-hover:scale-110 transition-all" />
            </div>
            <div className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white relative z-10">
              <AnimatedStat target={4.8} suffix="M+" decimals={1} />
            </div>
            <p className="text-xs text-slate-555 dark:text-slate-400 mt-0.5 leading-relaxed font-medium relative z-10">
              Grid consumption logs processed
            </p>
          </div>

          {/* Stat 4: Costs Predicted */}
          <div className="relative overflow-hidden bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-md dark:shadow-2xl hover:shadow-[0_0_25px_rgba(245,158,11,0.15)] dark:hover:shadow-[0_0_35px_rgba(245,158,11,0.25)] hover:border-amber-500/40 dark:hover:border-amber-500/40 transition-all duration-300 hover:-translate-y-1 group">
            {/* Glow background highlight */}
            <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-amber-500/10 dark:bg-amber-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="flex items-center justify-between mb-1.5 relative z-10">
              <span className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-555 uppercase">
                Costs Predicted
              </span>
              <IndianRupee className="w-4 h-4 text-amber-500 dark:text-amber-400 animate-[bounce_3s_infinite] group-hover:scale-110 group-hover:rotate-12 transition-all" />
            </div>
            <div className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white relative z-10">
              <AnimatedStat target={12.8} prefix="₹" suffix="M+" decimals={1} />
            </div>
            <p className="text-xs text-slate-555 dark:text-slate-400 mt-0.5 leading-relaxed font-medium relative z-10">
              Invoiced value mapped for users
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 3: Five-Column Footer Links Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-10 relative z-10">
        <div className="bg-white/40 dark:bg-slate-950/20 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm dark:shadow-2xl">
          <div className="grid grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-6">
            
            {/* Column 1: Brand & Status Widget (Col span-4) */}
            <div className="col-span-2 lg:col-span-4 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/40 dark:border-slate-800/50 rounded-2xl p-5 sm:p-6 space-y-4 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)] dark:shadow-none">
              <div className="flex items-center gap-3">
                <div className="relative group/logo">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-500 blur-sm opacity-50 group-hover/logo:opacity-100 transition-opacity duration-300" />
                  <div className="relative w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800/80 shadow-lg group-hover/logo:scale-105 group-hover/logo:rotate-3 transition-all duration-300">
                    <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400/20" />
                  </div>
                </div>
                <span className="font-display font-black text-lg tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-650 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                  Smart Household Energy
                </span>
              </div>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                Empowering consumers in Andhra Pradesh to demystify complex slab structures, audit load demands, and model rooftop solar investments.
              </p>
              
              {/* Live status indicator */}
              <div className="inline-flex items-center gap-2 px-3 py-1 border border-emerald-500/20 dark:border-emerald-500/30 rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 shadow-[0_1px_2px_rgba(16,185,129,0.05)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_#10B981]"></span>
                </span>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                  System Status: 100% DISCOM Sync
                </span>
              </div>
            </div>

            {/* Column 2: Product Suite (Col span-2) */}
            <div className="col-span-1 lg:col-span-2 relative lg:pl-6 pt-2">
              <div className="absolute left-0 top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-slate-200/85 dark:via-slate-800/60 to-transparent hidden lg:block" />
              <h4 className="text-[11px] font-black text-slate-400 dark:text-slate-555 uppercase tracking-widest mb-3">
                Product Suite
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/dashboard" onClick={handleLinkClick} className="group flex items-start gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-cyan-400 transition-all duration-300 py-1.5 px-2.5 -mx-2.5 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-900/30 hover:shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                    <Layout className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-cyan-400 transition-colors duration-300 mt-0.5 shrink-0" />
                    <span className="group-hover:translate-x-0.5 transition-transform duration-300 leading-snug">Slab Calculator</span>
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" onClick={handleLinkClick} className="group flex items-start gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-cyan-400 transition-all duration-300 py-1.5 px-2.5 -mx-2.5 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-900/30 hover:shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                    <Sparkles className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-cyan-400 transition-colors duration-300 mt-0.5 shrink-0" />
                    <span className="group-hover:translate-x-0.5 transition-transform duration-300 leading-snug">Home Energy Audit</span>
                  </Link>
                </li>
                <li>
                  <Link to="/history" onClick={handleLinkClick} className="group flex items-start gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-cyan-400 transition-all duration-300 py-1.5 px-2.5 -mx-2.5 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-900/30 hover:shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                    <History className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-cyan-400 transition-colors duration-300 mt-0.5 shrink-0" />
                    <span className="group-hover:translate-x-0.5 transition-transform duration-300 leading-snug">Energy Logs</span>
                  </Link>
                </li>
                <li>
                  <Link to="/survey-data" onClick={handleLinkClick} className="group flex items-start gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-cyan-400 transition-all duration-300 py-1.5 px-2.5 -mx-2.5 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-900/30 hover:shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                    <Globe className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-cyan-400 transition-colors duration-300 mt-0.5 shrink-0" />
                    <span className="group-hover:translate-x-0.5 transition-transform duration-300 leading-snug">Survey Database</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Resources (Col span-2) */}
            <div className="col-span-1 lg:col-span-2 relative lg:pl-6 pt-2">
              <div className="absolute left-0 top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-slate-200/85 dark:via-slate-800/60 to-transparent hidden lg:block" />
              <h4 className="text-[11px] font-black text-slate-400 dark:text-slate-555 uppercase tracking-widest mb-3">
                Resources
              </h4>
              <ul className="space-y-2">
                <li>
                  <a href="https://www.apspdcl.in/electricity-tariff.php" target="_blank" rel="noopener noreferrer" className="group flex items-start gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-cyan-400 transition-all duration-300 py-1.5 px-2.5 -mx-2.5 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-900/30 hover:shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                    <FileText className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-cyan-400 transition-colors duration-300 mt-0.5 shrink-0" />
                    <span className="group-hover:translate-x-0.5 transition-transform duration-300 leading-snug">
                      APSPDCL LT-I Tariff
                      <ExternalLink className="w-3 h-3 text-slate-400/50 group-hover:text-blue-500 dark:group-hover:text-cyan-400 transition-colors shrink-0 inline-block ml-1 align-middle animate-pulse" />
                    </span>
                  </a>
                </li>
                <li>
                  <a href="https://alpexsolar.com/resources/blog/solar-panel-installation-cost-home/" target="_blank" rel="noopener noreferrer" className="group flex items-start gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-cyan-400 transition-all duration-300 py-1.5 px-2.5 -mx-2.5 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-900/30 hover:shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                    <Zap className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-cyan-400 transition-colors duration-300 mt-0.5 shrink-0" />
                    <span className="group-hover:translate-x-0.5 transition-transform duration-300 leading-snug">
                      Alpex Solar Guide
                      <ExternalLink className="w-3 h-3 text-slate-400/50 group-hover:text-blue-500 dark:group-hover:text-cyan-400 transition-colors shrink-0 inline-block ml-1 align-middle" />
                    </span>
                  </a>
                </li>
                <li>
                  <Link to="/faq" onClick={handleLinkClick} className="group flex items-start gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-cyan-400 transition-all duration-300 py-1.5 px-2.5 -mx-2.5 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-900/30 hover:shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-cyan-400 transition-colors duration-300 mt-0.5 shrink-0" />
                    <span className="group-hover:translate-x-0.5 transition-transform duration-300 leading-snug">Energy FAQ</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Platform Security (Col span-2) */}
            <div className="col-span-1 lg:col-span-2 relative lg:pl-6 pt-2">
              <div className="absolute left-0 top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-slate-200/85 dark:via-slate-800/60 to-transparent hidden lg:block" />
              <h4 className="text-[11px] font-black text-slate-400 dark:text-slate-555 uppercase tracking-widest mb-3">
                Platform
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/settings" onClick={handleLinkClick} className="group flex items-start gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-cyan-400 transition-all duration-300 py-1.5 px-2.5 -mx-2.5 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-900/30 hover:shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                    <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-cyan-400 transition-colors duration-300 mt-0.5 shrink-0" />
                    <span className="group-hover:translate-x-0.5 transition-transform duration-300 leading-snug">Security Settings</span>
                  </Link>
                </li>
                <li>
                  <Link to="/profile" onClick={handleLinkClick} className="group flex items-start gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-cyan-400 transition-all duration-300 py-1.5 px-2.5 -mx-2.5 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-900/30 hover:shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                    <Globe className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-cyan-400 transition-colors duration-300 mt-0.5 shrink-0" />
                    <span className="group-hover:translate-x-0.5 transition-transform duration-300 leading-snug">User Profile</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 5: Support Column (Col span-2) */}
            <div className="col-span-1 lg:col-span-2 relative lg:pl-6 pt-2">
              <div className="absolute left-0 top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-slate-200/85 dark:via-slate-800/60 to-transparent hidden lg:block" />
              <h4 className="text-[11px] font-black text-slate-400 dark:text-slate-555 uppercase tracking-widest mb-3">
                Support
              </h4>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => handleOpenSupportModal("Bug Report")} 
                    className="w-full text-left group flex items-start gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-cyan-400 transition-all duration-300 py-1.5 px-2.5 -mx-2.5 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-900/30 hover:shadow-[0_1px_2px_rgba(0,0,0,0.02)] cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-cyan-400 transition-colors duration-300 mt-0.5 shrink-0" />
                    <span className="group-hover:translate-x-0.5 transition-transform duration-300 leading-snug">Report Issue</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleOpenSupportModal("General Feedback")} 
                    className="w-full text-left group flex items-start gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-cyan-400 transition-all duration-300 py-1.5 px-2.5 -mx-2.5 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-900/30 hover:shadow-[0_1px_2px_rgba(0,0,0,0.02)] cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-cyan-400 transition-colors duration-300 mt-0.5 shrink-0" />
                    <span className="group-hover:translate-x-0.5 transition-transform duration-300 leading-snug">Feedback & Suggestions</span>
                  </button>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* SECTION 4: Trust Badge Row */}
        <div className="border-t border-slate-200/50 dark:border-slate-800/60 py-6">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-3 sm:gap-4 text-slate-500 dark:text-slate-400">
            
            {/* SSL Badge */}
            <div className="flex items-center gap-3 px-4 py-2 bg-white/60 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/60 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:border-blue-500/30 hover:bg-blue-50/10 dark:hover:bg-blue-950/20 hover:text-slate-900 dark:hover:text-slate-200 hover:-translate-y-0.5 shadow-sm hover:shadow-md transition-all duration-300 cursor-default group">
              <div className="p-1 bg-blue-50 dark:bg-blue-950/40 rounded-lg text-blue-500 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold tracking-tight">SSL Secure</span>
            </div>

            {/* Privacy Badge */}
            <div className="flex items-center gap-3 px-4 py-2 bg-white/60 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/60 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:border-emerald-500/30 hover:bg-emerald-50/10 dark:hover:bg-emerald-950/20 hover:text-slate-950 dark:hover:text-slate-200 hover:-translate-y-0.5 shadow-sm hover:shadow-md transition-all duration-300 cursor-default group">
              <div className="p-1 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-emerald-550 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold tracking-tight">Privacy Protected</span>
            </div>

            {/* AI Powered Badge */}
            <div className="flex items-center gap-3 px-4 py-2 bg-white/60 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/60 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:border-indigo-500/30 hover:bg-indigo-50/10 dark:hover:bg-indigo-950/20 hover:text-slate-950 dark:hover:text-slate-200 hover:-translate-y-0.5 shadow-sm hover:shadow-md transition-all duration-300 cursor-default group">
              <div className="p-1 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg text-indigo-550 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                <Cpu className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold tracking-tight">AI Powered</span>
            </div>

            {/* Eco Friendly Badge */}
            <div className="flex items-center gap-3 px-4 py-2 bg-white/60 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/60 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:border-emerald-650/30 hover:bg-emerald-50/10 dark:hover:bg-emerald-950/20 hover:text-slate-950 dark:hover:text-slate-200 hover:-translate-y-0.5 shadow-sm hover:shadow-md transition-all duration-300 cursor-default group">
              <div className="p-1 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-emerald-650 dark:text-emerald-500 group-hover:scale-110 transition-transform duration-300">
                <Leaf className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold tracking-tight">Eco Friendly</span>
            </div>

            {/* DISCOM Compatible Badge */}
            <div className="flex items-center gap-3 px-4 py-2 bg-white/60 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/60 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:border-amber-500/30 hover:bg-amber-50/10 dark:hover:bg-amber-950/20 hover:text-slate-950 dark:hover:text-slate-200 hover:-translate-y-0.5 shadow-sm hover:shadow-md transition-all duration-300 cursor-default group col-span-2 justify-center sm:col-span-1">
              <div className="p-1 bg-amber-50 dark:bg-amber-950/40 rounded-lg text-amber-550 dark:text-amber-400 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold tracking-tight">DISCOM Compatible</span>
            </div>

          </div>
        </div>

      </div>
    </footer>
    <ReportIssueModal 
      isOpen={isSupportOpen} 
      onClose={() => setIsSupportOpen(false)} 
      initialType={supportInitialType}
    />
  </>
  );
};
