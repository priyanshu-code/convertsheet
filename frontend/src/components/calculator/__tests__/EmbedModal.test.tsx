import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { EmbedModal } from "../EmbedModal";
import { EmbedTrigger } from "../EmbedTrigger";
import { ToolConfig } from "@/types/tool";

const mockTool: ToolConfig = {
  slug: "mortgage-calculator",
  name: "Mortgage Calculator",
  title: "Free Mortgage Calculator with Amortization Schedule",
  metaDescription: "Calculate mortgage payments, interest, and amortization.",
  category: "financial",
  keywords: ["mortgage", "calculator"],
  answerSummary: "Monthly mortgage payment calculator with amortization schedule export.",
  about: "Detailed mortgage calculation tool.",
};

describe("EmbedModal & EmbedTrigger Components", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("does not render modal when isOpen is false", () => {
    const onClose = vi.fn();
    render(<EmbedModal tool={mockTool} isOpen={false} onClose={onClose} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders modal with embed snippet and handles size presets", () => {
    const onClose = vi.fn();
    render(<EmbedModal tool={mockTool} isOpen={true} onClose={onClose} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/Embed Mortgage Calculator on Your Website/i)).toBeInTheDocument();

    const preSnippet = screen.getByText(/iframe src="https:\/\/www\.convertsheet\.com\/embed\/mortgage-calculator"/i);
    expect(preSnippet.textContent).toContain('src="https://www.convertsheet.com/embed/mortgage-calculator"');
    expect(preSnippet.textContent).toContain('Powered by <a href="https://www.convertsheet.com/tools/mortgage-calculator"');

    // Click "Compact (500px)" preset
    const compactBtn = screen.getByRole("button", { name: /Compact/i });
    fireEvent.click(compactBtn);
    expect(preSnippet.textContent).toContain('width="500"');
    expect(preSnippet.textContent).toContain('height="600"');

    // Click "Standard (750px)" preset
    const standardBtn = screen.getByRole("button", { name: /Standard/i });
    fireEvent.click(standardBtn);
    expect(preSnippet.textContent).toContain('width="750"');
    expect(preSnippet.textContent).toContain('height="650"');

    // Close button
    const closeBtn = screen.getByLabelText(/Close embed modal/i);
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it("copies embed snippet to clipboard on button click", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<EmbedModal tool={mockTool} isOpen={true} onClose={vi.fn()} />);

    const copyBtn = screen.getByRole("button", { name: /Copy HTML Code/i });
    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(writeTextMock).toHaveBeenCalled();
    expect(screen.getByText(/Copied to Clipboard!/i)).toBeInTheDocument();
  });

  it("EmbedTrigger renders embed button and opens modal upon click", () => {
    render(<EmbedTrigger tool={mockTool} />);

    const embedBtn = screen.getByRole("button", { name: /Embed calculator widget/i });
    expect(embedBtn).toBeInTheDocument();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(embedBtn);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
