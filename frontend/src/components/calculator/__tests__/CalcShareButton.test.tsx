import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CalcShareButton } from "../CalcShareButton";

describe("CalcShareButton", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it("renders with default label 'Share Calculation'", () => {
    render(<CalcShareButton state={{ homePrice: 500000, rate: 5.5 }} />);
    const btn = screen.getByRole("button", { name: "Share Calculation" });
    expect(btn).toBeInTheDocument();
  });

  it("copies serialized query string URL to clipboard and renders temporary feedback", async () => {
    render(
      <CalcShareButton
        state={{ homePrice: 500000, downPayment: 100000, term: 30 }}
        label="Share Mortgage"
      />
    );

    const btn = screen.getByRole("button", { name: "Share Mortgage" });
    fireEvent.click(btn);

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    const copiedUrl = (navigator.clipboard.writeText as any).mock.calls[0][0];
    expect(copiedUrl).toContain("homePrice=500000");
    expect(copiedUrl).toContain("downPayment=100000");
    expect(copiedUrl).toContain("term=30");

    expect(await screen.findByText("Link Copied!")).toBeInTheDocument();
  });
});
