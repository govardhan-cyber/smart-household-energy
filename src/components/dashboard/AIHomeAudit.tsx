import React, { useState, useEffect } from "react";
import { 
  Sparkles, Play, Trash2, Sun, ArrowRight, ShieldCheck, 
  AlertTriangle, TrendingDown, Cpu, ChevronRight,
  Leaf, Award, Printer
} from "lucide-react";
import { runHomeAudit } from "../../utils/auditEngine";
import type { AuditResult } from "../../utils/auditEngine";
import { auditService } from "../../utils/auditService";
import type { HomeAudit } from "../../utils/auditService";
import type { ApplianceItem } from "../../utils/tariffCalculator";
import type { UserProfile } from "../../context/AuthContext";

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
    
    // Simulate premium scan animation
    await new Promise((resolve) => setTimeout(resolve, 1500));

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
  const renderScoreGauge = (score: number, status: string, colorClass: string) => {
    const radius = 55;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
      <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl relative overflow-hidden">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              className={isDark ? "stroke-slate-800" : "stroke-slate-200"}
              strokeWidth="10"
              fill="transparent"
            />
            {/* Foreground progress circle */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className={`transition-all duration-1000 ease-out ${
                score >= 85
                  ? "text-emerald-500"
                  : score >= 70
                  ? "text-blue-500"
                  : score >= 50
                  ? "text-amber-500"
                  : "text-red-500"
              }`}
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-3xl font-display font-black text-slate-850 dark:text-white">
              {score}
            </span>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
              Score
            </span>
          </div>
        </div>
        <div className="text-center mt-3">
          <span className={`text-sm font-extrabold tracking-wide uppercase ${colorClass}`}>
            {status}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 text-left relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white dark:bg-white dark:text-slate-950 px-4 py-3 rounded-2xl shadow-xl border border-slate-800 dark:border-slate-100 text-xs font-bold animate-fade-in">
          {toast.type === "success" ? (
            <ShieldCheck className="w-4 h-4 text-green-400 dark:text-green-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-400 dark:text-red-600" />
          )}
          {toast.message}
        </div>
      )}

      {/* Main Grid split: Audit Area (left) vs Log History (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Audit workspace */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Print-Only Branded Header */}
          <div className="print-only mb-6 border-b border-slate-200 dark:border-slate-800 pb-4 text-left">
            <h1 className="text-2xl font-display font-black text-slate-900">AI Home Energy Audit Report</h1>
            <p className="text-xs text-slate-500 font-bold">Generated on {new Date().toLocaleDateString()} for your household</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Smart Household Energy AI Diagnostics Platform</p>
          </div>

          {/* Header Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-emerald-950/20 dark:to-green-950/30 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-green-900/20 shadow-sm relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 no-print">
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

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
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
              {auditResult && !isScanning && (
                <button
                  onClick={() => window.print()}
                  className="w-full sm:w-auto h-12 px-6 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest rounded-2xl text-white bg-blue-700 hover:bg-blue-800 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all shadow-md active:scale-[0.98] hover:scale-[1.02]"
                >
                  Export PDF
                  <Printer className="w-4 h-4 ml-0.5" />
                </button>
              )}
            </div>
          </div>

          {/* Loader Scanning Animation */}
          {isScanning && (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-6">
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                {/* Scanner pulse circles */}
                <div className="absolute inset-0 bg-primary-blue/10 dark:bg-primary-green/10 rounded-full animate-ping"></div>
                <div className="absolute inset-2 bg-primary-blue/20 dark:bg-primary-green/20 rounded-full animate-pulse"></div>
                <div className="relative p-4 rounded-full bg-blue-50 text-primary-blue dark:bg-green-950/20 dark:text-primary-green border border-blue-200 dark:border-green-800/40">
                  <Cpu className="w-8 h-8 animate-spin-slow" />
                </div>
              </div>
              <div className="space-y-1 max-w-xs mx-auto">
                <h4 className="text-sm font-black text-slate-850 dark:text-white">Analyzing Home Profile</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                  Parsing {activeAppliances.length} active configurations. Calculating slab charges and solar offset bounds...
                </p>
              </div>
            </div>
          )}

          {/* Empty State: Prompt users to configure appliances first */}
          {!auditResult && !isScanning && (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-6">
              <div className="p-4 rounded-full bg-slate-50 dark:bg-slate-950/40 text-slate-400 dark:text-slate-600 w-16 h-16 flex items-center justify-center mx-auto border border-slate-100 dark:border-slate-800">
                <Sparkles className="w-8 h-8" />
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
                  className="h-10 px-5 inline-flex items-center gap-1.5 text-xs font-bold rounded-xl text-white bg-primary-blue hover:bg-primary-blue/90 dark:bg-primary-green dark:text-slate-950 dark:hover:bg-primary-green/90 transition-all shadow-sm"
                >
                  Configure Appliances First
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleRunAudit}
                  className="h-10 px-5 inline-flex items-center gap-1.5 text-xs font-bold rounded-xl text-white bg-primary-blue hover:bg-primary-blue/90 dark:bg-primary-green dark:text-slate-950 dark:hover:bg-primary-green/90 transition-all shadow-sm"
                >
                  Start Analysis Now
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Audit Results View */}
          {auditResult && !isScanning && (
            <div className="space-y-6">
              
              {/* Score & Primary Insight Panel */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                
                {/* Score gauge card */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
                  {renderScoreGauge(auditResult.score, auditResult.status, auditResult.statusColor)}
                </div>

                {/* AI Insights & High-level details card */}
                <div className="md:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-550 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
                      Critical AI Insights
                    </span>
                    
                    {/* Primary Highlight Insight */}
                    {auditResult.insights.length > 0 ? (
                      <div className="mt-3 p-4 bg-gradient-to-br from-slate-50 to-blue-50/20 dark:from-slate-950/40 dark:to-green-950/10 border border-slate-150 dark:border-slate-800/60 rounded-2xl text-left">
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
                        {Math.round(auditResult.totalUnits)} <span className="text-[11px] font-normal text-slate-400">kWh/mo</span>
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
              </div>

              {/* Grid: Energy Hogs (left) vs Solar ROI bounds (right) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                
                {/* Energy Hogs List (Progress bars) */}
                <div className="md:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                      Energy Impact Breakdown
                    </h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-550 mt-0.5">
                      Identify which devices consume the most units.
                    </p>
                  </div>

                  <div className="space-y-3 pt-1">
                    {auditResult.hogs.slice(0, 5).map((hog) => (
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
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              hog.percent > 30 
                                ? "bg-red-500" 
                                : hog.percent > 15 
                                ? "bg-amber-500" 
                                : "bg-primary-blue dark:bg-primary-green"
                            }`}
                            style={{ width: `${hog.percent}%` }}
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
                <div className="md:col-span-5 bg-gradient-to-br from-slate-50 to-green-50/20 dark:from-slate-950/40 dark:to-green-950/10 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
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
              </div>

              {/* Savings Opportunities & Recommendations Grid */}
              <div className="space-y-4">
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
                      <div 
                        key={rec.id} 
                        className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm flex flex-col justify-between space-y-4 hover:-translate-y-0.5 transition-all"
                      >
                        <div className="space-y-1.5 text-left">
                          <div className="flex justify-between items-center gap-2">
                            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wide truncate">
                              {rec.title}
                            </h4>
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 border rounded-lg uppercase tracking-wider ${
                              rec.difficulty === "Easy"
                                ? "bg-green-50 text-green-600 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900"
                                : rec.difficulty === "Medium"
                                ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900"
                                : "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900"
                            }`}>
                              {rec.difficulty}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            {rec.description}
                          </p>
                        </div>

                        <div className="border-t border-slate-50 dark:border-slate-850 pt-3 flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-400 dark:text-slate-550 uppercase">Action Plan:</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-350 truncate max-w-[150px] md:max-w-[180px]">
                            {rec.action}
                          </span>
                        </div>
                        
                        <div className="bg-slate-50 dark:bg-slate-950/40 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-455 uppercase tracking-wide flex items-center gap-1 text-slate-400 dark:text-slate-500">
                            <TrendingDown className="w-3.5 h-3.5 text-primary-green" />
                            Estimated Savings
                          </span>
                          <span className="text-xs font-black text-primary-green font-display">
                            ₹{rec.yearlySavings.toLocaleString("en-IN")}/yr
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                    No savings opportunities found. You are running an exceptionally green household!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Past Audits Log History */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 no-print">
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
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal max-w-xs mx-auto">
                    Once you perform audits, they will sync automatically and display in this history log.
                  </p>
                </div>
              </div>
            ) : (
              pastAudits.map((audit) => {
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
                  <div
                    key={audit.id}
                    onClick={() => handleSelectPastAudit(audit)}
                    className={`p-3 rounded-2xl border transition-all text-left flex items-center justify-between gap-3 cursor-pointer ${
                      isActive
                        ? "border-primary-blue bg-blue-50/10 dark:border-primary-green dark:bg-green-950/10"
                        : "border-slate-150 bg-slate-50/30 hover:border-slate-250 hover:bg-slate-50 dark:border-slate-850 dark:bg-slate-950/10 dark:hover:border-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      {/* Colored Score Circle Indicator */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0 ${scoreColor} shadow-sm`}>
                        {audit.result.score}
                      </div>
                      <div className="truncate space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-850 dark:text-slate-200">
                          Score: {audit.result.score} ({audit.result.status})
                        </h4>
                        <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide">
                          {dateStr}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* Delete button */}
                      <button
                        onClick={(e) => handleDeleteAudit(e, audit.id || "")}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        title="Delete log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Environmental Savings Tip Badge */}
          {auditResult && (
            <div className="bg-gradient-to-tr from-green-50/50 to-emerald-50/50 dark:from-emerald-950/20 dark:to-green-950/10 p-5 rounded-2xl border border-green-250/50 dark:border-green-900/30 text-left space-y-2.5">
              <span className="text-[10px] font-black text-green-700 dark:text-primary-green uppercase tracking-wider flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-green-600 dark:text-primary-green animate-bounce" />
                Audit Eco Impact
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                Implementing the above recommendations can offset up to{" "}
                <span className="font-black text-slate-850 dark:text-white">
                  {Math.round(auditResult.recommendations.reduce((sum, r) => sum + r.yearlySavings, 0) / 7.5 * 0.82)} kg
                </span>{" "}
                of carbon emissions annually, equivalent to planting{" "}
                <span className="font-black text-slate-850 dark:text-white">
                  {Math.max(1, Math.round(auditResult.recommendations.reduce((sum, r) => sum + r.yearlySavings, 0) / 7.5 * 0.82 / 22))}
                </span>{" "}
                trees every year.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
