import { describe, it, expect } from "vitest";
import {
  TOOL_REGISTRY,
  getAllToolSlugs,
  getAllTools,
  getToolBySlug,
  getToolsByCategory,
} from "../tool-registry";
import { ToolConfig } from "@/types/tool";

describe("TOOL_REGISTRY & Helper Functions", () => {
  const allSlugs = getAllToolSlugs();
  const allTools = getAllTools();

  it("registers exactly 54 tools across 3 categories", () => {
    expect(allSlugs).toHaveLength(54);
    expect(allTools).toHaveLength(54);

    const devTools = getToolsByCategory("data-developer");
    const financialTools = getToolsByCategory("financial");
    const utilityTools = getToolsByCategory("utility");

    expect(devTools).toHaveLength(13);
    expect(financialTools).toHaveLength(21);
    expect(utilityTools).toHaveLength(20);
  });

  it("each tool has complete SEO metadata, AEO answer summary, and E-E-A-T about section", () => {
    for (const tool of allTools) {
      expect(tool.slug).toBeTruthy();
      expect(tool.name).toBeTruthy();
      expect(tool.title).toBeTruthy();
      expect(tool.metaDescription).toBeTruthy();
      expect(tool.answerSummary).toBeTruthy();
      expect(tool.about).toBeTruthy();
      expect(tool.keywords.length).toBeGreaterThanOrEqual(4);
      expect(tool.howTo.length).toBeGreaterThanOrEqual(3);
      expect(tool.faqs.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("getToolBySlug retrieves existing configs correctly and returns undefined for unknown slugs", () => {
    const sip = getToolBySlug("sip-calculator");
    expect(sip).toBeDefined();
    expect(sip?.name).toBe("SIP Calculator");
    expect(sip?.category).toBe("financial");

    const unknown = getToolBySlug("non-existent-tool");
    expect(unknown).toBeUndefined();
  });

  it("related tools and converters point to valid registry keys", () => {
    for (const tool of allTools) {
      if (tool.relatedTools) {
        for (const relatedSlug of tool.relatedTools) {
          expect(allSlugs).toContain(relatedSlug);
        }
      }
    }
  });

  it("registers compress-pdf with complete SEO, howTo, and FAQ metadata", () => {
    expect(allSlugs).toContain("compress-pdf");
    const tool = getToolBySlug("compress-pdf");
    expect(tool).toBeDefined();
    expect(tool?.slug).toBe("compress-pdf");
    expect(tool?.category).toBe("utility");
    expect(tool?.title).toBeTruthy();
    expect(tool?.subtitle).toBeTruthy();
    expect(tool?.metaDescription).toBeTruthy();
    expect(tool?.answerSummary).toBeTruthy();
    expect(tool?.keywords.length).toBeGreaterThanOrEqual(4);
    expect(tool?.howTo).toHaveLength(3);
    expect(tool?.faqs.length).toBeGreaterThanOrEqual(3);
  });

  it("retrieves valid configurations for all compression tool slugs", () => {
    const slugs = [
      "compress-image",
      "compress-jpeg",
      "compress-png",
      "compress-webp",
      "compress-pdf",
    ];

    const currentSlugs = getAllToolSlugs();
    for (const slug of slugs) {
      expect(currentSlugs).toContain(slug);
      const tool = getToolBySlug(slug);
      expect(tool).toBeDefined();
      expect(tool?.slug).toBe(slug);
      expect(tool?.category).toBe("utility");
      expect(tool?.name).toBeTruthy();
      expect(tool?.title).toBeTruthy();
      expect(tool?.subtitle).toBeTruthy();
      expect(tool?.metaDescription).toBeTruthy();
      expect(tool?.answerSummary).toBeTruthy();
      expect(tool?.about).toBeTruthy();
      expect(tool?.keywords.length).toBeGreaterThanOrEqual(4);
      expect(tool?.howTo.length).toBeGreaterThanOrEqual(3);
      expect(tool?.faqs.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("verifies high CTR SEO titles and metadata for priority tools", () => {
    const unixTool = getToolBySlug("unix-timestamp-converter");
    expect(unixTool).toBeDefined();
    expect(unixTool?.title).toContain("Unix & Linux Timestamp Converter");
    expect(unixTool?.keywords).toContain("linux timestamp converter");
    expect(unixTool?.answerSummary).toMatch(/Linux|terminal|date -d/i);
    expect(unixTool?.answerSummary).toMatch(/epoch/i);
    expect(unixTool?.faqs.some((f) => f.question.includes("Linux") || f.answer.includes("date -d"))).toBe(true);
    expect(unixTool?.faqs.some((f) => f.question.includes("Year 2038"))).toBe(true);

    const salaryTool = getToolBySlug("salary-calculator");
    expect(salaryTool).toBeDefined();
    expect(salaryTool?.title).toBe("Salary & Take-Home Pay Calculator (US & India) - Net In-Hand Salary");
    expect(salaryTool?.keywords).toContain("take home pay calculator");
    expect(salaryTool?.keywords).toContain("us salary calculator");
    expect(salaryTool?.keywords).toContain("india salary calculator");
    expect(salaryTool?.keywords).toContain("in hand salary");

    const taxTool = getToolBySlug("income-tax-calculator");
    expect(taxTool).toBeDefined();
    expect(taxTool?.title).toBe("Income Tax Calculator (US Federal & India Slabs) - Instant Tax Bracket Breakdown");
    expect(taxTool?.keywords).toContain("federal tax calculator");
    expect(taxTool?.keywords).toContain("india tax calculator");
  });
});
