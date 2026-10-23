import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StudioDropZone } from "../StudioDropZone";

describe("StudioDropZone Component", () => {
  it("renders empty drop zone with drag instructions and clipboard paste hint", () => {
    const onFileSelect = vi.fn();
    render(
      <StudioDropZone
        onFileSelect={onFileSelect}
        title="Upload Image"
        subtitle="Supports JPG, PNG, WebP"
      />
    );

    expect(screen.getByText(/Upload Image/i)).toBeInTheDocument();
    expect(screen.getByText(/Supports JPG, PNG, WebP/i)).toBeInTheDocument();
    expect(screen.getByText(/⌘V/i)).toBeInTheDocument();
  });

  it("calls onFileSelect when a file is selected through input", () => {
    const onFileSelect = vi.fn();
    render(<StudioDropZone onFileSelect={onFileSelect} />);

    const file = new File(["dummy content"], "sample.jpg", { type: "image/jpeg" });
    const input = screen.getByLabelText(/Upload file input/i);

    fireEvent.change(input, { target: { files: [file] } });
    expect(onFileSelect).toHaveBeenCalledWith(file);
  });

  it("renders loaded file inspector when currentFile is provided", () => {
    const onFileSelect = vi.fn();
    const onClear = vi.fn();
    const file = new File(["image-bytes-mock-12345"], "test-photo.png", {
      type: "image/png",
    });

    render(
      <StudioDropZone
        onFileSelect={onFileSelect}
        onClear={onClear}
        currentFile={file}
      />
    );

    expect(screen.getByText("test-photo.png")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Remove file/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Remove file/i }));
    expect(onClear).toHaveBeenCalled();
  });

  it("handles clipboard paste event", () => {
    const onFileSelect = vi.fn();
    render(<StudioDropZone onFileSelect={onFileSelect} />);

    const file = new File(["pasted"], "clipboard.png", { type: "image/png" });
    const pasteEvent = new Event("paste", { bubbles: true }) as any;
    pasteEvent.clipboardData = {
      files: [file],
      items: [{ kind: "file", getAsFile: () => file }],
    };

    window.dispatchEvent(pasteEvent);
    expect(onFileSelect).toHaveBeenCalledWith(file);
  });
});
