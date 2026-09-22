import {
  guessColumnRoles,
  estimateTokenCount,
  normalizeText,
  convertTabularToLlm,
  SAMPLE_DATASETS,
} from "../ai-dataset-engine";

describe("ai-dataset-engine", () => {
  describe("guessColumnRoles", () => {
    it("correctly identifies common LLM role headers", () => {
      const headers = ["system_prompt", "user_question", "assistant_response", "context_doc", "timestamp"];
      const roles = guessColumnRoles(headers);

      expect(roles["system_prompt"]).toBe("system");
      expect(roles["user_question"]).toBe("user");
      expect(roles["assistant_response"]).toBe("assistant");
      expect(roles["context_doc"]).toBe("context");
      expect(roles["timestamp"]).toBe("metadata");
    });

    it("falls back to assigning first column to user and second to assistant if unrecognized", () => {
      const headers = ["colA", "colB", "colC"];
      const roles = guessColumnRoles(headers);

      expect(roles["colA"]).toBe("user");
      expect(roles["colB"]).toBe("assistant");
      expect(roles["colC"]).toBe("metadata");
    });
  });

  describe("estimateTokenCount", () => {
    it("returns 0 for empty string", () => {
      expect(estimateTokenCount("")).toBe(0);
    });

    it("calculates realistic token estimates for typical English text", () => {
      const text = "You are a helpful customer service assistant for ConvertSheet.";
      const count = estimateTokenCount(text);
      expect(count).toBeGreaterThan(5);
      expect(count).toBeLessThan(20);
    });
  });

  describe("normalizeText", () => {
    it("normalizes smart quotes, em dashes, and non-breaking spaces", () => {
      const dirty = "“Hello world”—test\u00A0space";
      const clean = normalizeText(dirty);
      expect(clean).toBe('"Hello world"-test space');
    });
  });

  describe("convertTabularToLlm", () => {
    const headers = ["System", "Prompt", "Completion"];
    const rows = [
      {
        System: "You are an assistant.",
        Prompt: "What is 2+2?",
        Completion: "4",
      },
      {
        System: "You are an assistant.",
        Prompt: "What is the capital of France?",
        Completion: "Paris",
      },
    ];
    const mapping = {
      System: "system" as const,
      Prompt: "user" as const,
      Completion: "assistant" as const,
    };

    it("converts to valid OpenAI Chat JSONL format", () => {
      const result = convertTabularToLlm(headers, rows, mapping, "openai-chat");

      expect(result.rowsValid).toBe(2);
      expect(result.rowsSkipped).toBe(0);

      const lines = result.jsonl.split("\n");
      expect(lines.length).toBe(2);

      const firstParsed = JSON.parse(lines[0]);
      expect(firstParsed.messages).toBeDefined();
      expect(firstParsed.messages.length).toBe(3);
      expect(firstParsed.messages[0]).toEqual({ role: "system", content: "You are an assistant." });
      expect(firstParsed.messages[1]).toEqual({ role: "user", content: "What is 2+2?" });
      expect(firstParsed.messages[2]).toEqual({ role: "assistant", content: "4" });
    });

    it("converts to Anthropic Messages format", () => {
      const result = convertTabularToLlm(headers, rows, mapping, "anthropic-messages");

      expect(result.rowsValid).toBe(2);
      const firstParsed = JSON.parse(result.jsonl.split("\n")[0]);
      expect(firstParsed.system).toBe("You are an assistant.");
      expect(firstParsed.messages.length).toBe(2);
      expect(firstParsed.messages[0]).toEqual({ role: "user", content: "What is 2+2?" });
      expect(firstParsed.messages[1]).toEqual({ role: "assistant", content: "4" });
    });

    it("converts to Alpaca instruction format", () => {
      const result = convertTabularToLlm(headers, rows, mapping, "alpaca");

      expect(result.rowsValid).toBe(2);
      const firstParsed = JSON.parse(result.jsonl.split("\n")[0]);
      expect(firstParsed.instruction).toBe("You are an assistant.");
      expect(firstParsed.input).toBe("What is 2+2?");
      expect(firstParsed.output).toBe("4");
    });

    it("handles deduplication and skips empty rows", () => {
      const rowsWithDuplicatesAndEmpty = [
        ...rows,
        { System: "", Prompt: "What is 2+2?", Completion: "4 again" }, // duplicate prompt
        { System: "", Prompt: "", Completion: "" }, // empty row
      ];

      const result = convertTabularToLlm(headers, rowsWithDuplicatesAndEmpty, mapping, "openai-chat", {
        deduplicate: true,
        dropEmptyRows: true,
      });

      expect(result.rowsValid).toBe(2);
      expect(result.rowsSkipped).toBe(2);
      expect(result.warnings.length).toBe(2);
    });

    it("masks PII when maskPii is enabled", () => {
      const piiRows = [
        {
          System: "",
          Prompt: "My email is john.doe@example.com and phone is 555-123-4567",
          Completion: "Got it.",
        },
      ];

      const result = convertTabularToLlm(headers, piiRows, mapping, "openai-chat", {
        maskPii: true,
      });

      const parsed = JSON.parse(result.jsonl);
      expect(parsed.messages[0].content).not.toContain("john.doe@example.com");
      expect(parsed.messages[0].content).toContain("@example.com");
    });
  });

  describe("SAMPLE_DATASETS", () => {
    it("contains valid pre-baked sample datasets", () => {
      expect(SAMPLE_DATASETS.length).toBeGreaterThan(0);
      SAMPLE_DATASETS.forEach((ds) => {
        expect(ds.headers.length).toBeGreaterThan(0);
        expect(ds.rows.length).toBeGreaterThan(0);
      });
    });
  });
});
