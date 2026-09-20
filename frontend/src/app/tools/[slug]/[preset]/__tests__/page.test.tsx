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
    expect(meta.openGraph?.images).toBeDefined();
    expect((meta.openGraph?.images as any[])[0].url).toContain(
      "/tools/mortgage-calculator/400k-mortgage/opengraph-image"
    );
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

  it("renders the SalaryCalculator preset cleanly for US and India presets", () => {
    const { unmount } = render(
      <ProgrammaticPresetPage
        params={{ slug: "salary-calculator", preset: "us-take-home-100k" }}
      />
    );

    expect(
      screen.getAllByText(/\$100k Salary Take-Home Pay Calculator \(US\)/i).length
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Direct Answer:/i)).toBeInTheDocument();
    expect(screen.getByText(/Gross Annual Salary/i)).toBeInTheDocument();

    unmount();

    render(
      <ProgrammaticPresetPage
        params={{ slug: "salary-calculator", preset: "india-in-hand-12-lakh" }}
      />
    );

    expect(
      screen.getAllByText(/₹12 Lakh CTC In-Hand Salary Calculator \(India\)/i).length
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Direct Answer:/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Gross Annual CTC/i).length).toBeGreaterThanOrEqual(1);
  });

  it("renders the IncomeTaxCalculator preset cleanly for US and India presets", () => {
    const { unmount } = render(
      <ProgrammaticPresetPage
        params={{ slug: "income-tax-calculator", preset: "us-federal-tax-single" }}
      />
    );

    expect(
      screen.getAllByText(/US Federal Income Tax Calculator \(Single Filer\)/i).length
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Direct Answer:/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Federal Tax Payable/i)).toBeInTheDocument();

    unmount();

    render(
      <ProgrammaticPresetPage
        params={{ slug: "income-tax-calculator", preset: "india-tax-new-regime" }}
      />
    );

    expect(
      screen.getAllByText(/India Income Tax Calculator \(Budget 2024 New Regime\)/i).length
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Direct Answer:/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Standard Deduction/i).length).toBeGreaterThanOrEqual(1);
  });
});
