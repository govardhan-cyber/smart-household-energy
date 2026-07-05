import React from "react";
import { Eye, Trash2 } from "lucide-react";
import type { BillRecord } from "../../../pages/BillAnalyzer";

interface BillHistoryListProps {
  history: BillRecord[];
  activeBill: BillRecord | null;
  loadingHistory: boolean;
  setActiveBill: (record: BillRecord) => void;
  setSelectedBillForModal: (record: BillRecord) => void;
  handleDeleteRecord: (id: string) => void;
}

export const BillHistoryList: React.FC<BillHistoryListProps> = ({
  history,
  activeBill,
  loadingHistory,
  setActiveBill,
  setSelectedBillForModal,
  handleDeleteRecord
}) => {
  return (
    <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4 print:hidden">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3">
        <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-wider select-none">
          Billing History Records
        </h3>
        <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full select-none">
          {history.length} Bills Extracted
        </span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-150 dark:border-slate-800/60 shadow-inner">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 dark:bg-slate-950/60 text-[10px] sm:text-xs font-black text-slate-455 dark:text-slate-500 uppercase tracking-wider border-b border-slate-150 dark:border-slate-800/50 select-none">
              <th className="px-4 py-3">Scan Date</th>
              <th className="px-4 py-3">Consumer Name</th>
              <th className="px-4 py-3">Billing Month</th>
              <th className="px-4 py-3">Usage</th>
              <th className="px-4 py-3">Total Paid</th>
              <th className="px-4 py-3">Tariff Category</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold text-slate-655 dark:text-slate-350">
            {loadingHistory ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2 select-none">
                    <div className="w-6 h-6 rounded-full border-2 border-primary-blue border-t-transparent animate-spin"></div>
                    <span className="text-xs font-bold animate-pulse">Syncing Cloud Firestore Database...</span>
                  </div>
                </td>
              </tr>
            ) : history.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-slate-450 dark:text-slate-500 font-semibold">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto select-none">
                    {/* SVG Illustration Container */}
                    <div className="relative mb-4 w-24 h-24 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-full border border-slate-100 dark:border-slate-800 shadow-inner">
                      <svg 
                        viewBox="0 0 100 100" 
                        className="w-14 h-14 text-slate-400 dark:text-slate-600"
                      >
                        <defs>
                          <linearGradient id="docGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.08" />
                            <stop offset="100%" stopColor="#16a34a" stopOpacity="0.08" />
                          </linearGradient>
                        </defs>
                        <rect x="25" y="15" width="50" height="70" rx="8" fill="url(#docGrad)" stroke="currentColor" strokeWidth="2.5" strokeDasharray="3 3" />
                        
                        {/* Corner fold */}
                        <path d="M60 15 L75 30 H60 Z" fill="currentColor" opacity="0.15" />
                        <path d="M60 15 L75 30 M60 15 V30 H75" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
                        
                        {/* Lines */}
                        <line x1="35" y1="42" x2="65" y2="42" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
                        <line x1="35" y1="54" x2="65" y2="54" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
                        <line x1="35" y1="66" x2="55" y2="66" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
                        
                        {/* AI Sparkles */}
                        <path d="M22 28 l1 2 l2 1 l-2 1 l-1 2 l-1 -2 l-2 -1 l2 -1 z" fill="#16a34a" />
                        <path d="M78 68 l1.5 3 l3 1.5 l-3 1.5 l-1.5 3 l-1.5 -3 l-3 -1.5 l3 -1.5 z" fill="#2563eb" />
                      </svg>
                      {/* Scanning line sweep */}
                      <div className="absolute top-4 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-primary-blue to-transparent animate-bounce opacity-80"></div>
                    </div>
                    
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                      📄 No bills uploaded yet
                    </h3>
                    <p className="text-xs text-slate-455 dark:text-slate-400 font-semibold leading-relaxed">
                      Upload your first bill<br />
                      to unlock AI insights
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              history.map((record) => (
                <tr 
                  key={record.id} 
                  className={`cursor-pointer transition-colors duration-150 ${activeBill?.id === record.id ? "bg-blue-50/60 dark:bg-blue-950/20 border-l-2 border-l-primary-blue dark:border-l-primary-green" : "hover:bg-slate-50 dark:hover:bg-slate-800/40"}`}
                  onClick={() => {
                    setActiveBill(record);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <td className={`px-4 py-3 font-mono text-[11px] ${activeBill?.id === record.id ? 'text-primary-blue dark:text-primary-green font-bold' : 'text-slate-500 dark:text-slate-400'}`}>{new Date(record.uploadDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-slate-800 dark:text-slate-200">{record.parsedData.consumerName}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{record.parsedData.billingPeriod}</td>
                  <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-300">{record.parsedData.unitsConsumed} <span className="text-[10px] text-slate-400 dark:text-slate-555">kWh</span></td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">₹{record.parsedData.totalAmount}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 dark:border dark:border-slate-700 text-[9px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                      {record.parsedData.tariffCategory}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center print:hidden" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => {
                          setSelectedBillForModal(record);
                        }}
                        className="p-1.5 text-slate-400 dark:text-slate-555 hover:text-primary-blue dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors cursor-pointer"
                        title="View analysis"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRecord(record.id)}
                        className="p-1.5 text-slate-400 dark:text-slate-555 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
