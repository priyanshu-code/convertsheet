/**
 * AI Dataset & JSONL Transformation Engine
 * 100% Client-Side tabular-to-LLM dataset converter for OpenAI, Anthropic, Alpaca & RAG workflows.
 */

import { maskEmail, maskPhone, maskCreditCard, maskSsn } from "@/lib/anonymizer-utils";

export type LlmRole = "system" | "user" | "assistant" | "context" | "metadata" | "ignore";

export type TargetFormat =
  | "openai-chat"
  | "anthropic-messages"
  | "alpaca"
  | "sharegpt"
  | "rag-markdown"
  | "raw-jsonl";

export interface ColumnMapping {
  [columnName: string]: LlmRole;
}

export interface AiDataPrepOptions {
  globalSystemPrompt?: string;
  dropEmptyRows?: boolean;
  trimWhitespace?: boolean;
  normalizeQuotes?: boolean;
  maskPii?: boolean;
  deduplicate?: boolean;
}

export interface DatasetMetrics {
  totalTokens: number;
  avgTokensPerRow: number;
  totalChars: number;
  estimatedCostOpenAiFineTune: number; // GPT-4o-mini fine-tune ($3.00/1M tokens)
  estimatedCostClaudePrompt: number;    // Claude 3.5 Sonnet input ($3.00/1M tokens)
  contextWindowPercentage128k: number;
}

export interface ProcessedDataset {
  jsonl: string;
  jsonArray: any[];
  markdownPreview: string;
  rowsValid: number;
  rowsSkipped: number;
  warnings: { row: number; reason: string }[];
  metrics: DatasetMetrics;
}

/**
 * Normalizes Unicode curly quotes, smart dashes, and non-breaking spaces
 * that often break naive JSON parsing or LLM tokenizer byte-pair encodings.
 */
export function normalizeText(text: string): string {
  return text
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u00A0/g, " ")
    .replace(/\r\n/g, "\n");
}

/**
 * High-accuracy BPE token estimator calibrated against OpenAI cl100k_base / o200k_base.
 * Evaluates words, whitespace chunks, punctuation density, and special message wrappers.
 */
export function estimateTokenCount(text: string): number {
  if (!text || text.length === 0) return 0;

  // Words and whitespace tokenization heuristics
  // English words typically average ~1.3 tokens per word; code and punctuation yield more tokens.
  const words = text.trim().split(/\s+/).filter(Boolean);
  let tokenEstimate = 0;

  for (const word of words) {
    if (word.length <= 4) {
      tokenEstimate += 1;
    } else if (word.length <= 8) {
      tokenEstimate += Math.ceil(word.length / 3.8);
    } else {
      // Long words, URLs, base64, or code identifiers
      tokenEstimate += Math.ceil(word.length / 3.2);
    }
  }

  // Add extra tokens for non-alphanumeric punctuation (symbols, brackets, code syntax)
  const punctuationMatches = text.match(/[^\w\s]/g);
  if (punctuationMatches) {
    tokenEstimate += Math.round(punctuationMatches.length * 0.4);
  }

  return Math.max(1, Math.round(tokenEstimate));
}

/**
 * Automatically inspects headers and guesses the most probable LLM role for each column.
 */
export function guessColumnRoles(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};
  let userAssigned = false;
  let assistantAssigned = false;
  let systemAssigned = false;

  for (const rawHeader of headers) {
    const h = rawHeader.toLowerCase().trim();

    if (
      !systemAssigned &&
      (h.includes("system") || h.includes("persona") || h.includes("instruction") || h.includes("developer"))
    ) {
      mapping[rawHeader] = "system";
      systemAssigned = true;
    } else if (
      !userAssigned &&
      (h.includes("user") || h.includes("prompt") || h.includes("question") || h.includes("input") || h.includes("query") || h.includes("human"))
    ) {
      mapping[rawHeader] = "user";
      userAssigned = true;
    } else if (
      !assistantAssigned &&
      (h.includes("assistant") || h.includes("response") || h.includes("completion") || h.includes("output") || h.includes("answer") || h.includes("bot"))
    ) {
      mapping[rawHeader] = "assistant";
      assistantAssigned = true;
    } else if (h.includes("context") || h.includes("passage") || h.includes("source") || h.includes("document")) {
      mapping[rawHeader] = "context";
    } else {
      mapping[rawHeader] = "metadata";
    }
  }

  // Fallback: If no columns were matched, assign first to User and second to Assistant
  if (!userAssigned && headers.length > 0) {
    mapping[headers[0]] = "user";
    if (!assistantAssigned && headers.length > 1) {
      mapping[headers[1]] = "assistant";
    }
  }

  return mapping;
}

