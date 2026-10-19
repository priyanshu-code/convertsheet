import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { AgeCalculator } from "../AgeCalculator";
import { DateDifferenceCalculator } from "../DateDifferenceCalculator";
import { BmiCalculator } from "../BmiCalculator";
import { UnitConverterTool } from "../UnitConverterTool";
import { TipCalculator } from "../TipCalculator";
import { ByteConverterTool } from "../ByteConverterTool";
import { CurrencyProvider } from "@/context/CurrencyContext";

describe("General Utility Calculators Suite", () => {
  it("AgeCalculator calculates chronological age with ConvertSheet MOATs", () => {
    render(<AgeCalculator initialValues={{ birthDate: "1998-05-15", targetDate: "2026-10-18" }} />);
    expect(screen.getByText("Chronological Age Calculator")).toBeInTheDocument();
    expect(screen.getByText("Exact Chronological Age")).toBeInTheDocument();

    // Verify 100% Client-Side Privacy Badge
    expect(screen.getByText(/100% Client-Side Privacy:/i)).toBeInTheDocument();

    // Verify 2026 Demographic Benchmarks Freshness Signal
    expect(screen.getByText(/2026 Demographic Benchmarks:/i)).toBeInTheDocument();

    // Verify Generational Cohort (1998 is Gen Z)
    expect(screen.getByText("Gen Z")).toBeInTheDocument();

    // Verify 44px min touch target quick DOB presets
    const btn30y = screen.getByRole("button", { name: "30y" });
    expect(btn30y).toHaveClass("min-h-[44px]");

    // Verify Excel export button exists
    expect(screen.getAllByRole("button", { name: /Export to Excel \(\.xlsx\)|Export \.xlsx/i }).length).toBeGreaterThanOrEqual(1);
  });

  it("DateDifferenceCalculator calculates calendar and business days with ConvertSheet MOATs", () => {
    render(
      <DateDifferenceCalculator
        initialValues={{
          startDate: "2026-10-01",
          endDate: "2026-10-15",
          includeEndDay: "no",
        }}
      />
    );
    expect(screen.getByText("Date Difference & Duration Calculator")).toBeInTheDocument();
    expect(screen.getByText("Duration Calculation")).toBeInTheDocument();
    expect(screen.getByText(/Working Business Days/i)).toBeInTheDocument();

    // Verify 100% Client-Side Privacy Badge
    expect(screen.getByText(/100% Client-Side Privacy:/i)).toBeInTheDocument();

    // Verify 2026 Calendar Freshness Signal
    expect(screen.getByText(/2026 Calendar Standards:/i)).toBeInTheDocument();

    // Verify 44px touch targets on Quick Range Presets
    const last30Btn = screen.getByRole("button", { name: "Last 30 Days" });
    expect(last30Btn).toHaveClass("min-h-[44px]");

    // Verify Swap button has 44px touch target
    const swapBtn = screen.getByRole("button", { name: /Swap/i });
    expect(swapBtn).toHaveClass("min-h-[44px]");

    // Verify Excel export button
    expect(screen.getAllByRole("button", { name: /Export to Excel \(\.xlsx\)|Export \.xlsx/i }).length).toBeGreaterThanOrEqual(1);
  });

  it("BmiCalculator calculates BMI and classifies weight categories with ConvertSheet MOATs", () => {
    render(<BmiCalculator initialValues={{ unitSystem: "metric", weightKg: 70, heightCm: 175 }} />);
    expect(screen.getByText(/Body Mass Index \(BMI\) Calculator/i)).toBeInTheDocument();

    // Verify 100% Client-Side Privacy Badge
    expect(screen.getByText(/100% Client-Side Privacy:/i)).toBeInTheDocument();

    // Verify 2026 WHO & NIH Guidelines Freshness Signal
    expect(screen.getByText(/2026 WHO & NIH Guidelines:/i)).toBeInTheDocument();

    // 70kg at 175cm = 22.9 BMI (Normal weight)
    // Present in primary card and mobile sticky bar
    expect(screen.getAllByText("22.9").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Normal (Healthy) weight").length).toBeGreaterThanOrEqual(1);

    // Verify BMI Prime (< 1.0) and Healthy Target Range
    expect(screen.getByText("0.91")).toBeInTheDocument();
    expect(screen.getByText("56.7 – 76.3 kg")).toBeInTheDocument();

    // Verify 44px touch targets on delta buttons
    const btn5kg = screen.getAllByRole("button", { name: /5 kg/i })[0];
    expect(btn5kg).toHaveClass("min-h-[44px]");

    // Verify Excel export button
    expect(screen.getAllByRole("button", { name: /Export to Excel \(\.xlsx\)|Export \.xlsx/i }).length).toBeGreaterThanOrEqual(1);
  });

  it("UnitConverterTool converts length units with shortcuts, presets and ConvertSheet MOATs", () => {
    render(<UnitConverterTool initialValues={{ dimension: "length", fromUnit: "km", toUnit: "mi", value: 50 }} />);
    expect(screen.getByText("Universal Unit Converter")).toBeInTheDocument();
    expect(screen.getByText("Unit Conversion Result")).toBeInTheDocument();

    // Verify 100% Client-Side Privacy Badge
    expect(screen.getByText(/100% Client-Side Privacy:/i)).toBeInTheDocument();

    // Verify 2026 Standards Freshness Signal
    expect(screen.getByText(/2026 BIPM & NIST Standards:/i)).toBeInTheDocument();

    // 50 km = 31.06856 miles
    expect(screen.getAllByText(/31\.069/i).length).toBeGreaterThanOrEqual(1);

    // Verify 44px touch targets on swap button
    const swapBtn = screen.getByRole("button", { name: /Swap units/i });
    expect(swapBtn).toHaveClass("min-h-[44px]");

    // Verify popular 1-tap shortcut button
    const kmMiBtn = screen.getByRole("button", { name: "km ↔ mi" });
    expect(kmMiBtn).toHaveClass("min-h-[44px]");

    // Verify Excel export button
    expect(screen.getAllByRole("button", { name: /Export to Excel \(\.xlsx\)|Export \.xlsx/i }).length).toBeGreaterThanOrEqual(1);
  });

  it("TipCalculator computes tips and splits bill per person with ConvertSheet MOATs", () => {
    localStorage.setItem("convertsheet-target-market", "IN");
    render(
      <CurrencyProvider>
        <TipCalculator initialValues={{ billAmount: 1200, tipPercent: "15", splitCount: 2 }} />
      </CurrencyProvider>
    );
    expect(screen.getByText(/Tip & Bill Splitter Calculator/i)).toBeInTheDocument();

    // Verify 100% Client-Side Privacy Badge
    expect(screen.getByText(/100% Client-Side Privacy:/i)).toBeInTheDocument();

    // Verify 2026 Dining Standards Freshness Signal
    expect(screen.getByText(/2026 Dining Standards:/i)).toBeInTheDocument();

    // Bill 1200, 15% tip = 180 tip, total 1380, per person (2 people) = 690
    // Present in both primary result card and mobile sticky bar
    expect(screen.getAllByText("₹690").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("₹180").length).toBeGreaterThanOrEqual(1);

    // Verify 44px min touch target on quick bills
    const billBtn = screen.getByRole("button", { name: "₹1200" });
    expect(billBtn).toHaveClass("min-h-[44px]");

    // Verify Excel export button
    expect(screen.getAllByRole("button", { name: /Export to Excel \(\.xlsx\)|Export \.xlsx/i }).length).toBeGreaterThanOrEqual(1);
  });

  it("ByteConverterTool converts digital storage units with ConvertSheet MOATs", () => {
    render(<ByteConverterTool initialValues={{ fileSize: 1024, sourceUnit: "MB", standard: "binary" }} />);
    expect(screen.getByText("Data Size & Byte Converter")).toBeInTheDocument();
    expect(screen.getByText("Storage Equivalents")).toBeInTheDocument();

    // Verify 100% Client-Side Privacy Badge
    expect(screen.getByText(/100% Client-Side Privacy:/i)).toBeInTheDocument();

    // Verify 2026 IEC/JEDEC Standards Freshness Signal
    expect(screen.getByText(/2026 IEC 80000-13 & JEDEC Standards:/i)).toBeInTheDocument();

    // Verify 44px Developer Capacity Presets
    const presetBtn = screen.getByRole("button", { name: /100 MiB \(Buffer Cap\)/i });
    expect(presetBtn).toHaveClass("min-h-[44px]");

    // Verify Developer Quick Arithmetic box (1048576 / 1024)
    expect(screen.getByText(/1,048,576 B ÷ 1,024 = 1,024 KiB = 1 MiB/i)).toBeInTheDocument();

    // 1024 MB in binary = 1,073,741,824 Bytes = 1 GB
    expect(screen.getAllByText("1,073,741,824 Bytes").length).toBeGreaterThanOrEqual(1);

    // Verify Excel export button
    expect(screen.getAllByRole("button", { name: /Export to Excel \(\.xlsx\)|Export \.xlsx/i }).length).toBeGreaterThanOrEqual(1);
  });
});
