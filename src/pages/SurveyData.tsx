import React, { useState } from "react";
import { surveyData } from "../utils/tariffCalculator";
import type { SurveyRecord } from "../utils/tariffCalculator";
import { Search, SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, LayoutList } from "lucide-react";

export const SurveyData: React.FC = () => {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [applianceFilter, setApplianceFilter] = useState<number | "all">("all");
  const [billFilter, setBillFilter] = useState<"all" | "low" | "medium" | "high">("all");
  const [userFilter, setUserFilter] = useState<"all" | "high_user" | "low_user">("all");
  
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
    // High user threshold: >= 200 kWh, Low user: < 200 kWh
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

  const getSortIcon = (field: keyof SurveyRecord) => {
    if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 text-slate-300 ml-1.5 shrink-0" />;
    return <ArrowUpDown className={`w-3.5 h-3.5 ml-1.5 shrink-0 ${sortAsc ? "text-primary-blue dark:text-primary-green" : "text-slate-800 dark:text-white"}`} />;
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6 text-left">
      
      {/* Title */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <LayoutList className="w-7 h-7 text-primary-blue dark:text-primary-green" />
          Household Survey Data
        </h1>
        <p className="text-sm font-semibold text-slate-550 dark:text-slate-450 mt-1">
          Review collected survey results across 30 active domestic households in Andhra Pradesh.
        </p>
      </div>

      {/* Control Filters Area */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by household name, member ID, or highest energy consumer..."
            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-blue/10 dark:text-white"
          />
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Appliance Count Filter */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Appliance Count</label>
            <select
              value={applianceFilter}
              onChange={(e) => {
                setApplianceFilter(e.target.value === "all" ? "all" : parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-250 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none dark:text-white"
            >
              <option value="all">All Appliances Counts</option>
              <option value="3">3 Appliances</option>
              <option value="4">4 Appliances</option>
              <option value="5">5 Appliances</option>
              <option value="6">6 Appliances</option>
              <option value="7">7 Appliances</option>
            </select>
          </div>

          {/* Bill Range Filter */}
          <div className="space-y-1.5">
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
          <div className="space-y-1.5">
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
              <option value="high_user">High Consumers (&gt;= 200 kWh)</option>
              <option value="low_user">Low Consumers (&lt; 200 kWh)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count Banner */}
      <div className="text-xs font-bold text-slate-450 dark:text-slate-550 uppercase tracking-wider pl-1">
        Showing {filteredData.length} of {surveyData.length} records
      </div>

      {/* Table Container */}
      {filteredData.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-250 dark:border-slate-800 py-16 px-4 text-center space-y-2">
          <SlidersHorizontal className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900 dark:text-white">No search matches found</h3>
          <p className="text-xs text-slate-500">Adjust or reset your active filters to search again.</p>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-800 text-xs font-semibold text-slate-655 dark:text-slate-350">
                {currentRows.map((row) => (
                  <tr key={row.memberId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors h-14">
                    <td className="px-6 whitespace-nowrap font-bold text-slate-900 dark:text-white">
                      {row.memberId}
                    </td>
                    <td className="px-6 whitespace-nowrap font-bold text-slate-800 dark:text-slate-200">
                      {row.householdName}
                    </td>
                    <td className="px-6">
                      <div className="flex flex-wrap gap-1 items-center max-w-[280px]">
                        {row.appliancesSelected.slice(0, 3).map((app, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500 font-bold">
                            {app}
                          </span>
                        ))}
                        {row.appliancesSelected.length > 3 && (
                          <span className="text-[10px] text-slate-400 font-bold">
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
                    <td className="px-6 whitespace-nowrap text-green-600 font-bold">
                      ₹{row.savingsPotential}
                    </td>
                  </tr>
                ))}
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
    </div>
  );
};
