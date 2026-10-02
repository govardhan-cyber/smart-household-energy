/**
 * Utility for extracting structured appliance metadata from free-text input.
 */

export interface ParsedAppliance {
  brand: string | null;
  model: string | null;
  category: string | null;
  capacity: string | null;
  technology: string | null;
  starRating: number | null;
  rawQuery: string;
  cleanedQuery: string;
}

const BRANDS = [
  'Samsung', 'LG', 'Whirlpool', 'Philips', 'Sony', 'Dell', 'HP', 'Voltas', 'Daikin',
  'Panasonic', 'Haier', 'Godrej', 'Bosch', 'Bajaj', 'Crompton', 'Orient', 'Havells',
  'Syska', 'Wipro', 'Lenovo', 'Asus', 'Acer', 'Apple', 'Dyson', 'IFB', 'Blue Star',
  'Carrier', 'Hitachi', 'Toshiba', 'Sharp', 'BPL', 'Videocon', 'Onida', 'Sansui',
  'Realme', 'Mi', 'Xiaomi', 'OnePlus', 'TCL', 'Lloyd', 'O General', 'Mitsubishi',
  'Usha', 'Morphy Richards', 'Prestige', 'Kent', 'Aquaguard', 'Eureka Forbes',
  'V-Guard', 'Kenstar', 'Symphony', 'Hindware', 'AO Smith', 'Racold', 'Atomberg',
  'Motorola', 'Hisense', 'Zebronics'
];

const CATEGORIES: Record<string, string[]> = {
  'Refrigerator': ['refrigerator', 'fridge', 'double door', 'single door', 'freezer', 'deep freezer'],
  'Air Conditioner': ['ac', 'air conditioner', 'split ac', 'window ac', 'inverter ac'],
  'Fan': ['fan', 'ceiling fan', 'bldc fan', 'table fan', 'pedestal fan', 'bldc'],
  'LED Bulb': ['led', 'led bulb', 'bulb', 'light', 'lamp'],
  'Tube Light': ['tube light', 'tube', 'tubelight', 'cfl', 'fluorescent'],
  'Television': ['tv', 'television', 'smart tv', 'led tv', 'oled', 'qled'],
  'Washing Machine': ['washing machine', 'washer', 'front load', 'top load'],
  'Water Heater': ['geyser', 'water heater', 'immersion', 'immersion rod'],
  'Microwave': ['microwave', 'oven', 'otg', 'convection oven'],
  'Induction Stove': ['induction', 'induction cooktop', 'cooktop', 'induction stove'],
  'Laptop': ['laptop', 'notebook', 'macbook'],
  'Desktop Computer': ['desktop', 'pc', 'computer', 'monitor', 'cpu'],
  'Wi-Fi Router': ['router', 'wifi router', 'modem', 'wifi'],
  'Gaming Console': ['gaming console', 'xbox', 'playstation', 'ps5', 'ps4'],
  'Printer': ['printer', 'scanner', 'all in one printer'],
  'Air Cooler': ['cooler', 'desert cooler', 'air cooler'],
  'Air Purifier': ['purifier', 'air purifier'],
  'Room Heater': ['heater', 'room heater', 'blower', 'oil heater'],
  'Exhaust Fan': ['exhaust', 'exhaust fan'],
  'Water Pump': ['water pump', 'pump', 'motor', 'submersible'],
  'RO Water Purifier': ['water purifier', 'ro', 'ro purifier', 'water filter'],
  'Iron': ['iron', 'steam iron', 'pressing iron', 'dry iron'],
  'Mixer Grinder': ['mixer', 'grinder', 'mixer grinder', 'blender', 'juicer'],
  'Electric Kettle': ['kettle', 'electric kettle'],
  'Toaster': ['toaster', 'sandwich maker'],
  'Dishwasher': ['dishwasher'],
  'Vacuum Cleaner': ['vacuum cleaner', 'vacuum', 'robot vacuum'],
  'Hair Dryer': ['hair dryer', 'dryer'],
  'Rice Cooker': ['rice cooker', 'electric cooker'],
  'Set-Top Box': ['set top box', 'stb', 'dth'],
  'CCTV Camera': ['cctv', 'camera', 'security camera'],
  'Smart Speaker': ['smart speaker', 'alexa', 'echo', 'google home'],
  'EV Charger': ['ev charger', 'electric vehicle']
};

const TECHNOLOGIES = ['dual inverter', 'frost free', 'inverter', 'bldc', 'smart', 'wifi', 'iot', 'digital', 'convection'];

/**
 * Strips command prefixes like "find appliance", "find", "search for", "wattage of", etc.
 */
export const cleanQueryPrefix = (raw: string): string => {
  return raw
    .trim()
    .replace(/^(find|search|lookup|show|check|get|what\s+is\s+the\s+wattage\s+of|what\s+is\s+the\s+power\s+of|wattage\s+of|power\s+of|specs?\s+of)\s+(appliance\s+)?(:|-)?\s*/i, '')
    .trim();
};

