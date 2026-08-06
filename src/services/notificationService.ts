export interface NotificationItem {
  id: string;
  type: "alert" | "solar" | "ai" | "report";
  title: string;
  message: string;
  time: string;
  read: boolean;
  createdAt: number;
}

const NOTIFICATIONS_STORAGE_KEY = "she_notifications_v2";

export const getInitialNotifications = (): NotificationItem[] => {
  const notifyHigh = localStorage.getItem("she_notify_high") !== "false";
  const solarAlerts = localStorage.getItem("she_solar_alerts") !== "false";
  const aiTips = localStorage.getItem("she_ai_tips") === "true";
  const monthlyReports = localStorage.getItem("she_monthly_reports") !== "false";

  const list: NotificationItem[] = [];
  const now = Date.now();

  if (notifyHigh) {
    list.push({
      id: "notif_high_usage",
      type: "alert",
      title: "Usage Alert",
      message: "Comfort appliances (AC/Heater) are running 15% above baseline.",
      time: "2 min ago",
      read: false,
      createdAt: now - 120000
    });
  }

  if (solarAlerts) {
    list.push({
      id: "notif_solar_yield",
      type: "solar",
      title: "Solar Yield Peak",
      message: "Daily generation peaked at 14.8 kWh today (Optimal).",
      time: "1 hour ago",
      read: false,
      createdAt: now - 3600000
    });
  }

  if (aiTips) {
    list.push({
      id: "notif_ai_tip",
      type: "ai",
      title: "AI Energy Tip",
      message: "Turn down Refrigerator dial to 4°C to save 8% power.",
      time: "3 hours ago",
      read: false,
      createdAt: now - 10800000
    });
  }

  if (monthlyReports) {
    list.push({
      id: "notif_monthly_report",
      type: "report",
      title: "Monthly Report",
      message: "Slab charge analysis is ready for view.",
      time: "1 day ago",
      read: true,
      createdAt: now - 86400000
    });
  }

  return list;
};

export const loadStoredNotifications = (): NotificationItem[] => {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as NotificationItem[];
    }
  } catch (err) {
    console.error("Failed to load notifications from storage:", err);
  }
  const initial = getInitialNotifications();
  saveNotifications(initial);
  return initial;
};

export const saveNotifications = (items: NotificationItem[]): void => {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error("Failed to save notifications to storage:", err);
  }
};

export const markNotificationRead = (id: string, current: NotificationItem[]): NotificationItem[] => {
  const updated = current.map(item => item.id === id ? { ...item, read: true } : item);
  saveNotifications(updated);
  return updated;
};

export const markAllNotificationsRead = (current: NotificationItem[]): NotificationItem[] => {
  const updated = current.map(item => ({ ...item, read: true }));
  saveNotifications(updated);
  return updated;
};

export const removeNotification = (id: string, current: NotificationItem[]): NotificationItem[] => {
  const updated = current.filter(item => item.id !== id);
  saveNotifications(updated);
  return updated;
};

export const clearAllNotifications = (): NotificationItem[] => {
  saveNotifications([]);
  return [];
};
