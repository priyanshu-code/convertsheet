/**
 * Client-Side Media Engine Connector.
 * Connects directly to the Dockerbox Media Engine via Cloudflare Tunnel.
 * CORS is enabled on the gateway for direct browser uploads.
 */

export const MEDIA_ENGINE_BASE_URL =
  process.env.NEXT_PUBLIC_MEDIA_ENGINE_URL || "https://engine.solveyourtrip.com";

const MASTER_API_KEY =
  process.env.NEXT_PUBLIC_MEDIA_API_KEY || "syt_master_live_key_9f82a17c";

export interface MediaJobStatus {
  job_id: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress?: number;
  stage?: string;
  error?: string;
  result?: {
    output_path?: string;
    download_url?: string;
    text?: string;
    segments?: Array<{ start: number; end: number; text: string }>;
    duration_seconds?: number;
    language?: string;
    [key: string]: any;
  };
}

/**
 * Dispatches a multipart form upload request to the Media Engine.
 */
export async function dispatchMediaJob(
  endpoint: string,
  formData: FormData
): Promise<any> {
  const url = `${MEDIA_ENGINE_BASE_URL}/media/api/v1/${endpoint.replace(/^\//, "")}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "X-API-Key": MASTER_API_KEY,
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.message || `Media Engine returned HTTP ${res.status}`);
  }

  return res.json();
}

/**
 * Dispatches a JSON request to the Media Engine (for TTS, Detection, etc.).
 */
export async function dispatchJsonMediaJob(
  endpoint: string,
  payload: Record<string, any>
): Promise<any> {
  const url = `${MEDIA_ENGINE_BASE_URL}/media/api/v1/${endpoint.replace(/^\//, "")}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "X-API-Key": MASTER_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.message || `Media Engine returned HTTP ${res.status}`);
  }

  return res.json();
}

/**
 * Polls a running media job until completion and returns the final result payload.
 */
export async function pollMediaJobFull(
  jobId: string,
  maxAttempts: number = 60,
  intervalMs: number = 1000
): Promise<NonNullable<MediaJobStatus["result"]>> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts++;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));

    const res = await fetch(`${MEDIA_ENGINE_BASE_URL}/media/api/v1/jobs/${jobId}`, {
      headers: {
        "X-API-Key": MASTER_API_KEY,
      },
    });

    if (!res.ok) continue;

    const job: MediaJobStatus = await res.json();

    if (job.status === "completed") {
      if (job.result) {
        return job.result;
      }
      return {};
    }

    if (job.status === "failed") {
      throw new Error(job.error || "Media processing job failed on worker node.");
    }
  }

  throw new Error("Job timed out while processing.");
}

/**
 * Convenience wrapper returning the download URL of a completed job.
 */
export async function pollMediaJob(
  jobId: string,
  maxAttempts: number = 40,
  intervalMs: number = 1000
): Promise<string> {
  const result = await pollMediaJobFull(jobId, maxAttempts, intervalMs);
  const rawUrl =
    result.download_url ||
    result.output_path ||
    (result as any).output_image_path ||
    (result as any).output_video_path ||
    (result as any).output_audio_path;

  if (rawUrl) {
    if (rawUrl.startsWith("http")) return rawUrl;
    if (rawUrl.startsWith("/media/")) {
      return `${MEDIA_ENGINE_BASE_URL}${rawUrl}`;
    }
    if (rawUrl.startsWith("/api/")) {
      return `${MEDIA_ENGINE_BASE_URL}/media${rawUrl}`;
    }
    const filename = rawUrl.split("/").pop();
    return `${MEDIA_ENGINE_BASE_URL}/media/api/v1/download/files/${filename}`;
  }
  throw new Error("Job completed but returned no output file.");
}
