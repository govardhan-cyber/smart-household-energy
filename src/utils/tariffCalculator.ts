import { loadTariffs, refreshTariffs, DEFAULT_TARIFFS, normalizeStateKey, type TariffState } from "./tariffService";

// ─── Singleton cache (populated by initTariffCalculator) ───────────────────────
let tariffCache: Record<string, TariffState> = DEFAULT_TARIFFS;

/** Call once at app startup (e.g. in App.tsx or AuthContext) */
export async function initTariffCalculator(): Promise<void> {
  tariffCache = await loadTariffs();
}

/** Force reload tariff database definitions */
export async function reloadTariffCalculator(): Promise<void> {
  tariffCache = await refreshTariffs();
}

/** Sync access — returns default if not yet initialized */
function getTariff(stateKey: string): TariffState {
  const normKey = normalizeStateKey(stateKey);
  return tariffCache[normKey] ?? tariffCache["ap_apspdcl"] ?? tariffCache["custom"] as TariffState;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TariffResult {
  totalUnits: number;
  grossEnergyCharge: number;
  subsidy: number;
  netEnergyCharge: number;
  stateName: string;
}

export interface SlabDetail {
  limit: string;
  rate: string;
  max: number;
  prev: number;
}

// ─── Bill Calculation (uses dynamic tariffs) ──────────────────────────────────

export interface TODRatio {
  peakPercent: number;
  normalPercent: number;
  offPeakPercent: number;
}

export function calculateBill(
  units: number,
  stateKey: string = "ap",
  customFlatRate: number = 7.50,
  todRatio?: TODRatio
): TariffResult {
  // Handle custom rate inline
  if (stateKey === "custom") {
    let gross = Math.round(units * customFlatRate * 100) / 100;
    if (todRatio) {
      const multipliers = { peak: 1.2, normal: 1.0, offPeak: 0.85 };
      const weightedMultiplier = 
        (todRatio.peakPercent / 100) * multipliers.peak +
        (todRatio.normalPercent / 100) * multipliers.normal +
        (todRatio.offPeakPercent / 100) * multipliers.offPeak;
      gross = Math.round(gross * weightedMultiplier * 100) / 100;
    }
    return {
      totalUnits: units,
      grossEnergyCharge: gross,
      subsidy: 0,
      netEnergyCharge: gross,
      stateName: `Custom Tariff (₹${customFlatRate.toFixed(2)}/unit)`,
    };
  }

  const tariff = getTariff(stateKey);
  let netCharges = 0;
  let remaining = units;

  const multipliers = tariff.todMultipliers ?? { peak: 1.2, normal: 1.0, offPeak: 0.85 };
  const weightedMultiplier = todRatio
    ? (todRatio.peakPercent / 100) * multipliers.peak +
      (todRatio.normalPercent / 100) * multipliers.normal +
      (todRatio.offPeakPercent / 100) * multipliers.offPeak
    : 1.0;

  for (const slab of tariff.slabs) {
    if (remaining <= 0) break;
    const unitsInSlab = Math.min(remaining, slab.max === Infinity ? remaining : slab.max);
    netCharges += unitsInSlab * (slab.numericRate * weightedMultiplier);
    remaining -= unitsInSlab;
  }

  const gross = Math.round(netCharges * 100) / 100;

  // Calculate subsidy
  let subsidy = 0;
  if (gross > 0) {
    const minGross = tariff.subsidy.minGross ?? 0;
    if (gross >= minGross) {
      if (tariff.subsidy.type === "fixed") {
        subsidy = tariff.subsidy.value;
      } else {
        subsidy = Math.round(gross * (tariff.subsidy.value / 100) * 100) / 100;
      }
    }
  }

  const net = Math.round(Math.max(0, gross - subsidy) * 100) / 100;

  return {
    totalUnits: units,
    grossEnergyCharge: gross,
    subsidy,
    netEnergyCharge: net,
    stateName: tariff.displayName + (todRatio ? " (TOD Active)" : ""),
  };
}

// ─── Slab Details (uses dynamic tariffs) ──────────────────────────────────────

export function getSlabsForState(
  stateKey: string,
  customFlatRate: number = 7.50
): SlabDetail[] {
  if (stateKey === "custom") {
    return [
      {
        limit: "All consumption",
        rate: `₹${customFlatRate.toFixed(2)}`,
        max: Infinity,
        prev: 0,
      },
    ];
  }

  const tariff = getTariff(stateKey);
  return tariff.slabs.map((s) => ({
    limit: s.limit,
    rate: s.rate,
    max: s.max,
    prev: s.prev,
  }));
}

// ─── Appliance Items ──────────────────────────────────────────────────────────

export interface ApplianceItem {
  id: string;
  name: string;
  category: string;
  watts: number;
  icon: string;
  hint: string;
  quantity: number;
  hours: number;
  unitHours?: number[];
  age?: number;
  unitAges?: number[];
}

export function getApplianceDecayRate(id: string): number {
  if (id === "ac") return 0.02;       // 2% per year
  if (id === "fridge") return 0.015;  // 1.5% per year
  if (id === "fan") return 0.01;      // 1% per year
  return 0;
}


export const defaultAppliances: ApplianceItem[] = [
  // ─── Essential Appliances ──────────────────────────────────────────────────
  { id: 'fridge',          name: 'Refrigerator',         category: 'essential',   watts: 220,  icon: 'Refrigerator',   hint: 'Double Door 3-star',            quantity: 0, hours: 24 },
  { id: 'ac',              name: 'Air Conditioner',      category: 'essential',   watts: 1500, icon: 'Wind',           hint: '1.5 Ton 5-Star Inverter',       quantity: 0, hours: 6  },
  { id: 'fan',             name: 'Ceiling Fan',          category: 'essential',   watts: 50,   icon: 'Fan',            hint: 'High-speed BLDC Fan',           quantity: 0, hours: 12 },
  { id: 'lights',          name: 'LED Bulb',             category: 'essential',   watts: 12,   icon: 'Lightbulb',      hint: '9W-12W LED Bulbs',              quantity: 0, hours: 8  },
  { id: 'lights_tube',     name: 'Tube Light',           category: 'essential',   watts: 40,   icon: 'Lightbulb',      hint: 'Conventional Tube Lights',      quantity: 0, hours: 6  },
  { id: 'tv',              name: 'Television',           category: 'essential',   watts: 100,  icon: 'Tv',             hint: '55" Smart LED TV',              quantity: 0, hours: 4  },
  { id: 'washing_machine', name: 'Washing Machine',      category: 'essential',   watts: 500,  icon: 'WashingMachine', hint: 'Fully Automatic Front Load',     quantity: 0, hours: 1  },
  { id: 'water_heater',    name: 'Water Heater (Geyser)',category: 'essential',   watts: 2000, icon: 'Flame',          hint: '15L Storage Geyser',            quantity: 0, hours: 1  },

  // ─── Kitchen Appliances ────────────────────────────────────────────────────
  { id: 'microwave',       name: 'Microwave Oven',       category: 'kitchen',     watts: 1200, icon: 'Microwave',      hint: 'Convection Mode',               quantity: 0, hours: 0.5 },
  { id: 'induction',       name: 'Induction Stove',      category: 'kitchen',     watts: 1600, icon: 'CookingPot',     hint: 'Glass top stove',               quantity: 0, hours: 1  },
  { id: 'kettle',          name: 'Electric Kettle',      category: 'kitchen',     watts: 1500, icon: 'Coffee',         hint: '1.5L Rapid Boil',               quantity: 0, hours: 0.5 },
  { id: 'mixer_grinder',   name: 'Mixer Grinder',        category: 'kitchen',     watts: 750,  icon: 'Blender',        hint: '3-speed 750W Motor',            quantity: 0, hours: 0.5 },
  { id: 'rice_cooker',     name: 'Rice Cooker',          category: 'kitchen',     watts: 700,  icon: 'CookingPot',     hint: '1.8L Automatic Cooker',         quantity: 0, hours: 1  },
  { id: 'dishwasher',      name: 'Dishwasher',           category: 'kitchen',     watts: 1200, icon: 'Waves',          hint: '12 Place Settings',             quantity: 0, hours: 1  },

  // ─── Electronics ───────────────────────────────────────────────────────────
  { id: 'laptop',          name: 'Laptop',               category: 'electronics', watts: 65,   icon: 'Laptop',         hint: 'Business/Office Laptop',        quantity: 0, hours: 8  },
  { id: 'desktop',         name: 'Desktop Computer',     category: 'electronics', watts: 200,  icon: 'Monitor',        hint: 'PC with Monitor',               quantity: 0, hours: 6  },
  { id: 'router',          name: 'Wi-Fi Router',         category: 'electronics', watts: 15,   icon: 'Router',         hint: 'Dual Band Gig Router',          quantity: 0, hours: 24 },
  { id: 'gaming_console',  name: 'Gaming Console',       category: 'electronics', watts: 150,  icon: 'Gamepad2',       hint: 'Next-gen Console',              quantity: 0, hours: 2  },
  { id: 'printer',         name: 'Printer',              category: 'electronics', watts: 50,   icon: 'Printer',        hint: 'Laser/Inkjet Printer',          quantity: 0, hours: 0.2 },

  // ─── Home Comfort ──────────────────────────────────────────────────────────
  { id: 'cooler',          name: 'Air Cooler',           category: 'comfort',     watts: 200,  icon: 'Wind',           hint: 'Personal/Desert Cooler',        quantity: 0, hours: 8  },
  { id: 'purifier',        name: 'Air Purifier',         category: 'comfort',     watts: 50,   icon: 'Filter',         hint: 'HEPA Filter Purifier',          quantity: 0, hours: 12 },
  { id: 'heater',          name: 'Room Heater',          category: 'comfort',     watts: 1500, icon: 'Thermometer',    hint: 'Convector or Oil Filled',       quantity: 0, hours: 4  },
  { id: 'exhaust_fan',     name: 'Exhaust Fan',          category: 'comfort',     watts: 40,   icon: 'Fan',            hint: 'Kitchen/Bathroom Fan',          quantity: 0, hours: 4  },

  // ─── Water Related ─────────────────────────────────────────────────────────
  { id: 'water_pump',      name: 'Water Pump',           category: 'water',       watts: 750,  icon: 'Droplet',        hint: '1 HP Monoblock Pump',           quantity: 0, hours: 1  },
  { id: 'water_purifier',  name: 'RO Water Purifier',    category: 'water',       watts: 60,   icon: 'GlassWater',     hint: 'Multi-stage RO System',         quantity: 0, hours: 4  },
];

// ─── Survey Data ───────────────────────────────────────────────────────────────

export interface SurveyRecord {
  memberId: string;
  householdName: string;
  appliancesCount: number;
  appliancesSelected: string[];
  totalUsageKwh: number;
  estimatedBill: number;
  highestConsumer: string;
  savingsPotential: number;
}

export const surveyData: SurveyRecord[] = [
  { memberId: "M001", householdName: "Ramesh Kumar",        appliancesCount: 5, appliancesSelected: ["AC","Fridge","Fan","Lights","TV"],         totalUsageKwh: 340, estimatedBill: 2150, highestConsumer: "AC",            savingsPotential: 420  },
  { memberId: "M002", householdName: "Priya Sharma",        appliancesCount: 4, appliancesSelected: ["Fridge","Fan","Lights","TV"],              totalUsageKwh: 120, estimatedBill: 405,  highestConsumer: "Refrigerator",  savingsPotential: 85   },
  { memberId: "M003", householdName: "Venkatesh Rao",       appliancesCount: 6, appliancesSelected: ["AC","Fridge","Water Heater","Fan","Lights","Laptop"], totalUsageKwh: 450, estimatedBill: 3450, highestConsumer: "Water Heater", savingsPotential: 620  },
  { memberId: "M004", householdName: "Ananya Deshmukh",     appliancesCount: 3, appliancesSelected: ["Fridge","Fan","Lights"],                   totalUsageKwh: 90,  estimatedBill: 282,  highestConsumer: "Refrigerator",  savingsPotential: 45   },
  { memberId: "M005", householdName: "Suresh Babu",         appliancesCount: 7, appliancesSelected: ["AC","Fridge","Washing Machine","Water Heater","Fan","Lights","TV"], totalUsageKwh: 520, estimatedBill: 4120, highestConsumer: "AC",            savingsPotential: 850  },
  { memberId: "M006", householdName: "Lakshmi Narayana",    appliancesCount: 5, appliancesSelected: ["AC","Fridge","Fan","Lights","Laptop"],       totalUsageKwh: 310, estimatedBill: 1888, highestConsumer: "AC",            savingsPotential: 350  },
  { memberId: "M007", householdName: "Karan Johar",         appliancesCount: 4, appliancesSelected: ["Fridge","Fan","Lights","Laptop"],          totalUsageKwh: 110, estimatedBill: 360,  highestConsumer: "Refrigerator",  savingsPotential: 50   },
  { memberId: "M008", householdName: "Divya Reddy",         appliancesCount: 6, appliancesSelected: ["AC","Fridge","Washing Machine","Fan","Lights","TV"], totalUsageKwh: 380, estimatedBill: 2500, highestConsumer: "AC",            savingsPotential: 480  },
  { memberId: "M009", householdName: "Vikram Singh",        appliancesCount: 5, appliancesSelected: ["Fridge","Water Heater","Fan","Lights","TV"], totalUsageKwh: 180, estimatedBill: 747,  highestConsumer: "Water Heater", savingsPotential: 150  },
  { memberId: "M010", householdName: "Siddharth Malhotra",  appliancesCount: 3, appliancesSelected: ["Fridge","Fan","Lights"],                   totalUsageKwh: 80,  estimatedBill: 247,  highestConsumer: "Refrigerator",  savingsPotential: 40   },
  { memberId: "M011", householdName: "Meera Nair",          appliancesCount: 5, appliancesSelected: ["AC","Fridge","Fan","Lights","Laptop"],     totalUsageKwh: 290, estimatedBill: 1713, highestConsumer: "AC",            savingsPotential: 310  },
  { memberId: "M012", householdName: "Harish Chandra",      appliancesCount: 4, appliancesSelected: ["Fridge","Fan","Lights","TV"],             totalUsageKwh: 130, estimatedBill: 447,  highestConsumer: "Refrigerator",  savingsPotential: 70   },
  { memberId: "M013", householdName: "Rajesh Patil",         appliancesCount: 7, appliancesSelected: ["AC","Fridge","Washing Machine","Water Heater","Fan","Lights","Laptop"], totalUsageKwh: 580, estimatedBill: 4705, highestConsumer: "AC",            savingsPotential: 920  },
  { memberId: "M014", householdName: "Kavitha Krishnan",     appliancesCount: 3, appliancesSelected: ["Fridge","Fan","Lights"],                   totalUsageKwh: 85,  estimatedBill: 265,  highestConsumer: "Refrigerator",  savingsPotential: 35   },
  { memberId: "M015", householdName: "Nithin Hegde",          appliancesCount: 6, appliancesSelected: ["AC","Fridge","Water Heater","Fan","Lights","TV"], totalUsageKwh: 420, estimatedBill: 2850, highestConsumer: "Water Heater", savingsPotential: 550  },
  { memberId: "M016", householdName: "Sunitha Verma",        appliancesCount: 5, appliancesSelected: ["AC","Fridge","Fan","Lights","TV"],         totalUsageKwh: 320, estimatedBill: 1975, highestConsumer: "AC",            savingsPotential: 390  },
  { memberId: "M017", householdName: "Abhishek Bachchan",    appliancesCount: 4, appliancesSelected: ["Fridge","Fan","Lights","Laptop"],        totalUsageKwh: 115, estimatedBill: 382,  highestConsumer: "Refrigerator",  savingsPotential: 60   },
  { memberId: "M018", householdName: "Swati Dandekar",       appliancesCount: 6, appliancesSelected: ["AC","Fridge","Washing Machine","Fan","Lights","Laptop"], totalUsageKwh: 350, estimatedBill: 2238, highestConsumer: "AC",            savingsPotential: 440  },
  { memberId: "M019", householdName: "Rohan Kapoor",          appliancesCount: 5, appliancesSelected: ["Fridge","Water Heater","Fan","Lights","TV"], totalUsageKwh: 195, estimatedBill: 837,  highestConsumer: "Water Heater", savingsPotential: 180  },
  { memberId: "M020", householdName: "Neelam Kothari",       appliancesCount: 3, appliancesSelected: ["Fridge","Fan","Lights"],                   totalUsageKwh: 75,  estimatedBill: 230,  highestConsumer: "Refrigerator",  savingsPotential: 30   },
  { memberId: "M021", householdName: "Madhavan Iyer",        appliancesCount: 7, appliancesSelected: ["AC","Fridge","Washing Machine","Water Heater","Fan","Lights","TV","Laptop"], totalUsageKwh: 610, estimatedBill: 4997, highestConsumer: "AC",            savingsPotential: 1050 },
  { memberId: "M022", householdName: "Pooja Hegde",          appliancesCount: 4, appliancesSelected: ["Fridge","Fan","Lights","TV"],              totalUsageKwh: 125, estimatedBill: 427,  highestConsumer: "Refrigerator",  savingsPotential: 80   },
  { memberId: "M023", householdName: "Vijay Devarakonda",   appliancesCount: 6, appliancesSelected: ["AC","Fridge","Water Heater","Fan","Lights","Laptop"], totalUsageKwh: 480, estimatedBill: 3730, highestConsumer: "Water Heater", savingsPotential: 680  },
  { memberId: "M024", householdName: "Rashmika Mandanna",    appliancesCount: 3, appliancesSelected: ["Fridge","Fan","Lights"],                   totalUsageKwh: 95,  estimatedBill: 299,  highestConsumer: "Refrigerator",  savingsPotential: 50   },
  { memberId: "M025", householdName: "Allu Arjun",           appliancesCount: 7, appliancesSelected: ["AC","Fridge","Washing Machine","Water Heater","Fan","Lights","TV"], totalUsageKwh: 560, estimatedBill: 4510, highestConsumer: "AC",            savingsPotential: 890  },
  { memberId: "M026", householdName: "Mahesh Babu",          appliancesCount: 5, appliancesSelected: ["AC","Fridge","Fan","Lights","Laptop"],     totalUsageKwh: 330, estimatedBill: 2063, highestConsumer: "AC",            savingsPotential: 380  },
  { memberId: "M027", householdName: "Samantha Ruth",        appliancesCount: 4, appliancesSelected: ["Fridge","Fan","Lights","Laptop"],          totalUsageKwh: 105, estimatedBill: 337,  highestConsumer: "Refrigerator",  savingsPotential: 45   },
  { memberId: "M028", householdName: "Prabhas Raju",         appliancesCount: 6, appliancesSelected: ["AC","Fridge","Washing Machine","Fan","Lights","TV"], totalUsageKwh: 395, estimatedBill: 2631, highestConsumer: "AC",            savingsPotential: 510  },
  { memberId: "M029", householdName: "Ram Charan",            appliancesCount: 5, appliancesSelected: ["Fridge","Water Heater","Fan","Lights","TV"], totalUsageKwh: 190, estimatedBill: 807,  highestConsumer: "Water Heater", savingsPotential: 170  },
  { memberId: "M030", householdName: "NTR Junior",            appliancesCount: 3, appliancesSelected: ["Fridge","Fan","Lights"],                   totalUsageKwh: 70,  estimatedBill: 213,  highestConsumer: "Refrigerator",  savingsPotential: 25   },
];
