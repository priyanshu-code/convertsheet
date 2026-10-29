"use client";

import React, { useState, useMemo } from "react";
import {
  FileText,
  Table as TableIcon,
  Copy,
  Check,
  Search,
  Download,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";

interface MarkdownDocumentPreviewProps {
  markdown: string;
  pageCount?: number;
  tableCount?: number;
}

type Alignment = "left" | "center" | "right" | "default";

interface TableData {
  headers: string[];
  alignments: Alignment[];
  rows: string[][];
  rawMarkdown: string;
}

type BlockType =
  | { type: "page"; pageNumber: string; title: string }
  | { type: "heading"; level: number; text: string }
  | { type: "table"; data: TableData; tableIndex: number }
  | { type: "code"; code: string; language: string }
  | { type: "blockquote"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "hr" }
  | { type: "paragraph"; text: string };

function parseAlignments(delimiterRow: string): Alignment[] {
  const cells = delimiterRow
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());

  return cells.map((cell) => {
    const left = cell.startsWith(":");
    const right = cell.endsWith(":");
    if (left && right) return "center";
    if (right) return "right";
    if (left) return "left";
    return "default";
  });
}

function splitTableRow(rowStr: string): string[] {
  let s = rowStr.trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (/(?<!\\)\|$/.test(s)) s = s.slice(0, -1);
  return s.split(/(?<!\\)\|/).map((cell) => cell.replace(/\\\|/g, "|").trim());
}

const SEPARATOR_ROW_REGEX = /^\|?(\s*:?-{2,}:?\s*\|)+\s*:?-{2,}:?\s*\|?$/;

function parseMarkdownBlocks(markdown: string): BlockType[] {
  if (!markdown) return [];

  const lines = markdown.split(/\r?\n/);
  const blocks: BlockType[] = [];
  let i = 0;
  let tableCounter = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // 1. Skip empty lines
    if (!line) {
      i++;
      continue;
    }

    // 2. Code Block: ```lang ... ```
    if (line.startsWith("```")) {
      const language = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // consume closing ```
      blocks.push({
        type: "code",
        code: codeLines.join("\n"),
        language,
      });
      continue;
    }

    // 3. Page Header: "## Page 1", "# Page 2", or "### Page 1"
    const pageMatch = line.match(/^#{1,3}\s+(Page\s+\d+.*)$/i);
    if (pageMatch) {
      blocks.push({
        type: "page",
        pageNumber: pageMatch[1],
        title: line.replace(/^#{1,3}\s+/, ""),
      });
      i++;
      continue;
    }

    // 4. Headings (# H1 to ###### H6)
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        text: headingMatch[2],
      });
      i++;
      continue;
    }

    // 5. Horizontal rule: ---, ***, ___
    if (/^(?:-{3,}|\*{3,}|_{3,})$/.test(line)) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    // 6. Blockquote: > text
    if (line.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({
        type: "blockquote",
        text: quoteLines.join("\n"),
      });
      continue;
    }

    // 7. Markdown Pipe Table detection
    // Check if current line contains pipes and next line is a separator row
    if (line.includes("|") && i + 1 < lines.length && SEPARATOR_ROW_REGEX.test(lines[i + 1].trim())) {
      const headerLine = line;
      const delimiterLine = lines[i + 1].trim();
      const alignments = parseAlignments(delimiterLine);
      const headers = splitTableRow(headerLine);
      const rows: string[][] = [];
      const rawLines: string[] = [headerLine, delimiterLine];

      i += 2;
      while (i < lines.length && lines[i].trim().includes("|") && !SEPARATOR_ROW_REGEX.test(lines[i].trim())) {
        const rowLine = lines[i].trim();
        rawLines.push(rowLine);
        const cells = splitTableRow(rowLine);
        // Normalize cell length to headers count
        while (cells.length < headers.length) {
          cells.push("");
        }
        rows.push(cells);
        i++;
      }

      tableCounter++;
      blocks.push({
        type: "table",
        data: {
          headers,
          alignments,
          rows,
          rawMarkdown: rawLines.join("\n"),
        },
        tableIndex: tableCounter,
      });
      continue;
    }

    // 8. Lists (Unordered: -, *, + or Ordered: 1., 2.)
    const isUnordered = /^[-*+]\s+(.*)$/.test(line);
    const isOrdered = /^\d+\.\s+(.*)$/.test(line);
    if (isUnordered || isOrdered) {
      const ordered = isOrdered;
      const items: string[] = [];
      while (i < lines.length) {
        const itemLine = lines[i].trim();
        if (ordered) {
          const match = itemLine.match(/^\d+\.\s+(.*)$/);
          if (!match) break;
          items.push(match[1]);
        } else {
          const match = itemLine.match(/^[-*+]\s+(.*)$/);
          if (!match) break;
          items.push(match[1]);
        }
        i++;
      }
      blocks.push({
        type: "list",
        ordered,
        items,
      });
      continue;
    }

    // 9. Standard Paragraph (accumulate consecutive non-empty text lines)
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith("#") &&
      !lines[i].trim().startsWith("```") &&
      !lines[i].trim().startsWith(">") &&
      !/^(?:-{3,}|\*{3,}|_{3,})$/.test(lines[i].trim()) &&
      !(lines[i].trim().includes("|") && i + 1 < lines.length && SEPARATOR_ROW_REGEX.test(lines[i + 1].trim())) &&
      !/^[-*+]\s+/.test(lines[i].trim()) &&
      !/^\d+\.\s+/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }

    if (paraLines.length > 0) {
      blocks.push({
        type: "paragraph",
        text: paraLines.join(" "),
      });
    }
  }

  return blocks;
}

