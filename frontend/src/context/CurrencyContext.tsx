"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import {
  TargetMarket,
  MarketConfig,
  MARKETS,
  DEFAULT_MARKET,
  MARKET_STORAGE_KEY,
  detectBrowserMarket,
  formatMarketCurrency,
} from "@/lib/currency-config";

interface CurrencyContextValue {
  market: TargetMarket;
  marketConfig: MarketConfig;
  currencyCode: string;
  currencySymbol: string;
  setMarket: (market: TargetMarket) => void;
  formatCurrency: (amount: number, options?: { maxDecimals?: number; showCode?: boolean }) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [market, setMarketState] = useState<TargetMarket>(DEFAULT_MARKET);

  // Initialize from localStorage or browser locale
  useEffect(() => {
    try {
      const stored = localStorage.getItem(MARKET_STORAGE_KEY) as TargetMarket;
      if (stored && MARKETS[stored]) {
        setMarketState(stored);
      } else {
        const detected = detectBrowserMarket();
        setMarketState(detected);
      }
    } catch {
      setMarketState(DEFAULT_MARKET);
    }
  }, []);

  const setMarket = useCallback((newMarket: TargetMarket) => {
    if (!MARKETS[newMarket]) return;
    setMarketState(newMarket);
    try {
      localStorage.setItem(MARKET_STORAGE_KEY, newMarket);
    } catch {}
  }, []);

  const marketConfig = useMemo(() => MARKETS[market] || MARKETS.US, [market]);

  const formatCurrency = useCallback(
    (amount: number, options?: { maxDecimals?: number; showCode?: boolean }) => {
      return formatMarketCurrency(amount, market, options);
    },
    [market]
  );

  const value = useMemo(
    () => ({
      market,
      marketConfig,
      currencyCode: marketConfig.currencyCode,
      currencySymbol: marketConfig.currencySymbol,
      setMarket,
      formatCurrency,
    }),
    [market, marketConfig, setMarket, formatCurrency]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  const context = useContext(CurrencyContext);
  if (!context) {
    // Fallback if rendered outside provider (e.g. in standalone tests)
    const fallbackConfig = MARKETS.US;
    return {
      market: "US",
      marketConfig: fallbackConfig,
      currencyCode: fallbackConfig.currencyCode,
      currencySymbol: fallbackConfig.currencySymbol,
      setMarket: () => {},
      formatCurrency: (amt: number, opts) => formatMarketCurrency(amt, "US", opts),
    };
  }
  return context;
}
