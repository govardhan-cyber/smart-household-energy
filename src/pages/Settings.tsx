import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  Settings as SetIcon, Sun, Moon, Bell, Save, CheckCircle2, ShieldCheck, Plus, Trash2,
  Utensils, Cpu, Wind, Droplet
} from "lucide-react";
import { loadTariffs, saveTariff, type TariffState } from "../utils/tariffService";
import { reloadTariffCalculator } from "../utils/tariffCalculator";
import { motion, AnimatePresence } from "framer-motion";

// Custom Toggle Switch Component
const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description: string;
}> = ({ checked, onChange, label, description }) => {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="space-y-0.5 pr-4 text-left">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{label}</span>
        <p className="text-[10px] text-slate-450 dark:text-slate-500 leading-normal">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          checked ? "bg-primary-blue dark:bg-primary-green" : "bg-slate-200 dark:bg-slate-850"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
};

export const Settings: React.FC = () => {
  const { user, updateUserSettings } = useAuth();
  const navigate = useNavigate();
  
  // Theme state synced with documentElement
  const [theme, setTheme] = useState<"light" | "dark">(
    () => (localStorage.getItem("theme") as "light" | "dark") || "light"
  );
  
  // Notification States
  const [notifyHighUsage, setNotifyHighUsage] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  
  // Metric units
  const [energyUnit, setEnergyUnit] = useState<"kwh" | "wh">("kwh");

  // Tariff and Budget configuration states
  const [tariffState, setTariffState] = useState(user?.tariffState || "ap");
  const [customFlatRate, setCustomFlatRate] = useState<number | string>(user?.customFlatRate || 7.5);
  const [monthlyBudgetBill, setMonthlyBudgetBill] = useState<number | string>(user?.monthlyBudgetBill || 3000);
  const [monthlyBudgetUnits, setMonthlyBudgetUnits] = useState<number | string>(user?.monthlyBudgetUnits || 400);
  
  // Custom wattages configuration state
  const [customWattages, setCustomWattages] = useState<Record<string, number | string>>(() => user?.customWattages || {});
  
  // Active category tab for wattages
  const [activeWattageTab, setActiveWattageTab] = useState<"essentials" | "kitchen" | "electronics" | "comfort" | "water">("essentials");

  // Update state flags
  const [success, setSuccess] = useState(false);

  // Admin tariff editing states
  const [tariffs, setTariffs] = useState<Record<string, TariffState>>({});
  const [selectedAdminState, setSelectedAdminState] = useState("ap_apspdcl");
  const [adminTariff, setAdminTariff] = useState<TariffState | null>(null);
  const [showAdminEditor, setShowAdminEditor] = useState(false);
  const [adminSaveSuccess, setAdminSaveSuccess] = useState(false);
  const [adminSaving, setAdminSaving] = useState(false);

  useEffect(() => {
    loadTariffs().then(data => {
      setTariffs(data);
      if (data["ap_apspdcl"]) {
        setAdminTariff(JSON.parse(JSON.stringify(data["ap_apspdcl"])));
      }
    });
  }, []);

  useEffect(() => {
    if (tariffs[selectedAdminState]) {
      setAdminTariff(JSON.parse(JSON.stringify(tariffs[selectedAdminState])));
    }
  }, [selectedAdminState, tariffs]);

  useEffect(() => {
    if (user) {
      if (user.tariffState) setTariffState(user.tariffState);
      if (user.customFlatRate !== undefined) setCustomFlatRate(user.customFlatRate);
      if (user.monthlyBudgetBill !== undefined) setMonthlyBudgetBill(user.monthlyBudgetBill);
      if (user.monthlyBudgetUnits !== undefined) setMonthlyBudgetUnits(user.monthlyBudgetUnits);
      if (user.customWattages) setCustomWattages(user.customWattages);
    }
  }, [user]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
    window.dispatchEvent(new CustomEvent("theme-change", { detail: theme }));
  }, [theme]);

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

  // Admin tariff handlers
  const handleAdminFieldChange = (field: string, value: any) => {
    setAdminTariff((prev: any) => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
  };

  const handleAdminSubsidyChange = (field: string, value: any) => {
    setAdminTariff((prev: any) => {
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

  const handleSlabChange = (index: number, field: string, value: any) => {
    setAdminTariff((prev: any) => {
      if (!prev) return prev;
      const newSlabs = [...prev.slabs];
      newSlabs[index] = { ...newSlabs[index], [field]: value };
      return { ...prev, slabs: newSlabs };
    });
  };

  const handleAddSlab = () => {
    setAdminTariff((prev: any) => {
      if (!prev) return prev;
      const prevMax = prev.slabs.length > 0 ? prev.slabs[prev.slabs.length - 1].max : 0;
      const newSlab = {
        limit: "Above X units",
        rate: "₹5.00",
        max: Infinity,
        prev: prevMax === Infinity ? 0 : prevMax
      };
      return {
        ...prev,
        slabs: [...prev.slabs, newSlab]
      };
    });
  };

  const handleRemoveSlab = (index: number) => {
    setAdminTariff((prev: any) => {
      if (!prev || prev.slabs.length <= 1) return prev;
      const newSlabs = prev.slabs.filter((_: any, idx: number) => idx !== index);
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

    const timeoutMs = 10000;
    const saveOperation = async () => {
      await saveTariff(selectedAdminState, updatedTariff);
      await reloadTariffCalculator();
      const freshTariffs = await loadTariffs();
      setTariffs(freshTariffs);
    };

    try {
      await Promise.race([
        saveOperation(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Save timed out after 10 seconds")), timeoutMs))
      ]);
      
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

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    
    // Save to localStorage options
    localStorage.setItem("she_notify_high", String(notifyHighUsage));
    localStorage.setItem("she_weekly_digest", String(weeklyDigest));
    localStorage.setItem("she_energy_unit", energyUnit);

    // Clean customWattages to only save valid positive numbers
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
      setSuccess(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      console.error("Failed to update user settings:", err);
    }
  };

  // Wattage groups configuration mapping
  const applianceGroups = {
    essentials: [
      { id: "fridge", name: "Refrigerator", default: 220 },
      { id: "ac", name: "Air Conditioner", default: 1500 },
      { id: "fan", name: "Ceiling Fan", default: 50 },
      { id: "lights", name: "LED Bulb", default: 12 },
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
      { id: "exhaust_fan", name: "Exhaust Fan", default: 40 }
    ],
    water: [
      { id: "water_pump", name: "Water Pump", default: 750 },
      { id: "water_purifier", name: "RO Water Purifier", default: 60 }
    ]
  };

  const wattageCategories = [
    { id: "essentials" as const, label: "Essentials", icon: ShieldCheck },
    { id: "kitchen" as const, label: "Kitchen", icon: Utensils },
    { id: "electronics" as const, label: "Electronics", icon: Cpu },
    { id: "comfort" as const, label: "Comfort", icon: Wind },
    { id: "water" as const, label: "Water", icon: Droplet }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex-1 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-6 text-left"
    >
      {/* Title */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <SetIcon className="w-7 h-7 text-primary-blue dark:text-primary-green" />
          Settings
        </h1>
        <p className="text-sm font-semibold text-slate-550 dark:text-slate-450 mt-1">
          Configure visual settings, notification thresholds, and manage your account data exports.
        </p>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="flex items-center gap-2 p-3.5 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-400 text-xs rounded-xl font-bold"
          >
            <CheckCircle2 className="w-4.5 h-4.5" />
            <span>Application configurations saved successfully! Redirecting...</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Card 1: Theme Settings */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Appearance</h3>
          <p className="text-xs text-slate-500">Toggle light/dark visual display mode.</p>
          
          {/* Theme Preview Cards */}
          <div className="flex flex-col sm:flex-row items-stretch gap-4 pt-1">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`flex-1 p-4.5 rounded-2xl border text-left transition-all duration-300 overflow-hidden group cursor-pointer relative ${
                theme === "light"
                  ? "border-primary-blue bg-blue-50/15 dark:bg-blue-950/5 shadow-[0_0_15px_-3px_rgba(37,99,235,0.15)]"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-350 dark:hover:border-slate-755 hover:shadow-sm"
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl transition-all ${theme === "light" ? "bg-blue-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-slate-500"}`}>
                  <Sun className="w-5 h-5" />
                </div>
                {theme === "light" && (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary-blue text-white text-[10px] font-bold animate-scale">
                    ✓
                  </span>
                )}
              </div>
              <span className="block text-xs font-bold text-slate-850 dark:text-white">Light Theme</span>
              <span className="block text-[10px] text-slate-450 mt-1 leading-normal">Clean, high-contrast visual palette</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`flex-1 p-4.5 rounded-2xl border text-left transition-all duration-300 overflow-hidden group cursor-pointer relative ${
                theme === "dark"
                  ? "border-primary-green bg-green-950/5 shadow-[0_0_15px_-3px_rgba(16,185,129,0.15)]"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-350 dark:hover:border-slate-755 hover:shadow-sm"
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl transition-all ${theme === "dark" ? "bg-primary-green text-slate-950" : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-slate-500"}`}>
                  <Moon className="w-5 h-5" />
                </div>
                {theme === "dark" && (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary-green text-slate-950 text-[10px] font-bold animate-scale">
                    ✓
                  </span>
                )}
              </div>
              <span className="block text-xs font-bold text-slate-850 dark:text-white">Dark Theme</span>
              <span className="block text-[10px] text-slate-450 mt-1 leading-normal">Sleek, low-light mode for energy savers</span>
            </button>
          </div>
        </div>

        {/* Card: Budget Targets */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Monthly Energy Budgets</h3>
          <p className="text-xs text-slate-500">Define your monthly spending and energy targets. Exceeding these will trigger active warning alerts on your dashboard.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Target Monthly Bill</label>
              <div className="relative group">
                <div className="absolute left-3.5 top-3.5 text-slate-400 font-bold text-xs pointer-events-none group-focus-within:text-primary-blue dark:group-focus-within:text-primary-green transition-colors">₹</div>
                <input
                  type="number"
                  value={monthlyBudgetBill}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      setMonthlyBudgetBill("");
                    } else {
                      const parsed = parseInt(val, 10);
                      setMonthlyBudgetBill(isNaN(parsed) ? 0 : parsed);
                    }
                  }}
                  className="block w-full pl-8 pr-3.5 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-blue/20 dark:focus:ring-primary-green/20 dark:text-white transition-all"
                  placeholder="3000"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Target Monthly Consumption</label>
              <div className="relative group">
                <div className="absolute right-3.5 top-3.5 text-slate-450 dark:text-slate-500 font-bold text-[10px] pointer-events-none uppercase group-focus-within:text-primary-blue dark:group-focus-within:text-primary-green transition-colors">kWh</div>
                <input
                  type="number"
                  value={monthlyBudgetUnits}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      setMonthlyBudgetUnits("");
                    } else {
                      const parsed = parseInt(val, 10);
                      setMonthlyBudgetUnits(isNaN(parsed) ? 0 : parsed);
                    }
                  }}
                  className="block w-full pl-3.5 pr-12 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-blue/20 dark:focus:ring-primary-green/20 dark:text-white transition-all"
                  placeholder="400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card: State Tariff Settings */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">State Tariff Settings</h3>
          <p className="text-xs text-slate-500">Select the regional electricity board pricing structure to calculate your estimated monthly bill.</p>
          <div className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Tariff Scheme / Electricity Board</label>
              <select
                value={tariffState}
                onChange={(e) => setTariffState(e.target.value)}
                className="block w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none dark:text-white transition-all"
              >
                <optgroup label="Andhra Pradesh">
                  <option value="ap_apspdcl">APSPDCL (Southern Power)</option>
                  <option value="ap_apepdcl">APEPDCL (Eastern Power)</option>
                  <option value="ap_apcpdcl">APCPDCL (Central Power)</option>
                </optgroup>
                <optgroup label="Telangana">
                  <option value="telangana_tsspdcl">TSSPDCL (Southern Power)</option>
                  <option value="telangana_tsnpdcl">TSNPDCL (Northern Power)</option>
                </optgroup>
                <optgroup label="Karnataka">
                  <option value="karnataka_bescom">BESCOM (Bangalore Power)</option>
                  <option value="karnataka_hescom">HESCOM (Hubli Power)</option>
                </optgroup>
                <option value="custom">Custom Flat Rate per Unit</option>
              </select>
            </div>
            
            <AnimatePresence>
              {tariffState === "custom" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Flat Energy Charge Rate (₹ / kWh)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={customFlatRate}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setCustomFlatRate("");
                        } else {
                          const parsed = parseFloat(val);
                          setCustomFlatRate(isNaN(parsed) ? 0 : parsed);
                        }
                      }}
                      className="block w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-blue/20 dark:focus:ring-primary-green/20 dark:text-white transition-all"
                      placeholder="7.5"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Card: Custom Appliance Wattages */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Appliance Wattage Profile</h3>
              <p className="text-xs text-slate-500 mt-0.5">Specify custom home equipment wattages (W) to personalize baseline energy reports.</p>
            </div>
               {/* Category selection Tabs */}
            <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-slate-100 rounded-2xl border border-slate-200/50 dark:border-slate-200/30 self-start sm:self-center">
              {wattageCategories.map(cat => {
                const Icon = cat.icon;
                const isActive = activeWattageTab === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveWattageTab(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer relative ${
                      isActive
                        ? "bg-white text-slate-900 dark:bg-slate-900 dark:text-white shadow-sm"
                        : "text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-900"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? "scale-110" : ""}`} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-slate-150 dark:border-slate-800" />

          {/* Wattage categories dynamic container */}
          <div className="pt-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeWattageTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4"
              >
                {applianceGroups[activeWattageTab].map(app => (
                  <div 
                    key={app.id} 
                    className="p-3.5 bg-slate-50/50 dark:bg-slate-850/40 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl hover:border-blue-500/20 dark:hover:border-green-500/20 hover:shadow-[0_0_15px_-5px_rgba(59,130,246,0.1)] dark:hover:shadow-[0_0_15px_-5px_rgba(16,185,129,0.1)] hover:-translate-y-0.5 transition-all duration-300 group"
                  >
                    <label className="block text-[10px] font-bold text-slate-550 dark:text-slate-450 mb-1.5 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
                      {app.name} (W)
                    </label>
                    <input
                      type="number"
                      value={customWattages[app.id] !== undefined ? customWattages[app.id] : ""}
                      onChange={(e) => handleWattageChange(app.id, e.target.value)}
                      className="block w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-blue/10 dark:focus:ring-primary-green/10 dark:text-white transition-all"
                      placeholder={String(app.default)}
                    />
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Card 2: Units Settings */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Metrics and Units</h3>
          <p className="text-xs text-slate-500">Configure how energy metrics are presented.</p>
          <div className="flex items-center gap-4 pt-1">
            <button
              type="button"
              onClick={() => setEnergyUnit("kwh")}
              className={`flex-1 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                energyUnit === "kwh"
                  ? "border-primary-blue bg-blue-50/20 text-primary-blue dark:border-primary-green dark:bg-green-950/10 dark:text-primary-green shadow-sm"
                  : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900"
              }`}
            >
              Kilowatt Hours (kWh / Units)
            </button>
            <button
              type="button"
              onClick={() => setEnergyUnit("wh")}
              className={`flex-1 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                energyUnit === "wh"
                  ? "border-primary-blue bg-blue-50/20 text-primary-blue dark:border-primary-green dark:bg-green-950/10 dark:text-primary-green shadow-sm"
                  : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900"
              }`}
            >
              Watt Hours (Wh)
            </button>
          </div>
        </div>

        {/* Card 3: Notification Alerts */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Bell className="w-4.5 h-4.5 text-primary-blue dark:text-primary-green" />
            Alerts & Notifications
          </h3>
          
          <div className="space-y-2 pt-1">
            <ToggleSwitch 
              checked={notifyHighUsage} 
              onChange={setNotifyHighUsage} 
              label="High energy usage alerts" 
              description="Receive dashboard notifications if estimated consumption exceeds 225 units." 
            />

            <hr className="border-slate-150 dark:border-slate-800" />

            <ToggleSwitch 
              checked={weeklyDigest} 
              onChange={setWeeklyDigest} 
              label="Weekly efficiency digests" 
              description="Opt-in to energy-efficiency saving suggestions generated every weekend." 
            />
          </div>
        </div>

        {/* Admin Mode Toggle Banner */}
        <div className="bg-slate-100 dark:bg-slate-900/50 p-4.5 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary-green/15 rounded-2xl text-primary-green">
              <ShieldCheck className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                DISCOM Tariff Administration
                <span className="text-[9px] font-bold text-alert-red bg-red-100 dark:bg-red-950/40 px-1.5 py-0.5 rounded uppercase">Database Admin</span>
              </span>
              <p className="text-[10px] text-slate-550 dark:text-slate-450 mt-0.5">Modify global slab rates and subsidies stored in Firestore. All user dashboards update instantly.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAdminEditor(!showAdminEditor)}
            className="px-4.5 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer w-full sm:w-auto"
          >
            {showAdminEditor ? "Hide Admin Editor" : "Open Admin Editor"}
          </button>
        </div>

        {/* Global Tariff Editor Panel */}
        <AnimatePresence>
          {showAdminEditor && adminTariff && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-primary-green/30 dark:border-primary-green/20 shadow-[0_0_20px_rgba(16,185,129,0.05)] space-y-6 mt-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3.5">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      Tariff Database Editor
                    </h3>
                    <p className="text-[10px] text-slate-550 dark:text-slate-450 mt-0.5">Edit slab intervals, charges, and state-wide subsidies.</p>
                  </div>
                  <span className="text-[9px] bg-red-100 dark:bg-red-950/30 text-alert-red font-bold px-2 py-1 rounded-md uppercase">
                    Active Board: {selectedAdminState.toUpperCase()}
                  </span>
                </div>

                {/* Select State to edit */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Select Electricity Board to Edit</label>
                  <select
                    value={selectedAdminState}
                    onChange={(e) => setSelectedAdminState(e.target.value)}
                    className="block w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-855 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none dark:text-white"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Display Title</label>
                    <input
                      type="text"
                      value={adminTariff.displayName}
                      onChange={(e) => handleAdminFieldChange("displayName", e.target.value)}
                      className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-blue/10 dark:text-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Subsidy Type</label>
                    <select
                      value={adminTariff.subsidy.type}
                      onChange={(e) => handleAdminSubsidyChange("type", e.target.value)}
                      className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none dark:text-white"
                    >
                      <option value="fixed">Fixed Amount Reduction (₹)</option>
                      <option value="percentage">Percentage Discount (%)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Subsidy Value</label>
                    <input
                      type="number"
                      step="0.01"
                      value={adminTariff.subsidy.value}
                      onChange={(e) => handleAdminSubsidyChange("value", parseFloat(e.target.value) || 0)}
                      className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-blue/10 dark:text-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Min Gross Charge for Subsidy (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={adminTariff.subsidy.minGross || 0}
                      onChange={(e) => handleAdminSubsidyChange("minGross", parseFloat(e.target.value) || 0)}
                      className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-blue/10 dark:text-white transition-all"
                    />
                  </div>
                </div>

                {/* Slabs Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-800 pb-2">
                    <span className="text-xs font-bold text-slate-850 dark:text-slate-200">Tariff Slab Breakdown</span>
                    <button
                      type="button"
                      onClick={handleAddSlab}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-50 hover:bg-green-100 dark:bg-green-950/20 text-primary-green text-[10px] font-bold rounded-lg border border-green-200 dark:border-green-900/40 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Slab
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    <AnimatePresence initial={false}>
                      {adminTariff.slabs.map((slab: any, index: number) => (
                        <motion.div 
                          key={`slab_${index}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="flex flex-col sm:flex-row items-start sm:items-end gap-3 p-3.5 bg-slate-50/50 dark:bg-slate-850/40 border border-slate-200 dark:border-slate-800/40 rounded-2xl relative group"
                        >
                          <div className="flex-1 w-full grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">Slab Label</label>
                              <input
                                type="text"
                                value={slab.limit}
                                onChange={(e) => handleSlabChange(index, "limit", e.target.value)}
                                className="block w-full px-2.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold focus:outline-none dark:text-white"
                                placeholder="e.g. 0 – 30 units"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">Rate Label</label>
                              <input
                                type="text"
                                value={slab.rate}
                                onChange={(e) => handleSlabChange(index, "rate", e.target.value)}
                                className="block w-full px-2.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold focus:outline-none dark:text-white"
                                placeholder="e.g. ₹1.90"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">Max Units in Slab</label>
                              <input
                                type="number"
                                value={slab.max === Infinity ? "" : slab.max}
                                onChange={(e) => handleSlabChange(index, "max", e.target.value === "" ? Infinity : parseInt(e.target.value, 10) || 0)}
                                className="block w-full px-2.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold focus:outline-none dark:text-white"
                                placeholder="Infinity"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">Slab Offset (Prev Limit)</label>
                              <input
                                type="number"
                                value={slab.prev}
                                onChange={(e) => handleSlabChange(index, "prev", parseInt(e.target.value, 10) || 0)}
                                className="block w-full px-2.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold focus:outline-none dark:text-white"
                                placeholder="0"
                              />
                            </div>
                          </div>
                          {adminTariff.slabs.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSlab(index)}
                              className="p-2 text-alert-red hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer shrink-0 self-end sm:self-auto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Save Button for Admin Panel */}
                <div className="space-y-3 pt-3.5 border-t border-slate-150 dark:border-slate-800">
                  {adminSaveSuccess && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 rounded-xl text-xs font-bold text-green-700 dark:text-green-400">
                      <CheckCircle2 className="w-4.5 h-4.5" />
                      Tariff rates for {selectedAdminState.toUpperCase()} updated successfully!
                    </div>
                  )}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveAdminTariff}
                      disabled={adminSaving}
                      className="px-5 py-3 flex items-center justify-center gap-1.5 text-xs font-bold rounded-xl text-white bg-primary-green hover:opacity-90 dark:text-slate-950 transition-all shadow-md shadow-primary-green/15 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {adminSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white dark:border-slate-950/30 dark:border-t-slate-950 animate-spin rounded-full" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Update DISCOM Tariff Rates
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Actions */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-3.5 flex items-center justify-center gap-1.5 text-xs font-bold rounded-xl text-white bg-primary-blue hover:bg-primary-blue/90 dark:bg-primary-green dark:text-slate-950 dark:hover:bg-primary-green/90 transition-all shadow-md shadow-primary-blue/15 hover:shadow-lg hover:shadow-primary-blue/20 dark:hover:shadow-primary-green/20 hover:-translate-y-0.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Save Configurations
          </button>
        </div>
      </form>
    </motion.div>
  );
};
