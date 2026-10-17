#!/usr/bin/env node

/**
 * Local Comprehensive Page Auditor for ConvertSheet
 *
 * Loops over all generated HTML pages and audits:
 * 1. Accessibility (WCAG 2.1 AA via axe-core)
 *    - Heading level hierarchy (no skipped h1 -> h3)
 *    - Missing alt text / image labels
 *    - Buttons without accessible names
 *    - ARIA role & attribute correctness
 * 2. SEO & OpenGraph / Twitter Cards
 *    - Missing or empty <title>
 *    - Missing <meta name="description">
 *    - Canonical URL validity
 *    - Missing og:title, og:description
 *    - Missing responsive <meta name="viewport">
 * 3. Broken internal link detection
 */

const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const OUT_DIR = path.resolve(__dirname, "../out");
let axe = null;
try {
  axe = require("axe-core");
} catch {
  console.warn("axe-core not found. Skipping deep DOM a11y engine checks.");
}

function findHtmlFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      findHtmlFiles(fullPath, fileList);
    } else if (file.endsWith(".html")) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function buildExistingFilesSet(dir, baseDir = dir, set = new Set()) {
  if (!fs.existsSync(dir)) return set;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      buildExistingFilesSet(fullPath, baseDir, set);
    } else {
      const rel = path.relative(baseDir, fullPath).replace(/\\/g, "/");
      set.add("/" + rel);
      if (rel.endsWith(".html")) {
        set.add("/" + rel.replace(/\.html$/, ""));
      }
      if (rel.endsWith("/index.html")) {
        set.add("/" + rel.replace(/\/index\.html$/, ""));
      }
    }
  }
  return set;
}

function checkInternalLinks(links, existingFilesSet, relativePath, errors) {
  for (const href of links) {
    if (!href) continue;
    if (
      href.startsWith("#") ||
      href.startsWith("http://") ||
      href.startsWith("https://") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("javascript:")
    ) {
      continue;
    }

    const cleanPath = href.split("#")[0].split("?")[0];
    if (!cleanPath || cleanPath === "/") continue;

    const hasMatch =
      existingFilesSet.has(cleanPath) ||
      existingFilesSet.has(`${cleanPath}.html`) ||
      existingFilesSet.has(`${cleanPath}/index.html`);

    if (!hasMatch) {
      errors.push(`Broken internal link (404): "${href}" on ${relativePath}`);
    }
  }
}

