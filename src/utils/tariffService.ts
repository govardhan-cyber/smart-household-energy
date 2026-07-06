/**
 * Tariff Service — fetches tariffs from Firestore with localStorage cache.
 *
 * Firestore structure:
 *   Collection: tariffs
 *   Documents:  ap, telangana, karnataka, custom
 *
 * Admin flow:
 *   Update a tariff document in Firestore Console → all users get new rates
 *   automatically on next load (within cache TTL of 1 hour).
 */
import { db as rawDb, IS_FIREBASE_CONFIGURED } from "../firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import type { Firestore } from "firebase/firestore";

const db = rawDb as Firestore;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TariffSlab {
  /** Display label, e.g. "0 – 30 units" */
  limit: string;
  /** Rate per unit, e.g. "₹1.90" */
  rate: string;
  /** Max units in this slab (Infinity for the last slab) */
  max: number;
  /** Previous slab upper bound (starting unit for this slab) */
  prev: number;
  /** Numeric rate used in calculations */
  numericRate: number;
}

export interface TariffState {
  key: string;
  name: string;
  /** e.g. "Andhra Pradesh (Domestic LT-I)" */
  displayName: string;
  slabs: TariffSlab[];
  /** Subsidy config */
  subsidy: {
    type: "fixed" | "percentage";
    value: number;
    /** Minimum bill amount to qualify for subsidy (gross charge) */
    minGross?: number;
  };
  todMultipliers?: {
    peak: number;
    normal: number;
    offPeak: number;
  };
  lastUpdated: number; // Unix timestamp ms
}

export interface TariffCache {
  tariffs: Record<string, TariffState>;
  fetchedAt: number;
}

// ─── Default / Fallback Tariffs ───────────────────────────────────────────────