/**
 * Parses inline formatting: **bold**, *italic*, ~~strikethrough~~, `code`, [link](url)
 */
function renderInlineFormatted(text: string, searchQuery?: string): React.ReactNode {
  if (!text) return null;

  // Split tokens for markdown syntax:
  // 1: `code`
  // 2: **bold**
  // 3: *italic*
  // 4: ~~strike~~
  // 5: [link text](url)
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|~~[^~]+~~|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(regex);

  const highlightMatches = (str: string, keyPrefix: string): React.ReactNode => {
    if (!searchQuery || !searchQuery.trim()) return str;
    const q = searchQuery.trim().toLowerCase();
    if (!str.toLowerCase().includes(q)) return str;

    const subParts: React.ReactNode[] = [];
    let remaining = str;
    let idx = 0;

    while (remaining) {
      const matchPos = remaining.toLowerCase().indexOf(q);
      if (matchPos === -1) {
        subParts.push(remaining);
        break;
      }
      if (matchPos > 0) {
        subParts.push(remaining.slice(0, matchPos));
      }
      subParts.push(
        <mark
          key={`${keyPrefix}-mark-${idx}`}
          className="bg-amber-300 dark:bg-amber-500/40 text-zinc-900 dark:text-amber-100 rounded px-0.5"
        >
          {remaining.slice(matchPos, matchPos + q.length)}
        </mark>
      );
      remaining = remaining.slice(matchPos + q.length);
      idx++;
    }
    return <React.Fragment key={keyPrefix}>{subParts}</React.Fragment>;
  };

  return parts.map((part, i) => {
    if (!part) return null;

    // Inline Code
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded-md bg-zinc-200/80 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 font-mono text-xs border border-zinc-300/60 dark:border-zinc-700"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Bold
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return (
        <strong key={i} className="font-bold text-zinc-900 dark:text-zinc-100">
          {highlightMatches(part.slice(2, -2), `b-${i}`)}
        </strong>
      );
    }

    // Italic
    if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
      return (
        <em key={i} className="italic text-zinc-800 dark:text-zinc-200">
          {highlightMatches(part.slice(1, -1), `em-${i}`)}
        </em>
      );
    }

    // Strikethrough
    if (part.startsWith("~~") && part.endsWith("~~") && part.length >= 4) {
      return (
        <del key={i} className="line-through text-zinc-400 dark:text-zinc-500">
          {highlightMatches(part.slice(2, -2), `del-${i}`)}
        </del>
      );
    }

    // Link: [text](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={i}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-600 dark:text-emerald-400 underline underline-offset-2 hover:text-emerald-500 inline-flex items-center gap-0.5"
        >
          {highlightMatches(linkMatch[1], `a-${i}`)}
          <ExternalLink className="w-3 h-3 inline-block" />
        </a>
      );
    }

    return highlightMatches(part, `txt-${i}`);
  });
}

