import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useFileDropAndPaste } from "../useFileDropAndPaste";

describe("useFileDropAndPaste hook", () => {
  it("tracks drag enter, over, and leave states", () => {
    const onFiles = vi.fn();
    const { result } = renderHook(() =>
      useFileDropAndPaste({
        onFiles,
        multiple: false,
      })
    );

    expect(result.current.isDragOver).toBe(false);

    const mockEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      currentTarget: { contains: () => false },
      relatedTarget: null,
    } as unknown as React.DragEvent;

    act(() => {
      result.current.dragHandlers.onDragOver(mockEvent);
    });
    expect(result.current.isDragOver).toBe(true);

    act(() => {
      result.current.dragHandlers.onDragLeave(mockEvent);
    });
    expect(result.current.isDragOver).toBe(false);
  });

  it("handles drop with files and respects accept filter", () => {
    const onFiles = vi.fn();
    const isPdf = (f: File) => f.name.endsWith(".pdf");

    const { result } = renderHook(() =>
      useFileDropAndPaste({
        onFiles,
        accept: isPdf,
        multiple: true,
      })
    );

    const pdfFile = new File(["dummy"], "test.pdf", { type: "application/pdf" });
    const txtFile = new File(["dummy"], "test.txt", { type: "text/plain" });

    const dropEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      dataTransfer: {
        files: [pdfFile, txtFile],
      },
    } as unknown as React.DragEvent;

    act(() => {
      result.current.dragHandlers.onDrop(dropEvent);
    });

    expect(onFiles).toHaveBeenCalledTimes(1);
    expect(onFiles).toHaveBeenCalledWith([pdfFile]);
  });

  it("handles clipboard paste event (Ctrl/Cmd + V)", () => {
    const onFiles = vi.fn();
    const isPdf = (f: File) => f.name.endsWith(".pdf");

    renderHook(() =>
      useFileDropAndPaste({
        onFiles,
        accept: isPdf,
        multiple: false,
      })
    );

    const pdfFile = new File(["pdf content"], "pasted.pdf", { type: "application/pdf" });

    const pasteEvent = new Event("paste", { bubbles: true, cancelable: true }) as any;
    pasteEvent.clipboardData = {
      files: [pdfFile],
      items: [],
    };

    act(() => {
      window.dispatchEvent(pasteEvent);
    });

    expect(onFiles).toHaveBeenCalledTimes(1);
    expect(onFiles).toHaveBeenCalledWith([pdfFile]);
  });

  it("ignores paste when typing in an input element", () => {
    const onFiles = vi.fn();

    renderHook(() =>
      useFileDropAndPaste({
        onFiles,
      })
    );

    const pdfFile = new File(["pdf"], "pasted.pdf", { type: "application/pdf" });
    const inputElement = document.createElement("input");
    document.body.appendChild(inputElement);

    const pasteEvent = new Event("paste", { bubbles: true, cancelable: true }) as any;
    pasteEvent.clipboardData = {
      files: [pdfFile],
    };
    Object.defineProperty(pasteEvent, "target", { value: inputElement });

    act(() => {
      window.dispatchEvent(pasteEvent);
    });

    expect(onFiles).not.toHaveBeenCalled();
    document.body.removeChild(inputElement);
  });
});
