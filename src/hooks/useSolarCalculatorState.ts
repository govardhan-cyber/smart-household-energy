import { useState, useEffect } from "react";
import { calculateSolarROI } from "../utils/solarCalculator";
import { useAuth } from "../context/AuthContext";

export interface UseSolarCalculatorStateReturn {
  // Input states
  monthlyBill: number;
  setMonthlyBill: React.Dispatch<React.SetStateAction<number>>;
  roofArea: number;
  setRoofArea: React.Dispatch<React.SetStateAction<number>>;
  selectedState: string;
  setSelectedState: React.Dispatch<React.SetStateAction<string>>;
  solarTech: "mono-perc" | "topcon";
  setSolarTech: React.Dispatch<React.SetStateAction<"mono-perc" | "topcon">>;
  selectedCity: string;
  setSelectedCity: React.Dispatch<React.SetStateAction<string>>;
  isMounted: boolean;
  
  tariffIncrease: number;
  setTariffIncrease: React.Dispatch<React.SetStateAction<number>>;
  panelDegradation: number;
  setPanelDegradation: React.Dispatch<React.SetStateAction<number>>;
  maintenanceRate: number;
  setMaintenanceRate: React.Dispatch<React.SetStateAction<number>>;
  
  isHybrid: boolean;
  setIsHybrid: React.Dispatch<React.SetStateAction<boolean>>;
  batteryKwh: number;
  setBatteryKwh: React.Dispatch<React.SetStateAction<number>>;
  batteryType: "lithium" | "lead-acid";
  setBatteryType: React.Dispatch<React.SetStateAction<"lithium" | "lead-acid">>;
  
  showTariffExpl: boolean;
  setShowTariffExpl: React.Dispatch<React.SetStateAction<boolean>>;
  showDegradationExpl: boolean;
  setShowDegradationExpl: React.Dispatch<React.SetStateAction<boolean>>;
  showMaintenanceExpl: boolean;
  setShowMaintenanceExpl: React.Dispatch<React.SetStateAction<boolean>>;
  
  roofTilt: "flat" | "inclined";
  setRoofTilt: React.Dispatch<React.SetStateAction<"flat" | "inclined">>;
  roofOrientation: "south" | "east" | "west";
  setRoofOrientation: React.Dispatch<React.SetStateAction<"south" | "east" | "west">>;
  shadedPanels: Record<number, boolean>;
  setShadedPanels: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;

  // Local constants/configs
  netMeteringPolicy: string;
  buybackRate: number;
  todShiftPercent: number;

  // Derived calculations & ROI output
  tariffKey: string;
  shadedPanelsCount: number;
  roiOutput: ReturnType<typeof calculateSolarROI>;
  kwhNeeded: number;
  recommendedKw: number;
  totalUpfrontInvestment: number;
  monthlyGeneration: number;
  monthlySavings: number;
  firstYearSavings: number;
  tenYearNetSavings: number;
  twentyFiveYearNetSavings: number;
  paybackPeriodVal: number;
  panelsNeeded: number;
  oldBill: number;
  kwNeededByUsage: number;
  maxKwBySpace: number;
  newUnits: number;
  newBill: number;
  panelWattage: number;
  panelEfficiency: number;
  panelWeight: number;
  panelSizeLabel: string;
  billCoveragePercent: number;
  spaceUtilizedPercent: number;
  conclusion: {
    badge: string;
    colorClass: string;
    iconColor: string;
    message: string;
  };
  readinessScore: number;
  co2Reduction: number;
  treesEquivalent: number;
  billPercent: number;
  roofPercent: number;

  // Helpers
  handleSelectReferenceSize: (targetBill: number, targetSpace: number) => void;
  togglePanelShaded: (idx: number) => void;
  getFullStateName: (stateCode: string) => string;
}

