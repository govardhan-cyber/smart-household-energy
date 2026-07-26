import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { reportsService } from "../utils/reportsService";
import type { EnergyReport } from "../utils/reportsService";
import { calculateBill, defaultAppliances, getApplianceDecayRate } from "../utils/tariffCalculator";
import type { ApplianceItem, TariffResult } from "../utils/tariffCalculator";
import { Wind, Lightbulb, Snowflake, Zap } from "lucide-react";

export interface RecommendationItem {
  id: string;
  title: string;
  description: string;
  savings: number;
  badge: "High" | "Medium" | "Low" | "Minor";
  badgeColor: string;
  icon: React.ReactNode;
  difficulty?: "Easy" | "Medium" | "Hard";
  impact?: "High" | "Medium" | "Low";
}

export interface AnalysisResult {
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

export interface UseDashboardStateReturn {
  user: any;
  currentStep: 1 | 2 | 3 | 4;
  setCurrentStep: React.Dispatch<React.SetStateAction<1 | 2 | 3 | 4>>;
  activeTab: "wizard" | "solar" | "audit";
  setActiveTab: React.Dispatch<React.SetStateAction<"wizard" | "solar" | "audit">>;
  renderedTab: "wizard" | "solar" | "audit";
  appliances: ApplianceItem[];
  activeAppliances: ApplianceItem[];
  analysisResult: AnalysisResult | null;
  isAnalyzing: boolean;
  reports: EnergyReport[];
  reportsLoading: boolean;
  toast: { type: "success" | "error" | "info"; message: string } | null;
  setToast: React.Dispatch<React.SetStateAction<{ type: "success" | "error" | "info"; message: string } | null>>;
  hasInitiated: boolean;
  liveTotalUnits: number;
  liveBill: TariffResult;
  benchmarkDiffPercent: number;
  isAboveBenchmark: boolean;
  benchmarkCharge: number;
  benchmarkUnits: number;
  liveSavingsPotential: number;
  solarOffsetPercent: number;
  recommendedKw: number;
  chartData: { name: string; kwh: number; percentage: number }[];
  momTrend: { label: string; value: string; trend: "up" | "down" | "neutral"; type: "positive" | "negative" | "neutral" };
  vsAvgTrend: { label: string; value: string; trend: "up" | "down"; type: "positive" | "negative" };
  toggleAppliance: (appId: string) => void;
  updateQuantity: (appId: string, increment: number) => void;
  updateHours: (appId: string, hours: number) => void;
  updateUnitHours: (appId: string, unitIndex: number, hours: number) => void;
  updateWatts: (appId: string, watts: number) => void;
  updateAge: (appId: string, age: number) => void;
  updateUnitAge: (appId: string, unitIndex: number, age: number) => void;
  handleAnalyze: () => Promise<void>;
  handleReset: () => void;
  handleExportCSV: (report: AnalysisResult) => void;
  handleStartAudit: () => void;
  handleRunAudit: () => void;
}

export const useDashboardState = (): UseDashboardStateReturn => {
  const { user } = useAuth();

  // History states for stats calculation
  const [reports, setReports] = useState<EnergyReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [toast, setToast] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  // Wizard States
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [activeTab, setActiveTab] = useState<"wizard" | "solar" | "audit">(() => {
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    const tab = params.get("tab");
    if (tab === "solar" || tab === "audit") return tab;
    return "wizard";
  });
  const [renderedTab, setRenderedTab] = useState<"wizard" | "solar" | "audit">(() => {
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    const tab = params.get("tab");
    if (tab === "solar" || tab === "audit") return tab;
    return "wizard";
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setRenderedTab(activeTab);
    }, 250);
    return () => clearTimeout(timer);
  }, [activeTab]);

  // Auto-dismiss toast notifications after 3.5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const [appliances, setAppliances] = useState<ApplianceItem[]>(() => {
    return defaultAppliances.map(app => {
      let qty = app.quantity;
      let hrs = app.hours;
      if (app.id === 'ac') { qty = 1; hrs = 6; }
      else if (app.id === 'fridge') { qty = 1; hrs = 24; }
      else if (app.id === 'fan') { qty = 2; hrs = 12; }
      else if (app.id === 'lights') { qty = 4; hrs = 8; }
      else if (app.id === 'lights_tube') { qty = 2; hrs = 6; }
      return { 
        ...app, 
        quantity: qty, 
        hours: hrs,
        unitHours: Array(qty).fill(hrs),
        age: 0,
        unitAges: Array(qty).fill(0)
      };
    });
  });

  const toggleAppliance = (appId: string) => {
    setAppliances(prev => prev.map(app => {
      if (app.id === appId) {
        const isSelected = app.quantity > 0;
        const newQty = isSelected ? 0 : 1;
        const defaultHours = app.hours || 6;
        return {
          ...app,
          quantity: newQty,
          hours: defaultHours,
          unitHours: Array(newQty).fill(defaultHours),
          age: 0,
          unitAges: Array(newQty).fill(0)
        };
      }
      return app;
    }));
  };

  const updateQuantity = (appId: string, increment: number) => {
    setAppliances(prev => prev.map(app => {
      if (app.id === appId) {
        const newQty = Math.max(0, app.quantity + increment);
        
        let newUnitHours = [...(app.unitHours || [])];
        if (newUnitHours.length < newQty) {
          const padVal = newUnitHours.length > 0 ? newUnitHours[newUnitHours.length - 1] : (app.hours || 6);
          while (newUnitHours.length < newQty) {
            newUnitHours.push(padVal);
          }
        } else if (newUnitHours.length > newQty) {
          newUnitHours = newUnitHours.slice(0, newQty);
        }
        
        const avgHours = newQty > 0 
          ? Math.round((newUnitHours.reduce((sum, h) => sum + h, 0) / newQty) * 10) / 10
          : app.hours;

        let newUnitAges = [...(app.unitAges || [])];
        if (newUnitAges.length < newQty) {
          const padAgeVal = newUnitAges.length > 0 ? newUnitAges[newUnitAges.length - 1] : (app.age || 0);
          while (newUnitAges.length < newQty) {
            newUnitAges.push(padAgeVal);
          }
        } else if (newUnitAges.length > newQty) {
          newUnitAges = newUnitAges.slice(0, newQty);
        }

        const avgAge = newQty > 0
          ? Math.round((newUnitAges.reduce((sum, a) => sum + a, 0) / newQty) * 10) / 10
          : app.age;

        return { 
          ...app, 
          quantity: newQty, 
          unitHours: newUnitHours,
          hours: avgHours,
          unitAges: newUnitAges,
          age: avgAge
        };
      }
      return app;
    }));
  };

  const updateHours = (appId: string, hours: number) => {
    setAppliances(prev => prev.map(app => {
      if (app.id === appId) {
        const validatedHours = Math.min(24, Math.max(0, hours));
        return { 
          ...app, 
          hours: validatedHours,
          unitHours: Array(app.quantity).fill(validatedHours)
        };
      }
      return app;
    }));
  };

  const updateUnitHours = (appId: string, unitIndex: number, hours: number) => {
    setAppliances(prev => prev.map(app => {
      if (app.id === appId) {
        const validatedHours = Math.min(24, Math.max(0, hours));
        const newUnitHours = [...(app.unitHours || Array(app.quantity).fill(app.hours))];
        newUnitHours[unitIndex] = validatedHours;
        
        const avgHours = app.quantity > 0 
          ? Math.round((newUnitHours.reduce((sum, h) => sum + h, 0) / app.quantity) * 10) / 10
          : app.hours;

        return { 
          ...app, 
          unitHours: newUnitHours,
          hours: avgHours
        };
      }
      return app;
    }));
  };

  const updateWatts = (appId: string, watts: number) => {
    setAppliances(prev => prev.map(app => {
      if (app.id === appId) {
        return { 
          ...app, 
          watts: Math.max(1, watts)
        };
      }
      return app;
    }));
  };

  const updateAge = (appId: string, age: number) => {
    setAppliances(prev => prev.map(app => {
      if (app.id === appId) {
        const validatedAge = Math.min(15, Math.max(0, age));
        return { 
          ...app, 
          age: validatedAge,
          unitAges: Array(app.quantity).fill(validatedAge)
        };
      }
      return app;
    }));
  };

  const updateUnitAge = (appId: string, unitIndex: number, age: number) => {
    setAppliances(prev => prev.map(app => {
      if (app.id === appId) {
        const validatedAge = Math.min(15, Math.max(0, age));
        const newUnitAges = [...(app.unitAges || Array(app.quantity).fill(app.age || 0))];
        newUnitAges[unitIndex] = validatedAge;
        
        const avgAge = app.quantity > 0 
          ? Math.round((newUnitAges.reduce((sum, a) => sum + a, 0) / app.quantity) * 10) / 10
          : app.age;

        return { 
          ...app, 
          unitAges: newUnitAges,
          age: avgAge
        };
      }
      return app;
    }));
  };

  // Calculations states
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Load previous reports for the user
  const loadReports = async (initializeInputs = false) => {
    if (!user) return;
    setReportsLoading(true);

    const applyReportsData = (userReports: EnergyReport[]) => {
      setReports(userReports);
      if (userReports.length > 0 && initializeInputs) {
        const latest = userReports[0];
        setAppliances(prev => prev.map(app => {
          const match = latest.appliances.find(la => la.name.toLowerCase() === app.name.toLowerCase());
          if (match) {
            return { 
              ...app, 
              quantity: match.quantity, 
              hours: match.hours,
              unitHours: Array(match.quantity).fill(match.hours)
            };
          }
          return { ...app, quantity: 0, hours: app.hours, unitHours: [] };
        }));
      }
    };

    const cacheKey = `she_reports_cache_${user.uid}`;
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData) as EnergyReport[];
        applyReportsData(parsed);
        setReportsLoading(false);
      } catch (e) {
        console.error("Failed to parse cached reports in dashboard:", e);
      }
    }

    try {
      const userReports = await reportsService.getUserReports(user.uid);
      applyReportsData(userReports);
      localStorage.setItem(cacheKey, JSON.stringify(userReports));
    } catch (error) {
      console.error("Failed to load user reports from database:", error);
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    loadReports(true);
  }, [user]);

  // Synchronize appliance wattages when user settings update
  // Only overwrites appliances that have explicit custom wattages in settings.
  // Preserves manual wattage edits made in the wizard.
  useEffect(() => {
    if (user && user.customWattages) {
      const hasCustomWattages = Object.keys(user.customWattages).length > 0;
      if (!hasCustomWattages) return;
      setAppliances(prev => prev.map(app => {
        const customWatt = user.customWattages?.[app.id];
        if (customWatt !== undefined && customWatt > 0) {
          return { ...app, watts: customWatt };
        }
        return app;
      }));
    }
  }, [user?.customWattages]);

  const activeAppliances = appliances.filter(app => app.quantity > 0);
  const [hasInitiated, setHasInitiated] = useState(false);

  useEffect(() => {
    if (reports.length > 0) {
      setHasInitiated(true);
    }
  }, [reports]);

  useEffect(() => {
    if (activeAppliances.length > 0) {
      setHasInitiated(true);
    }
  }, [activeAppliances.length]);

  const liveTotalUnits = Math.round(activeAppliances.reduce((sum, app) => {
    const decayRate = getApplianceDecayRate(app.id);
    let kwh = 0;
    if (decayRate > 0) {
      for (let i = 0; i < app.quantity; i++) {
        const uHours = app.unitHours?.[i] ?? app.hours ?? 0;
        const uAge = app.unitAges?.[i] ?? app.age ?? 0;
        const effectiveWatts = app.watts * (1 + uAge * decayRate);
        kwh += (effectiveWatts / 1000) * uHours * 30;
      }
    } else {
      kwh = app.quantity * (app.watts / 1000) * app.hours * 30;
    }
    return sum + kwh;
  }, 0));

  const liveBill = calculateBill(liveTotalUnits, user?.tariffState || "ap", user?.customFlatRate || 7.5);

  // Benchmarking Calculations
  const benchmarkUnits = 250;
  const benchmarkBill = calculateBill(benchmarkUnits, user?.tariffState || "ap", user?.customFlatRate || 7.5);
  const benchmarkCharge = benchmarkBill.netEnergyCharge;
  const liveCharge = liveBill.netEnergyCharge;
  const isAboveBenchmark = liveCharge > benchmarkCharge;
  const benchmarkDiffPercent = benchmarkCharge > 0
    ? Math.round((Math.abs(liveCharge - benchmarkCharge) / benchmarkCharge) * 100)
    : 0;

  // Live savings potential calculation
  const liveAcApp = appliances.find(a => a.id === "ac" && a.quantity > 0);
  const liveAcSavedKwh = liveAcApp 
    ? liveAcApp.quantity * (liveAcApp.watts / 1000) * (liveAcApp.hours > 2 ? 2 : liveAcApp.hours * 0.5) * 30 
    : 0;

  const liveLightApp = appliances.find(a => a.id === "lights" && a.quantity > 0);
  const liveLightSavedKwh = liveLightApp && liveLightApp.watts > 9
    ? liveLightApp.quantity * ((liveLightApp.watts - 9) / 1000) * liveLightApp.hours * 30
    : 0;

  const liveTubeApp = appliances.find(a => a.id === "lights_tube" && a.quantity > 0);
  const liveTubeSavedKwh = liveTubeApp && liveTubeApp.watts > 18
    ? liveTubeApp.quantity * ((liveTubeApp.watts - 18) / 1000) * liveTubeApp.hours * 30
    : 0;

  const liveFridgeApp = appliances.find(a => a.id === "fridge" && a.quantity > 0);
  const liveFridgeSavedKwh = liveFridgeApp
    ? liveFridgeApp.quantity * (liveFridgeApp.watts / 1000) * liveFridgeApp.hours * 30 * 0.15
    : 0;

  const liveStandbySavedKwh = liveTotalUnits * 0.05;
  const liveTotalSavedKwh = liveAcSavedKwh + liveLightSavedKwh + liveTubeSavedKwh + liveFridgeSavedKwh + liveStandbySavedKwh;
  const liveUsageAfter = Math.max(0, liveTotalUnits - liveTotalSavedKwh);
  const liveBillAfter = calculateBill(liveUsageAfter, user?.tariffState || "ap", user?.customFlatRate || 7.5);
  const liveSavingsPotential = Math.max(0, liveBill.netEnergyCharge - liveBillAfter.netEnergyCharge);

  // Solar capacity estimation
  const kwNeededByUsage = liveTotalUnits / 120;
  const recommendedKw = Math.max(1, Math.round(Math.min(kwNeededByUsage, 3) * 2) / 2);
  const solarGenKwh = recommendedKw * 120;
  const solarOffsetPercent = liveTotalUnits > 0 ? Math.min(100, Math.round((solarGenKwh / liveTotalUnits) * 100)) : 0;

  // Trigger analysis and save to Firestore
  const handleAnalyze = async () => {
    if (activeAppliances.length === 0) return;
    setIsAnalyzing(true);
    
    await new Promise(resolve => setTimeout(resolve, 800));

    let maxKwh = 0;
    let highestApp = "None";
    activeAppliances.forEach(app => {
      const decayRate = getApplianceDecayRate(app.id);
      let kwh = 0;
      if (decayRate > 0) {
        for (let i = 0; i < app.quantity; i++) {
          const uHours = app.unitHours?.[i] ?? app.hours ?? 0;
          const uAge = app.unitAges?.[i] ?? app.age ?? 0;
          const effectiveWatts = app.watts * (1 + uAge * decayRate);
          kwh += (effectiveWatts / 1000) * uHours * 30;
        }
      } else {
        kwh = app.quantity * (app.watts / 1000) * app.hours * 30;
      }
      if (kwh > maxKwh) {
        maxKwh = kwh;
        highestApp = app.name;
      }
    });

    const acApp = appliances.find(a => a.id === "ac" && a.quantity > 0);
    const acSavedKwh = acApp 
      ? acApp.quantity * (acApp.watts / 1000) * (acApp.hours > 2 ? 2 : acApp.hours * 0.5) * 30 
      : 0;

    const lightApp = appliances.find(a => a.id === "lights" && a.quantity > 0);
    const lightSavedKwh = lightApp && lightApp.watts > 9
      ? lightApp.quantity * ((lightApp.watts - 9) / 1000) * lightApp.hours * 30
      : 0;

    const tubeApp = appliances.find(a => a.id === "lights_tube" && a.quantity > 0);
    const tubeSavedKwh = tubeApp && tubeApp.watts > 18
      ? tubeApp.quantity * ((tubeApp.watts - 18) / 1000) * tubeApp.hours * 30
      : 0;

    const fridgeApp = appliances.find(a => a.id === "fridge" && a.quantity > 0);
    const fridgeSavedKwh = fridgeApp
      ? fridgeApp.quantity * (fridgeApp.watts / 1000) * fridgeApp.hours * 30 * 0.15
      : 0;

    const standbySavedKwh = liveTotalUnits * 0.05;

    const fanApp = appliances.find(a => a.id === "fan" && a.quantity > 0);
    const fanSavedKwh = fanApp && fanApp.watts > 28
      ? fanApp.quantity * ((fanApp.watts - 28) / 1000) * fanApp.hours * 30
      : 0;

    const totalSavedKwh = acSavedKwh + lightSavedKwh + tubeSavedKwh + fridgeSavedKwh + standbySavedKwh + fanSavedKwh;
    const usageAfter = Math.max(0, liveTotalUnits - totalSavedKwh);

    const billBefore = liveBill;
    const billAfter = calculateBill(usageAfter, user?.tariffState || "ap", user?.customFlatRate || 7.5);
    const totalSavingsMoney = Math.max(0, billBefore.netEnergyCharge - billAfter.netEnergyCharge);
    const totalSavedKwhSafe = totalSavedKwh || 1;

    const tips: RecommendationItem[] = [];

    if (acApp && acSavedKwh > 0) {
      const moneySaved = (acSavedKwh / totalSavedKwhSafe) * totalSavingsMoney;
      const acReducedHours = acApp.hours > 2 ? acApp.hours - 2 : acApp.hours / 2;
      tips.push({
        id: "ac_reduction",
        title: "Reduce AC usage",
        description: `Lower daily usage from ${acApp.hours} hrs to ${acReducedHours} hrs per day`,
        savings: Math.round(moneySaved * 10) / 10,
        badge: "High",
        badgeColor: "bg-green-50 text-primary-green dark:bg-green-950/20 border-green-200 dark:border-green-900/50",
        icon: <Wind className="w-5 h-5 text-primary-green" />,
        difficulty: "Easy",
        impact: "High"
      });
    }

    if (lightApp && lightSavedKwh > 0) {
      const moneySaved = (lightSavedKwh / totalSavedKwhSafe) * totalSavingsMoney;
      tips.push({
        id: "led_upgrade",
        title: "Switch to LED bulbs",
        description: "Replace conventional bulbs with LED to save ~75% energy per bulb",
        savings: Math.round(moneySaved * 10) / 10,
        badge: "High",
        badgeColor: "bg-green-50 text-primary-green dark:bg-green-950/20 border-green-200 dark:border-green-900/50",
        icon: <Lightbulb className="w-5 h-5 text-primary-green" />,
        difficulty: "Easy",
        impact: "High"
      });
    }

    if (tubeApp && tubeSavedKwh > 0) {
      const moneySaved = (tubeSavedKwh / totalSavedKwhSafe) * totalSavingsMoney;
      tips.push({
        id: "tube_led_upgrade",
        title: "Switch to T5 LED Tube Lights",
        description: "Replace 40W conventional tube lights with 18W T5 LEDs",
        savings: Math.round(moneySaved * 10) / 10,
        badge: "High",
        badgeColor: "bg-green-50 text-primary-green dark:bg-green-950/20 border-green-200 dark:border-green-900/50",
        icon: <Lightbulb className="w-5 h-5 text-primary-green" />,
        difficulty: "Easy",
        impact: "High"
      });
    }

    if (fridgeApp && fridgeSavedKwh > 0) {
      const moneySaved = (fridgeSavedKwh / totalSavedKwhSafe) * totalSavingsMoney;
      tips.push({
        id: "fridge_optimization",
        title: "Set optimal refrigerator temperature",
        description: "Maintain 3-5°C for fridge and -18°C for freezer to save ~15% energy",
        savings: Math.round(moneySaved * 10) / 10,
        badge: "Medium",
        badgeColor: "bg-orange-50 text-warning-orange dark:bg-orange-955/20 border-orange-200 dark:border-orange-900/50",
        icon: <Snowflake className="w-5 h-5 text-warning-orange" />,
        difficulty: "Easy",
        impact: "Medium"
      });
    }

    if (standbySavedKwh > 0) {
      const moneySaved = (standbySavedKwh / totalSavedKwhSafe) * totalSavingsMoney;
      tips.push({
        id: "standby_loads",
        title: "Eliminate standby power",
        description: "Unplug unused appliances or use smart power strips to cut phantom load",
        savings: Math.round(moneySaved * 10) / 10,
        badge: "Minor",
        badgeColor: "bg-slate-100 text-slate-500 dark:bg-slate-800 border-slate-200 dark:border-slate-750",
        icon: <Zap className="w-5 h-5 text-slate-500" />,
        difficulty: "Easy",
        impact: "Low"
      });
    }

    if (fanApp && fanSavedKwh > 0) {
      const moneySaved = (fanSavedKwh / totalSavedKwhSafe) * totalSavingsMoney;
      tips.push({
        id: "fan_bldc_upgrade",
        title: "Switch to BLDC fans",
        description: "Replace standard ceiling fans (75W) with 5-star brushless DC (BLDC) fans (35W) to save ~50% energy per fan",
        savings: Math.round(moneySaved * 10) / 10,
        badge: "Medium",
        badgeColor: "bg-orange-50 text-warning-orange dark:bg-orange-955/20 border-orange-200 dark:border-orange-900/50",
        icon: <Wind className="w-5 h-5 text-warning-orange" />,
        difficulty: "Easy",
        impact: "High"
      });
    }

    const unitUpgradeCosts: Record<string, number> = {
      ac: 40000,
      fridge: 25000,
      fan: 3500
    };
    const unitUpgradeWatts: Record<string, number> = {
      ac: 1200,
      fridge: 130,
      fan: 28
    };

    Object.entries(unitUpgradeCosts).forEach(([appId, costPerUnit]) => {
      const app = appliances.find(a => a.id === appId && a.quantity > 0);
      if (!app) return;

      const decayRate = getApplianceDecayRate(appId);
      const ages = app.unitAges || Array(app.quantity).fill(app.age || 0);
      const oldUnitsIndices = ages.reduce((acc: number[], age, idx) => {
        if (age >= 5) acc.push(idx);
        return acc;
      }, []);

      if (oldUnitsIndices.length > 0) {
        let currentOldKwh = 0;
        let newUpgradedKwh = 0;
        const targetWatts = unitUpgradeWatts[appId];

        oldUnitsIndices.forEach((idx) => {
          const uHours = app.unitHours?.[idx] ?? app.hours ?? 0;
          const uAge = ages[idx];
          const effectiveWatts = app.watts * (1 + uAge * decayRate);
          currentOldKwh += (effectiveWatts / 1000) * uHours * 30;
          newUpgradedKwh += (targetWatts / 1000) * uHours * 30;
        });

        const savedKwh = Math.max(0, currentOldKwh - newUpgradedKwh);
        const usageAfterUpgrade = Math.max(0, liveTotalUnits - savedKwh);
        const billBeforeUpgrade = liveBill;
        const billAfterUpgrade = calculateBill(usageAfterUpgrade, user?.tariffState || "ap", user?.customFlatRate || 7.5);
        const monthlySavingsMoney = Math.max(0, billBeforeUpgrade.netEnergyCharge - billAfterUpgrade.netEnergyCharge);
        
        if (monthlySavingsMoney > 10) {
          const totalInvestment = oldUnitsIndices.length * costPerUnit;
          const paybackYears = Math.round((totalInvestment / (monthlySavingsMoney * 12)) * 10) / 10;
          const maxAge = Math.max(...oldUnitsIndices.map(i => ages[i]));

          tips.push({
            id: `upgrade_${appId}`,
            title: `Replace Old ${app.name}`,
            description: `Upgrading ${oldUnitsIndices.length} old ${app.name}(s) (up to ${maxAge} yrs old) to new BEE 5-star models saves ₹${Math.round(monthlySavingsMoney)}/mo. Est. payback: ${paybackYears} years.`,
            savings: Math.round(monthlySavingsMoney * 10) / 10,
            badge: paybackYears <= 6 ? "Medium" : "Low",
            badgeColor: paybackYears <= 6 ? "bg-orange-50 text-warning-orange dark:bg-orange-955/20 border-orange-200 dark:border-orange-900/50" : "bg-slate-100 text-slate-500 dark:bg-slate-800 border-slate-200 dark:border-slate-750",
            icon: appId === "ac" || appId === "fan" ? <Wind className="w-5 h-5 text-warning-orange" /> : <Snowflake className="w-5 h-5 text-primary-green" />,
            difficulty: paybackYears <= 6 ? "Medium" : "Hard",
            impact: paybackYears <= 6 ? "High" : "Medium"
          });
        }
      }
    });

    const roundedTotal = Math.round(totalSavingsMoney * 10) / 10;
    const sumRounded = tips.reduce((sum, t) => sum + t.savings, 0);
    const diff = Math.round((roundedTotal - sumRounded) * 10) / 10;
    if (diff !== 0 && tips.length > 0) {
      tips[0].savings = Math.round((tips[0].savings + diff) * 10) / 10;
    }

    const result = {
      totalUnits: liveTotalUnits,
      billing: liveBill,
      highestConsumer: highestApp,
      savingsPotential: roundedTotal,
      usageAfter: Math.round(usageAfter * 10) / 10,
      billAfter: Math.round(billAfter.netEnergyCharge * 10) / 10,
      recommendations: tips,
      beforeCo2: Math.round(liveTotalUnits * 0.82 * 10) / 10,
      beforeTrees: Math.round((liveTotalUnits * 0.82 / 1.83) * 10) / 10,
      afterCo2: Math.round(usageAfter * 0.82 * 10) / 10,
      afterTrees: Math.round((usageAfter * 0.82 / 1.83) * 10) / 10,
      savedCo2: Math.round((liveTotalUnits - usageAfter) * 0.82 * 10) / 10,
      savedTrees: Math.round(((liveTotalUnits - usageAfter) * 0.82 / 1.83) * 10) / 10
    };

    setAnalysisResult(result);
    setCurrentStep(3);
    setIsAnalyzing(false);
    setToast({
      type: "success",
      message: "Analysis completed successfully!"
    });

    if (user) {
      const mappedAppliances = activeAppliances.map(app => {
        const decayRate = getApplianceDecayRate(app.id);
        let finalWatts = app.watts;
        if (decayRate > 0 && app.quantity > 0) {
          const ages = app.unitAges || Array(app.quantity).fill(app.age || 0);
          const sumAgesHours = ages.reduce((sum, age, idx) => {
            const uHours = app.unitHours?.[idx] ?? app.hours ?? 0;
            return sum + age * uHours;
          }, 0);
          const sumHours = (app.unitHours || Array(app.quantity).fill(app.hours)).reduce((sum, h) => sum + h, 0);
          const avgWeightedAge = sumHours > 0 ? (sumAgesHours / sumHours) : (app.age || 0);
          finalWatts = app.watts * (1 + avgWeightedAge * decayRate);
        }

        return {
          name: app.name,
          quantity: app.quantity,
          hours: app.hours,
          watts: Math.round(finalWatts),
          age: app.age || 0,
          unitAges: app.unitAges || []
        };
      });

      reportsService.saveReport({
        userId: user.uid,
        appliances: mappedAppliances,
        totalUnits: liveTotalUnits,
        estimatedBill: liveBill.netEnergyCharge,
        savingsPotential: roundedTotal,
        highestConsumer: highestApp,
        tariffState: user.tariffState || "ap",
        beforeCo2: result.beforeCo2,
        afterCo2: result.afterCo2,
        savedCo2: result.savedCo2,
        savedTrees: result.savedTrees,
        billAfter: result.billAfter,
        usageAfter: result.usageAfter
      }).then(() => {
        loadReports(false);
      }).catch(e => {
        console.error("Could not auto-save report in background:", e);
      });
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setAnalysisResult(null);
  };

  const handleExportCSV = (report: AnalysisResult) => {
    if (!report) return;
    const headers = ["Appliance", "Quantity", "Usage (hrs/day)", "Wattage (W)", "Estimated Monthly kWh"];
    const rows = activeAppliances.map(app => {
      const kwh = Math.round(app.quantity * (app.watts / 1000) * app.hours * 30);
      return [app.name, app.quantity, app.hours, app.watts, kwh];
    });
    
    rows.push([]);
    rows.push(["Total Monthly Units", "", "", "", report.totalUnits]);
    rows.push(["Estimated Monthly Bill (Before)", "", "", "", report.billing.netEnergyCharge]);
    rows.push(["Savings Potential", "", "", "", report.savingsPotential]);
    rows.push(["Usage After Optimizations", "", "", "", report.usageAfter]);
    rows.push(["Estimated Monthly Bill (After)", "", "", "", report.billAfter]);
    rows.push(["Carbon Footprint (Before)", "", "", "", `${report.beforeCo2} kg CO2`]);
    rows.push(["Carbon Footprint (After)", "", "", "", `${report.afterCo2} kg CO2`]);
    rows.push(["Trees needed to offset", "", "", "", report.beforeTrees]);
    rows.push(["Trees saved", "", "", "", report.savedTrees]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `energy_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStartAudit = () => {
    setHasInitiated(true);
    setActiveTab("wizard");
    setCurrentStep(1);
    setTimeout(() => {
      const wizardEl = document.getElementById("wizard-progress-bar");
      if (wizardEl) {
        const y = wizardEl.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 100);
  };

  const handleRunAudit = () => {
    setActiveTab("wizard");
    setTimeout(() => {
      const wizardEl = document.getElementById("wizard-progress-bar");
      if (wizardEl) {
        const y = wizardEl.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 100);
  };

  const chartData = activeAppliances.map(app => {
    const kwh = Math.round(app.quantity * (app.watts / 1000) * app.hours * 30);
    return {
      name: app.name,
      kwh: kwh,
      percentage: liveTotalUnits > 0 ? Math.round((kwh / liveTotalUnits) * 100) : 0
    };
  }).sort((a, b) => b.kwh - a.kwh);

  const getMomTrend = () => {
    let diff = 0;
    let label = "vs last month (est.)";
    let trend: "up" | "down" | "neutral" = "down";
    let type: "positive" | "negative" | "neutral" = "positive";

    if (reports.length >= 2) {
      const latestVal = reports[0].totalUnits;
      const prevVal = reports[1].totalUnits;
      if (prevVal > 0) {
        diff = ((latestVal - prevVal) / prevVal) * 100;
        label = "vs last month";
      }
    } else if (reports.length === 1) {
      const latestVal = liveTotalUnits;
      const prevVal = reports[0].totalUnits;
      if (prevVal > 0) {
        diff = ((latestVal - prevVal) / prevVal) * 100;
        label = "vs saved baseline";
      }
    } else {
      diff = -4;
      label = "vs last month (est.)";
    }

    if (diff > 0) {
      trend = "up";
      type = "negative";
    } else if (diff < 0) {
      trend = "down";
      type = "positive";
    } else {
      trend = "neutral";
      type = "neutral";
    }

    return {
      label,
      value: `${Math.abs(Math.round(diff))}%`,
      trend,
      type
    };
  };

  const momTrend = getMomTrend();

  const vsAvgTrend = {
    label: "vs typical home",
    value: `${benchmarkDiffPercent}%`,
    trend: isAboveBenchmark ? ("up" as const) : ("down" as const),
    type: isAboveBenchmark ? ("negative" as const) : ("positive" as const)
  };

  return {
    user,
    currentStep,
    setCurrentStep,
    activeTab,
    setActiveTab,
    renderedTab,
    appliances,
    activeAppliances,
    analysisResult,
    isAnalyzing,
    reports,
    reportsLoading,
    toast,
    setToast,
    hasInitiated,
    liveTotalUnits,
    liveBill,
    benchmarkDiffPercent,
    isAboveBenchmark,
    benchmarkCharge,
    benchmarkUnits,
    liveSavingsPotential,
    solarOffsetPercent,
    recommendedKw,
    chartData,
    momTrend,
    vsAvgTrend,
    toggleAppliance,
    updateQuantity,
    updateHours,
    updateUnitHours,
    updateWatts,
    updateAge,
    updateUnitAge,
    handleAnalyze,
    handleReset,
    handleExportCSV,
    handleStartAudit,
    handleRunAudit
  };
};
