import type { ParsedAppliance } from './applianceParser';

export interface ApplianceSpec {
  name: string;
  brand: string;
  model: string;
  category: string;
  ratedPowerW: number;
  operatingPowerW: number | null;
  standbyPowerW: number | null;
  annualEnergyKwh: number | null;
  energyStarRating: number | null;
  capacity: string | null;
  voltage: string;
  productUrl: string | null;
  imageUrl: string | null;
  confidence: "high" | "medium" | "low";
  confidenceReason: string;
  source: string;
  suggestedDailyHours: number;
  auditCategory: string;
}

export const CATEGORY_TO_AUDIT_ID: Record<string, string> = {
  'Refrigerator': 'fridge',
  'Air Conditioner': 'ac',
  'Fan': 'fan',
  'LED Bulb': 'lights',
  'Tube Light': 'lights_tube',
  'Television': 'tv',
  'Washing Machine': 'washing_machine',
  'Water Heater': 'water_heater',
  'Microwave': 'microwave',
  'Induction Stove': 'induction',
  'Laptop': 'laptop',
  'Desktop Computer': 'desktop',
  'Wi-Fi Router': 'router',
  'Gaming Console': 'gaming_console',
  'Printer': 'printer',
  'Air Cooler': 'cooler',
  'Air Purifier': 'purifier',
  'Room Heater': 'heater',
  'Exhaust Fan': 'exhaust_fan',
  'Water Pump': 'water_pump',
  'RO Water Purifier': 'water_purifier',
  'Electric Kettle': 'kettle',
  'Mixer Grinder': 'mixer_grinder',
  'Rice Cooker': 'rice_cooker',
  'Dishwasher': 'dishwasher',
  'Iron': 'iron'
};

export const SUGGESTED_HOURS: Record<string, number> = {
  'Refrigerator': 24,
  'Air Conditioner': 7,
  'Fan': 8,
  'LED Bulb': 8,
  'Tube Light': 6,
  'Television': 4,
  'Washing Machine': 1,
  'Water Heater': 1,
  'Microwave': 0.5,
  'Induction Stove': 1,
  'Laptop': 6,
  'Desktop Computer': 6,
  'Wi-Fi Router': 24,
  'Gaming Console': 2,
  'Printer': 0.2,
  'Air Cooler': 8,
  'Air Purifier': 12,
  'Room Heater': 4,
  'Exhaust Fan': 4,
  'Water Pump': 1,
  'RO Water Purifier': 4,
  'Electric Kettle': 0.5,
  'Mixer Grinder': 0.5,
  'Rice Cooker': 1,
  'Dishwasher': 1,
  'Iron': 1
};

/**
 * Estimates appliance specifications based on fallback defaults.
 */
export const estimateFromFallback = (parsed: ParsedAppliance): ApplianceSpec => {
  let ratedPowerW = 100; // Default
  const cat = parsed.category;
  
  if (cat === 'Air Conditioner') ratedPowerW = 1500;
  else if (cat === 'Refrigerator') ratedPowerW = 200;
  else if (cat === 'Water Heater' || cat === 'Room Heater') ratedPowerW = 2000;
  else if (cat === 'Microwave' || cat === 'Dishwasher' || cat === 'Electric Kettle' || cat === 'Induction Stove' || cat === 'Iron') ratedPowerW = 1200;
  else if (cat === 'Washing Machine') ratedPowerW = 500;
  else if (cat === 'Mixer Grinder' || cat === 'Water Pump') ratedPowerW = 750;
  else if (cat === 'Television') ratedPowerW = 100;
  else if (cat === 'Fan' || cat === 'Air Purifier') ratedPowerW = 50;
  else if (cat === 'Laptop') ratedPowerW = 65;
  else if (cat === 'Desktop Computer') ratedPowerW = 200;
  
  // Refine with capacity if possible
  if (cat === 'Air Conditioner' && parsed.capacity?.includes('ton')) {
      const tons = parseFloat(parsed.capacity);
      if (!isNaN(tons)) ratedPowerW = tons * 1000;
  }
  
  const categoryStr = parsed.category || 'Unknown Appliance';

  return {
    name: `${parsed.brand || 'Generic'} ${categoryStr}`,
    brand: parsed.brand || 'Generic',
    model: parsed.model || 'Unknown',
    category: categoryStr,
    ratedPowerW,
    operatingPowerW: ratedPowerW * 0.8,
    standbyPowerW: 2,
    annualEnergyKwh: (ratedPowerW * (SUGGESTED_HOURS[categoryStr] || 2) * 365) / 1000,
    energyStarRating: parsed.starRating || null,
    capacity: parsed.capacity,
    voltage: '230V',
    productUrl: null,
    imageUrl: null,
    confidence: 'low',
    confidenceReason: 'Estimated from fallback database due to missing specific model info.',
    source: 'Estimated from appliance database',
    suggestedDailyHours: SUGGESTED_HOURS[categoryStr] || 2,
    auditCategory: CATEGORY_TO_AUDIT_ID[categoryStr] || 'other'
  };
};

/**
 * Validates and sanitizes the appliance spec fields.
 */
export const validateSpec = (spec: ApplianceSpec): ApplianceSpec => {
  const result = { ...spec };
  if (result.ratedPowerW < 1 || result.ratedPowerW > 15000) {
    result.ratedPowerW = Math.max(1, Math.min(15000, result.ratedPowerW));
  }
  if (result.annualEnergyKwh !== null && (result.annualEnergyKwh < 1 || result.annualEnergyKwh > 15000)) {
    result.annualEnergyKwh = Math.max(1, Math.min(15000, result.annualEnergyKwh));
  }
  if (result.energyStarRating !== null && (result.energyStarRating < 1 || result.energyStarRating > 5)) {
    result.energyStarRating = Math.max(1, Math.min(5, result.energyStarRating));
  }
  return result;
};
