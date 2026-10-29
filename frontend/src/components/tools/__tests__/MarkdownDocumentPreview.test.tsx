import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MarkdownDocumentPreview } from "../MarkdownDocumentPreview";

describe("MarkdownDocumentPreview", () => {
  const sampleMarkdown = `## Page 1

For Retail Current Accounts (w.e.f.1st August,2026)

| Product Name (Classification) | Standard Charges (in ) | Pro Business(K PRO) | Privy Business(K_PB) | Privy+Business(KPp8) |
| :--- | :--- | :--- | :--- | :--- |
| | | (atcustomer level) 50,000AQ8 | 10.00.000.RV | 30,00,000RV |

Remittances/Payments:

| | PayableatBranch Locations | | 1/1000 | 20 DD/BCp.m. NIL Charges | NIL Charges up to | NIL Charges |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Banket's Cheque DemandDraft/ | | | (Min 50,Max5000) | StdChrgs | StdChrgs | |
| Payable at Non-Branch | 2/1000 | 10Lp.m; thereafter NIL | 30Lp.m. thereafter NIL | NIL Charges |

### Key Conditions
- Minimum balance: **50,000 AQ8**
- Code snippet: \`TXN_FEE_WAIVED\`
- Reference: [Pricing Policy](https://example.com/pricing)

> Note: All charges subject to applicable GST taxes.
`;

  it("renders page markers as structured page badges", () => {
    render(<MarkdownDocumentPreview markdown={sampleMarkdown} />);
    expect(screen.getByText("Page 1")).toBeInTheDocument();
  });

  it("renders markdown pipe tables as real HTML tables with headers and rows", () => {
    render(<MarkdownDocumentPreview markdown={sampleMarkdown} />);

    // Should render two tables
    expect(screen.getByText("Table #1")).toBeInTheDocument();
    expect(screen.getByText("Table #2")).toBeInTheDocument();

    // Headers
    expect(screen.getByText("Product Name (Classification)")).toBeInTheDocument();
    expect(screen.getByText("Standard Charges (in )")).toBeInTheDocument();
    expect(screen.getByText("Pro Business(K PRO)")).toBeInTheDocument();

    // Table rows data
    expect(screen.getByText("(atcustomer level) 50,000AQ8")).toBeInTheDocument();
    expect(screen.getByText("Banket's Cheque DemandDraft/")).toBeInTheDocument();
    expect(screen.getByText("Payable at Non-Branch")).toBeInTheDocument();
  });

  it("renders copy CSV and TSV buttons for extracted tables", () => {
    // Mock navigator.clipboard
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<MarkdownDocumentPreview markdown={sampleMarkdown} />);
    const copyCsvBtns = screen.getAllByRole("button", { name: /copy csv/i });
    expect(copyCsvBtns.length).toBeGreaterThanOrEqual(1);

    fireEvent.click(copyCsvBtns[0]);
    expect(writeTextMock).toHaveBeenCalled();
  });

  it("renders headings, lists, bold text, inline code, and blockquotes", () => {
    render(<MarkdownDocumentPreview markdown={sampleMarkdown} />);

    expect(screen.getByRole("heading", { name: "Key Conditions", level: 3 })).toBeInTheDocument();
    expect(screen.getByText("50,000 AQ8")).toBeInTheDocument();
    expect(screen.getByText("TXN_FEE_WAIVED")).toBeInTheDocument();
    expect(screen.getByText(/All charges subject to applicable GST taxes/i)).toBeInTheDocument();
  });

  it("supports in-document text search and filtering", () => {
    render(<MarkdownDocumentPreview markdown={sampleMarkdown} />);
    const searchInput = screen.getByPlaceholderText(/search extracted document text/i);

    fireEvent.change(searchInput, { target: { value: "Remittances" } });
    const mark = screen.getByText("Remittances");
    expect(mark).toBeInTheDocument();
    expect(mark.tagName.toLowerCase()).toBe("mark");
  });

  it("allows switching document text sizing", () => {
    render(<MarkdownDocumentPreview markdown={sampleMarkdown} />);
    const largeBtn = screen.getByRole("button", { name: "Large" });
    fireEvent.click(largeBtn);
    expect(largeBtn).toHaveClass("bg-white");
  });
});
