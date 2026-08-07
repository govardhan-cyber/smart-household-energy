import type { ApplianceSpec } from './energyEstimator';

const CACHE_PREFIX = 'she_appliance_cache_';
const memoryCache = new Map<string, ApplianceSpec>();

const isStorageAvailable = (): boolean => {
  try {
    return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
  } catch {
    return false;
  }
};

/**
 * Normalizes a query string for caching keys.
 */
export const normalizeQuery = (query: string): string => {
  return query.toLowerCase().trim().replace(/\s+/g, ' ').replace(/[^\w\s]/gi, '');
};

/**
 * Retrieves a cached appliance result from session storage or memory.
 */
export const getCachedResult = (query: string): ApplianceSpec | null => {
  const key = CACHE_PREFIX + normalizeQuery(query);
  if (isStorageAvailable()) {
    try {
      const cached = window.sessionStorage.getItem(key);
      if (cached) {
        return JSON.parse(cached) as ApplianceSpec;
      }
    } catch (err) {
      console.error('Failed to parse cached appliance', err);
    }
  }
  return memoryCache.get(key) || null;
};

/**
 * Stores an appliance result in session storage cache and memory.
 */
export const setCachedResult = (query: string, result: ApplianceSpec): void => {
  const key = CACHE_PREFIX + normalizeQuery(query);
  memoryCache.set(key, result);
  if (isStorageAvailable()) {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(result));
    } catch (err) {
      console.error('Failed to cache appliance result', err);
    }
  }
};

/**
 * Clears all appliance search results from session storage and memory.
 */
export const clearApplianceCache = (): void => {
  memoryCache.clear();
  if (isStorageAvailable()) {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const key = window.sessionStorage.key(i);
        if (key && key.startsWith(CACHE_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => window.sessionStorage.removeItem(key));
    } catch (err) {
      console.error('Failed to clear appliance cache', err);
    }
  }
};

