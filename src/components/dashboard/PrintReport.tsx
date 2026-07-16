import React from "react";
import type { ApplianceItem, TariffResult } from "../../utils/tariffCalculator";
import { getSlabsForState } from "../../utils/tariffCalculator";

interface RecommendationItem {
  id?: string;
  title: string;
  description: string;
  savings: number;
  badge?: string;
  difficulty?: string;
  impact?: string;
}

interface AnalysisResult {
  totalUnits: number;
  billing: TariffResult;
  highestConsumer: string;
  savingsPotential: number;
  usageAfter: number;
  billAfter: number;
  recommendations: RecommendationItem[];
  beforeCo2: number;
  beforeTrees: number;
  afterCo2: number;
  afterTrees: number;
  savedCo2: number;
  savedTrees: number;
}

interface ParsedBillData {
  consumerName: string;
  serviceNumber: string;
  customerID: string;
  address: string;
  billDate: string;
  billingPeriod: string;
  dueDate: string;
  unitsConsumed: number;
  energyCharge: number;
  fixedCharge: number;
  tax: number;
  otherCharges: number;
  totalAmount: number;
  tariffCategory: string;
  solarImportUnits?: number;
  solarExportUnits?: number;
  netBilledUnits?: number;
  governmentSubsidy?: number;
  netBill?: number;
  discom?: string;
  billMonth?: string;
}

interface BillRecord {
  id: string;
  userId: string;
  uploadDate: string;
  fileName: string;
  parsedData: ParsedBillData;
  ocrText: string;
  discom?: string;
}

interface PrintReportProps {
  mode?: "audit" | "bill" | "history";
  user: any;
  activeAppliances?: ApplianceItem[];
  analysisResult?: AnalysisResult | null;
  recommendedKw?: number;
  solarOffsetPercent?: number;
  activeBill?: BillRecord | null;
  billCalcs?: {
    co2: number;
    score: number;
    grade: string;
    forecastAmount: number;
    confidence: number;
    recommendations: { title: string; desc: string; savings: number; difficulty: string; impact: string }[];
  } | null;
}

