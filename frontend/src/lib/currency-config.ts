/**
 * Multi-Region & Currency Configuration for ConvertSheet
 * Targets Tier-1 Markets: US 🇺🇸, Canada 🇨🇦, UK 🇬🇧, EU 🇪🇺, Australia 🇦🇺
 */

export type TargetMarket = "US" | "CA" | "UK" | "EU" | "AU";

export interface MarketConfig {
  code: TargetMarket;
  name: string;
  flag: string;
  currencyCode: string;
  currencySymbol: string;
  locale: string;
  depositInsuranceName: string;
  depositInsuranceLimit: string;
  regulatoryBody: string;
  defaultSavingsApy: number;
  benchmarkLoanApr: number;
  cdTermName: string; // e.g. "Certificate of Deposit (CD)" vs "GIC" vs "Term Deposit"
  retirementAccountName: string; // e.g. "401(k) / Roth IRA" vs "TFSA / RRSP" vs "ISA" vs "Superannuation"
}

export const MARKETS: Record<TargetMarket, MarketConfig> = {
  US: {
    code: "US",
    name: "United States",
    flag: "🇺🇸",
    currencyCode: "USD",
    currencySymbol: "$",
    locale: "en-US",
    depositInsuranceName: "FDIC Insured",
    depositInsuranceLimit: "$250,000",
    regulatoryBody: "CFPB & Federal Reserve",
    defaultSavingsApy: 4.60,
    benchmarkLoanApr: 8.49,
    cdTermName: "Certificate of Deposit (CD)",
    retirementAccountName: "401(k) & Roth IRA",
  },
  CA: {
    code: "CA",
    name: "Canada",
    flag: "🇨🇦",
    currencyCode: "CAD",
    currencySymbol: "$",
    locale: "en-CA",
    depositInsuranceName: "CDIC Protected",
    depositInsuranceLimit: "$100,000 CAD",
    regulatoryBody: "FCAC & Bank of Canada",
    defaultSavingsApy: 3.85,
    benchmarkLoanApr: 7.99,
    cdTermName: "Guaranteed Investment Cert (GIC)",
    retirementAccountName: "TFSA & RRSP",
  },
  UK: {
    code: "UK",
    name: "United Kingdom",
    flag: "🇬🇧",
    currencyCode: "GBP",
    currencySymbol: "£",
    locale: "en-GB",
    depositInsuranceName: "FSCS Protected",
    depositInsuranceLimit: "£85,000",
    regulatoryBody: "FCA & Bank of England",
    defaultSavingsApy: 4.75,
    benchmarkLoanApr: 6.99,
    cdTermName: "Fixed-Rate Bond / Cash ISA",
    retirementAccountName: "Stocks & Shares ISA",
  },
  EU: {
    code: "EU",
    name: "European Union",
    flag: "🇪🇺",
    currencyCode: "EUR",
    currencySymbol: "€",
    locale: "de-DE",
    depositInsuranceName: "EU Deposit Guarantee Scheme",
    depositInsuranceLimit: "€100,000",
    regulatoryBody: "ECB & National Regulators",
    defaultSavingsApy: 3.40,
    benchmarkLoanApr: 6.50,
    cdTermName: "Fixed Term Deposit",
    retirementAccountName: "Pan-European Pension (PEPP)",
  },
  AU: {
    code: "AU",
    name: "Australia",
    flag: "🇦🇺",
    currencyCode: "AUD",
    currencySymbol: "$",
    locale: "en-AU",
    depositInsuranceName: "Govt FCS Guaranteed",
    depositInsuranceLimit: "$250,000 AUD",
    regulatoryBody: "ASIC & Reserve Bank of Australia",
    defaultSavingsApy: 4.80,
    benchmarkLoanApr: 7.49,
    cdTermName: "Term Deposit",
    retirementAccountName: "Superannuation",
  },
};

export const MARKET_LIST = Object.values(MARKETS);

export const DEFAULT_MARKET: TargetMarket = "US";

export const MARKET_STORAGE_KEY = "convertsheet-target-market";

/**
 * Detects the user's preferred market from the browser's navigator.language or locale
 */
export function detectBrowserMarket(): TargetMarket {
  if (typeof window === "undefined" || !window.navigator) {
    return DEFAULT_MARKET;
  }

  const lang = (window.navigator.language || "").toUpperCase();

  if (lang.includes("CA") || lang.endsWith("-CA")) return "CA";
  if (lang.includes("GB") || lang.endsWith("-GB") || lang.includes("UK")) return "UK";
  if (lang.includes("AU") || lang.endsWith("-AU")) return "AU";
  if (
    lang.includes("DE") ||
    lang.includes("FR") ||
    lang.includes("IT") ||
    lang.includes("ES") ||
    lang.includes("NL") ||
    lang.includes("BE") ||
    lang.includes("AT") ||
    lang.includes("IE")
  ) {
    return "EU";
  }

  return "US";
}

/**
 * Format a numeric amount using the specified market's currency symbol and formatting
 */
export function formatMarketCurrency(
  amount: number,
  marketCode: TargetMarket = DEFAULT_MARKET,
  options: { maxDecimals?: number; showCode?: boolean } = {}
): string {
  const market = MARKETS[marketCode] || MARKETS.US;
  const maxDecimals = options.maxDecimals ?? 0;

  const formatted = amount.toLocaleString(market.locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  });

  const withSymbol = `${market.currencySymbol}${formatted}`;

  if (options.showCode && (market.currencyCode === "CAD" || market.currencyCode === "AUD")) {
    return `${withSymbol} ${market.currencyCode}`;
  }

  return withSymbol;
}
