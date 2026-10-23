import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { RetirementCalculator } from "../RetirementCalculator";
import { CurrencyProvider } from "@/context/CurrencyContext";

describe("RetirementCalculator Moat & Mobile UX", () => {
  afterEach(() => {
    window.history.replaceState(null, "", "/tools/retirement-calculator");
  });

  it("renders with Zero-Knowledge privacy badge, mode switcher, and computes retirement nest egg", () => {
    render(
      <CurrencyProvider>
        <RetirementCalculator initialValues={{ currentAge: 32, retirementAge: 65, monthlyContribution: 1000 }} />
      </CurrencyProvider>
    );

    expect(
      screen.getByText(/Zero-Knowledge Client-Side Engine • No net worth or retirement data sent to servers • 100% Private/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Retirement & 401\(k\) Nest Egg Calculator/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Export/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Portfolio at Retirement/i).length).toBeGreaterThan(0);
  });

  it("synchronizes age and contribution parameter updates to URL query permalinks", () => {
    render(
      <CurrencyProvider>
        <RetirementCalculator initialValues={{ currentAge: 35, retirementAge: 60, currentSavings: 50000, monthlyContribution: 1200 }} />
      </CurrencyProvider>
    );

    expect(window.location.search).toContain("currentAge=35");
    expect(window.location.search).toContain("retirementAge=60");
    expect(window.location.search).toContain("monthlyContribution=1200");
  });

  it("supports mode switching with 44px minimum touch targets", () => {
    render(
      <CurrencyProvider>
        <RetirementCalculator />
      </CurrencyProvider>
    );

    const playgroundBtn = screen.getByText("Interactive Playground").closest("button");
    const wizardBtn = screen.getByText("3-Step Guided Journey").closest("button");

    expect(playgroundBtn).toHaveClass("min-h-[44px]");
    expect(wizardBtn).toHaveClass("min-h-[44px]");

    fireEvent.click(wizardBtn!);
    expect(screen.getByText(/Step 1 of 3/i)).toBeInTheDocument();
  });

  it("displays October 2026 market rate freshness signal and 44px retirement archetype presets", () => {
    render(
      <CurrencyProvider>
        <RetirementCalculator />
      </CurrencyProvider>
    );

    // Freshness signal
    expect(
      screen.getByText(/Updated for October 2026: 2026 IRS 401\(k\) Limit \$23,500/i)
    ).toBeInTheDocument();

    // Archetype presets with 44px min touch target
    const fireBtn = screen.getByText("Early FIRE 50").closest("button");
    expect(fireBtn).toBeInTheDocument();
    expect(fireBtn).toHaveClass("min-h-[44px]");

    fireEvent.click(fireBtn!);
    expect(window.location.search).toContain("currentAge=28");
    expect(window.location.search).toContain("retirementAge=50");
    expect(window.location.search).toContain("monthlyContribution=2000");
  });
});
