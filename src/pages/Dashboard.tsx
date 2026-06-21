import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { reportsService } from "../utils/reportsService";
import type { EnergyReport } from "../utils/reportsService";
import { calculateBill, defaultAppliances, getSlabsForState, getApplianceDecayRate } from "../utils/tariffCalculator";
import type { ApplianceItem, TariffResult } from "../utils/tariffCalculator";
import { 
  Zap, ChevronRight,
  ShieldCheck, Sparkles, Check, AlertTriangle, Leaf, Printer, Download,
  IndianRupee, Sun, Wind, Lightbulb, Snowflake
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


import { useNavigate } from "react-router-dom";
import { ApplianceSelector } from "../components/dashboard/ApplianceSelector";
import { ConsumptionCalculator } from "../components/dashboard/ConsumptionCalculator";
import { SavingsAdvisor } from "../components/dashboard/SavingsAdvisor";
import { Charts } from "../components/dashboard/Charts";
import { SolarCalculator } from "../components/dashboard/SolarCalculator";
import { AIHomeAudit } from "../components/dashboard/AIHomeAudit";
import { 
  DashboardHero, KpiCard, EnergyHealthScore, InsightCard, 
  QuickActionPanel, DashboardWelcomeState 
} from "../components/dashboard/DashboardHero";


// Count-up/down animation component for premium feel
const AnimatedNumber: React.FC<{
  value: number;
  duration?: number;
  formatter?: (v: number) => string;
}> = ({ value, duration = 400, formatter = (v) => Math.round(v).toString() }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = displayValue;
    const endValue = value;
    
    if (startValue === endValue) return;

    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easedProgress = progress * (2 - progress); // Ease out quad
      const current = startValue + easedProgress * (endValue - startValue);
      setDisplayValue(current);
      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };
    
    animationFrameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [value, duration]);

  return <span>{formatter(displayValue)}</span>;
};

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Detect theme state for Recharts components
  const [activeTheme, setActiveTheme] = useState<"light" | "dark">(
    () => (document.documentElement.classList.contains("dark") ? "dark" : "light")
  );

  useEffect(() => {
    const handleThemeChange = () => {
      setActiveTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
    };
    window.addEventListener("theme-change", handleThemeChange);
    return () => window.removeEventListener("theme-change", handleThemeChange);
  }, []);

  // History states for stats calculation
  const [reports, setReports] = useState<EnergyReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [toast, setToast] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Wizard States
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [activeTab, setActiveTab] = useState<"wizard" | "solar" | "audit">("wizard");
  const [renderedTab, setRenderedTab] = useState<"wizard" | "solar" | "audit">("wizard");

  useEffect(() => {
    const timer = setTimeout(() => {
      setRenderedTab(activeTab);
    }, 250);
    return () => clearTimeout(timer);
  }, [activeTab]);
  const [appliances, setAppliances] = useState<ApplianceItem[]>(() => {
    // Initial state setup with quantity=1, hours=6 for AC and Refrigerator, quantity=0 for others.
    return defaultAppliances.map(app => {
      let qty = app.quantity;
      let hrs = app.hours;
      if (app.id === 'ac') { qty = 1; hrs = 6; }
      else if (app.id === 'fridge') { qty = 1; hrs = 24; }
      else if (app.id === 'fan') { qty = 2; hrs = 12; }
      else if (app.id === 'lights') { qty = 4; hrs = 8; }
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

  // Selected state logic: if quantity > 0, the appliance is selected
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
  const [analysisResult, setAnalysisResult] = useState<{
    totalUnits: number;
    billing: TariffResult;
    highestConsumer: string;
    savingsPotential: number;
    usageAfter: number;
    billAfter: number;
    recommendations: {
      id: string;
      title: string;
      description: string;
      savings: number;
      badge: "High" | "Medium" | "Low" | "Minor";
      badgeColor: string;
      icon: any;
    }[];
    beforeCo2: number;
    beforeTrees: number;
    afterCo2: number;
    afterTrees: number;
    savedCo2: number;
    savedTrees: number;
  } | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Load previous reports for the user
  const loadReports = async (initializeInputs = false) => {
    if (!user) return;
    setReportsLoading(true);

    const applyReportsData = (userReports: EnergyReport[]) => {
      setReports(userReports);
      if (userReports.length > 0 && initializeInputs) {
        // Initialize dashboard state with the latest report if available
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

    // 1. Try to load from cache immediately
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

    // 2. Fetch fresh data from network in background
    try {
      const userReports = await reportsService.getUserReports(user.uid);
      applyReportsData(userReports);
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
  useEffect(() => {
    if (user) {
      setAppliances(prev => prev.map(app => {
        const customWatt = user.customWattages?.[app.id];
        if (customWatt !== undefined && customWatt > 0) {
          return { ...app, watts: customWatt };
        }
        const defaultApp = defaultAppliances.find(da => da.id === app.id);
        return { ...app, watts: defaultApp ? defaultApp.watts : app.watts };
      }));
    }
  }, [user]);

  // Calculate live summary data on step 2 changes
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

  // Live savings potential calculation (runs on every render based on active appliances)
  const liveAcApp = appliances.find(a => a.id === "ac" && a.quantity > 0);
  const liveAcSavedKwh = liveAcApp 
    ? liveAcApp.quantity * (liveAcApp.watts / 1000) * (liveAcApp.hours > 2 ? 2 : liveAcApp.hours * 0.5) * 30 
    : 0;

  const liveLightApp = appliances.find(a => a.id === "lights" && a.quantity > 0);
  const liveLightSavedKwh = liveLightApp 
    ? liveLightApp.quantity * (90 / 1000) * liveLightApp.hours * 30 * 0.75 
    : 0;

  const liveFridgeApp = appliances.find(a => a.id === "fridge" && a.quantity > 0);
  const liveFridgeSavedKwh = liveFridgeApp 
    ? liveFridgeApp.quantity * (200 / 1000) * liveFridgeApp.hours * 30 * 0.15 
    : 0;

  const liveStandbySavedKwh = liveTotalUnits * 0.05;
  const liveTotalSavedKwh = liveAcSavedKwh + liveLightSavedKwh + liveFridgeSavedKwh + liveStandbySavedKwh;
  const liveUsageAfter = Math.max(0, liveTotalUnits - liveTotalSavedKwh);
  const liveBillAfter = calculateBill(liveUsageAfter, user?.tariffState || "ap", user?.customFlatRate || 7.5);
  const liveSavingsPotential = Math.max(0, liveBill.netEnergyCharge - liveBillAfter.netEnergyCharge);

  // Solar Offset (%) and Capacity (kW) estimation
  const kwNeededByUsage = liveTotalUnits / 120;
  const recommendedKw = Math.max(1, Math.round(Math.min(kwNeededByUsage, 3) * 2) / 2); // default cap at 3 kW based on 300 sq ft
  const solarGenKwh = recommendedKw * 120;
  const solarOffsetPercent = liveTotalUnits > 0 ? Math.min(100, Math.round((solarGenKwh / liveTotalUnits) * 100)) : 0;

  // Trigger analysis and save to Firestore
  const handleAnalyze = async () => {
    if (activeAppliances.length === 0) return;
    setIsAnalyzing(true);
    
    // Simulate beautiful micro-animation loading
    await new Promise(resolve => setTimeout(resolve, 800));

    // Calculate Highest Consumer
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

    // Calculate dynamic saved kWh for each recommendation
    const acApp = appliances.find(a => a.id === "ac" && a.quantity > 0);
    const acSavedKwh = acApp 
      ? acApp.quantity * (acApp.watts / 1000) * (acApp.hours > 2 ? 2 : acApp.hours * 0.5) * 30 
      : 0;

    const lightApp = appliances.find(a => a.id === "lights" && a.quantity > 0);
    const lightSavedKwh = lightApp 
      ? lightApp.quantity * (90 / 1000) * lightApp.hours * 30 * 0.75 
      : 0;

    const fridgeApp = appliances.find(a => a.id === "fridge" && a.quantity > 0);
    const fridgeSavedKwh = fridgeApp 
      ? fridgeApp.quantity * (200 / 1000) * fridgeApp.hours * 30 * 0.15 
      : 0;

    const standbySavedKwh = liveTotalUnits * 0.05;

    const fanApp = appliances.find(a => a.id === "fan" && a.quantity > 0);
    const fanSavedKwh = fanApp 
      ? fanApp.quantity * (35 / 1000) * fanApp.hours * 30 
      : 0;

    const totalSavedKwh = acSavedKwh + lightSavedKwh + fridgeSavedKwh + standbySavedKwh + fanSavedKwh;
    const usageAfter = Math.max(0, liveTotalUnits - totalSavedKwh);

    const billBefore = liveBill;
    const billAfter = calculateBill(usageAfter, user?.tariffState || "ap", user?.customFlatRate || 7.5);
    const totalSavingsMoney = Math.max(0, billBefore.netEnergyCharge - billAfter.netEnergyCharge);
    const totalSavedKwhSafe = totalSavedKwh || 1;

    // Generate smart saving recommendations
    const tips: {
      id: string;
      title: string;
      description: string;
      savings: number;
      badge: "High" | "Medium" | "Low" | "Minor";
      badgeColor: string;
      icon: any;
      difficulty: "Easy" | "Medium" | "Hard";
      impact: "High" | "Medium" | "Low";
    }[] = [];

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

    if (fridgeApp && fridgeSavedKwh > 0) {
      const moneySaved = (fridgeSavedKwh / totalSavedKwhSafe) * totalSavingsMoney;
      tips.push({
        id: "fridge_optimization",
        title: "Set optimal refrigerator temperature",
        description: "Maintain 3-5°C for fridge and -18°C for freezer to save ~15% energy",
        savings: Math.round(moneySaved * 10) / 10,
        badge: "Medium",
        badgeColor: "bg-orange-50 text-warning-orange dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/50",
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
        badgeColor: "bg-orange-50 text-warning-orange dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/50",
        icon: <Wind className="w-5 h-5 text-warning-orange" />,
        difficulty: "Easy",
        impact: "High"
      });
    }

    // Add age-based upgrade recommendations
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
            badgeColor: paybackYears <= 6 ? "bg-orange-50 text-warning-orange dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/50" : "bg-slate-100 text-slate-500 dark:bg-slate-800 border-slate-200 dark:border-slate-750",
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
      // Carbon footprint calculations (0.82 kg CO2 per kWh)
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

    // Auto-save the energy report to Firestore/Database in the background
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
        // Premium properties
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

  // Reset analysis flow
  const handleReset = () => {
    setCurrentStep(1);
    setAnalysisResult(null);
  };


  const handleExportCSV = (report: any) => {
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
  };  // Recharts Chart Formatter
  const chartData = activeAppliances.map(app => {
    const kwh = Math.round(app.quantity * (app.watts / 1000) * app.hours * 30);
    return {
      name: app.name,
      kwh: kwh,
      percentage: liveTotalUnits > 0 ? Math.round((kwh / liveTotalUnits) * 100) : 0
    };
  }).sort((a, b) => b.kwh - a.kwh);
  const COLORS = ["#1E40AF", "#16A34A", "#0F766E", "#F97316", "#EF4444", "#8B5CF6", "#EC4899", "#F59E0B"];  // Calculate health score dynamically
  const getEnergyHealthScoreValue = () => {
    if (activeAppliances.length === 0) return 100;

    let score = 100;

    // A. Monthly consumption penalty (max 30 pts)
    if (liveTotalUnits > 250) {
      const excess = liveTotalUnits - 250;
      const penalty = Math.min(30, (excess / 250) * 15);
      score -= penalty;
    } else {
      const savings = 250 - liveTotalUnits;
      const bonus = Math.min(5, (savings / 250) * 10);
      score += bonus;
    }

    // B. Savings opportunity penalty (max 30 pts)
    const billCharge = liveBill.netEnergyCharge || 1;
    const savingsRatio = liveSavingsPotential / billCharge;
    if (savingsRatio > 0.05) {
      const savingsPenalty = Math.min(30, savingsRatio * 50);
      score -= savingsPenalty;
    }

    // C. Solar offset bonus (max 15 pts)
    if (solarOffsetPercent > 0) {
      const solarBonus = Math.min(15, (solarOffsetPercent / 100) * 15);
      score += solarBonus;
    }

    // D. Appliance specific runtime penalties (max 25 pts)
    const ac = appliances.find(a => a.id === "ac" && a.quantity > 0);
    if (ac && ac.hours > 6) {
      score -= 10;
    }

    const lights = appliances.find(a => a.id === "lights" && a.quantity > 0);
    if (lights && lights.watts > 12) {
      score -= 5;
    }

    const fridge = appliances.find(a => a.id === "fridge" && a.quantity > 0);
    if (fridge && fridge.quantity > 1) {
      score -= 5;
    }

    return Math.max(10, Math.min(100, Math.round(score)));
  };

  const healthScore = getEnergyHealthScoreValue();

  // Generate top 3 insights
  const getTopInsights = () => {
    if (activeAppliances.length === 0) return [];

    const insights = [];
    const avgRate = liveTotalUnits > 0 ? (liveBill.netEnergyCharge / liveTotalUnits) : 6.5;

    // AC Insight
    const acApp = appliances.find(a => a.id === "ac" && a.quantity > 0);
    if (acApp) {
      const acSavedKwh = acApp.quantity * (acApp.watts / 1000) * (acApp.hours > 2 ? 2 : acApp.hours * 0.5) * 30;
      const acSavingsPerMonth = acSavedKwh * avgRate;
      const acAnnualSavings = acSavingsPerMonth * 12;
      insights.push({
        id: "ac",
        title: "AC Optimization Opportunity",
        description: `Your AC runs for ${acApp.hours} hrs/day. Reducing runtime by 2 hours could save ~₹${Math.round(acAnnualSavings).toLocaleString("en-IN")}/year.`,
        difficulty: acApp.hours > 6 ? "Medium" as const : "Easy" as const,
        impact: `₹${Math.round(acAnnualSavings).toLocaleString("en-IN")}/yr`,
        icon: <Wind className="w-5 h-5 text-alert-red" />
      });
    }

    // Fridge Insight
    const fridgeApp = appliances.find(a => a.id === "fridge" && a.quantity > 0);
    if (fridgeApp) {
      const fridgeUnits = fridgeApp.quantity * (fridgeApp.watts / 1000) * fridgeApp.hours * 30;
      const fridgeSavedUnits = fridgeUnits * 0.15;
      const fridgeSavingsPerMonth = fridgeSavedUnits * avgRate;
      const fridgeAnnualSavings = fridgeSavingsPerMonth * 12;
      insights.push({
        id: "fridge",
        title: "Upgrade Refrigerator",
        description: `Switching to a 5-star energy rated refrigerator could save you ₹${Math.round(fridgeAnnualSavings).toLocaleString("en-IN")}/year.`,
        difficulty: "Medium" as const,
        impact: `₹${Math.round(fridgeAnnualSavings).toLocaleString("en-IN")}/yr`,
        icon: <Snowflake className="w-5 h-5 text-primary-green" />
      });
    }

    // Solar Insight
    if (solarOffsetPercent > 0) {
      insights.push({
        id: "solar",
        title: "Roof Solar Potential Active",
        description: `Your roof space supports a ${recommendedKw} kW system. It is estimated to offset ${solarOffsetPercent}% of your electricity demand.`,
        difficulty: "Hard" as const,
        impact: `${solarOffsetPercent}% Offset`,
        icon: <Sun className="w-5 h-5 text-amber-500" />
      });
    }

    // Lights Upgrade Insight
    const lightsApp = appliances.find(a => a.id === "lights" && a.quantity > 0);
    if (lightsApp && lightsApp.watts > 12) {
      const lightsUnits = lightsApp.quantity * (lightsApp.watts / 1000) * lightsApp.hours * 30;
      const lightsSavedUnits = lightsUnits * 0.75;
      const lightsSavingsPerMonth = lightsSavedUnits * avgRate;
      const lightsAnnualSavings = lightsSavingsPerMonth * 12;
      insights.push({
        id: "lights",
        title: "Switch Bulbs to LEDs",
        description: `Your current lighting wattage profile (${lightsApp.watts}W) is high. Upgrading to 9W LEDs could save ₹${Math.round(lightsAnnualSavings).toLocaleString("en-IN")}/year.`,
        difficulty: "Easy" as const,
        impact: `₹${Math.round(lightsAnnualSavings).toLocaleString("en-IN")}/yr`,
        icon: <Lightbulb className="w-5 h-5 text-primary-green" />
      });
    }

    // Standby Power Insight
    if (liveTotalUnits > 100) {
      const standbyUnits = liveTotalUnits * 0.05;
      const standbySavingsPerMonth = standbyUnits * avgRate;
      const standbyAnnualSavings = standbySavingsPerMonth * 12;
      insights.push({
        id: "standby",
        title: "Eliminate Standby Loads",
        description: `Standby power draws ~5% of your energy. Unplugging appliances when not in use saves ₹${Math.round(standbyAnnualSavings).toLocaleString("en-IN")}/year.`,
        difficulty: "Easy" as const,
        impact: `₹${Math.round(standbyAnnualSavings).toLocaleString("en-IN")}/yr`,
        icon: <Zap className="w-5 h-5 text-slate-550 dark:text-slate-450" />
      });
    }

    return insights.slice(0, 3);
  };

  const topInsights = getTopInsights();

  // Audit triggers
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

  const heroTrends = [momTrend, vsAvgTrend];

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Tab Selector */}
      <div className="flex justify-center no-print relative z-10">
        <div className="flex backdrop-blur-md bg-slate-200/50 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-slate-200/30 dark:border-slate-800/50 shadow-inner relative">
          <motion.button
            whileHover="hover"
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab("wizard")}
            className={`relative flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-colors duration-300 active:scale-[0.98] ${
              activeTab === "wizard"
                ? "text-slate-900 dark:text-white"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            }`}
          >
            {activeTab === "wizard" && (
              <motion.div
                layoutId="activeDashboardTab"
                className="absolute inset-0 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200/50 dark:border-slate-700/50 z-0"
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2.5">
              <motion.span
                variants={{
                  hover: {
                    scale: [1, 1.15, 1.05, 1.15, 1],
                    transition: { repeat: Infinity, duration: 1.0, ease: "easeInOut" }
                  }
                }}
                className="inline-flex items-center justify-center"
              >
                <Zap className={`w-4 h-4 transition-transform duration-300 ${activeTab === "wizard" ? "text-primary-green scale-110" : "text-slate-400"}`} />
              </motion.span>
              <span>Home Audit Wizard</span>
            </span>
          </motion.button>
          <motion.button
            whileHover="hover"
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab("solar")}
            className={`relative flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-colors duration-300 active:scale-[0.98] ${
              activeTab === "solar"
                ? "text-slate-900 dark:text-white"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            }`}
          >
            {activeTab === "solar" && (
              <motion.div
                layoutId="activeDashboardTab"
                className="absolute inset-0 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200/50 dark:border-slate-700/50 z-0"
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2.5">
              <motion.span
                variants={{
                  hover: {
                    rotate: 360,
                    transition: { repeat: Infinity, duration: 4, ease: "linear" }
                  }
                }}
                className="inline-flex items-center justify-center"
              >
                <Sun className={`w-4 h-4 transition-transform duration-300 ${activeTab === "solar" ? "text-amber-500 scale-110" : "text-slate-400"}`} />
              </motion.span>
              <span>Solar ROI Calculator</span>
            </span>
          </motion.button>
          <motion.button
            whileHover="hover"
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab("audit")}
            className={`relative flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-colors duration-300 active:scale-[0.98] ${
              activeTab === "audit"
                ? "text-slate-900 dark:text-white"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            }`}
          >
            {activeTab === "audit" && (
              <motion.div
                layoutId="activeDashboardTab"
                className="absolute inset-0 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200/50 dark:border-slate-700/50 z-0"
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2.5">
              <motion.span
                variants={{
                  hover: {
                    scale: 1.15,
                    y: -3,
                    transition: { repeat: Infinity, repeatType: "reverse", duration: 0.8, ease: "easeInOut" }
                  }
                }}
                className="inline-flex items-center justify-center"
              >
                <Sparkles className={`w-4 h-4 transition-transform duration-300 ${activeTab === "audit" ? "text-amber-500 scale-110" : "text-slate-400"}`} />
              </motion.span>
              <span>AI Home Audit</span>
            </span>
          </motion.button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {renderedTab === "solar" && (
          <motion.div
            key="solar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="w-full"
          >
            <SolarCalculator tariffState={user?.tariffState || "ap"} activeTheme={activeTheme} />
          </motion.div>
        )}

        {renderedTab === "audit" && (
          <motion.div
            key="audit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="w-full"
          >
            <AIHomeAudit 
              activeAppliances={activeAppliances} 
              user={user} 
              activeTheme={activeTheme}
              onNavigateToWizard={() => setActiveTab("wizard")}
              customWattages={user?.customWattages}
            />
          </motion.div>
        )}

        {renderedTab === "wizard" && (
          <motion.div
            key="wizard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="w-full space-y-8"
          >
            {activeAppliances.length === 0 && !hasInitiated ? (
              <DashboardWelcomeState onStartAudit={handleStartAudit} />
            ) : (
              <>
                {/* New Hero Section */}
                <DashboardHero
                userName={user?.fullName}
                savingsOpportunity={liveSavingsPotential}
                solarOffsetPercent={solarOffsetPercent}
                trends={heroTrends}
                onRunAudit={handleRunAudit}
              />

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 no-print">
                <KpiCard
                  title="Monthly Consumption"
                  value={liveTotalUnits}
                  subtext="Based on active audit configuration"
                  icon={<Zap className="w-5 h-5 text-primary-blue dark:text-blue-400" />}
                  borderColorClass="border-l-primary-blue"
                />
                <KpiCard
                  title="Estimated Bill"
                  value={liveBill.netEnergyCharge}
                  subtext={`Calculated using ${liveBill.stateName.toUpperCase()} rates`}
                  icon={<IndianRupee className="w-5 h-5 text-warning-orange" />}
                  borderColorClass="border-l-warning-orange"
                  isCurrency={true}
                />
                <KpiCard
                  title="Potential Savings"
                  value={liveSavingsPotential}
                  subtext="Apply smart appliance settings"
                  icon={<Sparkles className="w-5 h-5 text-primary-green animate-pulse" />}
                  borderColorClass="border-l-primary-green"
                  isCurrency={true}
                />
                <KpiCard
                  title="Solar Offset"
                  value={solarOffsetPercent}
                  subtext={`With recommended ${recommendedKw} kW system`}
                  icon={<Sun className="w-5 h-5 text-amber-500" />}
                  borderColorClass="border-l-amber-500"
                  isPercent={true}
                />
              </div>

              {/* Health Score & Quick Action Panel Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 no-print">
                <EnergyHealthScore 
                  score={healthScore} 
                  reports={reports}
                  totalUnits={liveTotalUnits}
                  savingsPotential={liveSavingsPotential}
                  solarOffsetPercent={solarOffsetPercent}
                  appliances={appliances}
                />
                <QuickActionPanel
                  onRunAudit={handleRunAudit}
                  onGoToSolar={() => setActiveTab("solar")}
                  onGoToSettings={() => navigate("/settings")}
                  reports={reports}
                />
              </div>

              {/* Top Insights Recommendations Grid */}
              {topInsights.length > 0 && (
                <div className="space-y-4 no-print">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest flex items-center gap-1.5 text-left">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-500 dark:text-yellow-400" />
                      Smart Energy Insights
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {topInsights.map((ins, idx) => (
                      <InsightCard
                        key={idx}
                        icon={ins.icon}
                        title={ins.title}
                        description={ins.description}
                        impact={ins.impact}
                        difficulty={ins.difficulty}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Step Progress Bar (Full Width) */}
          <div id="wizard-progress-bar" className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm no-print">
            <div className="flex items-center w-full max-w-4xl mx-auto">
              {[
                { step: 1, label: "Appliances",     sub: "Select devices",   icon: "⚡" },
                { step: 2, label: "Usage",          sub: "Set hours & days", icon: "📅" },
                { step: 3, label: "Analysis",       sub: "Review usage",     icon: "📊" },
                { step: 4, label: "Recommendations",sub: "Save energy",      icon: "🌿" }
              ].map((s, idx, arr) => {
                const isCompleted = currentStep > s.step;
                const isActive    = currentStep === s.step;
                return (
                  <React.Fragment key={s.step}>
                    {/* Step node */}
                    <div className="flex flex-col items-center gap-2 shrink-0">
                      {/* Circle */}
                      <div className={`relative w-11 h-11 rounded-full flex items-center justify-center text-sm font-black
                        ${isCompleted
                          ? "bg-emerald-500 text-white shadow-md step-completed"
                          : isActive
                          ? "bg-primary-blue dark:bg-primary-green text-white shadow-lg step-active"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        {/* Glow ring for active */}
                        {isActive && (
                          <span className="absolute inset-0 rounded-full bg-primary-blue/20 dark:bg-primary-green/20 animate-ping" />
                        )}
                        {isCompleted
                          ? <Check className="w-5 h-5 step-check" />
                          : <span className={`text-base leading-none ${isActive ? "step-icon-float" : ""}`}>{s.icon}</span>
                        }
                      </div>

                      {/* Labels */}
                      <div className="flex flex-col items-center leading-tight">
                        <span className={`text-[11px] sm:text-xs font-bold step-label transition-colors duration-300 ${
                          isActive    ? "text-primary-blue dark:text-primary-green"
                          : isCompleted ? "text-slate-700 dark:text-slate-300"
                          : "text-slate-400 dark:text-slate-500"
                        }`}>
                          {s.label}
                        </span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-600 hidden sm:block step-label" style={{ animationDelay: "0.1s" }}>
                          {s.sub}
                        </span>
                      </div>
                    </div>

                    {/* Connector */}
                    {idx < arr.length - 1 && (
                      <div className="flex-1 h-[2px] mx-3 rounded-full bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                        <div className={`absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-primary-blue dark:from-primary-green dark:to-emerald-400 transition-all duration-700 ease-in-out ${
                          currentStep > s.step ? "w-full connector-shimmer" : "w-0"
                        }`} />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Main Working Area: Split 2-column layout (Steps 1, 2, 3) */}
          {currentStep !== 4 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Side: Input wizard flow (Col span 7) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                  {/* STEP 1 CONTENT: Appliance selector grid */}
                  {currentStep === 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-6 [backface-visibility:hidden] [transform-style:preserve-3d] transform-gpu"
                    >
                      <ApplianceSelector
                        appliances={appliances}
                        toggleAppliance={toggleAppliance}
                        onNext={() => setCurrentStep(2)}
                        hasSelection={activeAppliances.length > 0}
                      />
                    </motion.div>
                  )}

                  {/* STEP 2 CONTENT: Quantities and daily sliders */}
                  {currentStep === 2 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="[backface-visibility:hidden] [transform-style:preserve-3d] transform-gpu"
                    >
                      <ConsumptionCalculator
                        activeAppliances={activeAppliances}
                        updateQuantity={updateQuantity}
                        updateHours={updateHours}
                        updateUnitHours={updateUnitHours}
                        updateWatts={updateWatts}
                        updateAge={updateAge}
                        updateUnitAge={updateUnitAge}
                        activeTheme={activeTheme}
                        isAnalyzing={isAnalyzing}
                        onBack={() => setCurrentStep(1)}
                        onAnalyze={handleAnalyze}
                      />
                    </motion.div>
                  )}

                  {/* STEP 3 CONTENT: Calculation report details */}
                  {currentStep === 3 && analysisResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-6 [backface-visibility:hidden] [transform-style:preserve-3d] transform-gpu"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 text-left">
                            <Sparkles className="w-5 h-5 text-yellow-500" />
                            Analysis Completed
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 text-left">
                            Your calculations have been saved to your account.
                          </p>
                        </div>

                        {/* Export Action Buttons */}
                        <div className="flex gap-2 no-print shrink-0">
                          <button
                            onClick={() => handleExportCSV(analysisResult)}
                            className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-850 dark:text-white hover:scale-[1.02] active:scale-[0.98] transition-all"
                            title="Download CSV report"
                          >
                            <Download className="w-3.5 h-3.5 text-slate-550" />
                            <span className="hidden sm:inline">Export CSV</span>
                          </button>
                          <button
                            onClick={() => window.print()}
                            className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-850 dark:text-white hover:scale-[1.02] active:scale-[0.98] transition-all"
                            title="Print / Save PDF report"
                          >
                            <Printer className="w-3.5 h-3.5 text-slate-550" />
                            <span className="hidden sm:inline">Print PDF</span>
                          </button>
                        </div>
                      </div>

                      {/* Benchmarking Comparison Banner inside Step 3 */}
                      <div className={`p-4 rounded-2xl border text-xs font-bold flex items-start gap-2.5 text-left ${
                        isAboveBenchmark 
                          ? "bg-red-50 border-red-150 text-alert-red dark:bg-red-950/20 dark:border-red-900/40" 
                          : "bg-green-50 border-green-150 text-primary-green dark:bg-green-950/20 dark:border-green-900/40"
                      }`}>
                        {isAboveBenchmark ? (
                          <>
                            <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-alert-red" />
                            <div>
                              <span>Your bill is {benchmarkDiffPercent}% more than the average similar household (Average: ₹{benchmarkCharge.toFixed(0)} for {benchmarkUnits} kWh).</span>
                              <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-normal mt-0.5">
                                Compare against the typical 250 kWh slab category. Check recommendations next to optimize your category.
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4.5 h-4.5 shrink-0 text-primary-green animate-pulse" />
                            <div>
                              <span>Outstanding! Your bill is {benchmarkDiffPercent}% less than similar homes (Average: ₹{benchmarkCharge.toFixed(0)} for {benchmarkUnits} kWh).</span>
                              <span className="block text-[10px] text-slate-555 dark:text-slate-400 font-normal mt-0.5">
                                You are successfully conserving energy relative to the typical household.
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Slabs breakdown details */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-left">
                          {analysisResult.billing.stateName} Slab breakdown (Calculated for {analysisResult.totalUnits} units)
                        </h4>
                        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 text-left text-xs">
                          <div className="grid grid-cols-3 bg-slate-100 dark:bg-slate-800 py-2.5 px-4 font-bold text-slate-550 dark:text-slate-400">
                            <span>Consumption Slab</span>
                            <span className="text-center">Tariff Rate</span>
                            <span className="text-right">Charges</span>
                          </div>
                          <div className="divide-y divide-slate-150 dark:divide-slate-800">
                            {getSlabsForState(user?.tariffState || "ap", user?.customFlatRate || 7.5).map((slab, idx) => {
                              const unitsInSlab = Math.max(0, Math.min(analysisResult.totalUnits - slab.prev, slab.max));
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
                              <span className="font-semibold">₹{analysisResult.billing.grossEnergyCharge.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-primary-green">
                              <span>Less Govt. Subsidy:</span>
                              <span className="font-bold">-₹{analysisResult.billing.subsidy.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-white pt-1.5 border-t border-slate-200 dark:border-slate-700">
                              <span>Net Energy Charges:</span>
                              <span>₹{analysisResult.billing.netEnergyCharge.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Environmental Carbon Footprint Card */}
                      <div className="bg-gradient-to-tr from-green-50 to-emerald-50 dark:from-emerald-950/20 dark:to-green-950/15 p-5 rounded-2xl border border-green-200 dark:border-green-900/40 space-y-2 text-left">
                        <h4 className="text-xs font-bold text-green-700 dark:text-primary-green flex items-center gap-1.5 uppercase tracking-wider">
                          <Leaf className="w-4 h-4 text-green-600 dark:text-primary-green animate-bounce" />
                          Environmental Carbon Footprint
                        </h4>
                        <p className="text-xs text-slate-655 dark:text-slate-400">
                          Your monthly energy usage generates estimated CO2 emissions of <span className="font-bold text-slate-888 dark:text-white">{analysisResult.beforeCo2} kg</span>.
                          It requires <span className="font-bold text-slate-888 dark:text-white">{analysisResult.beforeTrees.toFixed(0)} trees</span> to absorb these emissions. Switch to Step 4 to see how optimizations can reduce your footprint!
                        </p>
                      </div>

                      {/* Navigation Buttons for Step 3 */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setCurrentStep(2)}
                            className="h-11 px-5 flex items-center justify-center text-sm font-semibold rounded-xl text-slate-600 dark:text-slate-400 bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 hover:bg-slate-50 hover:scale-[1.02] active:scale-[0.98] transition-all"
                          >
                            Back
                          </button>
                          <button
                            onClick={handleReset}
                            className="h-11 px-5 flex items-center justify-center text-sm font-semibold rounded-xl text-slate-600 dark:text-slate-400 bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 hover:bg-slate-50 hover:scale-[1.02] active:scale-[0.98] transition-all"
                          >
                            Reset
                          </button>
                        </div>
                        <button
                          onClick={() => setCurrentStep(4)}
                          className="h-11 px-6 flex items-center justify-center gap-1.5 text-sm font-bold rounded-xl text-white bg-primary-blue hover:bg-primary-blue/90 dark:bg-primary-green dark:text-slate-950 dark:hover:bg-primary-green/90 transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] shadow-primary-blue/15"
                        >
                          Next: Recommendations
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6 text-left relative overflow-hidden">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Summary</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Calculations based on selected options.
                    </p>
                  </div>

                  {/* Total units card */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950/50 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
                    {/* Glowing wash circle */}
                    <div className="absolute -right-6 -top-6 w-28 h-28 bg-primary-blue/5 dark:bg-primary-green/5 blur-xl pointer-events-none rounded-full" />
                    
                    <div className="flex items-center justify-between relative z-10">
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Estimated Monthly Usage
                      </span>
                      <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-primary-blue dark:text-primary-green">
                        <Zap className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1 relative z-10">
                      <span className="text-4xl font-display font-extrabold text-slate-900 dark:text-white leading-none">
                        <AnimatedNumber value={liveTotalUnits} />
                      </span>
                      <span className="text-sm font-semibold text-slate-455 dark:text-slate-500">kWh (Units)</span>
                    </div>
                  </div>

                  {/* Estimated bill card */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950/50 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
                    {/* Glowing wash circle */}
                    <div className="absolute -right-6 -top-6 w-28 h-28 bg-primary-green/10 dark:bg-primary-green/5 blur-xl pointer-events-none rounded-full" />
                    
                    <div className="flex items-center justify-between relative z-10">
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Estimated Monthly Bill
                      </span>
                      <span className="text-xs text-primary-green font-bold bg-green-50/80 dark:bg-green-950/30 px-2.5 py-0.5 rounded-full border border-green-200 dark:border-green-900/50 backdrop-blur-sm">
                        After Subsidy
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1.5 relative z-10">
                      <span className="text-4xl font-display font-extrabold text-primary-blue dark:text-primary-green leading-none">
                        ₹<AnimatedNumber value={liveBill.netEnergyCharge} />
                      </span>
                      <span className="text-sm font-semibold text-slate-455 dark:text-slate-500">{liveBill.stateName} Net</span>
                    </div>
                  </div>

                  {/* Benchmarking Comparison Banner */}
                  <div className={`p-4 rounded-2xl border border-l-4 text-xs font-bold flex items-start gap-3 shadow-sm transition-all ${
                    isAboveBenchmark 
                      ? "bg-red-50/50 border-red-200 border-l-alert-red text-alert-red dark:bg-red-950/10 dark:border-red-900/30" 
                      : "bg-green-50/50 border-green-200 border-l-primary-green text-primary-green dark:bg-green-950/10 dark:border-green-900/30"
                  }`}>
                    {isAboveBenchmark ? (
                      <>
                        <div className="p-1 rounded-lg bg-red-100 dark:bg-red-900/30 text-alert-red">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                        </div>
                        <div className="space-y-0.5">
                          <span className="font-bold">You spend {benchmarkDiffPercent}% more than similar homes.</span>
                          <span className="block text-[10px] text-slate-555 dark:text-slate-400 font-semibold mt-0.5">
                            Average household bill: ₹{benchmarkCharge.toFixed(0)} ({benchmarkUnits} kWh)
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-1 rounded-lg bg-green-100 dark:bg-green-900/30 text-primary-green">
                          <Sparkles className="w-4.5 h-4.5 shrink-0 text-primary-green animate-pulse" />
                        </div>
                        <div className="space-y-0.5">
                          <span className="font-bold">Great job! You spend {benchmarkDiffPercent}% less than similar homes.</span>
                          <span className="block text-[10px] text-slate-555 dark:text-slate-400 font-semibold mt-0.5">
                            Average household bill: ₹{benchmarkCharge.toFixed(0)} ({benchmarkUnits} kWh)
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Budget Progress Tracker */}
                  {user && (
                    <div className="relative overflow-hidden bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950/50 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
                      {/* Glow circle */}
                      <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-blue-500/5 dark:bg-green-500/5 blur-xl pointer-events-none rounded-full" />
                      
                      <div className="flex items-center justify-between text-xs font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider relative z-10">
                        <span>Budget Tracking</span>
                        <span className="text-slate-700 dark:text-slate-350">₹<AnimatedNumber value={liveBill.netEnergyCharge} /> / ₹{user.monthlyBudgetBill || 3000}</span>
                      </div>
                      
                      {/* Progress Bar */}
                      {(() => {
                        const budgetLimit = user.monthlyBudgetBill || 3000;
                        const percent = Math.min(100, Math.round((liveBill.netEnergyCharge / budgetLimit) * 100));
                        const isExceeded = liveBill.netEnergyCharge > budgetLimit;
                        return (
                          <div className="space-y-3.5 relative z-10">
                            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  isExceeded 
                                    ? "bg-gradient-to-r from-red-500 to-rose-600 shadow-[0_0_8px_rgba(239,68,68,0.3)]" 
                                    : percent > 80 
                                      ? "bg-gradient-to-r from-orange-400 to-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]" 
                                      : "bg-gradient-to-r from-primary-blue to-primary-green dark:from-primary-green dark:to-emerald-400 shadow-[0_0_8px_rgba(37,99,235,0.2)]"
                                }`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            
                            {/* Budget warning alert card */}
                            {isExceeded && (
                              <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-100 rounded-xl dark:bg-red-950/20 dark:border-red-900/50 text-alert-red dark:text-red-400 text-[10px] font-bold mt-1">
                                <AlertTriangle className="w-4 h-4 shrink-0 animate-pulse" />
                                <span>Budget Exceeded! Reduce {appliances.some(a => a.id === "ac" && a.quantity > 0) ? "AC" : "heavy appliances"} or other device hours to meet target.</span>
                              </div>
                            )}
                            {!isExceeded && percent > 80 && (
                              <div className="flex items-start gap-2.5 p-3 bg-orange-50 border border-orange-100 rounded-xl dark:bg-orange-950/10 dark:border-orange-900/30 text-warning-orange text-[10px] font-bold mt-1">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                <span>Approaching budget limit (over 80% used). Consider optimizing usage.</span>
                              </div>
                            )}
                            {!isExceeded && percent <= 80 && (
                              <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-600 dark:text-primary-green">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-primary-green animate-ping" />
                                <span>Safe Zone: Consuming within your budget target.</span>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Privacy note */}
                  <div className="flex items-center gap-2 text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    <span>SaaS encryption active. Data is private to your profile.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 CHARTS SECTION (Only visible on Step 3) */}
          {currentStep === 3 && analysisResult && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full pt-4 [backface-visibility:hidden] [transform-style:preserve-3d] transform-gpu"
            >
              <Charts 
                chartData={chartData} 
                activeTheme={activeTheme} 
                colors={COLORS} 
                reports={reports}
                liveTotalUnits={liveTotalUnits}
                liveBill={liveBill}
                tariffState={user?.tariffState || "ap"}
                customFlatRate={user?.customFlatRate || 7.5}
                mode="consumption"
                loading={reportsLoading}
                recommendedKw={recommendedKw}
              />
            </motion.div>
          )}

          {/* STEP 4: RECOMMENDATIONS PAGE (Full width) */}
          {currentStep === 4 && analysisResult && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 [backface-visibility:hidden] [transform-style:preserve-3d] transform-gpu"
            >
              <SavingsAdvisor
                analysisResult={analysisResult}
                activeApplianceIds={activeAppliances.map(a => a.id)}
                onExportCSV={() => handleExportCSV(analysisResult)}
                onPrint={() => window.print()}
                onBack={() => setCurrentStep(3)}
                onReset={handleReset}
                stateKey={user?.tariffState || "ap"}
                customFlatRate={user?.customFlatRate || 7.5}
                activeAppliances={activeAppliances}
              />
              
              <Charts 
                chartData={chartData} 
                activeTheme={activeTheme} 
                colors={COLORS} 
                reports={reports}
                liveTotalUnits={liveTotalUnits}
                liveBill={liveBill}
                tariffState={user?.tariffState || "ap"}
                customFlatRate={user?.customFlatRate || 7.5}
                mode="consumption"
                loading={reportsLoading}
                recommendedKw={recommendedKw}
              />
            </motion.div>
          )}
        </>
      )}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4.5 py-3.5 rounded-2xl border shadow-xl text-xs font-bold ${
              toast.type === "success"
                ? "bg-green-50 dark:bg-green-950/80 border-green-250 dark:border-green-900 text-green-600 dark:text-green-450"
                : toast.type === "error"
                ? "bg-red-50 dark:bg-red-950/80 border-red-200 dark:border-red-900 text-alert-red dark:text-red-400"
                : "bg-blue-50 dark:bg-blue-950/80 border-blue-200 dark:border-blue-900 text-primary-blue dark:text-blue-400"
            }`}
          >
            {toast.type === "success" && <Check className="w-4.5 h-4.5 shrink-0" />}
            {toast.type === "error" && <AlertTriangle className="w-4.5 h-4.5 shrink-0" />}
            {toast.type === "info" && <Zap className="w-4.5 h-4.5 shrink-0 animate-pulse" />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
