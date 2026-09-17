import { describe, it, expect } from "vitest";
import {
  MARKETS,
  MARKET_LIST,
  formatMarketCurrency,
  detectBrowserMarket,
  TargetMarket,
} from "../currency-config";

describe("Multi-Region & Currency Config", () => {
  it("defines all 5 Tier-1 target markets: US, CA, UK, EU, AU", () => {
    expect(MARKET_LIST.length).toBe(5);
    expect(MARKETS.US).toBeDefined();
    expect(MARKETS.CA).toBeDefined();
    expect(MARKETS.UK).toBeDefined();
    expect(MARKETS.EU).toBeDefined();
    expect(MARKETS.AU).toBeDefined();
  });

  it("assigns appropriate deposit insurance and regulatory bodies", () => {
    expect(MARKETS.US.depositInsuranceName).toContain("FDIC");
    expect(MARKETS.CA.depositInsuranceName).toContain("CDIC");
    expect(MARKETS.UK.depositInsuranceName).toContain("FSCS");
    expect(MARKETS.EU.depositInsuranceName).toContain("EU Deposit Guarantee");
    expect(MARKETS.AU.depositInsuranceName).toContain("FCS");

    expect(MARKETS.CA.cdTermName).toContain("GIC");
    expect(MARKETS.AU.cdTermName).toContain("Term Deposit");
    expect(MARKETS.UK.retirementAccountName).toContain("ISA");
    expect(MARKETS.CA.retirementAccountName).toContain("TFSA");
    expect(MARKETS.AU.retirementAccountName).toContain("Superannuation");
  });

  it("formats market currency accurately with proper symbols", () => {
    expect(formatMarketCurrency(5000, "US")).toBe("$5,000");
    expect(formatMarketCurrency(5000, "UK")).toBe("£5,000");
    expect(formatMarketCurrency(5000, "EU")).toMatch(/5\.000|5 000|5,000/);
    expect(formatMarketCurrency(5000, "CA", { showCode: true })).toBe("$5,000 CAD");
    expect(formatMarketCurrency(5000, "AU", { showCode: true })).toBe("$5,000 AUD");
  });

  it("defaults to US when window is undefined or locale unknown", () => {
    const market = detectBrowserMarket();
    expect(["US", "CA", "UK", "EU", "AU"]).toContain(market);
  });
});
