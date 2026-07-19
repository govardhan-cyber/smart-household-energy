import React, { useState, useEffect } from "react";
import { 
  Sparkles, Play, Trash2, Sun, ArrowRight, ShieldCheck, 
  AlertTriangle, TrendingDown, Cpu, ChevronRight,
  Leaf, Award, Lightbulb, Zap, CheckCircle
} from "lucide-react";
import { runHomeAudit } from "../../utils/auditEngine";
import type { AuditResult } from "../../utils/auditEngine";
import { auditService } from "../../utils/auditService";
import type { HomeAudit } from "../../utils/auditService";
import type { ApplianceItem } from "../../utils/tariffCalculator";
import type { UserProfile } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

interface AIHomeAuditProps {
  activeAppliances: ApplianceItem[];
  user: UserProfile | null;
  activeTheme: "light" | "dark";
  onNavigateToWizard: () => void;
  customWattages?: Record<string, number>;
}

export const AIHomeAudit: React.FC<AIHomeAuditProps> = ({
  activeAppliances,
  user,
  activeTheme,
  onNavigateToWizard,
  customWattages = {}
}) => {
  const isDark = activeTheme === "dark";
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [pastAudits, setPastAudits] = useState<HomeAudit[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [selectedPastAuditId, setSelectedPastAuditId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Scanning steps and score animations
  const [scanStep, setScanStep] = useState(0);
  const [animatedScore, setAnimatedScore] = useState(0);

  // Staggered variants for animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  } as const;

  // Load past audits history
  const loadAuditHistory = async () => {
    if (!user) {
      setLoadingHistory(false);
      return;
    }
    setLoadingHistory(true);
    try {
      const history = await auditService.getUserAudits(user.uid);
      setPastAudits(history);
    } catch (e) {
      console.error("Failed to load audit history:", e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadAuditHistory();
  }, [user]);

  // Toast Auto-Dismiss
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Animate score count up
  useEffect(() => {
    if (auditResult) {
      let start = 0;
      const end = auditResult.score;
      if (start === end) {
        setAnimatedScore(end);
        return;
      }
      const duration = 1200; // ms
      const stepTime = Math.abs(Math.floor(duration / end));
      const timer = setInterval(() => {
        start += 1;
        setAnimatedScore(start);
        if (start >= end) {
          clearInterval(timer);
        }
      }, stepTime);
      return () => clearInterval(timer);
    } else {
      setAnimatedScore(0);
    }
  }, [auditResult]);

  // Run the audit scanner
  const handleRunAudit = async () => {
    if (activeAppliances.length === 0) {
      setToast({
        type: "error",
        message: "No active appliances! Add appliances in the Audit Wizard first."
      });
      return;
    }

    setIsScanning(true);
    setSelectedPastAuditId(null);
    setScanStep(0);

    const stepInterval = setInterval(() => {
      setScanStep((prev) => Math.min(prev + 1, 3));
    }, 750);
    
    // Simulate premium scan animation
    await new Promise((resolve) => setTimeout(resolve, 3000));
    clearInterval(stepInterval);

    try {
      const res = runHomeAudit(
        activeAppliances,
        customWattages,
        user?.tariffState || "ap",
        user?.customFlatRate || 7.5
      );
      
      setAuditResult(res);

      if (user) {
        await auditService.saveAudit(user.uid, res);
        await loadAuditHistory();
        setToast({
          type: "success",
          message: "AI Home Audit completed and saved to your profile!"
        });
      } else {
        setToast({
          type: "success",
          message: "AI Home Audit completed successfully!"
        });
      }
    } catch (e) {
      console.error("Audit generation error:", e);
      setToast({
        type: "error",
        message: "Audit execution failed. Please check appliance inputs."
      });
    } finally {
      setIsScanning(false);
    }
  };

  // Delete an audit record
  const handleDeleteAudit = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await auditService.deleteAudit(id);
      setPastAudits((prev) => prev.filter((a) => a.id !== id));
      if (selectedPastAuditId === id) {
        setSelectedPastAuditId(null);
        setAuditResult(null);
      }
      setToast({
        type: "success",
        message: "Audit log deleted successfully."
      });
    } catch (err) {
      console.error("Failed to delete audit:", err);
      setToast({
        type: "error",
        message: "Could not delete audit record."
      });
    }
  };

  // Click a past audit to view it
  const handleSelectPastAudit = (audit: HomeAudit) => {
    setSelectedPastAuditId(audit.id || null);
    setAuditResult(audit.result);
    setToast({
      type: "success",
      message: `Loaded audit from ${new Date(audit.createdAt).toLocaleDateString()}`
    });
  };

  // Render SVG circular score progress gauge
  const renderScoreGauge = (score: number, status: string, _colorClass: string) => {
    const radius = 55;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
      <div className="flex flex-col items-center justify-center p-5 bg-gradient-to-b from-white/40 to-white/10 dark:from-slate-900/40 dark:to-slate-900/10 border-t border-white/20 dark:border-white/10 rounded-3xl relative overflow-hidden group select-none shadow-sm">
        {/* Specular Reflective Gloss Sheen */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000 ease-out" />
        
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              className={isDark ? "stroke-slate-800/50" : "stroke-slate-200/50"}
              strokeWidth="8"
              fill="transparent"
            />
            {/* Foreground progress circle */}
            <motion.circle
              cx="72"
              cy="72"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              strokeLinecap="round"
              className={
                score >= 85
                  ? "text-emerald-500"
                  : score >= 70
                  ? "text-blue-500"
                  : score >= 50
                  ? "text-amber-500"
                  : "text-red-500"
              }
            />
            {/* Spinning decorative inner dash circle */}
            <circle
              cx="72"
              cy="72"
              r={radius - 10}
              stroke="currentColor"
              strokeWidth="1.5"
              fill="transparent"
              strokeDasharray="4 4"
              className={
                score >= 85
                  ? "text-emerald-500/30"
                  : score >= 70
                  ? "text-blue-500/30"
                  : score >= 50
                  ? "text-amber-500/30"
                  : "text-red-500/30"
              }
              style={{ animation: 'spin-slow-infinite 12s linear infinite' }}
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className={`text-4xl font-display font-black tracking-tight ${
              score >= 85
                ? "text-emerald-500 drop-shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                : score >= 70
                ? "text-blue-500 drop-shadow-[0_0_12px_rgba(59,130,246,0.25)]"
                : score >= 50
                ? "text-amber-500 drop-shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                : "text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.25)]"
            }`}>
              {animatedScore}
            </span>
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest leading-none mt-1">
              Score
            </span>
          </div>
        </div>
        <div className="text-center mt-4">
          <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase border ${
            score >= 85
              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/25 shadow-[0_2px_10px_rgba(16,185,129,0.1)]"
              : score >= 70
              ? "bg-blue-500/10 text-blue-500 border-blue-500/25 shadow-[0_2px_10px_rgba(59,130,246,0.1)]"
              : score >= 50
              ? "bg-amber-500/10 text-amber-500 border-amber-500/25 shadow-[0_2px_10px_rgba(245,158,11,0.1)]"
              : "bg-red-500/10 text-red-500 border-red-500/25 shadow-[0_2px_10px_rgba(239,68,68,0.1)]"
          }`}>
            {status}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 text-left relative">
      <style>{`
        @keyframes scanSweep {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .laser-sweep-line {
          animation: scanSweep 2.5s ease-in-out infinite;
        }
      `}</style>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9, transition: { duration: 0.25 } }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white dark:bg-white dark:text-slate-950 px-4 py-3 rounded-2xl shadow-xl border border-slate-800 dark:border-slate-100 text-xs font-bold"
          >
            {toast.type === "success" ? (
              <ShieldCheck className="w-4 h-4 text-green-400 dark:text-green-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400 dark:text-red-600" />
            )}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid split: Audit Area (left) vs Log History (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Audit workspace */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Header Banner */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-emerald-950/20 dark:to-green-950/30 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-green-900/20 shadow-sm relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
          >
            <div className="space-y-2 max-w-lg">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-white/10 text-white">
                  <Cpu className="w-5 h-5 text-amber-300 dark:text-primary-green animate-pulse" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-blue-200 dark:text-primary-green">
                  Advanced Diagnostics
                </span>
              </div>
              <h2 className="text-2xl font-display font-black text-white">AI Home Energy Audit</h2>
              <p className="text-xs text-blue-100 dark:text-slate-350 leading-relaxed">
                Scan your appliance load, identify baseline waste ratios, and generate slab-accurate saving recommendations.
              </p>
            </div>

            <button
              onClick={handleRunAudit}
              disabled={isScanning || activeAppliances.length === 0}
              className="w-full sm:w-auto h-12 px-6 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest rounded-2xl text-slate-900 bg-white hover:bg-slate-100 dark:text-slate-950 dark:bg-primary-green dark:hover:bg-primary-green/90 transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
            >
              {isScanning ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 animate-spin rounded-full"></div>
                  Scanning...
                </>
              ) : (
                <>
                  Run Home Audit
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </>
              )}
            </button>
          </motion.div>

          {/* Loader Scanning Animation with AnimatePresence */}
          <AnimatePresence mode="wait">
            {isScanning && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-12 text-center bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/60 rounded-3xl shadow-lg relative overflow-hidden min-h-[320px] flex flex-col justify-center items-center space-y-6 hero-dot-grid"
              >
                {/* Laser Line Sweep Overlay */}
                <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/80 to-transparent dark:via-emerald-400/85 laser-sweep-line pointer-events-none shadow-[0_0_12px_rgba(59,130,246,0.6)] dark:shadow-[0_0_12px_rgba(16,185,129,0.6)]" />

                <div className="relative w-36 h-36 mx-auto flex items-center justify-center select-none">
                  {/* Outer rotating dash ring */}
                  <motion.svg
                    className="absolute w-32 h-32 text-primary-blue/30 dark:text-primary-green/30"
                    viewBox="0 0 100 100"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray="6 8"
                    />
                  </motion.svg>

                  {/* Middle counter-rotating dot ring */}
                  <motion.svg
                    className="absolute w-26 h-26 text-blue-400/40 dark:text-emerald-400/40"
                    viewBox="0 0 100 100"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray="2 12"
                      strokeLinecap="round"
                    />
                  </motion.svg>

                  {/* Inner ambient pulse glow */}
                  <div className="absolute w-20 h-20 bg-gradient-to-tr from-primary-blue/15 to-cyan-400/20 dark:from-primary-green/20 dark:to-emerald-400/25 rounded-full animate-pulse blur-sm" />

                  {/* Central premium core container */}
                  <div className="relative p-5 rounded-full bg-blue-50/80 text-primary-blue dark:bg-green-950/40 dark:text-primary-green border border-blue-200 dark:border-green-800/50 shadow-md">
                    <Cpu className="w-10 h-10 animate-spin-slow" />
                  </div>
                </div>

                <div className="space-y-3 max-w-xs mx-auto z-10">
                  <h4 className="text-sm font-black text-slate-850 dark:text-white uppercase tracking-widest flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                    Running AI Audit
                  </h4>
                  
                  {/* Dynamic Scan Steps */}
                  <div className="h-10 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={scanStep}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed font-mono"
                      >
                        {scanStep === 0 && "🔍 Parsing appliance load configurations..."}
                        {scanStep === 1 && "⚡ Simulating peak hour waste ratios..."}
                        {scanStep === 2 && "📈 Calibrating slab charges & tariff boundaries..."}
                        {scanStep === 3 && "🤖 Synthesizing solar ROI offset limits..."}
                      </motion.p>
                    </AnimatePresence>
                  </div>

                  {/* Progress bar line */}
                  <div className="w-40 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto overflow-hidden">
                    <motion.div
                      className="h-full bg-primary-blue dark:bg-primary-green rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: `${(scanStep + 1) * 25}%` }}
                      transition={{ duration: 0.7, ease: "easeInOut" }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty State: Prompt users to configure appliances first */}
          {!auditResult && !isScanning && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-12 text-center backdrop-blur-md bg-white/70 dark:bg-slate-950/45 border border-slate-200/50 dark:border-slate-800/60 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.03)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.2)] space-y-6"
            >
              <div className="p-4 rounded-full bg-slate-50/50 dark:bg-slate-950/30 text-slate-400 dark:text-slate-600 w-16 h-16 flex items-center justify-center mx-auto border border-slate-100/40 dark:border-slate-800/40 shadow-inner">
                <Sparkles className="w-8 h-8 text-amber-500 animate-pulse" />
              </div>
              <div className="space-y-2 max-w-sm mx-auto">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">No Audit Report Generated Yet</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Configure your appliance hours in the wizard tab, then click **Run Home Audit** to get custom efficiency grades.
                </p>
              </div>
              {activeAppliances.length === 0 ? (
                <button
                  onClick={onNavigateToWizard}
                  className="h-10 px-5 inline-flex items-center gap-1.5 text-xs font-bold rounded-xl text-white bg-primary-blue hover:bg-primary-blue/90 dark:bg-primary-green dark:text-slate-950 dark:hover:bg-primary-green/90 transition-all shadow-sm active:scale-[0.98] hover:scale-[1.02]"
                >
                  Configure Appliances First
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleRunAudit}
                  className="h-10 px-5 inline-flex items-center gap-1.5 text-xs font-bold rounded-xl text-white bg-primary-blue hover:bg-primary-blue/90 dark:bg-primary-green dark:text-slate-950 dark:hover:bg-primary-green/90 transition-all shadow-sm active:scale-[0.98] hover:scale-[1.02]"
                >
                  Start Analysis Now
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          )}

          {/* Audit Results View */}
          {auditResult && !isScanning && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-6"
            >
              
              {/* Score & Primary Insight Panel */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                
                {/* Score gauge card */}
                <div className="backdrop-blur-md bg-white/70 dark:bg-slate-950/45 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/60 shadow-[0_8px_32px_rgba(0,0,0,0.03)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.2)] flex flex-col justify-center">
                  {renderScoreGauge(auditResult.score, auditResult.status, auditResult.statusColor)}
                </div>

                {/* AI Insights & High-level details card */}
                <div className="md:col-span-2 backdrop-blur-md bg-white/70 dark:bg-slate-950/45 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/60 shadow-[0_8px_32px_rgba(0,0,0,0.03)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.2)] flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-550 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
                      Critical AI Insights
                    </span>
                    
                    {/* Primary Highlight Insight */}
                    {auditResult.insights.length > 0 ? (
                      <div className="mt-3 p-4 bg-gradient-to-br from-slate-50/50 to-blue-50/10 dark:from-slate-950/15 dark:to-green-950/10 border border-slate-150/40 dark:border-slate-800/40 rounded-2xl text-left shadow-inner">
                        <div className="flex items-start gap-2.5">
                          <div className="p-1 rounded-lg bg-amber-500/10 text-amber-500 mt-0.5">
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                              {auditResult.insights[0].title}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-450 mt-1 leading-relaxed">
                              {auditResult.insights[0].description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 mt-2">No critical inefficiencies detected. Your home is operating efficiently!</p>
                    )}
                  </div>

                  {/* Summary consumption metrics footer */}
                  <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800/80 pt-4 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <div>
                      <span>Estimated Units:</span>
                      <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                        {Math.round(auditResult.totalUnits)} <span className="text-[11px] font-normal text-slate-450">kWh/mo</span>
                      </p>
                    </div>
                    <div>
                      <span>Estimated Bill:</span>
                      <p className="text-base font-extrabold text-primary-blue dark:text-primary-green mt-0.5">
                        ₹{Math.round(auditResult.totalBill).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Grid: Energy Hogs (left) vs Solar ROI bounds (right) */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                
                {/* Energy Hogs List (Progress bars) */}
                <div className="md:col-span-7 backdrop-blur-md bg-white/70 dark:bg-slate-950/45 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/60 shadow-[0_8px_32px_rgba(0,0,0,0.03)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.2)] space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider block font-display">
                      Energy Impact Breakdown
                    </h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-550 mt-0.5">
                      Identify which devices consume the most units.
                    </p>
                  </div>

                  <div className="space-y-3 pt-1">
                    {auditResult.hogs.slice(0, 5).map((hog, idx) => (
                      <div key={hog.id} className="space-y-1.5 text-xs text-left">
                        <div className="flex justify-between font-bold text-slate-655 dark:text-slate-350">
                          <span>
                            {hog.name}{" "}
                            <span className="text-[10px] font-normal text-slate-400">
                              (x{hog.quantity})
                            </span>
                          </span>
                          <span>
                            {Math.round(hog.monthlyKwh)} kWh ({hog.percent}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100/40 dark:bg-slate-800/40 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${hog.percent}%` }}
                            transition={{ duration: 0.8, delay: idx * 0.08, ease: "easeOut" }}
                            className={`h-full rounded-full ${
                              hog.percent > 30 
                                ? "bg-red-500" 
                                : hog.percent > 15 
                                ? "bg-amber-500" 
                                : "bg-primary-blue dark:bg-primary-green"
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                    {auditResult.hogs.length > 5 && (
                      <div className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-wider pt-1">
                        + {auditResult.hogs.length - 5} other appliances contributing
                      </div>
                    )}
                  </div>
                </div>

                {/* Solar advice summary card */}
                <div className="md:col-span-5 backdrop-blur-md bg-gradient-to-br from-white/75 to-green-50/20 dark:from-slate-950/45 dark:to-green-950/15 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/60 shadow-[0_8px_32px_rgba(0,0,0,0.03)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.2)] flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-green-700 dark:text-primary-green flex items-center gap-1">
                      <Sun className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
                      Solar Savings Potential
                    </span>
                    <p className="text-3xl font-display font-extrabold text-primary-green flex items-baseline gap-1 mt-2">
                      {auditResult.solarAdvice.sizeKw.toFixed(1)} <span className="text-xs font-bold text-slate-400 uppercase">kW Size</span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                      {auditResult.solarAdvice.description}
                    </p>
                  </div>

                  <div className="border-t border-slate-200/50 dark:border-slate-800/80 pt-3 space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      <span>Grid Offset Ratio:</span>
                      <span className="text-primary-green">{auditResult.solarAdvice.offsetPercent}%</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      <span>Est. Yearly Savings:</span>
                      <span className="text-slate-850 dark:text-white">₹{auditResult.solarAdvice.yearlySavings.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Savings Opportunities & Recommendations Grid */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                    Personalized Savings Opportunities
                  </h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-550 mt-0.5">
                    Actionable optimization plans configured for BEE/slab energy savings.
                  </p>
                </div>

                {auditResult.recommendations.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {auditResult.recommendations.map((rec) => (
                      <motion.div 
                        key={rec.id} 
                        whileHover={{ 
                          y: -6, 
                          scale: 1.015,
                          boxShadow: "0 20px 35px -15px rgba(0,0,0,0.08)"
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="backdrop-blur-md bg-white/70 dark:bg-slate-950/45 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/60 shadow-[0_8px_32px_rgba(0,0,0,0.03)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.2)] flex flex-col justify-between space-y-4 hover:border-slate-350 dark:hover:border-slate-700 transition-all duration-300 relative overflow-hidden group/rec"
                      >
                        {/* Specular Sheen */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent translate-y-[-100%] group-hover/rec:translate-y-[100%] transition-transform duration-1000 ease-out pointer-events-none" />

                        <div className="space-y-3.5 text-left">
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex items-center gap-2 max-w-[70%]">
                              <div className="p-2 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100/40 dark:border-slate-800/40 text-slate-400 dark:text-slate-555 rounded-xl group-hover/rec:text-amber-500 dark:group-hover/rec:text-amber-400 group-hover/rec:scale-110 transition-all duration-300">
                                {React.createElement(
                                  rec.id.includes("solar") ? Sun :
                                  (rec.id.includes("ac") || rec.id.includes("refrigerator") || rec.id.includes("heater") || rec.id.includes("pump")) ? Zap :
                                  (rec.id.includes("vampire") || rec.id.includes("standby")) ? Cpu :
                                  Lightbulb,
                                  { className: "w-4 h-4" }
                                )}
                              </div>
                              <h4 className="text-xs font-black text-slate-850 dark:text-white uppercase tracking-wider leading-tight truncate">
                                {rec.title}
                              </h4>
                            </div>
                            <span className={`text-[9px] font-black px-2 py-0.5 border rounded-lg uppercase tracking-widest ${
                              rec.difficulty === "Easy"
                                ? "bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_2px_8px_rgba(16,185,129,0.08)]"
                                : rec.difficulty === "Medium"
                                ? "bg-blue-500/10 text-blue-500 border-blue-500/25 shadow-[0_2px_8px_rgba(59,130,246,0.08)]"
                                : "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_2px_8px_rgba(245,158,11,0.08)]"
                            }`}>
                              {rec.difficulty}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                            {rec.description}
                          </p>
                        </div>

                        <div className="border-t border-slate-100/40 dark:border-slate-800/30 pt-3 flex items-center justify-between text-[11px] gap-2">
                          <span className="font-black text-slate-400 dark:text-slate-555 uppercase tracking-wider shrink-0">Action Plan:</span>
                          <span className="font-extrabold text-slate-700 dark:text-slate-350 truncate flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-primary-blue dark:text-primary-green shrink-0" />
                            {rec.action}
                          </span>
                        </div>
                        
                        <div className="bg-emerald-500/5 dark:bg-emerald-500/5 px-4 py-3 rounded-2xl border border-emerald-500/15 dark:border-emerald-500/10 flex items-center justify-between shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] group-hover/rec:border-emerald-500/30 transition-colors duration-300">
                          <span className="text-[10px] font-black text-slate-400 dark:text-slate-555 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                            <TrendingDown className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                            Estimated Savings
                          </span>
                          <span className="text-sm font-black text-emerald-600 dark:text-emerald-455 font-display flex items-baseline leading-none gap-0.5">
                            <span className="text-xs font-extrabold">₹</span>{rec.yearlySavings.toLocaleString("en-IN")}<span className="text-[10px] font-bold text-slate-450 dark:text-slate-500">/yr</span>
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-550 backdrop-blur-md bg-white/70 dark:bg-slate-950/45 border border-slate-200/50 dark:border-slate-800/60 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.03)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.2)]">
                    No savings opportunities found. You are running an exceptionally green household!
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* Right Column: Past Audits Log History */}
        <div className="lg:col-span-4 backdrop-blur-md bg-white/70 dark:bg-slate-950/20 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/60 shadow-[0_8px_32px_rgba(0,0,0,0.03)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.2)] space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
              Audit Logs History
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-550 mt-0.5">
              Sync past audit reports directly with your account.
            </p>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {loadingHistory ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-6 h-6 border-2 border-slate-200 border-t-primary-blue dark:border-t-primary-green animate-spin rounded-full mx-auto"></div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Loading logs...</span>
              </div>
            ) : pastAudits.length === 0 ? (
              <div className="py-8 px-4 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/20 dark:bg-slate-950/10 space-y-3">
                <Award className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">No saved audits found</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-550 leading-normal max-w-xs mx-auto">
                    Once you perform audits, they will sync automatically and display in this history log.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {pastAudits.map((audit) => {
                    const dateStr = new Date(audit.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    });
                    const isActive = selectedPastAuditId === audit.id;
                    const scoreColor =
                      audit.result.score >= 85
                        ? "bg-green-500"
                        : audit.result.score >= 70
                        ? "bg-blue-500"
                        : audit.result.score >= 50
                        ? "bg-amber-500"
                        : "bg-red-500";

                    return (
                      <motion.div
                        key={audit.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                        onClick={() => handleSelectPastAudit(audit)}
                        className={`p-3 rounded-2xl border transition-[border-color,background-color] duration-200 text-left flex items-center justify-between gap-3 cursor-pointer ${
                          isActive
                            ? "border-primary-blue bg-blue-50/50 dark:border-primary-green/60 dark:bg-emerald-950/20 dark:shadow-[inset_0_0_0_1px_rgba(16,185,129,0.15)]"
                            : "border-slate-150 bg-slate-50/40 hover:border-slate-250 hover:bg-slate-100/60 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700 dark:hover:bg-slate-800/60"
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          {/* Colored Score Badge */}
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0 ${scoreColor} shadow-sm dark:ring-2 dark:ring-white/10`}>
                            {audit.result.score}
                          </div>
                          <div className="truncate space-y-0.5">
                            <h4 className={`text-xs font-bold ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-750 dark:text-slate-200'}`}>
                              Score: {audit.result.score} ({audit.result.status})
                            </h4>
                            <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-550 uppercase tracking-wide">
                              {dateStr}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          {/* Delete button */}
                          <button
                            onClick={(e) => handleDeleteAudit(e, audit.id || "")}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors"
                            title="Delete log"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <ChevronRight className={`w-4 h-4 ${isActive ? 'text-primary-blue dark:text-primary-green' : 'text-slate-400 dark:text-slate-600'}`} />
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Environmental Savings Tip Badge */}
          {auditResult && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-tr from-green-50 to-emerald-50/60 dark:from-emerald-950/40 dark:to-green-900/10 p-5 rounded-2xl border border-green-200/60 dark:border-emerald-800/40 text-left space-y-2.5 dark:shadow-[inset_0_0_24px_rgba(16,185,129,0.05)]"
            >
              <span className="text-[10px] font-black text-green-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-green-600 dark:text-emerald-400 animate-bounce" />
                Audit Eco Impact
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                Implementing the above recommendations can offset up to{" "}
                <span className="font-black text-slate-900 dark:text-white">
                  {Math.round(auditResult.recommendations.reduce((sum, r) => sum + r.yearlySavings, 0) / 7.5 * 0.82)} kg
                </span>{" "}
                of carbon emissions annually, equivalent to planting{" "}
                <span className="font-black text-slate-900 dark:text-white">
                  {Math.max(1, Math.round(auditResult.recommendations.reduce((sum, r) => sum + r.yearlySavings, 0) / 7.5 * 0.82 / 22))}
                </span>{" "}
                trees every year.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
