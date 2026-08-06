import { describe, it, expect, beforeEach } from "vitest";
import {
  getInitialNotifications,
  loadStoredNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  removeNotification,
  clearAllNotifications
} from "./notificationService";

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

if (typeof globalThis.localStorage === "undefined") {
  (globalThis as unknown as { localStorage: Storage }).localStorage = new MockStorage();
}

describe("notificationService", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should return default notifications when storage is empty", () => {
    const list = getInitialNotifications();
    expect(list.length).toBeGreaterThan(0);
    expect(list[0]).toHaveProperty("title");
    expect(list[0]).toHaveProperty("type");
  });

  it("should load stored notifications from localStorage", () => {
    const loaded = loadStoredNotifications();
    expect(loaded.length).toBeGreaterThan(0);
  });

  it("should mark a single notification as read", () => {
    const initial = loadStoredNotifications();
    const targetId = initial[0].id;
    const updated = markNotificationRead(targetId, initial);
    expect(updated.find(n => n.id === targetId)?.read).toBe(true);
  });

  it("should mark all notifications as read", () => {
    const initial = loadStoredNotifications();
    const updated = markAllNotificationsRead(initial);
    expect(updated.every(n => n.read)).toBe(true);
  });

  it("should remove a specific notification by ID", () => {
    const initial = loadStoredNotifications();
    const targetId = initial[0].id;
    const count = initial.length;
    const updated = removeNotification(targetId, initial);
    expect(updated.length).toBe(count - 1);
    expect(updated.find(n => n.id === targetId)).toBeUndefined();
  });

  it("should clear all notifications", () => {
    const cleared = clearAllNotifications();
    expect(cleared.length).toBe(0);
  });
});
