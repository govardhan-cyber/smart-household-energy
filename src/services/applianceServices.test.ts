import { describe, it, expect, beforeEach } from 'vitest';
import { parseApplianceQuery, isApplianceQuery } from './applianceParser';
import { estimateFromFallback, validateSpec } from './energyEstimator';
import { normalizeQuery, getCachedResult, setCachedResult, clearApplianceCache } from './cacheService';
import { searchAppliance } from './searchService';
import { findInCatalog, APPLIANCE_CATALOG } from './applianceCatalog';
import type { ApplianceSpec } from './energyEstimator';

describe('Appliance Parser', () => {
  it('detects brand, model, and category for Samsung Refrigerator', () => {
    const query = 'Samsung RT28T3523S8 Refrigerator';
    const parsed = parseApplianceQuery(query);
    expect(parsed.brand).toBe('Samsung');
    expect(parsed.category).toBe('Refrigerator');
    expect(parsed.model).toBe('RT28T3523S8');
    expect(isApplianceQuery(parsed)).toBe(true);
  });

  it('detects capacity, technology, and category for LG AC', () => {
    const query = 'LG 1.5 Ton Dual Inverter AC';
    const parsed = parseApplianceQuery(query);
    expect(parsed.brand).toBe('LG');
    expect(parsed.category).toBe('Air Conditioner');
    expect(parsed.capacity).toBe('1.5 ton');
    expect(parsed.technology).toBe('dual inverter');
    expect(isApplianceQuery(parsed)).toBe(true);
  });

  it('detects appliance query with find/search prefixes', () => {
    const parsedLg = parseApplianceQuery('find appliance LG AC');
    expect(parsedLg.brand).toBe('LG');
    expect(parsedLg.category).toBe('Air Conditioner');
    expect(isApplianceQuery(parsedLg)).toBe(true);

    const parsedFridge = parseApplianceQuery('find refrigerator');
    expect(parsedFridge.category).toBe('Refrigerator');
    expect(isApplianceQuery(parsedFridge)).toBe(true);

    const parsedWattage = parseApplianceQuery('what is the wattage of LG AC');
    expect(parsedWattage.brand).toBe('LG');
    expect(parsedWattage.category).toBe('Air Conditioner');
    expect(isApplianceQuery(parsedWattage)).toBe(true);
  });

  it('detects standalone appliance categories as valid appliance queries', () => {
    const parsedAc = parseApplianceQuery('AC');
    expect(parsedAc.category).toBe('Air Conditioner');
    expect(isApplianceQuery(parsedAc)).toBe(true);

    const parsedWasher = parseApplianceQuery('washing machine');
    expect(parsedWasher.category).toBe('Washing Machine');
    expect(isApplianceQuery(parsedWasher)).toBe(true);

    const parsedFan = parseApplianceQuery('ceiling fan');
    expect(parsedFan.category).toBe('Fan');
    expect(isApplianceQuery(parsedFan)).toBe(true);
  });

  it('returns false for isApplianceQuery on general chat prompt', () => {
    const parsed = parseApplianceQuery('How can I save money on my electricity bill?');
    expect(isApplianceQuery(parsed)).toBe(false);
  });

  it('returns false for conversational queries mentioning appliances to prevent hijacking AI chat', () => {
    const parsedAc = parseApplianceQuery('How can I reduce my AC bill?');
    expect(isApplianceQuery(parsedAc)).toBe(false);

    const parsedFridge = parseApplianceQuery('Why is my fridge using so much power?');
    expect(isApplianceQuery(parsedFridge)).toBe(false);

    const parsedTips = parseApplianceQuery('What are the best tips to lower refrigerator electricity consumption?');
    expect(isApplianceQuery(parsedTips)).toBe(false);
  });
});