const DEFAULT_TARIFFS: Record<string, TariffState> = {
  ap_apspdcl: {
    key: "ap_apspdcl",
    name: "ap_apspdcl",
    displayName: "Andhra Pradesh (APSPDCL - Southern)",
    slabs: [
      { limit: "0 – 30 units",   rate: "₹1.90", max: 30,   prev: 0,   numericRate: 1.90 },
      { limit: "31 – 75 units",   rate: "₹3.00", max: 45,   prev: 30,  numericRate: 3.00 },
      { limit: "76 – 125 units", rate: "₹4.50", max: 50,   prev: 75,  numericRate: 4.50 },
      { limit: "126 – 225 units",rate: "₹6.00", max: 100,  prev: 125, numericRate: 6.00 },
      { limit: "226 – 400 units",rate: "₹8.75", max: 175,  prev: 225, numericRate: 8.75 },
      { limit: "Above 400 units",rate: "₹9.75", max: Infinity, prev: 400, numericRate: 9.75 },
    ],
    subsidy: { type: "fixed", value: 184.50, minGross: 0 },
    todMultipliers: { peak: 1.25, normal: 1.0, offPeak: 0.85 },
    lastUpdated: Date.now(),
  },
  ap_apepdcl: {
    key: "ap_apepdcl",
    name: "ap_apepdcl",
    displayName: "Andhra Pradesh (APEPDCL - Eastern)",
    slabs: [
      { limit: "0 – 50 units",   rate: "₹2.20", max: 50,   prev: 0,   numericRate: 2.20 },
      { limit: "51 – 100 units",  rate: "₹3.50", max: 50,   prev: 50,  numericRate: 3.50 },
      { limit: "101 – 200 units", rate: "₹4.80", max: 100,  prev: 100, numericRate: 4.80 },
      { limit: "201 – 400 units", rate: "₹7.20", max: 200,  prev: 200, numericRate: 7.20 },
      { limit: "Above 400 units", rate: "₹9.50", max: Infinity, prev: 400, numericRate: 9.50 },
    ],
    subsidy: { type: "fixed", value: 150.00, minGross: 0 },
    lastUpdated: Date.now(),
  },
  ap_apcpdcl: {
    key: "ap_apcpdcl",
    name: "ap_apcpdcl",
    displayName: "Andhra Pradesh (APCPDCL - Central)",
    slabs: [
      { limit: "0 – 30 units",   rate: "₹1.90", max: 30,   prev: 0,   numericRate: 1.90 },
      { limit: "31 – 75 units",   rate: "₹3.00", max: 45,   prev: 30,  numericRate: 3.00 },
      { limit: "76 – 125 units", rate: "₹4.50", max: 50,   prev: 75,  numericRate: 4.50 },
      { limit: "126 – 225 units",rate: "₹6.00", max: 100,  prev: 125, numericRate: 6.00 },
      { limit: "Above 225 units",rate: "₹9.00", max: Infinity, prev: 225, numericRate: 9.00 },
    ],
    subsidy: { type: "fixed", value: 160.00, minGross: 0 },
    lastUpdated: Date.now(),
  },
  telangana_tsspdcl: {
    key: "telangana_tsspdcl",
    name: "telangana_tsspdcl",
    displayName: "Telangana (TSSPDCL Domestic)",
    slabs: [
      { limit: "0 – 50 units",    rate: "₹1.95", max: 50,    prev: 0,   numericRate: 1.95 },
      { limit: "51 – 100 units",  rate: "₹3.10", max: 50,    prev: 50,  numericRate: 3.10 },
      { limit: "101 – 200 units", rate: "₹4.80", max: 100,   prev: 100, numericRate: 4.80 },
      { limit: "201 – 300 units", rate: "₹7.70", max: 100,   prev: 200, numericRate: 7.70 },
      { limit: "301 – 400 units", rate: "₹9.00", max: 100,   prev: 300, numericRate: 9.00 },
      { limit: "401 – 800 units", rate: "₹9.50", max: 400,   prev: 400, numericRate: 9.50 },
      { limit: "Above 800 units", rate: "₹10.00", max: Infinity, prev: 800, numericRate: 10.00 },
    ],
    subsidy: { type: "percentage", value: 13, minGross: 0 },
    lastUpdated: Date.now(),
  },
  telangana_tsnpdcl: {
    key: "telangana_tsnpdcl",
    name: "telangana_tsnpdcl",
    displayName: "Telangana (TSNPDCL Domestic)",
    slabs: [
      { limit: "0 – 50 units",    rate: "₹2.00", max: 50,    prev: 0,   numericRate: 2.00 },
      { limit: "51 – 100 units",  rate: "₹3.20", max: 50,    prev: 50,  numericRate: 3.20 },
      { limit: "101 – 200 units", rate: "₹5.00", max: 100,   prev: 100, numericRate: 5.00 },
      { limit: "201 – 300 units", rate: "₹8.00", max: 100,   prev: 200, numericRate: 8.00 },
      { limit: "Above 300 units", rate: "₹9.50", max: Infinity, prev: 300, numericRate: 9.50 },
    ],
    subsidy: { type: "percentage", value: 10, minGross: 0 },
    lastUpdated: Date.now(),
  },
  karnataka_bescom: {
    key: "karnataka_bescom",
    name: "karnataka_bescom",
    displayName: "Karnataka (BESCOM Domestic)",
    slabs: [
      { limit: "0 – 50 units",    rate: "₹4.15", max: 50,   prev: 0,   numericRate: 4.15 },
      { limit: "51 – 100 units",  rate: "₹5.60", max: 50,   prev: 50,  numericRate: 5.60 },
      { limit: "101 – 200 units", rate: "₹7.15", max: 100,  prev: 100, numericRate: 7.15 },
      { limit: "Above 200 units", rate: "₹8.20", max: Infinity, prev: 200, numericRate: 8.20 },
    ],
    subsidy: { type: "percentage", value: 13, minGross: 0 },
    todMultipliers: { peak: 1.20, normal: 1.0, offPeak: 0.90 },
    lastUpdated: Date.now(),
  },
  karnataka_hescom: {
    key: "karnataka_hescom",
    name: "karnataka_hescom",
    displayName: "Karnataka (HESCOM Domestic)",
    slabs: [
      { limit: "0 – 50 units",    rate: "₹4.00", max: 50,   prev: 0,   numericRate: 4.00 },
      { limit: "51 – 100 units",  rate: "₹5.40", max: 50,   prev: 50,  numericRate: 5.40 },
      { limit: "101 – 200 units", rate: "₹6.90", max: 100,  prev: 100, numericRate: 6.90 },
      { limit: "Above 200 units", rate: "₹8.00", max: Infinity, prev: 200, numericRate: 8.00 },
    ],
    subsidy: { type: "percentage", value: 10, minGross: 0 },
    lastUpdated: Date.now(),
  },
  custom: {
    key: "custom",
    name: "custom",
    displayName: "Custom Tariff",
    slabs: [
      { limit: "All consumption", rate: "₹7.50", max: Infinity, prev: 0, numericRate: 7.50 },
    ],
    subsidy: { type: "percentage", value: 0 },
    lastUpdated: Date.now(),
  },
};

