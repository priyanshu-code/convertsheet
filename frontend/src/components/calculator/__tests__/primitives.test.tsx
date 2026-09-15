import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  CalcCard,
  CalcInput,
  CalcSlider,
  CalcSelect,
  CalcToggle,
  CalcTextarea,
  CalcCopyButton,
  CalcResult,
} from "../index";

describe("Calculator Primitives Design System", () => {
  it("CalcCard renders title, subtitle, and badge", () => {
    render(
      <CalcCard title="Test Title" subtitle="Test Subtitle" badge="New">
        <div>Child Content</div>
      </CalcCard>
    );
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Subtitle")).toBeInTheDocument();
    expect(screen.getByText("New")).toBeInTheDocument();
    expect(screen.getByText("Child Content")).toBeInTheDocument();
  });

  it("CalcInput renders label, prefix, suffix, and triggers onChange", () => {
    const handleChange = vi.fn();
    render(
      <CalcInput
        id="test-input"
        label="Test Input"
        value={100}
        onChange={handleChange}
        prefix="$"
        suffix="USD"
      />
    );
    expect(screen.getByLabelText("Test Input")).toBeInTheDocument();
    expect(screen.getByText("$")).toBeInTheDocument();
    expect(screen.getByText("USD")).toBeInTheDocument();

    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "250" } });
    expect(handleChange).toHaveBeenCalledWith("250");
  });

  it("CalcSlider renders label, min, max, and handles slider change", () => {
    const handleChange = vi.fn();
    render(
      <CalcSlider
        id="test-slider"
        label="Interest Rate"
        value={12}
        min={1}
        max={30}
        unit="%"
        onChange={handleChange}
      />
    );
    expect(screen.getByText("Interest Rate")).toBeInTheDocument();
    expect(screen.getByText("12 %")).toBeInTheDocument();

    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "15" } });
    expect(handleChange).toHaveBeenCalledWith(15);
  });

  it("CalcSelect renders options and handles selection", () => {
    const handleChange = vi.fn();
    const options = [
      { value: "monthly", label: "Monthly" },
      { value: "yearly", label: "Yearly" },
    ];
    render(
      <CalcSelect
        id="test-select"
        label="Frequency"
        value="monthly"
        options={options}
        onChange={handleChange}
      />
    );
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "yearly" } });
    expect(handleChange).toHaveBeenCalledWith("yearly");
  });

  it("CalcToggle handles option switching", () => {
    const handleChange = vi.fn();
    const options = [
      { value: "add", label: "Add GST" },
      { value: "remove", label: "Remove GST" },
    ];
    render(
      <CalcToggle value="add" options={options} onChange={handleChange} />
    );
    const removeBtn = screen.getByRole("button", { name: "Remove GST" });
    fireEvent.click(removeBtn);
    expect(handleChange).toHaveBeenCalledWith("remove");
  });

  it("CalcTextarea handles text input and character counts", () => {
    const handleChange = vi.fn();
    render(
      <CalcTextarea
        id="test-textarea"
        label="JSON Input"
        value='{"key": "val"}'
        onChange={handleChange}
      />
    );
    expect(screen.getByText("14 chars")).toBeInTheDocument();
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "hello" } });
    expect(handleChange).toHaveBeenCalledWith("hello");
  });

  it("CalcCopyButton handles clipboard copy", async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    render(<CalcCopyButton textToCopy="Copy text" label="Copy All" />);
    const copyBtn = screen.getByRole("button", { name: "Copy All" });
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("Copy text");
  });

  it("CalcResult displays primary value and grid items", () => {
    render(
      <CalcResult
        title="Summary"
        primaryLabel="Total Returns"
        primaryValue="₹1,25,000"
        items={[
          { label: "Invested", value: "₹50,000" },
          { label: "Gains", value: "₹75,000", highlight: true },
        ]}
      />
    );
    expect(screen.getByText("Summary")).toBeInTheDocument();
    expect(screen.getByText("Total Returns")).toBeInTheDocument();
    expect(screen.getByText("₹1,25,000")).toBeInTheDocument();
    expect(screen.getByText("Invested")).toBeInTheDocument();
    expect(screen.getByText("₹50,000")).toBeInTheDocument();
    expect(screen.getByText("Gains")).toBeInTheDocument();
    expect(screen.getByText("₹75,000")).toBeInTheDocument();
  });
});