describe('Energy Estimator', () => {
  it('estimates wattage and benchmark confidence from fallback for AC', () => {
    const parsed = parseApplianceQuery('LG 1.5 Ton AC');
    const spec = estimateFromFallback(parsed);
    expect(spec.category).toBe('Air Conditioner');
    expect(spec.ratedPowerW).toBe(1500);
    expect(spec.confidence).toBe('medium');
    expect(spec.energyStarRating).toBe(3);
    expect(spec.auditCategory).toBe('ac');
  });

  it('assigns low confidence in fallback for unrecognized generic appliances', () => {
    const parsed = parseApplianceQuery('Generic Smart Gadget');
    const spec = estimateFromFallback(parsed);
    expect(spec.confidence).toBe('low');
    expect(spec.confidenceReason).toContain('fallback database');
  });

  it('sanitizes and clamps invalid values in validateSpec', () => {
    const rawSpec: ApplianceSpec = {
      name: 'Test',
      brand: 'TestBrand',
      model: 'M1',
      category: 'Fan',
      ratedPowerW: 20000, // Invalid high
      operatingPowerW: null,
      standbyPowerW: null,
      annualEnergyKwh: 50000, // Invalid high
      energyStarRating: 7, // Invalid high
      capacity: null,
      voltage: '230V',
      productUrl: null,
      imageUrl: null,
      confidence: 'low',
      confidenceReason: 'Test',
      source: 'Test',
      suggestedDailyHours: 8,
      auditCategory: 'fan'
    };

    const sanitized = validateSpec(rawSpec);
    expect(sanitized.ratedPowerW).toBe(15000);
    expect(sanitized.annualEnergyKwh).toBe(15000);
    expect(sanitized.energyStarRating).toBe(5);
  });
});

describe('Cache Service', () => {
  beforeEach(() => {
    clearApplianceCache();
  });

  it('normalizes queries by stripping special chars and spaces', () => {
    expect(normalizeQuery('  Samsung   RT28T3523S8!  ')).toBe('samsung rt28t3523s8');
  });

  it('stores and retrieves cached appliance spec', () => {
    const mockSpec: ApplianceSpec = {
      name: 'Samsung Ref',
      brand: 'Samsung',
      model: 'RT28',
      category: 'Refrigerator',
      ratedPowerW: 200,
      operatingPowerW: 160,
      standbyPowerW: 2,
      annualEnergyKwh: 300,
      energyStarRating: 3,
      capacity: '253L',
      voltage: '230V',
      productUrl: null,
      imageUrl: null,
      confidence: 'high',
      confidenceReason: 'Mock test',
      source: 'Test',
      suggestedDailyHours: 24,
      auditCategory: 'fridge'
    };

    setCachedResult('Samsung Refrigerator', mockSpec);
    const retrieved = getCachedResult('samsung refrigerator');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.name).toBe('Samsung Ref');
  });
});

