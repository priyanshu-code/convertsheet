import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import AboutPage from "../page";

describe("AboutPage", () => {
  it("renders founder story and verified credentials for Priyanshu Rawat", () => {
    render(<AboutPage />);
    expect(screen.getByText("Built by Priyanshu Rawat")).toBeInTheDocument();
    expect(screen.getByText("Founder & Engineering Lead")).toBeInTheDocument();
    expect(screen.getByText(/I started ConvertSheet out of pure frustration/i)).toBeInTheDocument();

    const linkedIn = screen.getByRole("link", { name: /Priyanshu Rawat on LinkedIn/i });
    expect(linkedIn).toHaveAttribute("href", "https://www.linkedin.com/in/priyanshu-rawat-570b7a19b/");

    const github = screen.getByRole("link", { name: /Priyanshu Rawat on GitHub/i });
    expect(github).toHaveAttribute("href", "https://github.com/priyanshu-code");

    const x = screen.getByRole("link", { name: /Priyanshu Rawat on X/i });
    expect(x).toHaveAttribute("href", "https://x.com/priyanshuz_code");
  });
});
