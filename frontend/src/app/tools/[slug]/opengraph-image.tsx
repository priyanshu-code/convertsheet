import { ImageResponse } from "next/og";
import { getToolBySlug } from "@/lib/tool-registry";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: { slug: string };
}) {
  const tool = getToolBySlug(params.slug);

  const title = tool ? tool.name : "Free Online Calculators & Tools";
  const category = tool
    ? tool.category === "financial"
      ? "FINANCIAL CALCULATOR"
      : tool.category === "data-developer"
      ? "DEVELOPER TOOL"
      : "UTILITY CALCULATOR"
    : "FREE TOOL";

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
            background: "rgba(16, 185, 129, 0.15)",
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
            background: "rgba(20, 184, 166, 0.12)",
            filter: "blur(90px)",
          }}
        />

        {/* Brand Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            marginBottom: "35px",
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
            Convert<span style={{ color: "#34D399" }}>Sheet</span> Tools
          </span>
        </div>

        {/* Category Pill */}
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
          <span>100% CLIENT-SIDE</span>
          <span>•</span>
          <span>{category}</span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "52px",
            fontWeight: 800,
            textAlign: "center",
            maxWidth: "950px",
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            color: "#F4F4F5",
            marginBottom: "25px",
          }}
        >
          {title}
        </div>

        {/* Footer Feature Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "30px",
            fontSize: "15px",
            color: "#A1A1AA",
            marginTop: "10px",
          }}
        >
          <span>✓ Zero Server Uploads</span>
          <span>•</span>
          <span>✓ Instant Real-Time Math</span>
          <span>•</span>
          <span>✓ 100% Free Forever</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
