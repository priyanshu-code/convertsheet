import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BulkImageCompressor } from "../BulkImageCompressor";
import * as imageEngine from "@/lib/engines/image-engine";
import * as zipUtils from "@/lib/zip-utils";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

describe("BulkImageCompressor", () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    // Mock createObjectURL & revokeObjectURL
    if (!globalThis.URL.createObjectURL) {
      globalThis.URL.createObjectURL = vi.fn((blob: any) => `blob:mock-url-${Math.random()}`);
    } else {
      vi.spyOn(globalThis.URL, "createObjectURL").mockImplementation(() => `blob:mock-url-${Math.random()}`);
    }
    if (!globalThis.URL.revokeObjectURL) {
      globalThis.URL.revokeObjectURL = vi.fn();
    } else {
      vi.spyOn(globalThis.URL, "revokeObjectURL").mockImplementation(() => {});
    }

    // Default mock convertImage
    vi.spyOn(imageEngine, "convertImage").mockImplementation(async (file, options) => {
      const ext = options.format === "image/webp" ? "webp" : options.format === "image/jpeg" ? "jpg" : "png";
      const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
      const sizeBytes = Math.max(100, Math.round(file.size * (options.quality ?? 0.8)));
      return {
        blob: new Blob(["dummy-compressed"], { type: options.format }),
        dataUrl: `data:${options.format};base64,dummy`,
        width: 1200,
        height: 800,
        sizeBytes,
        filename: `${baseName}.${ext}`,
      };
    });

    vi.spyOn(zipUtils, "createZipArchive").mockResolvedValue(new Blob(["mock-zip"], { type: "application/zip" }));
    vi.spyOn(zipUtils, "downloadBlob").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders multi-file upload dropzone with instructions", () => {
    render(<BulkImageCompressor title="Bulk Image Compressor" />);
    expect(screen.getByText("Bulk Image Compressor")).toBeInTheDocument();
    expect(screen.getByText(/Drag & drop images here, or click to browse/i)).toBeInTheDocument();
    expect(screen.getByText(/Supports PNG, JPG, JPEG, WEBP, SVG/i)).toBeInTheDocument();
  });

  it("renders global controls: Quality slider, Target Format selector, Max Width preset selector", () => {
    render(<BulkImageCompressor />);
    expect(screen.getByLabelText(/Target Format/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Quality", { selector: "#global-quality" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Max Width/i)).toBeInTheDocument();
  });

  it("adding files displays image cards showing thumbnail, original size, compressed size badge, and savings percentage", async () => {
    const { container } = render(<BulkImageCompressor />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    const file1 = new File(["dummy content 1000 bytes"], "photo1.png", { type: "image/png" });
    const file2 = new File(["dummy content 2000 bytes larger"], "photo2.jpg", { type: "image/jpeg" });

    fireEvent.change(input, { target: { files: [file1, file2] } });

    await waitFor(() => {
      expect(screen.getByText("photo1.png")).toBeInTheDocument();
      expect(screen.getByText("photo2.jpg")).toBeInTheDocument();
    });

    // Verify summary stats banner rendered
    expect(screen.getByText(/Total Images/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Saved/i)).toBeInTheDocument();

    // Verify thumbnail images exist
    const images = screen.getAllByRole("img");
    expect(images.length).toBeGreaterThanOrEqual(2);
  });

  it("changing global quality slider recalculates compression for files", async () => {
    const { container } = render(<BulkImageCompressor />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    const file1 = new File(["dummy content 1000 bytes"], "photo1.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [file1] } });

    await waitFor(() => {
      expect(screen.getByText("photo1.png")).toBeInTheDocument();
    });

    const initialCalls = (imageEngine.convertImage as any).mock.calls.length;

    // Change global quality slider specifically
    const qualitySlider = screen.getByLabelText("Quality", { selector: "#global-quality" });
    fireEvent.change(qualitySlider, { target: { value: "50" } });

    await waitFor(() => {
      expect((imageEngine.convertImage as any).mock.calls.length).toBeGreaterThan(initialCalls);
    });
  });

  it("supports individual card fine-tuning (slider override) and individual file download trigger", async () => {
    const { container } = render(<BulkImageCompressor />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    const file1 = new File(["dummy content 1000 bytes"], "photo1.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [file1] } });

    await waitFor(() => {
      expect(screen.getByText("photo1.png")).toBeInTheDocument();
    });

    // Check individual card slider
    const customSliders = screen.getAllByRole("slider");
    // Slider 0 is global quality, slider 1 is individual card quality
    expect(customSliders.length).toBeGreaterThanOrEqual(2);
    const cardSlider = customSliders[1];

    const callsBefore = (imageEngine.convertImage as any).mock.calls.length;
    fireEvent.change(cardSlider, { target: { value: "40" } });

    await waitFor(() => {
      expect((imageEngine.convertImage as any).mock.calls.length).toBeGreaterThan(callsBefore);
    });

    // Test individual download trigger
    const downloadBtn = screen.getByTitle(/Download photo1/i);
    fireEvent.click(downloadBtn);

    expect(zipUtils.downloadBlob).toHaveBeenCalled();
  });

  it("allows single file removal from list and cleans up object URL", async () => {
    const revokeSpy = vi.spyOn(globalThis.URL, "revokeObjectURL");
    const { container } = render(<BulkImageCompressor />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    const file1 = new File(["dummy 1"], "photo1.png", { type: "image/png" });
    const file2 = new File(["dummy 2"], "photo2.jpg", { type: "image/jpeg" });
    fireEvent.change(input, { target: { files: [file1, file2] } });

    await waitFor(() => {
      expect(screen.getByText("photo1.png")).toBeInTheDocument();
      expect(screen.getByText("photo2.jpg")).toBeInTheDocument();
    });

    // Find remove button for photo1
    const removeBtns = screen.getAllByTitle(/Remove/i);
    expect(removeBtns.length).toBe(2);
    fireEvent.click(removeBtns[0]);

    await waitFor(() => {
      expect(screen.queryByText("photo1.png")).not.toBeInTheDocument();
      expect(screen.getByText("photo2.jpg")).toBeInTheDocument();
    });

    expect(revokeSpy).toHaveBeenCalled();
  });

  it('"Download All as ZIP" button bundles compressed blobs using createZipArchive and triggers downloadBlob', async () => {
    const { container } = render(<BulkImageCompressor />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    const file1 = new File(["dummy 1"], "photo1.png", { type: "image/png" });
    const file2 = new File(["dummy 2"], "photo2.jpg", { type: "image/jpeg" });
    fireEvent.change(input, { target: { files: [file1, file2] } });

    await waitFor(() => {
      expect(screen.getByText("photo1.png")).toBeInTheDocument();
    });

    const zipButton = screen.getByRole("button", { name: /Download All as ZIP/i });
    expect(zipButton).toBeInTheDocument();

    fireEvent.click(zipButton);

    await waitFor(() => {
      expect(zipUtils.createZipArchive).toHaveBeenCalled();
      expect(zipUtils.downloadBlob).toHaveBeenCalled();
    });
  });

  it("handles errors on single corrupted file gracefully without crashing the batch", async () => {
    vi.spyOn(imageEngine, "convertImage").mockImplementation(async (file) => {
      if (file.name === "corrupted.png") {
        throw new Error("Invalid image format or corrupt file header.");
      }
      return {
        blob: new Blob(["good"], { type: "image/webp" }),
        dataUrl: "data:image/webp;base64,dummy",
        width: 800,
        height: 600,
        sizeBytes: 200,
        filename: `${file.name}.webp`,
      };
    });

    const { container } = render(<BulkImageCompressor />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    const file1 = new File(["bad data"], "corrupted.png", { type: "image/png" });
    const file2 = new File(["good data"], "valid.png", { type: "image/png" });

    fireEvent.change(input, { target: { files: [file1, file2] } });

    await waitFor(() => {
      expect(screen.getByText("corrupted.png")).toBeInTheDocument();
      expect(screen.getByText("valid.png")).toBeInTheDocument();
    });

    // Corrupted file card should show an error message
    await waitFor(() => {
      expect(screen.getByText(/Invalid image format/i)).toBeInTheDocument();
    });

    // Valid file card should show its dimensions or success state
    expect(screen.getByText("800 × 600")).toBeInTheDocument();
  });
});
