import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ImageResizerTool } from "../ImageResizerTool";

describe("ImageResizerTool", () => {
  it("renders upload zone initially with file format details", () => {
    render(<ImageResizerTool />);

    expect(
      screen.getByText(/Click to select an image or drag & drop/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Supports JPG, PNG, WebP, and SVG up to 50MB/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/100% computed in browser/i)
    ).toBeInTheDocument();
  });

  it("loads an image file and displays preset buttons, dimension controls, and format selector", async () => {
    // Mock URL.createObjectURL and revokeObjectURL
    const fakeUrl = "blob:https://convertsheet.com/fake-image";
    const createObjectURLSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue(fakeUrl);
    const revokeObjectURLSpy = vi.spyOn(URL, "revokeObjectURL").mockReturnValue(undefined);

    // Mock Image natural dimensions loading
    const originalImage = window.Image;
    (window as any).Image = class {
      naturalWidth = 1920;
      naturalHeight = 1080;
      src = "";
      onload: any = null;
      constructor() {
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 10);
      }
    };

    const { container } = render(<ImageResizerTool />);

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).not.toBeNull();

    const file = new File(["dummy content"], "test-banner.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/Common Preset Resolutions:/i)).toBeInTheDocument();
    });

    // Check presets are visible
    expect(screen.getByRole("button", { name: /Instagram Square/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /YouTube Thumbnail/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Passport Photo/i })).toBeInTheDocument();

    // Check custom width and height inputs
    const widthInput = screen.getByDisplayValue("1920") as HTMLInputElement;
    const heightInput = screen.getByDisplayValue("1080") as HTMLInputElement;
    expect(widthInput).toBeInTheDocument();
    expect(heightInput).toBeInTheDocument();

    // Click a preset button
    const igButton = screen.getByRole("button", { name: /Instagram Square/i });
    fireEvent.click(igButton);

    expect(screen.getAllByDisplayValue("1080")).toHaveLength(2);

    // Check format selector
    const formatSelect = screen.getByRole("combobox") as HTMLSelectElement;
    expect(formatSelect.value).toBe("image/png");

    fireEvent.change(formatSelect, { target: { value: "image/webp" } });
    expect(formatSelect.value).toBe("image/webp");

    // Clean up mocks
    (window as any).Image = originalImage;
    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
  });
});
