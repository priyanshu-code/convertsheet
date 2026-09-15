import { ConverterEngineId } from "./converter";

export interface FAQItem {
  question: string;
  answer: string;
}

export interface HowToStep {
  step: number;
  title: string;
  description: string;
}

export interface BaseConverterConfig {
  slug: string;
  sourceFormat: string;
  targetFormat: string;
  sourceExtension: string;
  additionalExtensions?: string[];
  targetExtension: string;
  acceptedMimeTypes: string[];
  title: string;
  subtitle: string;
  metaDescription: string;
  featured?: boolean;
  badge?: string;
  category?: "spreadsheets" | "data-engineering";
  faqs: FAQItem[];
  howTo: HowToStep[];
}

export type ConverterConfig = BaseConverterConfig & (
  | { isClientSide: true; engineId: ConverterEngineId }
  | { isClientSide: false; engineId?: undefined }
);