// ─── Cache Helpers ─────────────────────────────────────────────────────────────

const CACHE_KEY = "she_tariff_cache_v2";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function readCache(): TariffCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cache: TariffCache = JSON.parse(raw);
    if (Date.now() - cache.fetchedAt > CACHE_TTL_MS) return null;

    // Restore Infinity values which were serialized as null in JSON
    if (cache.tariffs) {
      Object.values(cache.tariffs).forEach((state) => {
        if (state && Array.isArray(state.slabs)) {
          state.slabs.forEach((s, idx) => {
            if (
              s.max === null ||
              s.max === undefined ||
              s.max === 999999 ||
              (s.max === 0 && idx === state.slabs.length - 1)
            ) {
              s.max = Infinity;
            }
          });
        }
      });
    }

    return cache;
  } catch {
    return null;
  }
}

function writeCache(tariffs: Record<string, TariffState>): void {
  try {
    const cache: TariffCache = { tariffs, fetchedAt: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage might be full — ignore
  }
}

// ─── Firestore Fetch ──────────────────────────────────────────────────────────

/** Firestore document shape (flattened for easy admin editing) */
interface FirestoreTariffDoc {
  displayName: string;
  subsidyType: "fixed" | "percentage";
  subsidyValue: number;
  subsidyMinGross?: number;
  slabs: {
    limit: string;
    rate: string;
    max: number;
    prev: number;
  }[];
  lastUpdated?: number;
}

function firestoreDocToTariff(key: string, data: FirestoreTariffDoc): TariffState {
  return {
    key,
    name: key,
    displayName: data.displayName,
    slabs: data.slabs.map(s => ({
      ...s,
      max: (s.max === null || s.max === undefined || s.max === 999999 || s.max === 0) ? Infinity : s.max,
      numericRate: parseFloat(s.rate.replace(/[₹,\s]/g, "")),
    })),
    subsidy: {
      type: data.subsidyType,
      value: data.subsidyValue,
      minGross: data.subsidyMinGross,
    },
    lastUpdated: data.lastUpdated ?? Date.now(),
  };
}

const ALL_DISCOM_KEYS = [
  "ap_apspdcl",
  "ap_apepdcl",
  "ap_apcpdcl",
  "telangana_tsspdcl",
  "telangana_tsnpdcl",
  "karnataka_bescom",
  "karnataka_hescom",
  "custom"
];

/** Seed default tariff documents into Firestore if they don't exist yet */
async function seedDefaults(): Promise<void> {
  if (!IS_FIREBASE_CONFIGURED || !db) return;

  await Promise.all(
    ALL_DISCOM_KEYS.map(async (key) => {
      try {
        const docRef = doc(db, "tariffs", key);
        const snap = await getDoc(docRef);
        if (!snap.exists()) {
          const defaults = DEFAULT_TARIFFS[key];
          await setDoc(docRef, {
            displayName: defaults.displayName,
            subsidyType: defaults.subsidy.type,
            subsidyValue: defaults.subsidy.value,
            subsidyMinGross: defaults.subsidy.minGross ?? 0,
            slabs: defaults.slabs.map(({ limit, rate, max, prev }) => ({
              limit,
              rate,
              max: max === Infinity ? 999999 : max,
              prev
            })),
            lastUpdated: Date.now(),
          });
          console.info(`[tariffService] Seeded tariff document: "${key}"`);
        }
      } catch (err) {
        console.warn(`[tariffService] Failed to seed tariff "${key}":`, err);
      }
    })
  );
}

async function fetchFromFirestore(): Promise<Record<string, TariffState> | null> {
  if (!IS_FIREBASE_CONFIGURED || !db) return null;

  const result: Record<string, TariffState> = {};
  let anySuccess = false;

  await Promise.all(
    ALL_DISCOM_KEYS.map(async (key) => {
      try {
        const docRef = doc(db, "tariffs", key);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data() as FirestoreTariffDoc;
          result[key] = firestoreDocToTariff(key, data);
          anySuccess = true;
        }
      } catch (err) {
        console.warn(`[tariffService] Failed to fetch tariff "${key}" from Firestore:`, err);
      }
    })
  );

  return anySuccess ? result : null;
}

