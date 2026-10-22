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
    [key: string]: any;
  };
}

/**
 * Dispatches an image processing request directly to the Media Engine.
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
 * Polls a running media job until completion or timeout.
 */
export async function pollMediaJob(
  jobId: string,
  maxAttempts: number = 40,
  intervalMs: number = 1000
): Promise<string> {
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
      const url = job.result?.download_url || job.result?.output_path;
      if (url) {
        return url.startsWith("http")
          ? url
          : `${MEDIA_ENGINE_BASE_URL}/media/api/v1/download/files/${url}`;
      }
      throw new Error("Job completed but returned no output file.");
    }

    if (job.status === "failed") {
      throw new Error(job.error || "Media processing job failed on GPU worker.");
    }
  }

  throw new Error("Media processing timed out. Please try with a smaller image.");
}
