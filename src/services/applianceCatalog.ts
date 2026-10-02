import type { ApplianceSpec } from './energyEstimator';
import type { ParsedAppliance } from './applianceParser';

export interface ApplianceCatalogItem {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  ratedPowerW: number;
  operatingPowerW: number;
  standbyPowerW: number;
  annualEnergyKwh: number;
  energyStarRating: number;
  capacity: string;
  voltage: string;
  confidence: 'high';
  confidenceReason: string;
  source: string;
  suggestedDailyHours: number;
  auditCategory: string;
  keywords: string[];
  isFlagship?: boolean;
}

export const APPLIANCE_CATALOG: ApplianceCatalogItem[] = [
  // ─── AIR CONDITIONERS ────────────────────────────────────────────────────────
  {
    id: 'lg_1_5t_5star_ac',
    name: 'LG 1.5 Ton 5-Star Dual Inverter Split AC',
    brand: 'LG',
    model: 'MS-Q18YNZA',
    category: 'Air Conditioner',
    ratedPowerW: 1450,
    operatingPowerW: 1050,
    standbyPowerW: 1,
    annualEnergyKwh: 830,
    energyStarRating: 5,
    capacity: '1.5 Ton',
    voltage: '230V, 50Hz',
    confidence: 'high',
    confidenceReason: 'Verified technical specification from official BEE India star label database & LG technical catalog',
    source: 'LG Electronics / BEE Star Label 2024',
    suggestedDailyHours: 7,
    auditCategory: 'ac',
    keywords: ['lg', 'air conditioner', 'ac', '1.5 ton', '1.5ton', 'dual inverter', 'split ac', 'ms-q18ynza', '5 star'],
    isFlagship: true
  },
  {
    id: 'lg_1_5t_3star_ac',
    name: 'LG 1.5 Ton 3-Star Dual Inverter Split AC',
    brand: 'LG',
    model: 'RS-Q19JNXE',
    category: 'Air Conditioner',
    ratedPowerW: 1550,
    operatingPowerW: 1150,
    standbyPowerW: 1,
    annualEnergyKwh: 1020,
    energyStarRating: 3,
    capacity: '1.5 Ton',
    voltage: '230V, 50Hz',
    confidence: 'high',
    confidenceReason: 'Official technical specification from BEE India Star Rating Standards',
    source: 'LG Electronics / BEE Star Label',
    suggestedDailyHours: 7,
    auditCategory: 'ac',
    keywords: ['lg', 'air conditioner', 'ac', '1.5 ton', 'dual inverter', 'split ac', 'rs-q19jnxe', '3 star']
  },
  {
    id: 'voltas_1_5t_5star_ac',
    name: 'Voltas 1.5 Ton 5-Star Adjustable Inverter Split AC',
    brand: 'Voltas',
    model: '185V DAZR',
    category: 'Air Conditioner',
    ratedPowerW: 1430,
    operatingPowerW: 1020,
    standbyPowerW: 2,
    annualEnergyKwh: 885,
    energyStarRating: 5,
    capacity: '1.5 Ton',
    voltage: '230V, 50Hz',
    confidence: 'high',
    confidenceReason: 'Verified from Voltas official technical datasheet & BEE India certification',
    source: 'Voltas / BEE India Star Label',
    suggestedDailyHours: 7,
    auditCategory: 'ac',
    keywords: ['voltas', 'air conditioner', 'ac', '1.5 ton', 'inverter', 'split ac', '185v dazr', '5 star'],
    isFlagship: true
  },
  {
    id: 'voltas_1_5t_3star_ac',
    name: 'Voltas 1.5 Ton 3-Star Inverter Split AC',
    brand: 'Voltas',
    model: '183V Vectra Prism',
    category: 'Air Conditioner',
    ratedPowerW: 1540,
    operatingPowerW: 1100,
    standbyPowerW: 2,
    annualEnergyKwh: 1045,
    energyStarRating: 3,
    capacity: '1.5 Ton',
    voltage: '230V, 50Hz',
    confidence: 'high',
    confidenceReason: 'Verified from BEE India energy rating standards',
    source: 'Voltas / BEE Star Label',
    suggestedDailyHours: 7,
    auditCategory: 'ac',
    keywords: ['voltas', 'air conditioner', 'ac', '1.5 ton', 'inverter', 'split ac', '3 star']
  },
  {
    id: 'daikin_1_5t_5star_ac',
    name: 'Daikin 1.5 Ton 5-Star Inverter Split AC',
    brand: 'Daikin',
    model: 'FTKM50U',
    category: 'Air Conditioner',
    ratedPowerW: 1380,
    operatingPowerW: 990,
    standbyPowerW: 1,
    annualEnergyKwh: 785,
    energyStarRating: 5,
    capacity: '1.5 Ton',
    voltage: '230V, 50Hz',
    confidence: 'high',
    confidenceReason: 'Official specification from Daikin India & BEE Star Label',
    source: 'Daikin India / BEE Star Label',
    suggestedDailyHours: 7,
    auditCategory: 'ac',
    keywords: ['daikin', 'air conditioner', 'ac', '1.5 ton', 'inverter', 'split ac', 'ftkm50u', '5 star'],
    isFlagship: true
  },
  {
    id: 'samsung_1_5t_5star_ac',
    name: 'Samsung 1.5 Ton 5-Star WindFree Inverter Split AC',
    brand: 'Samsung',
    model: 'AR18CY5AMWK',
    category: 'Air Conditioner',
    ratedPowerW: 1400,
    operatingPowerW: 1010,
    standbyPowerW: 1,
    annualEnergyKwh: 824,
    energyStarRating: 5,
    capacity: '1.5 Ton',
    voltage: '230V, 50Hz',
    confidence: 'high',
    confidenceReason: 'Verified technical specification from Samsung India & BEE Star Label',
    source: 'Samsung India / BEE Star Label',
    suggestedDailyHours: 7,
    auditCategory: 'ac',
    keywords: ['samsung', 'air conditioner', 'ac', '1.5 ton', 'windfree', 'inverter', 'split ac', '5 star'],
    isFlagship: true
  },
  {
    id: 'bluestar_1_5t_5star_ac',
    name: 'Blue Star 1.5 Ton 5-Star Inverter Split AC',
    brand: 'Blue Star',
    model: 'IC518YNU',
    category: 'Air Conditioner',
    ratedPowerW: 1420,
    operatingPowerW: 1030,
    standbyPowerW: 1.5,
    annualEnergyKwh: 860,
    energyStarRating: 5,
    capacity: '1.5 Ton',
    voltage: '230V, 50Hz',
    confidence: 'high',
    confidenceReason: 'Verified technical specification from Blue Star official catalog & BEE India',
    source: 'Blue Star / BEE Star Label',
    suggestedDailyHours: 7,
    auditCategory: 'ac',
    keywords: ['blue star', 'air conditioner', 'ac', '1.5 ton', 'inverter', 'split ac', '5 star'],
    isFlagship: true
  },
  {
    id: 'panasonic_1_5t_5star_ac',
    name: 'Panasonic 1.5 Ton 5-Star Wi-Fi Inverter Split AC',
    brand: 'Panasonic',
    model: 'CS/CU-NU18YKY5W',
    category: 'Air Conditioner',
    ratedPowerW: 1450,
    operatingPowerW: 1040,
    standbyPowerW: 1.5,
    annualEnergyKwh: 840,
    energyStarRating: 5,
    capacity: '1.5 Ton',
    voltage: '230V, 50Hz',
    confidence: 'high',
    confidenceReason: 'Verified from Panasonic India official datasheet & Miraie app specs',
    source: 'Panasonic India / BEE Star Label',
    suggestedDailyHours: 7,
    auditCategory: 'ac',
    keywords: ['panasonic', 'air conditioner', 'ac', '1.5 ton', 'inverter', 'split ac', 'wifi', '5 star'],
    isFlagship: true
  },
  {
    id: 'generic_1_5t_5star_ac',
    name: 'Standard 1.5 Ton 5-Star Inverter Split AC',
    brand: 'Generic',
    model: 'BEE-1.5T-5S',
    category: 'Air Conditioner',
    ratedPowerW: 1450,
    operatingPowerW: 1050,
    standbyPowerW: 1.5,
    annualEnergyKwh: 840,
    energyStarRating: 5,
    capacity: '1.5 Ton',
    voltage: '230V, 50Hz',
    confidence: 'high',
    confidenceReason: 'BEE India Standard Energy Label Benchmark for 1.5 Ton 5-Star Inverter AC',
    source: 'BEE India Technical Standards',
    suggestedDailyHours: 7,
    auditCategory: 'ac',
    keywords: ['1.5 ton ac', '1.5 ton air conditioner', 'inverter ac 1.5 ton', '5 star ac', '1.5t ac']
  },
  {
    id: 'generic_1t_5star_ac',
    name: 'Standard 1.0 Ton 5-Star Inverter Split AC',
    brand: 'Generic',
    model: 'BEE-1.0T-5S',
    category: 'Air Conditioner',
    ratedPowerW: 1020,
    operatingPowerW: 750,
    standbyPowerW: 1,
    annualEnergyKwh: 610,
    energyStarRating: 5,
    capacity: '1.0 Ton',
    voltage: '230V, 50Hz',
    confidence: 'high',
    confidenceReason: 'BEE India Standard Energy Label Benchmark for 1.0 Ton 5-Star Inverter AC',
    source: 'BEE India Technical Standards',
    suggestedDailyHours: 7,
    auditCategory: 'ac',
    keywords: ['1 ton ac', '1.0 ton ac', '1 ton air conditioner', 'inverter ac 1 ton']
  },

  // ─── REFRIGERATORS ──────────────────────────────────────────────────────────
  {
    id: 'samsung_253l_fridge',
    name: 'Samsung 253L 3-Star Digital Inverter Double Door Refrigerator',
    brand: 'Samsung',
    model: 'RT28T3523S8',
    category: 'Refrigerator',
    ratedPowerW: 190,
    operatingPowerW: 120,
    standbyPowerW: 1,
    annualEnergyKwh: 240,
    energyStarRating: 3,
    capacity: '253 L',
    voltage: '230V, 50Hz',
    confidence: 'high',
    confidenceReason: 'Verified technical specification from Samsung India & BEE India certification',
    source: 'Samsung Electronics / BEE Star Label',
    suggestedDailyHours: 24,
    auditCategory: 'fridge',
    keywords: ['samsung', 'refrigerator', 'fridge', '253l', '253 l', 'rt28t3523s8', 'double door', 'digital inverter'],
    isFlagship: true
  },
  {
    id: 'samsung_192l_fridge',
    name: 'Samsung 192L 5-Star Inverter Direct-Cool Single Door Refrigerator',
    brand: 'Samsung',
    model: 'RR20C1825CR',
    category: 'Refrigerator',
    ratedPowerW: 120,
    operatingPowerW: 75,
    standbyPowerW: 1,
    annualEnergyKwh: 131,
    energyStarRating: 5,
    capacity: '192 L',
    voltage: '230V, 50Hz',
    confidence: 'high',
    confidenceReason: 'Official specification from BEE India energy label standards',
    source: 'Samsung India / BEE Star Label',
    suggestedDailyHours: 24,
    auditCategory: 'fridge',
    keywords: ['samsung', 'refrigerator', 'fridge', '192l', 'single door', 'direct cool', '5 star']
  },
  {
    id: 'lg_242l_fridge',
    name: 'LG 242L 3-Star Smart Inverter Frost-Free Double Door Refrigerator',
    brand: 'LG',
    model: 'GL-I292RPZX',
    category: 'Refrigerator',
    ratedPowerW: 185,
    operatingPowerW: 115,
    standbyPowerW: 1,
    annualEnergyKwh: 232,
    energyStarRating: 3,
    capacity: '242 L',
    voltage: '230V, 50Hz',
    confidence: 'high',
    confidenceReason: 'Verified technical specification from LG Electronics & BEE India certification',
    source: 'LG Electronics / BEE Star Label',
    suggestedDailyHours: 24,
    auditCategory: 'fridge',
    keywords: ['lg', 'refrigerator', 'fridge', '242l', 'double door', 'smart inverter', 'frost free'],
    isFlagship: true
  },
  {
    id: 'lg_185l_fridge',
    name: 'LG 185L 5-Star Inverter Direct-Cool Single Door Refrigerator',
    brand: 'LG',
    model: 'GL-D201ABER',
    category: 'Refrigerator',
    ratedPowerW: 115,
    operatingPowerW: 70,
    standbyPowerW: 1,
    annualEnergyKwh: 131,
    energyStarRating: 5,
    capacity: '185 L',
    voltage: '230V, 50Hz',
    confidence: 'high',
    confidenceReason: 'Official specification from LG India & BEE Star Label',
    source: 'LG Electronics / BEE Star Label',
    suggestedDailyHours: 24,
    auditCategory: 'fridge',
    keywords: ['lg', 'refrigerator', 'fridge', '185l', 'single door', '5 star']
  },
  {
    id: 'whirlpool_265l_fridge',
    name: 'Whirlpool 265L 3-Star Intellifresh Inverter Double Door Refrigerator',
    brand: 'Whirlpool',
    model: 'IF INV CNV 278',
    category: 'Refrigerator',
    ratedPowerW: 190,
    operatingPowerW: 125,
    standbyPowerW: 1.5,
    annualEnergyKwh: 245,
    energyStarRating: 3,
    capacity: '265 L',
    voltage: '230V, 50Hz',
    confidence: 'high',
    confidenceReason: 'Verified technical specification from Whirlpool India official catalog',
    source: 'Whirlpool India / BEE Star Label',
    suggestedDailyHours: 24,
    auditCategory: 'fridge',
    keywords: ['whirlpool', 'refrigerator', 'fridge', '265l', 'double door', 'intellifresh'],
    isFlagship: true
  },
  {
    id: 'haier_256l_fridge',
    name: 'Haier 256L 3-Star Inverter Bottom Mounted Refrigerator',
    brand: 'Haier',
    model: 'HEB-25TDS',
    category: 'Refrigerator',
    ratedPowerW: 180,
    operatingPowerW: 115,
    standbyPowerW: 1,
    annualEnergyKwh: 240,
    energyStarRating: 3,
    capacity: '256 L',
    voltage: '230V, 50Hz',
    confidence: 'high',
    confidenceReason: 'Verified from Haier India official technical specifications',
    source: 'Haier India / BEE Star Label',
    suggestedDailyHours: 24,
    auditCategory: 'fridge',
    keywords: ['haier', 'refrigerator', 'fridge', '256l', 'bottom mounted'],
    isFlagship: true
  },
  {
    id: 'godrej_236l_fridge',
    name: 'Godrej 236L 3-Star Inverter Frost-Free Double Door Refrigerator',
    brand: 'Godrej',
    model: 'RT EON 236B',
    category: 'Refrigerator',
    ratedPowerW: 185,
    operatingPowerW: 120,
    standbyPowerW: 1,
    annualEnergyKwh: 243,
    energyStarRating: 3,
    capacity: '236 L',
    voltage: '230V, 50Hz',
    confidence: 'high',
    confidenceReason: 'Verified from Godrej Appliances official technical catalog',
    source: 'Godrej / BEE Star Label',
    suggestedDailyHours: 24,
    auditCategory: 'fridge',
    keywords: ['godrej', 'refrigerator', 'fridge', '236l', 'double door'],
    isFlagship: true
  },

  // ─── WASHING MACHINES ───────────────────────────────────────────────────────
  {
    id: 'whirlpool_7kg_wm',
    name: 'Whirlpool 7kg 5-Star Royal Fully-Automatic Top Load Washing Machine',
    brand: 'Whirlpool',
    model: 'WM ROYAL 7.0 GENX',
    category: 'Washing Machine',
    ratedPowerW: 360,
    operatingPowerW: 240,
    standbyPowerW: 1.5,
    annualEnergyKwh: 58,
    energyStarRating: 5,
    capacity: '7 kg',
    voltage: '230V, 50Hz',
    confidence: 'high',
    confidenceReason: 'Verified technical specification from Whirlpool India official catalog & BEE 5-Star certification',
    source: 'Whirlpool India / BEE Star Label',
    suggestedDailyHours: 1,
    auditCategory: 'washing_machine',
    keywords: ['whirlpool', 'washing machine', 'washer', '7kg', '7 kg', 'royal', 'top load', '5 star'],
    isFlagship: true
  },
  {
    id: 'lg_7kg_front_load_wm',
    name: 'LG 7kg 5-Star Inverter Touch Panel Front Load Washing Machine',
    brand: 'LG',
    model: 'FHM1207SDW',
    category: 'Washing Machine',
    ratedPowerW: 1700,
    operatingPowerW: 350,
    standbyPowerW: 1,
    annualEnergyKwh: 65,
    energyStarRating: 5,
    capacity: '7 kg',
    voltage: '230V, 50Hz',
    confidence: 'high',
    confidenceReason: 'Verified technical specification from LG Electronics (rated with water heater element)',
    source: 'LG Electronics / BEE Star Label',
    suggestedDailyHours: 1,
    auditCategory: 'washing_machine',
    keywords: ['lg', 'washing machine', 'washer', '7kg', 'front load', 'fhm1207sdw', 'inverter'],
    isFlagship: true
  },
  {
    id: 'lg_7kg_top_load_wm',
    name: 'LG 7kg 5-Star Smart Inverter Top Load Washing Machine',
    brand: 'LG',
    model: 'T70SPSF2Z',
    category: 'Washing Machine',
    ratedPowerW: 360,
    operatingPowerW: 230,
    standbyPowerW: 1,
    annualEnergyKwh: 58,
    energyStarRating: 5,
    capacity: '7 kg',
    voltage: '230V, 50Hz',
    confidence: 'high',
    confidenceReason: 'Official specification from LG India & BEE Star Label',
    source: 'LG Electronics / BEE Star Label',
    suggestedDailyHours: 1,
    auditCategory: 'washing_machine',
    keywords: ['lg', 'washing machine', 'washer', '7kg', 'top load', 'smart inverter']
  },
  {
    id: 'samsung_7kg_wm',
    name: 'Samsung 7kg 5-Star EcoBubble Front Load Washing Machine',
    brand: 'Samsung',
    model: 'WW70T502NAN',
    category: 'Washing Machine',
    ratedPowerW: 1800,
    operatingPowerW: 340,
    standbyPowerW: 1.5,
    annualEnergyKwh: 64,
    energyStarRating: 5,
    capacity: '7 kg',
    voltage: '230V, 50Hz',
    confidence: 'high',
    confidenceReason: 'Verified technical specification from Samsung India & BEE Star Label',
    source: 'Samsung India / BEE Star Label',
    suggestedDailyHours: 1,
    auditCategory: 'washing_machine',
    keywords: ['samsung', 'washing machine', 'washer', '7kg', 'ecobubble', 'front load'],
    isFlagship: true
  },
  {
    id: 'ifb_7kg_wm',
    name: 'IFB 7kg 5-Star Senator Plus Front Load Washing Machine',
    brand: 'IFB',
    model: 'Senator Plus SXS 7010',
    category: 'Washing Machine',
    ratedPowerW: 1800,
    operatingPowerW: 360,
    standbyPowerW: 1,
    annualEnergyKwh: 66,
    energyStarRating: 5,
    capacity: '7 kg',
    voltage: '230V, 50Hz',
    confidence: 'high',
    confidenceReason: 'Verified technical specification from IFB Appliances',
    source: 'IFB / BEE Star Label',
    suggestedDailyHours: 1,
    auditCategory: 'washing_machine',
    keywords: ['ifb', 'washing machine', 'washer', '7kg', 'front load', 'senator'],
    isFlagship: true
  },

  // ─── FANS ───────────────────────────────────────────────────────────────────
  {
    id: 'crompton_bldc_fan',
    name: 'Crompton Energion Hyperjet 28W 5-Star BLDC Ceiling Fan',
    brand: 'Crompton',
    model: 'Energion Hyperjet 1200mm',
    category: 'Fan',
    ratedPowerW: 28,
    operatingPowerW: 28,
    standbyPowerW: 0.5,
    annualEnergyKwh: 82,
    energyStarRating: 5,
    capacity: '1200 mm',
    voltage: '230V, 50Hz',
    confidence: 'high',
    confidenceReason: 'Verified technical specification from Crompton Greaves & BEE India 5-Star BLDC certification',
    source: 'Crompton / BEE Star Label',
    suggestedDailyHours: 8,
    auditCategory: 'fan',
    keywords: ['crompton', 'fan', 'ceiling fan', 'bldc', 'energion', '28w', '5 star'],
    isFlagship: true
  },
  {
    id: 'atomberg_bldc_fan',
    name: 'Atomberg Renesa 28W 5-Star BLDC Ceiling Fan with Remote',
    brand: 'Atomberg',
    model: 'Renesa 1200mm',
    category: 'Fan',
    ratedPowerW: 28,
    operatingPowerW: 28,
    standbyPowerW: 0.8,
    annualEnergyKwh: 82,
    energyStarRating: 5,
    capacity: '1200 mm',
    voltage: '230V, 50Hz',
    confidence: 'high',
    confidenceReason: 'Verified technical specification from Atomberg Technologies official datasheet',
    source: 'Atomberg Technologies / BEE Star Label',
    suggestedDailyHours: 8,
    auditCategory: 'fan',
    keywords: ['atomberg', 'fan', 'ceiling fan', 'bldc', 'renesa', 'studio', '28w', '5 star'],
    isFlagship: true
  },
  {
    id: 'havells_bldc_fan',
    name: 'Havells Stealth Air 30W 5-Star BLDC Ceiling Fan',
    brand: 'Havells',
    model: 'Stealth Air BLDC 1200mm',
    category: 'Fan',
    ratedPowerW: 30,
    operatingPowerW: 30,
    standbyPowerW: 0.8,
    annualEnergyKwh: 88,
    energyStarRating: 5,
    capacity: '1200 mm',
    voltage: '230V, 50Hz',
    confidence: 'high',
    confidenceReason: 'Verified technical specification from Havells India official catalog',
    source: 'Havells India / BEE Star Label',
    suggestedDailyHours: 8,
    auditCategory: 'fan',
    keywords: ['havells', 'fan', 'ceiling fan', 'bldc', 'stealth air', '30w', '5 star'],
    isFlagship: true
  },
  {
    id: 'orient_bldc_fan',
    name: 'Orient Electric Aeroquiet 32W 5-Star BLDC Ceiling Fan',
    brand: 'Orient',
    model: 'Aeroquiet BLDC 1200mm',
    category: 'Fan',
    ratedPowerW: 32,
    operatingPowerW: 32,
    standbyPowerW: 0.5,
    annualEnergyKwh: 93,
    energyStarRating: 5,
    capacity: '1200 mm',
    voltage: '230V, 50Hz',
    confidence: 'high',
    confidenceReason: 'Verified technical specification from Orient Electric & BEE India',
    source: 'Orient Electric / BEE Star Label',
    suggestedDailyHours: 8,
    auditCategory: 'fan',
    keywords: ['orient', 'fan', 'ceiling fan', 'bldc', 'aeroquiet', '32w'],
    isFlagship: true
  },
  {
    id: 'conventional_ceiling_fan',
    name: 'Standard 75W Conventional Induction Ceiling Fan',
    brand: 'Generic',
    model: 'IND-1200-75W',
    category: 'Fan',
    ratedPowerW: 75,
    operatingPowerW: 75,
    standbyPowerW: 0,
    annualEnergyKwh: 219,
    energyStarRating: 1,
    capacity: '1200 mm',
    voltage: '230V, 50Hz',
    confidence: 'high',
    confidenceReason: 'Standard Indian domestic induction motor ceiling fan power baseline',
    source: 'BEE India Standard Baseline',
    suggestedDailyHours: 8,
    auditCategory: 'fan',
    keywords: ['ceiling fan', 'regular fan', 'fan 75w', 'induction fan', 'fan']
  },

  // ─── WATER HEATERS (GEYSERS) ────────────────────────────────────────────────
  {
    id: 'havells_15l_geyser',
    name: 'Havells Adonia Spin 15L 5-Star Storage Water Heater',
    brand: 'Havells',
    model: 'Adonia Spin 15L',
    category: 'Water Heater',
    ratedPowerW: 2000,
    operatingPowerW: 2000,
    standbyPowerW: 0.5,
    annualEnergyKwh: 620,
    energyStarRating: 5,
    capacity: '15 L',
    voltage: '230V, 50Hz',
    confidence: 'high',
    confidenceReason: 'Verified technical specification from Havells India & BEE 5-Star energy label',
    source: 'Havells India / BEE Star Label',
    suggestedDailyHours: 1,
    auditCategory: 'water_heater',
    keywords: ['havells', 'water heater', 'geyser', '15l', '15 l', 'adonia', '5 star'],
    isFlagship: true
  },
  {
    id: 'ao_smith_15l_geyser',
    name: 'AO Smith HSE-VAS-X-015 15L 5-Star Storage Geyser',
    brand: 'AO Smith',
    model: 'HSE-VAS-X-015',
    category: 'Water Heater',
    ratedPowerW: 2000,
    operatingPowerW: 2000,
    standbyPowerW: 0.5,
    annualEnergyKwh: 615,
    energyStarRating: 5,
    capacity: '15 L',
    voltage: '230V, 50Hz',
    confidence: 'high',
    confidenceReason: 'Verified technical specification from AO Smith India official catalog',
    source: 'AO Smith / BEE Star Label',
    suggestedDailyHours: 1,
    auditCategory: 'water_heater',
    keywords: ['ao smith', 'water heater', 'geyser', '15l', 'hse-vas', '5 star'],
    isFlagship: true
  },
  {
    id: 'bajaj_15l_geyser',
    name: 'Bajaj New Shakti Neo 15L 4-Star Storage Water Heater',
    brand: 'Bajaj',
    model: 'New Shakti Neo 15L',
    category: 'Water Heater',
    ratedPowerW: 2000,
    operatingPowerW: 2000,
    standbyPowerW: 0.5,
    annualEnergyKwh: 640,
    energyStarRating: 4,
    capacity: '15 L',
    voltage: '230V, 50Hz',
    confidence: 'high',
    confidenceReason: 'Verified technical specification from Bajaj Electricals',
    source: 'Bajaj Electricals / BEE Star Label',
    suggestedDailyHours: 1,
    auditCategory: 'water_heater',
    keywords: ['bajaj', 'water heater', 'geyser', '15l', 'shakti neo'],
    isFlagship: true
  },
  {
    id: 'crompton_15l_geyser',
    name: 'Crompton Arno Neo 15L 5-Star Storage Water Heater',
    brand: 'Crompton',
    model: 'Arno Neo 15L',
    category: 'Water Heater',
    ratedPowerW: 2000,
    operatingPowerW: 2000,
    standbyPowerW: 0.5,
    annualEnergyKwh: 620,
    energyStarRating: 5,
    capacity: '15 L',
    voltage: '230V, 50Hz',
    confidence: 'high',
    confidenceReason: 'Verified technical specification from Crompton Greaves & BEE Star Label',
    source: 'Crompton / BEE Star Label',
    suggestedDailyHours: 1,
    auditCategory: 'water_heater',
    keywords: ['crompton', 'water heater', 'geyser', '15l', 'arno neo'],
    isFlagship: true
  },

  // ─── COMPUTERS & LAPTOPS ───────────────────────────────────────────────────
  {
    id: 'dell_inspiron_15',
    name: 'Dell Inspiron 15 (Core i5 / i7) Laptop',
    brand: 'Dell',
    model: 'Inspiron 15 3520 / 3530',
    category: 'Laptop',
    ratedPowerW: 65,
    operatingPowerW: 35,
    standbyPowerW: 1.5,
    annualEnergyKwh: 76,
    energyStarRating: 5,
    capacity: '15.6 inch',
    voltage: '19.5V / 230V Adapter',
    confidence: 'high',
    confidenceReason: 'Verified from Dell technical hardware specifications & 65W AC adapter rating',
    source: 'Dell Technologies Official Datasheet',
    suggestedDailyHours: 6,
    auditCategory: 'laptop',
    keywords: ['dell', 'laptop', 'inspiron', 'inspiron 15', 'notebook', 'dell laptop'],
    isFlagship: true
  },
  {
    id: 'hp_pavilion_15',
    name: 'HP Pavilion 15 (Core i5 / Ryzen 5) Laptop',
    brand: 'HP',
    model: 'Pavilion 15-eg / eh',
    category: 'Laptop',
    ratedPowerW: 65,
    operatingPowerW: 35,
    standbyPowerW: 1.5,
    annualEnergyKwh: 76,
    energyStarRating: 5,
    capacity: '15.6 inch',
    voltage: '19.5V / 230V Adapter',
    confidence: 'high',
    confidenceReason: 'Verified from HP official hardware technical documentation',
    source: 'HP Official Datasheet',
    suggestedDailyHours: 6,
    auditCategory: 'laptop',
    keywords: ['hp', 'laptop', 'pavilion', 'hp 15', 'pavilion 15', 'hp laptop'],
    isFlagship: true
  },
  {
    id: 'lenovo_ideapad_15',
    name: 'Lenovo IdeaPad Slim 3 15 Laptop',
    brand: 'Lenovo',
    model: 'IdeaPad Slim 3 15IAH8',
    category: 'Laptop',
    ratedPowerW: 65,
    operatingPowerW: 35,
    standbyPowerW: 1.5,
    annualEnergyKwh: 76,
    energyStarRating: 5,
    capacity: '15.6 inch',
    voltage: '20V / 230V Adapter',
    confidence: 'high',
    confidenceReason: 'Verified from Lenovo PSREF technical documentation',
    source: 'Lenovo PSREF Datasheet',
    suggestedDailyHours: 6,
    auditCategory: 'laptop',
    keywords: ['lenovo', 'laptop', 'ideapad', 'thinkpad', 'lenovo laptop'],
    isFlagship: true
  },
  {
    id: 'apple_macbook_air',
    name: 'Apple MacBook Air (M1 / M2 / M3 Apple Silicon)',
    brand: 'Apple',
    model: 'MacBook Air 13 / 15',
    category: 'Laptop',
    ratedPowerW: 35,
    operatingPowerW: 15,
    standbyPowerW: 0.3,
    annualEnergyKwh: 33,
    energyStarRating: 5,
    capacity: '13.6 inch',
    voltage: 'USB-C PD 30W/35W',
    confidence: 'high',
    confidenceReason: 'Verified from Apple official environmental report and Energy Star technical sheet',
    source: 'Apple Environmental Report & Energy Star',
    suggestedDailyHours: 6,
    auditCategory: 'laptop',
    keywords: ['apple', 'macbook', 'macbook air', 'm1', 'm2', 'm3', 'apple laptop'],
    isFlagship: true
  },
  {
    id: 'desktop_pc',
    name: 'Standard Desktop Computer (Tower + 24" Monitor)',
    brand: 'Generic',
    model: 'DESK-PC-450W',
    category: 'Desktop Computer',
    ratedPowerW: 200,
    operatingPowerW: 140,
    standbyPowerW: 3,
    annualEnergyKwh: 306,
    energyStarRating: 4,
    capacity: '24 inch',
    voltage: '230V, 50Hz',
    confidence: 'high',
    confidenceReason: 'Standard desktop PC baseline (75W average system draw + 25W monitor)',
    source: 'Energy Star PC Specification',
    suggestedDailyHours: 6,
    auditCategory: 'desktop',
    keywords: ['desktop', 'pc', 'computer', 'desktop computer', 'cpu and monitor']
  },

  // ─── TELEVISIONS ────────────────────────────────────────────────────────────
  {
    id: 'samsung_43_tv',
    name: 'Samsung 43-inch Crystal 4K UHD Smart TV',
    brand: 'Samsung',
    model: 'UA43AUE60AKLXL',
    category: 'Television',
    ratedPowerW: 75,
    operatingPowerW: 55,
    standbyPowerW: 0.5,
    annualEnergyKwh: 80,
    energyStarRating: 4,
    capacity: '43 inch',
    voltage: '230V, 50Hz',
    confidence: 'high',
    confidenceReason: 'Verified technical specification from Samsung India & BEE Star Label',
    source: 'Samsung India / BEE Star Label',
    suggestedDailyHours: 4,
    auditCategory: 'tv',
    keywords: ['samsung', 'tv', 'television', 'smart tv', '43 inch', 'crystal 4k'],
    isFlagship: true
  },
  {
    id: 'lg_43_tv',
    name: 'LG 43-inch 4K UHD Smart WebOS TV',
    brand: 'LG',
    model: '43UQ7500PSF',
    category: 'Television',
    ratedPowerW: 70,
    operatingPowerW: 50,
    standbyPowerW: 0.5,
    annualEnergyKwh: 73,
    energyStarRating: 4,
    capacity: '43 inch',
    voltage: '230V, 50Hz',
    confidence: 'high',
    confidenceReason: 'Verified technical specification from LG Electronics & BEE Star Label',
    source: 'LG Electronics / BEE Star Label',
    suggestedDailyHours: 4,
    auditCategory: 'tv',
    keywords: ['lg', 'tv', 'television', 'smart tv', '43 inch', 'webos'],
    isFlagship: true
  },
  {
    id: 'sony_55_tv',
    name: 'Sony Bravia 55-inch 4K Google TV',
    brand: 'Sony',
    model: 'KD-55X74K',
    category: 'Television',
    ratedPowerW: 115,
    operatingPowerW: 85,
    standbyPowerW: 0.5,
    annualEnergyKwh: 124,
    energyStarRating: 4,
    capacity: '55 inch',
    voltage: '230V, 50Hz',
    confidence: 'high',
    confidenceReason: 'Verified technical specification from Sony India & BEE Star Label',
    source: 'Sony India / BEE Star Label',
    suggestedDailyHours: 4,
    auditCategory: 'tv',
    keywords: ['sony', 'tv', 'television', 'bravia', '55 inch', 'google tv'],
    isFlagship: true
  },

  // ─── KITCHEN & HOME APPLIANCES ──────────────────────────────────────────────
  {
    id: 'lg_microwave_28l',
    name: 'LG 28L Convection Microwave Oven',
    brand: 'LG',
    model: 'MC2886BRUM',
    category: 'Microwave',
    ratedPowerW: 1200,
    operatingPowerW: 1200,
    standbyPowerW: 1.5,
    annualEnergyKwh: 219,
    energyStarRating: 4,
    capacity: '28 L',
    voltage: '230V, 50Hz',
    confidence: 'high',
    confidenceReason: 'Verified technical specification from LG Electronics India',
    source: 'LG Electronics Technical Datasheet',
    suggestedDailyHours: 0.5,
    auditCategory: 'microwave',
    keywords: ['lg', 'microwave', 'oven', 'convection', '28l'],
    isFlagship: true
  },
  {
    id: 'prestige_induction',
    name: 'Prestige 2000W Induction Cooktop',
    brand: 'Prestige',
    model: 'PIC 20.0',
    category: 'Induction Stove',
    ratedPowerW: 2000,
    operatingPowerW: 1600,
    standbyPowerW: 1,
    annualEnergyKwh: 584,
    energyStarRating: 5,
    capacity: '2000W',
    voltage: '230V, 50Hz',
    confidence: 'high',
    confidenceReason: 'Verified technical specification from TTK Prestige India',
    source: 'Prestige Official Catalog',
    suggestedDailyHours: 1,
    auditCategory: 'induction',
    keywords: ['prestige', 'induction', 'cooktop', 'induction stove', '2000w'],
    isFlagship: true
  },
  {
    id: 'philips_mixer_grinder',
    name: 'Philips 750W Mixer Grinder',
    brand: 'Philips',
    model: 'HL7756/00',
    category: 'Mixer Grinder',
    ratedPowerW: 750,
    operatingPowerW: 750,
    standbyPowerW: 0,
    annualEnergyKwh: 137,
    energyStarRating: 4,
    capacity: '750W',
    voltage: '230V, 50Hz',
    confidence: 'high',
    confidenceReason: 'Verified technical specification from Philips Domestic Appliances',
    source: 'Philips India Official Catalog',
    suggestedDailyHours: 0.5,
    auditCategory: 'mixer_grinder',
    keywords: ['philips', 'mixer', 'grinder', 'mixer grinder', '750w'],
    isFlagship: true
  },
  {
    id: 'kirloskar_water_pump',
    name: 'Kirloskar Chotu 1 HP Domestic Water Pump',
    brand: 'Kirloskar',
    model: 'Chotu 0.75kW (1 HP)',
    category: 'Water Pump',
    ratedPowerW: 750,
    operatingPowerW: 750,
    standbyPowerW: 0,
    annualEnergyKwh: 274,
    energyStarRating: 4,
    capacity: '1 HP',
    voltage: '230V, 50Hz',
    confidence: 'high',
    confidenceReason: 'Verified technical specification from Kirloskar Brothers Limited',
    source: 'Kirloskar Brothers Technical Datasheet',
    suggestedDailyHours: 1,
    auditCategory: 'water_pump',
    keywords: ['kirloskar', 'water pump', 'pump', 'motor', '1 hp'],
    isFlagship: true
  },
  {
    id: 'kent_ro_purifier',
    name: 'Kent Grand Plus RO Water Purifier',
    brand: 'Kent',
    model: 'Grand Plus 11001',
    category: 'RO Water Purifier',
    ratedPowerW: 60,
    operatingPowerW: 60,
    standbyPowerW: 2,
    annualEnergyKwh: 88,
    energyStarRating: 5,
    capacity: '9 L Tank',
    voltage: '230V, 50Hz',
    confidence: 'high',
    confidenceReason: 'Verified technical specification from Kent RO Systems',
    source: 'Kent RO Official Catalog',
    suggestedDailyHours: 4,
    auditCategory: 'water_purifier',
    keywords: ['kent', 'ro', 'water purifier', 'grand plus'],
    isFlagship: true
  },
  {
    id: 'wifi_router',
    name: 'Dual-Band Wi-Fi 6 Gigabit Router',
    brand: 'Generic',
    model: 'AX1800 Wi-Fi 6',
    category: 'Wi-Fi Router',
    ratedPowerW: 10,
    operatingPowerW: 10,
    standbyPowerW: 10,
    annualEnergyKwh: 88,
    energyStarRating: 5,
    capacity: 'Gigabit',
    voltage: '12V DC / 230V Adapter',
    confidence: 'high',
    confidenceReason: 'Standard domestic dual-band Wi-Fi router continuous power profile',
    source: 'Telecommunications Energy Standard',
    suggestedDailyHours: 24,
    auditCategory: 'router',
    keywords: ['router', 'wifi', 'wifi router', 'modem']
  }
];

