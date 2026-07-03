import React, { useState, useEffect } from "react";
import { surveyData } from "../utils/tariffCalculator";
import type { SurveyRecord } from "../utils/tariffCalculator";
import { 
  Search, SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, LayoutList, 
  Users, IndianRupee, Zap, Leaf, X, BarChart3, PieChart as PieChartIcon, 
  Sparkles, TrendingUp, Snowflake, Tv, Laptop, Flame, Eye, RefreshCw,
  Lightbulb, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LiveGridStatusWidget, CarbonSavingsWidget } from "../components/dashboard/SidebarWidgets";
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from "recharts";

// Count-up animation component
const AnimatedNumber: React.FC<{
  value: number;
  formatter?: (v: number) => string;
}> = ({ value, formatter = (v) => Math.round(v).toString() }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = displayValue;
    const endValue = value;
    if (startValue === endValue) return;

    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / 400, 1);
      const easedProgress = progress * (2 - progress); // Ease out quad
      const current = startValue + easedProgress * (endValue - startValue);
      setDisplayValue(current);
      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [value]);

  return <span>{formatter(displayValue)}</span>;
};

export const SurveyData: React.FC = () => {
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

  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<"table" | "analytics">("table");

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [applianceFilter, setApplianceFilter] = useState<number | "all">("all");
  const [billFilter, setBillFilter] = useState<"all" | "low" | "medium" | "high">("all");
  const [userFilter, setUserFilter] = useState<"all" | "high_user" | "low_user">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Detail drawer state
  const [selectedHousehold, setSelectedHousehold] = useState<SurveyRecord | null>(null);
  
  // Sort State
  const [sortField, setSortField] = useState<keyof SurveyRecord>("memberId");
  const [sortAsc, setSortAsc] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const toggleSort = (field: keyof SurveyRecord) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Filter logic
  const filteredData = surveyData.filter((record) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      record.householdName.toLowerCase().includes(searchLower) ||
      record.memberId.toLowerCase().includes(searchLower) ||
      record.highestConsumer.toLowerCase().includes(searchLower);

    const matchesAppliance = 
      applianceFilter === "all" || 
      record.appliancesCount === applianceFilter;

    let matchesBill = true;
    if (billFilter === "low") matchesBill = record.estimatedBill < 500;
    else if (billFilter === "medium") matchesBill = record.estimatedBill >= 500 && record.estimatedBill <= 2000;
    else if (billFilter === "high") matchesBill = record.estimatedBill > 2000;

    let matchesUser = true;
    if (userFilter === "high_user") matchesUser = record.totalUsageKwh >= 200;
    else if (userFilter === "low_user") matchesUser = record.totalUsageKwh < 200;

    return matchesSearch && matchesAppliance && matchesBill && matchesUser;
  });

  // Sort logic
  const sortedData = [...filteredData].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (Array.isArray(aVal)) aVal = aVal.join(", ");
    if (Array.isArray(bVal)) bVal = bVal.join(", ");

    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortAsc ? aVal - bVal : bVal - aVal;
    }

    return 0;
  });

  // Pagination details
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedData.slice(indexOfFirstRow, indexOfLastRow);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleResetFilters = () => {
    setIsResetting(true);
    setSearchQuery("");
    setApplianceFilter("all");
    setBillFilter("all");
    setUserFilter("all");
    setCurrentPage(1);
    setTimeout(() => setIsResetting(false), 500);
  };

  const getSortIcon = (field: keyof SurveyRecord) => {
    if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 text-slate-300 ml-1.5 shrink-0" />;
    return <ArrowUpDown className={`w-3.5 h-3.5 ml-1.5 shrink-0 ${sortAsc ? "text-primary-blue dark:text-primary-green" : "text-slate-800 dark:text-white"}`} />;
  };

  // KPI Computations (Dynamic based on filtered dataset)
  const totalCount = filteredData.length;
  const avgBill = totalCount ? filteredData.reduce((sum, r) => sum + r.estimatedBill, 0) / totalCount : 0;
  const totalUsage = filteredData.reduce((sum, r) => sum + r.totalUsageKwh, 0);
  const totalSavings = filteredData.reduce((sum, r) => sum + r.savingsPotential, 0);

  // Overall database totals for comparisons
  const totalDbCount = surveyData.length;
  const overallAvgBill = surveyData.reduce((sum, r) => sum + r.estimatedBill, 0) / totalDbCount;
  const overallTotalUsage = surveyData.reduce((sum, r) => sum + r.totalUsageKwh, 0);
  const overallTotalSavings = surveyData.reduce((sum, r) => sum + r.savingsPotential, 0);

  const activeFiltersCount = 
    (searchQuery ? 1 : 0) + 
    (applianceFilter !== "all" ? 1 : 0) + 
    (billFilter !== "all" ? 1 : 0) + 
    (userFilter !== "all" ? 1 : 0);

  // Drawer appliance icons mapping
  const getApplianceIcon = (app: string) => {
    const norm = app.toLowerCase();
    if (norm === "ac") return <Snowflake className="w-4.5 h-4.5 text-blue-500" />;
    if (norm === "fridge" || norm === "refrigerator") return <RefrigeratorIcon className="w-4.5 h-4.5 text-cyan-500" />;
    if (norm === "fan") return <WindIcon className="w-4.5 h-4.5 text-sky-400" />;
    if (norm === "lights" || norm === "lights_tube" || norm.includes("tube")) return <Lightbulb className="w-4.5 h-4.5 text-yellow-500" />;
    if (norm === "tv") return <Tv className="w-4.5 h-4.5 text-purple-500" />;
    if (norm === "laptop") return <Laptop className="w-4.5 h-4.5 text-indigo-500" />;
    if (norm.includes("washing")) return <ShieldCheck className="w-4.5 h-4.5 text-pink-500" />;
    if (norm.includes("heater") || norm === "geyser") return <Flame className="w-4.5 h-4.5 text-orange-500" />;
    return <Zap className="w-4.5 h-4.5 text-slate-400" />;
  };

  // Recharts custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xl text-xs space-y-1.5 text-left">
          <p className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-1 mb-1">{label}</p>
          <p className="text-primary-blue dark:text-primary-green font-semibold flex justify-between gap-4">
            <span>Usage:</span>
            <span className="font-bold">{payload[0].value} kWh</span>
          </p>
          {payload[1] && (
            <p className="text-amber-500 font-semibold flex justify-between gap-4">
              <span>Bill:</span>
              <span className="font-bold">₹{payload[1].value}</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Analytics Chart Data formatting
  const chartData = sortedData.map(r => ({
    name: r.householdName.split(" ")[0],
    fullName: r.householdName,
    usage: r.totalUsageKwh,
    bill: r.estimatedBill,
    savings: r.savingsPotential
  }));

  // Pie chart aggregation for Top Consumers
  const consumerCounts = filteredData.reduce((acc, r) => {
    let label = r.highestConsumer;
    if (label === "Refrigerator") label = "Fridge";
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(consumerCounts).map(([name, value]) => ({
    name,
    value
  }));

  const PIE_COLORS = ["#2563EB", "#F97316", "#EF4444", "#10B981", "#8B5CF6", "#EC4899"];

  // Bar chart aggregation for Savings by Appliance Count
  const savingsByAppCount = [3, 4, 5, 6, 7].map(count => {
    const matched = filteredData.filter(r => r.appliancesCount === count);
    const avgSavings = matched.length 
      ? Math.round(matched.reduce((sum, r) => sum + r.savingsPotential, 0) / matched.length)
      : 0;
    return {
      count: `${count} Apps`,
      savings: avgSavings,
      countNum: matched.length
    };
  });

  return (
    <div className="flex-1 bg-transparent transition-colors duration-300 py-8 px-4 sm:px-6 lg:px-8 xl:px-12 max-w-[1600px] mx-auto w-full space-y-8 text-left">
      {/* 3-Column Widescreen Layout Grid */}
      <div className="grid grid-cols-1 2xl:grid-cols-12 gap-8 items-start relative w-full">
        
        {/* Left Sidebar Column - Sticky */}
        <aside className="hidden 2xl:flex 2xl:col-span-2 flex-col gap-6 sticky top-24 no-print select-none">
          <LiveGridStatusWidget />
        </aside>

        {/* Center Main Content Column */}
        <main className="col-span-1 2xl:col-span-8 space-y-8 w-full">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <LayoutList className="w-8 h-8 text-primary-blue dark:text-primary-green" />
            Household Survey Analytics
          </h1>
          <p className="text-sm font-semibold text-slate-550 dark:text-slate-450 mt-1">
            Explore and analyze appliance surveys and energy baselines across 30 domestic households in Andhra Pradesh.
          </p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-slate-200/60 dark:bg-slate-900/60 p-1 rounded-xl self-start sm:self-center border border-slate-200/20">
          <button
            onClick={() => setActiveTab("table")}
            className={`relative px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === "table" 
                ? "text-slate-900 dark:text-slate-950" 
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            {activeTab === "table" && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute inset-0 bg-white dark:bg-primary-green rounded-lg shadow-sm"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <LayoutList className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10">Records Table</span>
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`relative px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === "analytics" 
                ? "text-slate-900 dark:text-slate-950" 
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            {activeTab === "analytics" && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute inset-0 bg-white dark:bg-primary-green rounded-lg shadow-sm"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <BarChart3 className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10">Analytics Charts</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <motion.div 
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
        }}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        {/* KPI 1 */}
        <motion.div 
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1 }
          }}
          whileHover={{ y: -8, scale: 1.025, transition: { type: "spring", stiffness: 380, damping: 18 } }}
          className="relative overflow-hidden bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-[0_0_25px_-5px_rgba(59,130,246,0.25)] hover:border-blue-500/30 dark:hover:border-blue-500/40 transition-shadow duration-300 flex flex-col justify-between group"
        >
          <div className="absolute -right-6 -top-6 w-28 h-28 blur-2xl opacity-40 dark:opacity-30 rounded-full pointer-events-none bg-blue-500 group-hover:scale-150 group-hover:opacity-60 transition-all duration-500" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-550">Households</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-primary-blue relative z-10 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 relative z-10">
            <div className="text-2xl font-display font-black text-slate-900 dark:text-white">
              <AnimatedNumber value={totalCount} />
              <span className="text-xs font-bold text-slate-400 dark:text-slate-550 ml-1.5">/ {totalDbCount}</span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-1">Matched active connections</p>
          </div>
        </motion.div>

        {/* KPI 2 */}
        <motion.div 
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1 }
          }}
          whileHover={{ y: -8, scale: 1.025, transition: { type: "spring", stiffness: 380, damping: 18 } }}
          className="relative overflow-hidden bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-[0_0_25px_-5px_rgba(249,115,22,0.25)] hover:border-orange-500/30 dark:hover:border-orange-500/40 transition-shadow duration-300 flex flex-col justify-between group"
        >
          <div className="absolute -right-6 -top-6 w-28 h-28 blur-2xl opacity-40 dark:opacity-30 rounded-full pointer-events-none bg-orange-500 group-hover:scale-150 group-hover:opacity-60 transition-all duration-500" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-555">Avg Monthly Bill</span>
            <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-warning-orange relative z-10 group-hover:scale-110 transition-transform duration-300">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 relative z-10">
            <div className="text-2xl font-display font-black text-slate-900 dark:text-white">
              ₹<AnimatedNumber value={Math.round(avgBill)} />
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-1">
              Overall avg: <span className="font-bold text-slate-655 dark:text-slate-350">₹{Math.round(overallAvgBill)}</span>
            </p>
          </div>
        </motion.div>

        {/* KPI 3 */}
        <motion.div 
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1 }
          }}
          whileHover={{ y: -8, scale: 1.025, transition: { type: "spring", stiffness: 380, damping: 18 } }}
          className="relative overflow-hidden bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-[0_0_25px_-5px_rgba(234,179,8,0.25)] hover:border-yellow-500/30 dark:hover:border-yellow-500/40 transition-shadow duration-300 flex flex-col justify-between group"
        >
          <div className="absolute -right-6 -top-6 w-28 h-28 blur-2xl opacity-40 dark:opacity-30 rounded-full pointer-events-none bg-yellow-500 group-hover:scale-150 group-hover:opacity-60 transition-all duration-500" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Usage</span>
            <div className="p-2 rounded-xl bg-yellow-50 dark:bg-yellow-950/40 text-yellow-500 relative z-10 group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 relative z-10">
            <div className="text-2xl font-display font-black text-slate-900 dark:text-white flex items-baseline">
              <AnimatedNumber value={totalUsage} />
              <span className="text-xs font-extrabold text-slate-450 ml-1">kWh</span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-1">
              Total baseline: <span className="font-bold text-slate-655 dark:text-slate-350">{overallTotalUsage} kWh</span>
            </p>
          </div>
        </motion.div>

        {/* KPI 4 */}
        <motion.div 
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1 }
          }}
          whileHover={{ y: -8, scale: 1.025, transition: { type: "spring", stiffness: 380, damping: 18 } }}
          className="relative overflow-hidden bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-[0_0_25px_-5px_rgba(16,185,129,0.25)] hover:border-emerald-500/30 dark:hover:border-emerald-500/40 transition-shadow duration-300 flex flex-col justify-between group"
        >
          <div className="absolute -right-6 -top-6 w-28 h-28 blur-2xl opacity-40 dark:opacity-30 rounded-full pointer-events-none bg-emerald-500 group-hover:scale-150 group-hover:opacity-60 transition-all duration-500" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-550">Savings Potential</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-primary-green relative z-10 group-hover:scale-110 transition-transform duration-300">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 relative z-10">
            <div className="text-2xl font-display font-black text-emerald-600 dark:text-primary-green">
              ₹<AnimatedNumber value={totalSavings} />
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-1">
              Overall: <span className="font-bold text-slate-655 dark:text-slate-350">₹{overallTotalSavings}</span>
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Control Area (Search & Collapsible Filters) */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {/* Search row */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by household name, member ID, or highest energy consumer..."
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-blue/20 dark:focus:ring-primary-green/20 dark:text-white transition-all"
            />
          </div>
          
          <div className="flex gap-2.5">
            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                showFilters || activeFiltersCount > 0
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-350 dark:border-slate-700"
                  : "bg-white dark:bg-slate-900 border-slate-250 dark:border-slate-800 text-slate-655 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-primary-blue dark:bg-primary-green text-[10px] text-white dark:text-slate-950 flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Reset Filters */}
            {(activeFiltersCount > 0 || searchQuery !== "") && (
              <button
                onClick={handleResetFilters}
                className="px-4 py-3 bg-red-50 dark:bg-red-950/20 text-alert-red hover:bg-red-100/50 dark:hover:bg-red-900/30 border border-red-100 dark:border-red-900/50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <motion.div
                  animate={{ rotate: isResetting ? 360 : 0 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </motion.div>
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Collapsible filters panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                {/* Appliance Count Filter */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Appliance Count</label>
                  <select
                    value={applianceFilter}
                    onChange={(e) => {
                      setApplianceFilter(e.target.value === "all" ? "all" : parseInt(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-250 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none dark:text-white"
                  >
                    <option value="all">All Counts</option>
                    <option value="3">3 Appliances</option>
                    <option value="4">4 Appliances</option>
                    <option value="5">5 Appliances</option>
                    <option value="6">6 Appliances</option>
                    <option value="7">7 Appliances</option>
                  </select>
                </div>

                {/* Bill Range Filter */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Bill Range</label>
                  <select
                    value={billFilter}
                    onChange={(e) => {
                      setBillFilter(e.target.value as any);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-250 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none dark:text-white"
                  >
                    <option value="all">All Bill Ranges</option>
                    <option value="low">Low (&lt; ₹500)</option>
                    <option value="medium">Medium (₹500 - ₹2000)</option>
                    <option value="high">High (&gt; ₹2000)</option>
                  </select>
                </div>

                {/* User Status Filter */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">User Status</label>
                  <select
                    value={userFilter}
                    onChange={(e) => {
                      setUserFilter(e.target.value as any);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-250 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none dark:text-white"
                  >
                    <option value="all">All Users</option>
                    <option value="high_user">High Consumers (&ge; 200 kWh)</option>
                    <option value="low_user">Low Consumers (&lt; 200 kWh)</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Switchable Section */}
      <AnimatePresence mode="wait">
        {activeTab === "table" ? (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Results Count Banner */}
            <div className="text-xs font-bold text-slate-450 dark:text-slate-550 uppercase tracking-wider pl-1 flex items-center justify-between">
              <span>Showing {filteredData.length} of {surveyData.length} records</span>
            </div>

            {/* Table Container */}
            {filteredData.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-250 dark:border-slate-800 py-16 px-4 text-center space-y-2">
                <SlidersHorizontal className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                <h3 className="font-bold text-slate-900 dark:text-white">No search matches found</h3>
                <p className="text-xs text-slate-500 dark:text-slate-550">Adjust or reset your active filters to search again.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                {/* Table Element */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[850px]">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-450 uppercase tracking-wider h-12 sticky top-0 z-10">
                        <th onClick={() => toggleSort("memberId")} className="px-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors">
                          <div className="flex items-center">ID {getSortIcon("memberId")}</div>
                        </th>
                        <th onClick={() => toggleSort("householdName")} className="px-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors">
                          <div className="flex items-center">Household {getSortIcon("householdName")}</div>
                        </th>
                        <th className="px-6">Appliances (Count)</th>
                        <th onClick={() => toggleSort("totalUsageKwh")} className="px-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors">
                          <div className="flex items-center">Total Usage {getSortIcon("totalUsageKwh")}</div>
                        </th>
                        <th onClick={() => toggleSort("estimatedBill")} className="px-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors">
                          <div className="flex items-center">Est. Bill {getSortIcon("estimatedBill")}</div>
                        </th>
                        <th onClick={() => toggleSort("highestConsumer")} className="px-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors">
                          <div className="flex items-center">Top Consumer {getSortIcon("highestConsumer")}</div>
                        </th>
                        <th onClick={() => toggleSort("savingsPotential")} className="px-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors">
                          <div className="flex items-center">Savings Potential {getSortIcon("savingsPotential")}</div>
                        </th>
                        <th className="px-6 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 dark:divide-slate-800 text-xs font-semibold text-slate-655 dark:text-slate-350">
                      <AnimatePresence initial={false}>
                        {currentRows.map((row) => (
                          <motion.tr 
                            key={row.memberId}
                            layoutId={`row_${row.memberId}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors h-14"
                          >
                            <td className="px-6 whitespace-nowrap font-bold text-slate-900 dark:text-white">
                              {row.memberId}
                            </td>
                            <td className="px-6 whitespace-nowrap font-bold text-slate-800 dark:text-slate-200">
                              {row.householdName}
                            </td>
                            <td className="px-6">
                              <div className="flex flex-wrap gap-1 items-center max-w-[280px]">
                                {row.appliancesSelected.slice(0, 3).map((app, idx) => (
                                  <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                                    {app}
                                  </span>
                                ))}
                                {row.appliancesSelected.length > 3 && (
                                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                                    +{row.appliancesSelected.length - 3} more
                                  </span>
                                )}
                                <span className="text-[10px] font-bold text-primary-blue dark:text-primary-green ml-1 bg-blue-50/50 dark:bg-green-950/20 px-1.5 py-0.5 rounded-full">
                                  {row.appliancesCount} total
                                </span>
                              </div>
                            </td>
                            <td className="px-6 whitespace-nowrap">
                              <span className="font-bold text-slate-800 dark:text-slate-150">{row.totalUsageKwh}</span> kWh
                            </td>
                            <td className="px-6 whitespace-nowrap text-primary-blue dark:text-primary-green font-bold">
                              ₹{row.estimatedBill}
                            </td>
                            <td className="px-6 whitespace-nowrap">
                              <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase ${
                                row.totalUsageKwh >= 200 
                                  ? "bg-red-50 text-alert-red border-red-100 dark:bg-red-950/20 dark:border-red-900/50" 
                                  : "bg-orange-50 text-warning-orange border-orange-100 dark:bg-orange-950/20 dark:border-orange-900/50"
                              }`}>
                                {row.highestConsumer}
                              </span>
                            </td>
                            <td className="px-6 whitespace-nowrap text-green-600 dark:text-emerald-500 font-bold">
                              ₹{row.savingsPotential}
                            </td>
                            <td className="px-6 whitespace-nowrap text-center">
                              <button 
                                onClick={() => setSelectedHousehold(row)}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-primary-blue dark:hover:text-primary-green transition-colors"
                                title="View details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-150 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-semibold">
                      Page {currentPage} of {totalPages}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-1.5 rounded-lg border border-slate-250 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4.5 h-4.5" />
                      </button>
                      {[...Array(totalPages)].map((_, idx) => {
                        const pNum = idx + 1;
                        return (
                          <button
                            key={pNum}
                            onClick={() => handlePageChange(pNum)}
                            className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                              currentPage === pNum
                                ? "bg-primary-blue text-white dark:bg-primary-green dark:text-slate-950"
                                : "border border-slate-200 dark:border-slate-800 hover:bg-slate-105 hover:text-slate-800 dark:text-white"
                            }`}
                          >
                            {pNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-1.5 rounded-lg border border-slate-250 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Chart Row 1 - Big correlation chart */}
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                    <TrendingUp className="w-4.5 h-4.5 text-primary-blue dark:text-primary-green" />
                    Energy Consumption vs. Estimated Monthly Bill
                  </h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                    Correlation of monthly usage (kWh) and bill amount (₹) across sorted households
                  </p>
                </div>
              </div>

              {chartData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-slate-400 text-xs font-semibold">
                  No data matched current filters.
                </div>
              ) : (
                <div className="h-[300px] w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 10, right: -5, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                      <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} fontWeight="bold" tickLine={false} />
                      <YAxis yAxisId="left" stroke="#3B82F6" fontSize={9} fontWeight="bold" tickLine={false} label={{ value: "Usage (kWh)", angle: -90, position: "insideLeft", style: { textAnchor: "middle", fill: "#3B82F6", fontWeight: "bold", fontSize: 9 } }} />
                      <YAxis yAxisId="right" orientation="right" stroke="#F59E0B" fontSize={9} fontWeight="bold" tickLine={false} label={{ value: "Bill (₹)", angle: 90, position: "insideRight", style: { textAnchor: "middle", fill: "#F59E0B", fontWeight: "bold", fontSize: 9 } }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar yAxisId="left" dataKey="usage" name="Usage (kWh)" fill="url(#colorUsage)" stroke="#2563EB" strokeWidth={1} radius={[4, 4, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="bill" name="Bill (₹)" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 2 }} activeDot={{ r: 4 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Chart Row 2 - Donut + Bar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Pie/Donut Chart */}
              <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 md:col-span-5 flex flex-col justify-between">
                <div className="border-b border-slate-100 dark:border-slate-850 pb-3">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                    <PieChartIcon className="w-4.5 h-4.5 text-orange-500" />
                    Highest Consumer Distribution
                  </h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                    Which appliance consumes the most power
                  </p>
                </div>

                {pieData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-slate-400 text-xs font-semibold">No data available</div>
                ) : (
                  <div className="h-[220px] w-full relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`${value} Households`, "Count"]}
                          contentStyle={{
                            fontSize: "11px",
                            fontWeight: "bold",
                            borderRadius: "12px",
                            border: activeTheme === "dark" ? "1px solid #334155" : "1px solid #e2e8f0",
                            backgroundColor: activeTheme === "dark" ? "#1E293B" : "#FFF",
                            color: activeTheme === "dark" ? "#F8FAFC" : "#0F172A",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xl font-display font-black text-slate-850 dark:text-white">{filteredData.length}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Homes</span>
                    </div>
                  </div>
                )}

                {/* Pie Chart Legend */}
                <div className="flex flex-wrap gap-2.5 justify-center pt-2 border-t border-slate-50 dark:border-slate-850">
                  {pieData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                      <span className="text-[10px] font-bold text-slate-655 dark:text-slate-450">{entry.name} ({entry.value})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bar Chart - Savings by Appliance Count */}
              <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 md:col-span-7">
                <div className="border-b border-slate-100 dark:border-slate-850 pb-3">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                    <Leaf className="w-4.5 h-4.5 text-primary-green" />
                    Avg Savings Potential by Appliance Load
                  </h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                    Average potential savings (₹) grouped by number of appliances owned
                  </p>
                </div>

                <div className="h-[250px] w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={savingsByAppCount} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#059669" stopOpacity={0.5}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                      <XAxis dataKey="count" stroke="#94A3B8" fontSize={9} fontWeight="bold" tickLine={false} />
                      <YAxis stroke="#10B981" fontSize={9} fontWeight="bold" tickLine={false} />
                      <Tooltip
                        formatter={(value, _name, props) => [`₹${value}`, "Avg Savings", `(${props.payload.countNum} homes)`]}
                        contentStyle={{
                          fontSize: "11px",
                          fontWeight: "bold",
                          borderRadius: "12px",
                          border: activeTheme === "dark" ? "1px solid #334155" : "1px solid #e2e8f0",
                          backgroundColor: activeTheme === "dark" ? "#1E293B" : "#FFF",
                          color: activeTheme === "dark" ? "#F8FAFC" : "#0F172A",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                        }}
                      />
                      <Bar dataKey="savings" fill="url(#colorSavings)" radius={[5, 5, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Household Detail slide-out drawer (Drawer) */}
      <AnimatePresence>
        {selectedHousehold && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedHousehold(null)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 pointer-events-auto"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl z-50 p-6 overflow-y-auto border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between text-left"
            >
              {/* Header & Avatar */}
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-blue to-accent-neon dark:from-primary-green dark:to-accent-neon text-white dark:text-slate-950 font-display font-extrabold text-lg flex items-center justify-center shadow-md">
                      {selectedHousehold.householdName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">{selectedHousehold.householdName}</h3>
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest">{selectedHousehold.memberId}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedHousehold(null)}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <hr className="border-slate-100 dark:border-slate-800/80" />

                {/* Metrics Breakdown */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Consumption Profile</h4>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-850/50 p-3.5 rounded-xl border border-slate-150 dark:border-slate-800/60 text-center">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Monthly Usage</span>
                      <span className="text-sm font-display font-black text-slate-850 dark:text-white block">{selectedHousehold.totalUsageKwh} <span className="text-[10px] text-slate-400">kWh</span></span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-850/50 p-3.5 rounded-xl border border-slate-150 dark:border-slate-800/60 text-center">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Est. Bill</span>
                      <span className="text-sm font-display font-black text-primary-blue dark:text-primary-green block">₹{selectedHousehold.estimatedBill}</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-850/50 p-3.5 rounded-xl border border-slate-150 dark:border-slate-800/60 text-center">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Savings</span>
                      <span className="text-sm font-display font-black text-emerald-600 dark:text-emerald-500 block">₹{selectedHousehold.savingsPotential}</span>
                    </div>
                  </div>

                  {/* Average Comparison Progress Bar */}
                  <div className="bg-slate-50 dark:bg-slate-850/50 p-4 rounded-xl border border-slate-150 dark:border-slate-800/60 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-550 dark:text-slate-400">Relative Consumption</span>
                      <span className={`${
                        selectedHousehold.totalUsageKwh >= 253 
                          ? "text-alert-red" 
                          : "text-primary-green"
                      }`}>
                        {selectedHousehold.totalUsageKwh >= 253
                          ? `+${Math.round(((selectedHousehold.totalUsageKwh - 253) / 253) * 100)}% above avg`
                          : `${Math.round(((253 - selectedHousehold.totalUsageKwh) / 253) * 100)}% below avg`
                        }
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          selectedHousehold.totalUsageKwh >= 253 ? "bg-alert-red" : "bg-primary-green"
                        }`}
                        style={{ width: `${Math.min((selectedHousehold.totalUsageKwh / 550) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-400 dark:text-slate-500 font-bold">
                      <span>Low (100 kWh)</span>
                      <span>Avg (253 kWh)</span>
                      <span>High (500 kWh+)</span>
                    </div>
                  </div>
                </div>

                {/* Selected Appliances Grid */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Appliances ({selectedHousehold.appliancesCount} Active)
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-2.5">
                    {selectedHousehold.appliancesSelected.map((app) => (
                      <div 
                        key={app}
                        className="flex items-center gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-850/30 rounded-xl border border-slate-150/80 dark:border-slate-800/40"
                      >
                        <div className="p-1.5 rounded-lg bg-white dark:bg-slate-850 shadow-sm border border-slate-100 dark:border-slate-750">
                          {getApplianceIcon(app)}
                        </div>
                        <span className="text-[11px] font-bold text-slate-850 dark:text-slate-250">{app}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Smart Recommendation Card */}
                <div className="relative overflow-hidden bg-gradient-to-tr from-primary-blue/5 to-accent-neon/5 dark:from-primary-green/10 dark:to-accent-neon/5 p-4.5 rounded-2xl border border-primary-blue/20 dark:border-primary-green/20 space-y-3">
                  <div className="absolute right-0 bottom-0 -mb-6 -mr-6 w-14 h-14 rounded-full bg-primary-blue/10 dark:bg-primary-green/10 blur-md" />
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary-blue dark:text-primary-green animate-pulse" />
                    <h5 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">AI Saving Advice</h5>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-655 dark:text-slate-350 font-medium">
                    {selectedHousehold.highestConsumer.toLowerCase().includes("ac") && (
                      "Air Conditioning is your largest load. Try maintaining a thermostat temperature of 24°C, cleaning the filter pads monthly, and running a Ceiling Fan concurrently to circulate cool air. Setting it to 24°C can save up to ₹400/month."
                    )}
                    {(selectedHousehold.highestConsumer.toLowerCase().includes("water heater") || selectedHousehold.highestConsumer.toLowerCase().includes("geyser")) && (
                      "Water Heaters draw high wattage (2000W+). Lower the heater temperature to 50°C and limit run time to 15 minutes before use. Standby heat loss is a major cost factor. Upgrading to a solar heater could save ₹6,000+ annually."
                    )}
                    {(selectedHousehold.highestConsumer.toLowerCase().includes("fridge") || selectedHousehold.highestConsumer.toLowerCase().includes("refrigerator")) && (
                      "Refrigerators run 24/7. Keep the refrigerator away from heat sources and maintain 6 inches of space for airflow. Ensure clean magnetic door gaskets to prevent cold air leaks. Avoid placing warm food inside."
                    )}
                    {!selectedHousehold.highestConsumer.toLowerCase().includes("ac") && 
                     !selectedHousehold.highestConsumer.toLowerCase().includes("water heater") && 
                     !selectedHousehold.highestConsumer.toLowerCase().includes("fridge") && 
                     !selectedHousehold.highestConsumer.toLowerCase().includes("refrigerator") && (
                      "Phantom load accounts for up to 10% of standard home bills. Always switch off electronics and home appliances at the wall outlet when not actively using them. Consider upgrading major devices to 5-Star rated alternatives."
                    )}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setSelectedHousehold(null)}
                  className="w-full py-3 bg-slate-900 dark:bg-primary-green hover:bg-slate-800 dark:hover:bg-primary-green/90 text-white dark:text-slate-950 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-4 h-4" />
                  <span>Done Reviewing</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
        </main>

        {/* Right Sidebar Column - Sticky */}
        <aside className="hidden 2xl:flex 2xl:col-span-2 flex-col gap-6 sticky top-24 no-print select-none">
          <CarbonSavingsWidget />
        </aside>

      </div>
    </div>
  );
};

// Simple custom inline SVG Fallbacks for specific appliances
const RefrigeratorIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="18" height="20" x="3" y="2" rx="2" />
    <path d="M3 10h18" />
    <path d="M7 6v2" />
    <path d="M7 14v4" />
  </svg>
);

const WindIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12.8 3a.5.5 0 0 0-.4-.5 4.9 4.9 0 0 0-4.9 4.9.5.5 0 0 0 .5.4h4.4A12.8 12.8 0 0 0 12.8 3Z" />
    <path d="M11.2 21a.5.5 0 0 0 .4.5 4.9 4.9 0 0 0 4.9-4.9.5.5 0 0 0-.5-.4h-4.4A12.8 12.8 0 0 0 11.2 21Z" />
    <path d="M3 11.2a.5.5 0 0 0-.5.4 4.9 4.9 0 0 0 4.9 4.9.5.5 0 0 0 .4-.5V11.6A12.8 12.8 0 0 0 3 11.2Z" />
    <path d="M21 12.8a.5.5 0 0 0 .5-.4 4.9 4.9 0 0 0-4.9-4.9.5.5 0 0 0-.4.5v4.4A12.8 12.8 0 0 0 21 12.8Z" />
  </svg>
);
