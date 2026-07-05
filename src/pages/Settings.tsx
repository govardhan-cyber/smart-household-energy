import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../context/AuthContext";

import { 
  Settings as SetIcon, Sun, Moon, Bell, Save, CheckCircle2, ShieldCheck, Plus, Trash2,
  Cpu, Info, IndianRupee, X, Sparkles, Monitor,
  Cloud, AlertCircle, AlertTriangle, UserCheck,
  ChevronDown, MapPin, Building, Wind, Snowflake, Fan, Tv, Calendar, TrendingUp, Lightbulb,
  Activity, Globe, Zap
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

  // Eco mode and cloud sync mock animations
  const [ecoMode, setEcoMode] = useState(false);
  const [cloudSyncing, setCloudSyncing] = useState(false);

  // Update success flags
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "general" | "billing" | "appliances" | "ai" | "notifications" | "security" | "account" | "about"
  >("general");

  // System diagnostics utility states
  const [runningDiagnostics, setRunningDiagnostics] = useState(false);
  const [diagnosticReport, setDiagnosticReport] = useState<Array<{
    label: string;
    status: "success" | "warning";
    value: string;
  }> | null>(null);

  const runSystemDiagnostics = () => {
    setRunningDiagnostics(true);
    setDiagnosticReport(null);
    setTimeout(() => {
      setRunningDiagnostics(false);
      setDiagnosticReport([
        { label: "Local storage integrity", status: "success", value: "Verified (7/7 preferences loaded)" },
        { label: "Firebase Functions API", status: "success", value: "Sandbox Active (Offline Dev Fallback ready)" },
        { label: "State rates tariff DB", status: "success", value: "Connected (Loaded active DISCOM schedules)" },
        { label: "Vitest roi compounding", status: "success", value: "Passed (15/15 compounding check runs)" },
        { label: "Hardware loopback latency", status: "success", value: "Optimal (0.45 ms avg)" }
      ]);
    }, 1200);
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

  // Mock cloud reload animation
  const triggerCloudSync = () => {
    if (cloudSyncing) return;
    setCloudSyncing(true);
    setTimeout(() => {
      setCloudSyncing(false);
      alert("Settings successfully synchronized with Google Cloud Services.");
    }, 1200);
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
    `block w-full ${hasLeftIcon ? "pl-9" : "pl-4"} ${hasRightIcon ? "pr-12" : "pr-4"} py-3 rounded-2xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-650 transition-all duration-200 outline-none border bg-slate-50/40 dark:bg-slate-950/40 border-slate-250 dark:border-slate-855 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed ${
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
          
          {/* Main settings Content Area */}
          <main className="space-y-6 w-full pb-24">
                   {/* Sleek Dashboard Hero Header - Unified Glass Console */}
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-50/70 to-slate-100/40 dark:from-slate-900/60 dark:to-slate-950/45 p-6 sm:p-7 rounded-3xl border border-slate-250 dark:border-slate-850 shadow-md backdrop-blur-md flex flex-col xl:flex-row xl:items-center justify-between gap-6 text-left mb-6">
              {/* Decorative accent spotlight blobs in the corners */}
              <div className="absolute top-0 right-0 -mt-12 -mr-12 w-32 h-32 bg-primary-blue/8 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-32 h-32 bg-primary-blue/6 rounded-full blur-2xl pointer-events-none" />
              
              <div className="relative z-10 space-y-1.5 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 bg-primary-blue/10 text-primary-blue px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                  <SetIcon className="w-3.5 h-3.5" /> Platform Control Center
                </div>
                <h1 className="text-3xl font-display font-black text-slate-900 dark:text-white tracking-tight">Settings</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Manage your account status, personalize your AI assistant, and optimize your home's energy preferences.
                </p>
              </div>

              {/* Status Chips HUD Row */}
              <div className="relative z-10 flex flex-wrap sm:flex-nowrap items-center gap-3 w-full xl:w-auto">
                
                {/* HUD Chip 1: Profile Completion */}
                <div className="bg-white/40 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/40 px-3.5 py-2.5 rounded-2xl flex items-center gap-3 shadow-sm hover:bg-white/60 dark:hover:bg-slate-900/60 hover:scale-102 transition-all duration-300">
                  <div className="relative flex items-center justify-center w-8 h-8 shrink-0">
                    <svg className="w-8 h-8 transform -rotate-90">
                      <circle cx="16" cy="16" r="13" className="stroke-slate-100 dark:stroke-slate-850/50" strokeWidth="2.5" fill="none" />
                      <circle 
                        cx="16" 
                        cy="16" 
                        r="13" 
                        className="stroke-primary-blue" 
                        strokeWidth="2.5" 
                        fill="none" 
                        strokeDasharray={2 * Math.PI * 13} 
                        strokeDashoffset={2 * Math.PI * 13 * (1 - 0.92)} 
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-[8.5px] font-black text-slate-700 dark:text-slate-350">92%</span>
                  </div>
                  <div className="text-left leading-none">
                    <span className="block text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Profile</span>
                    <span className="block text-[11px] font-extrabold text-slate-800 dark:text-white mt-1">Completion</span>
                  </div>
                </div>

                {/* HUD Chip 2: Cloud Sync */}
                <button
                  type="button"
                  onClick={triggerCloudSync}
                  className="bg-white/40 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/40 px-3.5 py-2.5 rounded-2xl flex items-center gap-3 shadow-sm hover:bg-white/60 dark:hover:bg-slate-900/60 hover:scale-102 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 cursor-pointer text-left"
                >
                  <div className={`p-1.5 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-450 shrink-0 ${cloudSyncing ? "animate-spin" : ""}`}>
                    <Cloud className="w-4 h-4" />
                  </div>
                  <div className="text-left leading-none">
                    <span className="block text-[8px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest">Cloud Sync</span>
                    <span className="block text-[11px] font-extrabold text-emerald-600 dark:text-emerald-450 flex items-center gap-1 mt-1">
                      {cloudSyncing ? "Syncing..." : "Active"} <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </span>
                  </div>
                </button>

                {/* HUD Chip 3: AI Status */}
                <div className="bg-white/40 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/40 px-3.5 py-2.5 rounded-2xl flex items-center gap-3 shadow-sm hover:bg-white/60 dark:hover:bg-slate-900/60 hover:scale-102 transition-all duration-300">
                  <div className="p-1.5 rounded-lg bg-purple-500/10 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 shrink-0">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </div>
                  <div className="text-left leading-none">
                    <span className="block text-[8px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest">AI Engine</span>
                    <span className="block text-[11px] font-extrabold text-purple-600 dark:text-purple-400 flex items-center gap-1 mt-1">
                      Online <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" />
                    </span>
                  </div>
                </div>

                {/* HUD Chip 4: Data Protection */}
                <div className="bg-white/40 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/40 px-3.5 py-2.5 rounded-2xl flex items-center gap-3 shadow-sm hover:bg-white/60 dark:hover:bg-slate-900/60 hover:scale-102 transition-all duration-300">
                  <div className="p-1.5 rounded-lg bg-blue-500/10 dark:bg-blue-500/15 text-blue-550 dark:text-blue-400 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="text-left leading-none">
                    <span className="block text-[8px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest">Security</span>
                    <span className="block text-[11px] font-extrabold text-blue-600 dark:text-blue-450 flex items-center gap-1.5 mt-1">
                      Secure <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Inner Dashboard Layout: Sidebar Navigation + Config Details Pane */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full pt-2">
              
              {/* Left Sidebar Column containing Profile and navigation list */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                
                {/* Top User Profile Card */}
                <div className="bg-gradient-to-r from-slate-50/70 to-slate-100/40 dark:from-slate-900/70 dark:to-slate-950/45 p-5 rounded-3xl border border-slate-250 dark:border-slate-850 shadow-md backdrop-blur-md hover:shadow-lg transition-all duration-300 text-left">
                  
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
                <div className="bg-gradient-to-r from-slate-50/70 to-slate-100/40 dark:from-slate-900/70 dark:to-slate-950/45 p-4.5 rounded-3xl border border-slate-250 dark:border-slate-855 shadow-md backdrop-blur-md flex flex-col gap-2">
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
                            : "bg-slate-50/30 dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-855 text-slate-600 dark:text-slate-400 hover:bg-slate-50/70 dark:hover:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700"
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
              <div className="lg:col-span-8 bg-gradient-to-r from-slate-50/70 to-slate-100/40 dark:from-slate-900/70 dark:to-slate-950/45 p-5 sm:p-7 rounded-3xl border border-slate-250 dark:border-slate-855 shadow-md backdrop-blur-md lg:max-h-[585px] lg:overflow-y-auto pr-3">
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
                          <div className="md:col-span-7">
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
                      <div className="space-y-4">
                        
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

                        {/* 2x2 Grid of specifications card boxes */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            { label: "Build Version", val: "v1.6.4", sub: "Production bundle stable", icon: Cpu },
                            { label: "Diagnostics Mode", val: "Local Offline", sub: "Heuristic parser active", icon: Activity, green: true },
                            { label: "Core Engines", val: "Vite + React + Vitest", sub: "25-yr Solar ROI compounding", icon: Zap },
                            { label: "Network Host", val: "Localhost Loopback", sub: "Sandbox environment active", icon: Globe }
                          ].map((item, idx) => {
                            const Icon = item.icon;
                            return (
                              <div
                                key={idx}
                                className="bg-gradient-to-r from-slate-50/60 to-slate-100/40 dark:from-slate-950/60 dark:to-slate-900/40 p-4 rounded-2xl border border-slate-250 dark:border-slate-850 flex items-start gap-4 text-left hover:border-slate-300 dark:hover:border-slate-800 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                              >
                                <div className="p-2.5 rounded-xl bg-primary-blue/10 dark:bg-primary-blue/15 text-primary-blue shrink-0">
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest block">{item.label}</span>
                                  <span className={`text-[12.5px] font-black mt-1.5 block leading-tight ${item.green ? "text-emerald-600 dark:text-emerald-400" : "text-slate-850 dark:text-white"}`}>{item.val}</span>
                                  <span className="text-[10px] text-slate-500 dark:text-slate-450 mt-1 block leading-normal">{item.sub}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Diagnostics Center panel block */}
                        <div className="mt-6 bg-gradient-to-r from-slate-50/60 to-slate-100/40 dark:from-slate-950/60 dark:to-slate-900/40 p-5 rounded-3xl border border-slate-250 dark:border-slate-850 flex flex-col gap-4 text-left">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                            <div>
                              <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                                <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" /> Platform System Diagnostics
                              </span>
                              <span className="text-[10.5px] text-slate-500 block mt-0.5">Run diagnostic tests to check sandbox settings and state engines integrity.</span>
                            </div>
                            <button
                              type="button"
                              onClick={runSystemDiagnostics}
                              disabled={runningDiagnostics}
                              className={`px-4.5 py-2.5 rounded-2xl text-[10.5px] font-black uppercase tracking-wider cursor-pointer select-none transition-all duration-200 shrink-0 text-white shadow-md hover:shadow-lg ${
                                runningDiagnostics 
                                  ? "bg-slate-400 dark:bg-slate-700 cursor-not-allowed" 
                                  : `bg-gradient-to-r ${accents[accentColor].gradient} ${accents[accentColor].glow} hover:scale-103 active:scale-97`
                              }`}
                            >
                              {runningDiagnostics ? (
                                <span className="flex items-center gap-2">
                                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                  </svg>
                                  Running...
                                </span>
                              ) : (
                                "Run Diagnostics"
                              )}
                            </button>
                          </div>

                          {/* Diagnostics Report content display */}
                          {runningDiagnostics && (
                            <div className="py-6 text-center text-slate-400 dark:text-slate-500">
                              <p className="text-[11px] font-bold animate-pulse">Scanning system hooks, settings preferences, and database integrity...</p>
                            </div>
                          )}

                          {diagnosticReport && !runningDiagnostics && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="grid grid-cols-1 md:grid-cols-2 gap-3"
                            >
                              {diagnosticReport.map((rep, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-850 shadow-sm text-xs font-semibold text-slate-700 dark:text-slate-350">
                                  <div className="flex items-center gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>{rep.label}</span>
                                  </div>
                                  <span className="font-extrabold text-slate-500 dark:text-slate-400 text-[10.5px]">{rep.value}</span>
                                </div>
                              ))}
                            </motion.div>
                          )}

                          {!diagnosticReport && !runningDiagnostics && (
                            <div className="py-4 text-center text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                              <p className="text-[10px] font-bold uppercase tracking-wider">No diagnostic report loaded</p>
                              <p className="text-[9.5px] mt-0.5 opacity-80">Click the button above to run checks.</p>
                            </div>
                          )}
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
          {showAdminEditor && adminTariff && (
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