function TableRenderer({
  data,
  tableIndex,
  searchQuery,
}: {
  data: TableData;
  tableIndex: number;
  searchQuery: string;
}) {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const copyAsCsv = () => {
    const csvRows = [
      data.headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(","),
      ...data.rows.map((row) =>
        row.map((c) => `"${(c || "").replace(/"/g, '""')}"`).join(",")
      ),
    ];
    navigator.clipboard.writeText(csvRows.join("\n"));
    setCopiedFormat("csv");
    setTimeout(() => setCopiedFormat(null), 1800);
  };

  const copyAsTsv = () => {
    const tsvRows = [
      data.headers.join("\t"),
      ...data.rows.map((row) => row.join("\t")),
    ];
    navigator.clipboard.writeText(tsvRows.join("\n"));
    setCopiedFormat("tsv");
    setTimeout(() => setCopiedFormat(null), 1800);
  };

  const copyAsMarkdown = () => {
    navigator.clipboard.writeText(data.rawMarkdown);
    setCopiedFormat("md");
    setTimeout(() => setCopiedFormat(null), 1800);
  };

  const downloadCsv = () => {
    const csvRows = [
      data.headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(","),
      ...data.rows.map((row) =>
        row.map((c) => `"${(c || "").replace(/"/g, '""')}"`).join(",")
      ),
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `table-${tableIndex}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="my-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 shadow-sm overflow-hidden">
      {/* Table Toolbar */}
      <div className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-semibold">
          <TableIcon className="w-3.5 h-3.5 text-emerald-500" />
          <span>Table #{tableIndex}</span>
          <span className="text-[11px] font-normal text-zinc-500 dark:text-zinc-400">
            ({data.rows.length} rows × {data.headers.length} columns)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={copyAsCsv}
            title="Copy as CSV (for Excel / Sheets)"
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition-colors flex items-center gap-1 text-[11px] font-medium"
          >
            {copiedFormat === "csv" ? (
              <Check className="w-3 h-3 text-emerald-500" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            <span>{copiedFormat === "csv" ? "Copied CSV" : "Copy CSV"}</span>
          </button>

          <button
            type="button"
            onClick={copyAsTsv}
            title="Copy Tab-Separated (direct paste into Excel)"
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition-colors flex items-center gap-1 text-[11px] font-medium"
          >
            {copiedFormat === "tsv" ? (
              <Check className="w-3 h-3 text-emerald-500" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            <span>{copiedFormat === "tsv" ? "Copied TSV" : "Excel Paste"}</span>
          </button>

          <button
            type="button"
            onClick={downloadCsv}
            title="Download table as .CSV file"
            className="p-1 rounded-lg bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition-colors"
          >
            <Download className="w-3 h-3 text-zinc-600 dark:text-zinc-300" />
          </button>
        </div>
      </div>

      {/* Responsive Table Scroll Container */}
      <div className="overflow-x-auto max-w-full">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-zinc-100/80 dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 font-bold border-b border-zinc-200 dark:border-zinc-700">
              {data.headers.map((header, idx) => {
                const align = data.alignments[idx] || "left";
                return (
                  <th
                    key={idx}
                    className={`px-3.5 py-2.5 whitespace-nowrap text-zinc-900 dark:text-zinc-100 font-semibold ${
                      align === "center"
                        ? "text-center"
                        : align === "right"
                        ? "text-right"
                        : "text-left"
                    }`}
                  >
                    {renderInlineFormatted(header || `Col ${idx + 1}`, searchQuery)}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-800">
            {data.rows.map((row, rIdx) => (
              <tr
                key={rIdx}
                className={`transition-colors hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 ${
                  rIdx % 2 === 0
                    ? "bg-white dark:bg-zinc-900/40"
                    : "bg-zinc-50/70 dark:bg-zinc-900/80"
                }`}
              >
                {row.map((cell, cIdx) => {
                  const align = data.alignments[cIdx] || "left";
                  return (
                    <td
                      key={cIdx}
                      className={`px-3.5 py-2.5 text-zinc-700 dark:text-zinc-300 text-xs ${
                        align === "center"
                          ? "text-center"
                          : align === "right"
                          ? "text-right"
                          : "text-left"
                      }`}
                    >
                      {cell ? (
                        renderInlineFormatted(cell, searchQuery)
                      ) : (
                        <span className="text-zinc-300 dark:text-zinc-700 italic font-mono text-[11px]">
                          —
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function MarkdownDocumentPreview({
  markdown,
  pageCount,
  tableCount,
}: MarkdownDocumentPreviewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [textSize, setTextSize] = useState<"sm" | "base" | "lg">("base");

  const blocks = useMemo(() => parseMarkdownBlocks(markdown), [markdown]);

  const stats = useMemo(() => {
    let pagesFound = 0;
    let tablesFound = 0;
    blocks.forEach((b) => {
      if (b.type === "page") pagesFound++;
      if (b.type === "table") tablesFound++;
    });
    return {
      pages: pagesFound || pageCount || 1,
      tables: tablesFound || tableCount || 0,
    };
  }, [blocks, pageCount, tableCount]);

  const textSizeClass =
    textSize === "sm" ? "text-xs" : textSize === "lg" ? "text-base" : "text-sm";

  return (
    <div className="space-y-4">
      {/* Sub-header toolbar for Search & Document Navigation */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search extracted document text & tables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs px-1"
            >
              ×
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => setTextSize("sm")}
              className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                textSize === "sm"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm"
                  : "text-zinc-500"
              }`}
            >
              Small
            </button>
            <button
              type="button"
              onClick={() => setTextSize("base")}
              className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                textSize === "base"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm"
                  : "text-zinc-500"
              }`}
            >
              Standard
            </button>
            <button
              type="button"
              onClick={() => setTextSize("lg")}
              className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                textSize === "lg"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm"
                  : "text-zinc-500"
              }`}
            >
              Large
            </button>
          </div>
        </div>
      </div>

      {/* Rendered Document Container */}
      <div
        className={`leading-relaxed space-y-3.5 text-zinc-800 dark:text-zinc-200 ${textSizeClass}`}
      >
        {blocks.map((block, idx) => {
          switch (block.type) {
            case "page":
              return (
                <div
                  key={idx}
                  className="pt-6 pb-2 my-4 first:pt-0 first:my-0 flex items-center gap-3 border-b-2 border-dashed border-zinc-200 dark:border-zinc-800"
                >
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold text-xs border border-emerald-300 dark:border-emerald-800 shadow-sm">
                    <FileText className="w-3.5 h-3.5" />
                    {block.pageNumber}
                  </span>
                  <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
                </div>
              );

            case "heading": {
              if (block.level === 1) {
                return (
                  <h1
                    key={idx}
                    className="text-xl sm:text-2xl font-extrabold text-zinc-950 dark:text-zinc-50 pt-3 pb-1 border-b border-zinc-200 dark:border-zinc-800"
                  >
                    {renderInlineFormatted(block.text, searchQuery)}
                  </h1>
                );
              }
              if (block.level === 2) {
                return (
                  <h2
                    key={idx}
                    className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 pt-3 pb-1"
                  >
                    {renderInlineFormatted(block.text, searchQuery)}
                  </h2>
                );
              }
              if (block.level === 3) {
                return (
                  <h3
                    key={idx}
                    className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 pt-2"
                  >
                    {renderInlineFormatted(block.text, searchQuery)}
                  </h3>
                );
              }
              return (
                <h4
                  key={idx}
                  className="text-sm sm:text-base font-semibold text-zinc-800 dark:text-zinc-200 pt-1"
                >
                  {renderInlineFormatted(block.text, searchQuery)}
                </h4>
              );
            }

            case "table":
              return (
                <TableRenderer
                  key={idx}
                  data={block.data}
                  tableIndex={block.tableIndex}
                  searchQuery={searchQuery}
                />
              );

            case "code":
              return (
                <div
                  key={idx}
                  className="my-3 rounded-xl bg-zinc-950 border border-zinc-800 p-4 font-mono text-xs text-zinc-200 overflow-x-auto"
                >
                  {block.language && (
                    <div className="text-[10px] uppercase font-bold text-zinc-500 mb-2">
                      {block.language}
                    </div>
                  )}
                  <pre className="whitespace-pre">{block.code}</pre>
                </div>
              );

            case "blockquote":
              return (
                <blockquote
                  key={idx}
                  className="my-3 pl-4 border-l-4 border-emerald-500 italic text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/30 py-2 rounded-r-xl"
                >
                  {renderInlineFormatted(block.text, searchQuery)}
                </blockquote>
              );

            case "list":
              if (block.ordered) {
                return (
                  <ol
                    key={idx}
                    className="my-2.5 list-decimal pl-6 space-y-1 text-zinc-700 dark:text-zinc-300"
                  >
                    {block.items.map((item, itemIdx) => (
                      <li key={itemIdx}>
                        {renderInlineFormatted(item, searchQuery)}
                      </li>
                    ))}
                  </ol>
                );
              }
              return (
                <ul
                  key={idx}
                  className="my-2.5 list-disc pl-6 space-y-1 text-zinc-700 dark:text-zinc-300"
                >
                  {block.items.map((item, itemIdx) => (
                    <li key={itemIdx}>
                      {renderInlineFormatted(item, searchQuery)}
                    </li>
                  ))}
                </ul>
              );

            case "hr":
              return (
                <hr
                  key={idx}
                  className="my-6 border-t border-zinc-200 dark:border-zinc-800"
                />
              );

            case "paragraph":
              return (
                <p key={idx} className="leading-relaxed">
                  {renderInlineFormatted(block.text, searchQuery)}
                </p>
              );

            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}
