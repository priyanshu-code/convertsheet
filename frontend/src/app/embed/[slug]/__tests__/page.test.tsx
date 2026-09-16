import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import EmbedToolPage, { generateStaticParams, generateMetadata } from "../page";

// Mock notFound
vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

describe("Embed Tool Page", () => {
  it("generates static params for all registered tools", () => {
    const params = generateStaticParams();
    expect(params.length).toBeGreaterThanOrEqual(38);
    expect(params).toContainEqual({ slug: "mortgage-calculator" });
    expect(params).toContainEqual({ slug: "sip-calculator" });
    expect(params).toContainEqual({ slug: "json-formatter-validator" });
  });

  it("generates SEO metadata with index & follow flags", async () => {
    const meta = await generateMetadata({ params: { slug: "mortgage-calculator" } });
    expect(meta.title).toContain("Mortgage Calculator");
    expect(meta.title).toContain("(Embed Widget)");
    expect(meta.robots).toEqual({ index: true, follow: true });
  });

  it("renders the calculator component and attribution backlink bar", () => {
    render(<EmbedToolPage params={{ slug: "mortgage-calculator" }} />);

    expect(screen.getByText(/Monthly Mortgage Payment/i)).toBeInTheDocument();
    expect(screen.getByText(/100% Client-Side • Private & Free/i)).toBeInTheDocument();

    const poweredByLink = screen.getByRole("link", { name: /ConvertSheet/i });
    expect(poweredByLink).toBeInTheDocument();
    expect(poweredByLink).toHaveAttribute(
      "href",
      "https://convertsheet.com/tools/mortgage-calculator"
    );
  });
});
