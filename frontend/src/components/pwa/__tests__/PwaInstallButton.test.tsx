import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { PwaInstallButton } from "../PwaInstallButton";

describe("PWA Install & Offline Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("registers service worker on mount if supported", () => {
    const registerMock = vi.fn().mockResolvedValue({ scope: "/" });
    Object.defineProperty(global.navigator, "serviceWorker", {
      value: { register: registerMock },
      configurable: true,
    });

    render(<PwaInstallButton />);
    expect(registerMock).toHaveBeenCalledWith("/sw.js");
  });

  it("displays Offline Mode Active badge when offline event fires", () => {
    render(<PwaInstallButton />);

    act(() => {
      window.dispatchEvent(new Event("offline"));
    });

    expect(screen.getByText(/Offline Mode Active/i)).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new Event("online"));
    });

    expect(screen.queryByText(/Offline Mode Active/i)).not.toBeInTheDocument();
  });

  it("handles beforeinstallprompt and prompts user on click", async () => {
    const promptMock = vi.fn().mockResolvedValue(undefined);
    const userChoiceMock = Promise.resolve({ outcome: "accepted" as const, platform: "web" });

    render(<PwaInstallButton />);

    // Trigger beforeinstallprompt event
    const event = new Event("beforeinstallprompt");
    Object.assign(event, {
      prompt: promptMock,
      userChoice: userChoiceMock,
    });

    act(() => {
      window.dispatchEvent(event);
    });

    const installBtn = screen.getByRole("button", { name: /Install ConvertSheet App/i });
    expect(installBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(installBtn);
    });

    expect(promptMock).toHaveBeenCalled();
  });
});
