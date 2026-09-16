import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, createEvent, act } from "@testing-library/react";
import { CONVERTER_REGISTRY } from "@/lib/registry";
import { TabularData } from "@/types/converter";
import { MAX_FREE_FILE_SIZE_BYTES } from "@/hooks/useConverter";
import { DropZone } from "../DropZone";
import { DataPreviewTable } from "../DataPreviewTable";
import { FormatSelector } from "../FormatSelector";
import { ProUpgradeModal } from "../ProUpgradeModal";
import { ConverterCard } from "../ConverterCard";

describe("Converter Components", () => {
  const jsonConfig = CONVERTER_REGISTRY["json-to-excel"];
  const excelConfig = CONVERTER_REGISTRY["excel-to-json"];
  const csvConfig = CONVERTER_REGISTRY["csv-to-excel"];
  const pdfConfig = CONVERTER_REGISTRY["pdf-to-excel"];

  describe("DropZone", () => {
    it("renders upload prompt and source format", () => {
      render(<DropZone config={jsonConfig} onFileSelect={() => {}} />);

      expect(screen.getByText(/Drop your JSON file here or/i)).toBeInTheDocument();
      expect(screen.getByText("browse")).toBeInTheDocument();
      expect(screen.getByText(".json")).toBeInTheDocument();
      expect(
        screen.getByText(/Processed locally in browser - never uploaded to any server/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Max 10MB for free in-browser conversion/i)
      ).toBeInTheDocument();
    });

    it("renders multiple accepted extension pills when config specifies additionalExtensions", () => {
      render(<DropZone config={excelConfig} onFileSelect={() => {}} />);

      expect(screen.getByText(".xlsx")).toBeInTheDocument();
      expect(screen.getByText(".xls")).toBeInTheDocument();
    });

    it("applies disabled attributes when disabled is true", () => {
      render(<DropZone config={jsonConfig} onFileSelect={() => {}} disabled={true} />);

      const button = screen.getByRole("button", { name: /Upload JSON file/i });
      expect(button).toHaveAttribute("aria-disabled", "true");
      expect(button).toHaveClass("pointer-events-none");
    });

    it("prevents drag leave flicker when relatedTarget is inside dropzone", () => {
      const { getByTestId } = render(<DropZone config={jsonConfig} onFileSelect={() => {}} />);
      const dropzone = getByTestId("dropzone-area");
      const child = dropzone.querySelector("h2") as HTMLElement;

      fireEvent.dragOver(dropzone, { dataTransfer: { files: [] } });
      expect(dropzone).toHaveClass("border-emerald-500");

      // Leave to a child element inside the dropzone
      const dragLeaveEvent = createEvent.dragLeave(dropzone);
      Object.defineProperty(dragLeaveEvent, "relatedTarget", { value: child });
      fireEvent(dropzone, dragLeaveEvent);
      expect(dropzone).toHaveClass("border-emerald-500");

      // Leave to outside
      const outside = document.createElement("div");
      document.body.appendChild(outside);
      const dragLeaveOutside = createEvent.dragLeave(dropzone);
      Object.defineProperty(dragLeaveOutside, "relatedTarget", { value: outside });
      fireEvent(dropzone, dragLeaveOutside);
      expect(dropzone).not.toHaveClass("border-emerald-500");
      document.body.removeChild(outside);
    });

    it("stops propagation on hidden file input click", () => {
      const parentClick = vi.fn();
      const { container } = render(
        <div onClick={parentClick}>
          <DropZone config={jsonConfig} onFileSelect={() => {}} />
        </div>
      );

      const input = container.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.click(input);
      expect(parentClick).not.toHaveBeenCalled();
    });
  });

  describe("DataPreviewTable", () => {
    const samplePreview: TabularData = {
      columns: ["id", "name", "isActive", "details", "score", "missing"],
      rows: [
        {
          id: 1,
          name: "Alice",
          isActive: true,
          details: { role: "Admin" },
          score: 95.5,
          missing: null,
        },
        {
          id: 2,
          name: "Bob",
          isActive: false,
          details: { role: "User" },
          score: 80,
          missing: undefined,
        },
      ],
      totalRows: 25,
    };

    it("renders table headers and row data correctly", () => {
      render(<DataPreviewTable preview={samplePreview} maxDisplayRows={10} />);

      // Header columns
      expect(screen.getByText("id")).toBeInTheDocument();
      expect(screen.getByText("name")).toBeInTheDocument();
      expect(screen.getByText("isActive")).toBeInTheDocument();
      expect(screen.getByText("details")).toBeInTheDocument();
      expect(screen.getByText("score")).toBeInTheDocument();

      // Cell data
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("Bob")).toBeInTheDocument();
      expect(screen.getByText("true")).toBeInTheDocument();
      expect(screen.getByText("false")).toBeInTheDocument();
      expect(screen.getByText('{"role":"Admin"}')).toBeInTheDocument();
      expect(screen.getByText("95.5")).toBeInTheDocument();
      expect(screen.getAllByText("null").length).toBeGreaterThanOrEqual(1);

      // Row count badge
      expect(
        screen.getByText(/Showing preview of first 2 rows \(25 total rows detected\)/i)
      ).toBeInTheDocument();
    });

    it("renders all rows message when totalRows matches row count", () => {
      const smallPreview: TabularData = {
        columns: ["title"],
        rows: [{ title: "Item 1" }, { title: "Item 2" }],
        totalRows: 2,
      };

      render(<DataPreviewTable preview={smallPreview} />);
      expect(screen.getByText(/Showing preview of all 2 rows/i)).toBeInTheDocument();
    });

    it("renders empty state message when rows array is empty", () => {
      const emptyPreview: TabularData = {
        columns: ["col1", "col2"],
        rows: [],
        totalRows: 0,
      };

      render(<DataPreviewTable preview={emptyPreview} />);
      expect(screen.getByText(/No preview rows available/i)).toBeInTheDocument();
    });

    it("safely handles circular object references in cells without throwing", () => {
      const circularObj: any = { name: "loop" };
      circularObj.self = circularObj;

      const circularPreview: TabularData = {
        columns: ["data"],
        rows: [{ data: circularObj }],
        totalRows: 1,
      };

      render(<DataPreviewTable preview={circularPreview} />);
      expect(screen.getByText("[Object]")).toBeInTheDocument();
    });

    it("preserves totalRows when totalRows is 0 using nullish coalescing", () => {
      const zeroTotalPreview: TabularData = {
        columns: ["col"],
        rows: [],
        totalRows: 0,
      };

      render(<DataPreviewTable preview={zeroTotalPreview} />);
      expect(screen.getByText(/Showing preview of all 0 rows/i)).toBeInTheDocument();
    });
  });

  describe("FormatSelector", () => {
    it("renders source and target format badges and options trigger", () => {
      render(
        <FormatSelector
          config={jsonConfig}
          options={{ sheetName: "Sheet1", delimiter: ",", prettify: true }}
          onOptionsChange={() => {}}
        />
      );

      expect(screen.getByText("JSON")).toBeInTheDocument();
      expect(screen.getByText(".json")).toBeInTheDocument();
      expect(screen.getByText("Excel")).toBeInTheDocument();
      expect(screen.getByText(".xlsx")).toBeInTheDocument();
      expect(screen.getByText("Conversion Options")).toBeInTheDocument();
    });

    it("sets aria-pressed correctly on delimiter buttons", () => {
      render(
        <FormatSelector
          config={csvConfig}
          options={{ sheetName: "Sheet1", delimiter: ",", prettify: true }}
          onOptionsChange={() => {}}
        />
      );

      // Open accordion
      fireEvent.click(screen.getByText("Conversion Options"));

      const commaBtn = screen.getByRole("button", { name: "Comma (,)" });
      const semicolonBtn = screen.getByRole("button", { name: "Semicolon (;)" });

      expect(commaBtn).toHaveAttribute("aria-pressed", "true");
      expect(semicolonBtn).toHaveAttribute("aria-pressed", "false");
    });
  });

  describe("ProUpgradeModal", () => {
    afterEach(() => {
      document.body.style.overflow = "";
    });

    it("returns null when isOpen is false", () => {
      const { container } = render(
        <ProUpgradeModal isOpen={false} onClose={() => {}} />
      );
      expect(container.firstChild).toBeNull();
    });

    it("renders modal dialog, reason, feature list, and pricing CTA when isOpen is true", () => {
      const customReason = "File exceeds 10MB limit for free tier.";
      render(
        <ProUpgradeModal
          isOpen={true}
          onClose={() => {}}
          reason={customReason}
        />
      );

      expect(screen.getByText("ConvertSheet Pro Required")).toBeInTheDocument();
      expect(screen.getByText("Upgrade to Pro for Heavy Files")).toBeInTheDocument();
      expect(screen.getByText(customReason)).toBeInTheDocument();

      // Features
      expect(screen.getByText("Up to 100GB Files")).toBeInTheDocument();
      expect(screen.getByText("Batch Conversion")).toBeInTheDocument();
      expect(screen.getByText("15-Min Auto File Wipe")).toBeInTheDocument();
      expect(screen.getByText("Developer REST API & CLI")).toBeInTheDocument();

      // CTA
      const ctaLink = screen.getByRole("link", { name: /View Pro Plans/i });
      expect(ctaLink).toBeInTheDocument();
      expect(ctaLink).toHaveAttribute("href", "/pricing");
    });

    it("locks body scroll on mount and restores on close", () => {
      const { rerender } = render(
        <ProUpgradeModal isOpen={true} onClose={() => {}} />
      );

      expect(document.body.style.overflow).toBe("hidden");

      rerender(<ProUpgradeModal isOpen={false} onClose={() => {}} />);
      expect(document.body.style.overflow).toBe("");
    });

    it("traps focus inside dialog on Tab and Shift+Tab", () => {
      render(<ProUpgradeModal isOpen={true} onClose={() => {}} />);

      const closeBtn = screen.getByLabelText("Close modal");
      const cancelBtn = screen.getByRole("button", { name: "Cancel" });

      // Focus last element and press Tab
      cancelBtn.focus();
      expect(document.activeElement).toBe(cancelBtn);

      fireEvent.keyDown(window, { key: "Tab" });
      expect(document.activeElement).toBe(closeBtn);

      // Focus first element and press Shift+Tab
      closeBtn.focus();
      expect(document.activeElement).toBe(closeBtn);

      fireEvent.keyDown(window, { key: "Tab", shiftKey: true });
      expect(document.activeElement).toBe(cancelBtn);
    });
  });

  describe("ConverterCard", () => {
    it("renders DropZone and FormatSelector initially when no file is chosen", () => {
      render(<ConverterCard config={csvConfig} />);

      expect(screen.getByText("CSV")).toBeInTheDocument();
      expect(screen.getAllByText(".csv").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Drop your CSV file here or/i)).toBeInTheDocument();
      expect(screen.getByText("browse")).toBeInTheDocument();
    });

    it("displays Pro requirement warning and button when server-side file is loaded", async () => {
      const { container } = render(<ConverterCard config={pdfConfig} />);

      const input = container.querySelector('input[type="file"]') as HTMLInputElement;
      const testFile = new File(["%PDF mock"], "document.pdf", { type: "application/pdf" });

      await act(async () => {
        fireEvent.change(input, { target: { files: [testFile] } });
      });

      // File name is displayed
      expect(screen.getByText("document.pdf")).toBeInTheDocument();

      // Pro requirement hint & button text are displayed
      const proLabels = screen.getAllByText("ConvertSheet Pro required for this file");
      expect(proLabels.length).toBeGreaterThanOrEqual(1);

      // Upgrade button is displayed
      const proButton = screen.getByRole("button", {
        name: /ConvertSheet Pro required for this file/i,
      });
      expect(proButton).toBeInTheDocument();

      // Clicking upgrade button opens Pro modal
      fireEvent.click(proButton);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Upgrade to Pro for Heavy Files")).toBeInTheDocument();
    });

    it("displays Pro requirement warning when file exceeds 10MB", async () => {
      const { container } = render(<ConverterCard config={jsonConfig} />);

      const input = container.querySelector('input[type="file"]') as HTMLInputElement;
      const largeFile = new File(["dummy"], "big.json", { type: "application/json" });
      Object.defineProperty(largeFile, "size", { value: MAX_FREE_FILE_SIZE_BYTES + 1024 });

      await act(async () => {
        fireEvent.change(input, { target: { files: [largeFile] } });
      });

      // Pro button should be rendered
      const proButton = screen.getByRole("button", {
        name: /ConvertSheet Pro required for this file/i,
      });
      expect(proButton).toBeInTheDocument();
    });
  });
});
