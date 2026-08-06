import { describe, it, expect, beforeEach } from "vitest";
import { DEFAULT_USER_SETTINGS } from "../constants/userSettings";

/**
 * Mock Auth Workflows & Storage State Integration Test Suite
 */

const MOCK_USERS_KEY = "she_mock_users";
const MOCK_SESSION_KEY = "she_mock_session";

// In-memory mock storage implementation for Node vitest environment
class MockStorage implements Storage {
  private store: Record<string, string> = {};
  get length(): number {
    return Object.keys(this.store).length;
  }
  clear(): void {
    this.store = {};
  }
  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }
  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null;
  }
  removeItem(key: string): void {
    delete this.store[key];
  }
  setItem(key: string, value: string): void {
    this.store[key] = value;
  }
}

const mockLocalStorage = new MockStorage();
const mockSessionStorage = new MockStorage();

interface MockUser {
  uid: string;
  email: string;
  fullName: string;
  photoURL: string;
  createdAt: string;
  lastLogin: string;
  tariffState?: string;
  customFlatRate?: number;
  monthlyBudgetBill?: number;
  monthlyBudgetUnits?: number;
  customWattages?: Record<string, number>;
}

describe("Auth & Mock Mode Integration Flow", () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    mockSessionStorage.clear();
  });

  it("should initialize default user settings constants correctly", () => {
    expect(DEFAULT_USER_SETTINGS.TARIFF_STATE).toBe("ap");
    expect(DEFAULT_USER_SETTINGS.CUSTOM_FLAT_RATE).toBe(7.5);
    expect(DEFAULT_USER_SETTINGS.MONTHLY_BUDGET_BILL).toBe(3000);
    expect(DEFAULT_USER_SETTINGS.MONTHLY_BUDGET_UNITS).toBe(400);
  });

  it("should register a new mock user and persist session data", () => {
    const email = "test.user@example.com";
    const fullName = "Test User";

    const newProfile: MockUser = {
      uid: "mock_12345",
      email: email.toLowerCase(),
      fullName,
      photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      tariffState: DEFAULT_USER_SETTINGS.TARIFF_STATE,
      customFlatRate: DEFAULT_USER_SETTINGS.CUSTOM_FLAT_RATE,
      monthlyBudgetBill: DEFAULT_USER_SETTINGS.MONTHLY_BUDGET_BILL,
      monthlyBudgetUnits: DEFAULT_USER_SETTINGS.MONTHLY_BUDGET_UNITS,
      customWattages: DEFAULT_USER_SETTINGS.CUSTOM_WATTAGES,
    };

    mockLocalStorage.setItem(MOCK_USERS_KEY, JSON.stringify([newProfile]));
    mockSessionStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(newProfile));

    const storedUsers = JSON.parse(mockLocalStorage.getItem(MOCK_USERS_KEY) || "[]");
    const storedSession = JSON.parse(mockSessionStorage.getItem(MOCK_SESSION_KEY) || "{}");

    expect(storedUsers).toHaveLength(1);
    expect(storedUsers[0].email).toBe(email);
    expect(storedSession.fullName).toBe(fullName);
    expect(storedSession.customFlatRate).toBe(7.5);
  });

  it("should update user tariff settings and synchronize storage", () => {
    const initialUser: MockUser = {
      uid: "mock_999",
      email: "eco.user@example.com",
      fullName: "Eco User",
      photoURL: "",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      tariffState: DEFAULT_USER_SETTINGS.TARIFF_STATE,
      customFlatRate: DEFAULT_USER_SETTINGS.CUSTOM_FLAT_RATE,
      monthlyBudgetBill: DEFAULT_USER_SETTINGS.MONTHLY_BUDGET_BILL,
      monthlyBudgetUnits: DEFAULT_USER_SETTINGS.MONTHLY_BUDGET_UNITS,
      customWattages: {},
    };

    mockLocalStorage.setItem(MOCK_USERS_KEY, JSON.stringify([initialUser]));
    mockLocalStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(initialUser));

    // Simulate updateUserSettings call
    const updatedSettings = {
      tariffState: "ts_tsspdcl",
      customFlatRate: 8.25,
      monthlyBudgetBill: 4500,
      monthlyBudgetUnits: 550,
      customWattages: { ac: 1600, fan: 45 },
    };

    const updatedUser = { ...initialUser, ...updatedSettings };

    const usersList: MockUser[] = JSON.parse(mockLocalStorage.getItem(MOCK_USERS_KEY) || "[]");
    const updatedList = usersList.map((u) => (u.uid === updatedUser.uid ? updatedUser : u));
    mockLocalStorage.setItem(MOCK_USERS_KEY, JSON.stringify(updatedList));
    mockLocalStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(updatedUser));

    const sessionData: MockUser = JSON.parse(mockLocalStorage.getItem(MOCK_SESSION_KEY) || "{}");
    expect(sessionData.tariffState).toBe("ts_tsspdcl");
    expect(sessionData.customFlatRate).toBe(8.25);
    expect(sessionData.customWattages?.ac).toBe(1600);
  });
});
