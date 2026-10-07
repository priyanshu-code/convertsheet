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
      "uk-salary-calculator",
      "canada-paycheck-calculator",
      "australia-pay-calculator",
      "percentage-calculator",
      "image-resizer",
      "emi-calculator",
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

  it("retrieves valid configurations for Canada and Australia presets", () => {
    const ontario80k = getProgrammaticPreset("canada-paycheck-calculator", "80k-salary-ontario");
    expect(ontario80k).toBeDefined();
    expect(ontario80k?.name).toBe("$80,000 Ontario Salary After Tax (2024)");
    expect(ontario80k?.initialValues).toEqual({
      grossSalary: 80000,
      province: "ON",
      rrspContributionPercent: 0,
    });
    expect(ontario80k?.faqs.length).toBeGreaterThanOrEqual(2);

    const aus90k = getProgrammaticPreset("australia-pay-calculator", "90k-salary-australia");
    expect(aus90k).toBeDefined();
    expect(aus90k?.name).toBe("$90,000 Salary After Tax Australia (2024/25 Stage 3 Tax Cuts)");
    expect(aus90k?.initialValues).toEqual({
      grossSalary: 90000,
      superannuationPercent: 11.5,
      hasHelpDebt: false,
      medicareExempt: false,
    });
    expect(aus90k?.faqs.length).toBeGreaterThanOrEqual(2);

    const uk40k = getProgrammaticPreset("uk-salary-calculator", "uk-take-home-40k");
    expect(uk40k).toBeDefined();
    expect(uk40k?.name).toBe("£40,000 UK Salary Take-Home Pay Calculator (2024/25)");
  });

  it("retrieves new presets from Inflation, Wage Ladder, and Car Loan pillars", () => {
    // Pillar 1: Inflation
    const inf50k = getProgrammaticPreset("inflation-calculator", "50k-in-20-years");
    expect(inf50k).toBeDefined();
    expect(inf50k?.name).toContain("$50,000 Be Worth in 20 Years");
    expect(inf50k?.initialValues.amount).toBe(50000);
    expect(inf50k?.initialValues.years).toBe(20);

    const inf1m = getProgrammaticPreset("inflation-calculator", "1-million-in-30-years");
    expect(inf1m).toBeDefined();
    expect(inf1m?.name).toContain("$1 Million Be Worth in 30 Years");
    expect(inf1m?.initialValues.amount).toBe(1000000);
    expect(inf1m?.initialValues.years).toBe(30);

    // Pillar 2: Wage Ladder
    const wage18 = getProgrammaticPreset("hourly-to-salary-calculator", "18-an-hour-salary");
    expect(wage18).toBeDefined();
    expect(wage18?.name).toContain("$18 an Hour is How Much a Year");
    expect(wage18?.initialValues.hourlyWage).toBe(18);

    const wage75 = getProgrammaticPreset("hourly-to-salary-calculator", "75-an-hour-salary");
    expect(wage75).toBeDefined();
    expect(wage75?.name).toContain("$75 an Hour is How Much a Year");
    expect(wage75?.initialValues.hourlyWage).toBe(75);

    // Pillar 3: Car Loan
    const car30k = getProgrammaticPreset("car-loan-calculator", "30k-car-loan");
    expect(car30k).toBeDefined();
    expect(car30k?.name).toContain("$30,000 Auto Loan");
    expect(car30k?.initialValues.vehiclePrice).toBe(30000);

    const truck50k = getProgrammaticPreset("car-loan-calculator", "50k-truck-loan");
    expect(truck50k).toBeDefined();
    expect(truck50k?.name).toContain("$50,000 Truck");
    expect(truck50k?.initialValues.vehiclePrice).toBe(50000);

    const avgCar = getProgrammaticPreset("car-loan-calculator", "average-car-payment-2026");
    expect(avgCar).toBeDefined();
    expect(avgCar?.name).toContain("Average Car Payment");
  });

  it("retrieves new presets from Car Models and Homebuyer Income clusters", () => {
    // Car Models
    const tesla = getProgrammaticPreset("car-loan-calculator", "tesla-model-y-monthly-payment");
    expect(tesla).toBeDefined();
    expect(tesla?.name).toContain("Tesla Model Y");
    expect(tesla?.initialValues.vehiclePrice).toBe(44990);

    const f150 = getProgrammaticPreset("car-loan-calculator", "ford-f150-monthly-payment");
    expect(f150).toBeDefined();
    expect(f150?.name).toContain("Ford F-150");
    expect(f150?.initialValues.loanTermMonths).toBe(72);

    const rav4 = getProgrammaticPreset("car-loan-calculator", "toyota-rav4-monthly-payment");
    expect(rav4).toBeDefined();
    expect(rav4?.name).toContain("Toyota RAV4");

    const civic = getProgrammaticPreset("car-loan-calculator", "honda-civic-monthly-payment");
    expect(civic).toBeDefined();
    expect(civic?.name).toContain("Honda Civic");

    // Homebuyer Income
    const salary400k = getProgrammaticPreset("mortgage-calculator", "salary-needed-for-400k-mortgage");
    expect(salary400k).toBeDefined();
    expect(salary400k?.name).toContain("Salary Needed for a $400,000 Mortgage");
    expect(salary400k?.initialValues.homePrice).toBe(400000);

    const salary1m = getProgrammaticPreset("mortgage-calculator", "salary-needed-for-1-million-dollar-home");
    expect(salary1m).toBeDefined();
    expect(salary1m?.name).toContain("Salary Needed for a $1 Million Dollar Home");
    expect(salary1m?.initialValues.homePrice).toBe(1000000);

    const nyHome = getProgrammaticPreset("mortgage-calculator", "income-needed-to-buy-a-house-in-new-york");
    expect(nyHome).toBeDefined();
    expect(nyHome?.name).toContain("Income Needed to Buy a House in New York");

    const caHome = getProgrammaticPreset("mortgage-calculator", "income-needed-to-buy-a-house-in-california");
    expect(caHome).toBeDefined();
    expect(caHome?.name).toContain("Income Needed to Buy a House in California");
  });

  it("retrieves new state salary, car loan, and high-value mortgage presets", () => {
    // US State Salary
    const caSalary = getProgrammaticPreset("salary-calculator", "california-take-home-100k");
    expect(caSalary).toBeDefined();
    expect(caSalary?.name).toContain("California Take-Home");
    expect(caSalary?.initialValues.grossSalary).toBe(100000);
    expect(caSalary?.initialValues.stateTaxPercent).toBe(6.0);

    const txSalary = getProgrammaticPreset("salary-calculator", "texas-take-home-100k");
    expect(txSalary).toBeDefined();
    expect(txSalary?.name).toContain("Texas Take-Home");
    expect(txSalary?.initialValues.stateTaxPercent).toBe(0);

    // Car Loan & EV
    const used10k = getProgrammaticPreset("car-loan-calculator", "10k-used-car-loan");
    expect(used10k).toBeDefined();
    expect(used10k?.name).toContain("$10,000 Used Car");

    const evLoan = getProgrammaticPreset("car-loan-calculator", "electric-vehicle-loan");
    expect(evLoan).toBeDefined();
    expect(evLoan?.name).toContain("Electric Vehicle (EV)");

    // Mortgages
    const mort500k = getProgrammaticPreset("mortgage-calculator", "500k-mortgage-30-year");
    expect(mort500k).toBeDefined();
    expect(mort500k?.name).toContain("$500,000 Mortgage");

    const mort700k = getProgrammaticPreset("mortgage-calculator", "700k-mortgage-30-year");
    expect(mort700k).toBeDefined();
    expect(mort700k?.name).toContain("$700,000 Mortgage");
  });

  it("resolves 15-vs-30-year-mortgage preset for mortgage-calculator", () => {
    const preset = getProgrammaticPreset("mortgage-calculator", "15-vs-30-year-mortgage");
    expect(preset).toBeDefined();
    expect(preset?.title).toContain("15 vs 30 Year Mortgage Calculator");
    expect(preset?.presetSlug).toBe("15-vs-30-year-mortgage");
    expect(preset?.toolSlug).toBe("mortgage-calculator");
    expect(preset?.subtitle).toContain("Compare 15-year fixed and 30-year fixed home loans");
    expect(preset?.badge).toBe("High Savings");
    expect(preset?.keywords).toContain("15 vs 30 year mortgage calculator");
    expect(preset?.initialValues.homePrice).toBe(500000);
    expect(preset?.initialValues.downPayment).toBe(100000);
    expect(preset?.initialValues.loanTermYears).toBe(15);
    expect(preset?.initialValues.interestRate).toBe(5.75);
    expect(preset?.about).toContain("15-Year vs 30-Year Fixed Mortgage Comparison");
  });

  it("resolves newly registered US state and bracket salary presets", () => {
    const florida100k = getProgrammaticPreset("salary-calculator", "florida-take-home-100k");
    expect(florida100k).toBeDefined();
    expect(florida100k?.title).toContain("Florida");
    expect(florida100k?.title).toContain("100k");
    expect(florida100k?.faqs.length).toBeGreaterThanOrEqual(4);

    const washington100k = getProgrammaticPreset("salary-calculator", "washington-take-home-100k");
    expect(washington100k).toBeDefined();
    expect(washington100k?.title).toContain("Washington");

    const pennsylvania75k = getProgrammaticPreset("salary-calculator", "pennsylvania-take-home-75k");
    expect(pennsylvania75k).toBeDefined();
    expect(pennsylvania75k?.title).toContain("Pennsylvania");

    const illinois100k = getProgrammaticPreset("salary-calculator", "illinois-take-home-100k");
    expect(illinois100k).toBeDefined();
    expect(illinois100k?.title).toContain("Illinois");

    const uk45k = getProgrammaticPreset("uk-salary-calculator", "uk-take-home-45k");
    expect(uk45k).toBeDefined();
    expect(uk45k?.title).toContain("£45k");

    const alberta80k = getProgrammaticPreset("canada-paycheck-calculator", "alberta-take-home-80k");
    expect(alberta80k).toBeDefined();
    expect(alberta80k?.title).toContain("Alberta");
  });

  it("resolves newly registered vehicle financing programmatic presets", () => {
    const teslaModelY = getProgrammaticPreset("car-loan-calculator", "tesla-model-y-monthly-payment");
    expect(teslaModelY).toBeDefined();
    expect(teslaModelY?.title).toContain("Tesla Model Y");
    expect(teslaModelY?.faqs.length).toBeGreaterThanOrEqual(4);

    const silverado = getProgrammaticPreset("car-loan-calculator", "chevy-silverado-monthly-payment");
    expect(silverado).toBeDefined();
    expect(silverado?.title).toContain("Silverado");

    const rav4 = getProgrammaticPreset("car-loan-calculator", "toyota-rav4-monthly-payment");
    expect(rav4).toBeDefined();
    expect(rav4?.title).toContain("RAV4");

    const loan84Mo = getProgrammaticPreset("car-loan-calculator", "84-month-car-loan");
    expect(loan84Mo).toBeDefined();
    expect(loan84Mo?.title).toContain("84-Month");

    const zeroDown = getProgrammaticPreset("car-loan-calculator", "zero-down-car-loan");
    expect(zeroDown).toBeDefined();
    expect(zeroDown?.title).toContain("Zero Down");
  });

  it("generates static params for all presets with slug and preset keys", () => {
    const params = getAllPresetStaticParams();
    expect(params.length).toBeGreaterThanOrEqual(700);
    expect(params[0]).toHaveProperty("slug");
    expect(params[0]).toHaveProperty("preset");
  });

  it("resolves complete 50-state salary matrix presets with authentic calculations", () => {
    const tx100k = getProgrammaticPreset("salary-calculator", "100k-salary-in-texas");
    expect(tx100k).toBeDefined();
    expect(tx100k?.badge).toBe("0% State Tax");
    expect(tx100k?.about).toContain("Texas");

    const ca150k = getProgrammaticPreset("salary-calculator", "150k-salary-in-california");
    expect(ca150k).toBeDefined();
    expect(ca150k?.title).toContain("California");

    const ny85k = getProgrammaticPreset("salary-calculator", "85k-salary-in-new-york");
    expect(ny85k).toBeDefined();
    expect(ny85k?.faqs.length).toBe(4);

    const fl60k = getProgrammaticPreset("salary-calculator", "60k-salary-in-florida");
    expect(fl60k).toBeDefined();
    expect(fl60k?.badge).toBe("0% State Tax");
  });

  it("resolves high-demand consumer mortgage, wage, and auto loan matrix presets", () => {
    const m550k = getProgrammaticPreset("mortgage-calculator", "550k-mortgage-payment");
    expect(m550k).toBeDefined();
    expect(m550k?.title).toContain("$550,000 Mortgage");
    expect(m550k?.faqs.length).toBeGreaterThanOrEqual(3);

    const wage25 = getProgrammaticPreset("hourly-to-salary-calculator", "25-dollars-an-hour-is-how-much-a-year");
    expect(wage25).toBeDefined();
    expect(wage25?.title).toContain("$25 an Hour");
    expect(wage25?.answerSummary).toContain("$52,000");

    const car35k = getProgrammaticPreset("car-loan-calculator", "35k-car-loan-monthly-payment");
    expect(car35k).toBeDefined();
    expect(car35k?.title).toContain("$35,000 Car Loan");
  });

  it("resolves newly added 72-month car loan and image resizer resolution presets", () => {
    const car72Mo = getProgrammaticPreset("car-loan-calculator", "25k-car-loan-72-months");
    expect(car72Mo).toBeDefined();
    expect(car72Mo?.title).toContain("$25,000 Car Loan Payment (72 Months)");
    expect(car72Mo?.about).toContain("72-Month");

    const car15k5Yr = getProgrammaticPreset("car-loan-calculator", "15k-car-loan-5-years");
    expect(car15k5Yr).toBeDefined();
    expect(car15k5Yr?.title).toContain("$15,000 Car Loan Over 5 Years");

    const square1080 = getProgrammaticPreset("image-resizer", "resize-image-to-1080x1080");
    expect(square1080).toBeDefined();
    expect(square1080?.title).toContain("1080×1080");
    expect(square1080?.initialValues).toEqual({
      targetWidth: 1080,
      targetHeight: 1080,
      targetFormat: "image/png",
    });

    const passport = getProgrammaticPreset("image-resizer", "passport-photo-maker");
    expect(passport).toBeDefined();
    expect(passport?.title).toContain("Passport Photo Resizer");
    expect(passport?.badge).toBe("Official 2×2\"");
  });

  it("resolves mathematical syntax presets for Position-0 AEO answer cards", () => {
    const math20 = getProgrammaticPreset("percentage-calculator", "0-20-x-100");
    expect(math20).toBeDefined();
    expect(math20?.title).toContain("0.20 * 100 = 20");
    expect(math20?.badge).toBe("Instant Math Answer");
    expect(math20?.answerSummary).toContain("0.20 * 100 equals 20");

    const divide20 = getProgrammaticPreset("percentage-calculator", "100-percent-divided-by-20");
    expect(divide20).toBeDefined();
    expect(divide20?.title).toContain("100%/20 = 5%");
    expect(divide20?.badge).toBe("Instant Math Answer");
    expect(divide20?.answerSummary).toContain("100% divided by 20 equals 5%");
  });

  it("resolves RBI 25 bps repo rate hike home loan EMI presets", () => {
    const emi50L = getProgrammaticPreset("emi-calculator", "50-lakh-home-loan-emi-after-repo-rate-hike");
    expect(emi50L).toBeDefined();
    expect(emi50L?.title).toContain("₹50 Lakh Home Loan EMI After RBI Repo Rate Hike");
    expect(emi50L?.badge).toBe("RBI Rate Impact");
    expect(emi50L?.answerSummary).toContain("₹792");

    const emi1Cr = getProgrammaticPreset("emi-calculator", "1-crore-home-loan-emi-after-repo-rate-hike");
    expect(emi1Cr).toBeDefined();
    expect(emi1Cr?.title).toContain("₹1 Crore Home Loan EMI After RBI Repo Rate Hike");
    expect(emi1Cr?.answerSummary).toContain("₹1,585");
  });
});

