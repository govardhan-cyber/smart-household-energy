import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { reportsService } from "../utils/reportsService";
import type { EnergyReport } from "../utils/reportsService";
import { 
  History as HistIcon, Search, Calendar, 
  Trash2, Eye, X, ArrowUpDown, Download, Printer, Leaf
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateBill, getSlabsForState } from "../utils/tariffCalculator";


export const History: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<EnergyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date_desc" | "date_asc" | "bill_desc" | "bill_asc" | "units_desc">("date_desc");
  
  // Selected report for detailed viewing in a Modal
  const [selectedReport, setSelectedReport] = useState<EnergyReport | null>(null);

  const handleModalExportCSV = (report: EnergyReport) => {
    const headers = ["Appliance", "Quantity", "Usage (hrs/day)", "Wattage (W)", "Estimated Monthly kWh"];
    const rows = report.appliances.map(app => {
      const kwh = Math.round(app.quantity * (app.watts / 1000) * app.hours * 30);
      return [app.name, app.quantity, app.hours, app.watts, kwh];
    });
    
    rows.push([]);
    rows.push(["Metric", "Value"]);
    rows.push(["Tariff Region/Scheme", report.tariffState ? report.tariffState.toUpperCase() : "AP"]);
    rows.push(["Total Monthly Units (kWh)", report.totalUnits.toString()]);
    rows.push(["Estimated Monthly Bill", `₹${report.estimatedBill}`]);
    rows.push(["Savings Potential", `₹${report.savingsPotential}`]);
    
    const beforeCo2 = report.beforeCo2 ?? Math.round(report.totalUnits * 0.82 * 10) / 10;
    const beforeTrees = Math.round((beforeCo2 / 1.83) * 10) / 10;
    rows.push(["CO2 Emissions (Before)", `${beforeCo2} kg`]);
    rows.push(["Equivalent Tree Offset", `${beforeTrees} trees`]);

    if (report.savedCo2 !== undefined) {
      rows.push(["CO2 Avoided", `${report.savedCo2} kg`]);
    }
    if (report.savedTrees !== undefined) {
      rows.push(["Additional Tree Offset", `${report.savedTrees} trees`]);
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Energy_Report_${new Date(report.createdAt).toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchReports = async () => {
    if (!user) return;
    
    const cacheKey = `she_reports_cache_${user.uid}`;
    
    // 1. Instantly load from cache if available to prevent loading state delays
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData) as EnergyReport[];
        setReports(parsed);
        setLoading(false);
      } catch (e) {
        console.error("Failed to parse cached reports:", e);
      }
    } else {
      setLoading(true);
    }

    // 2. Fetch fresh data from network in background
    try {
      const data = await reportsService.getUserReports(user.uid);
      setReports(data);
    } catch (e) {
      console.error("Failed to load reports:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [user]);

  const handleDelete = async (reportId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this calculation record?")) return;
    try {
      await reportsService.deleteReport(reportId);
      setReports(prev => prev.filter(r => r.id !== reportId));
      if (selectedReport?.id === reportId) {
        setSelectedReport(null);
      }
    } catch (error) {
      console.error("Failed to delete report:", error);
    }
  };

  // Filter & Sort Logic
  const filteredReports = reports.filter(r => {
    const searchLower = searchQuery.toLowerCase();
    const formattedDate = new Date(r.createdAt).toLocaleDateString().toLowerCase();
    const highestConsumer = r.highestConsumer.toLowerCase();
    return formattedDate.includes(searchLower) || highestConsumer.includes(searchLower) || r.totalUnits.toString().includes(searchLower) || r.estimatedBill.toString().includes(searchLower);
  });

  const sortedReports = [...filteredReports].sort((a, b) => {
    if (sortBy === "date_desc") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === "date_asc") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sortBy === "bill_desc") {
      return b.estimatedBill - a.estimatedBill;
    }
    if (sortBy === "bill_asc") {
      return a.estimatedBill - b.estimatedBill;
    }
    if (sortBy === "units_desc") {
      return b.totalUnits - a.totalUnits;
    }
    return 0;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6 text-left">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <HistIcon className="w-7 h-7 text-primary-blue dark:text-primary-green" />
            My Energy History
          </h1>
          <p className="text-sm font-semibold text-slate-550 dark:text-slate-450 mt-1">
            Access, view details, and manage your previously saved energy reports.
          </p>
        </div>
      </div>

      {/* Search & Sort Panel */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reports by date, consumption, bill, or highest consumer..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-blue/10 dark:text-white"
          />
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 shrink-0">
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-50 dark:bg-slate-850 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none dark:text-white"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="bill_desc">Highest Bill</option>
            <option value="bill_asc">Lowest Bill</option>
            <option value="units_desc">Highest Consumption</option>
          </select>
        </div>
      </div>

      {/* Records container */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-blue rounded-full animate-spin"></div>
          <p className="mt-3 text-xs text-slate-400 font-semibold">Loading energy reports...</p>
        </div>
      ) : sortedReports.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 py-16 px-4 text-center space-y-4 shadow-sm">
          <HistIcon className="w-12 h-12 text-slate-350 dark:text-slate-700 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 dark:text-white">No calculation records found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              {searchQuery 
                ? "We couldn't find any calculations matching your search parameters. Try altering your filter query." 
                : "You haven't generated any energy report calculations yet. Visit the Dashboard to create your first report!"
              }
            </p>
          </div>
          {!searchQuery && (
            <div className="pt-2">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 h-10 px-5 text-xs font-bold rounded-xl text-white bg-primary-blue hover:bg-primary-blue/90 dark:bg-primary-green dark:text-slate-950 dark:hover:bg-primary-green/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm"
              >
                Start New Energy Audit
              </Link>
            </div>
          )}
        </div>
      ) : (
        /* History Table Wrapper */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-450 uppercase tracking-wider h-12">
                  <th className="px-6">Date Generated</th>
                  <th className="px-6">Monthly Units</th>
                  <th className="px-6">Estimated Bill</th>
                  <th className="px-6">Highest Consumer</th>
                  <th className="px-6">Savings Potential</th>
                  <th className="px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-800 text-xs font-semibold text-slate-655 dark:text-slate-350">
                {sortedReports.map((report) => (
                  <tr 
                    key={report.id} 
                    onClick={() => setSelectedReport(report)}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors h-14"
                  >
                    <td className="px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{formatDate(report.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-6 whitespace-nowrap">
                      <span className="font-bold text-slate-800 dark:text-slate-100">{report.totalUnits}</span> kWh
                    </td>
                    <td className="px-6 whitespace-nowrap text-primary-blue dark:text-primary-green font-bold">
                      ₹{report.estimatedBill}
                    </td>
                    <td className="px-6 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full bg-red-50 text-alert-red border border-red-100 dark:bg-red-950/20 dark:border-red-900/40 text-[10px] font-bold">
                        {report.highestConsumer}
                      </span>
                    </td>
                    <td className="px-6 whitespace-nowrap text-green-600 font-bold">
                      ₹{report.savingsPotential}
                    </td>
                    <td className="px-6 whitespace-nowrap text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="p-2 text-slate-400 hover:text-primary-blue hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(report.id!, e)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                          title="Delete Calculation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAIL MODAL DIALOG */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReport(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            ></motion.div>

            {/* Modal Content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-850 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col z-10 text-left"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-150 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Energy Report Details</h3>
                  <p className="text-[11px] font-semibold text-slate-400 mt-0.5">Calculated on {formatDate(selectedReport.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2 no-print">
                  <button
                    onClick={() => handleModalExportCSV(selectedReport)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-250 dark:border-slate-800 hover:bg-slate-150 dark:hover:bg-slate-800 text-slate-550 dark:text-slate-400 text-[10px] font-bold transition-all cursor-pointer"
                    title="Export CSV data"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-250 dark:border-slate-800 hover:bg-slate-150 dark:hover:bg-slate-800 text-slate-550 dark:text-slate-400 text-[10px] font-bold transition-all cursor-pointer"
                    title="Print PDF report"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print PDF</span>
                  </button>
                  <button 
                    onClick={() => setSelectedReport(null)}
                    className="p-1.5 rounded-xl border border-slate-250 dark:border-slate-800 hover:bg-slate-150 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Usage</span>
                    <p className="text-xl font-display font-extrabold text-slate-800 dark:text-slate-250 mt-1">{selectedReport.totalUnits} kWh</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Net Monthly Bill</span>
                    <p className="text-xl font-display font-extrabold text-primary-blue dark:text-primary-green mt-1">₹{selectedReport.estimatedBill}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Savings Potential</span>
                    <p className="text-xl font-display font-extrabold text-green-600 mt-1">₹{selectedReport.savingsPotential}</p>
                  </div>
                </div>

                {/* Grid of Appliance Configurations */}
                <div className="space-y-2.5">
                  <h4 className="font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider text-[10px]">Appliance Configurations</h4>
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-150 dark:divide-slate-800">
                    <div className="grid grid-cols-4 bg-slate-50 dark:bg-slate-850 px-4 py-2 font-bold text-slate-500">
                      <span>Appliance</span>
                      <span className="text-center">Quantity</span>
                      <span className="text-center">Hours / Day</span>
                      <span className="text-right">Est. Monthly kWh</span>
                    </div>
                    {selectedReport.appliances.map((app, idx) => {
                      const kwh = Math.round(app.quantity * (app.watts / 1000) * app.hours * 30);
                      return (
                        <div key={idx} className="grid grid-cols-4 px-4 py-2.5 font-semibold text-slate-750 dark:text-slate-300">
                          <span>{app.name} <span className="text-[10px] text-slate-400 font-semibold">({app.watts}W)</span></span>
                          <span className="text-center">{app.quantity}</span>
                          <span className="text-center">{app.hours} hrs</span>
                          <span className="text-right font-bold">{kwh} kWh</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Slabs breakdown details */}
                <div className="space-y-2.5">
                  {(() => {
                    const tState = selectedReport.tariffState || "ap";
                    const fRate = selectedReport.customFlatRate || 7.5;
                    const billDetails = calculateBill(selectedReport.totalUnits, tState, fRate);
                    return (
                      <>
                        <h4 className="font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider text-[10px]">
                          {billDetails.stateName} Slab breakdown (Calculated for {selectedReport.totalUnits} units)
                        </h4>
                        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 text-xs">
                          <div className="grid grid-cols-3 bg-slate-50 dark:bg-slate-850 py-2 px-4 font-bold text-slate-500">
                            <span>Consumption Slab</span>
                            <span className="text-center">Tariff Rate</span>
                            <span className="text-right">Charges</span>
                          </div>
                          <div className="divide-y divide-slate-150 dark:divide-slate-800">
                            {getSlabsForState(tState, fRate).map((slab, idx) => {
                              const unitsInSlab = Math.max(0, Math.min(selectedReport.totalUnits - slab.prev, slab.max));
                              const slabRateNum = parseFloat(slab.rate.replace("₹", ""));
                              const slabCharge = unitsInSlab * slabRateNum;

                              if (unitsInSlab === 0) return null;

                              return (
                                <div key={idx} className="grid grid-cols-3 py-2 px-4 text-slate-655 dark:text-slate-350">
                                  <span>{slab.limit} <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">({unitsInSlab.toFixed(1)} units)</span></span>
                                  <span className="text-center">{slab.rate}</span>
                                  <span className="text-right font-semibold">₹{slabCharge.toFixed(2)}</span>
                                </div>
                              );
                            })}
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-850 p-4 border-t border-slate-200 dark:border-slate-850 space-y-1.5 text-xs text-slate-600 dark:text-slate-350">
                            <div className="flex justify-between">
                              <span>Gross Energy Charge:</span>
                              <span className="font-semibold">₹{billDetails.grossEnergyCharge.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-primary-green">
                              <span>Less Govt. Subsidy:</span>
                              <span className="font-bold">-₹{billDetails.subsidy.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-white pt-1.5 border-t border-slate-150 dark:border-slate-850">
                              <span>Net Energy Charges:</span>
                              <span className="text-primary-blue dark:text-primary-green">₹{billDetails.netEnergyCharge.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Environmental Carbon Footprint Card */}
                {(() => {
                  const units = selectedReport.totalUnits;
                  const beforeCo2 = selectedReport.beforeCo2 ?? Math.round(units * 0.82 * 10) / 10;
                  const beforeTrees = Math.round((beforeCo2 / 1.83) * 10) / 10;
                  
                  return (
                    <div className="bg-gradient-to-tr from-green-50 to-emerald-50 dark:from-emerald-950/20 dark:to-green-950/15 p-5 rounded-2xl border border-green-200 dark:border-green-900/40 space-y-2 text-left">
                      <h4 className="text-xs font-bold text-green-700 dark:text-primary-green flex items-center gap-1.5 uppercase tracking-wider">
                        <Leaf className="w-4 h-4 text-green-600 dark:text-primary-green" />
                        Environmental Carbon Footprint
                      </h4>
                      <p className="text-xs text-slate-655 dark:text-slate-400">
                        This energy configuration generates estimated CO2 emissions of <span className="font-bold text-slate-800 dark:text-white">{beforeCo2.toFixed(1)} kg</span> per month.
                        It requires <span className="font-bold text-slate-800 dark:text-white">{beforeTrees.toFixed(0)} trees</span> to absorb these emissions.
                        {selectedReport.savedCo2 !== undefined && selectedReport.savedCo2 > 0 && (
                          <span className="block mt-1 text-primary-green font-semibold">
                            With recommended optimizations, you can avoid {selectedReport.savedCo2.toFixed(1)} kg of CO2, offsetting {selectedReport.savedTrees?.toFixed(0)} additional trees!
                          </span>
                        )}
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-150 dark:border-slate-800 flex justify-end bg-slate-50 dark:bg-slate-900">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-655 dark:text-slate-400 hover:bg-slate-150 dark:hover:bg-slate-800 transition-colors"
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
