import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { RetirementDonutBreakdown } from "../RetirementDonutBreakdown";

describe("RetirementDonutBreakdown", () => {
  it("renders total nest egg and breakdown percentages", () => {
    render(
      <RetirementDonutBreakdown
        totalNestEgg={1000000}
        totalContributions={300000}
        totalInterestEarned={600000}
        employerMatchAmount={100000}
        retirementAge={65}
      />
    );
    expect(screen.getByText("$1,000,000")).toBeInTheDocument();
    expect(screen.getByText(/Personal Principal/i)).toBeInTheDocument();
    expect(screen.getByText(/Compound Growth/i)).toBeInTheDocument();
    expect(screen.getByText(/Employer Match/i)).toBeInTheDocument();
    expect(screen.getByText("60% from Compounding")).toBeInTheDocument();
    expect(screen.getByText("Total at 65")).toBeInTheDocument();
  });

  it("omits employer match slice when employerMatchAmount is 0 or undefined", () => {
    render(
      <RetirementDonutBreakdown
        totalNestEgg={500000}
        totalContributions={200000}
        totalInterestEarned={300000}
        retirementAge={60}
      />
    );
    expect(screen.getByText("$500,000")).toBeInTheDocument();
    expect(screen.queryByText(/Employer Match/i)).not.toBeInTheDocument();
    expect(screen.getByText("60% from Compounding")).toBeInTheDocument();
  });

  it("handles zero total gracefully", () => {
    render(
      <RetirementDonutBreakdown
        totalNestEgg={0}
        totalContributions={0}
        totalInterestEarned={0}
        retirementAge={65}
      />
    );
    expect(screen.getAllByText("$0").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("0% from Compounding")).toBeInTheDocument();
  });
});
