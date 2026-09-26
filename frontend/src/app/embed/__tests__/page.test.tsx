import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import EmbedDirectoryPage, { metadata } from "../page";

describe("Embed Directory Route (/embed)", () => {
  it("exports valid metadata with canonical URL and openGraph", () => {
    expect(metadata.title).toContain("Embed");
    expect(metadata.description).toBeDefined();
    expect(metadata.alternates?.canonical).toBe("https://www.convertsheet.com/embed");
    expect(metadata.openGraph?.url).toBe("https://www.convertsheet.com/embed");
  });

  it("renders EmbedDirectoryPage with hero, popular widgets, category sections, and FAQs", () => {
    render(<EmbedDirectoryPage />);

    // Hero Heading
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Embed Free Financial & Calculation Tools/i,
      })
    ).toBeInTheDocument();

    // Featured section heading
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /Most Popular Calculator Widgets/i,
      })
    ).toBeInTheDocument();

    // Key category headings
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /Mortgages & Loans/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /Salary & Paycheck/i,
      })
    ).toBeInTheDocument();

    // Integration guide
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /How to Embed on Any Platform/i,
      })
    ).toBeInTheDocument();

    // FAQs
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /Frequently Asked Questions/i,
      })
    ).toBeInTheDocument();
  });
});
