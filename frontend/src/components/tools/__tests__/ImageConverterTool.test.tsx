import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ImageConverterTool } from "../ImageConverterTool";
import * as imageEngine from "@/lib/engines/image-engine";
import * as zipUtils from "@/lib/zip-utils";
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("ImageConverterTool", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(imageEngine, "convertImage").mockImplementation(async (file, options) => {
      const ext = options?.format ? options.format.split("/")[1] : "png";
      const nameParts = file.name.split(".");
      const baseName = nameParts.length > 1 ? nameParts.slice(0, -1).join(".") : file.name;
      return {
        blob: new Blob(["dummy"], { type: options?.format || "image/png" }),
        dataUrl: "data:" + (options?.format || "image/png") + ";base64,dummy",
        width: 1200,
        height: 800,
        sizeBytes: 50000,
        filename: baseName + "." + ext,
      };
    });
  });

  it("renders upload dropzone initially with keyboard accessibility", () => {
    render(<ImageConverterTool title="Test Image Converter" />);
    expect(screen.getByText("Test Image Converter")).toBeInTheDocument();
    expect(screen.getByText(/Click to choose an image/i)).toBeInTheDocument();
    expect(screen.getByText(/Zero images or files sent to servers/i)).toBeInTheDocument();

    const dropzone = screen.getByRole("button", { name: /Click to choose an image/i });
    expect(dropzone).toHaveAttribute("tabindex", "0");
  });

  it("processes image and updates preview and metrics automatically", async () => {
    const { container } = render(<ImageConverterTool />);
    const input = container.querySelector("input[type='file']") as HTMLInputElement;

    const file = new File(["dummycontent"], "photo.webp", { type: "image/webp" });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getAllByText("photo.webp")[0]).toBeInTheDocument();
      expect(screen.getByText("1200 × 800")).toBeInTheDocument();
      expect(screen.getByText("Real-time Output Preview")).toBeInTheDocument();
    });
  });

  it("processes multiple WebP files simultaneously and shows batch details", async () => {
    const { container } = render(<ImageConverterTool defaultTargetFormat="image/png" />);
    const input = container.querySelector("input[type='file']") as HTMLInputElement;

    const file1 = new File(["dummy1"], "photo1.webp", { type: "image/webp" });
    const file2 = new File(["dummy2"], "photo2.webp", { type: "image/webp" });
    fireEvent.change(input, { target: { files: [file1, file2] } });

    await waitFor(() => {
      expect(screen.getByText("photo1.webp")).toBeInTheDocument();
      expect(screen.getByText("photo2.webp")).toBeInTheDocument();
      expect(screen.getByText("photo1.png")).toBeInTheDocument();
      expect(screen.getByText("photo2.png")).toBeInTheDocument();
    });
  });

  it("supports individual download and batch download as ZIP", async () => {
    const createZipSpy = vi
      .spyOn(zipUtils, "createZipArchive")
      .mockResolvedValue(new Blob(["zipdata"], { type: "application/zip" }));
    const downloadBlobSpy = vi
      .spyOn(zipUtils, "downloadBlob")
      .mockImplementation(() => {});

    const { container } = render(<ImageConverterTool defaultTargetFormat="image/png" />);
    const input = container.querySelector("input[type='file']") as HTMLInputElement;

    const file1 = new File(["dummy1"], "photo1.webp", { type: "image/webp" });
    const file2 = new File(["dummy2"], "photo2.webp", { type: "image/webp" });
    fireEvent.change(input, { target: { files: [file1, file2] } });

    await waitFor(() => {
      expect(screen.getByText("photo1.webp")).toBeInTheDocument();
      expect(screen.getByText("photo2.webp")).toBeInTheDocument();
    });

    const downloadButtons = screen.getAllByRole("button", { name: /Download photo1/i });
    expect(downloadButtons.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(downloadButtons[0]);
    expect(downloadBlobSpy).toHaveBeenCalledWith(expect.any(Blob), "photo1.png");

    const zipButton = screen.getByRole("button", { name: /Download All as ZIP/i });
    fireEvent.click(zipButton);

    await waitFor(() => {
      expect(createZipSpy).toHaveBeenCalledWith([
        expect.objectContaining({ name: "photo1.png" }),
        expect.objectContaining({ name: "photo2.png" }),
      ]);
      expect(downloadBlobSpy).toHaveBeenCalledWith(expect.any(Blob), "converted-images.zip");
    });
  });

  it("deduplicates duplicate filenames in ZIP entries", async () => {
    const createZipSpy = vi
      .spyOn(zipUtils, "createZipArchive")
      .mockResolvedValue(new Blob(["zipdata"], { type: "application/zip" }));
    vi.spyOn(zipUtils, "downloadBlob").mockImplementation(() => {});

    const { container } = render(<ImageConverterTool defaultTargetFormat="image/png" />);
    const input = container.querySelector("input[type='file']") as HTMLInputElement;

    const file1 = new File(["dummy1"], "photo.webp", { type: "image/webp" });
    const file2 = new File(["dummy2"], "photo.webp", { type: "image/webp" });
    fireEvent.change(input, { target: { files: [file1, file2] } });

    await waitFor(() => {
      expect(screen.getAllByText("photo.webp").length).toBeGreaterThanOrEqual(1);
    });

    const zipButton = screen.getByRole("button", { name: /Download All as ZIP/i });
    fireEvent.click(zipButton);

    await waitFor(() => {
      expect(createZipSpy).toHaveBeenCalledWith([
        expect.objectContaining({ name: "photo.png" }),
        expect.objectContaining({ name: "photo (1).png" }),
      ]);
    });
  });

  it("removes an individual item when remove button is clicked", async () => {
    const { container } = render(<ImageConverterTool defaultTargetFormat="image/png" />);
    const input = container.querySelector("input[type='file']") as HTMLInputElement;

    const file1 = new File(["dummy1"], "photo1.webp", { type: "image/webp" });
    const file2 = new File(["dummy2"], "photo2.webp", { type: "image/webp" });
    fireEvent.change(input, { target: { files: [file1, file2] } });

    await waitFor(() => {
      expect(screen.getByText("photo1.webp")).toBeInTheDocument();
      expect(screen.getByText("photo2.webp")).toBeInTheDocument();
    });

    const removeBtn = screen.getByRole("button", { name: /Remove photo1.webp/i });
    fireEvent.click(removeBtn);

    await waitFor(() => {
      expect(screen.queryByText("photo1.webp")).not.toBeInTheDocument();
      expect(screen.getByText("photo2.webp")).toBeInTheDocument();
    });
  });

  it("allows selecting item in batch list with keyboard Enter or Space", async () => {
    const { container } = render(<ImageConverterTool defaultTargetFormat="image/png" />);
    const input = container.querySelector("input[type='file']") as HTMLInputElement;

    const file1 = new File(["dummy1"], "photo1.webp", { type: "image/webp" });
    const file2 = new File(["dummy2"], "photo2.webp", { type: "image/webp" });
    fireEvent.change(input, { target: { files: [file1, file2] } });

    await waitFor(() => {
      expect(screen.getByText("photo1.webp")).toBeInTheDocument();
      expect(screen.getByText("photo2.webp")).toBeInTheDocument();
    });

    const rows = screen.getAllByRole("button", { name: /photo2.webp/i });
    const row2 = rows.find((el) => el.getAttribute("aria-selected") !== null);
    expect(row2).toBeDefined();

    fireEvent.keyDown(row2!, { key: "Enter" });
    expect(row2).toHaveAttribute("aria-selected", "true");
  });

  it("does not abort in-flight conversions when new files are added", async () => {
    let resolveFirst: ((val: any) => void) | null = null;
    vi.spyOn(imageEngine, "convertImage").mockImplementation(async (file, options) => {
      if (file.name === "photo1.webp") {
        return new Promise((resolve) => {
          resolveFirst = () =>
            resolve({
              blob: new Blob(["dummy"], { type: "image/png" }),
              dataUrl: "data:image/png;base64,dummy",
              width: 1200,
              height: 800,
              sizeBytes: 50000,
              filename: "photo1.png",
            });
        });
      }
      return {
        blob: new Blob(["dummy"], { type: "image/png" }),
        dataUrl: "data:image/png;base64,dummy",
        width: 1200,
        height: 800,
        sizeBytes: 50000,
        filename: file.name.replace(/\.[^/.]+$/, "") + ".png",
      };
    });

    const { container } = render(<ImageConverterTool defaultTargetFormat="image/png" />);
    const input = container.querySelector("input[type='file']") as HTMLInputElement;

    const file1 = new File(["dummy1"], "photo1.webp", { type: "image/webp" });
    fireEvent.change(input, { target: { files: [file1] } });

    await waitFor(() => {
      expect(screen.getByText("photo1.webp")).toBeInTheDocument();
    });

    // Add second file while photo1 is still converting
    const file2 = new File(["dummy2"], "photo2.webp", { type: "image/webp" });
    fireEvent.change(input, { target: { files: [file2] } });

    await waitFor(() => {
      expect(screen.getByText("photo2.png")).toBeInTheDocument();
    });

    // Now complete the first file
    resolveFirst!();

    await waitFor(() => {
      expect(screen.getByText("photo1.png")).toBeInTheDocument();
    });
  });

  it("clears all items and resets back to dropzone when Clear All is clicked", async () => {
    const { container } = render(<ImageConverterTool />);
    const input = container.querySelector("input[type='file']") as HTMLInputElement;

    const file1 = new File(["dummy1"], "photo1.webp", { type: "image/webp" });
    fireEvent.change(input, { target: { files: [file1] } });

    await waitFor(() => {
      expect(screen.getAllByText("photo1.webp")[0]).toBeInTheDocument();
    });

    const clearBtn = screen.getByRole("button", { name: /Clear All/i });
    fireEvent.click(clearBtn);

    await waitFor(() => {
      expect(screen.getByText(/Click to choose an image/i)).toBeInTheDocument();
      expect(screen.queryByText("photo1.webp")).not.toBeInTheDocument();
    });
  });
  it("displays an error message when ZIP archive creation fails", async () => {
    vi.spyOn(zipUtils, "createZipArchive").mockRejectedValue(new Error("Zip compression failed"));
    vi.spyOn(zipUtils, "downloadBlob").mockImplementation(() => {});

    const { container } = render(<ImageConverterTool defaultTargetFormat="image/png" />);
    const input = container.querySelector("input[type='file']") as HTMLInputElement;

    const file1 = new File(["dummy1"], "photo1.webp", { type: "image/webp" });
    fireEvent.change(input, { target: { files: [file1] } });

    await waitFor(() => {
      expect(screen.getByText("photo1.webp")).toBeInTheDocument();
    });

    const zipButton = screen.getByRole("button", { name: /Download All as ZIP/i });
    fireEvent.click(zipButton);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Zip compression failed");
    });
  });
});
