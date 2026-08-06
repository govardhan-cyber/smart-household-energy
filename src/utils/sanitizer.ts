/**
 * Text Input Sanitization and XSS Prevention Utilities
 */

/**
 * Trims input whitespace and strips dangerous HTML tags & scripts.
 */
export function sanitizeInput(input: string): string {
  if (!input) return "";

  return input
    .trim()
    // Strip HTML script tags and content inside them
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Strip HTML style tags and content
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    // Strip remaining HTML tags
    .replace(/<[^>]+>/g, "")
    // Strip javascript: protocols
    .replace(/javascript:/gi, "");
}

/**
 * Sanitizes numeric inputs ensuring safe parsed bounds.
 */
export function sanitizeNumber(input: unknown, defaultValue: number = 0, min?: number, max?: number): number {
  const parsed = typeof input === "number" ? input : parseFloat(String(input));
  if (isNaN(parsed) || !isFinite(parsed)) {
    return defaultValue;
  }
  let result = parsed;
  if (min !== undefined && result < min) result = min;
  if (max !== undefined && result > max) result = max;
  return result;
}
