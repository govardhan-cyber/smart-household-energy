import { describe, it, expect, beforeEach } from 'vitest';
import { parseApplianceQuery, isApplianceQuery } from './applianceParser';
import { estimateFromFallback, validateSpec } from './energyEstimator';
import { normalizeQuery, getCachedResult, setCachedResult, clearApplianceCache } from './cacheService';
import { searchAppliance } from './searchService';
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

  it('returns false for isApplianceQuery on general chat prompt', () => {
    const parsed = parseApplianceQuery('How can I save money on my electricity bill?');
    expect(isApplianceQuery(parsed)).toBe(false);
  });
});

describe('Energy Estimator', () => {
  it('estimates wattage from fallback for AC', () => {
    const parsed = parseApplianceQuery('LG 1.5 Ton AC');
    const spec = estimateFromFallback(parsed);
    expect(spec.category).toBe('Air Conditioner');
    expect(spec.ratedPowerW).toBe(1500);
    expect(spec.confidence).toBe('low');
    expect(spec.auditCategory).toBe('ac');
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
});