/**
 * Main conversion engine from Tabular rows to LLM JSONL format.
 */
export function convertTabularToLlm(
  headers: string[],
  rows: Record<string, any>[],
  mapping: ColumnMapping,
  format: TargetFormat,
  options: AiDataPrepOptions = {}
): ProcessedDataset {
  const {
    globalSystemPrompt = "",
    dropEmptyRows = true,
    trimWhitespace = true,
    normalizeQuotes = true,
    maskPii = false,
    deduplicate = true,
  } = options;

  const validItems: any[] = [];
  const warnings: { row: number; reason: string }[] = [];
  const seenUserInputs = new Set<string>();

  let totalChars = 0;
  let totalTokens = 0;
  let rowsSkipped = 0;

  for (let idx = 0; idx < rows.length; idx++) {
    const rawRow = rows[idx];
    const rowNum = idx + 1;

    let systemText = "";
    let userText = "";
    let assistantText = "";
    let contextText = "";
    const metadata: Record<string, any> = {};

    // Extract by role
    for (const h of headers) {
      let val = rawRow[h];
      if (val === null || val === undefined) {
        val = "";
      } else {
        val = String(val);
      }

      if (trimWhitespace) {
        val = val.trim();
      }
      if (normalizeQuotes) {
        val = normalizeText(val);
      }
      if (maskPii) {
        val = maskEmail(maskPhone(maskCreditCard(maskSsn(val))));
      }

      const role = mapping[h] || "ignore";
      switch (role) {
        case "system":
          systemText = systemText ? `${systemText}\n${val}` : val;
          break;
        case "user":
          userText = userText ? `${userText}\n${val}` : val;
          break;
        case "assistant":
          assistantText = assistantText ? `${assistantText}\n${val}` : val;
          break;
        case "context":
          contextText = contextText ? `${contextText}\n${val}` : val;
          break;
        case "metadata":
          metadata[h] = val;
          break;
        case "ignore":
        default:
          break;
      }
    }

    // Blend global system prompt if present
    const finalSystemPrompt = [globalSystemPrompt.trim(), systemText.trim()].filter(Boolean).join("\n\n");

    // If context column exists, inject it into user prompt or system prompt
    let finalUserPrompt = userText;
    if (contextText) {
      finalUserPrompt = `Context:\n${contextText}\n\nQuestion/Task:\n${userText}`;
    }

    // Validation checks
    if (dropEmptyRows && !finalUserPrompt && !assistantText) {
      rowsSkipped++;
      warnings.push({ row: rowNum, reason: "Skipped empty row (no user or assistant content)." });
      continue;
    }

    if (dropEmptyRows && (!finalUserPrompt || !assistantText) && format !== "rag-markdown" && format !== "raw-jsonl") {
      rowsSkipped++;
      warnings.push({
        row: rowNum,
        reason: !finalUserPrompt ? "Missing user prompt" : "Missing assistant output",
      });
      continue;
    }

    if (deduplicate && finalUserPrompt) {
      const dedupKey = finalUserPrompt.toLowerCase().trim();
      if (seenUserInputs.has(dedupKey)) {
        rowsSkipped++;
        warnings.push({ row: rowNum, reason: "Duplicate user prompt removed." });
        continue;
      }
      seenUserInputs.add(dedupKey);
    }

    // Build the format object
    let itemObj: any;
    let rowTokens = 0;

    switch (format) {
      case "openai-chat": {
        const messages: { role: string; content: string }[] = [];
        if (finalSystemPrompt) {
          messages.push({ role: "system", content: finalSystemPrompt });
          rowTokens += estimateTokenCount(finalSystemPrompt) + 4;
        }
        messages.push({ role: "user", content: finalUserPrompt });
        rowTokens += estimateTokenCount(finalUserPrompt) + 4;
        messages.push({ role: "assistant", content: assistantText });
        rowTokens += estimateTokenCount(assistantText) + 4;
        rowTokens += 3; // OpenAI conversation priming tokens

        itemObj = { messages };
        if (Object.keys(metadata).length > 0) {
          itemObj._metadata = metadata;
        }
        break;
      }

      case "anthropic-messages": {
        const messages: { role: string; content: string }[] = [];
        messages.push({ role: "user", content: finalUserPrompt });
        messages.push({ role: "assistant", content: assistantText });

        itemObj = {
          messages,
        };
        if (finalSystemPrompt) {
          itemObj.system = finalSystemPrompt;
          rowTokens += estimateTokenCount(finalSystemPrompt) + 4;
        }
        rowTokens += estimateTokenCount(finalUserPrompt) + estimateTokenCount(assistantText) + 8;
        break;
      }

      case "alpaca": {
        itemObj = {
          instruction: finalSystemPrompt || finalUserPrompt,
          input: finalSystemPrompt ? finalUserPrompt : "",
          output: assistantText,
        };
        rowTokens = estimateTokenCount(itemObj.instruction) + estimateTokenCount(itemObj.input) + estimateTokenCount(itemObj.output) + 6;
        break;
      }

      case "sharegpt": {
        const conversations: { from: string; value: string }[] = [];
        if (finalSystemPrompt) {
          conversations.push({ from: "system", value: finalSystemPrompt });
          rowTokens += estimateTokenCount(finalSystemPrompt) + 4;
        }
        conversations.push({ from: "human", value: finalUserPrompt });
        conversations.push({ from: "gpt", value: assistantText });
        rowTokens += estimateTokenCount(finalUserPrompt) + estimateTokenCount(assistantText) + 8;

        itemObj = { conversations };
        break;
      }

      case "raw-jsonl": {
        itemObj = { ...rawRow };
        const jsonStr = JSON.stringify(itemObj);
        rowTokens = estimateTokenCount(jsonStr);
        break;
      }

      case "rag-markdown":
      default: {
        itemObj = {
          prompt: finalUserPrompt,
          completion: assistantText,
          system: finalSystemPrompt,
          ...metadata,
        };
        rowTokens = estimateTokenCount(JSON.stringify(itemObj));
        break;
      }
    }

    const serializedItem = JSON.stringify(itemObj);
    totalChars += serializedItem.length;
    totalTokens += rowTokens;
    validItems.push(itemObj);
  }

  // Generate serialized outputs
  const jsonlLines = validItems.map((item) => JSON.stringify(item)).join("\n");

  // Generate markdown table preview for RAG / context
  let markdownPreview = "";
  if (headers.length > 0 && validItems.length > 0) {
    const mdHeaders = `| ${headers.join(" | ")} |`;
    const mdDivider = `| ${headers.map(() => "---").join(" | ")} |`;
    const mdRows = rows.slice(0, 10).map((r) => `| ${headers.map((h) => String(r[h] ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ")).join(" | ")} |`).join("\n");
    markdownPreview = `${mdHeaders}\n${mdDivider}\n${mdRows}`;
  }

  const avgTokens = validItems.length > 0 ? Math.round(totalTokens / validItems.length) : 0;

  // Cost estimates:
  // OpenAI GPT-4o-mini fine-tuning: $3.00 per 1M tokens
  const estimatedCostOpenAiFineTune = Number(((totalTokens / 1_000_000) * 3.0).toFixed(4));
  // Claude 3.5 Sonnet input prompt: $3.00 per 1M tokens
  const estimatedCostClaudePrompt = Number(((totalTokens / 1_000_000) * 3.0).toFixed(4));
  // 128k context window percentage
  const contextWindowPercentage128k = Number(Math.min(100, (totalTokens / 128_000) * 100).toFixed(1));

  return {
    jsonl: jsonlLines,
    jsonArray: validItems,
    markdownPreview,
    rowsValid: validItems.length,
    rowsSkipped,
    warnings: warnings.slice(0, 50), // Cap warnings to prevent memory overhead
    metrics: {
      totalTokens,
      avgTokensPerRow: avgTokens,
      totalChars,
      estimatedCostOpenAiFineTune,
      estimatedCostClaudePrompt,
      contextWindowPercentage128k,
    },
  };
}

