import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Sanitizes an Excel sheet name by removing characters disallowed by Excel ([\\/?*[\]:]),
 * truncating to a maximum of 31 characters, and defaulting to "Sheet1".
 */
export function sanitizeSheetName(name?: string): string {
  if (!name || typeof name !== "string") {
    return "Sheet1";
  }

  // Remove invalid Excel sheet name characters: \ / ? * [ ] :
  const cleaned = name.replace(/[\\/?*[\]:]/g, "").trim();

  if (!cleaned) {
    return "Sheet1";
  }

  // Excel sheet names have a maximum length of 31 characters
  return cleaned.slice(0, 31);
}