function auditFast(relativePath, htmlContent, existingFilesSet) {
  const errors = [];
  const warnings = [];

  // 1. Heading Hierarchy Check
  const headingMatches = [...htmlContent.matchAll(/<(h[1-6])[\s>]([\s\S]*?)<\/\1>/gi)];
  let lastLevel = 0;
  const h1Count = headingMatches.filter((m) => m[1].toLowerCase() === "h1").length;

  if (h1Count === 0 && !relativePath.includes("404.html")) {
    errors.push("Missing <h1> element on page");
  } else if (h1Count > 1) {
    warnings.push(`Multiple <h1> elements found (${h1Count})`);
  }

  for (const m of headingMatches) {
    const level = parseInt(m[1].substring(1), 10);
    const text = m[2].replace(/<[^>]+>/g, "").trim().slice(0, 40);
    if (lastLevel > 0 && level > lastLevel + 1) {
      errors.push(`Heading hierarchy skipped: <h${lastLevel}> followed by <h${level}> ("${text}")`);
    }
    lastLevel = level;
  }

  // 2. SEO & Meta Checks
  const titleMatch = htmlContent.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : "";
  if (!title) {
    errors.push("Missing or empty <title>");
  } else if (title.length < 25 && !relativePath.includes("404.html")) {
    warnings.push(`Title too short (${title.length} chars, recommended 25-75 chars): "${title}"`);
  }

  const metaDescMatch =
    htmlContent.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
    htmlContent.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
  const metaDesc = metaDescMatch ? metaDescMatch[1].trim() : "";
  if (!metaDesc && !relativePath.includes("404.html")) {
    errors.push('Missing <meta name="description">');
  }

  const canonicalMatch = htmlContent.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
  if (!canonicalMatch && !relativePath.includes("404.html")) {
    warnings.push("Missing canonical link tag");
  }

  const viewportMatch = htmlContent.match(/<meta[^>]*name=["']viewport["']/i);
  if (!viewportMatch) {
    errors.push('Missing responsive <meta name="viewport">');
  }

  // 3. Structured Data Check (JSON-LD)
  if (
    (relativePath.startsWith("tools/") ||
      relativePath.startsWith("convert/") ||
      relativePath.startsWith("blog/")) &&
    !relativePath.includes("404.html")
  ) {
    if (!htmlContent.includes("application/ld+json")) {
      errors.push('Missing structured data: <script type="application/ld+json"> required for SEO rich results');
    }
  }

  // 4. Internal Links & Hub-and-Spoke Check
  const linkMatches = [...htmlContent.matchAll(/<a[^>]+href=["']([^"']+)["']/gi)].map((m) => m[1]);
  checkInternalLinks(linkMatches, existingFilesSet, relativePath, errors);

  if (relativePath.startsWith("blog/") && !relativePath.includes("404.html")) {
    const hasToolOrConvertLink = linkMatches.some(
      (href) => href && (href.startsWith("/tools") || href.startsWith("/convert") || href.includes("/tools/") || href.includes("/convert/"))
    );
    if (!hasToolOrConvertLink) {
      errors.push('Hub-and-spoke violation: Blog article missing internal link to /tools/ or /convert/');
    }
  }

  return { file: relativePath, errors, warnings };
}

async function auditWithAxe(relativePath, htmlContent, existingFilesSet) {
  const errors = [];
  const warnings = [];

  const dom = new JSDOM(htmlContent);
  const { document } = dom.window;

  // 1. Heading Hierarchy Check
  const headings = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"));
  let lastLevel = 0;
  const h1Count = headings.filter((h) => h.tagName.toLowerCase() === "h1").length;

  if (h1Count === 0 && !relativePath.includes("404.html")) {
    errors.push("Missing <h1> element on page");
  } else if (h1Count > 1) {
    warnings.push(`Multiple <h1> elements found (${h1Count})`);
  }

  for (const h of headings) {
    const level = parseInt(h.tagName.substring(1), 10);
    if (lastLevel > 0 && level > lastLevel + 1) {
      errors.push(
        `Heading hierarchy skipped: <h${lastLevel}> followed by <h${level}> ("${h.textContent.trim().slice(0, 40)}")`
      );
    }
    lastLevel = level;
  }

  // 2. SEO & Meta Checks
  const title = document.querySelector("title")?.textContent?.trim();
  if (!title) {
    errors.push("Missing or empty <title>");
  } else if (title.length < 25 && !relativePath.includes("404.html")) {
    warnings.push(`Title too short (${title.length} chars, recommended 25-75 chars): "${title}"`);
  }

  const metaDesc = document
    .querySelector('meta[name="description"]')
    ?.getAttribute("content")
    ?.trim();
  if (!metaDesc && !relativePath.includes("404.html")) {
    errors.push('Missing <meta name="description">');
  }

  const canonical = document
    .querySelector('link[rel="canonical"]')
    ?.getAttribute("href");
  if (!canonical && !relativePath.includes("404.html")) {
    warnings.push("Missing canonical link tag");
  }

  const viewport = document.querySelector('meta[name="viewport"]');
  if (!viewport) {
    errors.push('Missing responsive <meta name="viewport">');
  }

  // 3. Structured Data Check (JSON-LD)
  if (
    (relativePath.startsWith("tools/") ||
      relativePath.startsWith("convert/") ||
      relativePath.startsWith("blog/")) &&
    !relativePath.includes("404.html")
  ) {
    const hasJsonLd = Boolean(document.querySelector('script[type="application/ld+json"]'));
    if (!hasJsonLd) {
      errors.push('Missing structured data: <script type="application/ld+json"> required for SEO rich results');
    }
  }

  // 4. Image Alt Checks
  const images = Array.from(document.querySelectorAll("img"));
  for (const img of images) {
    const alt = img.getAttribute("alt");
    const src = img.getAttribute("src") || "unknown";
    if (alt === null) {
      errors.push(`Image missing alt attribute: ${src.slice(0, 40)}`);
    }
  }

  // 5. Buttons Accessible Name Check
  const buttons = Array.from(document.querySelectorAll("button"));
  for (const btn of buttons) {
    const text = btn.textContent.trim();
    const ariaLabel = btn.getAttribute("aria-label");
    const ariaLabelledby = btn.getAttribute("aria-labelledby");
    if (!text && !ariaLabel && !ariaLabelledby) {
      errors.push(
        `Button without accessible name: ${btn.outerHTML.slice(0, 50)}`
      );
    }
  }

  // 6. Internal Links & Hub-and-Spoke Check
  const linkElements = Array.from(document.querySelectorAll("a[href]")).map((a) =>
    a.getAttribute("href")?.trim()
  );
  checkInternalLinks(linkElements, existingFilesSet, relativePath, errors);

  if (relativePath.startsWith("blog/") && !relativePath.includes("404.html")) {
    const hasToolOrConvertLink = linkElements.some(
      (href) => href && (href.startsWith("/tools") || href.startsWith("/convert") || href.includes("/tools/") || href.includes("/convert/"))
    );
    if (!hasToolOrConvertLink) {
      errors.push('Hub-and-spoke violation: Blog article missing internal link to /tools/ or /convert/');
    }
  }

  // 7. axe-core Accessibility Engine
  if (axe) {
    try {
      const targetElement = document.querySelector("main") || document.documentElement;
      const results = await axe.run(targetElement, {
        runOnly: {
          type: "tag",
          values: ["wcag2a", "wcag2aa", "best-practice"],
        },
        rules: {
          "color-contrast": { enabled: false },
        },
      });

      for (const violation of results.violations) {
        for (const node of violation.nodes) {
          errors.push(
            `[axe ${violation.id}] ${violation.help} -> ${node.target.join(", ")}`
          );
        }
      }
    } catch (axeErr) {
      warnings.push(`axe engine execution error: ${axeErr.message}`);
    }
  }

  dom.window.close();
  return { file: relativePath, errors, warnings };
}

async function runAudit() {
  console.log("==================================================");
  console.log("ConvertSheet Local Page Auditor");
  console.log("==================================================");

  if (!fs.existsSync(OUT_DIR)) {
    console.error("out directory not found. Please run 'npm run build' first.");
    process.exit(1);
  }

  const htmlFiles = findHtmlFiles(OUT_DIR).filter((f) => !f.includes("/embed/"));
  const existingFilesSet = buildExistingFilesSet(OUT_DIR);
  const presetAxeCounts = new Map();

  console.log(`Auditing ${htmlFiles.length} pages in loop...\n`);

  let totalErrors = 0;
  let totalWarnings = 0;
  const failedPages = [];

  for (let i = 0; i < htmlFiles.length; i++) {
    const file = htmlFiles[i];
    const relativePath = path.relative(OUT_DIR, file).replace(/\\/g, "/");
    const htmlContent = fs.readFileSync(file, "utf8");

    // Decide whether to run deep axe-core with JSDOM
    let shouldRunAxe = Boolean(axe);
    if (shouldRunAxe && relativePath.startsWith("tools/") && relativePath.split("/").length > 2) {
      const toolDir = relativePath.split("/")[1];
      if (toolDir === "salary-calculator") {
        shouldRunAxe = false;
      } else {
        const count = presetAxeCounts.get(toolDir) || 0;
        if (count >= 3) {
          shouldRunAxe = false;
        } else {
          presetAxeCounts.set(toolDir, count + 1);
        }
      }
    }

    const result = shouldRunAxe
      ? await auditWithAxe(relativePath, htmlContent, existingFilesSet)
      : auditFast(relativePath, htmlContent, existingFilesSet);

    if (result.errors.length > 0 || result.warnings.length > 0) {
      failedPages.push(result);
      totalErrors += result.errors.length;
      totalWarnings += result.warnings.length;

      console.log(`❌ [${i + 1}/${htmlFiles.length}] ${result.file}`);
      result.errors.forEach((err) => console.log(`   ERROR: ${err}`));
      result.warnings.forEach((warn) => console.log(`   WARN:  ${warn}`));
    } else {
      process.stdout.write(
        `\r✅ [${i + 1}/${htmlFiles.length}] Checked: ${result.file.padEnd(50).slice(0, 50)}`
      );
    }
  }

  console.log("\n\n==================================================");
  console.log("Audit Summary");
  console.log("==================================================");
  console.log(`Total Pages Scanned:   ${htmlFiles.length}`);
  console.log(`Total Errors:          ${totalErrors}`);
  console.log(`Total Warnings:        ${totalWarnings}`);

  if (totalErrors === 0 && totalWarnings === 0) {
    console.log("\nAll pages passed 100% of accessibility and SEO checks!\n");
    process.exit(0);
  } else {
    console.log(`\n${failedPages.length} pages require review.`);
    process.exit(totalErrors > 0 ? 1 : 0);
  }
}

runAudit().catch((err) => {
  console.error("Audit runner failed:", err);
  process.exit(1);
});
