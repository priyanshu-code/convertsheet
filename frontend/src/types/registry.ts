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

export interface ConverterConfig {
  slug: string;
  sourceFormat: string;
  targetFormat: string;
  sourceExtension: string;
  targetExtension: string;
  acceptedMimeTypes: string[];
  title: string;
  subtitle: string;
  metaDescription: string;
  engineId?: ConverterEngineId; // undefined for future backend engines like pdf-to-excel
  isClientSide: boolean;
  featured?: boolean;
  badge?: string;
  faqs: FAQItem[];
  howTo: HowToStep[];
}
