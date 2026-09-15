import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import HomePage from "../page";
import PricingPage from "../pricing/page";
import { CONVERTER_REGISTRY } from "@/lib/registry";

describe("Pages (Home & Pricing)", () => {
  describe("HomePage", () => {
    it("renders headline, privacy badge, hero converter card, and value props", () => {
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

      // All 7 tools listed in cards
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

      // Pro CTA Banner
      expect(
        screen.getByRole("heading", {
          level: 2,
          name: "Unlock ConvertSheet Pro & Developer API",
        })
      ).toBeInTheDocument();
    });
  });

  describe("PricingPage", () => {
    it("renders all three pricing tiers, CTA links, and FAQs", () => {
      render(<PricingPage />);

      // Headline
      expect(
        screen.getByRole("heading", {
          level: 1,
          name: "Convert Free in Browser, Scale with Pro & API",
        })
      ).toBeInTheDocument();

      // 3 Tier Cards
      expect(
        screen.getByRole("heading", { level: 2, name: "Free" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 2, name: "Pro" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 2, name: "Developer API" })
      ).toBeInTheDocument();

      // Price tags
      expect(screen.getByText("$0")).toBeInTheDocument();
      expect(screen.getByText("$9.99")).toBeInTheDocument();
      expect(screen.getByText("$19.99")).toBeInTheDocument();

      // CTAs
      expect(
        screen.getByRole("link", { name: /Start Free/i })
      ).toHaveAttribute("href", "/");
      expect(
        screen.getByRole("link", { name: /Upgrade to Pro/i })
      ).toHaveAttribute("href", "https://buy.stripe.com/test_convertsheet_pro");
      expect(
        screen.getByRole("link", { name: /Get API Keys/i })
      ).toHaveAttribute("href", "https://buy.stripe.com/test_convertsheet_api");

      // FAQ section
      expect(
        screen.getByRole("heading", {
          level: 2,
          name: "Frequently Asked Pricing Questions",
        })
      ).toBeInTheDocument();
      expect(
        screen.getByText("How does the Free plan remain free?")
      ).toBeInTheDocument();
      expect(
        screen.getByText("How does the 15-minute file wipe guarantee work?")
      ).toBeInTheDocument();
    });
  });
});
