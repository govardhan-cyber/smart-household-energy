import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Printer, X, AlertTriangle } from "lucide-react";
import type { BillRecord } from "../../../pages/BillAnalyzer";

interface BillModalsProps {
  selectedBillForModal: BillRecord | null;
  setSelectedBillForModal: (record: BillRecord | null) => void;
  deleteBillId: string | null;
  setDeleteBillId: (id: string | null) => void;
  handleConfirmDelete: () => void;
  modalCalcs: {
    co2: number;
    score: number;
    grade: string;
    forecastAmount: number;
    confidence: number;
    pieData: { name: string; value: number }[];
    recommendations: { title: string; desc: string; savings: number; difficulty: string; impact: string }[];
  } | null;
  handleExportCSV: (bill: BillRecord | null) => void;
  formatDate: (dateStr: string) => string;
  detailsModalRef: React.RefObject<HTMLDivElement | null>;
  deleteModalRef: React.RefObject<HTMLDivElement | null>;
  handleDetailsModalKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  handleDeleteModalKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  userEmail?: string;
}

export const BillModals: React.FC<BillModalsProps> = ({
  selectedBillForModal,
  setSelectedBillForModal,
  deleteBillId,
  setDeleteBillId,
  handleConfirmDelete,
  modalCalcs,
  handleExportCSV,
  formatDate,
  detailsModalRef,
  deleteModalRef,
  handleDetailsModalKeyDown,
  handleDeleteModalKeyDown,
  userEmail = "Govardhan"
}) => {
  return (
    <AnimatePresence>
      {/* ─── BILL DETAILS MODAL DIALOG ────────────────────────────────────────── */}
      {selectedBillForModal && (
        <div 
          ref={detailsModalRef}
          onKeyDown={handleDetailsModalKeyDown}
          tabIndex={-1}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 print-modal-parent outline-none"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bill-details-title"
          aria-describedby="bill-details-desc"
        >
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedBillForModal(null)}
            className="absolute inset-0 bg-slate-955/60 backdrop-blur-sm"
          ></motion.div>

          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-850 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col z-10 text-left"
          >
            {/* ─── PRINT ONLY MODAL HEADER ────────────────────────────────────────── */}
            <div className="hidden print:flex flex-col w-full border-b border-slate-200 pb-3 mb-4 text-left p-6 bg-white dark:bg-slate-900 z-10">
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-xl font-black tracking-tight text-blue-900 flex items-center gap-2">
                    <span className="w-6 h-6 bg-gradient-to-br from-blue-600 to-teal-500 rounded-full flex items-center justify-center text-white text-[10px] font-extrabold">⚡</span>
                    SMART HOUSEHOLD ENERGY PORTAL
                  </h1>
                  <p className="text-xs text-slate-505 mt-1 font-medium">
                    Electricity Bill OCR Extraction & Slab Tariff Analysis Report
                  </p>
                </div>
                <div className="text-right text-xs text-slate-500 font-mono">
                  <div>Report Generated: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  <div>Account: {userEmail}</div>
                  <div>Security Status: Verified & Audited</div>
                </div>
              </div>
            </div>
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-150 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
              <div>
                <h3 id="bill-details-title" className="text-lg font-bold text-slate-900 dark:text-white">Electricity Bill Details</h3>
                <p id="bill-details-desc" className="text-[11px] font-semibold text-slate-400 mt-0.5">Uploaded on {formatDate(selectedBillForModal.uploadDate)}</p>
              </div>
              <div className="flex items-center gap-2 no-print">
                <button
                  onClick={() => handleExportCSV(selectedBillForModal)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-255 dark:border-slate-800 hover:bg-slate-150 dark:hover:bg-slate-800 text-slate-550 dark:text-slate-400 text-[10px] font-bold transition-all cursor-pointer"
                  title="Export CSV data"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-255 dark:border-slate-800 hover:bg-slate-150 dark:hover:bg-slate-800 text-slate-550 dark:text-slate-400 text-[10px] font-bold transition-all cursor-pointer"
                  title="Print PDF report"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print PDF</span>
                </button>
                <button 
                  onClick={() => setSelectedBillForModal(null)}
                  aria-label="Close bill details"
                  className="p-1.5 rounded-xl border border-slate-255 dark:border-slate-800 hover:bg-slate-150 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
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
                  <p className="text-xl font-display font-extrabold text-slate-800 dark:text-slate-250 mt-1">{selectedBillForModal.parsedData.unitsConsumed} kWh</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Net Monthly Bill</span>
                  <p className="text-xl font-display font-extrabold text-primary-blue dark:text-primary-green mt-1">₹{selectedBillForModal.parsedData.totalAmount}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-955 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Savings Potential</span>
                  <p className="text-xl font-display font-extrabold text-green-600 mt-1">₹{modalCalcs?.recommendations.reduce((acc, r) => acc + r.savings, 0) || 0}</p>
                </div>
              </div>

              {/* Extracted Bill Metadata */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider text-[10px]">Extracted Bill Metadata</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-655 dark:text-slate-350 font-semibold">
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block">Consumer Name</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate block mt-0.5">{selectedBillForModal.parsedData.consumerName || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block">Service ID / Customer ID</span>
                    <span className="font-mono text-slate-850 dark:text-slate-200 block mt-0.5">{selectedBillForModal.parsedData.serviceNumber || "N/A"} / {selectedBillForModal.parsedData.customerID || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block">Billing Period</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5">{selectedBillForModal.parsedData.billingPeriod || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block">Tariff Category</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5">{selectedBillForModal.parsedData.tariffCategory || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-455 dark:text-slate-500 uppercase font-bold block font-sans">Bill Date / Due Date</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-0.5">{selectedBillForModal.parsedData.billDate || "N/A"} / <span className="text-red-500">{selectedBillForModal.parsedData.dueDate || "N/A"}</span></span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block">Billing Address</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300 block mt-0.5 leading-relaxed">{selectedBillForModal.parsedData.address || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Extracted Charges Breakdown */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider text-[10px]">Extracted Charges Breakdown</h4>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-150 dark:divide-slate-800 text-xs">
                  <div className="grid grid-cols-3 bg-slate-50 dark:bg-slate-850 px-4 py-2 font-bold text-slate-500">
                    <span>Charge Component</span>
                    <span className="text-center">Rate Category / Detail</span>
                    <span className="text-right">Est. Amount (INR)</span>
                  </div>
                  
                  <div className="grid grid-cols-3 px-4 py-2.5 font-semibold text-slate-750 dark:text-slate-300">
                    <span>Energy Charges</span>
                    <span className="text-center text-slate-450 text-[10px] font-normal">Active consumption fee</span>
                    <span className="text-right font-bold text-slate-800 dark:text-white">₹{selectedBillForModal.parsedData.energyCharge}</span>
                  </div>

                  <div className="grid grid-cols-3 px-4 py-2.5 font-semibold text-slate-750 dark:text-slate-300">
                    <span>Fixed / Demand Charges</span>
                    <span className="text-center text-slate-450 text-[10px] font-normal">Contracted load charge</span>
                    <span className="text-right font-bold text-slate-800 dark:text-white">₹{selectedBillForModal.parsedData.fixedCharge}</span>
                  </div>

                  <div className="grid grid-cols-3 px-4 py-2.5 font-semibold text-slate-750 dark:text-slate-300">
                    <span>Taxes & Duties</span>
                    <span className="text-center text-slate-450 text-[10px] font-normal">State electricity tax/duty</span>
                    <span className="text-right font-bold text-slate-800 dark:text-white">₹{selectedBillForModal.parsedData.tax}</span>
                  </div>

                  <div className="grid grid-cols-3 px-4 py-2.5 font-semibold text-slate-750 dark:text-slate-300">
                    <span>Other Charges / Surcharges</span>
                    <span className="text-center text-slate-450 text-[10px] font-normal">Fuel surcharge & adjustments</span>
                    <span className="text-right font-bold text-slate-800 dark:text-white">₹{selectedBillForModal.parsedData.otherCharges}</span>
                  </div>

                  <div className="grid grid-cols-3 bg-slate-50/50 dark:bg-slate-850/50 px-4 py-2.5 font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800">
                    <span>Total Invoice Amount</span>
                    <span className="text-center text-[10px] text-slate-400 font-normal">Final bill summary</span>
                    <span className="text-right font-extrabold text-primary-blue dark:text-primary-green">₹{selectedBillForModal.parsedData.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* AI Insights */}
              {selectedBillForModal.parsedData.energyInsights && selectedBillForModal.parsedData.energyInsights.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider text-[10px]">AI Energy Insights</h4>
                  <ul className="space-y-2 bg-slate-50/30 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-350 leading-relaxed font-semibold">
                    {selectedBillForModal.parsedData.energyInsights.map((insight, idx) => (
                      <li key={idx} className="flex gap-2 items-start">
                        <span className="p-0.5 px-1.5 rounded bg-green-50 dark:bg-green-950/20 text-primary-green text-[9px] font-bold shrink-0 mt-0.5">
                          0{idx + 1}
                        </span>
                        <p className="text-slate-650 dark:text-slate-300">{insight}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* BEE Recommendations */}
              {modalCalcs && modalCalcs.recommendations && modalCalcs.recommendations.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider text-[10px]">BEE Saving Recommendations</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {modalCalcs.recommendations.map((rec, i) => (
                      <motion.div 
                        key={i} 
                        whileHover={{ 
                          y: -4, 
                          scale: 1.015,
                          boxShadow: "0 12px 24px -10px rgba(0,0,0,0.06)"
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md space-y-2.5 text-left hover:border-slate-350 dark:hover:border-slate-700 transition-all duration-300 relative overflow-hidden group/modalrec"
                      >
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent translate-y-[-100%] group-hover/modalrec:translate-y-[100%] transition-transform duration-1000 ease-out pointer-events-none" />

                        <div className="flex justify-between items-start gap-2">
                          <h5 className="font-extrabold text-slate-850 dark:text-white text-xs">{rec.title}</h5>
                          <span className="px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-455 whitespace-nowrap shadow-[0_2px_8px_rgba(16,185,129,0.08)]">
                            ₹{rec.savings}/mo
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">{rec.desc || "Reduce usage time or upgrade appliance to save energy."}</p>
                        <div className="flex items-center gap-1.5 pt-1 text-[8px] font-black uppercase tracking-widest">
                          <span className={`px-2 py-0.5 border rounded-md ${
                            rec.difficulty === "Easy" 
                              ? "bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_2px_6px_rgba(16,185,129,0.06)]" 
                              : rec.difficulty === "Medium" 
                              ? "bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-[0_2px_6px_rgba(59,130,246,0.06)]" 
                              : "bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_2px_6px_rgba(239,68,68,0.06)]"
                          }`}>
                            Diff: {rec.difficulty}
                          </span>
                          <span className="px-2 py-0.5 border rounded-md bg-slate-100/50 dark:bg-slate-800/40 border-slate-200/40 dark:border-slate-800/40 text-slate-500 dark:text-slate-400">
                            Impact: {rec.impact}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-150 dark:border-slate-800 flex justify-end bg-slate-50 dark:bg-slate-900 no-print">
              <button
                onClick={() => setSelectedBillForModal(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-655 dark:text-slate-400 hover:bg-slate-150 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ─────────────────────────────────────────── */}
      {deleteBillId && (
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
            onClick={() => setDeleteBillId(null)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="relative w-full max-w-sm bg-white/60 dark:bg-slate-955/40 backdrop-blur-xl border border-white/20 dark:border-slate-800/40 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col p-6 text-center gap-5"
          >
            {/* Warning Icon Banner */}
            <div className="mx-auto w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-500 shrink-0">
              <AlertTriangle className="w-6 h-6 animate-bounce" style={{ animationDuration: "2.5s" }} />
            </div>

            <div className="space-y-2">
              <h3 id="delete-confirm-title" className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Delete Bill Scan?
              </h3>
              <p id="delete-confirm-desc" className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed font-semibold">
                This will permanently delete this bill record from your history. This action cannot be undone.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3.5 pt-2">
              <button
                onClick={() => setDeleteBillId(null)}
                className="px-4.5 py-2.5 text-xs font-bold rounded-xl text-slate-655 dark:text-slate-400 hover:bg-white/30 dark:hover:bg-slate-900/30 border border-slate-200/60 dark:border-slate-800/60 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
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
  );
};
