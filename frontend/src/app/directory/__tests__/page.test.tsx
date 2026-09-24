import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import DirectoryPage, { metadata } from "../page";

describe("Complete Master Directory Route (/directory)", () => {
  it("exports valid metadata with canonical URL and openGraph", () => {
    expect(metadata.title).toContain("Directory");
    expect(metadata.description).toBeDefined();
    expect(metadata.alternates?.canonical).toBe("https://www.convertsheet.com/directory");
    expect(metadata.openGraph?.url).toBe("https://www.convertsheet.com/directory");
  });

  it("renders DirectoryPage with hero, jump links, all 4 taxonomy categories, and breadcrumbs", () => {
    const { container } = render(<DirectoryPage />);

    // Breadcrumbs
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();

    // Hero Heading
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Complete Tools & Calculators Master Directory/i,
      })
    ).toBeInTheDocument();

    // Jump anchors
    expect(screen.getByRole("link", { name: /Financial Calculators \(\d+\)/i })).toHaveAttribute(
      "href",
      "#financial-tools"
    );
    expect(screen.getByRole("link", { name: /Data & Developer \(\d+\)/i })).toHaveAttribute(
      "href",
      "#data-developer-tools"
    );
    expect(screen.getByRole("link", { name: /Document & Utility \(\d+\)/i })).toHaveAttribute(
      "href",
      "#utility-tools"
    );
    expect(screen.getByRole("link", { name: /File Converters \(\d+\)/i })).toHaveAttribute(
      "href",
      "#file-converters"
    );

    // Category Headings
    expect(
      screen.getByRole("heading", { level: 2, name: /Financial Calculators & Presets/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /Data & Developer Utilities/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /Document & Daily Utilities/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /Client-Side File Converters/i })
    ).toBeInTheDocument();

    // Verify presence of parent tools, converters, and presets
    expect(screen.getByRole("link", { name: /Percentage Calculator/i })).toHaveAttribute(
      "href",
      "/tools/percentage-calculator"
    );
    expect(screen.getByRole("link", { name: /JSON to Excel/i })).toHaveAttribute(
      "href",
      "/convert/json-to-excel"
    );
    expect(screen.getByRole("link", { name: /What is 20% of 100\?/i })).toHaveAttribute(
      "href",
      "/tools/percentage-calculator/what-is-20-percent-of-100"
    );

    // JSON-LD Schema
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const json = JSON.parse(script!.textContent || "{}");
    expect(json["@context"]).toBe("https://schema.org");
    expect(json["@graph"]).toHaveLength(3);
    expect(json["@graph"][0]["@type"]).toBe("CollectionPage");
    expect(json["@graph"][1]["@type"]).toBe("BreadcrumbList");
    expect(json["@graph"][2]["@type"]).toBe("ItemList");
  });
});
