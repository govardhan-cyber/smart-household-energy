import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { reportsService } from "../utils/reportsService";
import type { EnergyReport } from "../utils/reportsService";
import {
  History as HistIcon, Search, Calendar,
  Trash2, Eye, X, ArrowUpDown, Download, Printer, Leaf,
  Zap, TrendingDown, Bolt, ChevronRight, BarChart3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateBill, getSlabsForState } from "../utils/tariffCalculator";

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
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
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

  const handleDelete = async (reportId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Delete this calculation record?")) return;
    try {
      await reportsService.deleteReport(reportId);
      setReports(prev => prev.filter(r => r.id !== reportId));
      if (selectedReport?.id === reportId) setSelectedReport(null);
    } catch (error) { console.error("Delete failed:", error); }
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

  /* ── render ───────────────────────────────────────────────────── */
  return (
    <div className="flex-1 bg-transparent transition-colors duration-300 min-h-screen">

      {/* ── Hero header ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-blue via-blue-600 to-primary-green py-12 px-4 sm:px-6 lg:px-8">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
                <HistIcon className="w-3 h-3" />
                Energy Reports
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white">My Energy History</h1>
              <p className="text-sm text-blue-100/80">Access, compare, and manage your previously saved energy reports.</p>
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

      {/* ── Main content ────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">

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
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.05 }}
                  onClick={() => setSelectedReport(report)}
                  className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-primary-blue/30 dark:hover:border-primary-green/30 cursor-pointer transition-all duration-200 flex flex-col gap-4"
                >
                  {/* Card top: date + actions */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
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
                        className="p-1.5 text-slate-400 hover:text-primary-blue dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={e => handleDelete(report.id!, e)}
                        className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Bill amount (hero value) */}
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Estimated Bill</p>
                    <p className="text-2xl font-display font-extrabold text-primary-blue dark:text-primary-green">
                      ₹{report.estimatedBill}
                      <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 ml-1">/mo</span>
                    </p>
                    {/* Animated bill bar — blue→green gradient */}
                    <div className="mt-2 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${barWidth}%` }}
                        transition={{ duration: 0.7, delay: index * 0.06 + 0.25, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-primary-blue to-primary-green"
                      />
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { label: "Units",    value: `${report.totalUnits}`, unit: "kWh",   color: "text-slate-800 dark:text-slate-200" },
                      { label: "Savings",  value: `₹${report.savingsPotential}`, unit: "", color: "text-emerald-600 dark:text-emerald-400" },
                      { label: "Top User", value: report.highestConsumer, unit: "",      color: "text-rose-600 dark:text-rose-400" },
                    ].map(({ label, value, unit, color }) => (
                      <div key={label} className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-2.5">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{label}</p>
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
      </div>

      {/* ── Detail Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedReport(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col z-10 text-left"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-primary-blue to-primary-green px-6 py-4 flex items-center justify-between text-white">
                <div>
                  <h3 className="text-base font-bold">Energy Report Details</h3>
                  <p className="text-[11px] text-blue-100/80 mt-0.5">Calculated on {formatDate(selectedReport.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleModalExportCSV(selectedReport)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 text-white text-[10px] font-bold transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> CSV
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 text-white text-[10px] font-bold transition-all cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" /> PDF
                  </button>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="p-1.5 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Total Usage",      value: `${selectedReport.totalUnits} kWh`, color: "text-slate-800 dark:text-slate-100" },
                    { label: "Net Monthly Bill",  value: `₹${selectedReport.estimatedBill}`, color: "text-primary-blue dark:text-primary-green" },
                    { label: "Savings Potential", value: `₹${selectedReport.savingsPotential}`, color: "text-emerald-600 dark:text-emerald-400" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                      <p className={`text-lg font-display font-extrabold mt-1 ${color}`}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Appliance table */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">Appliance Configurations</h4>
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                    <div className="grid grid-cols-4 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 font-bold text-slate-400 text-[10px] uppercase tracking-wider">
                      <span>Appliance</span>
                      <span className="text-center">Qty</span>
                      <span className="text-center">Hrs/Day</span>
                      <span className="text-right">Monthly kWh</span>
                    </div>
                    {selectedReport.appliances.map((app, idx) => {
                      const kwh = Math.round(app.quantity * (app.watts / 1000) * app.hours * 30);
                      return (
                        <div key={idx} className="grid grid-cols-4 px-4 py-2.5 text-slate-700 dark:text-slate-300">
                          <span className="font-semibold">{app.name} <span className="text-[10px] text-slate-400">({app.watts}W)</span></span>
                          <span className="text-center">{app.quantity}</span>
                          <span className="text-center">{app.hours} hrs</span>
                          <span className="text-right font-bold">{kwh} kWh</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Slab breakdown */}
                <div className="space-y-2">
                  {(() => {
                    const tState = selectedReport.tariffState || "ap";
                    const fRate  = selectedReport.customFlatRate || 7.5;
                    const billDetails = calculateBill(selectedReport.totalUnits, tState, fRate);
                    return (
                      <>
                        <h4 className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">
                          {billDetails.stateName} Slab Breakdown ({selectedReport.totalUnits} units)
                        </h4>
                        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                          <div className="grid grid-cols-3 bg-slate-50 dark:bg-slate-900 py-2.5 px-4 font-bold text-slate-400 text-[10px] uppercase tracking-wider">
                            <span>Slab</span>
                            <span className="text-center">Rate</span>
                            <span className="text-right">Charges</span>
                          </div>
                          <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {getSlabsForState(tState, fRate).map((slab, idx) => {
                              const unitsInSlab = Math.max(0, Math.min(selectedReport.totalUnits - slab.prev, slab.max));
                              const slabCharge  = unitsInSlab * parseFloat(slab.rate.replace("₹", ""));
                              if (unitsInSlab === 0) return null;
                              return (
                                <div key={idx} className="grid grid-cols-3 py-2.5 px-4 text-slate-600 dark:text-slate-400">
                                  <span>{slab.limit} <span className="text-[10px] text-slate-400">({unitsInSlab.toFixed(1)} u)</span></span>
                                  <span className="text-center">{slab.rate}</span>
                                  <span className="text-right font-semibold">₹{slabCharge.toFixed(2)}</span>
                                </div>
                              );
                            })}
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-900/80 p-4 border-t border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                            <div className="flex justify-between text-slate-600 dark:text-slate-400">
                              <span>Gross Energy Charge</span>
                              <span className="font-semibold">₹{billDetails.grossEnergyCharge.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                              <span>Less Govt. Subsidy</span>
                              <span className="font-bold">−₹{billDetails.subsidy.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-white pt-1.5 border-t border-slate-200 dark:border-slate-800">
                              <span>Net Energy Charges</span>
                              <span className="text-primary-blue dark:text-primary-green">₹{billDetails.netEnergyCharge.toFixed(2)}</span>
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
                  return (
                    <div className="bg-gradient-to-tr from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/20 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800/40 space-y-2">
                      <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                        <Leaf className="w-4 h-4" /> Environmental Carbon Footprint
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        This configuration generates{" "}
                        <span className="font-bold text-slate-900 dark:text-white">{beforeCo2.toFixed(1)} kg CO₂/month</span>,
                        requiring <span className="font-bold text-slate-900 dark:text-white">{beforeTrees.toFixed(0)} trees</span> to absorb.
                        {selectedReport.savedCo2 !== undefined && selectedReport.savedCo2 > 0 && (
                          <span className="block mt-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                            Optimizations could avoid {selectedReport.savedCo2.toFixed(1)} kg CO₂, offsetting {selectedReport.savedTrees?.toFixed(0)} more trees!
                          </span>
                        )}
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50 dark:bg-slate-900/80">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-5 py-2 text-xs font-bold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
