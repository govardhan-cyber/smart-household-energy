import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  Settings as SetIcon, Sun, Moon, Bell, Save, CheckCircle2, ShieldCheck, Plus, Trash2
} from "lucide-react";
import { loadTariffs, saveTariff, type TariffState } from "../utils/tariffService";
import { reloadTariffCalculator } from "../utils/tariffCalculator";

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
      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to update user settings:", err);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-6 text-left">
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

      {success && (
        <div className="flex items-center gap-2 p-3.5 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-400 text-xs rounded-xl font-bold">
          <CheckCircle2 className="w-4.5 h-4.5" />
          <span>Application configurations saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Card 1: Theme Settings */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Appearance</h3>
          <p className="text-xs text-slate-500">Toggle dark mode interface state.</p>
          <div className="flex items-center gap-4 pt-1">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold transition-all ${
                theme === "light"
                  ? "border-primary-blue bg-blue-50/20 text-primary-blue"
                  : "border-slate-200 hover:bg-slate-50 text-slate-500"
              }`}
            >
              <Sun className="w-4 h-4" />
              Light Theme
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold transition-all ${
                theme === "dark"
                  ? "border-primary-green bg-green-950/10 text-primary-green"
                  : "border-slate-200 hover:bg-slate-50 text-slate-500"
              }`}
            >
              <Moon className="w-4 h-4" />
              Dark Theme
            </button>
          </div>
        </div>

        {/* Card: Budget Targets */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Monthly Energy Budgets</h3>
          <p className="text-xs text-slate-500">Define your monthly spending and energy targets. Exceeding these will trigger active warning alerts on your dashboard.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Target Monthly Bill (₹)</label>
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
                className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-blue/10 dark:text-white"
                placeholder="3000"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Target Monthly Consumption (kWh)</label>
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
                className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-blue/10 dark:text-white"
                placeholder="400"
              />
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
                className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none dark:text-white"
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
            {tariffState === "custom" && (
              <div>
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
                  className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-blue/10 dark:text-white"
                  placeholder="7.5"
                />
              </div>
            )}
          </div>
        </div>

        {/* Card: Custom Appliance Wattages */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Appliance Wattage Profile</h3>
          <p className="text-xs text-slate-500">Overrule default appliance energy specifications. Specify your custom home equipment wattages (W) below to personalize results.</p>

          {/* Essential Appliances */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-1">Essential Appliances</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { id: "fridge", name: "Refrigerator", default: 220 },
                { id: "ac", name: "Air Conditioner", default: 1500 },
                { id: "fan", name: "Ceiling Fan", default: 50 },
                { id: "lights", name: "LED Bulb", default: 12 },
                { id: "tv", name: "Television", default: 100 },
                { id: "washing_machine", name: "Washing Machine", default: 500 },
                { id: "water_heater", name: "Water Heater", default: 2000 },
              ].map(app => (
                <div key={app.id}>
                  <label className="block text-[10px] font-bold text-slate-550 dark:text-slate-400 mb-1">{app.name} (W)</label>
                  <input
                    type="number"
                    value={customWattages[app.id] !== undefined ? customWattages[app.id] : ""}
                    onChange={(e) => handleWattageChange(app.id, e.target.value)}
                    className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-blue/10 dark:text-white"
                    placeholder={String(app.default)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Kitchen Appliances */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-1">Kitchen Appliances</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { id: "microwave", name: "Microwave Oven", default: 1200 },
                { id: "induction", name: "Induction Stove", default: 1600 },
                { id: "kettle", name: "Electric Kettle", default: 1500 },
                { id: "mixer_grinder", name: "Mixer Grinder", default: 750 },
                { id: "rice_cooker", name: "Rice Cooker", default: 700 },
                { id: "dishwasher", name: "Dishwasher", default: 1200 },
              ].map(app => (
                <div key={app.id}>
                  <label className="block text-[10px] font-bold text-slate-550 dark:text-slate-400 mb-1">{app.name} (W)</label>
                  <input
                    type="number"
                    value={customWattages[app.id] !== undefined ? customWattages[app.id] : ""}
                    onChange={(e) => handleWattageChange(app.id, e.target.value)}
                    className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-blue/10 dark:text-white"
                    placeholder={String(app.default)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Electronics */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-1">Electronics</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { id: "laptop", name: "Laptop", default: 65 },
                { id: "desktop", name: "Desktop Computer", default: 200 },
                { id: "router", name: "Wi-Fi Router", default: 15 },
                { id: "gaming_console", name: "Gaming Console", default: 150 },
                { id: "printer", name: "Printer", default: 50 },
              ].map(app => (
                <div key={app.id}>
                  <label className="block text-[10px] font-bold text-slate-550 dark:text-slate-400 mb-1">{app.name} (W)</label>
                  <input
                    type="number"
                    value={customWattages[app.id] !== undefined ? customWattages[app.id] : ""}
                    onChange={(e) => handleWattageChange(app.id, e.target.value)}
                    className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-blue/10 dark:text-white"
                    placeholder={String(app.default)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Home Comfort */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-1">Home Comfort</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { id: "cooler", name: "Air Cooler", default: 200 },
                { id: "purifier", name: "Air Purifier", default: 50 },
                { id: "heater", name: "Room Heater", default: 1500 },
                { id: "exhaust_fan", name: "Exhaust Fan", default: 40 },
              ].map(app => (
                <div key={app.id}>
                  <label className="block text-[10px] font-bold text-slate-550 dark:text-slate-400 mb-1">{app.name} (W)</label>
                  <input
                    type="number"
                    value={customWattages[app.id] !== undefined ? customWattages[app.id] : ""}
                    onChange={(e) => handleWattageChange(app.id, e.target.value)}
                    className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-blue/10 dark:text-white"
                    placeholder={String(app.default)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Water Related */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-1">Water Related</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { id: "water_pump", name: "Water Pump", default: 750 },
                { id: "water_purifier", name: "RO Water Purifier", default: 60 },
              ].map(app => (
                <div key={app.id}>
                  <label className="block text-[10px] font-bold text-slate-550 dark:text-slate-400 mb-1">{app.name} (W)</label>
                  <input
                    type="number"
                    value={customWattages[app.id] !== undefined ? customWattages[app.id] : ""}
                    onChange={(e) => handleWattageChange(app.id, e.target.value)}
                    className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-blue/10 dark:text-white"
                    placeholder={String(app.default)}
                  />
                </div>
              ))}
            </div>
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
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold transition-all ${
                energyUnit === "kwh"
                  ? "border-primary-blue bg-blue-50/20 text-primary-blue dark:border-primary-green dark:bg-green-950/10 dark:text-primary-green"
                  : "border-slate-200 hover:bg-slate-50 text-slate-500"
              }`}
            >
              Kilowatt Hours (kWh / Units)
            </button>
            <button
              type="button"
              onClick={() => setEnergyUnit("wh")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold transition-all ${
                energyUnit === "wh"
                  ? "border-primary-blue bg-blue-50/20 text-primary-blue dark:border-primary-green dark:bg-green-950/10 dark:text-primary-green"
                  : "border-slate-200 hover:bg-slate-50 text-slate-500"
              }`}
            >
              Watt Hours (Wh)
            </button>
          </div>
        </div>

        {/* Card 3: Notification Alerts */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Bell className="w-4.5 h-4.5 text-primary-blue" />
            Alerts & Notifications
          </h3>
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">High energy usage alerts</span>
                <p className="text-[10px] text-slate-450 dark:text-slate-500">Receive dashboard notifications if estimated consumption exceeds 225 units.</p>
              </div>
              <input
                type="checkbox"
                checked={notifyHighUsage}
                onChange={(e) => setNotifyHighUsage(e.target.checked)}
                className="h-4.5 w-4.5 rounded text-primary-blue focus:ring-primary-blue/20"
              />
            </div>

            <hr className="border-slate-150 dark:border-slate-800" />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Weekly efficiency digests</span>
                <p className="text-[10px] text-slate-450 dark:text-slate-500">Opt-in to energy-efficiency saving suggestions generated every weekend.</p>
              </div>
              <input
                type="checkbox"
                checked={weeklyDigest}
                onChange={(e) => setWeeklyDigest(e.target.checked)}
                className="h-4.5 w-4.5 rounded text-primary-blue focus:ring-primary-blue/20"
              />
            </div>
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
              <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-0.5">Modify global slab rates and subsidies stored in Firestore. All user dashboards update instantly.</p>
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
        {showAdminEditor && adminTariff && (
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-primary-green/30 dark:border-primary-green/20 shadow-[0_0_20px_rgba(16,185,129,0.05)] space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3.5">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  Tariff Database Editor
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Edit slab intervals, charges, and state-wide subsidies.</p>
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
                className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none dark:text-white"
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
                  className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-blue/10 dark:text-white"
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
                  className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-blue/10 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Min Gross Charge for Subsidy (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={adminTariff.subsidy.minGross || 0}
                  onChange={(e) => handleAdminSubsidyChange("minGross", parseFloat(e.target.value) || 0)}
                  className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-blue/10 dark:text-white"
                />
              </div>
            </div>

            {/* Slabs Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Tariff Slab Breakdown</span>
                <button
                  type="button"
                  onClick={handleAddSlab}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-50 hover:bg-green-100 dark:bg-green-950/20 text-primary-green text-[10px] font-bold rounded-lg border border-green-200 dark:border-green-900/40 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Slab
                </button>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {adminTariff.slabs.map((slab: any, index: number) => (
                  <div key={index} className="flex flex-col sm:flex-row items-start sm:items-end gap-3 p-3.5 bg-slate-50/50 dark:bg-slate-850/40 border border-slate-200 dark:border-slate-800/40 rounded-2xl relative group">
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
                  </div>
                ))}
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
        )}

        {/* Bottom Actions */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-3.5 flex items-center justify-center gap-1.5 text-xs font-bold rounded-xl text-white bg-primary-blue hover:bg-primary-blue/90 dark:bg-primary-green dark:text-slate-950 dark:hover:bg-primary-green/90 transition-all shadow-md shadow-primary-blue/15"
          >
            <Save className="w-4 h-4" />
            Save Configurations
          </button>
        </div>
      </form>
    </div>
  );
};
