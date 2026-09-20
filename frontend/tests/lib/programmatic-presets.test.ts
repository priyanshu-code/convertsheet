import { describe, it, expect } from "vitest";
import {
  PROGRAMMATIC_PRESETS,
  getAllProgrammaticPresets,
  getProgrammaticPresetsByTool,
  getProgrammaticPreset,
  getAllPresetStaticParams,
} from "@/lib/programmatic-presets";

describe("Programmatic SEO Presets Registry", () => {
  it("contains at least 60 high-intent targeted financial calculation presets", () => {
    const presets = getAllProgrammaticPresets();
    expect(presets.length).toBeGreaterThanOrEqual(60);
    expect(PROGRAMMATIC_PRESETS.length).toBeGreaterThanOrEqual(60);
  });

  it("verifies all preset slugs are unique across the entire registry", () => {
    const slugs = PROGRAMMATIC_PRESETS.map((p) => p.presetSlug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  it("verifies all toolSlug values match one of the supported calculators with presets", () => {
    const allowedToolSlugs = new Set([
      "mortgage-calculator",
      "car-loan-calculator",
      "retirement-calculator",
      "inflation-calculator",
      "hourly-to-salary-calculator",
      "annual-to-hourly-calculator",
      "high-yield-savings-cd-calculator",
      "debt-payoff-calculator",
      "credit-card-payoff-calculator",
      "salary-calculator",
      "income-tax-calculator",
    ]);

    PROGRAMMATIC_PRESETS.forEach((preset) => {
      expect(
        allowedToolSlugs.has(preset.toolSlug),
        `Preset ${preset.presetSlug} has unsupported toolSlug: ${preset.toolSlug}`
      ).toBe(true);
    });
  });

  it("verifies every preset has valid non-empty fields and at least 2 FAQs", () => {
    PROGRAMMATIC_PRESETS.forEach((preset) => {
      expect(preset.toolSlug.trim().length, `Empty toolSlug for ${preset.presetSlug}`).toBeGreaterThan(0);
      expect(preset.presetSlug.trim().length, `Empty presetSlug for ${preset.name}`).toBeGreaterThan(0);
      expect(preset.name.trim().length, `Empty name for ${preset.presetSlug}`).toBeGreaterThan(0);
      expect(preset.title.trim().length, `Empty title for ${preset.presetSlug}`).toBeGreaterThan(0);
      expect(preset.metaDescription.trim().length, `Empty metaDescription for ${preset.presetSlug}`).toBeGreaterThan(0);
      expect(preset.answerSummary.trim().length, `Empty answerSummary for ${preset.presetSlug}`).toBeGreaterThan(0);
      expect(preset.about.trim().length, `Empty about for ${preset.presetSlug}`).toBeGreaterThan(0);

      // Check initialValues is an object with properties
      expect(preset.initialValues).toBeDefined();
      expect(typeof preset.initialValues).toBe("object");
      expect(Object.keys(preset.initialValues).length).toBeGreaterThan(0);

      // Check FAQs: array with at least 2 FAQs each, with valid non-empty question and answer
      expect(
        Array.isArray(preset.faqs),
        `faqs must be an array for ${preset.presetSlug}`
      ).toBe(true);
      expect(
        preset.faqs.length,
        `Preset ${preset.presetSlug} must have at least 2 FAQs, found ${preset.faqs.length}`
      ).toBeGreaterThanOrEqual(2);

      preset.faqs.forEach((faq, idx) => {
        expect(
          faq.question?.trim().length,
          `Empty FAQ question at index ${idx} in ${preset.presetSlug}`
        ).toBeGreaterThan(0);
        expect(
          faq.answer?.trim().length,
          `Empty FAQ answer at index ${idx} in ${preset.presetSlug}`
        ).toBeGreaterThan(0);
      });
    });
  });

  it("meets category minimum quotas (24+ mortgage, 12+ car loan, 10+ retirement, 9+ inflation)", () => {
    const mortgagePresets = getProgrammaticPresetsByTool("mortgage-calculator");
    expect(mortgagePresets.length).toBeGreaterThanOrEqual(24);

    const carPresets = getProgrammaticPresetsByTool("car-loan-calculator");
    expect(carPresets.length).toBeGreaterThanOrEqual(12);

    const retirementPresets = getProgrammaticPresetsByTool("retirement-calculator");
    expect(retirementPresets.length).toBeGreaterThanOrEqual(10);

    const inflationPresets = getProgrammaticPresetsByTool("inflation-calculator");
    expect(inflationPresets.length).toBeGreaterThanOrEqual(9);
  });

  it("retrieves single preset by tool and preset slug", () => {
    const preset = getProgrammaticPreset("mortgage-calculator", "400k-mortgage");
    expect(preset).toBeDefined();
    expect(preset?.name).toContain("$400,000 Mortgage");
    expect(preset?.initialValues.homePrice).toBe(400000);
    expect(preset?.faqs.length).toBeGreaterThanOrEqual(2);
  });

  it("retrieves localized Canadian and UK mortgage presets with regional benchmarks", () => {
    const caPreset = getProgrammaticPreset("mortgage-calculator", "500k-mortgage-canada");
    expect(caPreset).toBeDefined();
    expect(caPreset?.name).toContain("Canada");
    expect(caPreset?.metaDescription).toMatch(/stress test|OSFI|CMHC/i);
    expect(caPreset?.faqs.some((f) => f.question.includes("stress test"))).toBe(true);

    const ukPreset = getProgrammaticPreset("mortgage-calculator", "400k-mortgage-uk");
    expect(ukPreset).toBeDefined();
    expect(ukPreset?.name).toContain("UK");
    expect(ukPreset?.metaDescription).toMatch(/stamp duty|repayment/i);
  });

  it("retrieves new regional salary and income tax programmatic presets", () => {
    // 1. us-take-home-100k
    const us100k = getProgrammaticPreset("salary-calculator", "us-take-home-100k");
    expect(us100k).toBeDefined();
    expect(us100k?.name).toBe("$100k Salary Take-Home Pay Calculator (US)");
    expect(us100k?.initialValues).toEqual({
      regime: "US",
      grossSalary: 100000,
      filingStatus: "single",
      stateTaxPercent: 5,
    });
    expect(us100k?.faqs.length).toBeGreaterThanOrEqual(2);

    // 2. us-take-home-75k
    const us75k = getProgrammaticPreset("salary-calculator", "us-take-home-75k");
    expect(us75k).toBeDefined();
    expect(us75k?.name).toBe("$75k Salary Take-Home Pay Calculator (US)");
    expect(us75k?.initialValues).toEqual({
      regime: "US",
      grossSalary: 75000,
      filingStatus: "single",
      stateTaxPercent: 5,
    });
    expect(us75k?.faqs.length).toBeGreaterThanOrEqual(2);

    // 3. india-in-hand-12-lakh
    const in12L = getProgrammaticPreset("salary-calculator", "india-in-hand-12-lakh");
    expect(in12L).toBeDefined();
    expect(in12L?.name).toBe("₹12 Lakh CTC In-Hand Salary Calculator (India)");
    expect(in12L?.initialValues).toEqual({
      regime: "IN",
      annualCtc: 1200000,
      epfPercent: 12,
      professionalTaxMonthly: 200,
    });
    expect(in12L?.faqs.length).toBeGreaterThanOrEqual(2);

    // 4. us-federal-tax-single
    const usTax = getProgrammaticPreset("income-tax-calculator", "us-federal-tax-single");
    expect(usTax).toBeDefined();
    expect(usTax?.name).toBe("US Federal Income Tax Calculator (Single Filer)");
    expect(usTax?.initialValues).toEqual({
      regime: "US",
      grossIncomeUs: 100000,
      filingStatus: "single",
    });
    expect(usTax?.faqs.length).toBeGreaterThanOrEqual(2);

    // 5. india-tax-new-regime
    const inTax = getProgrammaticPreset("income-tax-calculator", "india-tax-new-regime");
    expect(inTax).toBeDefined();
    expect(inTax?.name).toBe("India Income Tax Calculator (Budget 2024 New Regime)");
    expect(inTax?.initialValues).toEqual({
      regime: "IN",
      annualIncomeIn: 1500000,
      standardDeductionIn: 75000,
      otherDeductionsIn: 0,
    });
    expect(inTax?.faqs.length).toBeGreaterThanOrEqual(2);
  });

  it("generates static params for all presets with slug and preset keys", () => {
    const params = getAllPresetStaticParams();
    expect(params.length).toBeGreaterThanOrEqual(60);
    expect(params[0]).toHaveProperty("slug");
    expect(params[0]).toHaveProperty("preset");
  });
});

