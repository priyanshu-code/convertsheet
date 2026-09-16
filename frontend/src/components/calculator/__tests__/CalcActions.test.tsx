import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CalcPromptButton } from "../CalcPromptButton";
import { CalcExportButton } from "../CalcExportButton";
import * as XLSX from "xlsx";

vi.mock("xlsx", () => ({
  utils: {
    json_to_sheet: vi.fn(),
    book_new: vi.fn(),
    book_append_sheet: vi.fn(),
  },
  writeFile: vi.fn(),
}));

describe("CalcPromptButton & CalcExportButton", () => {
  it("CalcPromptButton copies text to clipboard", async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    render(<CalcPromptButton promptText="Analyze my mortgage" label="Copy Prompt" />);
    const btn = screen.getByRole("button", { name: "Copy Prompt" });
    fireEvent.click(btn);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("Analyze my mortgage");
  });

  it("CalcExportButton triggers SheetJS writeFile", () => {
    const data = [{ Year: "Yr 1", Value: 1000 }];
    render(<CalcExportButton filename="test" data={data} label="Download Excel" />);
    const btn = screen.getByRole("button", { name: "Download Excel" });
    fireEvent.click(btn);
    expect(XLSX.writeFile).toHaveBeenCalled();
  });
});
