import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ToolsDirectoryPage from "../page";
import ToolCategoryPage, {
  generateStaticParams,
  generateMetadata,
} from "../category/[category]/page";
import { getAllTools } from "@/lib/tool-registry";

describe("Tools Hub (/tools) & Category Silos (/tools/category/[category])", () => {
  describe("Tools Hub Directory Page (/tools)", () => {
    it("renders directory hub with hero, category feature cards, and search bar", () => {
      const { container } = render(<ToolsDirectoryPage />);

      // Hero
      expect(
        screen.getByRole("heading", {
          level: 1,
          name: /Tools & Calculators Directory/i,
        })
      ).toBeInTheDocument();

      // Category feature cards
      expect(
        screen.getByRole("heading", { level: 2, name: /Financial Calculators/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 2, name: /Data & Developer Tools/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 2, name: /Daily Utilities & PDF/i })
      ).toBeInTheDocument();

      // Search input
      const searchInput = screen.getByRole("searchbox", { name: /Search tools/i });
      expect(searchInput).toBeInTheDocument();

      // JSON-LD schema check
      const script = container.querySelector('script[type="application/ld+json"]');
      expect(script).not.toBeNull();
      const json = JSON.parse(script!.textContent || "{}");
      expect(json["@graph"]).toHaveLength(3);
      expect(json["@graph"][0]["@type"]).toBe("CollectionPage");
      expect(json["@graph"][1]["@type"]).toBe("BreadcrumbList");
      expect(json["@graph"][2]["@type"]).toBe("ItemList");
      expect(json["@graph"][2]["numberOfItems"]).toBe(54);
    });

    it("live filter updates tool list when typing in search input", () => {
      render(<ToolsDirectoryPage />);

      const searchInput = screen.getByRole("searchbox", { name: /Search tools/i });
      fireEvent.change(searchInput, { target: { value: "mortgage" } });

      expect(screen.getByText(/Filtered by “mortgage”/i)).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 3, name: /Mortgage Calculator/i })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { level: 3, name: /JSON Formatter/i })
      ).not.toBeInTheDocument();
    });

    it("clicking category filter pill isolates that category", () => {
      render(<ToolsDirectoryPage />);

      const financialPill = screen.getByRole("button", { name: /Financial Math/i });
      fireEvent.click(financialPill);

      expect(screen.getByText(/Showing 21 tools in financial/i)).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 3, name: /Mortgage Calculator/i })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { level: 3, name: /Base64 Encoder/i })
      ).not.toBeInTheDocument();
    });
  });

  describe("Category Silo Pages (/tools/category/[category])", () => {
    it("generateStaticParams generates all 3 SEO category silos", () => {
      const params = generateStaticParams();
      expect(params).toEqual([
        { category: "financial" },
        { category: "data-developer" },
        { category: "utility" },
      ]);
    });

    it("generateMetadata produces canonical and OpenGraph for valid category", async () => {
      const meta = await generateMetadata({ params: { category: "financial" } });
      expect(meta.title).toContain("Financial Calculators");
      expect(meta.alternates?.canonical).toBe(
        "https://www.convertsheet.com/tools/category/financial"
      );
    });

    it("renders financial category page with 21 tools and FAQ accordion", () => {
      render(<ToolCategoryPage params={{ category: "financial" }} />);

      expect(
        screen.getByRole("heading", {
          level: 1,
          name: /Financial Calculators & Wealth Planning/i,
        })
      ).toBeInTheDocument();

      expect(
        screen.getByRole("heading", {
          level: 2,
          name: /Available Financial Calculators \(21\)/i,
        })
      ).toBeInTheDocument();

      expect(
        screen.getByRole("heading", { name: /Frequently Asked Questions/i })
      ).toBeInTheDocument();
      expect(screen.getByText(/Explore Other Tool Suites/i)).toBeInTheDocument();
    });

    it("renders data-developer category page with 13 tools", () => {
      render(<ToolCategoryPage params={{ category: "data-developer" }} />);

      expect(
        screen.getByRole("heading", {
          level: 1,
          name: /Data Engineering & Developer Utilities/i,
        })
      ).toBeInTheDocument();

      expect(
        screen.getByRole("heading", {
          level: 2,
          name: /Available Data & Developer Tools \(13\)/i,
        })
      ).toBeInTheDocument();
    });

    it("renders utility category page with 20 tools", () => {
      render(<ToolCategoryPage params={{ category: "utility" }} />);

      expect(
        screen.getByRole("heading", {
          level: 1,
          name: /Daily Utilities, PDF & Image Tools/i,
        })
      ).toBeInTheDocument();

      expect(
        screen.getByRole("heading", {
          level: 2,
          name: /Available Daily Utilities & PDF \(20\)/i,
        })
      ).toBeInTheDocument();
    });
  });
});
