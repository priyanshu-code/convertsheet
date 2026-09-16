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

  it("registers exactly 29 tools across 3 categories", () => {
    expect(allSlugs).toHaveLength(29);
    expect(allTools).toHaveLength(29);

    const devTools = getToolsByCategory("data-developer");
    const financialTools = getToolsByCategory("financial");
    const utilityTools = getToolsByCategory("utility");

    expect(devTools).toHaveLength(8);
    expect(financialTools).toHaveLength(10);
    expect(utilityTools).toHaveLength(11);
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
});
