import { describe, it, expect, vi } from "vitest";
import { createZipArchive, downloadBlob } from "../zip-utils";
import JSZip from "jszip";

describe("zip-utils", () => {
  it("creates a valid zip blob containing all provided files", async () => {
    const files = [
      { name: "test1.csv", data: "col1,col2\nval1,val2" },
      { name: "test2.json", data: JSON.stringify({ key: "value" }) },
    ];

    const blob = await createZipArchive(files);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);

    // Re-read with JSZip to verify content integrity
    const unzipped = await JSZip.loadAsync(blob);
    const file1 = await unzipped.file("test1.csv")?.async("string");
    const file2 = await unzipped.file("test2.json")?.async("string");

    expect(file1).toBe("col1,col2\nval1,val2");
    expect(file2).toBe(JSON.stringify({ key: "value" }));
  });

  it("downloadBlob creates a temporary anchor and clicks it", () => {
    const createObjectURLMock = vi.fn().mockReturnValue("blob:http://localhost/1234");
    const revokeObjectURLMock = vi.fn();
    global.URL.createObjectURL = createObjectURLMock;
    global.URL.revokeObjectURL = revokeObjectURLMock;

    const clickMock = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      const el = originalCreateElement(tagName);
      if (tagName === "a") {
        el.click = clickMock;
      }
      return el;
    });

    const testBlob = new Blob(["test"], { type: "text/plain" });
    downloadBlob(testBlob, "bundle.zip");

    expect(createObjectURLMock).toHaveBeenCalledWith(testBlob);
    expect(clickMock).toHaveBeenCalled();
  });
});
