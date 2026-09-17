#!/usr/bin/env node

/**
 * High-Realism Nested JSON Generator for ConvertSheet Demos & Benchmarks.
 * 
 * Usage:
 *   node scripts/generate-demo-json.mjs [rowCount] [outputPath]
 * 
 * Examples:
 *   node scripts/generate-demo-json.mjs 20000 demo-20k.json
 *   node scripts/generate-demo-json.mjs 50000 enterprise-orders.json
 */

import fs from 'fs';
import path from 'path';

const rowCount = parseInt(process.argv[2] || '20000', 10);
const outputPath = process.argv[3] || `demo-${rowCount}-orders.json`;

console.log(`Generating ${rowCount.toLocaleString()} realistic nested ecommerce & financial records...`);
const startTime = Date.now();

const FIRST_NAMES = ["Liam", "Olivia", "Noah", "Emma", "Oliver", "Charlotte", "Elijah", "Amelia", "James", "Sophia", "William", "Isabella", "Benjamin", "Mia", "Lucas", "Evelyn", "Henry", "Harper", "Alexander", "Camila"];
const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];
const DOMAINS = ["corp.acme.io", "techventures.com", "fintech-cloud.net", "enterprise.org", "cyber-solutions.co", "global-retail.com"];
const CITIES = [
  { city: "New York", state: "NY", country: "US", postalCode: "10001", taxRate: 0.08875 },
  { city: "San Francisco", state: "CA", country: "US", postalCode: "94105", taxRate: 0.08625 },
  { city: "Austin", state: "TX", country: "US", postalCode: "78701", taxRate: 0.0825 },
  { city: "Toronto", state: "ON", country: "CA", postalCode: "M5V 2T6", taxRate: 0.13 },
  { city: "London", state: "ENG", country: "GB", postalCode: "EC2A 4NE", taxRate: 0.20 },
  { city: "Berlin", state: "BE", country: "DE", postalCode: "10115", taxRate: 0.19 },
  { city: "Sydney", state: "NSW", country: "AU", postalCode: "2000", taxRate: 0.10 },
];
const PAYMENT_METHODS = ["stripe_checkout", "apple_pay", "google_pay", "wire_transfer", "corporate_invoice_net30"];
const STATUSES = ["completed", "completed", "completed", "processing", "refunded"];
const PRODUCTS = [
  { sku: "SaaS-ENT-YR", name: "Enterprise Platform License (Annual)", unitPrice: 2400.00, category: "Software" },
  { sku: "API-METER-500K", name: "API Usage Credit - Tier 2 (500k Calls)", unitPrice: 450.00, category: "Usage" },
  { sku: "DED-SLACK-SUP", name: "24/7 Dedicated Slack Engineering SLA", unitPrice: 1200.00, category: "Support" },
  { sku: "SOC2-AUDIT-EXP", name: "Automated Compliance & Security Dossier", unitPrice: 850.00, category: "Compliance" },
  { sku: "WASM-SIMD-NODE", name: "Edge WebAssembly Acceleration Worker", unitPrice: 350.00, category: "Infrastructure" },
];

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const writeStream = fs.createWriteStream(outputPath, { encoding: 'utf8' });
writeStream.write('[\n');

const baseDate = new Date("2026-01-01T00:00:00Z").getTime();
const msInYear = 260 * 24 * 60 * 60 * 1000;

