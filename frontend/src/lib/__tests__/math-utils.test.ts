import { describe, it, expect } from "vitest";
import {
  roundTo,
  preciseAdd,
  preciseSubtract,
  preciseMultiply,
  preciseDivide,
  formatDecimals,
} from "../math-utils";

describe("Precise Math Utilities (Anti-IEEE 754 Floating Point Errors)", () => {
  it("solves standard 0.1 + 0.2 floating point bug", () => {
    // Standard JS float error:
    expect(0.1 + 0.2).not.toBe(0.3);
    expect(0.1 + 0.2).toBe(0.30000000000000004);

    // With our preciseAdd / roundTo:
    expect(preciseAdd(0.1, 0.2)).toBe(0.3);
    expect(roundTo(0.1 + 0.2, 2)).toBe(0.3);
  });

  it("handles 0.3 - 0.2 correctly", () => {
    // Standard JS float error: 0.3 - 0.2 = 0.09999999999999998
    expect(0.3 - 0.2).not.toBe(0.1);
    expect(preciseSubtract(0.3, 0.2)).toBe(0.1);
  });

  it("handles decimal multiplication drift like 19.99 * 100", () => {
    // In JS: 19.99 * 100 can sometimes produce 1998.9999999999998
    expect(preciseMultiply(19.99, 100)).toBe(1999);
    expect(preciseMultiply(0.14, 100)).toBe(14);
  });

  it("handles division by zero safely", () => {
    expect(preciseDivide(100, 0)).toBe(0);
  });

  it("formats decimals cleanly without trailing micro-fractions", () => {
    expect(formatDecimals(0.1 + 0.2, 2)).toBe("0.3");
    expect(formatDecimals(1234.5678, 2)).toBe("1,234.57");
  });
});
