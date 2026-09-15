import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navbar, Footer } from "@/components/layout";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "ConvertSheet - Fast, Private Structured Data Converter",
  description:
    "Convert JSON, XML, CSV, and Excel spreadsheets directly in your browser with zero server uploads. 100% private, fast, and secure data conversion.",
  keywords: [
    "convert JSON to Excel",
    "XML to XLSX",
    "Excel to JSON",
    "CSV converter",
    "in-browser file conversion",
    "private converter",
  ],
  authors: [{ name: "ConvertSheet Team", url: "https://convertsheet.com" }],
  metadataBase: new URL("https://convertsheet.com"),
  openGraph: {
    title: "ConvertSheet - Fast, Private Structured Data Converter",
    description:
      "Convert JSON, XML, CSV, and Excel spreadsheets directly in your browser with zero server uploads. 100% private, fast, and secure data conversion.",
    url: "https://convertsheet.com",
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
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          id="theme-initializer"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
      </head>
      <body
        className={`${inter.className} min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-emerald-500/20 selection:text-emerald-700 dark:selection:text-emerald-300`}
      >
        <Navbar />
        <main className="min-h-[calc(100vh-140px)] flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
