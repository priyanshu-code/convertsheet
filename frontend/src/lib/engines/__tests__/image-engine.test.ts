import { describe, it, expect, vi, beforeEach } from "vitest";
import { convertImage, convertBatchImages, calculateSavings } from "../image-engine";

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

  it("fills background with custom or default white color when format is image/jpeg", async () => {
    const file = new File(["dummy"], "transparent.png", { type: "image/png" });

    // Default white
    await convertImage(file, { format: "image/jpeg" });
    const canvas = (document.createElement as any).mock.results[0].value;
    const ctx = canvas.getContext();
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 800, 600);
    expect(ctx.fillStyle).toBe("#ffffff");

    // Custom background
    await convertImage(file, { format: "image/jpeg", backgroundColor: "#ff0000" });
    expect(ctx.fillStyle).toBe("#ff0000");
  });

  it("converts multiple images concurrently with convertBatchImages", async () => {
    const files = [
      new File(["1"], "img1.png", { type: "image/png" }),
      new File(["2"], "img2.png", { type: "image/png" }),
      new File(["3"], "img3.png", { type: "image/png" }),
      new File(["4"], "img4.png", { type: "image/png" }),
    ];

    const progressCalls: Array<[number, number]> = [];
    const results = await convertBatchImages(
      files,
      { format: "image/webp" },
      2,
      (completed, total) => {
        progressCalls.push([completed, total]);
      }
    );

    expect(results).toHaveLength(4);
    expect(results[0].filename).toBe("img1.webp");
    expect(results[1].filename).toBe("img2.webp");
    expect(results[2].filename).toBe("img3.webp");
    expect(results[3].filename).toBe("img4.webp");
    expect(progressCalls).toEqual([
      [1, 4],
      [2, 4],
      [3, 4],
      [4, 4],
    ]);
  });

  it("calculates percentage file size savings accurately with calculateSavings helper", () => {
    // 100 bytes down to 25 bytes -> 75% savings
    expect(calculateSavings(100, 25)).toBe(75);
    // 100 bytes up to 120 bytes -> -20% savings
    expect(calculateSavings(100, 120)).toBe(-20);
    // Original size is 0 -> 0% savings
    expect(calculateSavings(0, 50)).toBe(0);
    // Same size -> 0% savings
    expect(calculateSavings(200, 200)).toBe(0);
  });
});

