/**
 * Default User Settings and Tariff Configuration Constants
 */

export const DEFAULT_USER_SETTINGS = {
  TARIFF_STATE: "ap",
  CUSTOM_FLAT_RATE: 7.5,
  MONTHLY_BUDGET_BILL: 3000,
  MONTHLY_BUDGET_UNITS: 400,
  CUSTOM_WATTAGES: {} as Record<string, number>,
} as const;
