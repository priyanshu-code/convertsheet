import React from "react";
import { ToolConfig } from "@/types/tool";

export interface ToolJsonLdSchemaProps {
  config: ToolConfig;
  canonicalUrl?: string;
  presetName?: string;
  parentToolName?: string;
}

export function generateToolSoftwareApplicationSchema(
  config: ToolConfig,
  canonicalUrl?: string
) {
  const pageUrl = canonicalUrl || `https://www.convertsheet.com/tools/${config.slug}`;
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
    url: pageUrl,
  };
}

export function generateToolHowToSchema(
  config: ToolConfig,
  canonicalUrl?: string
) {
  const pageUrl = canonicalUrl || `https://www.convertsheet.com/tools/${config.slug}`;
  return {
    "@type": "HowTo",
    name: `How to Use ${config.name} Online`,
    step: config.howTo.map((step, index) => ({
      "@type": "HowToStep",
      position: step.step || index + 1,
      name: step.title,
      text: step.description,
      url: `${pageUrl}#step-${step.step || index + 1}`,
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

export function generateToolBreadcrumbSchema(
  config: ToolConfig,
  canonicalUrl?: string,
  presetName?: string,
  parentToolName?: string
) {
  const items: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }> = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://www.convertsheet.com",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Tools Hub",
      item: "https://www.convertsheet.com/tools",
    },
    {
      "@type": "ListItem",
      position: 3,
      name: parentToolName || config.name,
      item: `https://www.convertsheet.com/tools/${config.slug}`,
    },
  ];

  if (canonicalUrl && presetName) {
    items.push({
      "@type": "ListItem",
      position: 4,
      name: presetName,
      item: canonicalUrl,
    });
  }

  return {
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}

export function generateToolWebPageSchema(
  config: ToolConfig,
  canonicalUrl?: string
) {
  const pageUrl = canonicalUrl || `https://www.convertsheet.com/tools/${config.slug}`;
  return {
    "@type": "WebPage",
    name: config.title,
    description: config.metaDescription,
    url: pageUrl,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [".tool-answer-summary", ".tool-about-section"],
    },
  };
}

export function getToolJsonLdData(
  config: ToolConfig,
  canonicalUrl?: string,
  presetName?: string,
  parentToolName?: string
) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      generateToolSoftwareApplicationSchema(config, canonicalUrl),
      generateToolHowToSchema(config, canonicalUrl),
      generateToolFAQPageSchema(config),
      generateToolBreadcrumbSchema(config, canonicalUrl, presetName, parentToolName),
      generateToolWebPageSchema(config, canonicalUrl),
    ],
  };
}

export function ToolJsonLdSchema({
  config,
  canonicalUrl,
  presetName,
  parentToolName,
}: ToolJsonLdSchemaProps) {
  const structuredData = getToolJsonLdData(
    config,
    canonicalUrl,
    presetName,
    parentToolName
  );

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
      }}
    />
  );
}
