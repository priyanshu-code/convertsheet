import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { KbImageResizerTool } from "../KbImageResizerTool";
import { WhiteBackgroundPassportTool } from "../WhiteBackgroundPassportTool";
import { FaceUnblurTool } from "../FaceUnblurTool";
import { AiPhotoEnhancerTool } from "../AiPhotoEnhancerTool";
import * as mediaClient from "@/lib/media-engine-client";
import { getAllToolSlugs, getToolBySlug } from "@/lib/tool-registry";

describe("Target KB and Image Tools Suite", () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    if (!globalThis.URL.createObjectURL) {
      globalThis.URL.createObjectURL = vi.fn(() => "blob:mock-image-url");
    } else {
      vi.spyOn(globalThis.URL, "createObjectURL").mockReturnValue("blob:mock-image-url");
    }
    if (!globalThis.URL.revokeObjectURL) {
      globalThis.URL.revokeObjectURL = vi.fn();
    } else {
      vi.spyOn(globalThis.URL, "revokeObjectURL").mockImplementation(() => {});
    }

    Object.defineProperty(global.Image.prototype, "naturalWidth", { value: 1200, configurable: true });
    Object.defineProperty(global.Image.prototype, "naturalHeight", { value: 800, configurable: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("KbImageResizerTool Component", () => {
    it("renders default target KB, title, and upload zone", () => {
      render(
        <KbImageResizerTool
          defaultTargetKb={50}
          title="Compress Image to 50KB"
          subtitle="Compress photos to under 50KB for passport and exam forms."
        />
      );

      expect(screen.getByText("Compress Image to 50KB")).toBeInTheDocument();
      expect(screen.getByText(/under 50KB for passport/i)).toBeInTheDocument();
      expect(screen.getByText(/Click to select or drag & drop photo/i)).toBeInTheDocument();
      expect(screen.getByText(/Max 50 KB/i)).toBeInTheDocument();
    });

    it("renders quick KB target pills and changes target KB on click", () => {
      render(<KbImageResizerTool defaultTargetKb={50} />);

      const pill20 = screen.getByRole("button", { name: "20 KB" });
      expect(pill20).toBeInTheDocument();

      fireEvent.click(pill20);
      expect(screen.getByText(/Max 20 KB/i)).toBeInTheDocument();
    });

    it("renders government portal presets", () => {
      render(<KbImageResizerTool />);

      expect(screen.getByText(/India Passport \(3.5 x 4.5 cm\)/i)).toBeInTheDocument();
      expect(screen.getByText(/US Visa 2x2 Inch/i)).toBeInTheDocument();
      expect(screen.getByText(/SSC \/ UPSC Exam/i)).toBeInTheDocument();
      expect(screen.getByText(/Signature Upload/i)).toBeInTheDocument();
    });

    it("dispatches job to backend engine on submit", async () => {
      vi.spyOn(mediaClient, "dispatchMediaJob").mockResolvedValue({
        download_url: "https://engine.solveyourtrip.com/media/api/v1/download/files/img_compressed.jpg",
        bytes: 48120,
        quality: 78,
      });

      render(<KbImageResizerTool defaultTargetKb={50} />);

      const file = new File(["dummy image bits"], "photo.jpg", { type: "image/jpeg" });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText("photo.jpg")).toBeInTheDocument();
      });

      const compressBtn = screen.getByRole("button", { name: /Compress Image to 50 KB/i });
      expect(compressBtn).toBeInTheDocument();
      fireEvent.click(compressBtn);

      await waitFor(() => {
        expect(mediaClient.dispatchMediaJob).toHaveBeenCalledWith(
          "image/transform",
          expect.any(FormData)
        );
      });
    });
  });

  describe("WhiteBackgroundPassportTool Component", () => {
    it("renders official passport presets (3.5x4.5cm and 2x2 inch)", () => {
      render(<WhiteBackgroundPassportTool />);

      expect(screen.getByText(/3.5 x 4.5 cm \(Standard\)/i)).toBeInTheDocument();
      expect(screen.getByText(/2 x 2 Inch \(Square\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Home Selfie \/ Cluttered Room/i)).toBeInTheDocument();
    });

    it("renders background backdrop selector (Pure White, Off White, Consular Blue)", () => {
      render(<WhiteBackgroundPassportTool />);

      expect(screen.getByText("Pure White")).toBeInTheDocument();
      expect(screen.getByText("Off White")).toBeInTheDocument();
      expect(screen.getByText("Consular Blue")).toBeInTheDocument();
    });
  });

  describe("FaceUnblurTool and AiPhotoEnhancerTool", () => {
    it("renders FaceUnblurTool with interactive example and dropzone", () => {
      render(<FaceUnblurTool />);

      expect(screen.getByText(/Interactive AI Example/i)).toBeInTheDocument();
      expect(screen.getByText(/Blurry \/ Low-Res Face/i)).toBeInTheDocument();
      expect(screen.getByText(/Upload Blurry Photo or Vintage Portrait/i)).toBeInTheDocument();
    });

    it("renders AiPhotoEnhancerTool with super-resolution sample and upload dropzone", () => {
      render(<AiPhotoEnhancerTool />);

      expect(screen.getByText(/4x Super-Resolution Sample/i)).toBeInTheDocument();
      expect(screen.getByText(/Low-Res Thumbnail \(300px\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Upload Any Low-Quality or Pixelated Photo/i)).toBeInTheDocument();
    });
  });

  describe("Tool Registry Image Tools & Downloader Exclusion Integrity", () => {
    const allSlugs = getAllToolSlugs();

    it("strictly DOES NOT list YouTube or Instagram downloader tools", () => {
      expect(allSlugs).not.toContain("youtube-downloader");
      expect(allSlugs).not.toContain("youtube-to-mp3");
      expect(allSlugs).not.toContain("instagram-downloader");
      expect(allSlugs).not.toContain("download-instagram-reels");

      expect(getToolBySlug("youtube-downloader")).toBeUndefined();
      expect(getToolBySlug("instagram-downloader")).toBeUndefined();
    });

    it("registers all discussed Target-KB and Exam Resizer image tools", () => {
      const expectedImageTools = [
        "compress-image-to-20kb",
        "compress-image-to-50kb",
        "compress-image-to-100kb",
        "compress-image-to-200kb",
        "reduce-image-size-in-kb",
        "increase-image-size-in-kb",
        "passport-photo-maker",
        "signature-resizer",
        "ssc-photo-resizer",
        "upsc-photo-resizer",
        "pan-card-photo-resizer",
        "white-background-passport-photo",
        "unblur-face",
        "unblur-image",
        "ai-photo-enhancer",
      ];

      for (const slug of expectedImageTools) {
        const tool = getToolBySlug(slug);
        expect(tool, `Expected tool "${slug}" to be registered in TOOL_REGISTRY`).toBeDefined();
        expect(tool?.title).toBeTruthy();
        expect(tool?.metaDescription).toBeTruthy();
        expect(tool?.keywords.length).toBeGreaterThanOrEqual(4);
        expect(tool?.howTo.length).toBeGreaterThanOrEqual(3);
        expect(tool?.faqs.length).toBeGreaterThanOrEqual(2);
      }
    });
  });
});
