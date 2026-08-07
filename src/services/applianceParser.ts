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
}

const BRANDS = [
  'Samsung', 'LG', 'Whirlpool', 'Philips', 'Sony', 'Dell', 'HP', 'Voltas', 'Daikin',
  'Panasonic', 'Haier', 'Godrej', 'Bosch', 'Bajaj', 'Crompton', 'Orient', 'Havells',
  'Syska', 'Wipro', 'Lenovo', 'Asus', 'Acer', 'Apple', 'Dyson', 'IFB', 'Blue Star',
  'Carrier', 'Hitachi', 'Toshiba', 'Sharp', 'BPL', 'Videocon', 'Onida', 'Sansui',
  'Realme', 'Mi', 'Xiaomi', 'OnePlus'
];

const CATEGORIES: Record<string, string[]> = {
  'Refrigerator': ['refrigerator', 'fridge', 'double door', 'single door'],
  'Air Conditioner': ['ac', 'air conditioner', 'split ac', 'window ac'],
  'Fan': ['fan', 'ceiling fan', 'bldc fan', 'table fan', 'pedestal fan'],
  'LED Bulb': ['led', 'led bulb', 'bulb', 'light', 'lamp'],
  'Tube Light': ['tube light', 'tube', 'tubelight', 'cfl'],
  'Television': ['tv', 'television', 'smart tv', 'led tv', 'oled'],
  'Washing Machine': ['washing machine', 'washer', 'front load', 'top load'],
  'Water Heater': ['geyser', 'water heater', 'immersion'],
  'Microwave': ['microwave', 'oven', 'otg'],
  'Induction Stove': ['induction', 'induction cooktop', 'cooktop'],
  'Laptop': ['laptop', 'notebook'],
  'Desktop Computer': ['desktop', 'pc', 'computer', 'monitor'],
  'Wi-Fi Router': ['router', 'wifi router', 'modem'],
  'Gaming Console': ['gaming console', 'xbox', 'playstation', 'ps5', 'ps4'],
  'Printer': ['printer'],
  'Air Cooler': ['cooler', 'desert cooler', 'air cooler'],
  'Air Purifier': ['purifier', 'air purifier'],
  'Room Heater': ['heater', 'room heater', 'blower'],
  'Exhaust Fan': ['exhaust', 'exhaust fan'],
  'Water Pump': ['water pump', 'pump', 'motor'],
  'RO Water Purifier': ['water purifier', 'ro', 'ro purifier'],
  'Iron': ['iron', 'steam iron', 'pressing iron'],
  'Mixer Grinder': ['mixer', 'grinder', 'mixer grinder', 'blender', 'juicer'],
  'Electric Kettle': ['kettle', 'electric kettle'],
  'Toaster': ['toaster'],
  'Dishwasher': ['dishwasher'],
  'Vacuum Cleaner': ['vacuum cleaner', 'vacuum'],
  'Hair Dryer': ['hair dryer', 'dryer'],
  'Rice Cooker': ['rice cooker'],
  'Set-Top Box': ['set top box', 'stb', 'dth'],
  'CCTV Camera': ['cctv', 'camera', 'security camera'],
  'Smart Speaker': ['smart speaker', 'alexa', 'echo', 'google home'],
  'EV Charger': ['ev charger', 'electric vehicle']
};

const TECHNOLOGIES = ['dual inverter', 'frost free', 'inverter', 'bldc', 'smart', 'wifi', 'iot', 'digital', 'convection'];

/**
 * Parses a query string to extract appliance details.
 */
export const parseApplianceQuery = (query: string): ParsedAppliance => {
  const result: ParsedAppliance = {
    brand: null,
    model: null,
    category: null,
    capacity: null,
    technology: null,
    starRating: null,
    rawQuery: query,
  };

  const lowerQuery = query.toLowerCase();

  // Extract brand
  for (const brand of BRANDS) {
    if (lowerQuery.includes(brand.toLowerCase())) {
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
 * Checks if the parsed query looks like an appliance query.
 */
export const isApplianceQuery = (parsed: ParsedAppliance): boolean => {
  return parsed.brand !== null || parsed.category !== null;
};
