import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ImageConverterTool } from "../ImageConverterTool";
import * as imageEngine from "@/lib/engines/image-engine";
import { vi } from "vitest";

describe("ImageConverterTool", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(imageEngine, "convertImage").mockResolvedValue({
      blob: new Blob(["dummy"], { type: "image/png" }),
      dataUrl: "data:image/png;base64,dummy",
      width: 1200,
      height: 800,
      sizeBytes: 50000,
      filename: "test.png",
    });
  });

  it("renders upload dropzone initially", () => {
    render(<ImageConverterTool title="Test Image Converter" />);
    expect(screen.getByText("Test Image Converter")).toBeInTheDocument();
    expect(screen.getByText(/Click to choose an image/i)).toBeInTheDocument();
  });

  it("processes image and updates preview and metrics automatically", async () => {
    const { container } = render(<ImageConverterTool />);
    const input = container.querySelector("input[type='file']") as HTMLInputElement;

    const file = new File(["dummycontent"], "photo.webp", { type: "image/webp" });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText("photo.webp")).toBeInTheDocument();
      expect(screen.getByText("1200 × 800")).toBeInTheDocument();
      expect(screen.getByText("Real-time Output Preview")).toBeInTheDocument();
    });
  });
});
