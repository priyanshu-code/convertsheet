import JSZip from "jszip";

export interface ZipFileInput {
  name: string;
  data: Uint8Array | Blob | string;
}

/**
 * Creates an in-memory ZIP archive from multiple files using JSZip.
 * 100% client-side, zero server round trips.
 */
export async function createZipArchive(files: ZipFileInput[]): Promise<Blob> {
  const zip = new JSZip();

  for (const file of files) {
    zip.file(file.name, file.data);
  }

  const zipBlob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  return zipBlob;
}

/**
 * Triggers a browser download of a given Blob.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
