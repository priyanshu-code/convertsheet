import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import EmbedToolPage, { generateStaticParams, generateMetadata } from "../page";

// Mock notFound
vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

describe("Embed Tool Page", () => {
  it("generates static params for both registered tools and converters", () => {
    const params = generateStaticParams();
    expect(params.length).toBeGreaterThanOrEqual(50);
    expect(params).toContainEqual({ slug: "mortgage-calculator" });
    expect(params).toContainEqual({ slug: "csv-to-jsonl" });
    expect(params).toContainEqual({ slug: "json-to-excel" });
    expect(params).toContainEqual({ slug: "csv-to-parquet" });
  });

  it("generates SEO metadata for converters with index & follow flags", async () => {
    const meta = await generateMetadata({ params: { slug: "csv-to-jsonl" } });
    expect(meta.title).toContain("CSV to JSONL Converter (Embed Widget)");
    expect(meta.robots).toEqual({ index: true, follow: true });
  });

  it("renders the converter card and attribution backlink bar for converter embed", () => {
    render(<EmbedToolPage params={{ slug: "csv-to-jsonl" }} />);

    expect(screen.getByText(/100% Client-Side • Private & Free/i)).toBeInTheDocument();
    const poweredByLink = screen.getByRole("link", { name: /ConvertSheet/i });
    expect(poweredByLink).toBeInTheDocument();
    expect(poweredByLink).toHaveAttribute(
      "href",
      "https://www.convertsheet.com/convert/csv-to-jsonl"
    );
  });

  it("renders the compressor tool and attribution backlink for tool embed", () => {
    render(<EmbedToolPage params={{ slug: "compress-image" }} />);

    expect(screen.getByRole("heading", { level: 2, name: "Bulk Image Compressor" })).toBeInTheDocument();
    expect(screen.getByText(/Drag & Drop Images/i)).toBeInTheDocument();
    const poweredByLink = screen.getByRole("link", { name: /ConvertSheet/i });
    expect(poweredByLink).toBeInTheDocument();
    expect(poweredByLink).toHaveAttribute(
      "href",
      "https://www.convertsheet.com/tools/compress-image"
    );
  });
});
