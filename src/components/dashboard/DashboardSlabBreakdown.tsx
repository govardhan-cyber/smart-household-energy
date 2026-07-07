import React from "react";
import { ChevronRight, Sparkles, Download, Printer, Leaf } from "lucide-react";
import { getSlabsForState } from "../../utils/tariffCalculator";
import type { TariffResult } from "../../utils/tariffCalculator";

interface DashboardSlabBreakdownProps {
  totalUnits: number;
  billing: TariffResult;
  beforeCo2: number;
  beforeTrees: number;
  tariffState: string;
  customFlatRate: number;
  onBack: () => void;
  onReset: () => void;
  onNext: () => void;
  onExportCSV: () => void;
}

export const DashboardSlabBreakdown: React.FC<DashboardSlabBreakdownProps> = ({
  totalUnits,
  billing,
  beforeCo2,
  beforeTrees,
  tariffState,
  customFlatRate,
  onBack,
  onReset,
  onNext,
  onExportCSV
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 text-left select-none">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            Analysis Completed
          </h3>
          <p className="text-xs text-slate-505 dark:text-slate-400 mt-0.5 text-left select-none">
            Your calculations have been saved to your account.
          </p>
        </div>

        {/* Export Action Buttons */}
        <div className="flex gap-2 no-print shrink-0">
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-850 dark:text-white hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            title="Download CSV report"
          >
            <Download className="w-3.5 h-3.5 text-slate-550" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-850 dark:text-white hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            title="Print / Save PDF report"
          >
            <Printer className="w-3.5 h-3.5 text-slate-550" />
            <span className="hidden sm:inline">Print PDF</span>
          </button>
        </div>
      </div>

      {/* Slabs breakdown details */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-left select-none">
          {billing.stateName} Slab breakdown (Calculated for {totalUnits} units)
        </h4>
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 text-left text-xs">
          <div className="grid grid-cols-3 bg-slate-100 dark:bg-slate-800 py-2.5 px-4 font-bold text-slate-550 dark:text-slate-400 select-none">
            <span>Consumption Slab</span>
            <span className="text-center">Tariff Rate</span>
            <span className="text-right">Charges</span>
          </div>
          <div className="divide-y divide-slate-150 dark:divide-slate-800">
            {getSlabsForState(tariffState, customFlatRate).map((slab, idx) => {
              const unitsInSlab = Math.max(0, Math.min(totalUnits - slab.prev, slab.max));
              const slabRateNum = parseFloat(slab.rate.replace("₹", ""));
              const slabCharge = unitsInSlab * slabRateNum;

              if (unitsInSlab === 0) return null;

              return (
                <div key={idx} className="grid grid-cols-3 py-2 px-4 text-slate-655 dark:text-slate-350">
                  <span>{slab.limit} <span className="text-[10px] text-slate-400 dark:text-slate-550 font-semibold">({unitsInSlab.toFixed(1)} units)</span></span>
                  <span className="text-center">{slab.rate}</span>
                  <span className="text-right font-semibold">₹{slabCharge.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
          <div className="bg-slate-100 dark:bg-slate-800/80 p-4 border-t border-slate-150 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-350">
            <div className="flex justify-between">
              <span>Gross Energy Charge:</span>
              <span className="font-semibold">₹{billing.grossEnergyCharge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-primary-green">
              <span>Less Govt. Subsidy:</span>
              <span className="font-bold">-₹{billing.subsidy.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-white pt-1.5 border-t border-slate-200 dark:border-slate-700">
              <span>Net Energy Charges:</span>
              <span>₹{billing.netEnergyCharge.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Environmental Carbon Footprint Card */}
      <div className="bg-gradient-to-tr from-green-50 to-emerald-50 dark:from-emerald-955/20 dark:to-green-955/15 p-5 rounded-2xl border border-green-200 dark:border-green-900/40 space-y-2 text-left shadow-sm">
        <h4 className="text-xs font-bold text-green-700 dark:text-primary-green flex items-center gap-1.5 uppercase tracking-wider select-none">
          <Leaf className="w-4 h-4 text-green-600 dark:text-primary-green animate-bounce" />
          Environmental Carbon Footprint
        </h4>
        <p className="text-xs text-slate-655 dark:text-slate-400 font-semibold leading-relaxed">
          Your monthly energy usage generates estimated CO2 emissions of <span className="font-bold text-slate-888 dark:text-white">{beforeCo2} kg</span>.
          It requires <span className="font-bold text-slate-888 dark:text-white">{beforeTrees.toFixed(0)} trees</span> to absorb these emissions. Switch to Step 4 to see how optimizations can reduce your footprint!
        </p>
      </div>

      {/* Navigation Buttons for Step 3 */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 no-print">
        <div className="flex gap-2">
          <button
            onClick={onBack}
            className="h-11 px-5 flex items-center justify-center text-sm font-semibold rounded-xl text-slate-655 dark:text-slate-400 bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 hover:bg-slate-50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            Back
          </button>
          <button
            onClick={onReset}
            className="h-11 px-5 flex items-center justify-center text-sm font-semibold rounded-xl text-slate-655 dark:text-slate-400 bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 hover:bg-slate-50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            Reset
          </button>
        </div>
        <button
          onClick={onNext}
          className="h-11 px-6 flex items-center justify-center gap-1.5 text-sm font-bold rounded-xl text-white bg-primary-blue hover:bg-primary-blue/90 dark:bg-primary-green dark:text-slate-950 dark:hover:bg-primary-green/90 transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] shadow-primary-blue/15 cursor-pointer"
        >
          Next: Recommendations
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
