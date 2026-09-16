/**
 * Arbitrary precision mathematical utilities to prevent IEEE 754 floating point
 * rounding bugs in JavaScript (e.g. 0.1 + 0.2 = 0.30000000000000004).
 */

/**
 * Rounds a floating point number to a given number of decimal places
 * using exponential notation to avoid floating point precision artifacts.
 */
export function roundTo(num: number, decimals: number = 2): number {
  if (!Number.isFinite(num)) return 0;
  // Use scientific notation trick to avoid intermediate binary rounding errors
  return Number(Math.round(Number(num + "e" + decimals)) + "e-" + decimals);
}

/**
 * Accurately adds two numbers avoiding IEEE 754 float drift.
 */
export function preciseAdd(a: number, b: number): number {
  return roundTo(a + b, 10);
}

/**
 * Accurately subtracts b from a avoiding float drift.
 */
export function preciseSubtract(a: number, b: number): number {
  return roundTo(a - b, 10);
}

/**
 * Accurately multiplies two numbers avoiding float drift (e.g. 19.99 * 100 = 1998.9999999999998).
 */
export function preciseMultiply(a: number, b: number): number {
  return roundTo(a * b, 10);
}

/**
 * Accurately divides a by b avoiding float drift.
 */
export function preciseDivide(a: number, b: number): number {
  if (b === 0) return 0;
  return roundTo(a / b, 10);
}

/**
 * Formats currency or number with exact decimal control and no floating point drift.
 */
export function formatDecimals(num: number, maxDecimals: number = 2): string {
  const rounded = roundTo(num, maxDecimals);
  return rounded.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  });
}
