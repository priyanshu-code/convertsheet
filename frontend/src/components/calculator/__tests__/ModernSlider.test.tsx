import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ModernSlider } from "../index";

describe("ModernSlider", () => {
  const defaultProps = {
    id: "test-age",
    label: "Current Age",
    value: 30,
    min: 18,
    max: 80,
    step: 1,
    prefix: "",
    suffix: "yrs",
    helpText: "Enter your age in years",
    presets: [
      { label: "25", value: 25 },
      { label: "30", value: 30 },
      { label: "40", value: 40 },
    ],
    onChange: vi.fn(),
  };

  it("renders label, numeric input, and slider range input with proper accessibility roles", () => {
    render(<ModernSlider {...defaultProps} />);

    // Check label
    expect(screen.getByText("Current Age")).toBeInTheDocument();

    // Check numeric input
    const numericInput = screen.getByLabelText("Current Age numeric input");
    expect(numericInput).toBeInTheDocument();
    expect(numericInput).toHaveAttribute("type", "number");
    expect(numericInput).toHaveValue(30);

    // Check slider range input and accessibility attributes
    const slider = screen.getByRole("slider");
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute("type", "range");
    expect(slider).toHaveAttribute("aria-label", "Current Age");
    expect(slider).toHaveAttribute("aria-valuenow", "30");
    expect(slider).toHaveAttribute("aria-valuemin", "18");
    expect(slider).toHaveAttribute("aria-valuemax", "80");
    expect(slider).toHaveValue("30");

    // Dynamic gradient background style should be set on slider
    expect(slider).toHaveStyle({
      background:
        "linear-gradient(to right, #10b981 0%, #10b981 19.35483870967742%, #e4e4e7 19.35483870967742%, #e4e4e7 100%)",
    });

    // Check help text
    expect(screen.getByText("Enter your age in years")).toBeInTheDocument();
  });

  it("renders preset chips and fires onChange when preset chip is clicked", () => {
    const onChange = vi.fn();
    render(<ModernSlider {...defaultProps} onChange={onChange} />);

    // Presets should be rendered with label and suffix
    expect(screen.getByText("25 yrs")).toBeInTheDocument();
    expect(screen.getByText("30 yrs")).toBeInTheDocument();
    expect(screen.getByText("40 yrs")).toBeInTheDocument();

    // Active preset (value 30) should have active styling class
    const activeChip = screen.getByRole("button", { name: "30 yrs" });
    expect(activeChip.className).toContain("bg-emerald-600");

    // Click inactive preset
    const chip40 = screen.getByRole("button", { name: "40 yrs" });
    fireEvent.click(chip40);
    expect(onChange).toHaveBeenCalledWith(40);
  });

  it("updates value when range input is dragged or numeric input is changed", () => {
    const onChange = vi.fn();
    render(<ModernSlider {...defaultProps} onChange={onChange} />);

    // Change slider range input
    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "35" } });
    expect(onChange).toHaveBeenCalledWith(35);

    // Change numeric input
    const numericInput = screen.getByLabelText("Current Age numeric input");
    fireEvent.change(numericInput, { target: { value: "45" } });
    expect(onChange).toHaveBeenCalledWith(45);
  });

  it("renders prefix and handles disabled state", () => {
    const onChange = vi.fn();
    render(
      <ModernSlider
        id="savings"
        label="Monthly Savings"
        value={500}
        min={0}
        max={5000}
        prefix="$"
        suffix="/mo"
        presets={[{ label: "500", value: 500 }]}
        disabled={true}
        onChange={onChange}
      />
    );

    expect(screen.getByText("$")).toBeInTheDocument();
    expect(screen.getByText("/mo")).toBeInTheDocument();

    const slider = screen.getByRole("slider");
    expect(slider).toBeDisabled();

    const numericInput = screen.getByLabelText("Monthly Savings numeric input");
    expect(numericInput).toBeDisabled();

    const chip = screen.getByRole("button", { name: "$500 /mo" });
    expect(chip).toBeDisabled();
  });
});
