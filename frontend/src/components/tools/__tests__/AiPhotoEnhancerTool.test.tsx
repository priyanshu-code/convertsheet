import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AiPhotoEnhancerTool } from "../AiPhotoEnhancerTool";
import * as mediaEngineClient from "@/lib/media-engine-client";

describe("AiPhotoEnhancerTool", () => {
  it("renders upload dropzone, upscale factor, and optimization format buttons", () => {
    render(<AiPhotoEnhancerTool />);
    expect(screen.getByText(/4x Super-Resolution Sample/i)).toBeInTheDocument();
    expect(screen.getByText(/Upload Any Low-Quality or Pixelated Photo/i)).toBeInTheDocument();
  });

  it("allows selecting upscale multiplier and output format, then passes to engine", async () => {
    const dispatchSpy = vi.spyOn(mediaEngineClient, "dispatchMediaJob").mockResolvedValue({
      job_id: "test-upscale-job-123",
    });

    vi.spyOn(mediaEngineClient, "pollMediaJobFull").mockResolvedValue({
      download_url: "https://engine.solveyourtrip.com/media/api/v1/download/files/photo_4x.webp",
      scale: 4,
      file_size_bytes: 2150000,
      width: 4000,
      height: 3000,
      format: "webp",
    } as any);

    render(<AiPhotoEnhancerTool />);

    const file = new File(["fake image content"], "travel_shot.jpg", {
      type: "image/jpeg",
    });

    const fileInput = screen.getByLabelText(/upload file input/i);
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Should show scale and optimization options
    expect(screen.getByText(/Upscaling Factor/i)).toBeInTheDocument();
    expect(screen.getByText(/Output Optimization/i)).toBeInTheDocument();

    const webpOption = screen.getByRole("button", { name: "WebP" });
    fireEvent.click(webpOption);

    const enhanceBtn = screen.getByRole("button", { name: /Enhance Photo to 4x HD/i });
    fireEvent.click(enhanceBtn);

    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalled();
    });

    const formDataArg = dispatchSpy.mock.calls[0][1] as FormData;
    expect(formDataArg.get("scale")).toBe("4");
    expect(formDataArg.get("output_format")).toBe("webp");

    await waitFor(() => {
      expect(screen.getByText(/4x AI Upscale Complete \(Optimized & Compressed\)/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Download Enhanced Photo/i)).toBeInTheDocument();
  });
});