export const useSolarCalculatorState = (tariffState: string): UseSolarCalculatorStateReturn => {
  const { user } = useAuth();
  
  // Input States
  const [monthlyBill, setMonthlyBill] = useState<number>(3000); 
  const [roofArea, setRoofArea] = useState<number>(300); 
  const [selectedState, setSelectedState] = useState<string>(tariffState || "ap");
  const [solarTech, setSolarTech] = useState<"mono-perc" | "topcon">("topcon");
  const [selectedCity, setSelectedCity] = useState<string>("pune");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (selectedState === "ka") {
      setSelectedCity("bangalore");
    } else {
      setSelectedCity("pune");
    }
  }, [selectedState]);

  const handleSelectReferenceSize = (targetBill: number, targetSpace: number) => {
    setMonthlyBill(targetBill);
    setRoofArea(targetSpace);
    
    // Smooth scroll to the top of the planner inputs card
    setTimeout(() => {
      const plannerCard = document.getElementById("solar-savings-planner-card");
      if (plannerCard) {
        plannerCard.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 50);
  };

  const [tariffIncrease, setTariffIncrease] = useState<number>(4); 
  const [panelDegradation, setPanelDegradation] = useState<number>(0.8); 
  const [maintenanceRate, setMaintenanceRate] = useState<number>(1.0); 

  // Hybrid Solar, Battery Storage, Net Metering Policy and TOD Load Shifting states
  const [isHybrid, setIsHybrid] = useState<boolean>(false);
  const [batteryKwh, setBatteryKwh] = useState<number>(5);
  const [batteryType, setBatteryType] = useState<"lithium" | "lead-acid">("lithium");
  const netMeteringPolicy = "net-metering";
  const buybackRate = 3.5;
  const todShiftPercent = 0;
  const [showTariffExpl, setShowTariffExpl] = useState<boolean>(false);
  const [showDegradationExpl, setShowDegradationExpl] = useState<boolean>(false);
  const [showMaintenanceExpl, setShowMaintenanceExpl] = useState<boolean>(false);

  // Custom visual states for isometric roof planner
  const [roofTilt, setRoofTilt] = useState<"flat" | "inclined">("inclined");
  const [roofOrientation, setRoofOrientation] = useState<"south" | "east" | "west">("south");
  const [shadedPanels, setShadedPanels] = useState<Record<number, boolean>>({}); 

  // Map state selector codes to tariffService keys
  const getTariffKey = (stateCode: string) => {
    const code = stateCode.toLowerCase();
    if (code === "ts") return "telangana";
    if (code === "ka") return "karnataka";
    return code; 
  };

  const getFullStateName = (stateCode: string) => {
    switch (stateCode.toLowerCase()) {
      case "ap": return "Andhra Pradesh";
      case "ts": return "Telangana";
      case "ka": return "Karnataka";
      case "telangana": return "Telangana";
      case "karnataka": return "Karnataka";
      case "custom": return "Custom Profile";
      default: return "Andhra Pradesh";
    }
  };

  const tariffKey = getTariffKey(selectedState);
  const shadedPanelsCount = Object.values(shadedPanels).filter(Boolean).length;

  const roiOutput = calculateSolarROI({
    monthlyBill,
    roofArea,
    selectedState,
    selectedCity,
    solarTech,
    roofTilt,
    roofOrientation,
    shadedPanelsCount,
    isHybrid,
    batteryKwh,
    batteryType,
    netMeteringPolicy,
    buybackRate,
    todShiftPercent,
    tariffIncrease,
    panelDegradation,
    maintenanceRate
  });

  const {
    kwhNeeded,
    recommendedKw,
    totalUpfrontInvestment,
    monthlyGeneration,
    monthlySavings,
    firstYearSavings,
    tenYearNetSavings,
    twentyFiveYearNetSavings,
    paybackPeriodVal,
    panelsNeeded,
    oldBill
  } = roiOutput;

  // Derived sizing diagnostics (for JSX display)
  const kwNeededByUsage = kwhNeeded / 120;
  const maxKwBySpace = roofArea / 100;
  // Derived net-metering values (for JSX display)
  const newUnits = Math.max(0, kwhNeeded - monthlyGeneration);
  const newBill = Math.max(0, oldBill - monthlySavings);

  // Technology details for specifications section in JSX
  const panelWattage = solarTech === "topcon" ? 580 : 500;
  const panelEfficiency = solarTech === "topcon" ? 26 : 22.5;
  const panelWeight = solarTech === "topcon" ? 32 : 27;
  const panelSizeLabel = solarTech === "topcon" ? "~2.1 m × 1.1 m" : "~2.0 m × 1.0 m";

  // Cache planner outputs to local storage when configurations change
  useEffect(() => {
    if (user?.uid) {
      const cacheKey = `she_solar_cache_${user.uid}`;
      const solarCache = {
        recommendedKw,
        installationCost: totalUpfrontInvestment,
        monthlyGeneration,
        monthlySavings,
        paybackPeriodVal,
        panelsNeeded,
        tenYearNetSavings,
        twentyFiveYearNetSavings,
        selectedCity,
        solarTech,
        roofArea,
        monthlyBillInput: monthlyBill,
        isHybrid,
        batteryKwh,
        batteryType,
        netMeteringPolicy,
        buybackRate,
        todShiftPercent
      };
      localStorage.setItem(cacheKey, JSON.stringify(solarCache));
    }
  }, [user?.uid, recommendedKw, totalUpfrontInvestment, monthlyGeneration, monthlySavings, paybackPeriodVal, panelsNeeded, tenYearNetSavings, twentyFiveYearNetSavings, selectedCity, solarTech, roofArea, monthlyBill, isHybrid, batteryKwh, batteryType, netMeteringPolicy, buybackRate, todShiftPercent]);

  // Percentages
  const billCoveragePercent = oldBill > 0 ? Math.min(100, Math.round((monthlySavings / oldBill) * 100)) : 0;
  const spaceUtilizedPercent = Math.min(100, Math.round(((recommendedKw * 100) / roofArea) * 100));

  // Worth It Conclusion mapping
  const getWorthItConclusion = (payback: number) => {
    if (payback <= 5) {
      return {
        badge: "Excellent Return",
        colorClass: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-primary-green dark:border-green-900/40",
        iconColor: "text-green-500",
        message: "Highly Worth It! The system pays for itself extremely fast, giving you nearly two decades of free electricity."
      };
    }
    if (payback <= 8) {
      return {
        badge: "Highly Recommended",
        colorClass: "bg-green-50/50 text-green-700 border-green-200/50 dark:bg-green-950/15 dark:text-primary-green dark:border-green-900/30",
        iconColor: "text-green-500",
        message: "Worth It! A very strong financial return. Your upfront investment is recovered quickly, yielding major long-term savings."
      };
    }
    if (payback <= 12) {
      return {
        badge: "Moderate Return",
        colorClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/40",
        iconColor: "text-amber-500",
        message: "Recommended. A solid investment. It takes slightly longer to break even, but still saves substantial money over the panel lifetime."
      };
    }
    return {
      badge: "Long-Term Payback",
      colorClass: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800",
      iconColor: "text-slate-400",
      message: "Long payback period. It will take over 12 years to recover the system cost. Solar is still viable for environmental reasons or energy independence."
    };
  };

  const conclusion = getWorthItConclusion(paybackPeriodVal);

  // Derive Solar Readiness Score (Stated formula targeting ~92 baseline)
  const readinessScore = Math.max(30, Math.min(100, Math.round(
    Math.min(30, (roofArea / 450) * 30) +
    Math.min(45, (monthlyGeneration / (kwhNeeded || 1)) * 45) +
    Math.max(0, Math.min(25, (12 - paybackPeriodVal) * 2.5 + 10)) +
    (solarTech === "topcon" ? 4 : 0)
  )));

  // Environmental offsets
  const co2Reduction = (monthlyGeneration * 12 * 0.8) / 1000; // tons of CO2 per year
  const treesEquivalent = Math.round(co2Reduction * 45);

  // Floating bubbles percentage calculations
  const billPercent = ((monthlyBill - 1000) / 14000) * 100;
  const roofPercent = ((roofArea - 50) / 1450) * 100;

  const togglePanelShaded = (idx: number) => {
    setShadedPanels(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  return {
    monthlyBill,
    setMonthlyBill,
    roofArea,
    setRoofArea,
    selectedState,
    setSelectedState,
    solarTech,
    setSolarTech,
    selectedCity,
    setSelectedCity,
    isMounted,
    
    tariffIncrease,
    setTariffIncrease,
    panelDegradation,
    setPanelDegradation,
    maintenanceRate,
    setMaintenanceRate,
    
    isHybrid,
    setIsHybrid,
    batteryKwh,
    setBatteryKwh,
    batteryType,
    setBatteryType,
    
    showTariffExpl,
    setShowTariffExpl,
    showDegradationExpl,
    setShowDegradationExpl,
    showMaintenanceExpl,
    setShowMaintenanceExpl,
    
    roofTilt,
    setRoofTilt,
    roofOrientation,
    setRoofOrientation,
    shadedPanels,
    setShadedPanels,

    netMeteringPolicy,
    buybackRate,
    todShiftPercent,

    tariffKey,
    shadedPanelsCount,
    roiOutput,
    kwhNeeded,
    recommendedKw,
    totalUpfrontInvestment,
    monthlyGeneration,
    monthlySavings,
    firstYearSavings,
    tenYearNetSavings,
    twentyFiveYearNetSavings,
    paybackPeriodVal,
    panelsNeeded,
    oldBill,
    kwNeededByUsage,
    maxKwBySpace,
    newUnits,
    newBill,
    panelWattage,
    panelEfficiency,
    panelWeight,
    panelSizeLabel,
    billCoveragePercent,
    spaceUtilizedPercent,
    conclusion,
    readinessScore,
    co2Reduction,
    treesEquivalent,
    billPercent,
    roofPercent,

    handleSelectReferenceSize,
    togglePanelShaded,
    getFullStateName
  };
};
