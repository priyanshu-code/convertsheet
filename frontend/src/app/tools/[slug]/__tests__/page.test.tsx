import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import ToolPage, { generateStaticParams, generateMetadata, renderRichAbout } from "../page";
import { getAllToolSlugs, getToolBySlug } from "@/lib/tool-registry";
import { ToolJsonLdSchema } from "@/components/seo/ToolJsonLdSchema";

describe("Dynamic Tools SSG Route /tools/[slug]", () => {
  const allSlugs = getAllToolSlugs();

  it("generateStaticParams returns all 56 tool slugs", () => {
    const params = generateStaticParams();
    expect(params).toHaveLength(56);
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
        `https://www.convertsheet.com/tools/${slug}`
      );
      expect(metadata.openGraph?.url).toBe(
        `https://www.convertsheet.com/tools/${slug}`
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

  it.each([
    ["compress-image", "Bulk Image Compressor"],
    ["compress-jpeg", "JPEG & JPG Compressor"],
    ["compress-png", "PNG Compressor"],
    ["compress-webp", "WebP Compressor"],
    ["image-compressor", "Bulk Image Compressor"],
  ])("renders BulkImageCompressor for /tools/%s", (slug, expectedHeading) => {
    render(<ToolPage params={{ slug }} />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: expectedHeading })).toBeInTheDocument();
    expect(screen.getByText(/Drag & Drop Images/i)).toBeInTheDocument();
  });

  it("renders PdfCompressorTool for /tools/compress-pdf", () => {
    render(<ToolPage params={{ slug: "compress-pdf" }} />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Bulk PDF Compressor" })).toBeInTheDocument();
    expect(screen.getByText(/Drag & drop PDF files here/i)).toBeInTheDocument();
  });

  it("renders Popular Scenarios & Calculations preset grid for tools with registered presets", () => {
    render(<ToolPage params={{ slug: "percentage-calculator" }} />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /Popular Percentage Calculator Scenarios & Calculations/i,
      })
    ).toBeInTheDocument();

    const presetLinks = screen.getAllByRole("link", {
      name: /What is 20% of 100\?/i,
    });
    expect(presetLinks.length).toBeGreaterThanOrEqual(1);
    expect(presetLinks[0]).toHaveAttribute(
      "href",
      "/tools/percentage-calculator/what-is-20-percent-of-100"
    );
  });

  it("renders webp-to-png with semantic comparison table containing CloudConvert and FreeConvert", () => {
    const { container } = render(<ToolPage params={{ slug: "webp-to-png" }} />);

    expect(
      screen.getByRole("heading", {
        level: 3,
        name: /ConvertSheet vs Other WebP Converters/i,
      })
    ).toBeInTheDocument();

    const table = container.querySelector("table");
    expect(table).not.toBeNull();
    expect(table?.textContent).toContain("CloudConvert");
    expect(table?.textContent).toContain("FreeConvert");
    expect(table?.textContent).toContain("Zero (100% In-Browser)");
  });

  it("renderRichAbout formats headings, tables, bullet lists, bold text, and code backticks", () => {
    const markdown = `
### Advanced Calculations

Here is a paragraph with **important** note and \`1024 / 8\` code snippet.

- **Option A**: First bullet item with \`val1\`
- **Option B**: Second bullet item with \`val2\`

| Column 1 | Column 2 |
| :--- | :--- |
| Val A | Val B |
`;
    const { container } = render(<div>{renderRichAbout(markdown)}</div>);

    expect(screen.getByRole("heading", { level: 3, name: "Advanced Calculations" })).toBeInTheDocument();
    expect(screen.getByText("important")).toBeInTheDocument();

    const codeElements = container.querySelectorAll("code");
    expect(codeElements.length).toBeGreaterThanOrEqual(1);
    expect(codeElements[0].textContent).toBe("1024 / 8");

    const listItems = container.querySelectorAll("ul li");
    expect(listItems.length).toBe(2);
    expect(listItems[0].textContent).toContain("Option A");
    expect(listItems[1].textContent).toContain("Option B");

    const table = container.querySelector("table");
    expect(table).not.toBeNull();
    expect(table?.textContent).toContain("Column 1");
    expect(table?.textContent).toContain("Val A");
  });
});
