import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { AiDataPrepTool } from "../AiDataPrepTool";

describe("AiDataPrepTool", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders upload zone and sample dataset quick-start options", () => {
    render(<AiDataPrepTool />);

    expect(screen.getByText(/AI Dataset & JSONL Studio/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Drop your CSV, Excel, or JSON dataset here/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Client-Side Privacy/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Customer Support Chat Logs/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Python Code Assistant/i)
    ).toBeInTheDocument();
  });

  it("loads sample dataset and displays role mapper, tokens, and JSONL preview", () => {
    render(<AiDataPrepTool />);

    // Click sample dataset button
    const sampleBtn = screen.getByText(/Customer Support Chat Logs/i);
    fireEvent.click(sampleBtn);

    // Active file info
    expect(screen.getByText(/customer-support-sample.csv/i)).toBeInTheDocument();
    expect(screen.getByText(/4 rows, 4 columns/i)).toBeInTheDocument();

    // Auto-detected roles applied badge
    expect(screen.getByText(/Auto-detected roles applied/i)).toBeInTheDocument();

    // Metrics cards rendered
    expect(screen.getByText(/Total Tokens/i)).toBeInTheDocument();
    expect(screen.getByText(/Avg Tokens \/ Row/i)).toBeInTheDocument();
    expect(screen.getByText(/Fine-Tune Cost/i)).toBeInTheDocument();

    // Preview tabs
    expect(screen.getByText(/JSONL Preview/i)).toBeInTheDocument();
    expect(screen.getByText(/JSON Array/i)).toBeInTheDocument();
    expect(screen.getByText(/RAG Markdown/i)).toBeInTheDocument();

    // Download button
    expect(screen.getByText(/Download .JSONL/i)).toBeInTheDocument();
  });

  it("switches format presets and tabs seamlessly", () => {
    render(<AiDataPrepTool />);

    // Load sample
    fireEvent.click(screen.getByText(/Customer Support Chat Logs/i));

    // Switch to Anthropic Claude JSONL
    const anthropicBtn = screen.getByText(/Anthropic Claude JSONL/i);
    fireEvent.click(anthropicBtn);

    // Switch to JSON Array tab
    const jsonTab = screen.getByText(/JSON Array/i);
    fireEvent.click(jsonTab);

    expect(screen.getByText(/Formatted JSON Object Array/i)).toBeInTheDocument();

    // Switch to RAG Markdown tab
    const mdTab = screen.getByText(/RAG Markdown/i);
    fireEvent.click(mdTab);

    expect(screen.getByText(/RAG Context Markdown Table/i)).toBeInTheDocument();
  });

  it("clears file when Clear File button is clicked", () => {
    render(<AiDataPrepTool />);

    // Load sample
    fireEvent.click(screen.getByText(/Customer Support Chat Logs/i));
    expect(screen.getByText(/customer-support-sample.csv/i)).toBeInTheDocument();

    // Clear file
    const clearBtn = screen.getByText(/Clear File/i);
    fireEvent.click(clearBtn);

    // Returned to upload dropzone
    expect(
      screen.getByText(/Drop your CSV, Excel, or JSON dataset here/i)
    ).toBeInTheDocument();
  });

  it("supports switching to Paste tab and parsing pasted CSV dataset", () => {
    render(<AiDataPrepTool />);

    // Switch to Paste tab
    const pasteTab = screen.getByRole("button", { name: /Paste CSV \/ JSON/i });
    fireEvent.click(pasteTab);

    const textarea = screen.getByLabelText(/Paste CSV or JSON dataset/i) as HTMLTextAreaElement;
    expect(textarea).toBeInTheDocument();

    const sampleCsv = `prompt,completion,category\n"How do I reset password?","Click forgot password.","auth"\n"How to cancel plan?","Go to settings.","billing"`;
    fireEvent.change(textarea, { target: { value: sampleCsv } });

    // Format button
    const formatBtn = screen.getByRole("button", { name: /Format/i });
    fireEvent.click(formatBtn);
    expect(textarea.value.length).toBeGreaterThan(0);

    // Parse button
    const parseBtn = screen.getByRole("button", { name: /Parse & Prepare Dataset/i });
    fireEvent.click(parseBtn);

    // Active file info
    expect(screen.getByText(/pasted-dataset.csv/i)).toBeInTheDocument();
    expect(screen.getByText(/2 rows, 3 columns/i)).toBeInTheDocument();
    expect(screen.getByText(/JSONL Preview/i)).toBeInTheDocument();
  });

  it("supports parsing pasted JSON records array in Paste tab", () => {
    render(<AiDataPrepTool />);

    // Switch to Paste tab
    fireEvent.click(screen.getByRole("button", { name: /Paste CSV \/ JSON/i }));

    const textarea = screen.getByLabelText(/Paste CSV or JSON dataset/i);
    const sampleJson = JSON.stringify([
      { input: "Explain recursion", output: "A function calling itself", tag: "cs" },
      { input: "What is an API?", output: "Application programming interface", tag: "dev" }
    ]);
    fireEvent.change(textarea, { target: { value: sampleJson } });

    fireEvent.click(screen.getByRole("button", { name: /Parse & Prepare Dataset/i }));

    expect(screen.getByText(/pasted-dataset.json/i)).toBeInTheDocument();
    expect(screen.getByText(/2 rows, 3 columns/i)).toBeInTheDocument();
  });
});

