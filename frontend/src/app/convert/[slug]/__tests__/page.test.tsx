import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { CONVERTER_REGISTRY, getAllConverterSlugs } from "@/lib/registry";
import ConverterPage, {
  generateStaticParams,
  generateMetadata,
} from "../page";
import { HowToGuide } from "@/components/seo/HowToGuide";
import { FAQAccordion } from "@/components/seo/FAQAccordion";
import {
  JsonLdSchema,
  generateSoftwareApplicationSchema,
  generateHowToSchema,
  generateFAQPageSchema,
  getJsonLdData,
} from "@/components/seo/JsonLdSchema";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

// Mock next/navigation notFound
const mockNotFound = vi.fn(() => {
  const error = new Error("NEXT_NOT_FOUND");
  (error as Error & { digest?: string }).digest = "NEXT_NOT_FOUND";
  throw error;
});

vi.mock("next/navigation", () => ({
  notFound: () => mockNotFound(),
}));

describe("Programmatic SEO Dynamic Routes (/convert/[slug])", () => {
  const allSlugs = getAllConverterSlugs();
  const jsonConfig = CONVERTER_REGISTRY["json-to-excel"];
  const pdfConfig = CONVERTER_REGISTRY["pdf-to-excel"];

  describe("generateStaticParams", () => {
    it("returns all 7 converter slugs for static pre-rendering", () => {
      const params = generateStaticParams();

      expect(params).toHaveLength(7);
      const slugs = params.map((p) => p.slug);
      expect(slugs).toEqual(
        expect.arrayContaining([
          "json-to-excel",
          "xml-to-excel",
          "csv-to-excel",
          "excel-to-json",
          "excel-to-csv",
          "pdf-to-excel",
          "tally-xml-to-excel",
        ])
      );
    });
  });

  describe("generateMetadata", () => {
    it("returns full metadata for a valid converter slug", async () => {
      const meta = await generateMetadata({ params: { slug: "json-to-excel" } });

      expect(meta.title).toBe(jsonConfig.title);
      expect(meta.description).toBe(jsonConfig.metaDescription);
      expect(meta.alternates?.canonical).toBe(
        "https://convertsheet.com/convert/json-to-excel"
      );

      // OpenGraph
      expect(meta.openGraph).toEqual(
        expect.objectContaining({
          title: jsonConfig.title,
          description: jsonConfig.metaDescription,
          url: "https://convertsheet.com/convert/json-to-excel",
          type: "website",
        })
      );

      // Twitter
      expect(meta.twitter).toEqual(
        expect.objectContaining({
          card: "summary_large_image",
          title: jsonConfig.title,
          description: jsonConfig.metaDescription,
        })
      );
    });

    it("returns fallback metadata when slug is not found", async () => {
      const meta = await generateMetadata({
        params: { slug: "non-existent-converter" },
      });

      expect(meta.title).toContain("Converter Not Found");
      expect(meta.description).toBeDefined();
    });
  });

  describe("ConverterPage Component", () => {
    it("renders hero section, ConverterCard, AdBanner, HowToGuide, FAQAccordion, and other converters for client-side tool", () => {
      const { container } = render(
        <ConverterPage params={{ slug: "json-to-excel" }} />
      );

      // Hero Title & Subtitle
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        jsonConfig.title
      );
      expect(screen.getByText(jsonConfig.subtitle)).toBeInTheDocument();

      // Privacy Badge for client-side converter
      const privacyBadge = screen.getByTestId("privacy-badge");
      expect(privacyBadge).toHaveTextContent(
        "100% Client-Side & Private • Zero Server Uploads"
      );

      // ConverterCard
      expect(screen.getByText(/Drop your JSON file here or/i)).toBeInTheDocument();

      // Leaderboard AdBanner
      const adBanner = screen.getByTestId("ad-banner");
      expect(adBanner).toBeInTheDocument();
      expect(adBanner).toHaveAttribute("data-ad-format", "leaderboard");

      // HowToGuide
      expect(
        screen.getByText(
          "How to Convert JSON to Excel Online in 3 Simple Steps"
        )
      ).toBeInTheDocument();

      // FAQAccordion
      expect(
        screen.getByText(
          `Frequently Asked Questions About ${jsonConfig.title}`
        )
      ).toBeInTheDocument();

      // Other Popular Data Converters (should list the other 6)
      const otherSection = screen.getByTestId("other-converters-section");
      expect(otherSection).toBeInTheDocument();
      const otherLinks = otherSection.querySelectorAll("a");
      expect(otherLinks).toHaveLength(6);

      const linkedHrefs = Array.from(otherLinks).map((a) =>
        a.getAttribute("href")
      );
      expect(linkedHrefs).not.toContain("/convert/json-to-excel");
      expect(linkedHrefs).toContain("/convert/xml-to-excel");
      expect(linkedHrefs).toContain("/convert/csv-to-excel");
      expect(linkedHrefs).toContain("/convert/excel-to-json");
      expect(linkedHrefs).toContain("/convert/excel-to-csv");
      expect(linkedHrefs).toContain("/convert/pdf-to-excel");
      expect(linkedHrefs).toContain("/convert/tally-xml-to-excel");

      // Structured Data JSON-LD Script tag
      const scriptTag = container.querySelector(
        'script[type="application/ld+json"]'
      );
      expect(scriptTag).toBeInTheDocument();
      const parsedData = JSON.parse(scriptTag?.textContent || "{}");
      expect(parsedData["@context"]).toBe("https://schema.org");
      expect(parsedData["@graph"]).toBeDefined();
    });

    it("renders server-side privacy badge when converter is not client-side", () => {
      render(<ConverterPage params={{ slug: "pdf-to-excel" }} />);

      const privacyBadge = screen.getByTestId("privacy-badge");
      expect(privacyBadge).toHaveTextContent(
        "Secure End-to-End Processing • Zero Retention"
      );
    });

    it("calls notFound when slug does not exist", () => {
      expect(() =>
        ConverterPage({ params: { slug: "non-existent-slug" } })
      ).toThrow("NEXT_NOT_FOUND");
      expect(mockNotFound).toHaveBeenCalled();
    });
  });

  describe("HowToGuide Component", () => {
    it("renders section title, numbered pills, step titles, and step descriptions", () => {
      render(<HowToGuide config={jsonConfig} />);

      // Section Title
      expect(
        screen.getByRole("heading", {
          name: "How to Convert JSON to Excel Online in 3 Simple Steps",
        })
      ).toBeInTheDocument();

      // Step pills (1, 2, 3)
      expect(screen.getByTestId("how-to-step-1")).toBeInTheDocument();
      expect(screen.getByTestId("how-to-step-2")).toBeInTheDocument();
      expect(screen.getByTestId("how-to-step-3")).toBeInTheDocument();

      // Step titles and descriptions
      for (const step of jsonConfig.howTo) {
        expect(screen.getByText(step.title)).toBeInTheDocument();
        expect(screen.getByText(step.description)).toBeInTheDocument();
      }
    });
  });

  describe("FAQAccordion Component", () => {
    it("renders section title and all FAQ items with accessible details/summary", () => {
      render(<FAQAccordion config={jsonConfig} />);

      // Heading
      expect(
        screen.getByText(
          `Frequently Asked Questions About ${jsonConfig.title}`
        )
      ).toBeInTheDocument();

      // Check all questions and answers
      jsonConfig.faqs.forEach((faq, index) => {
        const item = screen.getByTestId(`faq-item-${index}`);
        expect(item.tagName.toLowerCase()).toBe("details");
        expect(screen.getByText(faq.question)).toBeInTheDocument();
        expect(screen.getByText(faq.answer)).toBeInTheDocument();
      });
    });
  });

  describe("JsonLdSchema Component and Generators", () => {
    it("generates valid SoftwareApplication schema", () => {
      const appSchema = generateSoftwareApplicationSchema(jsonConfig);
      expect(appSchema["@type"]).toBe("SoftwareApplication");
      expect(appSchema.name).toContain("ConvertSheet");
      expect(appSchema.operatingSystem).toBe("All / Web Browser");
      expect(appSchema.applicationCategory).toBe("BusinessApplication");
      expect(appSchema.offers).toEqual({
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      });
      expect(appSchema.description).toBe(jsonConfig.metaDescription);
      expect(appSchema.url).toBe(
        `https://convertsheet.com/convert/${jsonConfig.slug}`
      );
    });

    it("generates valid HowTo schema with numbered steps", () => {
      const howToSchema = generateHowToSchema(jsonConfig);
      expect(howToSchema["@type"]).toBe("HowTo");
      expect(howToSchema.name).toBe(
        `How to Convert ${jsonConfig.sourceFormat} to ${jsonConfig.targetFormat} Online in 3 Simple Steps`
      );
      expect(howToSchema.step).toHaveLength(3);
      expect(howToSchema.step[0]).toEqual({
        "@type": "HowToStep",
        position: 1,
        name: jsonConfig.howTo[0].title,
        text: jsonConfig.howTo[0].description,
      });
    });

    it("generates valid FAQPage schema with Question and Answer", () => {
      const faqSchema = generateFAQPageSchema(jsonConfig);
      expect(faqSchema["@type"]).toBe("FAQPage");
      expect(faqSchema.mainEntity).toHaveLength(jsonConfig.faqs.length);
      expect(faqSchema.mainEntity[0]).toEqual({
        "@type": "Question",
        name: jsonConfig.faqs[0].question,
        acceptedAnswer: {
          "@type": "Answer",
          text: jsonConfig.faqs[0].answer,
        },
      });
    });

    it("renders script tag with graph containing all 3 schemas", () => {
      const { container } = render(<JsonLdSchema config={jsonConfig} />);
      const script = container.querySelector(
        'script[type="application/ld+json"]'
      );
      expect(script).not.toBeNull();

      const json = JSON.parse(script!.textContent || "{}");
      expect(json["@context"]).toBe("https://schema.org");
      expect(json["@graph"]).toHaveLength(3);

      const types = json["@graph"].map((item: { "@type": string }) => item["@type"]);
      expect(types).toContain("SoftwareApplication");
      expect(types).toContain("HowTo");
      expect(types).toContain("FAQPage");
    });
  });

  describe("Sitemap & Robots Handlers", () => {
    it("sitemap returns home, pricing, and all 7 converter routes with priority 0.9", () => {
      const entries = sitemap();

      // Home + Pricing + 7 Converters = 9 entries
      expect(entries).toHaveLength(9);

      // Home entry
      const homeEntry = entries.find(
        (e) => e.url === "https://convertsheet.com"
      );
      expect(homeEntry).toBeDefined();
      expect(homeEntry?.priority).toBe(1.0);
      expect(homeEntry?.changeFrequency).toBe("daily");
      expect(homeEntry?.lastModified).toBeInstanceOf(Date);

      // Pricing entry
      const pricingEntry = entries.find(
        (e) => e.url === "https://convertsheet.com/pricing"
      );
      expect(pricingEntry).toBeDefined();
      expect(pricingEntry?.priority).toBe(0.8);
      expect(pricingEntry?.changeFrequency).toBe("monthly");

      // All 7 converter entries
      for (const slug of allSlugs) {
        const converterEntry = entries.find(
          (e) => e.url === `https://convertsheet.com/convert/${slug}`
        );
        expect(converterEntry).toBeDefined();
        expect(converterEntry?.priority).toBe(0.9);
        expect(converterEntry?.changeFrequency).toBe("weekly");
        expect(converterEntry?.lastModified).toBeInstanceOf(Date);
      }
    });

    it("robots returns permissive rules and sitemap link", () => {
      const robotsConfig = robots();

      expect(robotsConfig.rules).toEqual({
        userAgent: "*",
        allow: "/",
      });
      expect(robotsConfig.sitemap).toBe("https://convertsheet.com/sitemap.xml");
    });
  });
});
