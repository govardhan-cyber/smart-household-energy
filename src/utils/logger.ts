/**
 * Centralized Application Logger
 * Suppresses non-critical logs in production builds while providing detailed
 * debugging in development.
 */

const IS_DEV = import.meta.env.DEV;

export const logger = {
  info: (...args: unknown[]): void => {
    if (IS_DEV) {
      console.log("[INFO]", ...args);
    }
  },
  warn: (...args: unknown[]): void => {
    if (IS_DEV) {
      console.warn("[WARN]", ...args);
    }
  },
  error: (...args: unknown[]): void => {
    // Always log errors, even in production
    console.error("[ERROR]", ...args);
  },
  debug: (...args: unknown[]): void => {
    if (IS_DEV) {
      console.debug("[DEBUG]", ...args);
    }
  },
};
