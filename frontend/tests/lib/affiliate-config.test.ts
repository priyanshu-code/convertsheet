import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  isAffiliateEnabled,
  getAffiliatePartnerLink,
  AFFILIATE_DISCLOSURE,
  AffiliateCategory,
} from "@/lib/affiliate-config";

describe("Pluggable Affiliate Configuration Layer", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.NEXT_PUBLIC_AFFILIATE_ENABLED;
    delete process.env.NEXT_PUBLIC_AFFILIATE_UTM_SOURCE;
    delete process.env.NEXT_PUBLIC_AFFILIATE_UTM_CAMPAIGN;
    delete process.env.NEXT_PUBLIC_AFFILIATE_REF;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("is dormant by default (isAffiliateEnabled is false)", () => {
    expect(isAffiliateEnabled()).toBe(false);

    process.env.NEXT_PUBLIC_AFFILIATE_ENABLED = "false";
    expect(isAffiliateEnabled()).toBe(false);

    process.env.NEXT_PUBLIC_AFFILIATE_ENABLED = "0";
    expect(isAffiliateEnabled()).toBe(false);
  });

  it("becomes active when NEXT_PUBLIC_AFFILIATE_ENABLED is 'true'", () => {
    process.env.NEXT_PUBLIC_AFFILIATE_ENABLED = "true";
    expect(isAffiliateEnabled()).toBe(true);
  });

  it("returns fallbackUrl clean with no tracking tags when disabled", () => {
    const fallbackUrl = "https://www.bankrate.com/mortgages/mortgage-rates/";
    const result = getAffiliatePartnerLink({
      category: "mortgage",
      fallbackUrl,
      loanAmount: 400000,
    });

    expect(result).toBe(fallbackUrl);
  });

  it("appends tracking query parameters when enabled via environment variable", () => {
    process.env.NEXT_PUBLIC_AFFILIATE_ENABLED = "true";
    const fallbackUrl = "https://www.bankrate.com/mortgages/mortgage-rates/";

    const result = getAffiliatePartnerLink({
      category: "mortgage",
      fallbackUrl,
      loanAmount: 400000,
    });

    const parsed = new URL(result);
    expect(parsed.origin + parsed.pathname).toBe(fallbackUrl);
    expect(parsed.searchParams.get("utm_source")).toBe("convertsheet");
    expect(parsed.searchParams.get("utm_medium")).toBe("affiliate");
    expect(parsed.searchParams.get("utm_campaign")).toBe("mortgage");
    expect(parsed.searchParams.get("ref")).toBe("convertsheet");
    expect(parsed.searchParams.get("loanAmount")).toBe("400000");
  });

  it("allows custom UTM parameters and ref from environment variables", () => {
    process.env.NEXT_PUBLIC_AFFILIATE_ENABLED = "true";
    process.env.NEXT_PUBLIC_AFFILIATE_UTM_SOURCE = "partner_hub";
    process.env.NEXT_PUBLIC_AFFILIATE_UTM_CAMPAIGN = "spring_promo";
    process.env.NEXT_PUBLIC_AFFILIATE_REF = "custom_ref_id";

    const fallbackUrl = "https://www.bankrate.com/loans/auto-loans/rates/";
    const result = getAffiliatePartnerLink({
      category: "auto_loan",
      fallbackUrl,
    });

    const parsed = new URL(result);
    expect(parsed.searchParams.get("utm_source")).toBe("partner_hub");
    expect(parsed.searchParams.get("utm_campaign")).toBe("spring_promo");
    expect(parsed.searchParams.get("ref")).toBe("custom_ref_id");
  });

  it("preserves existing query parameters in the fallbackUrl when appending affiliate tags", () => {
    process.env.NEXT_PUBLIC_AFFILIATE_ENABLED = "true";
    const fallbackUrl = "https://example.com/rates?existing=1";

    const result = getAffiliatePartnerLink({
      category: "retirement",
      fallbackUrl,
    });

    const parsed = new URL(result);
    expect(parsed.searchParams.get("existing")).toBe("1");
    expect(parsed.searchParams.get("utm_source")).toBe("convertsheet");
  });

  it("handles malformed fallback URLs safely by returning the original string", () => {
    process.env.NEXT_PUBLIC_AFFILIATE_ENABLED = "true";
    const malformedUrl = "not-a-valid-url";

    const result = getAffiliatePartnerLink({
      category: "mortgage",
      fallbackUrl: malformedUrl,
      loanAmount: 250000,
    });

    expect(result).toBe(malformedUrl);
  });

  it("appends arbitrary custom parameters when provided", () => {
    process.env.NEXT_PUBLIC_AFFILIATE_ENABLED = "true";
    const fallbackUrl = "https://example.com/partner";

    const result = getAffiliatePartnerLink({
      category: "general",
      fallbackUrl,
      params: {
        partnerId: "123",
        creditScore: "720",
        optionalUndefined: undefined,
      },
    });

    const parsed = new URL(result);
    expect(parsed.searchParams.get("partnerId")).toBe("123");
    expect(parsed.searchParams.get("creditScore")).toBe("720");
    expect(parsed.searchParams.has("optionalUndefined")).toBe(false);
  });

  it("provides non-empty rate disclosure text", () => {
    expect(AFFILIATE_DISCLOSURE).toBeDefined();
    expect(typeof AFFILIATE_DISCLOSURE).toBe("string");
    expect(AFFILIATE_DISCLOSURE.trim().length).toBeGreaterThan(20);
  });
});
