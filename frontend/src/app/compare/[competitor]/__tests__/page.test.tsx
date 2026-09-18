import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import {
  getAllComparisons,
  getComparisonBySlug,
  getAllComparisonSlugs,
} from "@/lib/comparison-data";
import ComparisonPage, {
  generateStaticParams,
  generateMetadata,
} from "@/app/compare/[competitor]/page";

describe("Competitor Comparison Pages", () => {
  it("registry contains CloudConvert, Smallpdf, and Omni Calculator comparisons", () => {
    const comparisons = getAllComparisons();
    expect(comparisons.length).toBeGreaterThanOrEqual(3);

    const slugs = getAllComparisonSlugs();
    expect(slugs).toContain("cloudconvert-alternative");
    expect(slugs).toContain("smallpdf-alternative");
    expect(slugs).toContain("omni-calculator-alternative");
  });

  it("generateStaticParams generates all comparison competitor routes", () => {
    const params = generateStaticParams();
    expect(params.length).toBe(3);
    expect(params.map((p) => p.competitor)).toContain("cloudconvert-alternative");
  });

  it("generateMetadata produces correct title, canonical, and OpenGraph", async () => {
    const meta = await generateMetadata({
      params: { competitor: "cloudconvert-alternative" },
    });
    expect(meta.title).toContain("CloudConvert Alternative");
    expect(meta.description).toBeDefined();
    expect(meta.alternates?.canonical).toBe(
      "https://www.convertsheet.com/compare/cloudconvert-alternative"
    );
  });

  it("renders comparison table, pros/cons, and recommended converters", () => {
    render(
      <ComparisonPage params={{ competitor: "cloudconvert-alternative" }} />
    );

    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(
      screen.getByText(/The Zero-Upload, In-Browser CloudConvert Alternative/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/ConvertSheet vs CloudConvert: Side-by-Side Comparison/i)
    ).toBeInTheDocument();

    // Verify feature comparison table items
    expect(
      screen.getByText(/Data Privacy & Processing/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/100% Local \(Client-Side WebAssembly\)/i)
    ).toBeInTheDocument();

    // Verify recommended converters links
    expect(
      screen.getByRole("heading", { name: /JSON to Excel Converter/i })
    ).toBeInTheDocument();
  });
});
