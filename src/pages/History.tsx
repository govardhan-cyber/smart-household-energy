import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { reportsService } from "../utils/reportsService";
import type { EnergyReport } from "../utils/reportsService";
import {
  History as HistIcon, Search, Calendar,
  Trash2, Eye, X, ArrowUpDown, Download, Printer, Leaf,
  Zap, TrendingDown, Bolt, ChevronRight, BarChart3, AlertTriangle,
  Refrigerator, Wind, Fan, Lightbulb, Tv, WashingMachine, Flame,
  Microwave, CookingPot, Coffee, Blender, Laptop, Monitor, Router,
  Gamepad2, Filter, Thermometer, Droplet, GlassWater, Sparkles, IndianRupee
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateBill, getSlabsForState } from "../utils/tariffCalculator";
import { LiveGridStatusWidget, CarbonSavingsWidget } from "../components/dashboard/SidebarWidgets";
import { PrintReport } from "../components/dashboard/PrintReport";

/* ── count-up hook ───────────────────────────────────────────────── */
function useCountUp(target: number, duration = 1.2, delay = 0) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const step = (timestamp: number) => {
      if (start === null) start = timestamp + delay * 1000;
      const elapsed = Math.max(0, timestamp - start);
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    const raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, delay]);
  return display;
}

/* ── helpers ─────────────────────────────────────────────────────── */
const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

const formatShortDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });

const getIconComponent = (name: string) => {
  const norm = name.toLowerCase();
  if (norm.includes("refrigerator") || norm.includes("fridge")) {
    return <Refrigerator className="w-5 h-5 text-blue-500" />;
  }
  if (norm.includes("conditioner") || norm.includes("ac")) {
    return <Wind className="w-5 h-5 text-cyan-500 animate-pulse" />;
  }
  if (norm.includes("fan")) {
    return <Fan className="w-5 h-5 text-indigo-500 animate-spin" style={{ animationDuration: "8s" }} />;
  }
  if (norm.includes("bulb") || norm.includes("light") || norm.includes("led")) {
    return <Lightbulb className="w-5 h-5 text-amber-500" />;
  }
  if (norm.includes("tv") || norm.includes("television") || norm.includes("smart tv")) {
    return <Tv className="w-5 h-5 text-violet-500" />;
  }
  if (norm.includes("washing") || norm.includes("dryer")) {
    return <WashingMachine className="w-5 h-5 text-sky-500" />;
  }
  if (norm.includes("geyser") || norm.includes("heater") || norm.includes("oven") || norm.includes("microwave")) {
    if (norm.includes("microwave") || norm.includes("oven")) {
      return <Microwave className="w-5 h-5 text-slate-500" />;
    }
    if (norm.includes("geyser")) {
      return <Thermometer className="w-5 h-5 text-orange-500" />;
    }
    return <Flame className="w-5 h-5 text-orange-500" />;
  }
  if (norm.includes("induction") || norm.includes("stove") || norm.includes("cook")) {
    return <CookingPot className="w-5 h-5 text-rose-500" />;
  }
  if (norm.includes("coffee")) {
    return <Coffee className="w-5 h-5 text-amber-700" />;
  }
  if (norm.includes("mixer") || norm.includes("grinder") || norm.includes("blender")) {
    return <Blender className="w-5 h-5 text-cyan-600" />;
  }
  if (norm.includes("computer") || norm.includes("pc") || norm.includes("desktop") || norm.includes("laptop")) {
    if (norm.includes("laptop")) {
      return <Laptop className="w-5 h-5 text-purple-500" />;
    }
    return <Monitor className="w-5 h-5 text-purple-500" />;
  }
  if (norm.includes("router") || norm.includes("modem") || norm.includes("wifi")) {
    return <Router className="w-5 h-5 text-slate-400" />;
  }
  if (norm.includes("console") || norm.includes("game") || norm.includes("playstation") || norm.includes("xbox")) {
    return <Gamepad2 className="w-5 h-5 text-emerald-500" />;
  }
  if (norm.includes("pump") || norm.includes("motor")) {
    return <Droplet className="w-5 h-5 text-blue-600" />;
  }
  if (norm.includes("purifier") || norm.includes("filter")) {
    if (norm.includes("water") || norm.includes("ro")) {
      return <GlassWater className="w-5 h-5 text-teal-500 dark:text-teal-400" />;
    }
    return <Filter className="w-5 h-5 text-teal-400" />;
  }
  return <Zap className="w-5 h-5 text-yellow-500" />;
};

const heroStatVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as any }
  })
};

const historyCardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, delay: index * 0.05 }
  })
};

const historyBarVariants = {
  hidden: { width: 0 },
  visible: (custom: { index: number; barWidth: number }) => ({
    width: `${custom.barWidth}%`,
    transition: { duration: 0.7, delay: custom.index * 0.06 + 0.25, ease: "easeOut" as const }
  })
};

const modalOverlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const modalContentVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 20 }
};

/* ── HeroStat chip with count-up + stagger slide-in ────────────────── */
interface HeroStatProps {
  icon: React.ElementType;
  iconColor: string;
  label: string;
  raw: number;
  prefix?: string;
  suffix?: string;
  delay?: number;
}
const HeroStat: React.FC<HeroStatProps> = ({
  icon: Icon, iconColor, label, raw, prefix = "", suffix = "", delay = 0,
}) => {
  const counted = useCountUp(raw, 1.4, delay + 0.15);
  return (
    <motion.div
      custom={delay}
      variants={heroStatVariants}
      initial="hidden"
      animate="visible"
      className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 text-white"
    >
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">{label}</span>
      </div>
      <p className="text-lg font-extrabold leading-tight tabular-nums">
        {prefix}{counted.toLocaleString()}
        <span className="text-xs font-semibold text-white/60 ml-0.5">{suffix}</span>
      </p>
    </motion.div>
  );
};



/* ── component ───────────────────────────────────────────────────── */
export const History: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports]               = useState<EnergyReport[]>([]);
  const [loading, setLoading]               = useState(true);
  const [searchQuery, setSearchQuery]       = useState("");
  const [sortBy, setSortBy]                 = useState<"date_desc"|"date_asc"|"bill_desc"|"bill_asc"|"units_desc">("date_desc");
  const [selectedReport, setSelectedReport] = useState<EnergyReport | null>(null);
  const [deleteReportId, setDeleteReportId] = useState<string | null>(null);

  const detailsModalRef = useRef<HTMLDivElement>(null);
  const deleteModalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedReport) {
      setTimeout(() => detailsModalRef.current?.focus(), 50);
    }
  }, [selectedReport]);

  useEffect(() => {
    if (deleteReportId) {
      setTimeout(() => deleteModalRef.current?.focus(), 50);
    }
  }, [deleteReportId]);

  const handleDetailsModalKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      setSelectedReport(null);
      return;
    }
    if (e.key === "Tab") {
      const focusableElements = e.currentTarget.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex="0"]'
      );
      if (focusableElements.length === 0) return;
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  };

  const handleDeleteModalKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      setDeleteReportId(null);
      return;
    }
    if (e.key === "Tab") {
      const focusableElements = e.currentTarget.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex="0"]'
      );
      if (focusableElements.length === 0) return;
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  };

  /* CSV export */
  const handleModalExportCSV = (report: EnergyReport) => {
    const headers = ["Appliance","Quantity","Usage (hrs/day)","Wattage (W)","Estimated Monthly kWh"];
    const rows = report.appliances.map(app => {
      const kwh = Math.round(app.quantity * (app.watts / 1000) * app.hours * 30);
      return [app.name, app.quantity, app.hours, app.watts, kwh];
    });
    rows.push([]);
    rows.push(["Metric","Value"]);
    rows.push(["Tariff Region/Scheme", report.tariffState ? report.tariffState.toUpperCase() : "AP"]);
    rows.push(["Total Monthly Units (kWh)", report.totalUnits.toString()]);
    rows.push(["Estimated Monthly Bill", `₹${report.estimatedBill}`]);
    rows.push(["Savings Potential", `₹${report.savingsPotential}`]);
    const beforeCo2 = report.beforeCo2 ?? Math.round(report.totalUnits * 0.82 * 10) / 10;
    const beforeTrees = Math.round((beforeCo2 / 1.83) * 10) / 10;
    rows.push(["CO2 Emissions (Before)", `${beforeCo2} kg`]);
    rows.push(["Equivalent Tree Offset", `${beforeTrees} trees`]);
    if (report.savedCo2 !== undefined) rows.push(["CO2 Avoided", `${report.savedCo2} kg`]);
    if (report.savedTrees !== undefined) rows.push(["Additional Tree Offset", `${report.savedTrees} trees`]);
    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Energy_Report_${new Date(report.createdAt).toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  /* data fetching */
  const fetchReports = async () => {
    if (!user) return;
    const cacheKey = `she_reports_cache_${user.uid}`;
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      try { setReports(JSON.parse(cachedData) as EnergyReport[]); setLoading(false); }
      catch (e) { console.error("Cache parse error:", e); }
    } else { setLoading(true); }
    try {
      const data = await reportsService.getUserReports(user.uid);
      setReports(data);
    } catch (e) { console.error("Failed to load reports:", e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReports(); }, [user]);

  const handleDelete = (reportId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteReportId(reportId);
  };

  const handleConfirmDelete = async () => {
    if (!deleteReportId) return;
    const targetId = deleteReportId;
    
    // Optimistic UI Update: instantly delete from local state
    setReports(prev => prev.filter(r => r.id !== targetId));
    if (selectedReport?.id === targetId) setSelectedReport(null);
    
    // Instantly close the confirm popup
    setDeleteReportId(null);
    
    // Run network delete in background
    try {
      await reportsService.deleteReport(targetId);
    } catch (error) {
      console.error("Delete failed on backend:", error);
    }
  };

  /* filter & sort */
  const filtered = reports.filter(r => {
    const q = searchQuery.toLowerCase();
    return (
      new Date(r.createdAt).toLocaleDateString().toLowerCase().includes(q) ||
      r.highestConsumer.toLowerCase().includes(q) ||
      r.totalUnits.toString().includes(q) ||
      r.estimatedBill.toString().includes(q)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "date_desc")  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === "date_asc")   return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortBy === "bill_desc")  return b.estimatedBill - a.estimatedBill;
    if (sortBy === "bill_asc")   return a.estimatedBill - b.estimatedBill;
    if (sortBy === "units_desc") return b.totalUnits - a.totalUnits;
    return 0;
  });

  /* summary stats */
  const totalBill    = reports.reduce((s, r) => s + r.estimatedBill, 0);
  const totalUnits   = reports.reduce((s, r) => s + r.totalUnits, 0);
  const totalSavings = reports.reduce((s, r) => s + r.savingsPotential, 0);
  const avgBill      = reports.length ? Math.round(totalBill / reports.length) : 0;

  return (
    <div className="flex-1 bg-transparent transition-colors duration-300 py-8 px-4 sm:px-6 lg:px-8 xl:px-12 max-w-[1600px] mx-auto w-full space-y-8 min-h-screen">
      <div className="print:hidden w-full space-y-8">
        {/* ─── PRINT ONLY HEADER ────────────────────────────────────────────────── */}
      <div className="hidden print:flex flex-col w-full border-b-2 border-primary-blue pb-4 mb-6 text-left print-background-content">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-xl font-black tracking-tight text-blue-900 flex items-center gap-2">
              <span className="w-6 h-6 bg-gradient-to-br from-blue-600 to-teal-500 rounded-full flex items-center justify-center text-white text-[10px] font-extrabold">⚡</span>
              SMART HOUSEHOLD ENERGY PORTAL
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Historical Consumption & Carbon Footprint Audit Log
            </p>
          </div>
          <div className="text-right text-xs text-slate-500 font-mono">
            <div>Report Generated: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <div>Account: {user?.email || "Govardhan"}</div>
            <div>Security Status: Verified & Audited</div>
          </div>
        </div>
      </div>
      
      {/* 3-Column Widescreen Layout Grid */}
      <div className="grid grid-cols-1 2xl:grid-cols-12 gap-8 items-start relative w-full print-background-content">
        
        {/* Left Sidebar Column - Sticky */}
        <aside className="hidden 2xl:flex 2xl:col-span-2 flex-col gap-6 sticky top-24 no-print select-none">
          <LiveGridStatusWidget />
        </aside>

        {/* Center Main Content Column */}
        <main className="col-span-1 2xl:col-span-8 space-y-6 w-full text-left">
          
          {/* ── Hero header (Float Card-Style) ── */}
          <div className="relative overflow-hidden bg-gradient-to-br from-primary-blue via-blue-600 to-primary-green p-6 sm:p-8 rounded-3xl border border-white/10 shadow-lg">
            <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
                    <HistIcon className="w-3 h-3" />
                    Energy Reports
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">My Energy History</h1>
                  <p className="text-xs text-blue-100/80">Access, compare, and manage your previously saved energy reports.</p>
                </div>

                {/* Quick stats in hero — animated */}
                {reports.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
                    <HeroStat icon={BarChart3}   iconColor="text-white"        label="Reports"   raw={reports.length}  prefix=""  suffix=""    delay={0}   />
                    <HeroStat icon={Zap}         iconColor="text-yellow-200"   label="Avg Bill"  raw={avgBill}         prefix="₹" suffix="/mo" delay={0.1} />
                    <HeroStat icon={Bolt}        iconColor="text-blue-200"     label="Total kWh" raw={totalUnits}      prefix=""  suffix=" kWh" delay={0.2} />
                    <HeroStat icon={TrendingDown} iconColor="text-emerald-200" label="Savings"   raw={totalSavings}    prefix="₹" suffix=""    delay={0.3} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search & sort bar */}
          <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by date, appliance, bill amount, or consumption…"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-blue/20 dark:text-white placeholder-slate-400"
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <ArrowUpDown className="w-4 h-4 text-slate-400" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as typeof sortBy)}
                className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none dark:text-white cursor-pointer"
              >
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="bill_desc">Highest Bill</option>
                <option value="bill_asc">Lowest Bill</option>
                <option value="units_desc">Highest Consumption</option>
              </select>
            </div>
          </div>

          {/* Result count */}
          {!loading && reports.length > 0 && (
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Showing {sorted.length} of {reports.length} records
            </p>
          )}

          {/* States */}
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-blue rounded-full animate-spin" />
              <p className="text-xs text-slate-400 font-semibold">Loading energy reports…</p>
            </div>

          ) : sorted.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 py-20 px-6 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <HistIcon className="w-8 h-8 text-slate-400 dark:text-slate-600" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">No reports found</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                  {searchQuery
                    ? "No records match your search. Try different keywords."
                    : "You haven't saved any energy reports yet. Head to the Dashboard to run your first analysis!"}
                </p>
              </div>
              {!searchQuery && (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 h-10 px-5 text-xs font-bold rounded-xl text-white bg-primary-blue hover:bg-primary-blue/90 dark:bg-primary-green dark:text-slate-950 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm"
                >
                  <Zap className="w-3.5 h-3.5" /> Start New Energy Audit
                </Link>
              )}
            </div>

          ) : (
            /* ── Report cards grid ─────────────────────────────────── */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {sorted.map((report, index) => {
                const maxBill = Math.max(...sorted.map(r => r.estimatedBill));
                const barWidth = maxBill > 0 ? Math.round((report.estimatedBill / maxBill) * 100) : 0;

                return (
                  <motion.div
                    key={report.id}
                    custom={index}
                    variants={historyCardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ y: -6 }}
                    onClick={() => setSelectedReport(report)}
                    className="group bg-white/40 dark:bg-slate-950/20 backdrop-blur-xl border border-white/20 dark:border-slate-800/40 rounded-2xl p-5 shadow-md dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-lg hover:border-primary-blue/30 dark:hover:border-primary-green/30 cursor-pointer transition-[transform,border-color,box-shadow] duration-300 flex flex-col gap-4"
                  >
                    {/* Card top: date + actions */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-white/20 dark:bg-slate-900/30 border border-white/10 dark:border-white/5 flex items-center justify-center shrink-0">
                          <Calendar className="w-4 h-4 text-primary-blue dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            {formatShortDate(report.createdAt)}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-600">
                            {new Date(report.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="p-1.5 text-slate-400 hover:text-primary-blue dark:hover:text-blue-400 hover:bg-white/30 dark:hover:bg-slate-900/30 rounded-lg transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={e => handleDelete(report.id!, e)}
                          className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Bill amount (hero value) */}
                    <div>
                      <p className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-1">Estimated Bill</p>
                      <p className="text-2xl font-display font-extrabold text-primary-blue dark:text-primary-green">
                        ₹{report.estimatedBill}
                        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 ml-1">/mo</span>
                      </p>
                      {/* Animated bill bar — blue→green gradient */}
                      <div className="mt-2 h-1.5 bg-white/20 dark:bg-slate-900/40 rounded-full overflow-hidden">
                        <motion.div
                          custom={{ index, barWidth }}
                          variants={historyBarVariants}
                          initial="hidden"
                          animate="visible"
                          className="h-full rounded-full bg-gradient-to-r from-primary-blue to-primary-green"
                        />
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {[
                        { label: "Units",    value: `${report.totalUnits}`, unit: "kWh",   color: "text-slate-800 dark:text-slate-200" },
                        { label: "Savings",  value: `₹${report.savingsPotential}`, unit: "", color: "text-emerald-600 dark:text-emerald-400" },
                        { label: "Top User", value: report.highestConsumer, unit: "",      color: "text-rose-605 dark:text-rose-400" },
                      ].map(({ label, value, unit, color }) => (
                        <div key={label} className="bg-white/20 dark:bg-slate-900/30 border border-white/10 dark:border-white/5 rounded-xl p-2.5 hover:bg-white/30 dark:hover:bg-slate-900/50 transition-colors duration-200">
                          <p className="text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide">{label}</p>
                          <p className={`text-xs font-extrabold truncate ${color}`}>{value}<span className="text-[9px] text-slate-400 ml-0.5">{unit}</span></p>
                        </div>
                      ))}
                    </div>

                    {/* View link */}
                    <div className="flex items-center justify-end text-[10px] font-bold text-primary-blue dark:text-primary-green opacity-0 group-hover:opacity-100 transition-opacity gap-0.5">
                      View full report <ChevronRight className="w-3 h-3" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </main>

        {/* Right Sidebar Column - Sticky */}
        <aside className="hidden 2xl:flex 2xl:col-span-2 flex-col gap-6 sticky top-24 no-print select-none">
          <CarbonSavingsWidget />
        </aside>

      </div>

      {/* ── Detail Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedReport && (
          <div 
            ref={detailsModalRef}
            onKeyDown={handleDetailsModalKeyDown}
            tabIndex={-1}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 print:hidden outline-none"
            role="dialog"
            aria-modal="true"
            aria-labelledby="history-details-title"
            aria-describedby="history-details-desc"
          >
            <motion.div
              variants={modalOverlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setSelectedReport(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />

            <motion.div
              variants={modalContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative bg-white/95 dark:bg-slate-950/90 backdrop-blur-md w-full max-w-2xl rounded-3xl border border-slate-200/60 dark:border-slate-850 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col z-10 text-left"
            >
              {/* ─── PRINT ONLY MODAL HEADER ────────────────────────────────────────── */}
              <div className="hidden print:flex flex-col w-full border-b-2 border-primary-blue pb-4 p-6 mb-2 text-left z-10 bg-white dark:bg-slate-950">
                <div className="flex justify-between items-end">
                  <div>
                    <h1 className="text-xl font-black tracking-tight text-blue-900 flex items-center gap-2">
                      <span className="w-6 h-6 bg-gradient-to-br from-blue-600 to-teal-500 rounded-full flex items-center justify-center text-white text-[10px] font-extrabold">⚡</span>
                      SMART HOUSEHOLD ENERGY PORTAL
                    </h1>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      Historical Consumption & Carbon Footprint Audit Log
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-500 font-mono">
                    <div>Report Generated: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    <div>Account: {user?.email || "Govardhan"}</div>
                    <div>Security Status: Verified & Audited</div>
                  </div>
                </div>
              </div>
              {/* Soft ambient backgrounds */}
              <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary-blue/5 dark:bg-primary-blue/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-primary-green/5 dark:bg-primary-green/5 rounded-full blur-3xl pointer-events-none" />

              {/* Modal Header */}
              <div className="border-b border-slate-200/50 dark:border-slate-800/50 px-6 py-5 flex items-center justify-between bg-white/20 dark:bg-slate-950/20 backdrop-blur-sm z-10">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center border border-blue-500/20">
                      <HistIcon className="w-4 h-4 text-primary-blue dark:text-accent-neon" />
                    </div>
                    <h3 id="history-details-title" className="text-base font-extrabold text-slate-900 dark:text-white font-display">Energy Report Details</h3>
                  </div>
                  <p id="history-details-desc" className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">Calculated on {formatDate(selectedReport.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleModalExportCSV(selectedReport)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-850 text-slate-700 dark:text-slate-200 text-[10px] font-bold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-primary-blue dark:text-primary-green" /> CSV
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-850 text-slate-700 dark:text-slate-200 text-[10px] font-bold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-primary-blue dark:text-primary-green" /> PDF
                  </button>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-850 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">

                {/* Stats Grid */}
                {(() => {
                  const billSum = selectedReport.estimatedBill + selectedReport.savingsPotential;
                  const ratio = billSum > 0 ? selectedReport.savingsPotential / billSum : 0;
                  let grade = "A+";
                  let gradeColor = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
                  if (ratio > 0.4) {
                    grade = "D";
                    gradeColor = "text-rose-500 bg-rose-500/10 border-rose-500/20";
                  } else if (ratio > 0.25) {
                    grade = "C";
                    gradeColor = "text-amber-500 bg-amber-500/10 border-amber-500/20";
                  } else if (ratio > 0.1) {
                    grade = "B";
                    gradeColor = "text-blue-500 bg-blue-500/10 border-blue-500/20";
                  } else if (ratio > 0) {
                    grade = "A";
                    gradeColor = "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
                  }

                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { 
                          label: "Total Usage", 
                          value: `${selectedReport.totalUnits} kWh`, 
                          color: "text-slate-850 dark:text-slate-100",
                          icon: <Zap className="w-4 h-4 text-yellow-500" />,
                          iconBg: "bg-yellow-500/10 border-yellow-500/20"
                        },
                        { 
                          label: "Net Monthly Bill", 
                          value: `₹${selectedReport.estimatedBill}`, 
                          color: "text-primary-blue dark:text-primary-green",
                          icon: <IndianRupee className="w-4 h-4 text-blue-500 dark:text-primary-green" />,
                          iconBg: "bg-blue-500/10 dark:bg-emerald-500/10 border-blue-500/20 dark:border-emerald-500/20"
                        },
                        { 
                          label: "Savings Potential", 
                          value: `₹${selectedReport.savingsPotential}`, 
                          color: "text-emerald-600 dark:text-emerald-400",
                          icon: <TrendingDown className="w-4 h-4 text-emerald-500" />,
                          iconBg: "bg-emerald-500/10 border-emerald-500/20"
                        },
                        { 
                          label: "Efficiency Grade", 
                          value: `Grade ${grade}`, 
                          color: gradeColor.split(" ")[0],
                          icon: <Sparkles className="w-4 h-4" />,
                          iconBg: gradeColor.split(" ").slice(1).join(" ")
                        },
                      ].map(({ label, value, color, icon, iconBg }) => (
                        <div key={label} className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 hover:border-slate-350 dark:hover:border-slate-700 transition-all duration-300 flex flex-col items-center justify-center text-center relative group overflow-hidden">
                          <div className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center mb-2 border`}>
                            {icon}
                          </div>
                          <p className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</p>
                          <p className={`text-[15px] font-display font-extrabold mt-1 truncate ${color}`}>{value}</p>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {/* Appliance configurations */}
                <div className="space-y-2.5">
                  <h4 className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-2">
                    <span>Appliance Configurations</span>
                    <span className="h-px bg-slate-200/60 dark:bg-slate-850 flex-1"></span>
                  </h4>
                  <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-1">
                    {selectedReport.appliances.map((app, idx) => {
                      const kwh = Math.round(app.quantity * (app.watts / 1000) * app.hours * 30);
                      const percent = selectedReport.totalUnits > 0 ? Math.round((kwh / selectedReport.totalUnits) * 100) : 0;
                      const isHighLoad = app.watts >= 1000;

                      return (
                        <div key={idx} className="group bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border border-slate-200/50 dark:border-slate-800/50 hover:border-primary-blue/30 dark:hover:border-primary-green/30 rounded-2xl p-3 flex flex-col gap-2 transition-all duration-200">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            {/* Left: Icon + Title */}
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center border border-slate-200/50 dark:border-slate-800/50 group-hover:scale-105 transition-transform duration-200 shrink-0">
                                {getIconComponent(app.name)}
                              </div>
                              <div>
                                <p className="font-extrabold text-slate-850 dark:text-slate-200 text-xs sm:text-[13px]">{app.name}</p>
                                <p className="text-[10px] text-slate-400 font-semibold">{app.watts} W</p>
                              </div>
                            </div>

                            {/* Center: Details badges */}
                            <div className="flex items-center gap-2 sm:mx-auto">
                              <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 text-slate-600 dark:text-slate-400">
                                {app.quantity} Unit{app.quantity > 1 ? "s" : ""}
                              </span>
                              <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 text-slate-600 dark:text-slate-400">
                                {app.hours} hrs/day
                              </span>
                              {isHighLoad ? (
                                <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 flex items-center gap-1">
                                  High Load
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-green-500/10 border border-green-500/20 text-green-550 dark:text-green-400">
                                  Optimized
                                </span>
                              )}
                            </div>

                            {/* Right: Consumption */}
                            <div className="text-left sm:text-right shrink-0">
                              <p className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-[13px] tabular-nums">{kwh} <span className="text-[10px] font-medium text-slate-400">kWh</span></p>
                              <p className="text-[9px] font-bold text-slate-400">{percent}% share</p>
                            </div>
                          </div>
                          {/* consumption progress bar */}
                          <div className="h-1 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-primary-blue to-accent-neon dark:from-primary-green dark:to-accent-neon rounded-full"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Slab breakdown */}
                <div className="space-y-3">
                  {(() => {
                    const tState = selectedReport.tariffState || "ap";
                    const fRate  = selectedReport.customFlatRate || 7.5;
                    const billDetails = calculateBill(selectedReport.totalUnits, tState, fRate);
                    const activeSlabs = getSlabsForState(tState, fRate);

                    return (
                      <>
                        <h4 className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-2">
                          <span>{billDetails.stateName} Slab Breakdown</span>
                          <span className="h-px bg-slate-200/60 dark:bg-slate-850 flex-1"></span>
                        </h4>

                        <div className="bg-slate-50/50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 space-y-4">
                          {/* Visual Slab Bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                              <span>Slab Range & Rate</span>
                              <span className="text-primary-blue dark:text-primary-green">Current: {selectedReport.totalUnits} Units</span>
                            </div>
                            <div className="relative pt-4 pb-2">
                              {/* Segmented bar */}
                              <div className="h-3 bg-slate-200 dark:bg-slate-850 rounded-full flex overflow-hidden border border-slate-300/30 dark:border-slate-750">
                                {(() => {
                                  const totalLimit = activeSlabs.reduce((acc, slab) => acc + (slab.max === Infinity ? 200 : slab.max), 0);
                                  return activeSlabs.map((slab, idx) => {
                                    const unitsInSlab = Math.max(0, Math.min(selectedReport.totalUnits - slab.prev, slab.max));
                                    const isCurrent = unitsInSlab > 0;

                                    // Color codes
                                    let segmentColor = "bg-slate-300 dark:bg-slate-750 opacity-40";
                                    if (isCurrent) {
                                      if (idx === 0) segmentColor = "bg-emerald-500";
                                      else if (idx === 1) segmentColor = "bg-cyan-500";
                                      else if (idx === 2) segmentColor = "bg-amber-500";
                                      else segmentColor = "bg-rose-500";
                                    }

                                    // Proportional width calculation
                                    const maxVal = slab.max === Infinity ? 200 : slab.max;
                                    const widthPercent = (maxVal / totalLimit) * 100;

                                    return (
                                      <div 
                                        key={idx} 
                                        className={`h-full border-r border-white/20 last:border-r-0 transition-all duration-500 ${segmentColor}`}
                                        style={{ width: `${widthPercent}%` }}
                                        title={`${slab.limit}: ${slab.rate}`}
                                      />
                                    );
                                  });
                                })()}
                              </div>

                              {/* Slab Markers / Pointer */}
                              <div className="relative w-full flex justify-between mt-1 text-[9px] text-slate-400 font-semibold px-1">
                                {activeSlabs.map((slab, idx) => (
                                  <span key={idx} className="truncate max-w-[60px]">{slab.limit.replace("units", "u").replace("consumption", "all")}</span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Slab charges table */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Left Side: Slab details */}
                            <div className="border border-slate-200/50 dark:border-slate-800/50 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-850">
                              <div className="grid grid-cols-3 bg-slate-100/50 dark:bg-slate-900/50 py-2 px-3 font-bold text-slate-400 text-[9px] uppercase tracking-wider">
                                <span>Slab</span>
                                <span className="text-center">Rate</span>
                                <span className="text-right">Charges</span>
                              </div>
                              {activeSlabs.map((slab, idx) => {
                                const unitsInSlab = Math.max(0, Math.min(selectedReport.totalUnits - slab.prev, slab.max));
                                const slabCharge  = unitsInSlab * parseFloat(slab.rate.replace("₹", ""));
                                if (unitsInSlab === 0) return null;
                                return (
                                  <div key={idx} className="grid grid-cols-3 py-2 px-3 text-slate-600 dark:text-slate-400 font-medium">
                                    <span>{slab.limit.replace(" units", "")} <span className="text-[9px] text-slate-450">({unitsInSlab.toFixed(0)}u)</span></span>
                                    <span className="text-center font-semibold">{slab.rate}</span>
                                    <span className="text-right font-bold text-slate-700 dark:text-slate-350">₹{slabCharge.toFixed(0)}</span>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Right Side: Financial Breakdown Box */}
                            <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900/60 dark:to-slate-900/40 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/60 flex flex-col justify-between gap-2.5">
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-slate-600 dark:text-slate-400 font-semibold">
                                  <span>Gross Charges</span>
                                  <span className="font-extrabold text-slate-750 dark:text-slate-200">₹{billDetails.grossEnergyCharge.toFixed(2)}</span>
                                </div>
                                {billDetails.subsidy > 0 && (
                                  <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-semibold">
                                    <span>Govt. Subsidy</span>
                                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-extrabold">−₹{billDetails.subsidy.toFixed(2)}</span>
                                  </div>
                                )}
                              </div>
                              <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center">
                                <span className="font-bold text-slate-500 dark:text-slate-450 uppercase text-[9px] tracking-wider font-sans">Net Energy Bill</span>
                                <span className="text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-blue to-accent-neon dark:from-primary-green dark:to-accent-neon font-display">
                                  ₹{billDetails.netEnergyCharge.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Carbon footprint */}
                {(() => {
                  const units      = selectedReport.totalUnits;
                  const beforeCo2  = selectedReport.beforeCo2 ?? Math.round(units * 0.82 * 10) / 10;
                  const beforeTrees = Math.round((beforeCo2 / 1.83) * 10) / 10;
                  const savedCo2   = selectedReport.savedCo2 ?? 0;
                  const savedTrees = selectedReport.savedTrees ?? 0;

                  return (
                    <div className="bg-gradient-to-tr from-emerald-50/60 to-green-50/40 dark:from-emerald-950/20 dark:to-green-950/10 p-4 rounded-2xl border border-emerald-500/20 dark:border-emerald-800/30 flex flex-col sm:flex-row gap-4 items-center relative overflow-hidden group">
                      <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:scale-150 transition-all duration-700" />

                      {/* Swaying Leaf Icon */}
                      <div className="w-12 h-12 rounded-full bg-emerald-500/15 dark:bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0">
                        <Leaf className="w-6 h-6 text-emerald-600 dark:text-primary-green animate-bounce" style={{ animationDuration: "3s" }} />
                      </div>

                      <div className="space-y-1 text-left flex-1">
                        <h4 className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-500" /> Environmental Carbon Footprint
                        </h4>
                        <p className="text-slate-650 dark:text-slate-350 leading-relaxed font-medium">
                          This configuration generates <span className="font-extrabold text-slate-800 dark:text-white">{beforeCo2.toFixed(1)} kg CO₂/month</span>, 
                          requiring <span className="font-extrabold text-slate-800 dark:text-white">{beforeTrees.toFixed(0)} trees</span> to absorb.
                        </p>
                        {savedCo2 > 0 && (
                          <p className="text-emerald-650 dark:text-emerald-400 font-extrabold text-[10px] flex items-center gap-1 pt-0.5">
                            <span>★</span> Optimizations avoid {savedCo2.toFixed(1)} kg CO₂ (offsetting {savedTrees.toFixed(0)} more trees!)
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-200/50 dark:border-slate-800/50 flex justify-end bg-white/20 dark:bg-slate-950/20 backdrop-blur-sm z-10">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-5 py-2 text-xs font-bold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-105 dark:hover:bg-slate-850 border border-slate-200/60 dark:border-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirmation Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {deleteReportId && (
          <div 
            ref={deleteModalRef}
            onKeyDown={handleDeleteModalKeyDown}
            tabIndex={-1}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 outline-none"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-confirm-title"
            aria-describedby="delete-confirm-desc"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteReportId(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="relative w-full max-w-sm bg-white/60 dark:bg-slate-950/40 backdrop-blur-xl border border-white/20 dark:border-slate-800/40 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col p-6 text-center gap-5"
            >
              {/* Warning Icon Banner */}
              <div className="mx-auto w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-500 shrink-0">
                <AlertTriangle className="w-6 h-6 animate-bounce" style={{ animationDuration: "2.5s" }} />
              </div>

              <div className="space-y-2">
                <h3 id="delete-confirm-title" className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Delete Calculation?
                </h3>
                <p id="delete-confirm-desc" className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed font-semibold">
                  This will permanently delete this audit record from your cloud profile. This action cannot be undone.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3.5 pt-2">
                <button
                  onClick={() => setDeleteReportId(null)}
                  className="px-4.5 py-2.5 text-xs font-bold rounded-xl text-slate-650 dark:text-slate-400 hover:bg-white/30 dark:hover:bg-slate-900/30 border border-slate-200/60 dark:border-slate-800/60 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4.5 py-2.5 text-xs font-bold rounded-xl text-white bg-red-550 hover:bg-red-650 dark:bg-red-650 dark:hover:bg-red-600 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg shadow-red-500/10 cursor-pointer"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>

      {selectedReport && (
        <PrintReport
          mode="history"
          user={user}
          activeAppliances={selectedReport.appliances.map((app, idx) => ({
            id: app.name.toLowerCase().includes("ac") ? "ac" : app.name.toLowerCase().includes("fan") ? "fan" : app.name.toLowerCase().includes("light") ? "light" : `app_${idx}`,
            name: app.name,
            category: "general",
            watts: app.watts,
            quantity: app.quantity,
            hours: app.hours,
            icon: "Zap",
            hint: ""
          }))}
          analysisResult={{
            totalUnits: selectedReport.totalUnits,
            billing: {
              totalUnits: selectedReport.totalUnits,
              grossEnergyCharge: selectedReport.estimatedBill + selectedReport.savingsPotential,
              subsidy: selectedReport.savingsPotential > 0 ? selectedReport.savingsPotential * 0.15 : 0,
              netEnergyCharge: selectedReport.estimatedBill,
              stateName: selectedReport.tariffState || "ap"
            },
            highestConsumer: selectedReport.highestConsumer,
            savingsPotential: selectedReport.savingsPotential,
            usageAfter: selectedReport.usageAfter || selectedReport.totalUnits,
            billAfter: selectedReport.billAfter || selectedReport.estimatedBill,
            recommendations: [],
            beforeCo2: selectedReport.beforeCo2 || Math.round(selectedReport.totalUnits * 0.82),
            beforeTrees: Math.round((selectedReport.beforeCo2 || (selectedReport.totalUnits * 0.82)) / 1.83),
            afterCo2: selectedReport.afterCo2 || Math.round((selectedReport.usageAfter || selectedReport.totalUnits) * 0.82),
            afterTrees: Math.round((selectedReport.afterCo2 || ((selectedReport.usageAfter || selectedReport.totalUnits) * 0.82)) / 1.83),
            savedCo2: selectedReport.savedCo2 || 0,
            savedTrees: selectedReport.savedTrees || 0
          }}
          recommendedKw={Math.max(1, Math.round((selectedReport.totalUnits / 120) * 10) / 10)}
          solarOffsetPercent={selectedReport.totalUnits > 0 ? Math.min(100, Math.round(((Math.max(1, Math.round((selectedReport.totalUnits / 120) * 10) / 10) * 120) / selectedReport.totalUnits) * 100)) : 0}
        />
      )}
    </div>
  );
};
