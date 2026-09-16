/**
 * Pluggable Affiliate Configuration Layer
 *
 * Provides a clean abstraction for outbound affiliate and partner links.
 * Remains completely dormant unless NEXT_PUBLIC_AFFILIATE_ENABLED === "true".
 * When enabled, seamlessly decorates links with tracking parameters (UTM tags, ref tokens, etc.).
 */

export type AffiliateCategory = "mortgage" | "auto_loan" | "retirement" | "savings" | "general";

export interface AffiliateLinkParams {
  category: AffiliateCategory;
  fallbackUrl: string;
  loanAmount?: number;
  params?: Record<string, string | number | undefined>;
}

export const AFFILIATE_DISCLOSURE =
  "Advertising & Affiliate Disclosure: ConvertSheet is an independent educational calculation service and may receive compensation from partner financial institutions when users click to compare rates. Zero client data or calculated figures are ever shared.";

/**
 * Checks whether the affiliate system is actively enabled via environment variable.
 */
export function isAffiliateEnabled(): boolean {
  return process.env.NEXT_PUBLIC_AFFILIATE_ENABLED === "true";
}

/**
 * Generates an outbound partner or affiliate link.
 * If affiliate tracking is disabled, returns the fallbackUrl unchanged.
 * If enabled, appends standard UTM parameters and any extra parameters.
 */
export function getAffiliatePartnerLink({
  category,
  fallbackUrl,
  loanAmount,
  params = {},
}: AffiliateLinkParams): string {
  if (!isAffiliateEnabled()) {
    return fallbackUrl;
  }

  try {
    const url = new URL(fallbackUrl);

    // Default tracking parameters configurable via environment variables
    const utmSource = process.env.NEXT_PUBLIC_AFFILIATE_UTM_SOURCE || "convertsheet";
    const utmMedium = "affiliate";
    const utmCampaign = process.env.NEXT_PUBLIC_AFFILIATE_UTM_CAMPAIGN || category;
    const ref = process.env.NEXT_PUBLIC_AFFILIATE_REF || "convertsheet";

    url.searchParams.set("utm_source", utmSource);
    url.searchParams.set("utm_medium", utmMedium);
    url.searchParams.set("utm_campaign", utmCampaign);
    url.searchParams.set("ref", ref);

    if (loanAmount !== undefined) {
      url.searchParams.set("loanAmount", String(loanAmount));
    }

    // Append any additional custom parameters
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }

    return url.toString();
  } catch {
    // If URL parsing fails, safely return fallback
    return fallbackUrl;
  }
}