describe('Search Service Pipeline', () => {
  beforeEach(() => {
    clearApplianceCache();
  });

  it('calls Gemini API proxy and parses JSON response', async () => {
    const mockQueryGemini = async () => JSON.stringify({
      name: 'Samsung RT28T3523S8 Refrigerator',
      brand: 'Samsung',
      model: 'RT28T3523S8',
      category: 'Refrigerator',
      ratedPowerW: 230,
      operatingPowerW: 180,
      annualEnergyKwh: 260,
      energyStarRating: 3,
      confidence: 'high',
      confidenceReason: 'Official website spec matched',
      source: 'Samsung India'
    });

    const result = await searchAppliance('Samsung RT28T3523S8 Refrigerator', mockQueryGemini);
    expect(result.fromCache).toBe(false);
    expect(result.spec.ratedPowerW).toBe(230);
    expect(result.spec.confidence).toBe('high');
    expect(result.spec.auditCategory).toBe('fridge');
  });

  it('returns cached result on repeated query', async () => {
    let callCount = 0;
    const mockQueryGemini = async () => {
      callCount++;
      return JSON.stringify({
        name: 'Dell Inspiron 15',
        brand: 'Dell',
        model: 'Inspiron 15',
        category: 'Laptop',
        ratedPowerW: 65,
        confidence: 'high',
        source: 'Dell'
      });
    };

    await searchAppliance('Dell Inspiron 15', mockQueryGemini);
    const cachedResult = await searchAppliance('dell inspiron 15', mockQueryGemini);
    expect(cachedResult.fromCache).toBe(true);
    expect(callCount).toBe(1);
  });

  it('resiliently extracts JSON when wrapped in markdown code fences or conversational text', async () => {
    const wrappedMock = async () => `Here is the requested specification from the manufacturer database:
\`\`\`json
{
  "name": "LG 1.5 Ton Dual Inverter AC",
  "brand": "LG",
  "model": "MS-Q18YNZA",
  "category": "Air Conditioner",
  "ratedPowerW": 1450,
  "annualEnergyKwh": 830,
  "energyStarRating": 5,
  "confidence": "high",
  "source": "LG Electronics"
}
\`\`\`
Hope this helps!`;

    const result = await searchAppliance('LG 1.5 Ton Dual Inverter AC', wrappedMock);
    expect(result.spec.name).toBe('LG 1.5 Ton Dual Inverter AC');
    expect(result.spec.ratedPowerW).toBe(1450);
    expect(result.spec.energyStarRating).toBe(5);
    expect(result.spec.confidence).toBe('high');
    expect(result.spec.auditCategory).toBe('ac');
  });

  it('falls back to curated catalog with high confidence when Gemini API fails', async () => {
    const failingMock = async () => {
      throw new Error('Firebase / Gemini API unreachable (unauthenticated)');
    };

    const result = await searchAppliance('LG Air Conditioner', failingMock);
    expect(result.fromCache).toBe(false);
    expect(result.spec.name).toContain('LG 1.5 Ton 5-Star Dual Inverter');
    expect(result.spec.ratedPowerW).toBe(1450);
    expect(result.spec.annualEnergyKwh).toBe(830);
    expect(result.spec.energyStarRating).toBe(5);
    expect(result.spec.confidence).toBe('high');
    expect(result.spec.confidenceReason).toContain('BEE India');
    expect(result.spec.source).toContain('LG Electronics');
    expect(result.spec.auditCategory).toBe('ac');
  });

  it('upgrades low-confidence Gemini responses using verified catalog data', async () => {
    const lowConfidenceMock = async () => JSON.stringify({
      name: 'LG AC',
      brand: 'LG',
      category: 'Air Conditioner',
      confidence: 'low',
      confidenceReason: 'Vague query model approximation'
    });

    const result = await searchAppliance('LG AC', lowConfidenceMock);
    expect(result.spec.confidence).toBe('high');
    expect(result.spec.energyStarRating).toBe(5);
    expect(result.spec.ratedPowerW).toBe(1450);
  });
});

