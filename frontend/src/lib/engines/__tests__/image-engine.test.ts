import { describe, it, expect, vi, beforeEach } from "vitest";
import { convertImage } from "../image-engine";

describe("Image Engine (Client-Side Canvas/Wasm)", () => {
  beforeEach(() => {
    // Mock URL.createObjectURL and revokeObjectURL
    global.URL.createObjectURL = vi.fn().mockReturnValue("blob:mock-image-url");
    global.URL.revokeObjectURL = vi.fn();

    // Mock Image constructor
    class MockImage {
      onload: (() => void) | null = null;
      onerror: ((e: any) => void) | null = null;
      src = "";
      width = 800;
      height = 600;

      constructor() {
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 10);
      }
    }
    vi.stubGlobal("Image", MockImage);

    // Mock HTMLCanvasElement and context
    const mockContext = {
      drawImage: vi.fn(),
      fillRect: vi.fn(),
      fillStyle: "",
    };

    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue(mockContext),
      toBlob: vi.fn().mockImplementation((cb: (b: Blob) => void, format: string, quality: number) => {
        const dummyBlob = new Blob(["mock-image-bytes"], { type: format });
        cb(dummyBlob);
      }),
      toDataURL: vi.fn().mockReturnValue("data:image/webp;base64,mockdata"),
    };

    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      if (tag === "canvas") return mockCanvas as any;
      return document.createElement(tag);
    });
  });

  it("converts image file to webp format", async () => {
    const file = new File(["dummy"], "photo.png", { type: "image/png" });
    const result = await convertImage(file, { format: "image/webp", quality: 0.85 });

    expect(result.filename).toBe("photo.webp");
    expect(result.blob.type).toBe("image/webp");
    expect(result.width).toBe(800);
    expect(result.height).toBe(600);
    expect(result.dataUrl).toContain("data:image/webp");
  });

  it("scales down image when maxWidth is exceeded", async () => {
    const file = new File(["dummy"], "photo.png", { type: "image/png" });
    const result = await convertImage(file, {
      format: "image/jpeg",
      maxWidth: 400,
    });

    expect(result.filename).toBe("photo.jpg");
    expect(result.width).toBe(400);
    expect(result.height).toBe(300);
  });
});
