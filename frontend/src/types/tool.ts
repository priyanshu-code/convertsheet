export type ToolCategory = "data-developer" | "financial" | "utility";

export interface ToolFAQItem {
  question: string;
  answer: string;
}

export interface ToolHowToStep {
  step: number;
  title: string;
  description: string;
}

export interface ToolConfig {
  slug: string;
  name: string;
  category: ToolCategory;
  title: string;
  subtitle: string;
  metaDescription: string;
  answerSummary: string; // AEO extractable direct answer sentence
  badge?: string;
  featured?: boolean;
  keywords: string[];
  formulaDescription?: string; // Mathematical formula explanation
  about: string; // 2-3 paragraph deep context for GEO and E-E-A-T
  howTo: ToolHowToStep[];
  faqs: ToolFAQItem[];
  relatedConverters?: string[]; // Cross-linking slugs from CONVERTER_REGISTRY
  relatedTools?: string[]; // Cross-linking slugs from TOOL_REGISTRY
}
