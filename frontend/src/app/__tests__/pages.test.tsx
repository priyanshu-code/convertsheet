import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import HomePage from "../page";
import { CONVERTER_REGISTRY } from "@/lib/registry";

describe("Pages (Home)", () => {
  describe("HomePage", () => {
    it("renders headline, privacy badge, hero converter card, value props, and free platform banner", () => {
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

      // All 15 tools listed in cards
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
});
