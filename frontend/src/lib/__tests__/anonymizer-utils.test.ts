import { describe, it, expect } from "vitest";
import {
  maskEmail,
  maskPhone,
  maskCreditCard,
  maskSsn,
  normalizeDateValue,
  anonymizeTable,
} from "../anonymizer-utils";

describe("PII Anonymizer Utilities", () => {
  it("masks email addresses while preserving domain", () => {
    expect(maskEmail("alice@acme.com")).toBe("a***e@acme.com");
    expect(maskEmail("Contact: john.smith@company.org for details")).toBe(
      "Contact: j***h@company.org for details"
    );
  });

  it("masks phone numbers keeping only last 4 digits", () => {
    expect(maskPhone("Call 555-123-4567 today")).toBe("Call (***) ***-4567 today");
    expect(maskPhone("(800) 555-9876")).toBe("(***) ***-9876");
  });

  it("masks credit cards and SSNs", () => {
    expect(maskCreditCard("Card: 4111 2222 3333 4444")).toBe("Card: ****-****-****-4444");
    expect(maskSsn("SSN is 123-45-6789")).toBe("SSN is ***-**-6789");
  });

  it("normalizes date formats to ISO YYYY-MM-DD", () => {
    expect(normalizeDateValue("2024/05/12")).toBe("2024-05-12");
  });

  it("anonymizes tabular rows and tracks statistics", () => {
    const headers = ["Name", "Email", "Phone", "Notes"];
    const rows = [
      { Name: " Alice ", Email: "alice@test.com", Phone: "555-000-1111", Notes: "VIP" },
      { Name: "Bob", Email: "bob@test.com", Phone: "555-000-2222", Notes: "Standard" },
      { Name: " Alice ", Email: "alice@test.com", Phone: "555-000-1111", Notes: "VIP" }, // duplicate
    ];

    const result = anonymizeTable(headers, rows, {
      maskEmails: true,
      maskPhones: true,
      trimWhitespace: true,
      deduplicateRows: true,
    });

    expect(result.stats.rowsRemoved).toBe(1);
    expect(result.rows.length).toBe(2);
    expect(result.rows[0].Name).toBe("Alice");
    expect(result.rows[0].Email).toBe("a***e@test.com");
    expect(result.rows[0].Phone).toBe("(***) ***-1111");
  });
});
