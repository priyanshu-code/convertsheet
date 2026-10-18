/**
 * ConvertSheet Reciprocal Directory Backlink Auditor
 * 
 * Usage: node scripts/audit-backlinks.js
 * 
 * Verifies that directories where ConvertSheet is submitted/featured
 * have a live, indexable, dofollow/nofollow backlink pointing to https://www.convertsheet.com
 */

const https = require("https");
const http = require("http");

const DIRECTORY_AUDIT_TARGETS = [
  {
    name: "Peerlist",
    dr: 77,
    checkUrl: "https://peerlist.io/genshing2024/project/convertsheet",
    expectedLinkTarget: "convertsheet.com",
    status: "Active / Published",
    badgeRequired: false,
  },
  {
    name: "DevHunt",
    dr: 65,
    checkUrl: "https://devhunt.org/tool/convertsheet",
    expectedLinkTarget: "convertsheet.com",
    status: "Active / Published",
    badgeRequired: false,
  },
  {
    name: "SaaSHub",
    dr: 80,
    checkUrl: "https://www.saashub.com/convertsheet",
    expectedLinkTarget: "convertsheet.com",
    status: "Active / Pending Crawl",
    badgeRequired: false,
  },
  {
    name: "BuildVoyage",
    dr: 42,
    checkUrl: "https://buildvoyage.com/products/convertsheet",
    expectedLinkTarget: "convertsheet.com",
    status: "Active / Approved",
    badgeRequired: true,
  },
  {
    name: "Super Launch",
    dr: 62,
    checkUrl: "https://www.superlaun.ch/products/3909",
    expectedLinkTarget: "convertsheet.com",
    status: "Active / In Review Queue",
    badgeRequired: true,
  },
  {
    name: "PeerPush",
    dr: 73,
    checkUrl: "https://peerpush.com/p/convertsheet",
    expectedLinkTarget: "convertsheet.com",
    status: "Active / Verified Badge Live",
    badgeRequired: true,
  },
  {
    name: "Huzzler",
    dr: 63,
    checkUrl: "https://huzzler.so/products/caEQ4i0Ll7/convertsheet",
    expectedLinkTarget: "convertsheet.com",
    status: "Queued (Live Dec 29, 2026)",
    badgeRequired: true,
  },
  {
    name: "We Like Tools",
    dr: 52,
    checkUrl: "https://weliketools.com/tool/convertsheet",
    expectedLinkTarget: "convertsheet.com",
    status: "Submission Received / Under Review",
    badgeRequired: true,
  },
  {
    name: "Findly.tools",
    dr: 81,
    checkUrl: "https://findly.tools/tools/convertsheet",
    expectedLinkTarget: "convertsheet.com",
    status: "Verified / In Review",
    badgeRequired: true,
  },
  {
    name: "AlternativeTo",
    dr: 80,
    checkUrl: "https://alternativeto.net/software/convertsheet/",
    expectedLinkTarget: "convertsheet.com",
    status: "In Review Queue",
    badgeRequired: false,
  },
  {
    name: "TinyLaunch",
    dr: 73,
    checkUrl: "https://www.tinylaunch.com",
    expectedLinkTarget: "convertsheet.com",
    status: "Scheduled Nov 16, 2026",
    badgeRequired: false,
  },
];

function fetchPage(url) {
  return new Promise((resolve) => {
    const client = url.startsWith("https") ? https : http;
    const req = client.get(
      url,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 ConvertSheetAuditor/1.0",
          Accept: "text/html,application/xhtml+xml",
        },
        timeout: 10000,
      },
      (res) => {
        // Follow redirect if 301/302
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return fetchPage(res.headers.location).then(resolve);
        }
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve({ statusCode: res.statusCode, body: data }));
      }
    );
    req.on("error", (err) => resolve({ statusCode: 0, error: err.message, body: "" }));
    req.on("timeout", () => {
      req.destroy();
      resolve({ statusCode: 0, error: "timeout", body: "" });
    });
  });
}

async function auditBacklinks() {
  console.log("===============================================================================");
  console.log(" 🔍 ConvertSheet Directory Backlink & Indexing Audit Pulse");
  console.log(` ⏰ Timestamp: ${new Date().toISOString()}`);
  console.log("===============================================================================\n");

  const results = [];

  for (const target of DIRECTORY_AUDIT_TARGETS) {
    process.stdout.write(`Auditing [DR ${target.dr}] ${target.name.padEnd(16)}... `);
    const { statusCode, body, error } = await fetchPage(target.checkUrl);

    let hasLink = false;
    let isDofollow = false;

    if (body) {
      hasLink = body.includes(target.expectedLinkTarget);
      if (hasLink) {
        // Simple check if rel contains nofollow
        const linkMatch = body.match(new RegExp(`<a[^>]*href=["\'][^"\']*${target.expectedLinkTarget}[^"\']*["\'][^>]*>`, "i"));
        if (linkMatch && !linkMatch[0].includes("nofollow")) {
          isDofollow = true;
        }
      }
    }

    const report = {
      name: target.name,
      dr: target.dr,
      status: target.status,
      httpStatus: statusCode || (error ? `ERR: ${error}` : 0),
      hasLink,
      rel: hasLink ? (isDofollow ? "dofollow" : "nofollow") : "N/A",
      badgeRequired: target.badgeRequired,
      url: target.checkUrl,
    };
    results.push(report);

    if (hasLink) {
      console.log(`✅ FOUND (${report.rel.toUpperCase()})`);
    } else if (statusCode === 200) {
      console.log(`⏳ Page 200 OK (Link pending approval/queue)`);
    } else if (statusCode === 404) {
      console.log(`📋 404 Pending (Live on scheduled date)`);
    } else {
      console.log(`⚠️ HTTP ${statusCode}`);
    }
  }

  console.log("\n-------------------------------------------------------------------------------");
  console.log(" SUMMARY TABLE");
  console.log("-------------------------------------------------------------------------------");
  console.table(
    results.map((r) => ({
      Directory: r.name,
      DR: r.dr,
      "Reciprocal Badge": r.badgeRequired ? "YES (Live)" : "NO",
      Status: r.status,
      "Backlink Found": r.hasLink ? `YES (${r.rel})` : "Pending Approval",
      "HTTP Status": r.httpStatus,
    }))
  );

  return results;
}

if (require.main === module) {
  auditBacklinks();
}

module.exports = { auditBacklinks, DIRECTORY_AUDIT_TARGETS };
