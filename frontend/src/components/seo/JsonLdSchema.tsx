import React from "react";
import { ConverterConfig } from "@/types/registry";

export interface JsonLdSchemaProps {
  config: ConverterConfig;
}

export function generateSoftwareApplicationSchema(config: ConverterConfig) {
  return {
    "@type": "SoftwareApplication",
    name: `ConvertSheet - ${config.title}`,
    operatingSystem: "All / Web Browser",
    applicationCategory: "BusinessApplication",
    offers: {
      "@type": "Offer",
      price: config.isClientSide ? "0" : "9.99",
      priceCurrency: "USD",
    },
    description: config.metaDescription,
    url: `https://www.convertsheet.com/convert/${config.slug}`,
  };
}

export function generateHowToSchema(config: ConverterConfig) {
  return {
    "@type": "HowTo",
    name: `How to Convert ${config.sourceFormat} to ${config.targetFormat} Online in ${config.howTo.length} Simple Steps`,
    step: config.howTo.map((step, index) => ({
      "@type": "HowToStep",
      position: step.step || index + 1,
      name: step.title,
      text: step.description,
      url: `https://www.convertsheet.com/convert/${config.slug}#step-${step.step || index + 1}`,
    })),
  };
}

export function generateFAQPageSchema(config: ConverterConfig) {
  return {
    "@type": "FAQPage",
    mainEntity: config.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function generateBreadcrumbSchema(config: ConverterConfig) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.convertsheet.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Converters",
        item: "https://www.convertsheet.com/#converters",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${config.sourceFormat} to ${config.targetFormat}`,
        item: `https://www.convertsheet.com/convert/${config.slug}`,
      },
    ],
  };
}

export function getJsonLdData(config: ConverterConfig) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      generateSoftwareApplicationSchema(config),
      generateHowToSchema(config),
      generateFAQPageSchema(config),
      generateBreadcrumbSchema(config),
    ],
  };
}

export function JsonLdSchema({ config }: JsonLdSchemaProps) {
  const structuredData = getJsonLdData(config);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
      }}
    />
  );
}
