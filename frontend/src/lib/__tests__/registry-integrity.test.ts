import { describe, it, expect } from "vitest";
import { getAllBlogPosts } from "@/lib/blog-registry";
import { getAllComparisons } from "@/lib/comparison-data";
import { CONVERTER_REGISTRY, getAllConverterSlugs } from "@/lib/registry";
import { TOOL_REGISTRY, getAllToolSlugs } from "@/lib/tool-registry";
import { getAllPresetStaticParams } from "@/lib/programmatic-presets";

describe("Cross-Registry Referential Integrity", () => {
  const allConverterSlugs = new Set(getAllConverterSlugs());
  const allToolSlugs = new Set(getAllToolSlugs());

  it("verifies all blog attachedToolSlugs exist in either CONVERTER_REGISTRY or TOOL_REGISTRY", () => {
    const posts = getAllBlogPosts();
    expect(posts.length).toBeGreaterThan(0);

    for (const post of posts) {
      const isConverter = allConverterSlugs.has(post.attachedToolSlug);
      const isTool = allToolSlugs.has(post.attachedToolSlug);

      expect(
        isConverter || isTool,
        `Blog post "${post.slug}" references invalid attachedToolSlug: "${post.attachedToolSlug}". Must exist in either CONVERTER_REGISTRY or TOOL_REGISTRY.`
      ).toBe(true);
    }
  });

  it("verifies all comparison recommendedConverters match registered slugs with matching types", () => {
    const comparisons = getAllComparisons();
    expect(comparisons.length).toBeGreaterThan(0);

    for (const comp of comparisons) {
      for (const rec of comp.recommendedConverters) {
        if (rec.type === "converter") {
          expect(
            allConverterSlugs.has(rec.slug),
            `Comparison "${comp.slug}" references unknown converter slug: "${rec.slug}"`
          ).toBe(true);
        } else if (rec.type === "tool") {
          expect(
            allToolSlugs.has(rec.slug),
            `Comparison "${comp.slug}" references unknown tool slug: "${rec.slug}"`
          ).toBe(true);
        }
      }
    }
  });

  it("verifies relatedConverters and relatedTools on all tools point to valid registered slugs", () => {
    const tools = Object.values(TOOL_REGISTRY);

    for (const tool of tools) {
      if (tool.relatedConverters) {
        for (const cSlug of tool.relatedConverters) {
          expect(
            allConverterSlugs.has(cSlug),
            `Tool "${tool.slug}" references invalid relatedConverter slug: "${cSlug}"`
          ).toBe(true);
        }
      }

      if (tool.relatedTools) {
        for (const tSlug of tool.relatedTools) {
          expect(
            allToolSlugs.has(tSlug),
            `Tool "${tool.slug}" references invalid relatedTool slug: "${tSlug}"`
          ).toBe(true);
        }
      }
    }
  });

  it("verifies all programmatic presets reference existing tools in TOOL_REGISTRY", () => {
    const presets = getAllPresetStaticParams();
    expect(presets.length).toBeGreaterThan(0);

    for (const param of presets) {
      expect(
        allToolSlugs.has(param.slug),
        `Programmatic preset "${param.preset}" references unknown tool slug: "${param.slug}"`
      ).toBe(true);
    }
  });
});
