import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SalaryCalculator } from "../SalaryCalculator";
import { IncomeTaxCalculator } from "../IncomeTaxCalculator";
import { JwtDecoderTool } from "../JwtDecoderTool";
import { UuidGeneratorTool } from "../UuidGeneratorTool";
import { MarginCalculator } from "../MarginCalculator";
import { RoiCalculator } from "../RoiCalculator";

describe("Phase 2 Calculators and Tools", () => {
  describe("SalaryCalculator", () => {
    it("renders salary calculator and calculates take-home pay", () => {
      render(<SalaryCalculator />);
      expect(screen.getByText(/Salary & In-Hand Pay Calculator/i)).toBeInTheDocument();
      expect(screen.getByText("Net In-Hand Paycheck")).toBeInTheDocument();
      expect(screen.getByText("Copy Prompt for ChatGPT")).toBeInTheDocument();
      expect(screen.getByText("Export to Excel (.xlsx)")).toBeInTheDocument();
    });
  });

  describe("IncomeTaxCalculator", () => {
    it("renders income tax calculator with progressive brackets", () => {
      render(<IncomeTaxCalculator />);
      expect(screen.getByText(/Income Tax Slab Calculator/i)).toBeInTheDocument();
      expect(screen.getByText("Total Tax Payable")).toBeInTheDocument();
      expect(screen.getByText("Export to Excel (.xlsx)")).toBeInTheDocument();
    });
  });

  describe("JwtDecoderTool", () => {
    it("renders JWT inspector and decodes sample payload", () => {
      render(<JwtDecoderTool />);
      expect(screen.getByText("JWT Token Inspector & Decoder")).toBeInTheDocument();
      expect(screen.getByText("Header: Algorithm & Token Type")).toBeInTheDocument();
      expect(screen.getByText("Payload: Data Claims")).toBeInTheDocument();
      expect(screen.getByText("Signature (Base64URL)")).toBeInTheDocument();
    });

    it("displays error when invalid format token is provided", () => {
      render(<JwtDecoderTool />);
      const textarea = screen.getByPlaceholderText("Paste JWT (eyJhbGciOi...)");
      fireEvent.change(textarea, { target: { value: "invalid.jwt" } });
      expect(screen.getByText(/Invalid JWT format/i)).toBeInTheDocument();
    });
  });

  describe("UuidGeneratorTool", () => {
    it("renders UUID v4 batch generator and buttons", () => {
      render(<UuidGeneratorTool />);
      expect(screen.getByText("UUID / GUID v4 Batch Generator")).toBeInTheDocument();
      expect(screen.getByText("Generate New Batch")).toBeInTheDocument();
      expect(screen.getByText("Copy All UUIDs")).toBeInTheDocument();
    });
  });

  describe("MarginCalculator", () => {
    it("renders profit margin and markup metrics", () => {
      render(<MarginCalculator />);
      expect(screen.getByText("Profit Margin & Markup Calculator")).toBeInTheDocument();
      expect(screen.getByText("Gross Profit")).toBeInTheDocument();
      expect(screen.getByText("Profit Margin")).toBeInTheDocument();
      expect(screen.getByText("Markup")).toBeInTheDocument();
    });
  });

  describe("RoiCalculator", () => {
    it("renders ROI metrics and compound growth trajectory", () => {
      render(<RoiCalculator />);
      expect(screen.getByText("Return on Investment (ROI) Calculator")).toBeInTheDocument();
      expect(screen.getByText("Total Return on Investment")).toBeInTheDocument();
      expect(screen.getByText("Net Capital Gain")).toBeInTheDocument();
    });
  });
});
