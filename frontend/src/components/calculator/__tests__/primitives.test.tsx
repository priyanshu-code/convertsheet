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

  it("CalcCard title wraps and does not have truncate class", () => {
    render(
      <CalcCard title="Debt Elimination Summary">
        <div>Content</div>
      </CalcCard>
    );
    const titleHeading = screen.getByRole("heading", { level: 2, name: "Debt Elimination Summary" });
    expect(titleHeading).toBeInTheDocument();
    expect(titleHeading.className).not.toContain("truncate");
    expect(titleHeading.className).toContain("break-words");
  });

  it("CalcResult supports configurable columns prop defaulting to auto", () => {
    const items = [
      { label: "Item 1", value: "100" },
      { label: "Item 2", value: "200" },
    ];
    const { rerender, container } = render(<CalcResult items={items} />);
    const gridEl = container.querySelector(".grid");
    expect(gridEl?.className).toContain("grid-cols-1 sm:grid-cols-2 lg:grid-cols-3");

    rerender(<CalcResult items={items} columns={2} />);
    expect(gridEl?.className).toContain("grid-cols-1 sm:grid-cols-2");
    expect(gridEl?.className).not.toContain("lg:grid-cols-3");

    rerender(<CalcResult items={items} columns={1} />);
    expect(gridEl?.className).toContain("grid-cols-1");
    expect(gridEl?.className).not.toContain("sm:grid-cols-2");

    rerender(<CalcResult items={items} columns={3} />);
    expect(gridEl?.className).toContain("grid-cols-1 sm:grid-cols-2 lg:grid-cols-3");

    rerender(<CalcResult items={items} columns="auto" />);
    expect(gridEl?.className).toContain("grid-cols-1 sm:grid-cols-2 lg:grid-cols-3");
  });

  it("CalcResult renders item values with whitespace-nowrap font-mono tracking-tight", () => {
    render(
      <CalcResult
        items={[{ label: "Total Amount", value: "$1,234,567.89", subtext: "Detailed explanation text that could span multiple lines without being clipped" }]}
      />
    );
    const valueEl = screen.getByText("$1,234,567.89");
    expect(valueEl.className).toContain("whitespace-nowrap");
    expect(valueEl.className).toContain("font-mono");
    expect(valueEl.className).toContain("tracking-tight");

    const subtextEl = screen.getByText("Detailed explanation text that could span multiple lines without being clipped");
    expect(subtextEl.className).not.toContain("truncate");
    expect(subtextEl.className).toContain("line-clamp-2");
  });
});

