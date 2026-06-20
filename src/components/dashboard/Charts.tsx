import React from "react";
import { 
  ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Cell, PieChart, Pie, AreaChart, Area, LineChart, Line, ReferenceLine, Legend
} from "recharts";
import { BarChart3, TrendingUp, Sun, IndianRupee, Sparkles } from "lucide-react";
import { calculateBill } from "../../utils/tariffCalculator";

interface ChartDataItem {
  name: string;
  kwh: number;
  percentage: number;
}

interface ChartsProps {
  chartData?: ChartDataItem[];
  activeTheme: "light" | "dark";
  colors?: string[];
  reports?: any[];
  liveTotalUnits?: number;
  liveBill?: { netEnergyCharge: number; stateName: string };
  recommendedKw?: number;
  tariffState?: string;
  customFlatRate?: number;
  mode?: "consumption" | "solar";
  loading?: boolean;
  solarPaybackData?: any[];
  solarSavingsData?: any[];
}

export const Charts: React.FC<ChartsProps> = ({
  chartData = [],
  activeTheme,
  colors = ["#1E40AF", "#16A34A", "#0F766E", "#F97316", "#EF4444", "#8B5CF6", "#EC4899", "#F59E0B"],
  reports = [],
  liveTotalUnits = 250,
  recommendedKw = 0,
  tariffState = "ap",
  customFlatRate = 7.5,
  mode = "consumption",
  loading = false,
  solarPaybackData = [],
  solarSavingsData = []
}) => {
  const [consumptionTab, setConsumptionTab] = React.useState<"share" | "flow">("share");
  const [hoveredFlow, setHoveredFlow] = React.useState<{ source: string; target: string; value: number; x: number; y: number } | null>(null);
  const [selectedNode, setSelectedNode] = React.useState<string | null>(null);
  // ----------------------------------------------------
  // DATA PREPARATION FOR CONSUMPTION MODE
  // ----------------------------------------------------
  
  // Generate 6-month historical trend data
  const trendData = React.useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonthIdx = new Date().getMonth();
    
    // Build list of last 6 months in order
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const idx = (currentMonthIdx - i + 12) % 12;
      last6Months.push({
        monthName: months[idx],
        monthIdx: idx,
        kwh: 0,
        isMock: true
      });
    }

    // Seasonal multipliers relative to base (summer peak in May/June, lower winter)
    const seasonalMultipliers = [0.75, 0.7, 0.85, 1.05, 1.15, 1.1, 0.95, 0.9, 0.85, 0.8, 0.75, 0.75];

    // Populate with real user reports if available
    const sortedReports = [...(reports || [])].sort((a, b) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    return last6Months.map(m => {
      // Find a real report in this month
      const match = sortedReports.find(r => {
        const d = new Date(r.createdAt);
        return d.getMonth() === m.monthIdx && d.getFullYear() === new Date().getFullYear();
      });

      if (match) {
        return {
          name: m.monthName,
          kwh: Math.round(match.totalUnits),
          isMock: false
        };
      } else {
        const multiplier = seasonalMultipliers[m.monthIdx] || 1.0;
        const baseKwh = liveTotalUnits || 250;
        const currentMultiplier = seasonalMultipliers[currentMonthIdx] || 1.0;
        return {
          name: m.monthName,
          kwh: Math.round(baseKwh * (multiplier / currentMultiplier)),
          isMock: true
        };
      }
    });
  }, [reports, liveTotalUnits]);

  // Derive insights for consumption
  const isAboveBaseline = liveTotalUnits > 250;
  const diffPercent = Math.round((Math.abs(liveTotalUnits - 250) / 250) * 100);

  // ----------------------------------------------------
  // DATA PREPARATION FOR SOLAR ROI MODE
  // ----------------------------------------------------
  
  // 12-Month Solar Savings simulation
  const resolvedSolarSavings = React.useMemo(() => {
    if (solarSavingsData && solarSavingsData.length > 0) return solarSavingsData;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonthIdx = new Date().getMonth();
    
    // Seasonal multipliers
    const seasonalMultipliers = [0.75, 0.7, 0.85, 1.05, 1.15, 1.1, 0.95, 0.9, 0.85, 0.8, 0.75, 0.75];
    const solarMultipliers = [0.95, 1.05, 1.15, 1.2, 1.15, 0.9, 0.7, 0.75, 0.9, 1.0, 0.95, 0.9];
    
    return months.map((m, idx) => {
      const currentMultiplier = seasonalMultipliers[currentMonthIdx] || 1.0;
      const baseUnits = liveTotalUnits || 250;
      const monthUnits = Math.round(baseUnits * (seasonalMultipliers[idx] / currentMultiplier));
      
      const calcResult = calculateBill(monthUnits, tariffState, customFlatRate);
      const oldBill = calcResult.netEnergyCharge;
      
      const baseSolarGen = recommendedKw * 120;
      const monthSolarGen = Math.round(baseSolarGen * solarMultipliers[idx]);
      const netUnits = Math.max(0, monthUnits - monthSolarGen);
      
      const newCalcResult = calculateBill(netUnits, tariffState, customFlatRate);
      const newBill = newCalcResult.netEnergyCharge;
      
      const savings = Math.max(0, oldBill - newBill);
      
      return {
        name: m,
        "Original Bill": Math.round(oldBill),
        "With Solar Bill": Math.round(newBill),
        Savings: Math.round(savings)
      };
    });
  }, [solarSavingsData, liveTotalUnits, recommendedKw, tariffState, customFlatRate]);

  // Payback Simulation
  const resolvedPaybackData = React.useMemo(() => {
    if (solarPaybackData && solarPaybackData.length > 0) {
      const annualSavings = resolvedSolarSavings.reduce((sum, d) => sum + d.Savings, 0);
      return { data: solarPaybackData, estCost: -solarPaybackData[0]?.Balance || 0, annualSavings };
    }
    const data = [];
    const annualSavings = resolvedSolarSavings.reduce((sum, d) => sum + d.Savings, 0);
    // Dynamic cost bases
    const estCost = recommendedKw <= 1 
      ? 65000 
      : recommendedKw <= 2 
      ? 85000 
      : recommendedKw <= 3 
      ? 115000 
      : recommendedKw <= 5 
      ? 175000 
      : recommendedKw * 40000;
    
    let netBalance = -estCost;
    data.push({
      year: "Yr 0",
      Balance: Math.round(netBalance),
      cost: -estCost,
      savings: 0
    });
    
    for (let y = 1; y <= 10; y++) {
      const yearSavings = annualSavings * Math.pow(1.04, y - 1); // 4% rate inflation
      netBalance += yearSavings;
      data.push({
        year: `Yr ${y}`,
        Balance: Math.round(netBalance),
        savings: Math.round(netBalance + estCost)
      });
    }
    return { data, estCost, annualSavings };
  }, [solarPaybackData, resolvedSolarSavings, recommendedKw]);

  // Payback period text
  const paybackPeriodYearText = React.useMemo(() => {
    const data = resolvedPaybackData.data;
    const breakEvenIndex = data.findIndex(d => d.Balance >= 0);
    if (breakEvenIndex === -1) return "10+ years";
    if (breakEvenIndex === 1) return "1 year";
    const prevBal = data[breakEvenIndex - 1].Balance;
    const currBal = data[breakEvenIndex].Balance;
    const diff = currBal - prevBal;
    const fraction = diff > 0 ? Math.abs(prevBal) / diff : 0;
    const years = (breakEvenIndex - 1) + fraction;
    return `${years.toFixed(1)} years`;
  }, [resolvedPaybackData]);

  // ----------------------------------------------------
  // COMPONENT RENDER
  // ----------------------------------------------------

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-8 animate-pulse text-left">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
            <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col items-center justify-between py-6 space-y-6">
            <div className="w-36 h-36 rounded-full border-[10px] border-slate-100 dark:border-slate-800 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800"></div>
            </div>
            <div className="space-y-2 w-full">
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-lg w-2/3 mx-auto"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/2 mx-auto"></div>
            </div>
          </div>
          <div className="space-y-6 py-6">
            <div className="h-40 bg-slate-100 dark:bg-slate-850 rounded-2xl relative overflow-hidden">
              <div className="absolute inset-x-0 bottom-0 h-24 bg-slate-200/40 dark:bg-slate-800/40 rounded-t-xl mx-4"></div>
            </div>
            <div className="h-3 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  // Handle empty state for chartData in consumption mode
  if (mode === "consumption" && chartData.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-center py-16 page-break-avoid">
        <BarChart3 className="w-12 h-12 text-slate-350 dark:text-slate-700 mx-auto" />
        <div className="space-y-2 max-w-md mx-auto">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No energy analytics generated</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Please add at least one appliance in Step 1 and configure its usage in Step 2 to generate interactive consumption trend and distribution charts.
          </p>
        </div>
      </div>
    );
  }

  const renderSankeyDiagram = () => {
    const totalKwh = liveTotalUnits || chartData.reduce((sum, d) => sum + d.kwh, 0) || 1;
    const hasSolar = recommendedKw && recommendedKw > 0;
    const solarGen = hasSolar ? Math.round(recommendedKw * 120) : 0;
    const solarInput = Math.min(totalKwh, solarGen);
    const gridInput = Math.max(0, totalKwh - solarInput);

    const gridRatio = gridInput / totalKwh;
    const solarRatio = solarInput / totalKwh;

    const sorted = [...chartData].sort((a, b) => b.kwh - a.kwh);
    const top = sorted.slice(0, 4);
    const rest = sorted.slice(4);
    const restKwh = rest.reduce((sum, d) => sum + d.kwh, 0);
    
    const outputNodes = [...top];
    if (restKwh > 0) {
      outputNodes.push({
        name: "Other Appliances",
        kwh: restKwh,
        percentage: Math.round((restKwh / totalKwh) * 100)
      });
    }

    const N = outputNodes.length;
    const spacing = N > 1 ? 220 / (N - 1) : 0;

    const yGrid = hasSolar ? 50 : 100;
    const ySolar = 170;

    return (
      <div className="space-y-4 text-left relative">
        <style>{`
          @keyframes flow-dash {
            to {
              stroke-dashoffset: -36;
            }
          }
          .animate-flow-dash {
            animation: flow-dash 2s linear infinite;
          }
        `}</style>
        
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest block mb-1">
              ENERGY FLOW DIAGRAM
            </p>
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Live Flow Model (Grid/Solar ⟶ Appliances)
            </h4>
          </div>
          {selectedNode && (
            <button 
              onClick={() => setSelectedNode(null)}
              className="text-[10px] px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 dark:text-slate-400 font-bold transition-all cursor-pointer"
            >
              Clear Filter: {selectedNode} ✕
            </button>
          )}
        </div>

        <div className="relative border border-slate-150 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-900/20 rounded-3xl p-6 overflow-hidden">
          <svg viewBox="0 0 600 300" className="w-full h-auto max-h-[300px]">
            <defs>
              <linearGradient id="gridGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#60A5FA" stopOpacity={0.6} />
              </linearGradient>
              <linearGradient id="solarGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0.6} />
              </linearGradient>
              <linearGradient id="gridFlowGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
              <linearGradient id="solarFlowGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>

            {/* FLOW PATHS */}
            {outputNodes.map((node, idx) => {
              const y_out = N > 1 ? 20 + idx * spacing : 110;
              const x_start = 170;
              const x_end = 430;
              
              // Grid path
              const y_grid_start = yGrid + 25;
              const y_grid_end = y_out + 12;
              const gridPath = `M ${x_start} ${y_grid_start} C ${(x_start + x_end)/2} ${y_grid_start}, ${(x_start + x_end)/2} ${y_grid_end}, ${x_end} ${y_grid_end}`;
              const gridFlowValue = Math.round(node.kwh * gridRatio);
              const gridStrokeWidth = Math.max(1.5, (gridFlowValue / totalKwh) * 35);
              
              const isGridSelected = selectedNode === "Grid" || selectedNode === node.name;
              const isGridDimmed = selectedNode && !isGridSelected;
              const isGridHovered = hoveredFlow?.source === "Grid" && hoveredFlow?.target === node.name;
              
              // Solar path
              const y_solar_start = ySolar + 25;
              const y_solar_end = y_out + 28;
              const solarPath = `M ${x_start} ${y_solar_start} C ${(x_start + x_end)/2} ${y_solar_start}, ${(x_start + x_end)/2} ${y_solar_end}, ${x_end} ${y_solar_end}`;
              const solarFlowValue = Math.round(node.kwh * solarRatio);
              const solarStrokeWidth = Math.max(1.5, (solarFlowValue / totalKwh) * 35);

              const isSolarSelected = selectedNode === "Solar" || selectedNode === node.name;
              const isSolarDimmed = selectedNode && !isSolarSelected;
              const isSolarHovered = hoveredFlow?.source === "Solar" && hoveredFlow?.target === node.name;

              return (
                <g key={idx}>
                  {/* Grid to output path */}
                  {gridFlowValue > 0 && (
                    <>
                      <path 
                        d={gridPath}
                        stroke="url(#gridGrad)"
                        strokeWidth={gridStrokeWidth}
                        fill="none"
                        className="transition-all duration-300"
                        style={{ opacity: isGridDimmed ? 0.08 : isGridHovered ? 0.8 : 0.3 }}
                      />
                      <path 
                        d={gridPath}
                        stroke="url(#gridFlowGrad)"
                        strokeWidth={Math.max(1, gridStrokeWidth * 0.4)}
                        fill="none"
                        strokeDasharray="6 8"
                        className="animate-flow-dash transition-all duration-300"
                        style={{ opacity: isGridDimmed ? 0.04 : 0.8 }}
                        onMouseEnter={(e) => {
                          setHoveredFlow({ source: "Grid", target: node.name, value: gridFlowValue, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY - 25 });
                        }}
                        onMouseLeave={() => setHoveredFlow(null)}
                      />
                    </>
                  )}

                  {/* Solar to output path */}
                  {hasSolar && solarFlowValue > 0 && (
                    <>
                      <path 
                        d={solarPath}
                        stroke="url(#solarGrad)"
                        strokeWidth={solarStrokeWidth}
                        fill="none"
                        className="transition-all duration-300"
                        style={{ opacity: isSolarDimmed ? 0.08 : isSolarHovered ? 0.8 : 0.3 }}
                      />
                      <path 
                        d={solarPath}
                        stroke="url(#solarFlowGrad)"
                        strokeWidth={Math.max(1, solarStrokeWidth * 0.4)}
                        fill="none"
                        strokeDasharray="6 8"
                        className="animate-flow-dash transition-all duration-300"
                        style={{ opacity: isSolarDimmed ? 0.04 : 0.8 }}
                        onMouseEnter={(e) => {
                          setHoveredFlow({ source: "Solar", target: node.name, value: solarFlowValue, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY - 25 });
                        }}
                        onMouseLeave={() => setHoveredFlow(null)}
                      />
                    </>
                  )}
                </g>
              );
            })}

            {/* INPUT NODES */}
            {/* Grid Node */}
            <g 
              className="cursor-pointer group" 
              onClick={() => setSelectedNode(selectedNode === "Grid" ? null : "Grid")}
            >
              <rect 
                x="40" 
                y={yGrid} 
                width="130" 
                height="50" 
                rx="12" 
                className={`transition-all duration-300 ${
                  selectedNode === "Grid" 
                    ? "fill-blue-600 dark:fill-blue-500/80 stroke-blue-400" 
                    : "fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-800 hover:stroke-blue-500"
                } stroke-[2.5px]`}
              />
              <text 
                x="105" 
                y={yGrid + 22} 
                textAnchor="middle" 
                className={`text-[11px] font-extrabold ${selectedNode === "Grid" ? "fill-white" : "fill-slate-800 dark:fill-slate-100"}`}
              >
                🔌 Grid Power
              </text>
              <text 
                x="105" 
                y={yGrid + 38} 
                textAnchor="middle" 
                className={`text-[10px] font-bold ${selectedNode === "Grid" ? "fill-blue-200" : "fill-slate-400 dark:fill-slate-500"}`}
              >
                {Math.round(gridInput)} kWh
              </text>
            </g>

            {/* Solar Node */}
            {hasSolar && (
              <g 
                className="cursor-pointer group" 
                onClick={() => setSelectedNode(selectedNode === "Solar" ? null : "Solar")}
              >
                <rect 
                  x="40" 
                  y={ySolar} 
                  width="130" 
                  height="50" 
                  rx="12" 
                  className={`transition-all duration-300 ${
                    selectedNode === "Solar" 
                      ? "fill-amber-500 dark:fill-amber-600/80 stroke-amber-400" 
                      : "fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-800 hover:stroke-amber-500"
                  } stroke-[2.5px]`}
                  style={{ opacity: solarInput === 0 ? 0.35 : 1 }}
                />
                <text 
                  x="105" 
                  y={ySolar + 22} 
                  textAnchor="middle" 
                  className={`text-[11px] font-extrabold ${selectedNode === "Solar" ? "fill-white" : "fill-slate-800 dark:fill-slate-100"}`}
                  style={{ opacity: solarInput === 0 ? 0.35 : 1 }}
                >
                  ☀️ Solar Energy
                </text>
                <text 
                  x="105" 
                  y={ySolar + 38} 
                  textAnchor="middle" 
                  className={`text-[10px] font-bold ${selectedNode === "Solar" ? "fill-amber-100" : "fill-slate-400 dark:fill-slate-500"}`}
                  style={{ opacity: solarInput === 0 ? 0.35 : 1 }}
                >
                  {Math.round(solarInput)} kWh
                </text>
              </g>
            )}

            {/* OUTPUT NODES */}
            {outputNodes.map((node, idx) => {
              const y_out = N > 1 ? 20 + idx * spacing : 110;
              const isNodeSelected = selectedNode === node.name;
              
              return (
                <g 
                  key={idx} 
                  className="cursor-pointer group" 
                  onClick={() => setSelectedNode(selectedNode === node.name ? null : node.name)}
                >
                  <rect 
                    x="430" 
                    y={y_out} 
                    width="130" 
                    height="42" 
                    rx="10" 
                    className={`transition-all duration-300 ${
                      isNodeSelected 
                        ? "fill-primary-green dark:fill-primary-green/80 stroke-green-400" 
                        : "fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-800 hover:stroke-primary-green"
                    } stroke-[2.5px]`}
                  />
                  <text 
                    x="495" 
                    y={y_out + 18} 
                    textAnchor="middle" 
                    className={`text-[10.5px] font-extrabold truncate max-w-[110px] ${isNodeSelected ? "fill-white" : "fill-slate-800 dark:fill-slate-100"}`}
                  >
                    {node.name}
                  </text>
                  <text 
                    x="495" 
                    y={y_out + 32} 
                    textAnchor="middle" 
                    className={`text-[9.5px] font-bold ${isNodeSelected ? "fill-green-100" : "fill-slate-400 dark:fill-slate-500"}`}
                  >
                    {Math.round(node.kwh)} kWh ({node.percentage}%)
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Flow Tooltip Overlay */}
          {hoveredFlow && (
            <div 
              className="absolute bg-slate-950/90 text-white text-[10.5px] font-semibold px-2.5 py-1.5 rounded-lg border border-slate-800 shadow-xl pointer-events-none z-30 flex flex-col gap-0.5 leading-none transition-opacity duration-150"
              style={{ left: hoveredFlow.x + 10, top: hoveredFlow.y }}
            >
              <div className="flex gap-1.5 items-center">
                <span>{hoveredFlow.source === "Grid" ? "🔌 Grid" : "☀️ Solar"}</span>
                <span className="text-slate-500">⟶</span>
                <span>{hoveredFlow.target}</span>
              </div>
              <span className="font-mono font-bold text-primary-green text-xs mt-1">{hoveredFlow.value} kWh / month</span>
            </div>
          )}
        </div>

        {/* Informative alert */}
        <div className="bg-slate-50 dark:bg-slate-900/40 p-3.5 rounded-2xl border border-slate-150 dark:border-slate-800/80 text-xs text-slate-655 dark:text-slate-400 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-primary-blue dark:text-blue-400 shrink-0 mt-0.5" />
          <span>
            {hasSolar ? (
              <>Your recommended <strong>{recommendedKw} kW system</strong> offsets <strong>{Math.round(solarRatio * 100)}%</strong> of your total load. Click on Grid, Solar, or Appliance nodes to isolate specific power streams.</>
            ) : (
              <>Currently running <strong>100% on Grid Power</strong>. To view solar offsets, switch to the <strong>Solar Savings Planner</strong> tab and configure your system.</>
            )}
          </span>
        </div>
      </div>
    );
  };

  if (mode === "consumption") {
    return (
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 page-break-avoid">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-primary-blue/10 dark:bg-primary-blue/20 text-primary-blue dark:text-blue-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Consumption & Appliance Analytics</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Detailed breakdown of how your appliances drive monthly consumption.
              </p>
            </div>
          </div>
          
          {/* Tab Selection */}
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/50 shrink-0">
            <button
              onClick={() => setConsumptionTab("share")}
              className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
                consumptionTab === "share"
                  ? "bg-white dark:bg-slate-850 text-slate-800 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setConsumptionTab("flow")}
              className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
                consumptionTab === "flow"
                  ? "bg-white dark:bg-slate-850 text-slate-800 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              Energy Flow
            </button>
          </div>
        </div>

        {consumptionTab === "share" ? (
          /* Charts Grid */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
            {/* Donut Chart: Appliance Share */}
            <div className="space-y-4 text-left flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-slate-455 dark:text-slate-550 uppercase tracking-widest block mb-1">
                  ENERGY SHARE DISTRIBUTION
                </p>
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Appliance Energy Contribution
                </h4>
              </div>
              
              <div className="relative h-64 w-full flex items-center justify-center my-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="kwh"
                      animationDuration={800}
                    >
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [`${value} kWh`, 'Monthly Usage']}
                      contentStyle={{
                        backgroundColor: activeTheme === "dark" ? "#1E293B" : "#0F172A",
                        border: activeTheme === "dark" ? "1px solid #334155" : "none",
                        borderRadius: "12px",
                        color: activeTheme === "dark" ? "#F8FAFC" : "#FFF",
                        fontSize: 11,
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-display font-extrabold text-slate-900 dark:text-white leading-none">{liveTotalUnits}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total kWh</span>
                </div>
              </div>

              {/* Custom Legend */}
              <div className="flex flex-wrap gap-x-3 gap-y-1.5 justify-start text-[11px] font-medium border-t border-slate-100 dark:border-slate-800 pt-3">
                {chartData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: colors[index % colors.length] }}></div>
                    <span className="text-slate-600 dark:text-slate-400">{entry.name} ({entry.percentage}%)</span>
                  </div>
                ))}
              </div>

              {/* Insight */}
              <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-150 dark:border-slate-800/80 text-xs text-slate-655 dark:text-slate-400 flex items-start gap-2 mt-2">
                <Sparkles className="w-4 h-4 text-primary-green shrink-0 mt-0.5" />
                <span>
                  {chartData.length > 0 ? (
                    <><strong>{chartData[0]?.name}</strong> is your primary energy driver, accounting for <strong>{chartData[0]?.percentage}%</strong> of consumption. Target this appliance first for savings.</>
                  ) : (
                    <>Add appliances to see your energy share distribution and targeted recommendations.</>
                  )}
                </span>
              </div>
            </div>

            {/* Area Chart: 6-Month Trend */}
            <div className="space-y-4 text-left flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-slate-455 dark:text-slate-550 uppercase tracking-widest block mb-1">
                  CONSUMPTION HISTORY
                </p>
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  6-Month Energy Trend (kWh)
                </h4>
              </div>

              <div className="h-64 w-full my-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorKwh" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={activeTheme === "dark" ? "#334155" : "#E2E8F0"} />
                    <XAxis dataKey="name" stroke={activeTheme === "dark" ? "#94A3B8" : "#64748B"} fontSize={10} tickLine={false} />
                    <YAxis stroke={activeTheme === "dark" ? "#94A3B8" : "#64748B"} fontSize={10} tickLine={false} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: activeTheme === "dark" ? "#1E293B" : "#0F172A",
                        border: activeTheme === "dark" ? "1px solid #334155" : "none",
                        borderRadius: "12px",
                        color: activeTheme === "dark" ? "#F8FAFC" : "#FFF",
                        fontSize: 11
                      }}
                    />
                    <Area type="monotone" dataKey="kwh" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorKwh)" animationDuration={800} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Trend Explanation Text */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                <p className="text-[10px] text-slate-400 dark:text-slate-550 font-semibold uppercase tracking-wider">Historical Comparison Basis</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Calculations compare your current load against seasonal parameters. {reports.length > 0 ? "Uses actual report records saved." : "Calculated using domestic energy models."}
                </p>
              </div>

              {/* Insight */}
              <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-150 dark:border-slate-800/80 text-xs text-slate-655 dark:text-slate-400 flex items-start gap-2 mt-2">
                <TrendingUp className="w-4 h-4 text-primary-blue dark:text-blue-400 shrink-0 mt-0.5" />
                <span>
                  {isAboveBaseline ? (
                    <>This month you used <strong>{diffPercent}% more</strong> than the average home baseline (250 kWh). Peak usage typically occurs during summer months.</>
                  ) : (
                    <>Great job! Your usage is <strong>{diffPercent}% below</strong> the average home baseline (250 kWh). Keep using energy-efficient modes.</>
                  )}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Sankey Diagram Flow View */
          <div className="pt-2">
            {renderSankeyDiagram()}
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // SOLAR ROI MODE
  // ----------------------------------------------------
  return (
    <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-8 page-break-avoid text-left">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
          <Sun className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Solar Return on Investment Analytics</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Visualizing solar offsets, monthly utility bills, and the investment payback timeline.
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart: Original vs With Solar Bill */}
        <div className="space-y-4 text-left flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-slate-450 dark:text-slate-550 uppercase tracking-widest block mb-1">
              SEASONAL BILL COMPARISON
            </p>
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              12-Month Utility Bills (₹)
            </h4>
          </div>

          <div className="h-64 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resolvedSolarSavings} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={activeTheme === "dark" ? "#334155" : "#E2E8F0"} />
                <XAxis dataKey="name" stroke={activeTheme === "dark" ? "#94A3B8" : "#64748B"} fontSize={10} tickLine={false} />
                <YAxis stroke={activeTheme === "dark" ? "#94A3B8" : "#64748B"} fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: activeTheme === "dark" ? "#1E293B" : "#0F172A",
                    border: activeTheme === "dark" ? "1px solid #334155" : "none",
                    borderRadius: "12px",
                    color: activeTheme === "dark" ? "#F8FAFC" : "#FFF",
                    fontSize: 11
                  }}
                />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Original Bill" fill="#3B82F6" radius={[3, 3, 0, 0]} animationDuration={800} />
                <Bar dataKey="With Solar Bill" fill="#F59E0B" radius={[3, 3, 0, 0]} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Explanation Text */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
            <p className="text-[10px] text-slate-400 dark:text-slate-550 font-semibold uppercase tracking-wider">Seasonal Model</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Simulates reduced generation in monsoon months (July-Aug) and peak production during spring (Mar-May).
            </p>
          </div>

          {/* Insight */}
          <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-150 dark:border-slate-800/80 text-xs text-slate-655 dark:text-slate-400 flex items-start gap-2 mt-2">
            <Sun className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              Solar panels will offset your bill year-round. Annual estimated utility savings reach <strong>₹{(resolvedSolarSavings.reduce((sum, d) => sum + d.Savings, 0)).toLocaleString('en-IN')}</strong>.
            </span>
          </div>
        </div>

        {/* Line Chart: Payback timeline */}
        <div className="space-y-4 text-left flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-slate-450 dark:text-slate-550 uppercase tracking-widest block mb-1">
              INVESTMENT TIMELINE
            </p>
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Cumulative Savings & Payback (₹)
            </h4>
          </div>

          <div className="h-64 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={resolvedPaybackData.data} margin={{ top: 15, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={activeTheme === "dark" ? "#334155" : "#E2E8F0"} />
                <XAxis dataKey="year" stroke={activeTheme === "dark" ? "#94A3B8" : "#64748B"} fontSize={10} tickLine={false} />
                <YAxis stroke={activeTheme === "dark" ? "#94A3B8" : "#64748B"} fontSize={10} tickLine={false} />
                <Tooltip 
                  formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Balance']}
                  contentStyle={{
                    backgroundColor: activeTheme === "dark" ? "#1E293B" : "#0F172A",
                    border: activeTheme === "dark" ? "1px solid #334155" : "none",
                    borderRadius: "12px",
                    color: activeTheme === "dark" ? "#F8FAFC" : "#FFF",
                    fontSize: 11
                  }}
                />
                <ReferenceLine y={0} stroke="#EF4444" strokeWidth={1.5} strokeDasharray="4 4" />
                <Line type="monotone" dataKey="Balance" stroke="#10B981" strokeWidth={3} dot={{ r: 4, strokeWidth: 1 }} activeDot={{ r: 6 }} animationDuration={800} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Explanation Text */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
            <p className="text-[10px] text-slate-400 dark:text-slate-550 font-semibold uppercase tracking-wider">Break-Even Parameters</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Assumes a {recommendedKw} kW setup cost of ₹{resolvedPaybackData.estCost.toLocaleString('en-IN')} (net PM Surya Ghar subsidy) and adjustable inflation/degradation factors.
            </p>
          </div>

          {/* Insight */}
          <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-150 dark:border-slate-800/80 text-xs text-slate-655 dark:text-slate-400 flex items-start gap-2 mt-2">
            <IndianRupee className="w-4 h-4 text-primary-green shrink-0 mt-0.5" />
            <span>
              Solar payback is reached in <strong>{paybackPeriodYearText}</strong>. Cumulative savings after 10 years will reach <strong>₹{(resolvedPaybackData.data[10]?.savings || 0).toLocaleString('en-IN')}</strong>.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
