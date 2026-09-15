import { ImageResponse } from "next/og";
import { getConverterBySlug } from "@/lib/registry";

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
  const config = getConverterBySlug(params.slug);

  const title = config ? config.title : "ConvertSheet Data Converter";
  const sourceFormat = config ? config.sourceFormat.toUpperCase() : "DATA";
  const targetFormat = config ? config.targetFormat.toUpperCase() : "EXCEL";
  const isClientSide = config ? config.isClientSide : true;

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
          backgroundColor: "#0B0F17",
          color: "#FFFFFF",
          fontFamily: "sans-serif",
          padding: "60px",
          position: "relative",
        }}
      >
        {/* Background gradient blur circles */}
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

        {/* Brand header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "36px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              backgroundColor: "#10B981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: 800,
              color: "#0B0F17",
            }}
          >
            CS
          </div>
          <span
            style={{
              fontSize: "28px",
              fontWeight: 700,
              letterSpacing: "-0.5px",
            }}
          >
            Convert<span style={{ color: "#10B981" }}>Sheet</span>
          </span>
        </div>

        {/* Conversion format pills */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              padding: "10px 24px",
              borderRadius: "12px",
              backgroundColor: "#181F2C",
              border: "2px solid #272F3D",
              fontSize: "22px",
              fontWeight: 700,
              color: "#E4E4E7",
            }}
          >
            {sourceFormat}
          </div>
          <span style={{ fontSize: "28px", color: "#10B981" }}>&rarr;</span>
          <div
            style={{
              padding: "10px 24px",
              borderRadius: "12px",
              backgroundColor: "rgba(16, 185, 129, 0.15)",
              border: "2px solid #10B981",
              fontSize: "22px",
              fontWeight: 700,
              color: "#34D399",
            }}
          >
            {targetFormat}
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "48px",
            fontWeight: 800,
            textAlign: "center",
            maxWidth: "950px",
            lineHeight: 1.2,
            marginBottom: "28px",
          }}
        >
          {title}
        </div>

        {/* Subtitle / trust badge */}
        <div
          style={{
            fontSize: "20px",
            color: "#94A3B8",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {isClientSide
            ? "⚡ 100% Client-Side • In-Browser Execution • Zero Server Uploads"
            : "🔒 Bank-Grade Encryption • Zero Data Retention"}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
