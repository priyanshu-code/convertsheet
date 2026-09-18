import React from "react";
import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import { Navbar, Footer } from "@/components/layout";
import { CurrencyProvider } from "@/context/CurrencyContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "ConvertSheet - Fast, Private Structured Data Converter",
    template: "%s | ConvertSheet",
  },
  description:
    "Convert JSON, XML, CSV, and Excel spreadsheets directly in your browser with zero server uploads. 100% private, fast, and secure data conversion.",
  keywords: [
    "convert JSON to Excel",
    "XML to XLSX",
    "Excel to JSON",
    "CSV converter",
    "in-browser file conversion",
    "private converter",
    "Parquet to Excel",
    "Parquet to CSV",
    "JSONL to Excel",
    "CSV to Parquet",
    "CSV to JSONL",
    "NDJSON converter",
    "DuckDB WebAssembly",
    "client-side data converter",
  ],
  authors: [{ name: "ConvertSheet Team", url: "https://www.convertsheet.com" }],
  metadataBase: new URL("https://www.convertsheet.com"),
  openGraph: {
    title: "ConvertSheet - Fast, Private Structured Data Converter",
    description:
      "Convert JSON, XML, CSV, and Excel spreadsheets directly in your browser with zero server uploads. 100% private, fast, and secure data conversion.",
    url: "https://www.convertsheet.com",
    siteName: "ConvertSheet",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ConvertSheet - Fast, Private Structured Data Converter",
    description:
      "Convert JSON, XML, CSV, and Excel spreadsheets directly in your browser with zero server uploads.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icons/icon-192.svg" },
    ],
    shortcut: ["/favicon.ico"],
  },
  other: {
    "impact-site-verification": "695c529b-84ff-4db9-ac84-c761cca5c2c8",
  },
};

const themeScript = `
  (function() {
    try {
      var theme = localStorage.getItem('convertsheet-theme');
      var supportDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (theme === 'dark' || (!theme && supportDarkMode)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="impact-site-verification" content="695c529b-84ff-4db9-ac84-c761cca5c2c8" />
        <script
          id="theme-initializer"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "ConvertSheet",
              url: "https://www.convertsheet.com",
              description:
                "Fast, 100% private in-browser file conversions and financial calculators.",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: "https://www.convertsheet.com/tools?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${inter.className} min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-emerald-500/20 selection:text-emerald-700 dark:selection:text-emerald-300`}
      >
        {adsenseClientId && (
          <Script
            id="adsbygoogle-init"
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
          />
        )}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        >
          Skip to content
        </a>
        <CurrencyProvider>
          <Navbar />
          <main id="main-content" className="min-h-[calc(100vh-140px)] flex-1">
            {children}
          </main>
          <Footer />
        </CurrencyProvider>
      </body>
    </html>
  );
}
