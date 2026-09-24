import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CarLoanEarlyPayoffCard } from "../CarLoanEarlyPayoffCard";
import * as XLSX from "xlsx";

vi.mock("xlsx", () => ({
  utils: {
    book_new: vi.fn(() => ({})),
    json_to_sheet: vi.fn(() => ({})),
    book_append_sheet: vi.fn(),
  },
  writeFile: vi.fn(),
}));

describe("CarLoanEarlyPayoffCard Component", () => {
  const defaultProps = {
    loanAmount: 30000,
    interestRate: 6.5,
    loanTermMonths: 60,
  };

  it("renders early payoff engine with default $100 extra monthly payment", () => {
    render(<CarLoanEarlyPayoffCard {...defaultProps} />);

    expect(screen.getByText(/Early Loan Payoff Engine/i)).toBeInTheDocument();
    expect(screen.getByText(/Pay Extra & Eliminate Your Car Loan Faster/i)).toBeInTheDocument();
    expect(screen.getByText(/Export Early Payoff \(\.xlsx\)/i)).toBeInTheDocument();

    // Check metrics grid
    expect(screen.getByText("Interest Saved")).toBeInTheDocument();
    expect(screen.getByText("Time Shaved Off")).toBeInTheDocument();
    expect(screen.getByText("New Payoff Horizon")).toBeInTheDocument();
  });

  it("updates payoff calculation when clicking quick preset buttons", () => {
    render(<CarLoanEarlyPayoffCard {...defaultProps} />);

    const preset200 = screen.getByRole("button", { name: /\+\$200\/mo/i });
    fireEvent.click(preset200);

    const input = screen.getByLabelText(/Extra Monthly Principal Payment/i);
    expect(input).toHaveValue(200);
  });

  it("triggers XLSX export when Export Early Payoff is clicked", () => {
    render(<CarLoanEarlyPayoffCard {...defaultProps} />);

    const exportBtn = screen.getByRole("button", { name: /Export Early Payoff \(\.xlsx\)/i });
    fireEvent.click(exportBtn);

    expect(XLSX.utils.book_new).toHaveBeenCalled();
    expect(XLSX.utils.json_to_sheet).toHaveBeenCalled();
    expect(XLSX.writeFile).toHaveBeenCalled();
  });
});
