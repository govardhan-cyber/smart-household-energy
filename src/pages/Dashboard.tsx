import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Zap, Sun, Sparkles, Check, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ApplianceSelector } from "../components/dashboard/ApplianceSelector";
import { ConsumptionCalculator } from "../components/dashboard/ConsumptionCalculator";
import { SavingsAdvisor } from "../components/dashboard/SavingsAdvisor";
import { Charts } from "../components/dashboard/Charts";
import { SolarCalculator } from "../components/dashboard/SolarCalculator";
import { AIHomeAudit } from "../components/dashboard/AIHomeAudit";
import { DashboardWelcomeState } from "../components/dashboard/DashboardHero";
import { PremiumDashboard } from "../components/dashboard/PremiumDashboard";
import { DashboardStepProgress } from "../components/dashboard/DashboardStepProgress";
import { DashboardSidebarSummary } from "../components/dashboard/DashboardSidebarSummary";
import { DashboardSlabBreakdown } from "../components/dashboard/DashboardSlabBreakdown";
import { useDashboardState } from "../hooks/useDashboardState.tsx";

const tabVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { duration: 0.2, ease: "easeInOut" as const } 
  },
  exit: { 
    opacity: 0, 
    transition: { duration: 0.2, ease: "easeInOut" as const } 
  }
};

const COLORS = ["#1E40AF", "#16A34A", "#0F766E", "#F97316", "#EF4444", "#8B5CF6", "#EC4899", "#F59E0B"];

