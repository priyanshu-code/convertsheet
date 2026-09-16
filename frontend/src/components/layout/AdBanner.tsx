"use client";

import React, { useEffect } from "react";

export type AdBannerFormat = "leaderboard" | "rectangle" | "horizontal";

export interface AdBannerProps {
  format?: AdBannerFormat;
  slotId?: string;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdBanner({
  format = "horizontal",
  slotId,
  className = "",
}: AdBannerProps) {
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  // Format dimensions and labels to prevent Cumulative Layout Shift (CLS)
  const formatConfig = {
    leaderboard: {
      dimensionClass: "min-h-[50px] sm:min-h-[90px] max-w-[728px] w-full",
      label: "Leaderboard",
      dimensions: "728 × 90",
      adFormat: "auto",
    },
    rectangle: {
      dimensionClass: "min-h-[250px] w-[300px]",
      label: "Medium Rectangle",
      dimensions: "300 × 250",
      adFormat: "rectangle",
    },
    horizontal: {
      dimensionClass: "min-h-[90px] w-full",
      label: "Horizontal Responsive",
      dimensions: "Responsive Banner",
      adFormat: "auto",
    },
  }[format];

  // Request adsbygoogle fill when client ID is provided
  useEffect(() => {
    if (adsenseClientId) {
      try {
        if (typeof window !== "undefined") {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch {
        // Silently ignore Adsense errors if script blocked
      }
    }
  }, [adsenseClientId, slotId]);

  return (
    <div
      data-testid="ad-banner"
      data-ad-format={format}
      className={`mx-auto flex items-center justify-center overflow-hidden transition-all ${formatConfig.dimensionClass} ${className}`}
      aria-label="Advertisement / Sponsored"
    >
      {adsenseClientId ? (
        <ins
          className="adsbygoogle block w-full text-center"
          data-ad-client={adsenseClientId}
          data-ad-slot={slotId || "default-slot"}
          data-ad-format={formatConfig.adFormat}
          data-full-width-responsive="true"
        />
      ) : (
        /* Development & Preview Placeholder (Zero CLS) */
        <div
          data-testid="ad-placeholder"
          className="w-full h-full flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 text-center"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
            Advertisement / Sponsored
          </span>
          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mt-1">
            {formatConfig.label} ({formatConfig.dimensions})
          </p>
        </div>
      )}
    </div>
  );
}
