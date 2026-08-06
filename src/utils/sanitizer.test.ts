import { describe, it, expect } from "vitest";
import { sanitizeInput, sanitizeNumber } from "./sanitizer";

describe("Input Sanitizer Utility", () => {
  it("should strip script tags and HTML markup from user strings", () => {
    const maliciousInput = "<script>alert('xss')</script>Hello <b>World</b>";
    const cleanOutput = sanitizeInput(maliciousInput);
    expect(cleanOutput).toBe("Hello World");
    expect(cleanOutput).not.toContain("<script>");
  });

  it("should strip javascript: protocol handles", () => {
    const maliciousLink = "javascript:alert(document.cookie)";
    const cleanOutput = sanitizeInput(maliciousLink);
    expect(cleanOutput).toBe("alert(document.cookie)");
  });

  it("should trim excess whitespace", () => {
    expect(sanitizeInput("   test message   ")).toBe("test message");
  });

  it("should safely sanitize numbers within bounds", () => {
    expect(sanitizeNumber("150", 0, 0, 1000)).toBe(150);
    expect(sanitizeNumber("invalid", 50)).toBe(50);
    expect(sanitizeNumber(-10, 0, 0, 100)).toBe(0);
    expect(sanitizeNumber(500, 0, 0, 300)).toBe(300);
  });
});