export const Dashboard: React.FC = () => {
  const {
    user,
    currentStep,
    setCurrentStep,
    activeTab,
    setActiveTab,
    renderedTab,
    appliances,
    activeAppliances,
    analysisResult,
    isAnalyzing,
    reports,
    reportsLoading,
    toast,
    setToast,
    hasInitiated,
    liveTotalUnits,
    liveBill,
    benchmarkDiffPercent,
    isAboveBenchmark,
    benchmarkCharge,
    benchmarkUnits,
    liveSavingsPotential,
    solarOffsetPercent,
    recommendedKw,
    chartData,
    momTrend,
    vsAvgTrend,
    toggleAppliance,
    updateQuantity,
    updateHours,
    updateUnitHours,
    updateWatts,
    updateAge,
    updateUnitAge,
    handleAnalyze,
    handleReset,
    handleExportCSV,
    handleStartAudit,
    handleRunAudit
  } = useDashboardState();

  const location = useLocation();

  // Sync tab state with URL parameter (e.g. ?tab=solar or ?tab=audit)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab === "solar" || tab === "audit") {
      setActiveTab(tab);
    }
  }, [location.search, setActiveTab]);

  // Detect theme state for Recharts components
  const [activeTheme, setActiveTheme] = useState<"light" | "dark">(
    () => (document.documentElement.classList.contains("dark") ? "dark" : "light")
  );

  useEffect(() => {
    const handleThemeChange = () => {
      setActiveTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
    };
    window.addEventListener("theme-change", handleThemeChange);
    return () => window.removeEventListener("theme-change", handleThemeChange);
  }, []);

  // Smooth scroll to top of page/wizard on step or tab transition
  useEffect(() => {
    const wizardEl = document.getElementById("wizard-progress-bar");
    if (wizardEl && activeTab === "wizard") {
      const y = wizardEl.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep, activeTab]);

  return (
    <div className="flex-1 bg-transparent transition-colors duration-300 pt-4 pb-8 px-4 sm:px-6 lg:px-8 xl:px-12 max-w-[1600px] mx-auto w-full space-y-4">
      {/* ─── PRINT ONLY HEADER ────────────────────────────────────────────────── */}
      <div className="hidden print:flex flex-col w-full border-b-2 border-primary-blue pb-4 mb-6 text-left">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-xl font-black tracking-tight text-blue-900 flex items-center gap-2">
              <span className="w-6 h-6 bg-gradient-to-br from-blue-600 to-teal-500 rounded-full flex items-center justify-center text-white text-[10px] font-extrabold">⚡</span>
              SMART HOUSEHOLD ENERGY PORTAL
            </h1>
            <p className="text-xs text-slate-505 mt-1 font-medium">
              Energy Consumption, Conservation & Solar Planning Report
            </p>
          </div>
          <div className="text-right text-xs text-slate-500 font-mono">
            <div>Report Generated: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <div>Account: {user?.email || "Govardhan"}</div>
            <div>Security Status: Verified & Audited</div>
          </div>
        </div>
      </div>
      
      {/* Tab Selector */}
      <div className="flex justify-center no-print relative z-10">
        <div className="flex backdrop-blur-md bg-slate-200/50 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-slate-200/30 dark:border-slate-800/50 shadow-inner relative">
          <motion.button
            whileHover="hover"
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab("wizard")}
            className={`relative flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-colors duration-300 active:scale-[0.98] ${
              activeTab === "wizard"
                ? "text-slate-900 dark:text-white"
                : "text-slate-550 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-305"
            }`}
          >
            {activeTab === "wizard" && (
              <motion.div
                layoutId="activeDashboardTab"
                className="absolute inset-0 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200/50 dark:border-slate-700/50 z-0"
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2.5">
              <motion.span
                variants={{
                  hover: {
                    scale: [1, 1.15, 1.05, 1.15, 1],
                    transition: { repeat: Infinity, duration: 1.0, ease: "easeInOut" }
                  }
                }}
                className="inline-flex items-center justify-center"
              >
                <Zap className={`w-4 h-4 transition-transform duration-300 ${activeTab === "wizard" ? "text-primary-green scale-110" : "text-slate-400"}`} />
              </motion.span>
              <span>Home Audit Wizard</span>
            </span>
          </motion.button>
          
          <motion.button
            whileHover="hover"
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab("solar")}
            className={`relative flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-colors duration-300 active:scale-[0.98] ${
              activeTab === "solar"
                ? "text-slate-900 dark:text-white"
                : "text-slate-550 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-305"
            }`}
          >
            {activeTab === "solar" && (
              <motion.div
                layoutId="activeDashboardTab"
                className="absolute inset-0 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200/50 dark:border-slate-700/50 z-0"
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2.5">
              <motion.span
                variants={{
                  hover: {
                    rotate: 360,
                    transition: { repeat: Infinity, duration: 4, ease: "linear" }
                  }
                }}
                className="inline-flex items-center justify-center"
              >
                <Sun className={`w-4 h-4 transition-transform duration-300 ${activeTab === "solar" ? "text-amber-500 scale-110" : "text-slate-400"}`} />
              </motion.span>
              <span>Solar ROI Calculator</span>
            </span>
          </motion.button>
          
          <motion.button
            whileHover="hover"
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab("audit")}
            className={`relative flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-colors duration-300 active:scale-[0.98] ${
              activeTab === "audit"
                ? "text-slate-900 dark:text-white"
                : "text-slate-550 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-305"
            }`}
          >
            {activeTab === "audit" && (
              <motion.div
                layoutId="activeDashboardTab"
                className="absolute inset-0 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200/50 dark:border-slate-700/50 z-0"
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2.5">
              <motion.span
                variants={{
                  hover: {
                    scale: 1.15,
                    y: -3,
                    transition: { repeat: Infinity, repeatType: "reverse", duration: 0.8, ease: "easeInOut" }
                  }
                }}
                className="inline-flex items-center justify-center"
              >
                <Sparkles className={`w-4 h-4 transition-transform duration-300 ${activeTab === "audit" ? "text-amber-500 scale-110" : "text-slate-400"}`} />
              </motion.span>
              <span>AI Home Audit</span>
            </span>
          </motion.button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {renderedTab === "solar" && (
          <motion.div
            key="solar"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full"
          >
            <SolarCalculator tariffState={user?.tariffState || "ap"} activeTheme={activeTheme} />
          </motion.div>
        )}

        {renderedTab === "audit" && (
          <motion.div
            key="audit"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full"
          >
            <AIHomeAudit 
              activeAppliances={activeAppliances} 
              user={user} 
              activeTheme={activeTheme}
              onNavigateToWizard={() => setActiveTab("wizard")}
              customWattages={user?.customWattages}
            />
          </motion.div>
        )}

        {renderedTab === "wizard" && (
          <motion.div
            key="wizard"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full space-y-8"
          >
            {activeAppliances.length === 0 && !hasInitiated ? (
              <DashboardWelcomeState onStartAudit={handleStartAudit} />
            ) : (
              <>
                {/* Premium Dashboard Overview */}
                <PremiumDashboard
                  userName={user?.fullName}
                  savingsPotential={liveSavingsPotential}
                  totalUnits={liveTotalUnits}
                  bill={liveBill}
                  activeAppliances={activeAppliances}
                  reports={reports}
                  onRunAudit={handleRunAudit}
                  tariffState={user?.tariffState || "ap"}
                  momTrend={momTrend}
                  vsAvgTrend={vsAvgTrend}
                  solarOffsetPercent={solarOffsetPercent}
                />

                {/* Step Progress Bar */}
                <DashboardStepProgress 
                  currentStep={currentStep}
                  setCurrentStep={setCurrentStep}
                  activeAppliancesLength={activeAppliances.length}
                />

                {/* Main Working Area */}
                {currentStep !== 4 && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Side: Input wizard flow */}
                    <div className="lg:col-span-7 space-y-6">
                      <div className="bg-white/40 dark:bg-slate-900/30 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/50 dark:border-slate-800/40 shadow-[0_8px_32px_rgba(31,38,135,0.04)] space-y-6">
                        
                        {currentStep === 1 && (
                          <ApplianceSelector
                            appliances={appliances}
                            toggleAppliance={toggleAppliance}
                            onNext={() => setCurrentStep(2)}
                            hasSelection={activeAppliances.length > 0}
                          />
                        )}

                        {currentStep === 2 && (
                          <ConsumptionCalculator
                            activeAppliances={activeAppliances}
                            updateQuantity={updateQuantity}
                            updateHours={updateHours}
                            updateUnitHours={updateUnitHours}
                            updateWatts={updateWatts}
                            updateAge={updateAge}
                            updateUnitAge={updateUnitAge}
                            activeTheme={activeTheme}
                            isAnalyzing={isAnalyzing}
                            onBack={() => setCurrentStep(1)}
                            onAnalyze={handleAnalyze}
                          />
                        )}

                        {currentStep === 3 && analysisResult && (
                          <DashboardSlabBreakdown 
                            totalUnits={analysisResult.totalUnits}
                            billing={analysisResult.billing}
                            beforeCo2={analysisResult.beforeCo2}
                            beforeTrees={analysisResult.beforeTrees}
                            tariffState={user?.tariffState || "ap"}
                            customFlatRate={user?.customFlatRate || 7.5}
                            onBack={() => setCurrentStep(2)}
                            onReset={handleReset}
                            onNext={() => setCurrentStep(4)}
                            onExportCSV={() => handleExportCSV(analysisResult)}
                          />
                        )}
                      </div>
                    </div>

                    {/* Right Side: Sidebar Summary */}
                    <div className="lg:col-span-5 space-y-6">
                      <DashboardSidebarSummary 
                        liveTotalUnits={liveTotalUnits}
                        liveBill={liveBill}
                        isAboveBenchmark={isAboveBenchmark}
                        benchmarkDiffPercent={benchmarkDiffPercent}
                        benchmarkCharge={benchmarkCharge}
                        benchmarkUnits={benchmarkUnits}
                        user={user}
                      />
                    </div>
                  </div>
                )}

                {/* STEP 3 CHARTS SECTION */}
                {currentStep === 3 && analysisResult && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full pt-4"
                  >
                    <Charts 
                      chartData={chartData} 
                      activeTheme={activeTheme} 
                      colors={COLORS} 
                      reports={reports}
                      liveTotalUnits={liveTotalUnits}
                      liveBill={liveBill}
                      tariffState={user?.tariffState || "ap"}
                      customFlatRate={user?.customFlatRate || 7.5}
                      mode="consumption"
                      loading={reportsLoading}
                      recommendedKw={recommendedKw}
                    />
                  </motion.div>
                )}

                {/* STEP 4: RECOMMENDATIONS PAGE */}
                {currentStep === 4 && analysisResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    <SavingsAdvisor
                      analysisResult={analysisResult}
                      activeApplianceIds={activeAppliances.map(a => a.id)}
                      onExportCSV={() => handleExportCSV(analysisResult)}
                      onPrint={() => window.print()}
                      onBack={() => setCurrentStep(2)}
                      onReset={handleReset}
                      onStartNewAudit={() => {
                        handleReset();
                        setActiveTab("audit");
                      }}
                    />
                    
                    <Charts 
                      chartData={chartData} 
                      activeTheme={activeTheme} 
                      colors={COLORS} 
                      reports={reports}
                      liveTotalUnits={liveTotalUnits}
                      liveBill={liveBill}
                      tariffState={user?.tariffState || "ap"}
                      customFlatRate={user?.customFlatRate || 7.5}
                      mode="consumption"
                      loading={reportsLoading}
                      recommendedKw={recommendedKw}
                    />
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            onClick={() => setToast(null)}
            className={`fixed bottom-5 right-5 z-[100] flex items-center gap-2.5 px-4.5 py-3.5 rounded-2xl border shadow-xl text-xs font-bold cursor-pointer select-none hover:opacity-90 active:scale-95 transition-all ${
              toast.type === "success"
                ? "bg-green-50 dark:bg-green-950/80 border-green-250 dark:border-green-900 text-green-600 dark:text-green-450"
                : toast.type === "error"
                ? "bg-red-50 dark:bg-red-950/80 border-red-200 dark:border-red-900 text-alert-red dark:text-red-400"
                : "bg-blue-50 dark:bg-blue-955/80 border-blue-200 dark:border-blue-900 text-primary-blue dark:text-blue-400"
            }`}
          >
            {toast.type === "success" && <Check className="w-4.5 h-4.5 shrink-0" />}
            {toast.type === "error" && <AlertTriangle className="w-4.5 h-4.5 shrink-0" />}
            {toast.type === "info" && <Zap className="w-4.5 h-4.5 shrink-0 animate-pulse" />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
