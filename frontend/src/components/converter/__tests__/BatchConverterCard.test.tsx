import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BatchConverterCard } from "../BatchConverterCard";
import { CONVERTER_REGISTRY } from "@/lib/registry";
import * as zipUtils from "@/lib/zip-utils";

vi.mock("@/lib/engines", () => ({
  getConverterEngine: vi.fn(() => ({
    convert: vi.fn().mockResolvedValue(new Blob(["mock-output"], { type: "text/csv" })),
    parsePreview: vi.fn().mockResolvedValue({ headers: ["a"], rows: [["1"]] }),
  })),
}));

describe("BatchConverterCard (Multi-File Queue & ZIP Packaging)", () => {
  const config = CONVERTER_REGISTRY["json-to-excel"];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders multi-file drop zone with supported extensions", () => {
    render(<BatchConverterCard config={config} />);

    expect(
      screen.getByText(/Drag & drop multiple JSON files here/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Drop up to 50 files for parallel in-memory conversion/i)).toBeInTheDocument();
  });

  it("adds dropped multiple files to the queue and allows removal", () => {
    render(<BatchConverterCard config={config} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    const file1 = new File(['{"id":1}'], "data1.json", { type: "application/json" });
    const file2 = new File(['{"id":2}'], "data2.json", { type: "application/json" });

    fireEvent.change(input, { target: { files: [file1, file2] } });

    expect(screen.getByText("Batch Queue (2 Files)")).toBeInTheDocument();
    expect(screen.getByText("data1.json")).toBeInTheDocument();
    expect(screen.getByText("data2.json")).toBeInTheDocument();

    // Remove file 1
    const removeBtn = screen.getByRole("button", { name: /Remove data1.json/i });
    fireEvent.click(removeBtn);

    expect(screen.queryByText("data1.json")).not.toBeInTheDocument();
    expect(screen.getByText("data2.json")).toBeInTheDocument();
    expect(screen.getByText("Batch Queue (1 Files)")).toBeInTheDocument();
  });

  it("converts all queued files and provides Download All as ZIP button", async () => {
    const downloadBlobSpy = vi.spyOn(zipUtils, "downloadBlob").mockImplementation(() => {});
    const createZipArchiveSpy = vi
      .spyOn(zipUtils, "createZipArchive")
      .mockResolvedValue(new Blob(["mock-zip"]));

    render(<BatchConverterCard config={config} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file1 = new File(['{"id":1}'], "data1.json", { type: "application/json" });
    fireEvent.change(input, { target: { files: [file1] } });

    const convertAllBtn = screen.getByRole("button", { name: /Convert All \(1\)/i });
    fireEvent.click(convertAllBtn);

    await waitFor(() => {
      expect(screen.getByText(/1 of 1 converted \(100%\)/i)).toBeInTheDocument();
    });

    const downloadZipBtn = screen.getByRole("button", {
      name: /Download All as ZIP \(\.zip\)/i,
    });
    expect(downloadZipBtn).toBeInTheDocument();

    fireEvent.click(downloadZipBtn);

    await waitFor(() => {
      expect(createZipArchiveSpy).toHaveBeenCalled();
      expect(downloadBlobSpy).toHaveBeenCalled();
    });
  });
});
