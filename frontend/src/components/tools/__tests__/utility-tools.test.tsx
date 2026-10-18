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

  it("BmiCalculator calculates BMI and classifies weight categories", () => {
    render(<BmiCalculator />);
    expect(screen.getByText(/Body Mass Index \(BMI\) Calculator/i)).toBeInTheDocument();

    // 70kg at 175cm = 22.9 BMI (Normal weight)
    expect(screen.getByText("22.9")).toBeInTheDocument();
    expect(screen.getAllByText("Normal (Healthy) weight").length).toBeGreaterThanOrEqual(1);
  });

  it("UnitConverterTool converts length units with shortcuts and quick chips", () => {
    render(<UnitConverterTool />);
    expect(screen.getByText("Universal Unit Converter")).toBeInTheDocument();
    expect(screen.getByText("Unit Conversion Result")).toBeInTheDocument();

    // Verify popular 1-tap shortcut button
    const kmMiBtn = screen.getByRole("button", { name: "km ↔ mi" });
    expect(kmMiBtn).toBeInTheDocument();
    fireEvent.click(kmMiBtn);

    // Verify quick value chip
    const val50Btn = screen.getByRole("button", { name: "50" });
    expect(val50Btn).toBeInTheDocument();
    fireEvent.click(val50Btn);

    // 50 km = ~31.069 miles
    expect(screen.getAllByText(/31\.069/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole("button", { name: /copy/i }).length).toBeGreaterThanOrEqual(1);
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

  it("ByteConverterTool converts digital storage units", () => {
    render(<ByteConverterTool />);
    expect(screen.getByText("Data Size & Byte Converter")).toBeInTheDocument();
    expect(screen.getByText("Storage Equivalents")).toBeInTheDocument();
  });
});
