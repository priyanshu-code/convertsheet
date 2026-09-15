import { useState, useCallback, useRef } from "react";
import { ConverterConfig } from "@/types/registry";
import {
  ConversionOptions,
  TabularData,
  IConverterEngine,
} from "@/types/converter";
import { getConverterEngine } from "@/lib/engines";
import { isExtensionSupported, downloadBlob } from "@/lib/utils";

export const MAX_FREE_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const DEFAULT_PRO_REASON_SIZE =
  "File size exceeds the 10MB limit for free in-browser conversion. Upgrade to ConvertSheet Pro to convert files up to 100GB.";

export const DEFAULT_PRO_REASON_SERVER =
  "This conversion requires OCR and server-side processing available in ConvertSheet Pro.";

export interface UseConverterOptions {
  engine?: IConverterEngine;
  initialOptions?: Partial<ConversionOptions>;
}

export interface UseConverterReturn {
  file: File | null;
  preview: TabularData | null;
  options: ConversionOptions;
  isParsing: boolean;
  isConverting: boolean;
  error: string | null;
  showProModal: boolean;
  proModalReason: string;
  setFile: (file: File | null) => Promise<void>;
  setOptions: React.Dispatch<React.SetStateAction<ConversionOptions>>;
  updateOptions: (newOpts: Partial<ConversionOptions>) => void;
  setShowProModal: (show: boolean) => void;
  setProModalReason: (reason: string) => void;
  reset: () => void;
  convert: () => Promise<boolean>;
}

const DEFAULT_OPTIONS: ConversionOptions = {
  sheetName: "Sheet1",
  delimiter: ",",
  prettify: true,
  flattenNested: true,
};

/**
 * Custom React hook for managing client-side spreadsheet conversion,
 * file validation, tabular preview parsing, and Pro upgrade gating.
 */
export function useConverter(
  config: ConverterConfig,
  hookOptions?: UseConverterOptions
): UseConverterReturn {
  const [file, setFileState] = useState<File | null>(null);
  const [preview, setPreview] = useState<TabularData | null>(null);
  const [options, setOptions] = useState<ConversionOptions>({
    ...DEFAULT_OPTIONS,
    ...(hookOptions?.initialOptions ?? {}),
  });
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showProModal, setShowProModal] = useState<boolean>(false);
  const [proModalReason, setProModalReason] = useState<string>("");

  // Keep a ref to latest options so convert() uses current values without stale closures
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const updateOptions = useCallback((newOpts: Partial<ConversionOptions>) => {
    setOptions((prev) => ({ ...prev, ...newOpts }));
  }, []);

  const resolveEngine = useCallback((): IConverterEngine | null => {
    if (hookOptions?.engine) {
      return hookOptions.engine;
    }
    if (config.isClientSide && config.engineId) {
      return getConverterEngine(config.engineId);
    }
    return null;
  }, [config, hookOptions?.engine]);

  const setFile = useCallback(
    async (newFile: File | null) => {
      if (!newFile) {
        setFileState(null);
        setPreview(null);
        setError(null);
        setIsParsing(false);
        setIsConverting(false);
        return;
      }

      setError(null);

      // 1. Validate file extension against config
      const supportedExtensions = [
        config.sourceExtension,
        ...(config.additionalExtensions || []),
      ];

      if (!isExtensionSupported(newFile.name, supportedExtensions)) {
        setFileState(null);
        setPreview(null);
        const displayExts = supportedExtensions.join(", ");
        setError(
          `Unsupported file format. Please upload a valid ${config.sourceFormat} file (${displayExts}).`
        );
        return;
      }

      setFileState(newFile);

      // 2. Check Pro gating: Server-side required (e.g. pdf-to-excel)
      if (!config.isClientSide) {
        setPreview(null);
        setProModalReason(DEFAULT_PRO_REASON_SERVER);
        setShowProModal(true);
        return;
      }

      // 3. Check Pro gating: File size exceeds 10MB
      if (newFile.size > MAX_FREE_FILE_SIZE_BYTES) {
        setPreview(null);
        setProModalReason(DEFAULT_PRO_REASON_SIZE);
        setShowProModal(true);
        return;
      }

      // 4. Client-side preview parsing
      const engine = resolveEngine();
      if (!engine) {
        setError("No compatible converter engine found for this format.");
        return;
      }

      setIsParsing(true);
      setError(null);
      try {
        const previewData = await engine.parsePreview(newFile, 10);
        setPreview(previewData);
        setError(null);
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to parse preview for this file.";
        setError(message);
        setPreview(null);
      } finally {
        setIsParsing(false);
      }
    },
    [config, resolveEngine]
  );

  const convert = useCallback(async (): Promise<boolean> => {
    if (!file) {
      setError("Please select a file to convert.");
      return false;
    }

    // Pro gating checks
    if (!config.isClientSide) {
      setProModalReason(DEFAULT_PRO_REASON_SERVER);
      setShowProModal(true);
      return false;
    }

    if (file.size > MAX_FREE_FILE_SIZE_BYTES) {
      setProModalReason(DEFAULT_PRO_REASON_SIZE);
      setShowProModal(true);
      return false;
    }

    const engine = resolveEngine();
    if (!engine) {
      setError("No compatible converter engine found for this format.");
      return false;
    }

    setIsConverting(true);
    setError(null);

    try {
      const output = await engine.convert(file, optionsRef.current);
      downloadBlob(output.blob, output.filename);
      return true;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Conversion failed. Please try again.";
      setError(message);
      return false;
    } finally {
      setIsConverting(false);
    }
  }, [file, config, resolveEngine]);

  const reset = useCallback(() => {
    setFileState(null);
    setPreview(null);
    setError(null);
    setIsParsing(false);
    setIsConverting(false);
    setShowProModal(false);
    setProModalReason("");
    setOptions({
      ...DEFAULT_OPTIONS,
      ...(hookOptions?.initialOptions ?? {}),
    });
  }, [hookOptions?.initialOptions]);

  return {
    file,
    preview,
    options,
    isParsing,
    isConverting,
    error,
    showProModal,
    proModalReason,
    setFile,
    setOptions,
    updateOptions,
    setShowProModal,
    setProModalReason,
    reset,
    convert,
  };
}
