import React from "react";
import { ToolConfig } from "@/types/tool";

export interface ToolJsonLdSchemaProps {
  config: ToolConfig;
}

export function generateToolSoftwareApplicationSchema(config: ToolConfig) {
  return {
    "@type": "SoftwareApplication",
    name: `ConvertSheet - ${config.name}`,
    operatingSystem: "All / Web Browser",
    applicationCategory: "UtilityApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description: config.metaDescription,
    url: `https://www.convertsheet.com/tools/${config.slug}`,
  };
}

export function generateToolHowToSchema(config: ToolConfig) {
  return {
    "@type": "HowTo",
    name: `How to Use ${config.name} Online`,
    step: config.howTo.map((step, index) => ({
      "@type": "HowToStep",
      position: step.step || index + 1,
      name: step.title,
      text: step.description,
      url: `https://www.convertsheet.com/tools/${config.slug}#step-${step.step || index + 1}`,
    })),
  };
}

export function generateToolFAQPageSchema(config: ToolConfig) {
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

export function generateToolBreadcrumbSchema(config: ToolConfig) {
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
        name: "Tools",
        item: "https://www.convertsheet.com/#tools",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: config.name,
        item: `https://www.convertsheet.com/tools/${config.slug}`,
      },
    ],
  };
}

export function generateToolWebPageSchema(config: ToolConfig) {
  return {
    "@type": "WebPage",
    name: config.title,
    description: config.metaDescription,
    url: `https://www.convertsheet.com/tools/${config.slug}`,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [".tool-answer-summary", ".tool-about-section"],
    },
  };
}

export function getToolJsonLdData(config: ToolConfig) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      generateToolSoftwareApplicationSchema(config),
      generateToolHowToSchema(config),
      generateToolFAQPageSchema(config),
      generateToolBreadcrumbSchema(config),
      generateToolWebPageSchema(config),
    ],
  };
}

export function ToolJsonLdSchema({ config }: ToolJsonLdSchemaProps) {
  const structuredData = getToolJsonLdData(config);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
      }}
    />
  );
}