describe('Curated Appliance Catalog (Offline Database)', () => {
  it('contains over 40 verified Indian and global appliance models', () => {
    expect(APPLIANCE_CATALOG.length).toBeGreaterThan(40);
  });

  it('matches brand + category queries to verified flagship models with high confidence', () => {
    const lgAcParsed = parseApplianceQuery('LG Air Conditioner');
    const lgAcSpec = findInCatalog('LG Air Conditioner', lgAcParsed);
    expect(lgAcSpec).not.toBeNull();
    expect(lgAcSpec?.name).toContain('LG 1.5 Ton 5-Star Dual Inverter Split AC');
    expect(lgAcSpec?.ratedPowerW).toBe(1450);
    expect(lgAcSpec?.annualEnergyKwh).toBe(830);
    expect(lgAcSpec?.energyStarRating).toBe(5);
    expect(lgAcSpec?.confidence).toBe('high');

    const samsungFridgeParsed = parseApplianceQuery('Samsung Refrigerator');
    const samsungFridgeSpec = findInCatalog('Samsung Refrigerator', samsungFridgeParsed);
    expect(samsungFridgeSpec).not.toBeNull();
    expect(samsungFridgeSpec?.ratedPowerW).toBe(190);
    expect(samsungFridgeSpec?.annualEnergyKwh).toBe(240);
    expect(samsungFridgeSpec?.energyStarRating).toBe(3);
    expect(samsungFridgeSpec?.confidence).toBe('high');
  });

  it('matches popular preset queries with high precision', () => {
    // 1. LG 1.5 Ton Dual Inverter AC
    const acParsed = parseApplianceQuery('LG 1.5 Ton Dual Inverter AC');
    const acSpec = findInCatalog('LG 1.5 Ton Dual Inverter AC', acParsed);
    expect(acSpec?.ratedPowerW).toBe(1450);
    expect(acSpec?.energyStarRating).toBe(5);

    // 2. Samsung 253L Refrigerator
    const fridgeParsed = parseApplianceQuery('Samsung 253L Refrigerator');
    const fridgeSpec = findInCatalog('Samsung 253L Refrigerator', fridgeParsed);
    expect(fridgeSpec?.ratedPowerW).toBe(190);
    expect(fridgeSpec?.capacity).toBe('253 L');

    // 3. Crompton BLDC Ceiling Fan
    const fanParsed = parseApplianceQuery('Crompton BLDC Ceiling Fan');
    const fanSpec = findInCatalog('Crompton BLDC Ceiling Fan', fanParsed);
    expect(fanSpec?.ratedPowerW).toBe(28);
    expect(fanSpec?.energyStarRating).toBe(5);

    // 4. Whirlpool 7kg Washing Machine
    const washerParsed = parseApplianceQuery('Whirlpool 7kg Washing Machine');
    const washerSpec = findInCatalog('Whirlpool 7kg Washing Machine', washerParsed);
    expect(washerSpec?.ratedPowerW).toBe(360);
    expect(washerSpec?.energyStarRating).toBe(5);

    // 5. Havells 15L Water Heater
    const geyserParsed = parseApplianceQuery('Havells 15L Water Heater');
    const geyserSpec = findInCatalog('Havells 15L Water Heater', geyserParsed);
    expect(geyserSpec?.ratedPowerW).toBe(2000);
    expect(geyserSpec?.energyStarRating).toBe(5);

    // 6. Dell Inspiron 15 Laptop
    const laptopParsed = parseApplianceQuery('Dell Inspiron 15 Laptop');
    const laptopSpec = findInCatalog('Dell Inspiron 15 Laptop', laptopParsed);
    expect(laptopSpec?.ratedPowerW).toBe(65);
    expect(laptopSpec?.category).toBe('Laptop');
  });

  it('matches other major brands (Voltas, Daikin, Atomberg, Sony, Apple, Kirloskar)', () => {
    const voltas = findInCatalog('Voltas 1.5 Ton AC', parseApplianceQuery('Voltas 1.5 Ton AC'));
    expect(voltas?.ratedPowerW).toBe(1430);

    const daikin = findInCatalog('Daikin AC', parseApplianceQuery('Daikin AC'));
    expect(daikin?.ratedPowerW).toBe(1380);

    const atomberg = findInCatalog('Atomberg BLDC Fan', parseApplianceQuery('Atomberg BLDC Fan'));
    expect(atomberg?.ratedPowerW).toBe(28);

    const macbook = findInCatalog('Apple MacBook Air', parseApplianceQuery('Apple MacBook Air'));
    expect(macbook?.ratedPowerW).toBe(35);

    const sony = findInCatalog('Sony 55 inch TV', parseApplianceQuery('Sony 55 inch TV'));
    expect(sony?.ratedPowerW).toBe(115);

    const pump = findInCatalog('Kirloskar Water Pump', parseApplianceQuery('Kirloskar Water Pump'));
    expect(pump?.ratedPowerW).toBe(750);
  });
});

