import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PercentageCalculator } from "../PercentageCalculator";
import * as XLSX from "xlsx";

vi.mock("xlsx", () => ({
  utils: {
    book_new: vi.fn(() => ({})),
    json_to_sheet: vi.fn(() => ({})),
    book_append_sheet: vi.fn(),
  },
  writeFile: vi.fn(),
}));

describe("PercentageCalculator Suite", () => {
  it("renders with default 'whatIs' mode and calculates 15% of 200", () => {
    render(<PercentageCalculator />);
    expect(screen.getByText("Percentage Calculator")).toBeInTheDocument();
    expect(screen.getByText("6-in-1 Math Suite")).toBeInTheDocument();
    expect(screen.getByText("What is 15% of 200?")).toBeInTheDocument();
    expect(screen.getByText("15% × 200 = 30")).toBeInTheDocument();
  });

  it("switches to 'isWhatPercent' mode and calculates 30 is what % of 150", () => {
    render(<PercentageCalculator />);
    const modeBtn = screen.getByRole("button", { name: /X is what %/i });
    fireEvent.click(modeBtn);

    expect(screen.getByText("30 is what percent of 150?")).toBeInTheDocument();
    expect(screen.getByText("(30 / 150) × 100 = 20%")).toBeInTheDocument();
  });

  it("switches to '% Change' mode and calculates increase from 100 to 125", () => {
    render(<PercentageCalculator />);
    const modeBtn = screen.getByRole("button", { name: /% Change/i });
    fireEvent.click(modeBtn);

    expect(screen.getByText("Percentage change from 100 to 125")).toBeInTheDocument();
    expect(screen.getByText("+25%")).toBeInTheDocument();
    expect(screen.getByText("Growth (Increase)")).toBeInTheDocument();
  });

  it("switches to 'Discount & Sale' mode and calculates 25% off $80", () => {
    render(<PercentageCalculator />);
    const modeBtn = screen.getByRole("button", { name: /Discount & Sale/i });
    fireEvent.click(modeBtn);

    expect(screen.getByText("Final Sale Price (25% off)")).toBeInTheDocument();
    expect(screen.getByText("$60")).toBeInTheDocument();
    expect(screen.getByText("$20")).toBeInTheDocument(); // amount saved
  });

  it("switches to 'Sales Tax / VAT' mode and calculates tax on $120 at 8.25%", () => {
    render(<PercentageCalculator />);
    const modeBtn = screen.getByRole("button", { name: /Sales Tax \/ VAT/i });
    fireEvent.click(modeBtn);

    expect(screen.getByText("Total Price (Including Tax)")).toBeInTheDocument();
    expect(screen.getByText("$129.9")).toBeInTheDocument();
    expect(screen.getByText("$9.9")).toBeInTheDocument(); // tax amount
  });

  it("switches to 'Margin & Markup' mode and calculates selling price from cost and markup", () => {
    render(<PercentageCalculator />);
    const modeBtn = screen.getByRole("button", { name: /Margin & Markup/i });
    fireEvent.click(modeBtn);

    expect(screen.getByText("Recommended Selling Price")).toBeInTheDocument();
    expect(screen.getByText("$130")).toBeInTheDocument();
    expect(screen.getByText("$30")).toBeInTheDocument(); // profit
    expect(screen.getByText("23.08% gross margin")).toBeInTheDocument();
  });

  it("triggers XLSX download for the percentage matrix cheat sheet", () => {
    render(<PercentageCalculator />);
    const downloadBtn = screen.getByRole("button", { name: /Download \.xlsx Reference Sheet/i });
    fireEvent.click(downloadBtn);

    expect(XLSX.utils.book_new).toHaveBeenCalled();
    expect(XLSX.writeFile).toHaveBeenCalled();
  });
});
