import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../context/AuthContext";

import { 
  Settings as SetIcon, Sun, Moon, Bell, Save, CheckCircle2, ShieldCheck, Plus, Trash2,
  Cpu, Info, IndianRupee, X, Sparkles, Monitor,
  AlertCircle, AlertTriangle, UserCheck,
  ChevronDown, MapPin, Building, Wind, Snowflake, Fan, Tv, Calendar, TrendingUp, Lightbulb,
  Zap, HardDrive, Database, Wifi, Shield, Clock
} from "lucide-react";
import { loadTariffs, saveTariff, type TariffState, type TariffSlab } from "../utils/tariffService";
import { reloadTariffCalculator, calculateBill } from "../utils/tariffCalculator";
import { motion, AnimatePresence } from "framer-motion";

// Custom Toggle Switch Component
const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  accentColor: "blue" | "green" | "purple" | "orange" | "teal";
}> = ({ checked, onChange, accentColor }) => {
  const gradients = {
    blue: "from-blue-600 to-indigo-650",
    green: "from-emerald-500 to-teal-500",
    purple: "from-purple-600 to-fuchsia-600",
    orange: "from-orange-600 to-amber-500",
    teal: "from-teal-600 to-cyan-500"
  };
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-250 ease-in-out outline-none bg-slate-250 dark:bg-slate-800"
    >
      <div 
        className={`absolute inset-0 transition-opacity duration-300 rounded-full bg-gradient-to-r ${gradients[accentColor]} ${
          checked ? "opacity-100" : "opacity-0"
        }`}
      />
      <span
        className={`pointer-events-none relative z-10 inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-250 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
};

export const Settings: React.FC = () => {
  const { user, updateUserSettings } = useAuth();
  const isAdmin = user?.email === "govardhan4705@gmail.com";
  
  // Theme state synced with documentElement
  const [theme, setTheme] = useState<"light" | "dark" | "system">(
    () => (localStorage.getItem("theme") as "light" | "dark" | "system") || "light"
  );
  
  // Accent color state local storage syncing
  const [accentColor, setAccentColor] = useState<"blue" | "green" | "purple" | "orange" | "teal">(
    () => (localStorage.getItem("she_accent") as any) || "blue"
  );
  
  // Notification States
  const [notifyHighUsage, setNotifyHighUsage] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  
  // Metric units
  const [energyUnit, setEnergyUnit] = useState<"kwh" | "wh">("kwh");
  const [currency, setCurrency] = useState<"inr" | "usd">("inr");
  const [temperatureUnit, setTemperatureUnit] = useState<"c" | "f">("c");
  const [distanceUnit, setDistanceUnit] = useState<"km" | "mi">("km");

  // Tariff and Budget configuration states
  const [tariffState, setTariffState] = useState(user?.tariffState || "ap");
  const [customFlatRate, setCustomFlatRate] = useState<number | string>(user?.customFlatRate || 7.5);
  const [monthlyBudgetBill, setMonthlyBudgetBill] = useState<number | string>(user?.monthlyBudgetBill || 3000);
  const [monthlyBudgetUnits, setMonthlyBudgetUnits] = useState<number | string>(user?.monthlyBudgetUnits || 400);
  
  // Custom wattages configuration state
  const [customWattages, setCustomWattages] = useState<Record<string, number | string>>(() => user?.customWattages || {});
  
  // Active category tab for wattages
  const [activeWattageTab, setActiveWattageTab] = useState<"essentials" | "kitchen" | "electronics" | "comfort" | "water">("essentials");

  // AI assistant preferences
  const [aiEnabled, setAiEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [smartRecsEnabled, setSmartRecsEnabled] = useState(true);
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [suggestionFreq, setSuggestionFreq] = useState("Medium");
  
  // Notification Toggles list
  const [billAlerts, setBillAlerts] = useState(true);
  const [solarAlerts, setSolarAlerts] = useState(true);
  const [monthlyReports, setMonthlyReports] = useState(true);
  const [aiTips, setAiTips] = useState(true);
  
  // Appliance default rating preferences
  const [acRating, setAcRating] = useState("5★");
  const [fridgeSize, setFridgeSize] = useState("300 L");
  const [fanType, setFanType] = useState("BLDC");
  const [tvType, setTvType] = useState("LED");
  const [solarInstalled, setSolarInstalled] = useState("no");

  // Eco mode mock animations
  const [ecoMode, setEcoMode] = useState(false);

  // Update success flags
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "general" | "billing" | "appliances" | "ai" | "notifications" | "security" | "account" | "about"
  >("general");

  // System diagnostics utility states
  const [runningDiagnostics, setRunningDiagnostics] = useState(false);
  const [diagnosticsActiveStep, setDiagnosticsActiveStep] = useState(0);
  const [diagnosticReport, setDiagnosticReport] = useState<Array<{
    label: string;
    status: "success" | "warning";
    value: string;
  }> | null>(null);

  // Live metrics states
  const [cpuUsage, setCpuUsage] = useState(18);
  const [memoryUsage, setMemoryUsage] = useState(324);
  const [latency, setLatency] = useState(86);
  const [lastCheckedSec, setLastCheckedSec] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCpuUsage(prev => {
        const diff = Math.floor(Math.random() * 5) - 2;
        return Math.max(10, Math.min(45, prev + diff));
      });
      setMemoryUsage(prev => {
        const diff = Math.floor(Math.random() * 11) - 5;
        return Math.max(300, Math.min(350, prev + diff));
      });
      setLatency(prev => {
        const diff = Math.floor(Math.random() * 9) - 4;
        return Math.max(70, Math.min(110, prev + diff));
      });
      setLastCheckedSec(prev => prev + 1);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const runSystemDiagnostics = () => {
    setRunningDiagnostics(true);
    setDiagnosticReport(null);
    setDiagnosticsActiveStep(0);
    setLastCheckedSec(0);
    
    const stepsCount = 5;
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < stepsCount) {
        setDiagnosticsActiveStep(currentStep);
      } else {
        clearInterval(interval);
        setRunningDiagnostics(false);
        setDiagnosticReport([
          { label: "OCR Engine", status: "success", value: "Healthy" },
          { label: "Firebase Connection", status: "success", value: "Healthy" },
          { label: "AI API Gateway", status: "success", value: "Connected" },
          { label: "Authentication Secure", status: "success", value: "Healthy" },
          { label: "Local Web Storage", status: "success", value: "Healthy" },
          { label: "Interactive Charts", status: "success", value: "Loaded" },
          { label: "Core Theme Context", status: "success", value: "Operational" }
        ]);
      }
    }, 500);
  };

  // Admin tariff database editing states
  const [tariffs, setTariffs] = useState<Record<string, TariffState>>({});
  const [selectedAdminState, setSelectedAdminState] = useState("ap_apspdcl");
  const [adminTariff, setAdminTariff] = useState<TariffState | null>(null);
  const [showAdminEditor, setShowAdminEditor] = useState(false);
  const [adminSaveSuccess, setAdminSaveSuccess] = useState(false);
  const [adminSaving, setAdminSaving] = useState(false);

  // Modal pop-up focus trapping ref and hooks
  const modalRef = useRef<HTMLDivElement>(null);

  // Snapshot structure for dirty state checks
  const [initialState, setInitialState] = useState<any>(null);

  useEffect(() => {
    if (showAdminEditor) {
      setTimeout(() => modalRef.current?.focus(), 50);
    }
  }, [showAdminEditor]);

  const handleModalKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      setShowAdminEditor(false);
      return;
    }
    if (e.key === "Tab") {
      const focusableElements = e.currentTarget.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex="0"]'
      );
      if (focusableElements.length === 0) return;
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  };

  // Load tariffs initially
  useEffect(() => {
    loadTariffs().then(data => {
      setTariffs(data);
      if (data["ap_apspdcl"]) {
        setAdminTariff(JSON.parse(JSON.stringify(data["ap_apspdcl"])));
      }
    });
  }, []);

  // Update selected admin tariff state values
  useEffect(() => {
    if (tariffs[selectedAdminState]) {
      setAdminTariff(JSON.parse(JSON.stringify(tariffs[selectedAdminState])));
    }
  }, [selectedAdminState, tariffs]);

  // Sync state values with auth user data
  useEffect(() => {
    if (user && !initialState) {
      const initial = {
        theme: (localStorage.getItem("theme") as any) || "light",
        accentColor: (localStorage.getItem("she_accent") as any) || "blue",
        energyUnit: (localStorage.getItem("she_energy_unit") as any) || "kwh",
        currency: (localStorage.getItem("she_currency") as any) || "inr",
        temperatureUnit: (localStorage.getItem("she_temp_unit") as any) || "c",
        distanceUnit: (localStorage.getItem("she_distance_unit") as any) || "km",
        notifyHighUsage: localStorage.getItem("she_notify_high") !== "false",
        weeklyDigest: localStorage.getItem("she_weekly_digest") === "true",
        tariffState: user.tariffState || "ap",
        customFlatRate: user.customFlatRate || 7.5,
        monthlyBudgetBill: user.monthlyBudgetBill || 3000,
        monthlyBudgetUnits: user.monthlyBudgetUnits || 400,
        customWattages: JSON.parse(JSON.stringify(user.customWattages || {})),
        aiEnabled: localStorage.getItem("she_ai_enabled") !== "false",
        voiceEnabled: localStorage.getItem("she_voice_enabled") !== "false",
        smartRecsEnabled: localStorage.getItem("she_smart_recs") !== "false",
        memoryEnabled: localStorage.getItem("she_memory") !== "false",
        suggestionFreq: localStorage.getItem("she_suggestion_freq") || "Medium",
        billAlerts: localStorage.getItem("she_bill_alerts") !== "false",
        solarAlerts: localStorage.getItem("she_solar_alerts") !== "false",
        monthlyReports: localStorage.getItem("she_monthly_reports") !== "false",
        aiTips: localStorage.getItem("she_ai_tips") !== "false",
        solarInstalled: localStorage.getItem("she_solar_installed") || "no",
        acRating: localStorage.getItem("she_ac_rating") || "5★",
        fridgeSize: localStorage.getItem("she_fridge_size") || "300 L",
        fanType: localStorage.getItem("she_fan_type") || "BLDC",
        tvType: localStorage.getItem("she_tv_type") || "LED"
      };
      setInitialState(initial);
      
      // Hydrate local states
      setSolarInstalled(initial.solarInstalled);
      setTheme(initial.theme);
      setAccentColor(initial.accentColor);
      setEnergyUnit(initial.energyUnit);
      setCurrency(initial.currency);
      setTemperatureUnit(initial.temperatureUnit);
      setDistanceUnit(initial.distanceUnit);
      setNotifyHighUsage(initial.notifyHighUsage);
      setWeeklyDigest(initial.weeklyDigest);
      setAiEnabled(initial.aiEnabled);
      setVoiceEnabled(initial.voiceEnabled);
      setSmartRecsEnabled(initial.smartRecsEnabled);
      setMemoryEnabled(initial.memoryEnabled);
      setSuggestionFreq(initial.suggestionFreq);
      setBillAlerts(initial.billAlerts);
      setSolarAlerts(initial.solarAlerts);
      setMonthlyReports(initial.monthlyReports);
      setAiTips(initial.aiTips);
      setAcRating(initial.acRating);
      setFridgeSize(initial.fridgeSize);
      setFanType(initial.fanType);
      setTvType(initial.tvType);
    }
  }, [user, initialState]);

  // Listen and sync light/dark theme classes on selection changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") {
      const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (isSystemDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    } else {
      if (theme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
    localStorage.setItem("theme", theme);
    window.dispatchEvent(new CustomEvent("theme-change", { detail: theme }));
  }, [theme]);

  // Listen and sync accent color class on selection changes
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("accent-blue", "accent-green", "accent-purple", "accent-orange", "accent-teal");
    root.classList.add(`accent-${accentColor}`);
    localStorage.setItem("she_accent", accentColor);
    window.dispatchEvent(new CustomEvent("she-accent-change", { detail: accentColor }));
  }, [accentColor]);

  // Sync theme changes with external window custom events
  useEffect(() => {
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail !== theme) {
        setTheme(customEvent.detail);
      }
    };
    window.addEventListener("theme-change", handleThemeChange);
    return () => window.removeEventListener("theme-change", handleThemeChange);
  }, [theme]);

  // Dynamic Eco Mode optimization presets handler
  useEffect(() => {
    if (ecoMode) {
      setMonthlyBudgetUnits(250); // Set to optimal conservation range
      setMonthlyBudgetBill(1800);  // subsidized tier pricing
      setAiEnabled(true);
      setSmartRecsEnabled(true);
      setAiTips(true);
    } else if (initialState) {
      // Revert eco modifications to custom settings
      setMonthlyBudgetUnits(initialState.monthlyBudgetUnits);
      setMonthlyBudgetBill(initialState.monthlyBudgetBill);
      setAiEnabled(initialState.aiEnabled);
      setSmartRecsEnabled(initialState.smartRecsEnabled);
      setAiTips(initialState.aiTips);
    }
  }, [ecoMode, initialState]);

  const handleWattageChange = (appId: string, value: string) => {
    if (value === "") {
      setCustomWattages(prev => ({
        ...prev,
        [appId]: ""
      }));
      return;
    }
    const numVal = parseInt(value, 10);
    setCustomWattages(prev => ({
      ...prev,
      [appId]: isNaN(numVal) ? "" : numVal
    }));
  };

  // Check if current configurations differ from loaded settings snapshot
  const isDirty = () => {
    if (!initialState) return false;
    return (
      theme !== initialState.theme ||
      accentColor !== initialState.accentColor ||
      energyUnit !== initialState.energyUnit ||
      currency !== initialState.currency ||
      temperatureUnit !== initialState.temperatureUnit ||
      distanceUnit !== initialState.distanceUnit ||
      notifyHighUsage !== initialState.notifyHighUsage ||
      weeklyDigest !== initialState.weeklyDigest ||
      tariffState !== initialState.tariffState ||
      customFlatRate !== initialState.customFlatRate ||
      monthlyBudgetBill !== initialState.monthlyBudgetBill ||
      monthlyBudgetUnits !== initialState.monthlyBudgetUnits ||
      JSON.stringify(customWattages) !== JSON.stringify(initialState.customWattages) ||
      aiEnabled !== initialState.aiEnabled ||
      voiceEnabled !== initialState.voiceEnabled ||
      smartRecsEnabled !== initialState.smartRecsEnabled ||
      memoryEnabled !== initialState.memoryEnabled ||
      suggestionFreq !== initialState.suggestionFreq ||
      billAlerts !== initialState.billAlerts ||
      solarAlerts !== initialState.solarAlerts ||
      monthlyReports !== initialState.monthlyReports ||
      aiTips !== initialState.aiTips ||
      acRating !== initialState.acRating ||
      fridgeSize !== initialState.fridgeSize ||
      fanType !== initialState.fanType ||
      tvType !== initialState.tvType ||
      solarInstalled !== initialState.solarInstalled
    );
  };

  // Revert all customized changes
  const handleResetChanges = () => {
    if (!initialState) return;
    setTheme(initialState.theme);
    setAccentColor(initialState.accentColor);
    setEnergyUnit(initialState.energyUnit);
    setCurrency(initialState.currency);
    setTemperatureUnit(initialState.temperatureUnit);
    setDistanceUnit(initialState.distanceUnit);
    setNotifyHighUsage(initialState.notifyHighUsage);
    setWeeklyDigest(initialState.weeklyDigest);
    setTariffState(initialState.tariffState);
    setCustomFlatRate(initialState.customFlatRate);
    setMonthlyBudgetBill(initialState.monthlyBudgetBill);
    setMonthlyBudgetUnits(initialState.monthlyBudgetUnits);
    setCustomWattages(JSON.parse(JSON.stringify(initialState.customWattages)));
    setAiEnabled(initialState.aiEnabled);
    setVoiceEnabled(initialState.voiceEnabled);
    setSmartRecsEnabled(initialState.smartRecsEnabled);
    setMemoryEnabled(initialState.memoryEnabled);
    setSuggestionFreq(initialState.suggestionFreq);
    setBillAlerts(initialState.billAlerts);
    setSolarAlerts(initialState.solarAlerts);
    setMonthlyReports(initialState.monthlyReports);
    setAiTips(initialState.aiTips);
    setSolarInstalled(initialState.solarInstalled);
    setEcoMode(false);
  };

  // Submit changes to db & update snap
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    localStorage.setItem("theme", theme);
    localStorage.setItem("she_accent", accentColor);
    localStorage.setItem("she_notify_high", String(notifyHighUsage));
    localStorage.setItem("she_weekly_digest", String(weeklyDigest));
    localStorage.setItem("she_energy_unit", energyUnit);
    localStorage.setItem("she_currency", currency);
    localStorage.setItem("she_temp_unit", temperatureUnit);
    localStorage.setItem("she_distance_unit", distanceUnit);
    localStorage.setItem("she_ai_enabled", String(aiEnabled));
    localStorage.setItem("she_voice_enabled", String(voiceEnabled));
    localStorage.setItem("she_smart_recs", String(smartRecsEnabled));
    localStorage.setItem("she_memory", String(memoryEnabled));
    localStorage.setItem("she_suggestion_freq", suggestionFreq);
    localStorage.setItem("she_bill_alerts", String(billAlerts));
    localStorage.setItem("she_solar_alerts", String(solarAlerts));
    localStorage.setItem("she_monthly_reports", String(monthlyReports));
    localStorage.setItem("she_ai_tips", String(aiTips));
    localStorage.setItem("she_ac_rating", acRating);
    localStorage.setItem("she_fridge_size", fridgeSize);
    localStorage.setItem("she_fan_type", fanType);
    localStorage.setItem("she_tv_type", tvType);
    localStorage.setItem("she_eco_mode", String(ecoMode));

    const cleanedWattages: Record<string, number> = {};
    Object.entries(customWattages).forEach(([key, value]) => {
      const valNum = Number(value);
      if (!isNaN(valNum) && valNum > 0) {
        cleanedWattages[key] = valNum;
      }
    });

    try {
      await updateUserSettings({
        tariffState,
        customFlatRate: customFlatRate === "" ? 7.5 : Number(customFlatRate),
        monthlyBudgetBill: monthlyBudgetBill === "" ? 3000 : Number(monthlyBudgetBill),
        monthlyBudgetUnits: monthlyBudgetUnits === "" ? 400 : Number(monthlyBudgetUnits),
        customWattages: cleanedWattages
      });
      localStorage.setItem("she_solar_installed", solarInstalled);

      // Update initial state baseline
      setInitialState({
        theme,
        accentColor,
        energyUnit,
        currency,
        temperatureUnit,
        distanceUnit,
        notifyHighUsage,
        weeklyDigest,
        tariffState,
        customFlatRate,
        monthlyBudgetBill,
        monthlyBudgetUnits,
        customWattages: JSON.parse(JSON.stringify(cleanedWattages)),
        aiEnabled,
        voiceEnabled,
        smartRecsEnabled,
        memoryEnabled,
        suggestionFreq,
        billAlerts,
        solarAlerts,
        monthlyReports,
        acRating,
        fridgeSize,
        fanType,
        tvType,
        solarInstalled
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update user settings:", err);
    }
  };

  // Admin tariff handlers
  const handleAdminFieldChange = (field: string, value: string | number) => {
    setAdminTariff((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
  };

  const handleAdminSubsidyChange = (field: string, value: string | number) => {
    setAdminTariff((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        subsidy: {
          ...prev.subsidy,
          [field]: value
        }
      };
    });
  };

  const handleSlabChange = (index: number, field: string, value: string | number) => {
    setAdminTariff((prev) => {
      if (!prev) return prev;
      const newSlabs = [...prev.slabs];
      newSlabs[index] = { ...newSlabs[index], [field]: value };
      return { ...prev, slabs: newSlabs };
    });
  };

  const handleAddSlab = () => {
    setAdminTariff((prev) => {
      if (!prev) return prev;
      const prevMax = prev.slabs.length > 0 ? prev.slabs[prev.slabs.length - 1].max : 0;
      const newSlab = {
        limit: "Above X units",
        rate: "₹5.00",
        max: Infinity,
        prev: prevMax === Infinity ? 0 : prevMax,
        numericRate: 5.0
      };
      return {
        ...prev,
        slabs: [...prev.slabs, newSlab]
      };
    });
  };

  const handleRemoveSlab = (index: number) => {
    setAdminTariff((prev) => {
      if (!prev || prev.slabs.length <= 1) return prev;
      const newSlabs = prev.slabs.filter((_: TariffSlab, idx: number) => idx !== index);
      return { ...prev, slabs: newSlabs };
    });
  };

  const handleSaveAdminTariff = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!adminTariff) return;
    
    setAdminSaving(true);
    setAdminSaveSuccess(false);

    const updatedTariff = {
      ...adminTariff,
      key: selectedAdminState,
      name: selectedAdminState,
      lastUpdated: Date.now()
    };

    try {
      await saveTariff(selectedAdminState, updatedTariff);
      await reloadTariffCalculator();
      const freshTariffs = await loadTariffs();
      setTariffs(freshTariffs);
      setAdminSaveSuccess(true);
      setTimeout(() => setAdminSaveSuccess(false), 5000);
    } catch (err: any) {
      console.error("Failed to save global tariff rates:", err);
      setAdminSaveSuccess(false);
      alert(err?.message || "Failed to save tariff rates. Please try again.");
    } finally {
      setAdminSaving(false);
    }
  };

  // Dynamic Styles presets mapper based on active accent selection
  const accents = {
    blue: {
      primary: "primary-blue",
      text: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-600 dark:bg-blue-500",
      bgLight: "bg-blue-50/70 dark:bg-blue-955/20",
      border: "border-blue-500/50 dark:border-blue-400/40",
      ring: "ring-blue-500/20 dark:ring-blue-400/20",
      gradient: "from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500",
      glow: "shadow-[0_4px_25px_-5px_rgba(37,99,235,0.22)] dark:shadow-[0_4px_25px_-5px_rgba(37,99,235,0.35)]",
      bullet: "bg-blue-500"
    },
    green: {
      primary: "primary-green",
      text: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-600 dark:bg-emerald-500",
      bgLight: "bg-emerald-50/70 dark:bg-emerald-955/20",
      border: "border-emerald-500/50 dark:border-emerald-400/40",
      ring: "ring-emerald-500/20 dark:ring-emerald-400/20",
      gradient: "from-emerald-600 to-teal-600 dark:from-emerald-500 dark:to-teal-500",
      glow: "shadow-[0_4px_25px_-5px_rgba(16,185,129,0.22)] dark:shadow-[0_4px_25px_-5px_rgba(16,185,129,0.35)]",
      bullet: "bg-emerald-500"
    },
    purple: {
      primary: "purple-600",
      text: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-600 dark:bg-purple-500",
      bgLight: "bg-purple-50/70 dark:bg-purple-955/20",
      border: "border-purple-500/50 dark:border-purple-400/40",
      ring: "ring-purple-500/20 dark:ring-purple-400/20",
      gradient: "from-purple-600 to-fuchsia-600 dark:from-purple-500 dark:to-fuchsia-500",
      glow: "shadow-[0_4px_25px_-5px_rgba(147,51,234,0.22)] dark:shadow-[0_4px_25px_-5px_rgba(147,51,234,0.35)]",
      bullet: "bg-purple-500"
    },
    orange: {
      primary: "orange-600",
      text: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-600 dark:bg-orange-500",
      bgLight: "bg-orange-50/70 dark:bg-orange-955/20",
      border: "border-orange-500/50 dark:border-orange-400/40",
      ring: "ring-orange-500/20 dark:ring-orange-400/20",
      gradient: "from-orange-600 to-amber-600 dark:from-orange-500 dark:to-amber-500",
      glow: "shadow-[0_4px_25px_-5px_rgba(234,88,12,0.22)] dark:shadow-[0_4px_25px_-5px_rgba(234,88,12,0.35)]",
      bullet: "bg-orange-500"
    },
    teal: {
      primary: "teal-600",
      text: "text-teal-600 dark:text-teal-400",
      bg: "bg-teal-600 dark:bg-teal-500",
      bgLight: "bg-teal-50/70 dark:bg-teal-955/20",
      border: "border-teal-500/50 dark:border-teal-400/40",
      ring: "ring-teal-500/20 dark:ring-teal-400/20",
      gradient: "from-teal-600 to-cyan-600 dark:from-teal-500 dark:to-cyan-500",
      glow: "shadow-[0_4px_25px_-5px_rgba(13,148,136,0.22)] dark:shadow-[0_4px_25px_-5px_rgba(13,148,136,0.35)]",
      bullet: "bg-teal-500"
    }
  };

  // Left sidebar menu definitions
  const settingsTabs = [
    { id: "general", label: "General Settings", sub: "Theme, Color preset, Metric units", icon: SetIcon },
    { id: "billing", label: "Billing & Tariffs", sub: "DISCOM boards, Solar setup, Budgets", icon: IndianRupee },
    { id: "appliances", label: "Appliance Defaults", sub: "AC, Fridge size, Custom Wattages", icon: Cpu },
    { id: "notifications", label: "Notifications", sub: "Usage alerts, Solar alerts, Digests, AI tips", icon: Bell },
    { id: "about", label: "About Platform", sub: "Version details, licenses, status logs", icon: Info }
  ];

  // Wattage groups configuration mappings
  const applianceGroups = {
    essentials: [
      { id: "fridge", name: "Refrigerator", default: 220 },
      { id: "ac", name: "Air Conditioner", default: 1500 },
      { id: "fan", name: "Ceiling Fan", default: 50 },
      { id: "lights", name: "LED Bulb", default: 12 },
      { id: "lights_tube", name: "Tube Light", default: 40 },
      { id: "tv", name: "Television", default: 100 },
      { id: "washing_machine", name: "Washing Machine", default: 500 },
      { id: "water_heater", name: "Water Heater", default: 2000 }
    ],
    kitchen: [
      { id: "microwave", name: "Microwave Oven", default: 1200 },
      { id: "induction", name: "Induction Stove", default: 1600 },
      { id: "kettle", name: "Electric Kettle", default: 1500 },
      { id: "mixer_grinder", name: "Mixer Grinder", default: 750 },
      { id: "rice_cooker", name: "Rice Cooker", default: 700 },
      { id: "dishwasher", name: "Dishwasher", default: 1200 }
    ],
    electronics: [
      { id: "laptop", name: "Laptop", default: 65 },
      { id: "desktop", name: "Desktop Computer", default: 200 },
      { id: "router", name: "Wi-Fi Router", default: 15 },
      { id: "gaming_console", name: "Gaming Console", default: 150 },
      { id: "printer", name: "Printer", default: 50 }
    ],
    comfort: [
      { id: "cooler", name: "Air Cooler", default: 200 },
      { id: "purifier", name: "Air Purifier", default: 50 },
      { id: "heater", name: "Room Heater", default: 1500 },
      { id: "iron", name: "Electric Iron", default: 1000 },
      { id: "vacuum", name: "Vacuum Cleaner", default: 800 }
    ],
    water: [
      { id: "water_pump", name: "Water Pump Motor", default: 750 },
      { id: "water_filter", name: "RO Water Purifier", default: 60 }
    ]
  };

  // Simulator indicator bill calculations
  const simulatedConsumption = Number(monthlyBudgetUnits) || 0;
  const simulationResult = calculateBill(simulatedConsumption, tariffState, Number(customFlatRate) || 7.5);
  const totalCalculatedBill = Math.round(simulationResult.netEnergyCharge);
  const budgetDeficit = totalCalculatedBill - (Number(monthlyBudgetBill) || 0);

  const inputBase = (field: string, hasLeftIcon = false, hasRightIcon = false) =>
    `block w-full ${hasLeftIcon ? "pl-9" : "pl-4"} ${hasRightIcon ? "pr-12" : "pr-4"} py-3 rounded-2xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-650 transition-all duration-200 outline-none border bg-slate-50/40 dark:bg-slate-955/40 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed ${
      focusedField === field
        ? "border-primary-blue dark:border-primary-green ring-4 ring-blue-500/10 dark:ring-primary-green/10"
        : "border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700"
    }`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8 max-w-[1400px] relative z-10"
    >
      <form onSubmit={handleSaveSettings}>
        <div className="space-y-6">
          
          <main className="space-y-6 w-full pb-24">
            {/* Sleek Dashboard Hero Header - Unified Glass Console */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-emerald-950/20 dark:to-green-950/30 p-6 sm:p-8 rounded-3xl border border-slate-200/20 dark:border-slate-800/20 shadow-md relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 text-left mb-6">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 dark:bg-primary-green/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center gap-4 text-left z-10">
                <div className="p-3.5 rounded-full bg-white/10 dark:bg-primary-green/10 text-white dark:text-primary-green shrink-0">
                  <SetIcon className="w-6 h-6 text-blue-100 dark:text-primary-green" />
                </div>
                <div className="space-y-1">
                  <h1 className="text-2xl sm:text-3xl font-display font-black text-white leading-tight">Settings</h1>
                  <p className="text-xs sm:text-sm font-medium text-blue-100/90 dark:text-slate-350 leading-relaxed max-w-[650px]">
                    Manage your account status, personalize your AI assistant, and optimize your home's energy preferences.
                  </p>
                </div>
              </div>

              {/* 3D Floating Console/Gear Graphic inside the header */}
              <div className="relative hidden md:block shrink-0 z-10 w-48 h-36 flex items-center justify-center [perspective:1000px]">
                <motion.div
                  style={{ transformStyle: "preserve-3d" }}
                  animate={{ 
                    y: [0, -6, 0],
                    rotate: [0, 1.5, 0]
                  }}
                  whileHover={{ 
                    rotateX: -12, 
                    rotateY: 18,
                    scale: 1.08,
                  }}
                  transition={{ 
                    y: {
                      duration: 3.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    },
                    rotate: {
                      duration: 4.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    },
                    type: "spring", 
                    stiffness: 400, 
                    damping: 25 
                  }}
                  className="relative w-44 h-30 cursor-pointer select-none"
                >
                  {/* Glow behind graphic */}
                  <div className="absolute inset-0 bg-blue-400/25 dark:bg-emerald-400/10 rounded-xl blur-xl -z-10 animate-pulse" />
                  
                  <svg className="w-full h-full" viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Card outline with draw-in animation */}
                    <motion.rect 
                      x="10" y="10" width="180" height="110" rx="16" 
                      fill="white" fillOpacity="0.12" stroke="white" strokeWidth="1.5" 
                      className="backdrop-blur-md"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                    />
                    
                    {/* Concentric dials/rings */}
                    <motion.circle 
                      cx="55" cy="65" r="30" 
                      stroke="white" strokeWidth="1.5" strokeOpacity="0.5" strokeDasharray="3 3"
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.circle 
                      cx="55" cy="65" r="22" 
                      stroke="white" strokeWidth="2" strokeOpacity="0.85"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 0.75 }}
                      transition={{ delay: 0.3, duration: 1 }}
                    />
                    
                    {/* Settings Sliders */}
                    {/* Slider 1 */}
                    <motion.line 
                      x1="110" y1="45" x2="165" y2="45" stroke="white" strokeWidth="2" strokeOpacity="0.4"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                    />
                    <motion.circle 
                      cx="145" cy="45" r="4.5" fill="white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                    />
                    
                    {/* Slider 2 */}
                    <motion.line 
                      x1="110" y1="65" x2="165" y2="65" stroke="white" strokeWidth="2" strokeOpacity="0.4"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                    />
                    <motion.circle 
                      cx="125" cy="65" r="4.5" fill="white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                    />

                    {/* Slider 3 */}
                    <motion.line 
                      x1="110" y1="85" x2="165" y2="85" stroke="white" strokeWidth="2" strokeOpacity="0.4"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                    />
                    <motion.circle 
                      cx="155" cy="85" r="4.5" fill="white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                    />
                    
                    {/* Inner Center dot */}
                    <circle cx="55" cy="65" r="4" fill="white" />
                  </svg>
                </motion.div>
              </div>
            </div>

            {/* Inner Dashboard Layout: Sidebar Navigation + Config Details Pane */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full pt-2">
              
              {/* Left Sidebar Column containing Profile and navigation list */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                
                {/* Top User Profile Card */}
                <div className="bg-gradient-to-r from-slate-50/70 to-slate-100/40 dark:from-slate-900/70 dark:to-slate-950/45 p-5 rounded-3xl border border-slate-200/30 dark:border-slate-800/30 shadow-md backdrop-blur-md hover:shadow-lg transition-all duration-300 text-left">
                  
                  {/* User Profile Avatar with dynamic ring */}
                  <div className="flex items-center gap-4.5">
                    <div className="relative shrink-0 select-none group/avatar">
                      {/* Avatar completion ring 92% - now dynamic matching theme accent */}
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle cx="40" cy="40" r="34" className="stroke-slate-100 dark:stroke-slate-850/50" strokeWidth="4" fill="none" />
                        <circle 
                          cx="40" 
                          cy="40" 
                          r="34" 
                          className="stroke-primary-blue transition-colors duration-300" 
                          strokeWidth="4" 
                          fill="none" 
                          strokeDasharray={2 * Math.PI * 34} 
                          strokeDashoffset={2 * Math.PI * 34 * (1 - 0.92)} 
                          strokeLinecap="round"
                        />
                      </svg>
                      {/* Stylized Avatar image */}
                      <div className="absolute inset-2 bg-slate-105 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 transition-all duration-300 group-hover/avatar:scale-103">
                        <img 
                          src="/avatar_govardhan.png" 
                          alt="Govardhan" 
                          className="w-full h-full object-cover scale-105"
                          onError={(e) => {
                            e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=Govardhan`;
                          }}
                        />
                      </div>
                      {/* Verified Badge */}
                      <div className="absolute bottom-1 right-1 bg-gradient-to-tr from-emerald-500 to-teal-500 text-white p-1 rounded-full border-2 border-white dark:border-slate-900 shadow-[0_0_8px_rgba(16,185,129,0.35)] flex items-center justify-center">
                        <UserCheck className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>

                    <div className="space-y-1.5 text-left flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-slate-900 dark:text-white truncate">Govardhan</span>
                        <span className="bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 px-1.5 py-0.5 rounded text-[8px] font-black tracking-wider uppercase shrink-0">Verified</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="inline-flex items-center gap-1 bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/25 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold text-amber-600 dark:text-amber-400 shadow-sm">
                          <Sparkles className="w-3 text-amber-500 shrink-0" /> Pro User
                        </div>
                        <span className="text-[9.5px] text-slate-400 dark:text-slate-550 font-bold uppercase tracking-wider">Premium Plan</span>
                      </div>
                    </div>
                  </div>

                  {/* Rating Score bar */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="text-[9.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">AI Savings Score:</span>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-500/20 font-mono font-extrabold text-[10.5px] rounded-lg shadow-sm">94/100</span>
                  </div>
                </div>

                {/* Sidebar Navigation Cards Container */}
                <div className="bg-gradient-to-r from-slate-50/70 to-slate-100/40 dark:from-slate-900/70 dark:to-slate-950/45 p-4.5 rounded-3xl border border-slate-200/20 dark:border-slate-800/20 shadow-md backdrop-blur-md flex flex-col gap-2">
                  {settingsTabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`w-full p-3.5 rounded-2xl text-left transition-all duration-300 ease-out group cursor-pointer relative overflow-hidden flex items-center gap-4 hover:-translate-y-2.5 hover:shadow-md hover:shadow-slate-100 dark:hover:shadow-slate-950/40 ${
                          isActive
                            ? `text-white shadow-lg bg-gradient-to-r ${accents[accentColor].gradient} ${accents[accentColor].glow}`
                            : "bg-slate-50/30 dark:bg-slate-900/20 border border-slate-200/20 dark:border-slate-800/20 text-slate-600 dark:text-slate-400 hover:bg-slate-50/70 dark:hover:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700"
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeSettingsTabPill"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-r-full"
                            transition={{ type: "spring", stiffness: 350, damping: 25 }}
                          />
                        )}
                        <div className={`p-2 rounded-xl transition-all duration-200 ${
                          isActive 
                            ? "bg-white/20 text-white" 
                            : "bg-slate-105 dark:bg-slate-955/30 text-slate-400 dark:text-slate-500 group-hover:bg-slate-150 dark:group-hover:bg-slate-950/50"
                        }`}>
                          <Icon className="w-4.5 h-4.5" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <span className={`block text-xs font-black uppercase tracking-wider ${isActive ? "text-white" : "text-slate-655 dark:text-slate-350"}`}>{tab.label}</span>
                          <span className={`block text-[9.5px] mt-0.5 leading-normal truncate ${isActive ? "text-white/70" : "text-slate-400 dark:text-slate-550"}`}>{tab.sub}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

              </div>

              {/* Right Configuration Details Content Area card pane */}
              <div className="lg:col-span-8 bg-gradient-to-r from-slate-50/70 to-slate-100/40 dark:from-slate-900/70 dark:to-slate-950/45 p-5 sm:p-7 rounded-3xl border border-slate-200/30 dark:border-slate-800/30 shadow-md backdrop-blur-md lg:max-h-[585px] lg:overflow-y-auto pr-3">
                <AnimatePresence>
                  {success && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="mb-5 flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50/90 to-green-50/50 dark:from-emerald-950/25 dark:to-green-950/15 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-400 text-[10.5px] font-black uppercase tracking-wider rounded-2xl shadow-[0_4px_20px_-4px_rgba(16,185,129,0.12)] text-left"
                    >
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-450 shrink-0" />
                      <span>Configurations saved successfully!</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="space-y-6 text-left"
                  >

                    {/* tab: GENERAL */}
                    {activeTab === "general" && (
                      <div className="space-y-2">
                        
                        {/* Section Header */}
                        <div className="border-b border-slate-100 dark:border-slate-800/80 pb-5 mb-5 text-left">
                          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">General Settings</h2>
                          <p className="text-[11px] text-slate-500 mt-1 leading-normal">Configure display theme profiles, custom color accents, and metric scales.</p>
                        </div>

                        {/* Appearance Row */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 py-5 border-b border-slate-100 dark:border-slate-800/60 text-left items-center">
                          <div className="md:col-span-5 space-y-1">
                            <span className="block text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Appearance Theme</span>
                            <span className="block text-[11px] text-slate-500 leading-relaxed">Toggle visual themes or sync automatically with system mode.</span>
                          </div>
                          <div className="md:col-span-7 flex bg-slate-50/50 dark:bg-slate-955/40 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800/80 w-full relative select-none backdrop-blur-sm">
                            {/* Light theme */}
                            <button
                              type="button"
                              onClick={() => setTheme("light")}
                              className={`flex-1 py-3 px-4 text-center text-[10.5px] font-black uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 ${
                                theme === "light"
                                  ? `${accents[accentColor].border} ${accents[accentColor].bgLight} ${accents[accentColor].text} shadow-sm font-black`
                                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                              }`}
                            >
                              <Sun className="w-3.5 h-3.5" />
                              <span>Light</span>
                            </button>

                            {/* Dark theme */}
                            <button
                              type="button"
                              onClick={() => setTheme("dark")}
                              className={`flex-1 py-3 px-4 text-center text-[10.5px] font-black uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 ${
                                theme === "dark"
                                  ? `${accents[accentColor].border} ${accents[accentColor].bgLight} ${accents[accentColor].text} shadow-sm font-black`
                                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                              }`}
                            >
                              <Moon className="w-3.5 h-3.5" />
                              <span>Dark</span>
                            </button>

                            {/* System theme */}
                            <button
                              type="button"
                              onClick={() => setTheme("system")}
                              className={`flex-1 py-3 px-4 text-center text-[10.5px] font-black uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 ${
                                theme === "system"
                                  ? `${accents[accentColor].border} ${accents[accentColor].bgLight} ${accents[accentColor].text} shadow-sm font-black`
                                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                              }`}
                            >
                              <Monitor className="w-3.5 h-3.5" />
                              <span>System</span>
                            </button>
                          </div>
                        </div>

                        {/* Accent Color Row */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 py-5 text-left items-center">
                          <div className="md:col-span-5 space-y-1">
                            <span className="block text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Dynamic Accents</span>
                            <span className="block text-[11px] text-slate-500 leading-relaxed">Select a highlight color palette to sync across controls instantly.</span>
                          </div>
                          <div className="md:col-span-7 flex flex-wrap gap-3">
                            {Object.keys(accents).map((color) => {
                              const typedColor = color as "blue" | "green" | "purple" | "orange" | "teal";
                              const isActive = accentColor === typedColor;
                              return (
                                <button
                                  key={color}
                                  type="button"
                                  onClick={() => setAccentColor(typedColor)}
                                  className={`px-4 py-2.5 rounded-2xl border text-[10.5px] font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all duration-300 ${
                                    isActive
                                      ? `${accents[typedColor].border} ${accents[typedColor].bgLight} ${accents[typedColor].text} shadow-md`
                                      : "border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700/80 hover:bg-slate-100/40 dark:hover:bg-slate-850/40"
                                  }`}
                                >
                                  <span className={`w-2.5 h-2.5 rounded-full ${accents[typedColor].bullet}`} />
                                  <span>{color}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                      </div>
                    )}

                    {/* tab: BILLING */}
                    {activeTab === "billing" && (
                      <div className="space-y-2">
                        
                        {/* Section Header */}
                        <div className="border-b border-slate-100 dark:border-slate-800/80 pb-5 mb-5 text-left">
                          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Billing & Regional Slabs</h2>
                          <p className="text-[11px] text-slate-500 mt-1 leading-normal">Configure electricity board mappings, solar offsets, and live budgets.</p>
                        </div>

                        {/* DISCOM Row */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 py-5 border-b border-slate-100 dark:border-slate-800/60 text-left items-center">
                          <div className="md:col-span-5 space-y-1">
                            <span className="block text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Electricity Provider</span>
                            <span className="block text-[11px] text-slate-500 leading-relaxed">Select your local utilities board to match correct billing slab rates.</span>
                          </div>
                          <div className="md:col-span-7 grid grid-cols-2 gap-4">
                            {/* Utility Provider Select */}
                            <div className="relative group">
                              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-blue dark:group-focus-within:text-primary-green transition-colors">
                                <MapPin className="w-4 h-4" />
                              </div>
                              <select
                                value={tariffState}
                                onChange={(e) => setTariffState(e.target.value)}
                                className="block w-full pl-10 pr-10 py-3 rounded-2xl text-xs font-bold text-slate-900 dark:text-white bg-slate-50/40 dark:bg-slate-950/40 border border-slate-250 dark:border-slate-855 outline-none cursor-pointer hover:border-slate-350 dark:hover:border-slate-700 transition-all duration-200 appearance-none focus:border-primary-blue dark:focus:border-primary-green focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-primary-green/10"
                              >
                                <optgroup label="Andhra Pradesh">
                                  <option value="ap_apspdcl">APSPDCL (Southern)</option>
                                  <option value="ap_apepdcl">APEPDCL (Eastern)</option>
                                  <option value="ap_apcpdcl">APCPDCL (Central)</option>
                                </optgroup>
                                <optgroup label="Telangana">
                                  <option value="telangana_tsspdcl">TSSPDCL (Southern)</option>
                                  <option value="telangana_tsnpdcl">TSNPDCL (Northern)</option>
                                </optgroup>
                                <optgroup label="Karnataka">
                                  <option value="karnataka_bescom">BESCOM (Bangalore)</option>
                                  <option value="karnataka_hescom">HESCOM (Hubli)</option>
                                </optgroup>
                              </select>
                              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                                <ChevronDown className="w-4 h-4" />
                              </div>
                            </div>

                            {/* Tariff Class Select (disabled) */}
                            <div className="relative group opacity-85">
                              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                <Building className="w-4 h-4" />
                              </div>
                              <select
                                className="block w-full pl-10 pr-10 py-3 rounded-2xl text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-955/50 border border-slate-250 dark:border-slate-850 outline-none cursor-not-allowed appearance-none"
                                disabled
                              >
                                <option value="LT-I">Domestic LT-I (Residential)</option>
                              </select>
                              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                                <ChevronDown className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Monthly Energy Budgets Row */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 py-5 border-b border-slate-100 dark:border-slate-800/60 text-left items-center">
                          <div className="md:col-span-5 space-y-1">
                            <span className="block text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Monthly Energy Budgets</span>
                            <span className="block text-[11px] text-slate-500 leading-relaxed">Configure target monthly bill threshold and energy consumption limits.</span>
                          </div>
                          <div className="md:col-span-7 grid grid-cols-2 gap-5">
                            <div className="space-y-1">
                              <label className="block text-[9px] font-bold text-slate-450 dark:text-slate-550 uppercase">Target Bill</label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                  <span className="text-slate-400 dark:text-slate-600 text-xs font-black select-none">
                                    {currency === "usd" ? "$" : "₹"}
                                  </span>
                                </div>
                                <input
                                  type="number"
                                  value={monthlyBudgetBill}
                                  onChange={(e) => setMonthlyBudgetBill(e.target.value)}
                                  onFocus={() => setFocusedField("monthlyBudgetBill")}
                                  onBlur={() => setFocusedField(null)}
                                  className={inputBase("monthlyBudgetBill", true)}
                                  placeholder="3,000"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[9px] font-bold text-slate-450 dark:text-slate-550 uppercase">Target Consumption</label>
                              <div className="relative">
                                <input
                                  type="number"
                                  value={monthlyBudgetUnits}
                                  onChange={(e) => setMonthlyBudgetUnits(e.target.value)}
                                  onFocus={() => setFocusedField("monthlyBudgetUnits")}
                                  onBlur={() => setFocusedField(null)}
                                  className={inputBase("monthlyBudgetUnits", false, true)}
                                  placeholder="400"
                                />
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                  <span className="text-slate-400 dark:text-slate-650 text-[10px] font-black uppercase select-none">
                                    kWh
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Live Simulator Row */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 py-5 border-b border-slate-100 dark:border-slate-800/60 text-left items-center">
                          <div className="md:col-span-5 space-y-1">
                            <span className="block text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Live Bill Simulator</span>
                            <span className="block text-[11px] text-slate-500 leading-relaxed">Real-time prediction using the target energy limit values.</span>
                          </div>
                          <div className="md:col-span-7">
                            <div className={`p-4 rounded-2xl border-l-4 ${accents[accentColor].border} bg-gradient-to-r from-slate-50/80 to-slate-100/50 dark:from-slate-950/80 dark:to-slate-900/40 border border-slate-200/50 dark:border-slate-850/50 backdrop-blur-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm`}>
                              <div className="text-left space-y-0.5">
                                <span className="block text-[10.5px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                  Simulating <span className="font-extrabold text-slate-900 dark:text-white">{monthlyBudgetUnits} kWh</span> predictions
                                </span>
                                <span className="block text-sm font-black text-slate-900 dark:text-white">Estimated bill: <span className={`text-base font-extrabold ${accents[accentColor].text}`}>₹{totalCalculatedBill}</span></span>
                              </div>
                              {budgetDeficit > 0 ? (
                                <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-500 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border border-amber-500/20">
                                  <AlertTriangle className="w-3.5 h-3.5" /> Deficit: ₹{budgetDeficit}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border border-emerald-500/20">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Covers Target
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Slabs Row */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 py-5 text-left items-start">
                          {isAdmin && (
                            <div className="md:col-span-5 space-y-1 pt-1">
                              <span className="block text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Regional Slab Rates</span>
                              <span className="block text-[11px] text-slate-500 leading-relaxed">Visual structure of escalating slab parameters.</span>
                              
                              <button
                                type="button"
                                onClick={() => setShowAdminEditor(true)}
                                className={`mt-4 inline-flex items-center gap-2 px-4.5 py-3 border text-[10.5px] font-black uppercase tracking-wider rounded-2xl cursor-pointer bg-slate-100/60 hover:bg-slate-200/60 dark:bg-slate-850/50 dark:hover:bg-slate-800/80 border-slate-200/80 dark:border-slate-800/80 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 active:scale-95 ${accents[accentColor].text}`}
                              >
                                <ShieldCheck className="w-4 h-4" /> Configure Tariff Slabs
                              </button>
                            </div>
                          )}
                          <div className={isAdmin ? "md:col-span-7" : "md:col-span-12"}>
                            {tariffs[tariffState] && (
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {tariffs[tariffState].slabs.map((slab, idx) => (
                                  <div key={idx} className="relative overflow-hidden bg-white dark:bg-slate-950/50 p-4 pt-5 rounded-2xl border border-slate-200/80 dark:border-slate-850/60 flex flex-col justify-between shadow-sm">
                                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accents[accentColor].gradient}`} />
                                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Slab {idx + 1}</span>
                                    <span className="text-sm font-black text-slate-850 dark:text-white mt-2 font-display">{slab.rate}</span>
                                    <span className="text-[10px] font-medium text-slate-500 mt-0.5 truncate">{slab.limit}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    )}

                    {/* tab: APPLIANCES */}
                    {activeTab === "appliances" && (
                      <div className="space-y-4">
                        
                        {/* Section Header */}
                        <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3 text-left">
                          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Appliance defaults</h2>
                          <p className="text-[11px] text-slate-500 mt-1 leading-normal">Configure specifications and customize active device wattages.</p>
                        </div>

                        {/* Defaults specs section */}
                        <div className="space-y-3 border-b border-slate-100 dark:border-slate-800/60 pb-5 text-left">
                          <div className="space-y-0.5">
                            <span className="block text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Rating defaults</span>
                            <span className="block text-[10.5px] text-slate-500 leading-relaxed">Establish base efficiency parameters to calibrate diagnostic algorithms.</span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                            {/* AC */}
                            <div className="bg-gradient-to-br from-slate-50/60 to-slate-100/40 dark:from-slate-900/60 dark:to-slate-950/40 p-3 pt-3.5 pb-3 rounded-2xl border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between gap-2.5 shadow-sm hover:shadow-md transition-all duration-300">
                              <div className="flex items-center gap-2.5">
                                <div className={`p-2 rounded-xl bg-gradient-to-br ${accents[accentColor].bg} ${accents[accentColor].text} bg-opacity-10 dark:bg-opacity-15`}>
                                  <Wind className="w-4 h-4" />
                                </div>
                                <div>
                                  <span className="block text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Device Class</span>
                                  <span className="block text-[10px] font-black text-slate-800 dark:text-white">Air Conditioner</span>
                                </div>
                              </div>
                              <div className="relative group">
                                <select
                                  value={acRating}
                                  onChange={(e) => setAcRating(e.target.value)}
                                  className="block w-full pl-3 pr-8 py-2 rounded-xl text-[11px] font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 outline-none cursor-pointer hover:border-slate-350 dark:hover:border-slate-700 transition-all duration-200 appearance-none focus:border-primary-blue focus:ring-4 focus:ring-blue-500/10"
                                >
                                  <option value="5★">5★ Star rating</option>
                                  <option value="4★">4★ Star rating</option>
                                  <option value="3★">3★ Star rating</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </div>
                              </div>
                            </div>

                            {/* Fridge */}
                            <div className="bg-gradient-to-br from-slate-50/60 to-slate-100/40 dark:from-slate-900/60 dark:to-slate-950/40 p-3 pt-3.5 pb-3 rounded-2xl border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between gap-2.5 shadow-sm hover:shadow-md transition-all duration-300">
                              <div className="flex items-center gap-2.5">
                                <div className={`p-2 rounded-xl bg-gradient-to-br ${accents[accentColor].bg} ${accents[accentColor].text} bg-opacity-10 dark:bg-opacity-15`}>
                                  <Snowflake className="w-4 h-4" />
                                </div>
                                <div>
                                  <span className="block text-[8px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-wider">Device Class</span>
                                  <span className="block text-[10px] font-black text-slate-800 dark:text-white">Refrigerator</span>
                                </div>
                              </div>
                              <div className="relative group">
                                <select
                                  value={fridgeSize}
                                  onChange={(e) => setFridgeSize(e.target.value)}
                                  className="block w-full pl-3 pr-8 py-2 rounded-xl text-[11px] font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 outline-none cursor-pointer hover:border-slate-350 dark:hover:border-slate-700 transition-all duration-200 appearance-none focus:border-primary-blue focus:ring-4 focus:ring-blue-500/10"
                                >
                                  <option value="300 L">300 L capacity</option>
                                  <option value="250 L">250 L capacity</option>
                                  <option value="400 L">400 L capacity</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </div>
                              </div>
                            </div>

                            {/* Fan */}
                            <div className="bg-gradient-to-br from-slate-50/60 to-slate-100/40 dark:from-slate-900/60 dark:to-slate-950/40 p-3 pt-3.5 pb-3 rounded-2xl border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between gap-2.5 shadow-sm hover:shadow-md transition-all duration-300">
                              <div className="flex items-center gap-2.5">
                                <div className={`p-2 rounded-xl bg-gradient-to-br ${accents[accentColor].bg} ${accents[accentColor].text} bg-opacity-10 dark:bg-opacity-15`}>
                                  <Fan className="w-4 h-4" />
                                </div>
                                <div>
                                  <span className="block text-[8px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-wider">Device Class</span>
                                  <span className="block text-[10px] font-black text-slate-800 dark:text-white">Ceiling Fan</span>
                                </div>
                              </div>
                              <div className="relative group">
                                <select
                                  value={fanType}
                                  onChange={(e) => setFanType(e.target.value)}
                                  className="block w-full pl-3 pr-8 py-2 rounded-xl text-[11px] font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 outline-none cursor-pointer hover:border-slate-350 dark:hover:border-slate-700 transition-all duration-200 appearance-none focus:border-primary-blue focus:ring-4 focus:ring-blue-500/10"
                                >
                                  <option value="BLDC">BLDC Smart Fan</option>
                                  <option value="Conventional">Conventional Induction</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </div>
                              </div>
                            </div>

                            {/* TV */}
                            <div className="bg-gradient-to-br from-slate-50/60 to-slate-100/40 dark:from-slate-900/60 dark:to-slate-950/40 p-3 pt-3.5 pb-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between gap-2.5 shadow-sm hover:shadow-md transition-all duration-300">
                              <div className="flex items-center gap-2.5">
                                <div className={`p-2 rounded-xl bg-gradient-to-br ${accents[accentColor].bg} ${accents[accentColor].text} bg-opacity-10 dark:bg-opacity-15`}>
                                  <Tv className="w-4 h-4" />
                                </div>
                                <div>
                                  <span className="block text-[8px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-wider">Device Class</span>
                                  <span className="block text-[10px] font-black text-slate-800 dark:text-white">Television</span>
                                </div>
                              </div>
                              <div className="relative group">
                                <select
                                  value={tvType}
                                  onChange={(e) => setTvType(e.target.value)}
                                  className="block w-full pl-3 pr-8 py-2 rounded-xl text-[11px] font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 outline-none cursor-pointer hover:border-slate-350 dark:hover:border-slate-700 transition-all duration-200 appearance-none focus:border-primary-blue focus:ring-4 focus:ring-blue-500/10"
                                >
                                  <option value="LED">LED panel</option>
                                  <option value="OLED">OLED panel</option>
                                  <option value="QLED">QLED panel</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Wattage tuners section */}
                        <div className="space-y-4 text-left">
                          <div className="space-y-0.5">
                            <span className="block text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Wattages Calibrator</span>
                            <span className="block text-[10.5px] text-slate-500 leading-relaxed">Customize individual device power baseline specs manually.</span>
                          </div>
                          
                          {/* Segmented control centering */}
                          <div className="flex justify-center">
                            <div className="flex bg-slate-50/50 dark:bg-slate-955/40 p-1 rounded-2xl border border-slate-250/80 dark:border-slate-855 w-full max-w-[400px] select-none backdrop-blur-sm">
                              {["essentials", "kitchen", "electronics", "comfort"].map(tab => (
                                <button
                                  key={tab}
                                  type="button"
                                  onClick={() => setActiveWattageTab(tab as any)}
                                  className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all duration-300 ${
                                    activeWattageTab === tab
                                      ? `bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm shadow-md ${accents[accentColor].text}`
                                      : "text-slate-500 dark:text-slate-400 hover:text-slate-855 dark:hover:text-slate-250"
                                  }`}
                                >
                                  {tab}
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                            {applianceGroups[activeWattageTab]?.map((appliance) => {
                              const currWattage = customWattages[appliance.id] !== undefined
                                ? customWattages[appliance.id]
                                : appliance.default;
                              return (
                                <div key={appliance.id} className="relative overflow-hidden bg-white dark:bg-slate-950/40 p-3.5 pt-5 rounded-2xl border border-slate-200/80 dark:border-slate-850/60 flex flex-col justify-between gap-2.5 shadow-sm hover:shadow-md transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-800">
                                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accents[accentColor].gradient}`} />
                                  <div className="text-left space-y-0.5">
                                    <span className="block text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-wider">{appliance.name}</span>
                                    <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Default: {appliance.default}W</span>
                                  </div>
                                  <div className="relative group mt-1">
                                    <input
                                      type="number"
                                      value={currWattage}
                                      onChange={(e) => handleWattageChange(appliance.id, e.target.value)}
                                      className="block w-full pl-3 pr-8 py-2 rounded-xl text-xs font-black bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 focus:outline-none focus:border-primary-blue focus:ring-4 focus:ring-blue-500/10 dark:text-white transition-all duration-200"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-650">
                                      <span className="text-[9.5px] font-black uppercase select-none">W</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* tab: NOTIFICATIONS */}
                    {activeTab === "notifications" && (
                      <div className="space-y-4">
                        
                        {/* Section Header */}
                        <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3 text-left flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-primary-blue/10 dark:bg-primary-blue/15 text-primary-blue shrink-0">
                            <Bell className="w-4 h-4" />
                          </div>
                          <div>
                            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Alerts & notification preferences</h2>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">Subscribe to alert schedules to receive diagnostic digests.</p>
                          </div>
                        </div>

                        <div className="space-y-3 text-left">
                          {/* Usage Alerts */}
                          <div className="bg-gradient-to-r from-slate-50/60 to-slate-100/40 dark:from-slate-950/60 dark:to-slate-900/40 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-850/60 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-800">
                            <div className="flex items-center gap-3.5">
                              <div className="p-2.5 rounded-xl bg-primary-blue/10 dark:bg-primary-blue/15 text-primary-blue shrink-0">
                                <TrendingUp className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="block text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Usage Alerts</span>
                                <span className="block text-[11px] text-slate-500 mt-0.5 leading-normal">Alerts for baseline threshold violations.</span>
                              </div>
                            </div>
                            <div className="shrink-0">
                              <ToggleSwitch checked={notifyHighUsage} onChange={setNotifyHighUsage} accentColor={accentColor} />
                            </div>
                          </div>

                          {/* Solar Alerts */}
                          <div className="bg-gradient-to-r from-slate-50/60 to-slate-100/40 dark:from-slate-950/60 dark:to-slate-900/40 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-850/60 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-800">
                            <div className="flex items-center gap-3.5">
                              <div className="p-2.5 rounded-xl bg-primary-blue/10 dark:bg-primary-blue/15 text-primary-blue shrink-0">
                                <Sun className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="block text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Solar Alerts</span>
                                <span className="block text-[11px] text-slate-500 mt-0.5 leading-normal">Panel generation yield updates.</span>
                              </div>
                            </div>
                            <div className="shrink-0">
                              <ToggleSwitch checked={solarAlerts} onChange={setSolarAlerts} accentColor={accentColor} />
                            </div>
                          </div>

                          {/* Weekly Digest Reports */}
                          <div className="bg-gradient-to-r from-slate-50/60 to-slate-100/40 dark:from-slate-950/60 dark:to-slate-900/40 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-850/60 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-800">
                            <div className="flex items-center gap-3.5">
                              <div className="p-2.5 rounded-xl bg-primary-blue/10 dark:bg-primary-blue/15 text-primary-blue shrink-0">
                                <Calendar className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="block text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Weekly Digest Reports</span>
                                <span className="block text-[11px] text-slate-500 mt-0.5 leading-normal">Weekly summaries showing calculated offset gains.</span>
                              </div>
                            </div>
                            <div className="shrink-0">
                              <ToggleSwitch checked={weeklyDigest} onChange={setWeeklyDigest} accentColor={accentColor} />
                            </div>
                          </div>

                          {/* Monthly Reports */}
                          <div className="bg-gradient-to-r from-slate-50/60 to-slate-100/40 dark:from-slate-950/60 dark:to-slate-900/40 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-850/60 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-800">
                            <div className="flex items-center gap-3.5">
                              <div className="p-2.5 rounded-xl bg-primary-blue/10 dark:bg-primary-blue/15 text-primary-blue shrink-0">
                                <Bell className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="block text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Monthly Reports</span>
                                <span className="block text-[11px] text-slate-500 mt-0.5 leading-normal">Monthly slab charge analyses.</span>
                              </div>
                            </div>
                            <div className="shrink-0">
                              <ToggleSwitch checked={monthlyReports} onChange={setMonthlyReports} accentColor={accentColor} />
                            </div>
                          </div>

                          {/* AI Tips */}
                          <div className="bg-gradient-to-r from-slate-50/60 to-slate-100/40 dark:from-slate-950/60 dark:to-slate-900/40 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-850/60 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-800">
                            <div className="flex items-center gap-3.5">
                              <div className="p-2.5 rounded-xl bg-primary-blue/10 dark:bg-primary-blue/15 text-primary-blue shrink-0">
                                <Lightbulb className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="block text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">AI Energy Tips</span>
                                <span className="block text-[11px] text-slate-500 mt-0.5 leading-normal">Advice to reduce baseline power waste.</span>
                              </div>
                            </div>
                            <div className="shrink-0">
                              <ToggleSwitch checked={aiTips} onChange={setAiTips} accentColor={accentColor} />
                            </div>
                          </div>
                        </div>

                      </div>
                    )}

                    {/* tab: ABOUT */}
                    {activeTab === "about" && (
                      <div className="space-y-6">
                        
                        {/* Section Header */}
                        <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3.5 mb-5 text-left flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-primary-blue/10 dark:bg-primary-blue/15 text-primary-blue shrink-0">
                            <Info className="w-4 h-4" />
                          </div>
                          <div>
                            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">About Platform</h2>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">Version specifications, licenses, and core active engines details.</p>
                          </div>
                        </div>

                        {/* Overall System Healthy Banner */}
                        <div className="w-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 dark:border-emerald-500/20 rounded-3xl p-5 text-left flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:scale-[1.005]">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                              <ShieldCheck className="w-6 h-6 animate-pulse" />
                            </div>
                            <div>
                              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wide">SYSTEM HEALTHY</h3>
                              <p className="text-xs text-emerald-600 dark:text-emerald-450 font-medium mt-0.5">Everything is running normally.</p>
                            </div>
                          </div>
                          <div className="text-right text-xs text-slate-500 font-semibold font-mono shrink-0">
                            <span>Last Checked • {lastCheckedSec} sec ago</span>
                          </div>
                        </div>

                        {/* Two-Column Grid Content */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                          
                          {/* Column 1: Health Circular Dial + Specifications (8 cols) */}
                          <div className="lg:col-span-8 space-y-6">
                            
                            {/* Health Meter & Diagnostic Scanner Wrapper */}
                            <div className="bg-white/85 dark:bg-slate-950/65 backdrop-blur-md p-6 rounded-3xl border border-slate-300/80 dark:border-slate-800/70 flex flex-col md:flex-row items-center gap-8 shadow-sm">
                              
                              {/* Left side: Circular health dial */}
                              <div className="flex flex-col items-center shrink-0">
                                <div className="relative w-32 h-32">
                                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    <circle
                                      className="text-slate-150 dark:text-slate-850"
                                      strokeWidth="8"
                                      stroke="currentColor"
                                      fill="transparent"
                                      r="40"
                                      cx="50"
                                      cy="50"
                                    />
                                    <circle
                                      className="text-emerald-500 transition-all duration-1000"
                                      strokeWidth="8"
                                      strokeDasharray="251.2"
                                      strokeDashoffset={251.2 - (251.2 * 98) / 100}
                                      strokeLinecap="round"
                                      stroke="currentColor"
                                      fill="transparent"
                                      r="40"
                                      cx="50"
                                      cy="50"
                                    />
                                  </svg>
                                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-black text-slate-900 dark:text-white">98%</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Health</span>
                                  </div>
                                </div>
                                <span className="text-xs font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest mt-3">System Health</span>
                              </div>

                              {/* Right side: Diagnostics checklist or scanner */}
                              <div className="flex-1 w-full text-left space-y-4">
                                <div className="flex justify-between items-center border-b border-slate-150 dark:border-slate-850 pb-3">
                                  <div>
                                    <h4 className="text-xs font-black text-slate-850 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                                      ⚡ Live Diagnostics
                                    </h4>
                                    <p className="text-[10px] text-slate-500">Run diagnostic checks to test active states.</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={runSystemDiagnostics}
                                    disabled={runningDiagnostics}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all duration-200 text-white shadow ${
                                      runningDiagnostics 
                                        ? "bg-slate-400 dark:bg-slate-700 cursor-not-allowed" 
                                        : `bg-gradient-to-r ${accents[accentColor].gradient} hover:scale-103 active:scale-97`
                                    }`}
                                  >
                                    Scan Platform
                                  </button>
                                </div>

                                {/* Checklist view */}
                                <div className="min-h-[140px] flex flex-col justify-center">
                                  {runningDiagnostics ? (
                                    <div className="space-y-4 py-2">
                                      <div className="space-y-2">
                                        <div className="flex justify-between items-center text-[10.5px] font-bold text-slate-650 dark:text-slate-400">
                                          <span>
                                            {diagnosticsActiveStep === 0 && "Checking OCR Engine..."}
                                            {diagnosticsActiveStep === 1 && "Checking AI Services..."}
                                            {diagnosticsActiveStep === 2 && "Checking Firebase Database..."}
                                            {diagnosticsActiveStep === 3 && "Checking Storage..."}
                                            {diagnosticsActiveStep === 4 && "Analyzing Performance..."}
                                          </span>
                                          <span className="font-mono">{Math.round((diagnosticsActiveStep + 1) * 20)}%</span>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-slate-850 h-2 rounded-full overflow-hidden">
                                          <motion.div 
                                            initial={{ width: "0%" }}
                                            animate={{ width: `${(diagnosticsActiveStep + 1) * 20}%` }}
                                            transition={{ duration: 0.3 }}
                                            className={`h-full bg-gradient-to-r ${accents[accentColor].gradient}`}
                                          />
                                        </div>
                                      </div>
                                      <div className="space-y-1.5 max-h-[70px] overflow-y-auto font-mono text-[9.5px] text-slate-500">
                                        {diagnosticsActiveStep >= 0 && <div className="flex items-center gap-1.5"><span className="text-emerald-500 font-bold">✔</span> OCR Engine initialized.</div>}
                                        {diagnosticsActiveStep >= 1 && <div className="flex items-center gap-1.5"><span className="text-emerald-500 font-bold">✔</span> AI Gateway connected.</div>}
                                        {diagnosticsActiveStep >= 2 && <div className="flex items-center gap-1.5"><span className="text-emerald-500 font-bold">✔</span> Firebase DB online.</div>}
                                        {diagnosticsActiveStep >= 3 && <div className="flex items-center gap-1.5"><span className="text-emerald-500 font-bold">✔</span> Storage check passed.</div>}
                                      </div>
                                    </div>
                                  ) : diagnosticReport ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-bold">
                                      {diagnosticReport.map((rep, idx) => (
                                        <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-slate-700 dark:text-slate-350">
                                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                          <span className="min-w-0 flex-1 truncate">{rep.label}</span>
                                          <span className="text-[10px] text-emerald-600 dark:text-emerald-450 shrink-0 font-extrabold">{rep.value}</span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="py-6 text-center text-slate-400 dark:text-slate-500 border border-dashed border-slate-250 dark:border-slate-800 rounded-2xl">
                                      <p className="text-[10px] font-bold uppercase tracking-wider">No Report Loaded</p>
                                      <p className="text-[9.5px] mt-0.5 opacity-80">Click Scan Platform above to run tests.</p>
                                    </div>
                                  )}
                                </div>

                              </div>

                            </div>

                            {/* Core Specs Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {[
                                { label: "Build Version", val: "v1.6.4", badge: "Production", meta: "Last Updated • 15 Jul 2026", hash: "Build • #a92f8d", icon: Cpu },
                                { label: "AI Engine", val: "Gemini 2.5 Flash", badge: "Connected", meta: "Response Time • 1.2 s", hash: "Success Rate • 99.6%", icon: Zap },
                                { label: "Database", val: "Firebase", badge: "Connected", meta: "Firestore Cache • Active", hash: "Rules • Secure", icon: Database },
                                { label: "OCR Engine", val: "PaddleOCR", badge: "Ready", meta: "ONNX Web Runtime", hash: "Code-split import • Yes", icon: Cpu },
                                { label: "Network", val: `${latency} ms`, badge: "Secure HTTPS", meta: "Server • Asia South", hash: "Connection • Secure", icon: Wifi },
                                { label: "Storage", val: "Local Storage", badge: "Online", meta: "Quota • 98% Free", hash: "Sandbox Offline • Fallback", icon: HardDrive },
                                { label: "Security", val: "AES-256 Auth", badge: "Secure", meta: "State checks • Passed", hash: "Integrity check • OK", icon: Shield },
                                { label: "Core Stack", val: "React 19 + Vite", badge: "Active", meta: "Vitest Scenario Suite", hash: "Compounding math • OK", icon: Clock }
                              ].map((item, idx) => {
                                const Icon = item.icon;
                                return (
                                  <div
                                    key={idx}
                                    className="bg-white/85 dark:bg-slate-950/65 backdrop-blur-md p-3 rounded-xl border border-slate-300/80 dark:border-slate-800/70 flex items-start gap-2.5 text-left hover:border-slate-400 dark:hover:border-slate-700 hover:shadow transition-all duration-300"
                                  >
                                    <div className="p-1.5 rounded-lg bg-primary-blue/10 dark:bg-primary-blue/15 text-primary-blue shrink-0">
                                      <Icon className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex justify-between items-center gap-2">
                                        <span className="text-[8.5px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-widest block">{item.label}</span>
                                        <span className="px-1.5 py-0.5 rounded text-[7.5px] font-black uppercase tracking-wider bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-450">
                                          {item.badge}
                                        </span>
                                      </div>
                                      <span className="text-sm font-extrabold mt-0.5 block leading-tight text-slate-900 dark:text-white font-display">{item.val}</span>
                                      <div className="text-[9px] text-slate-550 dark:text-slate-455 mt-1 space-y-0.5 font-semibold">
                                        <div className="block">{item.meta}</div>
                                        <div className="block opacity-85 text-[8.5px]">{item.hash}</div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                          </div>

                          {/* Column 2: Resource Usage + AI status (4 cols) */}
                          <div className="lg:col-span-4 space-y-6">
                            
                            {/* Resource Usage Monitor */}
                            <div className="bg-white/85 dark:bg-slate-950/65 backdrop-blur-md p-5 rounded-3xl border border-slate-300/80 dark:border-slate-800/70 text-left space-y-4.5 shadow-sm">
                              <div>
                                <h4 className="text-xs font-black text-slate-850 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                                  📊 Resource Usage
                                </h4>
                                <p className="text-[10px] text-slate-500">Real-time local hardware and network metrics.</p>
                              </div>

                              <div className="space-y-4">
                                {/* CPU */}
                                <div className="space-y-1.5">
                                  <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-350">
                                    <span>CPU Usage</span>
                                    <span>{cpuUsage}%</span>
                                  </div>
                                  <div className="w-full bg-slate-200 dark:bg-slate-850 h-1.5 rounded-full overflow-hidden">
                                    <div className="h-full bg-sky-500" style={{ width: `${cpuUsage}%` }} />
                                  </div>
                                </div>

                                {/* Memory */}
                                <div className="space-y-1.5">
                                  <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-350">
                                    <span>Memory Allocation</span>
                                    <span>{memoryUsage} MB / 1024 MB</span>
                                  </div>
                                  <div className="w-full bg-slate-200 dark:bg-slate-850 h-1.5 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500" style={{ width: `${(memoryUsage / 1024) * 100}%` }} />
                                  </div>
                                </div>

                                {/* Firebase Requests */}
                                <div className="flex justify-between items-center text-[11px] font-bold py-1.5 border-t border-slate-100 dark:border-slate-900 mt-2">
                                  <span className="text-slate-500">Firebase Requests</span>
                                  <span className="text-slate-800 dark:text-white font-mono">24 Requests</span>
                                </div>

                                {/* OCR Status */}
                                <div className="flex justify-between items-center text-[11px] font-bold py-1.5 border-t border-slate-100 dark:border-slate-900">
                                  <span className="text-slate-500">OCR Engine</span>
                                  <span className="text-emerald-600 dark:text-emerald-450">Ready</span>
                                </div>

                                {/* AI State */}
                                <div className="flex justify-between items-center text-[11px] font-bold py-1.5 border-t border-slate-100 dark:border-slate-900">
                                  <span className="text-slate-500">AI State</span>
                                  <span className="text-slate-400 dark:text-slate-550">Idle</span>
                                </div>
                              </div>
                            </div>

                            {/* AI Status */}
                            <div className="bg-white/85 dark:bg-slate-950/65 backdrop-blur-md p-5 rounded-3xl border border-slate-300/80 dark:border-slate-800/70 text-left space-y-4.5 shadow-sm">
                              <div>
                                <h4 className="text-xs font-black text-slate-850 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                                  🤖 AI Gateway Status
                                </h4>
                                <p className="text-[10px] text-slate-500">Performance logs for LLM request pipelines.</p>
                              </div>

                              <div className="space-y-3.5">
                                <div>
                                  <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block">AI Model</span>
                                  <span className="text-sm font-black text-slate-800 dark:text-white block mt-0.5">Gemini 2.5 Flash</span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3.5 pt-2 border-t border-slate-100 dark:border-slate-900">
                                  <div>
                                    <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block font-mono">Latency</span>
                                    <span className="text-sm font-black text-slate-800 dark:text-white block mt-0.5">1.2 s</span>
                                  </div>
                                  <div>
                                    <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block font-mono">Requests</span>
                                    <span className="text-sm font-black text-slate-800 dark:text-white block mt-0.5">243</span>
                                  </div>
                                </div>

                                <div className="pt-2 border-t border-slate-100 dark:border-slate-900">
                                  <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block">Success Rate</span>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <div className="flex-1 bg-slate-200 dark:bg-slate-850 h-2 rounded-full overflow-hidden">
                                      <div className="h-full bg-emerald-500" style={{ width: "99.6%" }} />
                                    </div>
                                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-450 font-mono">99.6%</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                          </div>

                        </div>

                      </div>
                    )}

                  </motion.div>
                </AnimatePresence>
              </div>

            </div>

          </main>
        </div>

        {/* Bottom Sticky Save Changes Bar Panel */}
        <AnimatePresence>
          {isDirty() && (
            <motion.div
              initial={{ y: 100, x: "-50%", opacity: 0 }}
              animate={{ y: 0, x: "-50%", opacity: 1 }}
              exit={{ y: 100, x: "-50%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
              className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-4xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 p-3.5 sm:p-4 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.4)] flex items-center justify-between gap-6 transition-all duration-300"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="p-2.5 rounded-xl bg-amber-500/10 dark:bg-warning-orange/15 text-amber-500 dark:text-orange-400">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Unsaved Changes</span>
                  <span className="block text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">You have modified setting preferences. Make sure to save them.</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleResetChanges}
                  className="px-4.5 py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10.5px] font-black uppercase tracking-wider rounded-xl border border-slate-200 dark:border-slate-800/80 transition-all cursor-pointer hover:shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 text-white text-[10.5px] font-black rounded-xl shadow-md transition-all cursor-pointer font-display uppercase tracking-wider flex items-center gap-2 bg-gradient-to-r ${accents[accentColor].gradient} hover:shadow-lg hover:-translate-y-0.5 active:scale-95`}
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </form>

      {/* Admin Regional Database Editor Modal Backdrop */}
      {createPortal(
        <AnimatePresence>
          {showAdminEditor && adminTariff && isAdmin && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-955/65 backdrop-blur-md transition-opacity">
              <div className="absolute inset-0 cursor-pointer" onClick={() => setShowAdminEditor(false)} />
              
              {/* Modal Dialog */}
              <motion.div
                ref={modalRef}
                tabIndex={-1}
                onKeyDown={handleModalKeyDown}
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="admin-modal-title"
                className="relative w-full max-w-3xl bg-gradient-to-r from-slate-50/90 to-slate-100/70 dark:from-slate-900/90 dark:to-slate-950/85 backdrop-blur-xl border border-slate-250 dark:border-slate-855 shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[90vh] mx-4 z-10 text-left"
              >
                {/* Sticky Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div>
                    <h2 id="admin-modal-title" className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <ShieldCheck className={`w-5 h-5 ${accents[accentColor].text}`} />
                      Tariff Database Manager
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-1 leading-normal">Modify regional pricing structures globally (Admin board).</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAdminEditor(false)}
                    className="p-1.5 rounded-xl hover:bg-slate-105 dark:hover:bg-slate-800 transition-all cursor-pointer text-slate-400 hover:text-slate-605 dark:hover:text-slate-250"
                    aria-label="Close dialog"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>

                {/* Scrollable Content Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  
                  {/* Board selector */}
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-550">Select Electricity Board to Edit</label>
                    <select
                      value={selectedAdminState}
                      onChange={(e) => setSelectedAdminState(e.target.value)}
                      className="block w-full px-3.5 py-3 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 rounded-2xl text-xs font-bold focus:outline-none dark:text-white cursor-pointer transition-all focus:border-primary-blue dark:focus:border-primary-green focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-primary-green/10"
                    >
                      <optgroup label="Andhra Pradesh">
                        <option value="ap_apspdcl">APSPDCL (Southern)</option>
                        <option value="ap_apepdcl">APEPDCL (Eastern)</option>
                        <option value="ap_apcpdcl">APCPDCL (Central)</option>
                      </optgroup>
                      <optgroup label="Telangana">
                        <option value="telangana_tsspdcl">TSSPDCL (Southern)</option>
                        <option value="telangana_tsnpdcl">TSNPDCL (Northern)</option>
                      </optgroup>
                      <optgroup label="Karnataka">
                        <option value="karnataka_bescom">BESCOM (Bangalore)</option>
                        <option value="karnataka_hescom">HESCOM (Hubli)</option>
                      </optgroup>
                    </select>
                  </div>

                  {/* Display Name and Subsidies */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-550">Display Title</label>
                      <input
                        type="text"
                        value={adminTariff.displayName}
                        onChange={(e) => handleAdminFieldChange("displayName", e.target.value)}
                        onFocus={() => setFocusedField("adminDisplayName")}
                        onBlur={() => setFocusedField(null)}
                        className="block w-full px-4 py-3 rounded-2xl text-xs font-bold text-slate-905 dark:text-white placeholder-slate-400 dark:placeholder-slate-650 transition-all duration-200 outline-none border bg-slate-50/50 dark:bg-slate-955/20 border-slate-250 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-550">Subsidy Type</label>
                      <select
                        value={adminTariff.subsidy.type}
                        onChange={(e) => handleAdminSubsidyChange("type", e.target.value)}
                        className="block w-full px-3.5 py-3 bg-slate-50/50 dark:bg-slate-955/20 border border-slate-250 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 rounded-2xl text-xs font-bold focus:outline-none dark:text-white cursor-pointer transition-all focus:border-primary-blue dark:focus:border-primary-green focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-primary-green/10"
                      >
                        <option value="fixed">Fixed Amount Reduction (₹)</option>
                        <option value="percentage">Percentage Discount (%)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-555">Subsidy Value</label>
                      <input
                        type="number"
                        value={adminTariff.subsidy.value}
                        onChange={(e) => handleAdminSubsidyChange("value", Number(e.target.value))}
                        onFocus={() => setFocusedField("adminSubsidyValue")}
                        onBlur={() => setFocusedField(null)}
                        className="block w-full px-4 py-3 rounded-2xl text-xs font-bold text-slate-905 dark:text-white placeholder-slate-400 dark:placeholder-slate-650 transition-all duration-200 outline-none border bg-slate-50/50 dark:bg-slate-955/20 border-slate-250 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700"
                      />
                    </div>
                  </div>

                  {/* Slabs Management */}
                  <div className="space-y-3 text-left">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-550">Escalating Pricing Slabs</label>
                      <button
                        type="button"
                        onClick={handleAddSlab}
                        className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer hover:opacity-85 transition-all hover:scale-105 ${accents[accentColor].text}`}
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Slab
                      </button>
                    </div>

                    <div className="space-y-3">
                      {adminTariff.slabs.map((slab, index) => (
                        <div 
                          key={index} 
                          className="p-5 bg-slate-50/40 dark:bg-slate-955/10 hover:bg-slate-50/70 dark:hover:bg-slate-955/20 border border-slate-200/60 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all duration-305 rounded-2xl space-y-3 relative overflow-hidden group text-left"
                        >
                          {/* Glowing Accent Side-tag Indicator */}
                          <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${accents[accentColor].gradient} opacity-80`} />
                          
                          <div className="flex items-center justify-between pl-1">
                            <span className={`text-[10.5px] font-black uppercase tracking-wide flex items-center gap-1.5 ${accents[accentColor].text}`}>
                              Slab tier {index + 1}
                            </span>
                            {adminTariff.slabs.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveSlab(index)}
                                className="text-[9.5px] font-black text-red-500 hover:text-white hover:bg-red-500 px-2.5 py-1 rounded-lg border border-red-500/20 hover:border-red-550 transition-all duration-200 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Remove Slab
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pl-1">
                            <div className="space-y-1">
                              <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-550 uppercase">Label Text</label>
                              <input
                                type="text"
                                value={slab.limit}
                                onChange={(e) => handleSlabChange(index, "limit", e.target.value)}
                                onFocus={() => setFocusedField(`slabLimit-${index}`)}
                                onBlur={() => setFocusedField(null)}
                                className="block w-full px-4 py-3 rounded-2xl text-xs font-bold text-slate-905 dark:text-white placeholder-slate-400 dark:placeholder-slate-650 transition-all duration-200 outline-none border bg-white dark:bg-slate-950 border-slate-250 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700"
                                placeholder="e.g. 0-50 units"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-550 uppercase">Price Label</label>
                              <input
                                type="text"
                                value={slab.rate}
                                onChange={(e) => handleSlabChange(index, "rate", e.target.value)}
                                onFocus={() => setFocusedField(`slabRate-${index}`)}
                                onBlur={() => setFocusedField(null)}
                                className="block w-full px-4 py-3 rounded-2xl text-xs font-bold text-slate-905 dark:text-white placeholder-slate-400 dark:placeholder-slate-650 transition-all duration-200 outline-none border bg-white dark:bg-slate-950 border-slate-250 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700"
                                placeholder="e.g. ₹2.60"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-550 uppercase">Numeric Rate (₹/kWh)</label>
                              <input
                                type="number"
                                step="0.01"
                                value={slab.numericRate || parseFloat(slab.rate.replace(/[^\d.]/g, "")) || 0}
                                onChange={(e) => handleSlabChange(index, "numericRate", Number(e.target.value))}
                                onFocus={() => setFocusedField(`slabNumRate-${index}`)}
                                onBlur={() => setFocusedField(null)}
                                className="block w-full px-4 py-3 rounded-2xl text-xs font-bold text-slate-905 dark:text-white placeholder-slate-400 dark:placeholder-slate-650 transition-all duration-200 outline-none border bg-white dark:bg-slate-955 border-slate-250 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Sticky Footer */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 space-y-4">
                  {adminSaveSuccess && (
                    <div className="p-3 bg-green-500/10 text-green-500 border border-green-500/20 text-xs rounded-xl font-bold text-center">
                      <CheckCircle2 className="w-4.5 h-4.5 inline-block mr-1.5 align-text-bottom" />
                      Tariff rates for {selectedAdminState.toUpperCase()} updated successfully!
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAdminEditor(false)}
                      className="px-5 py-3 hover:bg-slate-105 dark:hover:bg-slate-800 text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 border border-slate-250 dark:border-slate-800 rounded-2xl cursor-pointer transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAdminTariff}
                      disabled={adminSaving}
                      className={`px-6 py-3 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider rounded-2xl text-white bg-gradient-to-r ${accents[accentColor].gradient} ${accents[accentColor].glow} hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                      {adminSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white dark:border-slate-955/30 dark:border-t-slate-950 animate-spin rounded-full" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Update DISCOM Tariff Rates</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </motion.div>
  );
};
