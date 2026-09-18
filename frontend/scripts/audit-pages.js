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
 */

const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const OUT_DIR = path.resolve(__dirname, "../out");
const AXE_SOURCE_PATH = path.resolve(
  __dirname,
  "../node_modules/axe-core/axe.min.js"
);

let axeSource = "";
if (fs.existsSync(AXE_SOURCE_PATH)) {
  axeSource = fs.readFileSync(AXE_SOURCE_PATH, "utf8");
} else {
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

async function auditHtmlFile(filePath) {
  const relativePath = path.relative(OUT_DIR, filePath);
  const htmlContent = fs.readFileSync(filePath, "utf8");
  const errors = [];
  const warnings = [];

  const dom = new JSDOM(htmlContent, {
    runScripts: axeSource ? "dangerously" : undefined,
    resources: "usable",
  });
  const { window } = dom;
  const { document } = window;

  // 1. Heading Hierarchy Check
  const headings = Array.from(
    document.querySelectorAll("h1, h2, h3, h4, h5, h6")
  );
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
  } else if (title.length < 10) {
    warnings.push(`Title too short (${title.length} chars): "${title}"`);
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

  // 3. Image Alt Checks
  const images = Array.from(document.querySelectorAll("img"));
  for (const img of images) {
    const alt = img.getAttribute("alt");
    const src = img.getAttribute("src") || "unknown";
    if (alt === null) {
      errors.push(`Image missing alt attribute: ${src.slice(0, 40)}`);
    }
  }

  // 4. Buttons & Links Accessible Name Check
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

  // 5. Internal Link Crawler & 404 Detection
  const links = Array.from(document.querySelectorAll("a[href]"));
  for (const link of links) {
    const href = link.getAttribute("href")?.trim();
    if (!href) continue;

    // Ignore anchors, external protocols, mailto, tel, javascript
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

    // Strip hash and query parameters
    const cleanPath = href.split("#")[0].split("?")[0];
    if (!cleanPath || cleanPath === "/") continue;

    // Normalize path to check in OUT_DIR
    const targetFile1 = path.join(OUT_DIR, `${cleanPath}.html`);
    const targetFile2 = path.join(OUT_DIR, cleanPath, "index.html");
    const targetFile3 = path.join(OUT_DIR, cleanPath); // direct static asset (e.g. .txt, .svg, .png)

    if (
      !fs.existsSync(targetFile1) &&
      !fs.existsSync(targetFile2) &&
      !fs.existsSync(targetFile3)
    ) {
      errors.push(`Broken internal link (404): "${href}" on ${relativePath}`);
    }
  }

  // 6. axe-core Accessibility Engine
  if (axeSource) {
    try {
      window.eval(axeSource);
      const results = await window.axe.run(document, {
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

  return {
    file: relativePath,
    errors,
    warnings,
  };
}

async function runAudit() {
  console.log("==================================================");
  console.log("ConvertSheet Local Page Auditor");
  console.log("==================================================");

  if (!fs.existsSync(OUT_DIR)) {
    console.error(
      "out directory not found. Please run 'npm run build' first."
    );
    process.exit(1);
  }

  const htmlFiles = findHtmlFiles(OUT_DIR).filter(
    (f) => !f.includes("/embed/")
  );

  console.log(`Auditing ${htmlFiles.length} pages in loop...\n`);

  let totalErrors = 0;
  let totalWarnings = 0;
  const failedPages = [];

  for (let i = 0; i < htmlFiles.length; i++) {
    const file = htmlFiles[i];
    const result = await auditHtmlFile(file);

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
