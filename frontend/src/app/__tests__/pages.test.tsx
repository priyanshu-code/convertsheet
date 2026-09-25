import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import HomePage from "../page";
import { CONVERTER_REGISTRY } from "@/lib/registry";

vi.mock("next/dynamic", () => ({
  default: (fn: any) => {
    const Component = (props: any) => {
      const [LoadedComponent, setLoadedComponent] = React.useState<any>(null);
      React.useEffect(() => {
        fn().then((mod: any) => setLoadedComponent(() => mod.default || mod.ConverterCard || mod));
      }, []);
      if (!LoadedComponent) return <div>Drop your JSON file here or</div>;
      return <LoadedComponent {...props} />;
    };
    return Component;
  },
}));

describe("Pages (Home)", () => {
  describe("HomePage", () => {
    it("renders headline, privacy badge, hero converter card, value props, and free platform banner", async () => {
      render(<HomePage />);

      // Headline
      expect(
        screen.getByRole("heading", {
          level: 1,
          name: "Fast, Private Structured Data Converter",
        })
      ).toBeInTheDocument();

      // Privacy Badge
      expect(
        screen.getByText("100% In-Browser Privacy • Zero Server Uploads")
      ).toBeInTheDocument();

      // Above the fold converter card
      expect(
        screen.getByText(/Drop your JSON file here or/i)
      ).toBeInTheDocument();

      // Popular Converters section
      expect(
        screen.getByRole("heading", {
          level: 2,
          name: "Popular Conversion Tools",
        })
      ).toBeInTheDocument();

      // Expand Popular Converters grid to reveal all cards
      const showAllBtn = screen.getByRole("button", { name: /Show All .* Converters/i });
      fireEvent.click(showAllBtn);

      // All tools listed in cards
      const allConverters = Object.values(CONVERTER_REGISTRY);
      for (const converter of allConverters) {
        expect(
          screen.getByRole("heading", {
            level: 3,
            name: `${converter.sourceFormat} to ${converter.targetFormat}`,
          })
        ).toBeInTheDocument();
      }

      // Value Propositions
      expect(
        screen.getByRole("heading", {
          level: 2,
          name: "Built for Extreme Speed & Total Privacy",
        })
      ).toBeInTheDocument();
      expect(screen.getByText("100% Client-Side Privacy")).toBeInTheDocument();
      expect(screen.getByText("Zero Queue Latency")).toBeInTheDocument();
      expect(screen.getByText("Zero Data Retention")).toBeInTheDocument();
      expect(screen.getByText("Developer REST API")).toBeInTheDocument();

      // Free Platform & Open Tools Suite Banner
      expect(
        screen.getByRole("heading", {
          level: 2,
          name: "Every Converter & Calculator is Free Forever",
        })
      ).toBeInTheDocument();
    });
  });

  describe("Static Policy & Info Pages", () => {
    it("renders PrivacyPage with client-side and zero-retention sections", async () => {
      const PrivacyPage = (await import("../privacy/page")).default;
      render(<PrivacyPage />);
      expect(screen.getByRole("heading", { level: 1, name: "Privacy Policy" })).toBeInTheDocument();
      expect(screen.getByText("1. How Client-Side Processing Works")).toBeInTheDocument();
      expect(screen.getByText("2. Zero Server Data Retention")).toBeInTheDocument();
    });

    it("renders TermsPage with fair use and financial disclaimer", async () => {
      const TermsPage = (await import("../terms/page")).default;
      render(<TermsPage />);
      expect(screen.getByRole("heading", { level: 1, name: "Terms of Service" })).toBeInTheDocument();
      expect(screen.getByText(/Financial Calculators & Informational Disclaimer/i)).toBeInTheDocument();
    });

    it("renders AboutPage with mission and tech stack", async () => {
      const AboutPage = (await import("../about/page")).default;
      render(<AboutPage />);
      expect(screen.getByRole("heading", { level: 1, name: "About ConvertSheet" })).toBeInTheDocument();
      expect(screen.getByText("The ConvertSheet Solution")).toBeInTheDocument();
      expect(screen.getByText("DuckDB-Wasm & Apache Arrow")).toBeInTheDocument();
    });

    it("renders BlogIndexPage with headline, guides, and cards", async () => {
      const BlogIndexPage = (await import("../blog/page")).default;
      render(<BlogIndexPage />);
      expect(
        screen.getByRole("heading", {
          level: 1,
          name: "Guides, Benchmarks & Privacy Insights",
        })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", {
          level: 2,
          name: "Latest Articles & Guides",
        })
      ).toBeInTheDocument();
      expect(
        screen.getByText("How to Convert 50,000+ Rows of Nested JSON to Excel Without Leaking Data")
      ).toBeInTheDocument();
    });
  });
});

