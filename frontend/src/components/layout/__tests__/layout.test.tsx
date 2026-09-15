import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { Navbar, Footer, AdBanner, ThemeToggle, THEME_STORAGE_KEY } from "../index";
import RootLayout, { metadata } from "@/app/layout";

describe("Layout Components", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    vi.restoreAllMocks();
  });

  describe("ThemeToggle", () => {
    it("renders theme toggle button with initial icon", () => {
      render(<ThemeToggle />);
      const button = screen.getByTestId("theme-toggle");
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute("type", "button");
    });

    it("toggles dark class on documentElement and persists to localStorage", () => {
      render(<ThemeToggle />);
      const button = screen.getByTestId("theme-toggle");

      // Initially light mode
      expect(document.documentElement.classList.contains("dark")).toBe(false);

      // Click to toggle to dark mode
      fireEvent.click(button);
      expect(document.documentElement.classList.contains("dark")).toBe(true);
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");

      // Click again to toggle back to light mode
      fireEvent.click(button);
      expect(document.documentElement.classList.contains("dark")).toBe(false);
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    });

    it("initializes dark mode if localStorage has dark stored", () => {
      localStorage.setItem(THEME_STORAGE_KEY, "dark");
      render(<ThemeToggle />);

      expect(document.documentElement.classList.contains("dark")).toBe(true);
      const button = screen.getByTestId("theme-toggle");
      expect(button).toHaveAttribute("aria-label", "Switch to light mode");
    });

    it("initializes light mode if localStorage has light stored", () => {
      document.documentElement.classList.add("dark");
      localStorage.setItem(THEME_STORAGE_KEY, "light");
      render(<ThemeToggle />);

      expect(document.documentElement.classList.contains("dark")).toBe(false);
      const button = screen.getByTestId("theme-toggle");
      expect(button).toHaveAttribute("aria-label", "Switch to dark mode");
    });

    it("guards aria-label and title with mounted state to prevent hydration mismatch", () => {
      render(<ThemeToggle />);
      const button = screen.getByTestId("theme-toggle");
      expect(button).toHaveAttribute("aria-label", "Switch to dark mode");
      expect(button).toHaveAttribute("title", "Switch to dark mode");
    });

    it("handles restricted localStorage (SecurityError) gracefully without throwing", () => {
      const getItemSpy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new DOMException("The operation is insecure.", "SecurityError");
      });
      const setItemSpy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new DOMException("The operation is insecure.", "SecurityError");
      });

      expect(() => {
        render(<ThemeToggle />);
        const button = screen.getByTestId("theme-toggle");
        fireEvent.click(button);
      }).not.toThrow();

      getItemSpy.mockRestore();
      setItemSpy.mockRestore();
    });
  });

  describe("Navbar", () => {
    it("renders brand logo linking to home", () => {
      render(<Navbar />);
      const logoLink = screen.getByRole("link", { name: /ConvertSheet Home/i });
      expect(logoLink).toBeInTheDocument();
      expect(logoLink).toHaveAttribute("href", "/");
      expect(screen.getByText("Convert")).toBeInTheDocument();
      expect(screen.getByText("Sheet")).toBeInTheDocument();
    });

    it("renders navigation links to API and Pricing", () => {
      render(<Navbar />);
      const apiLinks = screen.getAllByRole("link", { name: "API" });
      expect(apiLinks[0]).toHaveAttribute("href", "/pricing#api");

      const pricingLinks = screen.getAllByRole("link", { name: "Pricing" });
      expect(pricingLinks[0]).toHaveAttribute("href", "/pricing");
    });

    it("renders prominent Pro upgrade button", () => {
      render(<Navbar />);
      const proLink = screen.getByRole("link", {
        name: /Upgrade to ConvertSheet Pro/i,
      });
      expect(proLink).toBeInTheDocument();
      expect(proLink).toHaveAttribute("href", "/pricing");
      expect(proLink).toHaveTextContent("Pro");
    });

    it("toggles Tools dropdown and shows all 7 converters with format badges", () => {
      render(<Navbar />);
      const toolsButton = screen.getByRole("button", { name: /Tools/i });
      expect(toolsButton).toHaveAttribute("aria-expanded", "false");

      // Open Tools menu
      fireEvent.click(toolsButton);
      expect(toolsButton).toHaveAttribute("aria-expanded", "true");

      const menu = screen.getByRole("menu");
      expect(menu).toBeInTheDocument();

      // All 7 converters should be present
      expect(screen.getByRole("menuitem", { name: /JSON to Excel/i })).toHaveAttribute(
        "href",
        "/convert/json-to-excel"
      );
      expect(screen.getByRole("menuitem", { name: /^XML to Excel/i })).toHaveAttribute(
        "href",
        "/convert/xml-to-excel"
      );
      expect(screen.getByRole("menuitem", { name: /CSV to Excel/i })).toHaveAttribute(
        "href",
        "/convert/csv-to-excel"
      );
      expect(screen.getByRole("menuitem", { name: /Excel to JSON/i })).toHaveAttribute(
        "href",
        "/convert/excel-to-json"
      );
      expect(screen.getByRole("menuitem", { name: /Excel to CSV/i })).toHaveAttribute(
        "href",
        "/convert/excel-to-csv"
      );
      expect(screen.getByRole("menuitem", { name: /PDF to Excel/i })).toHaveAttribute(
        "href",
        "/convert/pdf-to-excel"
      );
      expect(screen.getByRole("menuitem", { name: /Tally XML to Excel/i })).toHaveAttribute(
        "href",
        "/convert/tally-xml-to-excel"
      );

      // Format badges
      expect(screen.getByText("JSON → XLSX")).toBeInTheDocument();
      expect(screen.getByText("XML → XLSX")).toBeInTheDocument();
      expect(screen.getByText("CSV → XLSX")).toBeInTheDocument();
      expect(screen.getByText("XLSX → JSON")).toBeInTheDocument();
      expect(screen.getByText("XLSX → CSV")).toBeInTheDocument();
      expect(screen.getByText("PDF → XLSX")).toBeInTheDocument();
      expect(screen.getByText("Tally XML → XLSX")).toBeInTheDocument();

      // Clicking a menuitem closes dropdown
      const jsonItem = screen.getByRole("menuitem", { name: /JSON to Excel/i });
      fireEvent.click(jsonItem);
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("closes Tools dropdown on Escape key and outside click", () => {
      render(<Navbar />);
      const toolsButton = screen.getByRole("button", { name: /Tools/i });

      // Open dropdown
      fireEvent.click(toolsButton);
      expect(screen.getByRole("menu")).toBeInTheDocument();

      // Escape closes it
      fireEvent.keyDown(document, { key: "Escape" });
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();

      // Open again and click outside
      fireEvent.click(toolsButton);
      expect(screen.getByRole("menu")).toBeInTheDocument();
      fireEvent.mouseDown(document.body);
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("closes Tools dropdown on blur when keyboard focus leaves the menu container", () => {
      render(<Navbar />);
      const toolsButton = screen.getByRole("button", { name: /Tools/i });

      // Open dropdown
      fireEvent.click(toolsButton);
      expect(screen.getByRole("menu")).toBeInTheDocument();

      // Trigger blur event where relatedTarget is outside tools container
      const toolsContainer = toolsButton.closest("div.relative")!;
      fireEvent.blur(toolsContainer, {
        relatedTarget: document.body,
      });

      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("toggles mobile menu on hamburger button click and closes on link click", () => {
      render(<Navbar />);
      const mobileToggle = screen.getByRole("button", {
        name: /Toggle navigation menu/i,
      });
      expect(mobileToggle).toHaveAttribute("aria-expanded", "false");

      // Open mobile menu
      fireEvent.click(mobileToggle);
      expect(mobileToggle).toHaveAttribute("aria-expanded", "true");

      // Verify semantic nav and scroll classes on mobile drawer
      const mobileNav = screen.getByRole("navigation", {
        name: "Mobile Navigation",
      });
      expect(mobileNav).toBeInTheDocument();
      expect(mobileNav).toHaveClass("max-h-[calc(100vh-4rem)]");
      expect(mobileNav).toHaveClass("overflow-y-auto");

      expect(screen.getByText("Developer API")).toBeInTheDocument();
      expect(screen.getByText("Pricing Plans")).toBeInTheDocument();
      expect(screen.getByText("Upgrade to Pro")).toBeInTheDocument();

      // Clicking a mobile link closes the drawer
      fireEvent.click(screen.getByText("Developer API"));
      expect(mobileToggle).toHaveAttribute("aria-expanded", "false");
      expect(screen.queryByText("Developer API")).not.toBeInTheDocument();
    });

    it("closes mobile menu on Escape key", () => {
      render(<Navbar />);
      const mobileToggle = screen.getByRole("button", {
        name: /Toggle navigation menu/i,
      });

      fireEvent.click(mobileToggle);
      expect(screen.getByText("Developer API")).toBeInTheDocument();

      fireEvent.keyDown(document, { key: "Escape" });
      expect(screen.queryByText("Developer API")).not.toBeInTheDocument();
    });
  });

  describe("Footer", () => {
    it("renders copyright text with current year", () => {
      render(<Footer />);
      const year = new Date().getFullYear();
      expect(
        screen.getByText(new RegExp(`© ${year} ConvertSheet \\(convertsheet\\.com\\)\\. All rights reserved\\.`, "i"))
      ).toBeInTheDocument();
    });

    it("renders trust badge bar items", () => {
      render(<Footer />);
      expect(screen.getByText(/Bank-Grade In-Browser Privacy/i)).toBeInTheDocument();
      expect(screen.getByText(/Zero File Uploads for Small Files/i)).toBeInTheDocument();
      expect(screen.getByText(/Fast & Open/i)).toBeInTheDocument();
    });

    it("renders all 7 converter links", () => {
      render(<Footer />);
      expect(screen.getByRole("link", { name: /JSON to Excel/i })).toHaveAttribute(
        "href",
        "/convert/json-to-excel"
      );
      expect(screen.getByRole("link", { name: /^XML to Excel/i })).toHaveAttribute(
        "href",
        "/convert/xml-to-excel"
      );
      expect(screen.getByRole("link", { name: /CSV to Excel/i })).toHaveAttribute(
        "href",
        "/convert/csv-to-excel"
      );
      expect(screen.getByRole("link", { name: /Excel to JSON/i })).toHaveAttribute(
        "href",
        "/convert/excel-to-json"
      );
      expect(screen.getByRole("link", { name: /Excel to CSV/i })).toHaveAttribute(
        "href",
        "/convert/excel-to-csv"
      );
      expect(screen.getByRole("link", { name: /PDF to Excel/i })).toHaveAttribute(
        "href",
        "/convert/pdf-to-excel"
      );
      expect(screen.getByRole("link", { name: /Tally XML to Excel/i })).toHaveAttribute(
        "href",
        "/convert/tally-xml-to-excel"
      );
    });

    it("renders Features & API links", () => {
      render(<Footer />);
      expect(screen.getByRole("link", { name: "REST API" })).toHaveAttribute(
        "href",
        "/pricing#api"
      );
      expect(screen.getByRole("link", { name: "Python & Node.js" })).toHaveAttribute(
        "href",
        "/pricing#api"
      );
      expect(screen.getByRole("link", { name: "Batch Processing" })).toHaveAttribute(
        "href",
        "/pricing#features"
      );
      expect(screen.getByRole("link", { name: "High-Volume Enterprise" })).toHaveAttribute(
        "href",
        "/pricing#enterprise"
      );
    });

    it("renders Privacy & Security links", () => {
      render(<Footer />);
      expect(screen.getByRole("link", { name: "100% Client-Side Processing" })).toHaveAttribute(
        "href",
        "/privacy#client-side"
      );
      expect(screen.getByRole("link", { name: "Zero Server Data Retention" })).toHaveAttribute(
        "href",
        "/privacy#zero-retention"
      );
      expect(screen.getByRole("link", { name: "Terms of Service" })).toHaveAttribute(
        "href",
        "/terms"
      );
      expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute(
        "href",
        "/privacy"
      );
    });

    it("renders converter badges aligned with CONVERTER_REGISTRY", () => {
      render(<Footer />);
      expect(screen.getByText("Popular")).toBeInTheDocument();
      expect(screen.getByText("Fast")).toBeInTheDocument();
      expect(screen.getByText("Instant")).toBeInTheDocument();
      expect(screen.getByText("Developer Favorite")).toBeInTheDocument();
      expect(screen.getByText("UTF-8 Ready")).toBeInTheDocument();
      expect(screen.getByText("Pro / OCR")).toBeInTheDocument();
      expect(screen.getByText("Accounting Special")).toBeInTheDocument();
    });
  });

  describe("AdBanner", () => {
    const originalEnv = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

    beforeEach(() => {
      delete process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
    });

    afterEach(() => {
      if (originalEnv === undefined) {
        delete process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
      } else {
        process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID = originalEnv;
      }
    });

    it("renders placeholder preventing CLS for horizontal format", () => {
      render(<AdBanner format="horizontal" />);

      const banner = screen.getByTestId("ad-banner");
      expect(banner).toBeInTheDocument();
      expect(banner).toHaveClass("min-h-[90px]");
      expect(banner).toHaveClass("w-full");

      expect(screen.getByTestId("ad-placeholder")).toBeInTheDocument();
      expect(screen.getByText("Advertisement / Sponsored")).toBeInTheDocument();
      expect(screen.getByText(/Horizontal Responsive/i)).toBeInTheDocument();
    });

    it("renders placeholder preventing CLS for leaderboard format", () => {
      render(<AdBanner format="leaderboard" />);

      const banner = screen.getByTestId("ad-banner");
      expect(banner).toBeInTheDocument();
      expect(banner).toHaveClass("min-h-[50px]");
      expect(banner).toHaveClass("max-w-[728px]");

      expect(screen.getByText(/Leaderboard \(728 × 90\)/i)).toBeInTheDocument();
    });

    it("renders placeholder preventing CLS for rectangle format", () => {
      render(<AdBanner format="rectangle" />);

      const banner = screen.getByTestId("ad-banner");
      expect(banner).toBeInTheDocument();
      expect(banner).toHaveClass("min-h-[250px]");
      expect(banner).toHaveClass("w-[300px]");

      expect(screen.getByText(/Medium Rectangle \(300 × 250\)/i)).toBeInTheDocument();
    });

    it("renders Google AdSense tag and pushes fill request when NEXT_PUBLIC_ADSENSE_CLIENT_ID is set", () => {
      process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID = "ca-pub-1234567890";
      const pushSpy = vi.fn();
      window.adsbygoogle = { push: pushSpy } as unknown as unknown[];

      const { container } = render(
        <AdBanner format="rectangle" slotId="9876543210" />
      );

      const ins = container.querySelector("ins.adsbygoogle");
      expect(ins).toBeInTheDocument();
      expect(ins).toHaveAttribute("data-ad-client", "ca-pub-1234567890");
      expect(ins).toHaveAttribute("data-ad-slot", "9876543210");
      expect(ins).toHaveAttribute("data-ad-format", "rectangle");
      expect(screen.queryByTestId("ad-placeholder")).not.toBeInTheDocument();
      expect(pushSpy).toHaveBeenCalledWith({});
    });
  });

  describe("RootLayout", () => {
    const originalEnv = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

    beforeEach(() => {
      delete process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
      document.querySelectorAll("script#adsbygoogle-init").forEach((s) => s.remove());
    });

    afterEach(() => {
      if (originalEnv === undefined) {
        delete process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
      } else {
        process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID = originalEnv;
      }
      document.querySelectorAll("script#adsbygoogle-init").forEach((s) => s.remove());
    });

    it("exports metadata with required title template, default, description, and keywords", () => {
      expect(metadata.title).toEqual({
        default: "ConvertSheet - Fast, Private Structured Data Converter",
        template: "%s | ConvertSheet",
      });
      expect(metadata.description).toContain("Convert JSON, XML, CSV, and Excel spreadsheets");
      expect(metadata.keywords).toContain("convert JSON to Excel");
      expect(metadata.keywords).toContain("XML to XLSX");
      expect(metadata.openGraph?.title).toBe(
        "ConvertSheet - Fast, Private Structured Data Converter"
      );
      expect(metadata.openGraph?.url).toBe("https://convertsheet.com");
    });

    it("renders skip-to-content anchor and main-content id", () => {
      const { container } = render(
        <RootLayout>
          <div>Test Page Content</div>
        </RootLayout>
      );
      const skipLink = screen.getByRole("link", { name: /Skip to content/i });
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute("href", "#main-content");
      expect(skipLink).toHaveClass("sr-only");
      expect(skipLink).toHaveClass("focus:not-sr-only");

      const main = container.querySelector("#main-content");
      expect(main).toBeInTheDocument();
      expect(main).toHaveTextContent("Test Page Content");
    });

    it("conditionally mounts AdSense Script when NEXT_PUBLIC_ADSENSE_CLIENT_ID is set", () => {
      process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID = "ca-pub-1122334455";
      render(
        <RootLayout>
          <div>Test Page Content</div>
        </RootLayout>
      );
      const script = document.getElementById("adsbygoogle-init") as HTMLScriptElement | null;
      expect(script).toBeInTheDocument();
      expect(script?.src).toContain("ca-pub-1122334455");
    });

    it("omits AdSense Script when NEXT_PUBLIC_ADSENSE_CLIENT_ID is not set", () => {
      delete process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
      render(
        <RootLayout>
          <div>Test Page Content</div>
        </RootLayout>
      );
      const script = document.getElementById("adsbygoogle-init");
      expect(script).not.toBeInTheDocument();
    });
  });
});
