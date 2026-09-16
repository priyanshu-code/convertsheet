import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import ProgrammaticPresetPage, {
  generateStaticParams,
  generateMetadata,
} from "../page";

// Mock notFound
vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

describe("Programmatic Preset Dynamic Landing Page", () => {
  it("generates static params for all programmatic presets", () => {
    const params = generateStaticParams();
    expect(params.length).toBeGreaterThanOrEqual(15);
    expect(params).toContainEqual({
      slug: "mortgage-calculator",
      preset: "400k-mortgage",
    });
  });

  it("generates custom SEO metadata matching the target query", async () => {
    const meta = await generateMetadata({
      params: { slug: "mortgage-calculator", preset: "400k-mortgage" },
    });
    expect(meta.title).toContain("$400,000 Mortgage");
    expect(meta.description).toContain("$400,000");
  });

  it("renders the pre-populated calculator and answer box", () => {
    render(
      <ProgrammaticPresetPage
        params={{ slug: "mortgage-calculator", preset: "400k-mortgage" }}
      />
    );

    expect(
      screen.getAllByText(/\$400,000 Mortgage Payment Calculator/i).length
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Direct Answer:/i)).toBeInTheDocument();
    expect(screen.getByText(/Related.*Calculations/i)).toBeInTheDocument();
  });
});