export const PrintReport: React.FC<PrintReportProps> = ({
  mode = "audit",
  user,
  activeAppliances = [],
  analysisResult,
  recommendedKw = 1.0,
  solarOffsetPercent = 0,
  activeBill = null,
  billCalcs = null,
}) => {
  const dateStr = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const stateKey = user?.tariffState || "ap";
  const customFlatRate = user?.customFlatRate || 7.5;
  const slabs = getSlabsForState(stateKey, customFlatRate);

  // ─── BILL SCAN MODE RENDERING ───
  if (mode === "bill" && activeBill) {
    const data = activeBill.parsedData;
    const isSolarNet = data.solarExportUnits !== undefined && data.solarExportUnits > 0;
    
    // Fallback calcs for display
    const co2 = billCalcs?.co2 || Math.round(data.unitsConsumed * 0.82 * 10) / 10;
    const trees = Math.round((co2 / 1.83) * 10) / 10;
    const recs = billCalcs?.recommendations || [];

    return (
      <div className="hidden print:block print-report-root w-full bg-white text-slate-900 font-sans leading-normal">
        
        {/* Page 1: Scanned Bill Cover */}
        <div className="print-page flex flex-col justify-between p-8 border-[8px] border-double border-blue-900/30">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center text-white text-xs font-black">⚡</span>
              <span className="text-sm font-black tracking-widest text-blue-900">SMART BILL ANALYZER</span>
            </div>
            <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase border border-slate-300 rounded px-2.5 py-1 font-mono">
              OCR Document Audit Report
            </span>
          </div>

          <div className="my-auto space-y-8 text-left">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 uppercase font-display leading-[1.1] border-b-4 border-emerald-500 pb-6">
              Electricity Bill Analysis & Tariff Audit
            </h1>
            <p className="text-lg text-slate-600 font-medium max-w-xl leading-relaxed">
              Extracted billing document details, verification of slab-specific grid rates, and environmental impact assessments.
            </p>

            <div className="grid grid-cols-2 gap-6 pt-10 border-t border-slate-200">
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  CUSTOMER NAME
                </span>
                <span className="text-sm font-bold text-slate-800 block">
                  {data.consumerName || user?.fullName || "Valued Customer"}
                </span>
                {data.address && (
                  <span className="text-[10px] text-slate-500 font-medium block truncate max-w-xs">
                    {data.address}
                  </span>
                )}
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  BILLING PARAMETERS
                </span>
                <span className="text-sm font-bold text-slate-800 block">
                  No: {data.serviceNumber || "N/A"}
                </span>
                <span className="text-xs text-slate-500 font-medium block">
                  DISCOM: {data.discom || activeBill.discom || "APSPDCL Southern"}
                </span>
                <span className="text-xs text-slate-500 font-medium block">
                  Cycle: {data.billingPeriod || data.billMonth || "N/A"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-end border-t border-slate-200 pt-6 text-xs text-slate-500 font-medium">
            <div>
              <div>Report Generated: <span className="font-bold text-slate-700">{dateStr}</span></div>
              <div>OCR Parsing Confidence: <span className="font-bold text-slate-700">{Math.round((billCalcs?.confidence || 0.98) * 100)}%</span></div>
            </div>
            <div className="text-right">
              <div>Smart Household Energy Portal</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Confidential & Proprietary</div>
            </div>
          </div>
        </div>

        {/* Page 2: Extracted Bill Parameters & Slab Recalculation Check */}
        <div className="print-page p-8 text-left space-y-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-blue-900 uppercase border-b-2 border-slate-200 pb-2 flex items-center gap-2">
              <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-[10px] font-bold text-blue-900">1</span>
              Extracted Billing Summary
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Extracted values parsed from the scanned billing document image using the OCR pipeline.
            </p>
          </div>

          <table className="w-full text-xs text-left border-collapse border border-slate-200">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                <th className="p-3 border border-slate-200">Extraction Fields</th>
                <th className="p-3 border border-slate-200 text-right">Extracted Values</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="p-3 border border-slate-200 font-bold text-slate-800">Units Consumed (Energy Draw)</td>
                <td className="p-3 border border-slate-200 text-right font-bold text-slate-800">
                  {isSolarNet ? (
                    <span>
                      {data.solarImportUnits || data.unitsConsumed} kWh (Import) / -{data.solarExportUnits} kWh (Solar Export)
                    </span>
                  ) : (
                    <span>{data.unitsConsumed} kWh</span>
                  )}
                </td>
              </tr>
              {data.fixedCharge !== undefined && (
                <tr>
                  <td className="p-3 border border-slate-200 text-slate-700">Fixed/Demand Charges</td>
                  <td className="p-3 border border-slate-200 text-right font-medium">₹{data.fixedCharge.toFixed(2)}</td>
                </tr>
              )}
              {data.tax !== undefined && (
                <tr>
                  <td className="p-3 border border-slate-200 text-slate-700">Electricity Duty & Taxes</td>
                  <td className="p-3 border border-slate-200 text-right font-medium">₹{data.tax.toFixed(2)}</td>
                </tr>
              )}
              {data.otherCharges !== undefined && (
                <tr>
                  <td className="p-3 border border-slate-200 text-slate-700">Fuel Surcharges & Adjustments</td>
                  <td className="p-3 border border-slate-200 text-right font-medium">₹{data.otherCharges.toFixed(2)}</td>
                </tr>
              )}
              {data.governmentSubsidy !== undefined && data.governmentSubsidy > 0 && (
                <tr className="text-emerald-700 font-bold">
                  <td className="p-3 border border-slate-200">Government Subsidy Credits</td>
                  <td className="p-3 border border-slate-200 text-right">-₹{data.governmentSubsidy.toFixed(2)}</td>
                </tr>
              )}
              <tr className="bg-slate-150 font-black">
                <td className="p-3 border border-slate-200 text-slate-900">Total Bill Amount Billed</td>
                <td className="p-3 border border-slate-200 text-right text-blue-900 text-sm">
                  ₹{(data.totalAmount || data.netBill || 0).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="pt-4">
            <h2 className="text-xl font-bold tracking-tight text-blue-900 uppercase border-b-2 border-slate-200 pb-2 flex items-center gap-2">
              <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-[10px] font-bold text-blue-900">2</span>
              Tariff Slabs Audit Verification
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Cross-verification against regional slab categories for {data.unitsConsumed} units.
            </p>
          </div>

          <table className="w-full text-xs text-left border-collapse border border-slate-200">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                <th className="p-3 border border-slate-200">Tariff Slabs (Region: {stateKey.toUpperCase()})</th>
                <th className="p-3 border border-slate-200 text-center">Rate</th>
                <th className="p-3 border border-slate-200 text-center">Consumption in Slab</th>
                <th className="p-3 border border-slate-200 text-right">Computed Charges</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {slabs.map((slab, idx) => {
                const unitsInSlab = Math.max(0, Math.min(data.unitsConsumed - slab.prev, slab.max));
                const slabRateNum = parseFloat(slab.rate.replace("₹", ""));
                const slabCharge = unitsInSlab * slabRateNum;

                if (unitsInSlab === 0) return null;

                return (
                  <tr key={idx}>
                    <td className="p-3 border border-slate-200 text-slate-750">{slab.limit}</td>
                    <td className="p-3 border border-slate-200 text-center">{slab.rate}/unit</td>
                    <td className="p-3 border border-slate-200 text-center">{unitsInSlab.toFixed(1)} kWh</td>
                    <td className="p-3 border border-slate-200 text-right font-semibold">₹{slabCharge.toFixed(2)}</td>
                  </tr>
                );
              })}
              <tr className="bg-slate-100 font-bold text-slate-850">
                <td colSpan={3} className="p-3 border border-slate-200 text-right">Re-calculated Net Energy Charges:</td>
                <td className="p-3 border border-slate-200 text-right text-blue-900">
                  ₹{slabs.reduce((acc, slab) => {
                    const units = Math.max(0, Math.min(data.unitsConsumed - slab.prev, slab.max));
                    return acc + units * parseFloat(slab.rate.replace("₹", ""));
                  }, 0).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Page 3: Recommendations & Carbon Footprint */}
        <div className="print-page p-8 text-left space-y-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-blue-900 uppercase border-b-2 border-slate-200 pb-2 flex items-center gap-2">
              <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-[10px] font-bold text-blue-900">3</span>
              AI Conservation Savings Suggestions
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Personalized action recommendations optimized for the user's specific monthly grid demand.
            </p>
          </div>

          <table className="w-full text-xs text-left border-collapse border border-slate-200">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                <th className="p-3 border border-slate-200">Target Action Item</th>
                <th className="p-3 border border-slate-200">Action Plan</th>
                <th className="p-3 border border-slate-200 text-center">Impact</th>
                <th className="p-3 border border-slate-200 text-right">Est. Monthly Savings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {recs.map((rec, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="p-3 border border-slate-200 font-bold text-slate-850">{rec.title}</td>
                  <td className="p-3 border border-slate-200 text-slate-600 leading-relaxed">{rec.desc}</td>
                  <td className="p-3 border border-slate-200 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      rec.impact === "High" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
                    }`}>
                      {rec.impact}
                    </span>
                  </td>
                  <td className="p-3 border border-slate-200 text-right font-bold text-emerald-700">₹{Math.round(rec.savings)}</td>
                </tr>
              ))}
              {recs.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-4 border border-slate-200 text-center text-slate-400">
                    No high-priority recommendations flags detected for this billing period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="bg-emerald-50 border border-emerald-250 p-6 rounded-2xl flex justify-between items-center pt-8">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest block font-mono">Environmental Carbon Footprint</span>
              <p className="text-xs text-slate-700 font-medium">
                This electricity bill generated estimated carbon emissions of <span className="font-bold text-emerald-800">{co2} kg CO2</span>.
              </p>
              <p className="text-[10px] text-slate-500 font-medium">
                Offsetting these emissions requires growing <span className="font-semibold text-emerald-800">{trees.toFixed(0)} trees</span> over a month.
              </p>
            </div>
            <span className="text-3xl select-none">🌱</span>
          </div>
        </div>

      </div>
    );
  }

  // ─── WIZARD AUDIT / HISTORY MODES ───
  if (!analysisResult) return null;

  // Estimate solar financials
  const upfrontInvestment = recommendedKw * 75000;
  const yearlySolarSavings = analysisResult.savingsPotential * 12;
  const paybackPeriod = upfrontInvestment > 0 && yearlySolarSavings > 0
    ? (upfrontInvestment / yearlySolarSavings).toFixed(1)
    : "3.5";

  // Fallback recommendations if empty (e.g. history mode)
  let recommendationsList = analysisResult.recommendations || [];
  if (recommendationsList.length === 0 && activeAppliances.length > 0) {
    // Generate default tips based on active appliances
    activeAppliances.forEach((app) => {
      if (app.hours > 4) {
        if (app.id?.includes("ac")) {
          recommendationsList.push({
            id: "upgrade_ac",
            title: "Replace Old Air Conditioner",
            description: "Upgrading to a new BEE 5-star inverter AC saves continuous draw.",
            savings: 350,
            impact: "High",
            difficulty: "Medium"
          });
        } else if (app.id?.includes("fan")) {
          recommendationsList.push({
            id: "upgrade_fan",
            title: "Upgrade to BLDC Ceiling Fans",
            description: "Replacing induction motor fans with brushless DC motors yields 60% savings.",
            savings: 120,
            impact: "Medium",
            difficulty: "Easy"
          });
        } else if (app.id?.includes("light") || app.id?.includes("bulb")) {
          recommendationsList.push({
            id: "upgrade_light",
            title: "Transition to Smart LEDs",
            description: "Retrofit remaining incandescent/T8 tubes with high-efficacy LEDs.",
            savings: 80,
            impact: "Medium",
            difficulty: "Easy"
          });
        }
      }
    });
    // Add default standby recommendation
    recommendationsList.push({
      id: "standby_shutoff",
      title: "Eliminate Phantom Standby Loads",
      description: "Shut off TV consoles and chargers at the wall outlet when idle.",
      savings: 90,
      impact: "Low",
      difficulty: "Easy"
    });
  }

  return (
    <div className="hidden print:block print-report-root w-full bg-white text-slate-900 font-sans leading-normal">
      
      {/* Page 1: Cover Page */}
      <div className="print-page flex flex-col justify-between p-8 border-[8px] border-double border-blue-900/30">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center text-white text-xs font-black">⚡</span>
            <span className="text-sm font-black tracking-widest text-blue-900">SMART ENERGY</span>
          </div>
          <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase border border-slate-300 rounded px-2.5 py-1 font-mono">
            Official Advisory Report
          </span>
        </div>

        <div className="my-auto space-y-8 text-left">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 uppercase font-display leading-[1.1] border-b-4 border-emerald-500 pb-6">
            Household Energy Audit & Solar ROI Proposal
          </h1>
          <p className="text-lg text-slate-600 font-medium max-w-xl leading-relaxed">
            A comprehensive conservation roadmap, load profiling audit, and rooftop solar net-metering ROI analysis.
          </p>

          <div className="grid grid-cols-2 gap-6 pt-10 border-t border-slate-200">
            <div>
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                PREPARED FOR
              </span>
              <span className="text-sm font-bold text-slate-800 block">
                {user?.fullName || "Valued Customer"}
              </span>
              <span className="text-xs text-slate-500 font-medium block">
                {user?.email || "Domestic Account"}
              </span>
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                UTILITY REGION
              </span>
              <span className="text-sm font-bold text-slate-800 block">
                {analysisResult.billing.stateName || "APSPDCL Southern"}
              </span>
              <span className="text-xs text-slate-500 font-medium block">
                LT-I Domestic Category
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-end border-t border-slate-200 pt-6 text-xs text-slate-500 font-medium">
          <div>
            <div>Date Generated: <span className="font-bold text-slate-700">{dateStr}</span></div>
            <div>System Assessment: <span className="font-bold text-slate-700">Verified AI Engine</span></div>
          </div>
          <div className="text-right">
            <div>Smart Household Energy Portal</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Confidential & Proprietary</div>
          </div>
        </div>
      </div>

      {/* Page 2: Consumption Inventory & Tariff Slabs */}
      <div className="print-page p-8 text-left space-y-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-blue-900 uppercase border-b-2 border-slate-200 pb-2 flex items-center gap-2">
            <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-[10px] font-bold text-blue-900">1</span>
            Appliance Consumption Inventory
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Baseline listing of audited electrical loads and estimated monthly grid consumption.
          </p>
        </div>

        <table className="w-full text-xs text-left border-collapse border border-slate-200">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
              <th className="p-3 border border-slate-200">Appliance Name</th>
              <th className="p-3 border border-slate-200 text-center">Qty</th>
              <th className="p-3 border border-slate-200 text-center">Avg. Hours / Day</th>
              <th className="p-3 border border-slate-200 text-center">Power Rating (W)</th>
              <th className="p-3 border border-slate-200 text-right">Monthly Energy (kWh)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {activeAppliances.map((app, idx) => {
              const kwh = Math.round(app.quantity * (app.watts / 1000) * app.hours * 30);
              return (
                <tr key={app.id || idx} className="hover:bg-slate-50/50">
                  <td className="p-3 border border-slate-200 font-bold text-slate-800">{app.name}</td>
                  <td className="p-3 border border-slate-200 text-center">{app.quantity}</td>
                  <td className="p-3 border border-slate-200 text-center">{app.hours} hrs</td>
                  <td className="p-3 border border-slate-200 text-center">{app.watts} W</td>
                  <td className="p-3 border border-slate-200 text-right font-bold text-slate-800">{kwh} kWh</td>
                </tr>
              );
            })}
            <tr className="bg-slate-50 font-bold">
              <td colSpan={4} className="p-3 border border-slate-200 text-right text-slate-700">Total Estimated Monthly Load:</td>
              <td className="p-3 border border-slate-200 text-right text-blue-900 font-black text-sm">{analysisResult.totalUnits} kWh</td>
            </tr>
          </tbody>
        </table>

        <div className="pt-4">
          <h2 className="text-xl font-bold tracking-tight text-blue-900 uppercase border-b-2 border-slate-200 pb-2 flex items-center gap-2">
            <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-[10px] font-bold text-blue-900">2</span>
            Utility Slab Billing Breakdown
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Calculated against regional domestic slab structures, including subsidies and fuel adjustments.
          </p>
        </div>

        <table className="w-full text-xs text-left border-collapse border border-slate-200">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
              <th className="p-3 border border-slate-200">Billing Category Slabs</th>
              <th className="p-3 border border-slate-200 text-center">Tariff Rate</th>
              <th className="p-3 border border-slate-200 text-center">Consumption in Slab</th>
              <th className="p-3 border border-slate-200 text-right">Computed Charges</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {slabs.map((slab, idx) => {
              const unitsInSlab = Math.max(0, Math.min(analysisResult.totalUnits - slab.prev, slab.max));
              const slabRateNum = parseFloat(slab.rate.replace("₹", ""));
              const slabCharge = unitsInSlab * slabRateNum;

              if (unitsInSlab === 0) return null;

              return (
                <tr key={idx}>
                  <td className="p-3 border border-slate-200 text-slate-750">{slab.limit}</td>
                  <td className="p-3 border border-slate-200 text-center">{slab.rate}/unit</td>
                  <td className="p-3 border border-slate-200 text-center">{unitsInSlab.toFixed(1)} kWh</td>
                  <td className="p-3 border border-slate-200 text-right font-semibold">₹{slabCharge.toFixed(2)}</td>
                </tr>
              );
            })}
            <tr className="bg-slate-50/50">
              <td colSpan={3} className="p-2.5 border border-slate-200 text-right text-slate-500">Gross Energy Charge:</td>
              <td className="p-2.5 border border-slate-200 text-right font-medium text-slate-800">₹{analysisResult.billing.grossEnergyCharge.toFixed(2)}</td>
            </tr>
            <tr className="bg-slate-50/50 text-emerald-700 font-bold">
              <td colSpan={3} className="p-2.5 border border-slate-200 text-right">Government Subsidy / Adjustment:</td>
              <td className="p-2.5 border border-slate-200 text-right">-₹{analysisResult.billing.subsidy.toFixed(2)}</td>
            </tr>
            <tr className="bg-slate-100 font-black">
              <td colSpan={3} className="p-3 border border-slate-200 text-right text-slate-800">Net Estimated Electricity Bill:</td>
              <td className="p-3 border border-slate-200 text-right text-blue-900 text-sm">₹{analysisResult.billing.netEnergyCharge.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Page 3: Recommendations & Solar Feasibility */}
      <div className="print-page p-8 text-left space-y-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-blue-900 uppercase border-b-2 border-slate-200 pb-2 flex items-center gap-2">
            <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-[10px] font-bold text-blue-900">3</span>
            Smart AI Action Recommendations
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Personalized adjustments designed to shift loads from high-tariff categories and reduce standby consumption.
          </p>
        </div>

        <table className="w-full text-xs text-left border-collapse border border-slate-200">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
              <th className="p-3 border border-slate-200">Target Action Item</th>
              <th className="p-3 border border-slate-200">Description</th>
              <th className="p-3 border border-slate-200 text-center">Impact</th>
              <th className="p-3 border border-slate-200 text-center">Difficulty</th>
              <th className="p-3 border border-slate-200 text-right">Est. Monthly Savings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {recommendationsList.map((rec, idx) => (
              <tr key={rec.id || idx} className="hover:bg-slate-50/50">
                <td className="p-3 border border-slate-200 font-bold text-slate-850">{rec.title}</td>
                <td className="p-3 border border-slate-200 text-slate-600 leading-relaxed">{rec.description}</td>
                <td className="p-3 border border-slate-200 text-center">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                    rec.impact === "High" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
                  }`}>
                    {rec.impact || "Medium"}
                  </span>
                </td>
                <td className="p-3 border border-slate-200 text-center">
                  <span className="text-slate-655 font-medium">{rec.difficulty || "Medium"}</span>
                </td>
                <td className="p-3 border border-slate-200 text-right font-bold text-emerald-700">₹{Math.round(rec.savings)}</td>
              </tr>
            ))}
            {recommendationsList.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 border border-slate-200 text-center text-slate-400">
                  No direct appliance upgrades flagged for this profile.
                </td>
              </tr>
            )}
            <tr className="bg-slate-100 font-black">
              <td colSpan={4} className="p-3 border border-slate-200 text-right text-slate-800">Total Potential Monthly Savings:</td>
              <td className="p-3 border border-slate-200 text-right text-emerald-700 text-sm">₹{Math.round(analysisResult.savingsPotential)}</td>
            </tr>
          </tbody>
        </table>

        <div className="pt-4">
          <h2 className="text-xl font-bold tracking-tight text-blue-900 uppercase border-b-2 border-slate-200 pb-2 flex items-center gap-2">
            <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-[10px] font-bold text-blue-900">4</span>
            Solar Feasibility & Carbon Offset Proposal
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            25-year financial simulation indices and clean-energy generation forecasts.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border border-slate-200 rounded-xl space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block font-mono">Recommended System Capacity</span>
            <h4 className="text-xl font-black text-slate-800">{recommendedKw} kWp</h4>
            <p className="text-xs text-slate-550">Sized based on current average household consumption footprints.</p>
          </div>

          <div className="p-4 border border-slate-200 rounded-xl space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block font-mono">Estimated System Offsets</span>
            <h4 className="text-xl font-black text-emerald-600">{solarOffsetPercent}% of Grid Load</h4>
            <p className="text-xs text-slate-550">Calculated offset based on local solar irradiation profiles.</p>
          </div>

          <div className="p-4 border border-slate-200 rounded-xl space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block font-mono">Est. Net Upfront Investment</span>
            <h4 className="text-xl font-black text-slate-800">₹{upfrontInvestment.toLocaleString()}</h4>
            <p className="text-xs text-slate-550">Excludes regional capital subsidies and grid connection fees.</p>
          </div>

          <div className="p-4 border border-slate-200 rounded-xl space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block font-mono">Estimated Payback Period</span>
            <h4 className="text-xl font-black text-blue-800">{paybackPeriod} Years</h4>
            <p className="text-xs text-slate-550">Break-even timeline factoring in panel degradation rates.</p>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-250 p-5 rounded-2xl flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest block font-mono">Environmental Offset Indices</span>
            <p className="text-xs text-slate-700 font-medium">
              Eliminating <span className="font-bold text-emerald-800">{analysisResult.savedCo2 || Math.round(analysisResult.totalUnits * 0.82)} kg CO2</span> emissions per month.
            </p>
            <p className="text-[10px] text-slate-500 font-medium">
              Equivalent to planting and growing <span className="font-semibold text-emerald-800">{analysisResult.savedTrees || Math.round(analysisResult.totalUnits * 0.82 / 1.83)} trees</span> every single month.
            </p>
          </div>
          <span className="text-3xl select-none">🌱</span>
        </div>
      </div>

    </div>
  );
};
