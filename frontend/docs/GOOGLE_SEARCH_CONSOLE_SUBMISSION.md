# Google Search Console & Bing Webmaster Verification Guide

This guide details how to verify and submit **ConvertSheet** to Google Search Console and Bing Webmaster Tools to index all 401+ pre-rendered pages.

---

## 1. Domain & DNS Verification (Recommended)

To get full coverage across all protocols (`https://convertsheet.com`, `http://`, and subdomains), use DNS TXT verification:

1. Go to [Google Search Console](https://search.google.com/search-console).
2. Choose **Domain** property type: `convertsheet.com`.
3. Copy the `google-site-verification=...` TXT record.
4. Add the TXT record to your DNS provider (e.g. Cloudflare, Namecheap, Vercel).
5. Click **Verify**.

### Alternative: HTML Meta Tag Method
If DNS takes time to propagate, you can paste the meta tag directly into `src/app/layout.tsx`:
```html
<meta name="google-site-verification" content="YOUR_VERIFICATION_TOKEN" />
```

---

## 2. Submitting the XML Sitemap

ConvertSheet dynamically generates and maintains a comprehensive, valid XML sitemap at:
```
https://convertsheet.com/sitemap.xml
```

### In Google Search Console:
1. Navigate to **Index** -> **Sitemaps** in the left sidebar.
2. Under "Add a new sitemap", enter: `sitemap.xml`
3. Click **Submit**.
4. Status will change to **Success** and show the indexed URL count (~401 URLs).

### In Bing Webmaster Tools:
1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters).
2. Click **Import from Google Search Console** (1-click sync) OR manually add `https://convertsheet.com/sitemap.xml`.

---

## 3. Immediate URL Inspection (Priority Pages)

To request indexing for our highest-intent landing pages immediately without waiting for standard crawl cycles:

1. In GSC, use the top search bar: **Inspect any URL in "convertsheet.com"**
2. Paste the target URL:
   - `https://convertsheet.com`
   - `https://convertsheet.com/tools`
   - `https://convertsheet.com/tools/mortgage-calculator`
   - `https://convertsheet.com/tools/mortgage-calculator/500k-mortgage-canada`
   - `https://convertsheet.com/tools/mortgage-calculator/400k-mortgage-uk`
   - `https://convertsheet.com/blog/convert-json-to-excel-privately`
   - `https://convertsheet.com/compare/cloudconvert-alternative`
3. Click **Test Live URL**.
4. Once verified, click **Request Indexing**.

---

## 4. Rich Snippet Schema Verified

ConvertSheet includes complete Google-compliant JSON-LD structured data:
- **`WebSite` Sitelinks SearchBox**: Direct search bar query indexing.
- **`SoftwareApplication`**: Declares in-browser tools with 0 cost (`$0.00`) and private browser execution.
- **`HowTo` & `FAQPage`**: Accordion answers designed for Google SERP rich snippet expanders.
- **`BreadcrumbList`**: Clean hierarchical breadcrumb trails in search listings.
