import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CommandPalette } from "../CommandPalette";

describe("CommandPalette Component", () => {
  it("renders when isOpen is true and filters search results", () => {
    const handleClose = vi.fn();
    render(<CommandPalette isOpen={true} onClose={handleClose} />);

    expect(screen.getByPlaceholderText(/Type a tool name/i)).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/Type a tool name/i);
    fireEvent.change(input, { target: { value: "SIP" } });

    expect(screen.getByText("SIP Calculator")).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    const handleClose = vi.fn();
    render(<CommandPalette isOpen={false} onClose={handleClose} />);
    expect(screen.queryByPlaceholderText(/Type a tool name/i)).not.toBeInTheDocument();
  });
});