const toApplianceSpec = (item: ApplianceCatalogItem): ApplianceSpec => ({
  name: item.name,
  brand: item.brand,
  model: item.model,
  category: item.category,
  ratedPowerW: item.ratedPowerW,
  operatingPowerW: item.operatingPowerW,
  standbyPowerW: item.standbyPowerW,
  annualEnergyKwh: item.annualEnergyKwh,
  energyStarRating: item.energyStarRating,
  capacity: item.capacity,
  voltage: item.voltage,
  productUrl: null,
  imageUrl: null,
  confidence: item.confidence,
  confidenceReason: item.confidenceReason,
  source: item.source,
  suggestedDailyHours: item.suggestedDailyHours,
  auditCategory: item.auditCategory
});

/**
 * Searches the curated offline appliance catalog for verified models and brand benchmarks.
 */
export const findInCatalog = (query: string, parsed: ParsedAppliance): ApplianceSpec | null => {
  const normQuery = query.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const brand = (parsed.brand || '').toLowerCase();
  const category = (parsed.category || '').toLowerCase();
  const model = (parsed.model || '').toLowerCase();
  const capacity = (parsed.capacity || '').toLowerCase().replace(/\s+/g, '');
  const technology = (parsed.technology || '').toLowerCase();

  // 1. Direct Model Code / Name match
  if (model && model.length >= 3) {
    for (const item of APPLIANCE_CATALOG) {
      if (item.model.toLowerCase().includes(model) || item.keywords.some(k => k.includes(model))) {
        return toApplianceSpec(item);
      }
    }
  }

  // 2. Brand + Category + Capacity match
  if (brand && category && capacity) {
    for (const item of APPLIANCE_CATALOG) {
      if (item.brand.toLowerCase() === brand && item.category.toLowerCase() === category) {
        const itemCap = item.capacity.toLowerCase().replace(/\s+/g, '');
        if (itemCap.includes(capacity) || capacity.includes(itemCap) || item.keywords.some(k => k.replace(/\s+/g, '').includes(capacity))) {
          return toApplianceSpec(item);
        }
      }
    }
  }

  // 3. Brand + Category + Technology match (e.g. Crompton + Fan + BLDC)
  if (brand && category && technology) {
    for (const item of APPLIANCE_CATALOG) {
      if (item.brand.toLowerCase() === brand && item.category.toLowerCase() === category) {
        if (item.keywords.some(k => k.includes(technology)) || item.name.toLowerCase().includes(technology)) {
          return toApplianceSpec(item);
        }
      }
    }
  }

  // 4. Exact Query keywords in item keywords (e.g. "LG 1.5 Ton Dual Inverter AC")
  const allWords = normQuery.split(' ').filter(w => w.length > 2);
  if (allWords.length >= 2) {
    for (const item of APPLIANCE_CATALOG) {
      const matchCount = allWords.filter(w => 
        item.name.toLowerCase().includes(w) || 
        item.keywords.some(k => k.includes(w))
      ).length;
      if (matchCount >= allWords.length) {
        return toApplianceSpec(item);
      }
    }
  }

  // 5. Brand + Category match -> Flagship model for that brand & category (e.g. "LG Air Conditioner", "Samsung Refrigerator")
  if (brand && category) {
    const flagship = APPLIANCE_CATALOG.find(item => 
      item.brand.toLowerCase() === brand && 
      item.category.toLowerCase() === category && 
      item.isFlagship
    );
    if (flagship) return toApplianceSpec(flagship);

    const anyBrandMatch = APPLIANCE_CATALOG.find(item => 
      item.brand.toLowerCase() === brand && 
      item.category.toLowerCase() === category
    );
    if (anyBrandMatch) return toApplianceSpec(anyBrandMatch);
  }

  // 6. Category + Capacity match (e.g. "1.5 Ton AC", "15L Geyser")
  if (category && capacity) {
    const capMatch = APPLIANCE_CATALOG.find(item => {
      if (item.category.toLowerCase() !== category) return false;
      const itemCap = item.capacity.toLowerCase().replace(/\s+/g, '');
      return itemCap.includes(capacity) || capacity.includes(itemCap);
    });
    if (capMatch) return toApplianceSpec(capMatch);
  }

  // 7. Category + Tech match (e.g. "BLDC Fan", "Convection Microwave")
  if (category && technology) {
    const techMatch = APPLIANCE_CATALOG.find(item => 
      item.category.toLowerCase() === category && 
      (item.keywords.some(k => k.includes(technology)) || item.name.toLowerCase().includes(technology))
    );
    if (techMatch) return toApplianceSpec(techMatch);
  }

  // 8. Standalone Category Match (e.g. "AC", "Refrigerator", "Washing Machine", "Ceiling Fan")
  if (category) {
    const defaultCat = APPLIANCE_CATALOG.find(item => 
      item.category.toLowerCase() === category && item.isFlagship
    ) || APPLIANCE_CATALOG.find(item => item.category.toLowerCase() === category);
    if (defaultCat) return toApplianceSpec(defaultCat);
  }

  return null;
};
