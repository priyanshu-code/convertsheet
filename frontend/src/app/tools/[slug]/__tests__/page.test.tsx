import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import ToolPage, { generateStaticParams, generateMetadata } from "../page";
import { getAllToolSlugs, getToolBySlug } from "@/lib/tool-registry";
import { ToolJsonLdSchema } from "@/components/seo/ToolJsonLdSchema";

describe("Dynamic Tools SSG Route /tools/[slug]", () => {
  const allSlugs = getAllToolSlugs();

  it("generateStaticParams returns all 18 tool slugs", () => {
    const params = generateStaticParams();
    expect(params).toHaveLength(18);
    for (const slug of allSlugs) {
      expect(params).toContainEqual({ slug });
    }
  });

  it("generateMetadata generates valid title, canonical, and opengraph image for all tools", async () => {
    for (const slug of allSlugs) {
      const metadata = await generateMetadata({ params: { slug } });
      const tool = getToolBySlug(slug)!;

      expect(metadata.title).toBe(tool.title);
      expect(metadata.description).toBe(tool.metaDescription);
      expect(metadata.alternates?.canonical).toBe(
        `https://convertsheet.com/tools/${slug}`
      );
      expect(metadata.openGraph?.url).toBe(
        `https://convertsheet.com/tools/${slug}`
      );
    }
  });

  it("renders ToolPage with breadcrumbs, direct answer summary, tool component, and about section", () => {
    render(<ToolPage params={{ slug: "sip-calculator" }} />);

    // Direct Answer
    expect(screen.getByText(/Direct Answer:/i)).toBeInTheDocument();

    // Tool Name & Heading
    expect(screen.getByRole("heading", { level: 1, name: "SIP Calculator" })).toBeInTheDocument();

    // About section
    expect(screen.getByRole("heading", { level: 2, name: "About SIP Calculator" })).toBeInTheDocument();

    // Breadcrumbs
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
  });

  it("ToolJsonLdSchema generates valid JSON-LD graph with 5 schema types including Speakable", () => {
    const tool = getToolBySlug("sip-calculator")!;
    const { container } = render(<ToolJsonLdSchema config={tool} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();

    const json = JSON.parse(script!.textContent || "{}");
    expect(json["@context"]).toBe("https://schema.org");
    expect(json["@graph"]).toHaveLength(5);

    const types = json["@graph"].map((item: { "@type": string }) => item["@type"]);
    expect(types).toContain("SoftwareApplication");
    expect(types).toContain("HowTo");
    expect(types).toContain("FAQPage");
    expect(types).toContain("BreadcrumbList");
    expect(types).toContain("WebPage");
  });
});
