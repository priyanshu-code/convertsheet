import { ImageResponse } from "next/og";
import {
  getProgrammaticPreset,
  getAllPresetStaticParams,
} from "@/lib/programmatic-presets";
import { getToolBySlug } from "@/lib/tool-registry";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export function generateStaticParams() {
  return getAllPresetStaticParams();
}

export default async function Image({
  params,
}: {
  params: { slug: string; preset: string };
}) {
  const preset = getProgrammaticPreset(params.slug, params.preset);
  const tool = getToolBySlug(params.slug);

  const title = preset ? preset.name : "Free Calculation Breakdown";
  const toolName = tool ? tool.name : "ConvertSheet Financial Tool";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#090D14",
          color: "#FFFFFF",
          fontFamily: "sans-serif",
          padding: "60px",
          position: "relative",
        }}
      >
        {/* Glow circles */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "rgba(16, 185, 129, 0.18)",
            filter: "blur(90px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "rgba(20, 184, 166, 0.15)",
            filter: "blur(90px)",
          }}
        />

        {/* Brand Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #10B981, #0D9488)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: "bold",
              color: "white",
            }}
          >
            ⚡
          </div>
          <span
            style={{
              fontSize: "36px",
              fontWeight: 800,
              letterSpacing: "-0.03em",
            }}
          >
            Convert<span style={{ color: "#34D399" }}>Sheet</span>
          </span>
        </div>

        {/* Tool Context Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 20px",
            borderRadius: "9999px",
            background: "rgba(16, 185, 129, 0.15)",
            border: "1px solid rgba(52, 211, 153, 0.3)",
            color: "#6EE7B7",
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            marginBottom: "25px",
          }}
        >
          <span>FINANCIAL CALCULATION</span>
          <span>•</span>
          <span>{toolName.toUpperCase()}</span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "48px",
            fontWeight: 800,
            textAlign: "center",
            maxWidth: "980px",
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            color: "#F4F4F5",
            marginBottom: "30px",
          }}
        >
          {title}
        </div>

        {/* Answer Summary Callout Bar */}
        {preset?.answerSummary && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "16px 28px",
              borderRadius: "18px",
              background: "rgba(24, 24, 27, 0.75)",
              border: "1px solid rgba(63, 63, 70, 0.6)",
              maxWidth: "920px",
              fontSize: "17px",
              color: "#E4E4E7",
              textAlign: "center",
              lineHeight: 1.4,
              marginBottom: "25px",
            }}
          >
            💡 {preset.answerSummary.slice(0, 140)}...
          </div>
        )}

        {/* Footer Feature Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "30px",
            fontSize: "15px",
            color: "#A1A1AA",
          }}
        >
          <span>✓ 100% Client-Side Private</span>
          <span>•</span>
          <span>✓ Instant Amortization Schedule</span>
          <span>•</span>
          <span>✓ Excel (.xlsx) Export</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
