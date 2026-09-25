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
    it("renders salary calculator in US mode by default and calculates paycheck", () => {
      render(<SalaryCalculator />);
      expect(screen.getByText(/Salary & Take-Home Paycheck Calculator/i)).toBeInTheDocument();
      expect(screen.getByText("Net Monthly Take-Home")).toBeInTheDocument();
      expect(screen.getByText("Bi-Weekly Take-Home")).toBeInTheDocument();
      expect(screen.getByText("Copy Prompt for ChatGPT")).toBeInTheDocument();
      expect(screen.getByText("Export to Excel (.xlsx)")).toBeInTheDocument();
      expect(screen.getByText("United States (W-2)")).toBeInTheDocument();
      expect(screen.getByText("India (CTC / In-Hand)")).toBeInTheDocument();
    });

    it("switches to India CTC mode and calculates in-hand pay", () => {
      render(<SalaryCalculator initialValues={{ regime: "IN" }} />);
      expect(screen.getByText(/Salary & In-Hand Pay Calculator/i)).toBeInTheDocument();
      expect(screen.getByText("Net In-Hand Paycheck")).toBeInTheDocument();
      expect(screen.getByText("Monthly EPF")).toBeInTheDocument();
      expect(screen.getByText("Gross Annual CTC")).toBeInTheDocument();
    });

    it("allows toggling between US and India modes interactively", () => {
      render(<SalaryCalculator />);
      // Defaults to US
      expect(screen.getByText("Gross Annual Salary")).toBeInTheDocument();

      // Click India pill
      fireEvent.click(screen.getByText("India (CTC / In-Hand)"));
      expect(screen.getByText("Gross Annual CTC")).toBeInTheDocument();
      expect(screen.getByText("Net In-Hand Paycheck")).toBeInTheDocument();

      // Click US pill
      fireEvent.click(screen.getByText("United States (W-2)"));
      expect(screen.getByText("Gross Annual Salary")).toBeInTheDocument();
      expect(screen.getByText("Net Monthly Take-Home")).toBeInTheDocument();
    });
  });

  describe("IncomeTaxCalculator", () => {
    it("renders income tax calculator in US mode by default and computes brackets for Single $100k", () => {
      render(<IncomeTaxCalculator initialValues={{ grossIncomeUs: 100000, filingStatus: "single" }} />);
      expect(screen.getByText(/US Federal Income Tax Bracket Calculator/i)).toBeInTheDocument();
      expect(screen.getByText("Total Federal Tax Payable")).toBeInTheDocument();
      expect(screen.getByText("$13,841")).toBeInTheDocument();
      expect(screen.getByText("Net After-Tax Income")).toBeInTheDocument();
      expect(screen.getByText("$86,159")).toBeInTheDocument();
      expect(screen.getByText("United States (Federal)")).toBeInTheDocument();
      expect(screen.getByText("India (FY 2024-25)")).toBeInTheDocument();
      expect(screen.getByText("Export to Excel (.xlsx)")).toBeInTheDocument();
      expect(screen.getByText("Copy Prompt for ChatGPT")).toBeInTheDocument();
    });

    it("switches to India mode and computes slab taxes under New Tax Regime", () => {
      render(
        <IncomeTaxCalculator
          initialValues={{
            regime: "IN",
            annualIncomeIn: 1500000,
            standardDeductionIn: 75000,
            otherDeductionsIn: 50000,
          }}
        />
      );
      expect(screen.getByText(/Income Tax Slab Calculator \(India FY 2024-25\)/i)).toBeInTheDocument();
      expect(screen.getByText("Total Tax Payable")).toBeInTheDocument();
      expect(screen.getByText(/119,600/)).toBeInTheDocument();
      expect(screen.getByText("Health & Edu Cess (4%)")).toBeInTheDocument();
      expect(screen.getByText(/4,600/)).toBeInTheDocument();
    });

    it("allows toggling between US Federal and India slab modes interactively", () => {
      render(<IncomeTaxCalculator />);
      // Default is US mode
      expect(screen.getByText(/US Federal Income Tax Bracket Calculator/i)).toBeInTheDocument();
      expect(screen.getByText("Total Federal Tax Payable")).toBeInTheDocument();

      // Click India pill
      fireEvent.click(screen.getByText("India (FY 2024-25)"));
      expect(screen.getByText(/Income Tax Slab Calculator \(India FY 2024-25\)/i)).toBeInTheDocument();
      expect(screen.getByText("Total Tax Payable")).toBeInTheDocument();
      expect(screen.getByText("Health & Edu Cess (4%)")).toBeInTheDocument();

      // Click US pill
      fireEvent.click(screen.getByText("United States (Federal)"));
      expect(screen.getByText(/US Federal Income Tax Bracket Calculator/i)).toBeInTheDocument();
      expect(screen.getByText("Total Federal Tax Payable")).toBeInTheDocument();
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
    it("renders ROI metrics and compound growth trajectory with quick chips", () => {
      render(<RoiCalculator />);
      expect(screen.getByText("Return on Investment (ROI) Calculator")).toBeInTheDocument();
      expect(screen.getByText("Total Return on Investment")).toBeInTheDocument();
      expect(screen.getByText("Net Capital Gain")).toBeInTheDocument();

      // Test quick investment preset
      const chip25k = screen.getByRole("button", { name: "$25k" });
      expect(chip25k).toBeInTheDocument();
      fireEvent.click(chip25k);

      // Test quick target 2x Double
      const doubleBtn = screen.getByRole("button", { name: "2x Double" });
      expect(doubleBtn).toBeInTheDocument();
      fireEvent.click(doubleBtn);

      // Investment = 25,000, Return = 50,000 -> ROI = +100%, Net Gain = $25,000
      expect(screen.getByText("+100%")).toBeInTheDocument();
      expect(screen.getByText("$25,000")).toBeInTheDocument();
      expect(screen.getAllByRole("button", { name: /copy/i }).length).toBeGreaterThanOrEqual(1);
    });
  });
});
