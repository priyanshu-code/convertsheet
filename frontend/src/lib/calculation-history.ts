"use client";

export interface SavedCalculationItem {
  id: string;
  toolSlug: string;
  toolName: string;
  timestamp: number;
  summaryTitle: string;
  summaryMetrics: { label: string; value: string }[];
  path: string;
}

const STORAGE_KEY = "convertsheet_saved_calculations";

function normalizeCalculationItem(item: SavedCalculationItem): SavedCalculationItem {
  if (
    item.toolSlug === "credit-card-payoff-calculator" ||
    item.path?.includes("credit-card-payoff-calculator")
  ) {
    return {
      ...item,
      toolSlug: "debt-payoff-calculator",
      path: item.path?.replace("credit-card-payoff-calculator", "debt-payoff-calculator") || "/tools/debt-payoff-calculator",
    };
  }
  return item;
}

export function getSavedCalculations(): SavedCalculationItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const items: SavedCalculationItem[] = JSON.parse(raw);
    let migrated = false;
    const normalized = items.map((item) => {
      const updated = normalizeCalculationItem(item);
      if (updated.toolSlug !== item.toolSlug || updated.path !== item.path) {
        migrated = true;
      }
      return updated;
    });
    if (migrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    }
    return normalized;
  } catch (err) {
    console.error("Failed to load saved calculations:", err);
    return [];
  }
}

export function saveCalculation(item: Omit<SavedCalculationItem, "id" | "timestamp">): SavedCalculationItem {
  if (typeof window === "undefined") {
    return { ...item, id: "temp", timestamp: Date.now() };
  }
  try {
    const normalizedSlug =
      item.toolSlug === "credit-card-payoff-calculator" ? "debt-payoff-calculator" : item.toolSlug;
    const normalizedPath =
      item.path?.replace("credit-card-payoff-calculator", "debt-payoff-calculator") ||
      `/tools/${normalizedSlug}`;

    const normalizedInput = {
      ...item,
      toolSlug: normalizedSlug,
      path: normalizedPath,
    };

    const existing = getSavedCalculations();
    const newItem: SavedCalculationItem = {
      ...normalizedInput,
      id: `${normalizedSlug}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: Date.now(),
    };
    // Keep last 30 calculations
    const updated = [newItem, ...existing.filter((e) => e.summaryTitle !== item.summaryTitle)].slice(0, 30);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("convertsheet_calculation_saved"));
    return newItem;
  } catch (err) {
    console.error("Failed to save calculation:", err);
    return { ...item, id: "temp", timestamp: Date.now() };
  }
}

export function removeSavedCalculation(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getSavedCalculations();
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("convertsheet_calculation_saved"));
  } catch (err) {
    console.error("Failed to remove saved calculation:", err);
  }
}

export function clearAllSavedCalculations(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("convertsheet_calculation_saved"));
  } catch (err) {
    console.error("Failed to clear saved calculations:", err);
  }
}
