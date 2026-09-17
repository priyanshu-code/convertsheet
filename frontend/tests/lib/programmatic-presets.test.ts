import { describe, it, expect } from "vitest";
import {
  PROGRAMMATIC_PRESETS,
  getAllProgrammaticPresets,
  getProgrammaticPresetsByTool,
  getProgrammaticPreset,
  getAllPresetStaticParams,
} from "@/lib/programmatic-presets";

describe("Programmatic SEO Presets Registry", () => {
  it("contains at least 55 high-intent targeted financial calculation presets", () => {
    const presets = getAllProgrammaticPresets();
    expect(presets.length).toBeGreaterThanOrEqual(55);
    expect(PROGRAMMATIC_PRESETS.length).toBeGreaterThanOrEqual(55);
  });

  it("verifies all preset slugs are unique across the entire registry", () => {
    const slugs = PROGRAMMATIC_PRESETS.map((p) => p.presetSlug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  it("verifies all toolSlug values match one of the 8 supported calculators with presets", () => {
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

  it("generates static params for all presets with slug and preset keys", () => {
    const params = getAllPresetStaticParams();
    expect(params.length).toBeGreaterThanOrEqual(55);
    expect(params[0]).toHaveProperty("slug");
    expect(params[0]).toHaveProperty("preset");
  });
});
