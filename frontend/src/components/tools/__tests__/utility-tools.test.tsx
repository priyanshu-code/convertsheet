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
  it("AgeCalculator calculates chronological age", () => {
    render(<AgeCalculator />);
    expect(screen.getByText("Chronological Age Calculator")).toBeInTheDocument();
    expect(screen.getByText("Exact Chronological Age")).toBeInTheDocument();
  });

  it("DateDifferenceCalculator calculates calendar and business days", () => {
    render(<DateDifferenceCalculator />);
    expect(screen.getByText("Date Difference & Duration Calculator")).toBeInTheDocument();
    expect(screen.getByText("Duration Calculation")).toBeInTheDocument();
    expect(screen.getByText(/Working Business Days/i)).toBeInTheDocument();
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

  it("TipCalculator computes tips and splits bill per person", () => {
    localStorage.setItem("convertsheet-target-market", "IN");
    render(
      <CurrencyProvider>
        <TipCalculator />
      </CurrencyProvider>
    );
    expect(screen.getByText(/Tip & Bill Splitter Calculator/i)).toBeInTheDocument();

    // Bill 1200, 15% tip = 180 tip, total 1380, per person (2 people) = 690
    expect(screen.getByText("₹690")).toBeInTheDocument();
    expect(screen.getByText("₹180")).toBeInTheDocument();
  });

  it("ByteConverterTool converts digital storage units", () => {
    render(<ByteConverterTool />);
    expect(screen.getByText("Data Size & Byte Converter")).toBeInTheDocument();
    expect(screen.getByText("Storage Equivalents")).toBeInTheDocument();
  });
});
