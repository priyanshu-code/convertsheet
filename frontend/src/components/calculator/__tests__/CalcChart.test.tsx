import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { CalcChart } from "../CalcChart";

describe("CalcChart Component", () => {
  const sampleData = [
    { label: "Yr 1", invested: 12000, returns: 13000 },
    { label: "Yr 2", invested: 24000, returns: 28000 },
  ];

  const series = [
    { key: "invested", name: "Invested Capital", color: "#3B82F6", gradientId: "invGrad" },
    { key: "returns", name: "Total Returns", color: "#10B981", gradientId: "retGrad" },
  ];

  it("renders chart title properly", () => {
    render(<CalcChart title="SIP Compounding Growth" data={sampleData} series={series} />);
    expect(screen.getByText("SIP Compounding Growth")).toBeInTheDocument();
  });
});