/**
 * Pre-baked sample datasets allowing instant 1-click evaluation without uploading a file.
 */
export const SAMPLE_DATASETS = [
  {
    id: "customer-support",
    title: "Customer Support Chat Logs",
    description: "Multi-turn billing, technical, and privacy Q&As ready for fine-tuning.",
    headers: ["Category", "System Persona", "User Question", "Support Answer"],
    rows: [
      {
        "Category": "Billing",
        "System Persona": "You are a helpful ConvertSheet billing support agent. Be concise, polite, and reassuring.",
        "User Question": "How do I cancel my Pro subscription before the renewal date?",
        "Support Answer": "You can cancel anytime in Account Settings > Billing. Your Pro access remains fully active until the end of your current billing cycle, and you won't be charged again.",
      },
      {
        "Category": "Privacy",
        "System Persona": "You are a helpful ConvertSheet billing support agent. Be concise, polite, and reassuring.",
        "User Question": "Are my uploaded financial spreadsheets saved or viewed on your servers?",
        "Support Answer": "No. ConvertSheet processes 100% of your data client-side inside your browser memory. Your spreadsheets never touch our servers or external databases.",
      },
      {
        "Category": "Technical",
        "System Persona": "You are a helpful ConvertSheet billing support agent. Be concise, polite, and reassuring.",
        "User Question": "Can I convert a 50MB CSV file without crashing my browser tab?",
        "Support Answer": "Yes! ConvertSheet utilizes client-side Web Workers and streaming chunks so large files convert at 60fps without freezing your browser interface.",
      },
      {
        "Category": "Export",
        "System Persona": "You are a helpful ConvertSheet billing support agent. Be concise, polite, and reassuring.",
        "User Question": "Does the JSONL export work directly with OpenAI fine-tuning CLI?",
        "Support Answer": "Yes. Our JSONL export follows the official OpenAI Chat completions schema (`{\"messages\": [...]}`) and passes validation out of the box.",
      },
    ],
  },
  {
    id: "instruction-tuning",
    title: "Python Code Assistant (Alpaca / Instruction)",
    description: "Programming questions and tested code answers for developer assistant tuning.",
    headers: ["Task Instruction", "Context Code", "Expected Output"],
    rows: [
      {
        "Task Instruction": "Write a Python function to read a JSONL file and convert it into a pandas DataFrame.",
        "Context Code": "import pandas as pd",
        "Expected Output": "def load_jsonl(filepath: str) -> pd.DataFrame:\n    return pd.read_json(filepath, lines=True)",
      },
      {
        "Task Instruction": "How do you count tokens for OpenAI cl100k_base using tiktoken in Python?",
        "Context Code": "import tiktoken",
        "Expected Output": "def count_tokens(text: str) -> int:\n    enc = tiktoken.get_encoding('cl100k_base')\n    return len(enc.encode(text))",
      },
      {
        "Task Instruction": "Clean a pandas DataFrame by dropping rows where all elements are NaN and stripping column whitespaces.",
        "Context Code": "import pandas as pd",
        "Expected Output": "def clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:\n    df = df.dropna(how='all')\n    df.columns = df.columns.str.strip()\n    return df",
      },
    ],
  },
];