for (let i = 0; i < rowCount; i++) {
  const firstName = randomChoice(FIRST_NAMES);
  const lastName = randomChoice(LAST_NAMES);
  const domain = randomChoice(DOMAINS);
  const location = randomChoice(CITIES);
  const orderDate = new Date(baseDate + Math.random() * msInYear).toISOString();
  const status = randomChoice(STATUSES);
  const paymentMethod = randomChoice(PAYMENT_METHODS);

  // Generate 1 to 3 items per order
  const itemCount = randomInt(1, 3);
  const lineItems = [];
  let subtotal = 0;

  for (let j = 0; j < itemCount; j++) {
    const product = randomChoice(PRODUCTS);
    const quantity = randomInt(1, 4);
    const itemTotal = +(product.unitPrice * quantity).toFixed(2);
    subtotal += itemTotal;

    lineItems.push({
      item_id: `LI-${100000 + i}-${j + 1}`,
      sku: product.sku,
      product_name: product.name,
      category: product.category,
      unit_price: product.unitPrice,
      quantity,
      line_total: itemTotal,
    });
  }

  subtotal = +subtotal.toFixed(2);
  const taxAmount = +(subtotal * location.taxRate).toFixed(2);
  const discountAmount = Math.random() > 0.7 ? +(subtotal * 0.10).toFixed(2) : 0;
  const grandTotal = +(subtotal + taxAmount - discountAmount).toFixed(2);

  const record = {
    order_id: `ORD-2026-${(100000 + i).toString()}`,
    timestamp: orderDate,
    status,
    financials: {
      currency: location.country === "US" ? "USD" : location.country === "CA" ? "CAD" : location.country === "GB" ? "GBP" : location.country === "DE" ? "EUR" : "AUD",
      subtotal,
      tax_amount: taxAmount,
      tax_rate_percent: +(location.taxRate * 100).toFixed(2),
      discount_applied: discountAmount,
      grand_total: grandTotal,
      payment: {
        method: paymentMethod,
        transaction_id: `txn_live_${Math.random().toString(36).substring(2, 14)}`,
        settlement_status: status === "refunded" ? "settled_refund" : "settled",
        processor_fee: +(grandTotal * 0.029 + 0.30).toFixed(2),
        net_settled_amount: +(grandTotal - (grandTotal * 0.029 + 0.30)).toFixed(2),
      },
    },
    customer: {
      id: `CUST-${(50000 + (i % 8000)).toString()}`,
      full_name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
      account_tier: (i % 5 === 0) ? "Enterprise Plus" : (i % 3 === 0) ? "Scale" : "Growth",
      organization: {
        company_name: `${lastName} ${randomChoice(["Technologies", "Capital", "Logistics", "Digital", "Industries"])}`,
        industry: randomChoice(["Finance", "Healthcare", "SaaS", "E-commerce", "BioTech"]),
        employee_count: randomChoice([25, 120, 450, 1800, 5000]),
      },
      billing_address: {
        street: `${randomInt(100, 9999)} ${randomChoice(["Market St", "Broadway", "Tech Blvd", "King St", "Financial Way"])}`,
        city: location.city,
        state_province: location.state,
        postal_code: location.postalCode,
        country: location.country,
      },
    },
    audit_metadata: {
      client_ip_hash: `sha256_${Math.random().toString(36).substring(2, 10)}`,
      session_duration_sec: randomInt(45, 1200),
      client_env: {
        os: randomChoice(["macOS 15.1", "Windows 11 Pro", "Ubuntu Linux 24.04", "iOS 18"]),
        browser: randomChoice(["Chrome 130", "Safari 18", "Firefox Developer Edition", "Edge"]),
      },
      tags: ["q1-enterprise-audit", "gdpr-compliant-export", "client-side-only"],
    },
    items: lineItems,
  };

  const jsonStr = JSON.stringify(record, null, 2);
  // Indent each line by 2 spaces
  const indentedStr = jsonStr.split('\n').map(line => '  ' + line).join('\n');
  
  writeStream.write(indentedStr);
  if (i < rowCount - 1) {
    writeStream.write(',\n');
  } else {
    writeStream.write('\n');
  }
}

writeStream.write(']\n');
writeStream.end();

writeStream.on('finish', () => {
  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
  const stats = fs.statSync(outputPath);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`\nSuccess!`);
  console.log(`- File created: ${path.resolve(outputPath)}`);
  console.log(`- Total Records: ${rowCount.toLocaleString()}`);
  console.log(`- File Size: ${sizeMB} MB`);
  console.log(`- Generation Time: ${durationSec}s`);
  console.log(`\nTo test:`);
  console.log(`1. Open http://localhost:3000/convert/json-to-excel in Chrome/Safari.`);
  console.log(`2. Open Dev Tools -> Network Tab -> Filter by Fetch/XHR.`);
  console.log(`3. Drag and drop "${outputPath}".`);
  console.log(`4. Notice: 0 bytes sent over network, and instant XLSX download!`);
});
