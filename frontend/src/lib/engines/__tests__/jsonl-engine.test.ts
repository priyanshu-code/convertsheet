import { describe, it, expect } from "vitest";
import {
  isLlmJsonlRecord,
  flattenLlmJsonlRecord,
  parseAndFlattenJsonl,
  JsonlToExcelEngine,
  JsonlToCsvEngine,
} from "../jsonl-engine";

describe("jsonl-engine (Smart LLM Message Flattener)", () => {
  describe("isLlmJsonlRecord", () => {
    it("identifies OpenAI chat format with messages array", () => {
      expect(isLlmJsonlRecord({ messages: [{ role: "user", content: "Hi" }] })).toBe(true);
    });

    it("identifies ShareGPT format with conversations array", () => {
      expect(isLlmJsonlRecord({ conversations: [{ from: "human", value: "Hi" }] })).toBe(true);
    });

    it("identifies Alpaca format with instruction and output", () => {
      expect(isLlmJsonlRecord({ instruction: "Do X", output: "Done" })).toBe(true);
    });

    it("returns false for standard non-LLM objects", () => {
      expect(isLlmJsonlRecord({ id: 1, name: "Alice", age: 30 })).toBe(false);
      expect(isLlmJsonlRecord("just a string")).toBe(false);
      expect(isLlmJsonlRecord(null)).toBe(false);
    });
  });

  describe("flattenLlmJsonlRecord", () => {
    it("flattens OpenAI chat messages into system, user, and assistant columns", () => {
      const record = {
        messages: [
          { role: "system", content: "You are helpful." },
          { role: "user", content: "What is 2+2?" },
          { role: "assistant", content: "4" },
        ],
        meta: { id: "req_123" },
      };

      const flattened = flattenLlmJsonlRecord(record);

      expect(flattened["system_prompt"]).toBe("You are helpful.");
      expect(flattened["user_prompt"]).toBe("What is 2+2?");
      expect(flattened["assistant_response"]).toBe("4");
      expect(flattened["meta.id"]).toBe("req_123");
    });

    it("flattens multi-turn conversations into numbered turn columns", () => {
      const record = {
        messages: [
          { role: "user", content: "Turn 1 question" },
          { role: "assistant", content: "Turn 1 answer" },
          { role: "user", content: "Turn 2 follow-up" },
          { role: "assistant", content: "Turn 2 answer" },
        ],
      };

      const flattened = flattenLlmJsonlRecord(record);

      expect(flattened["user_1"]).toBe("Turn 1 question");
      expect(flattened["assistant_1"]).toBe("Turn 1 answer");
      expect(flattened["user_2"]).toBe("Turn 2 follow-up");
      expect(flattened["assistant_2"]).toBe("Turn 2 answer");
    });

    it("flattens ShareGPT conversations format", () => {
      const record = {
        conversations: [
          { from: "human", value: "Hello bot" },
          { from: "gpt", value: "Hello human" },
        ],
      };

      const flattened = flattenLlmJsonlRecord(record);

      expect(flattened["user_prompt"]).toBe("Hello bot");
      expect(flattened["assistant_response"]).toBe("Hello human");
    });

    it("flattens Alpaca instruction format", () => {
      const record = {
        instruction: "Summarize this",
        input: "Long text here...",
        output: "Summary here.",
      };

      const flattened = flattenLlmJsonlRecord(record);

      expect(flattened["instruction"]).toBe("Summarize this");
      expect(flattened["input"]).toBe("Long text here...");
      expect(flattened["output"]).toBe("Summary here.");
    });
  });

  describe("parseAndFlattenJsonl", () => {
    it("parses lines and extracts all unique columns across records", async () => {
      const jsonlText = [
        JSON.stringify({ messages: [{ role: "user", content: "Q1" }, { role: "assistant", content: "A1" }] }),
        JSON.stringify({ messages: [{ role: "user", content: "Q2" }, { role: "assistant", content: "A2" }] }),
      ].join("\n");

      const file = new File([jsonlText], "chat_dataset.jsonl", { type: "application/jsonlines" });
      const { columns, rows } = await parseAndFlattenJsonl(file);

      expect(columns).toContain("user_prompt");
      expect(columns).toContain("assistant_response");
      expect(rows).toHaveLength(2);
      expect(rows[0]["user_prompt"]).toBe("Q1");
      expect(rows[1]["assistant_response"]).toBe("A2");
    });
  });

  describe("JsonlToExcelEngine & JsonlToCsvEngine", () => {
    it("converts LLM JSONL to Excel blob with valid filename", async () => {
      const jsonlText = JSON.stringify({
        messages: [{ role: "user", content: "Hi" }, { role: "assistant", content: "Hello!" }],
      });
      const file = new File([jsonlText], "training.jsonl", { type: "application/jsonlines" });

      const engine = new JsonlToExcelEngine();
      const output = await engine.convert(file);

      expect(output.filename).toBe("training.xlsx");
      expect(output.blob.size).toBeGreaterThan(0);
    });

    it("converts LLM JSONL to CSV blob with header and records", async () => {
      const jsonlText = JSON.stringify({
        messages: [{ role: "user", content: "Hi" }, { role: "assistant", content: "Hello!" }],
      });
      const file = new File([jsonlText], "training.jsonl", { type: "application/jsonlines" });

      const engine = new JsonlToCsvEngine();
      const output = await engine.convert(file);

      expect(output.filename).toBe("training.csv");
      expect(output.blob.size).toBeGreaterThan(0);
      const csvContent = await output.blob.text();
      expect(csvContent).toContain("user_prompt");
      expect(csvContent).toContain("assistant_response");
      expect(csvContent).toContain("Hello!");
    });
  });

  describe("ExcelToJsonlEngine", () => {
    it("parses preview and converts Excel workbook into valid JSONL", async () => {
      const XLSX = await import("xlsx");
      const wb = XLSX.utils.book_new();
      const data = [
        { model: "gpt-4o", context: 128000, active: true },
        { model: "claude-3-5-sonnet", context: 200000, active: true },
      ];
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, "Models");
      const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });

      const file = new File([buffer], "models.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const engine = new (await import("../jsonl-engine")).ExcelToJsonlEngine();

      // Test preview
      const preview = await engine.parsePreview(file);
      expect(preview.columns).toEqual(["model", "context", "active"]);
      expect(preview.rows).toHaveLength(2);
      expect(preview.tables).toContain("Models");

      // Test conversion
      const output = await engine.convert(file);
      expect(output.filename).toBe("models.jsonl");
      expect(output.mimeType).toBe("application/x-ndjson");

      const text = await output.blob.text();
      const lines = text.trim().split("\n");
      expect(lines).toHaveLength(2);
      expect(JSON.parse(lines[0])).toEqual({ model: "gpt-4o", context: 128000, active: true });
      expect(JSON.parse(lines[1])).toEqual({ model: "claude-3-5-sonnet", context: 200000, active: true });
    });
  });

  describe("JsonToJsonlEngine", () => {
    it("parses preview and converts standard JSON array into JSONL", async () => {
      const jsonRecords = [
        { id: 1, role: "system", message: "Initialize agent" },
        { id: 2, role: "user", message: "Execute workflow" },
      ];
      const file = new File([JSON.stringify(jsonRecords, null, 2)], "workflow.json", {
        type: "application/json",
      });

      const engine = new (await import("../jsonl-engine")).JsonToJsonlEngine();

      // Test preview
      const preview = await engine.parsePreview(file);
      expect(preview.columns).toEqual(["id", "role", "message"]);
      expect(preview.totalRows).toBe(2);

      // Test conversion
      const output = await engine.convert(file);
      expect(output.filename).toBe("workflow.jsonl");
      expect(output.mimeType).toBe("application/x-ndjson");

      const text = await output.blob.text();
      const lines = text.trim().split("\n");
      expect(lines).toHaveLength(2);
      expect(JSON.parse(lines[0])).toEqual({ id: 1, role: "system", message: "Initialize agent" });
      expect(JSON.parse(lines[1])).toEqual({ id: 2, role: "user", message: "Execute workflow" });
    });
  });
});