/**
 * Parses a query string to extract appliance details.
 */
export const parseApplianceQuery = (query: string): ParsedAppliance => {
  const cleaned = cleanQueryPrefix(query);
  const targetQuery = cleaned.length > 0 ? cleaned : query;

  const result: ParsedAppliance = {
    brand: null,
    model: null,
    category: null,
    capacity: null,
    technology: null,
    starRating: null,
    rawQuery: query,
    cleanedQuery: targetQuery,
  };

  const lowerQuery = targetQuery.toLowerCase();

  // Extract brand
  for (const brand of BRANDS) {
    if (new RegExp(`\\b${brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(lowerQuery)) {
      result.brand = brand;
      break;
    }
  }

  // Extract category
  for (const [category, keywords] of Object.entries(CATEGORIES)) {
    for (const kw of keywords) {
      if (new RegExp(`\\b${kw}\\b`, 'i').test(lowerQuery)) {
        result.category = category;
        break;
      }
    }
    if (result.category) break;
  }

  // Extract capacity
  const capacityRegex = /\b(\d+(?:\.\d+)?\s*(ton|l|inch|hp|w|kw|kg|liter|liters|litres|litre))\b/i;
  const capacityMatch = lowerQuery.match(capacityRegex);
  if (capacityMatch) {
    result.capacity = capacityMatch[0];
  }

  // Extract star rating
  const starRegex = /\b([1-5])\s*[-]*\s*star\b/i;
  const starMatch = lowerQuery.match(starRegex);
  if (starMatch) {
    result.starRating = parseInt(starMatch[1], 10);
  }

  // Extract technology
  for (const tech of TECHNOLOGIES) {
    if (new RegExp(`\\b${tech}\\b`, 'i').test(lowerQuery)) {
      result.technology = tech;
      break;
    }
  }

  // Extract model (simplistic approach: remove knowns, find alphanumeric)
  let remainingQuery = lowerQuery;
  if (result.brand) remainingQuery = remainingQuery.replace(new RegExp(`\\b${result.brand}\\b`, 'ig'), '');
  if (result.category) {
    const kws = CATEGORIES[result.category];
    kws.forEach(kw => {
      remainingQuery = remainingQuery.replace(new RegExp(`\\b${kw}\\b`, 'ig'), '');
    });
  }
  if (result.capacity) remainingQuery = remainingQuery.replace(capacityRegex, '');
  if (result.starRating) remainingQuery = remainingQuery.replace(starRegex, '');
  if (result.technology) remainingQuery = remainingQuery.replace(new RegExp(`\\b${result.technology}\\b`, 'ig'), '');
  
  const modelRegex = /\b([A-Za-z0-9]*[A-Za-z][A-Za-z0-9]*\d[A-Za-z0-9]*|\d[A-Za-z0-9]*[A-Za-z][A-Za-z0-9]*)\b/;
  const modelMatch = remainingQuery.match(modelRegex);
  if (modelMatch) {
    result.model = modelMatch[0].toUpperCase();
  }

  return result;
};

/**
 * Checks if the parsed query looks like an appliance spec/product query.
 * Excludes conversational questions that happen to mention an appliance.
 */
export const isApplianceQuery = (parsed: ParsedAppliance, rawQueryOverride?: string): boolean => {
  const query = (rawQueryOverride || parsed.rawQuery || '').trim();

  // If query expresses conversational advice or savings inquiry, route to conversational Copilot
  const conversationalAdvicePattern = /\b(how\s+can\s+i|how\s+to\s+save|how\s+do\s+i\s+reduce|why\s+is\s+my|why\s+does|reduce|saving|savings|save|bill|bills|cost|costs|tariff|slab|audit|benchmark|compare|tips|help|advice)\b|\bhow\s+much\s+(money|cost)\b/i;
  if (conversationalAdvicePattern.test(query)) {
    return false;
  }

  // Definite appliance lookup if specific brand or model is identified
  if (parsed.brand !== null || parsed.model !== null) {
    return true;
  }

  // If query has explicit wattage or specification keywords
  const specKeywords = /\b(watt|watts|wattage|power|spec|specs|specification|specifications|model|rating|kwh)\b/i;
  if (specKeywords.test(query)) {
    return true;
  }

  // Category with explicit specifications or attributes
  if (parsed.category !== null) {
    if (parsed.starRating !== null || parsed.capacity !== null || parsed.technology !== null) {
      return true;
    }

    // Direct standalone appliance category query without advice phrases (e.g. "refrigerator", "AC", "washing machine", "fan")
    // If the cleaned query is under 4 words, treat as an appliance spec lookup
    const targetQuery = parsed.cleanedQuery || cleanQueryPrefix(query);
    const wordCount = targetQuery.split(/\s+/).filter(Boolean).length;
    if (wordCount <= 3 && wordCount >= 1) {
      return true;
    }
  }

  return false;
};
