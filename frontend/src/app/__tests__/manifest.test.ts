import { describe, it, expect } from "vitest";
import manifest from "../manifest";

describe("Next.js PWA Manifest", () => {
  it("exports valid manifest metadata with theme colors, standalone display, and icons", () => {
    const config = manifest();

    expect(config.name).toContain("ConvertSheet");
    expect(config.short_name).toBe("ConvertSheet");
    expect(config.display).toBe("standalone");
    expect(config.theme_color).toBe("#10b981");
    expect(config.background_color).toBe("#ffffff");
    expect(config.icons).toHaveLength(2);
    expect(config.icons?.map((i) => i.src)).toEqual([
      "/icons/icon-192.svg",
      "/icons/icon-512.svg",
    ]);
  });
});