// ─── Public API ───────────────────────────────────────────────────────────────

let cachedTariffs: Record<string, TariffState> | null = null;
let initPromise: Promise<Record<string, TariffState>> | null = null;

/**
 * Load all tariffs. Uses cache → Firestore → built-in defaults.
 * Subsequent calls return the same resolved object (singleton).
 */
export async function loadTariffs(): Promise<Record<string, TariffState>> {
  if (cachedTariffs) return cachedTariffs;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    // 1. Check localStorage cache
    const cache = readCache();
    if (cache) {
      cachedTariffs = cache.tariffs;
      return cachedTariffs;
    }

    // 1b. Seed Firestore if needed (runs once, non-blocking)
    seedDefaults().catch(() => {});

    // 2. Try Firestore
    const fromFirestore = await fetchFromFirestore();
    if (fromFirestore) {
      cachedTariffs = {
        ...DEFAULT_TARIFFS,
        ...fromFirestore
      };
      writeCache(cachedTariffs);
      return cachedTariffs;
    }

    // 3. Fall back to built-in defaults
    cachedTariffs = DEFAULT_TARIFFS;
    writeCache(cachedTariffs);
    return cachedTariffs;
  })();


  return initPromise;
}

export function normalizeStateKey(key: string): string {
  const k = key || "ap_apspdcl";
  if (k === "ap") return "ap_apspdcl";
  if (k === "telangana") return "telangana_tsspdcl";
  if (k === "karnataka") return "karnataka_bescom";
  return k;
}

/** Get a single tariff by state key. Loads all if not yet loaded. */
export async function getTariff(stateKey: string): Promise<TariffState> {
  const tariffs = await loadTariffs();
  const normalizedKey = normalizeStateKey(stateKey);
  return tariffs[normalizedKey] ?? tariffs["ap_apspdcl"] ?? tariffs["custom"]!;
}

export async function refreshTariffs(): Promise<Record<string, TariffState>> {
  cachedTariffs = null;
  initPromise = null;
  localStorage.removeItem(CACHE_KEY);
  return loadTariffs();
}

/** Save updated tariff details to Firestore and reload cache */
export async function saveTariff(key: string, tariff: TariffState): Promise<void> {
  if (IS_FIREBASE_CONFIGURED && db) {
    try {
      const docRef = doc(db, "tariffs", key);
      await setDoc(docRef, {
        displayName: tariff.displayName,
        subsidyType: tariff.subsidy.type,
        subsidyValue: tariff.subsidy.value,
        subsidyMinGross: tariff.subsidy.minGross ?? 0,
        slabs: tariff.slabs.map(({ limit, rate, max, prev }) => ({
          limit,
          rate,
          max: max === Infinity ? 999999 : max,
          prev
        })),
        lastUpdated: Date.now(),
      });
    } catch (err) {
      console.error(`[tariffService] Failed to save tariff "${key}" to Firestore:`, err);
    }
  }

  // Sync session cache
  const current = await loadTariffs();
  current[key] = {
    ...tariff,
    lastUpdated: Date.now(),
    slabs: tariff.slabs.map(s => ({
      ...s,
      numericRate: parseFloat(s.rate.replace(/[₹,\s]/g, "")),
    }))
  };
  writeCache(current);
}

/** Export defaults for seeding Firestore */
export { DEFAULT_TARIFFS };
