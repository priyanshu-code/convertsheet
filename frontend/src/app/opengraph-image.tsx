import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
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
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "rgba(59, 130, 246, 0.12)",
            filter: "blur(90px)",
          }}
        />

        {/* Brand header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "54px",
              height: "54px",
              borderRadius: "16px",
              backgroundColor: "#10B981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "26px",
              fontWeight: 800,
              color: "#0B0F17",
            }}
          >
            CS
          </div>
          <span
            style={{
              fontSize: "36px",
              fontWeight: 800,
              letterSpacing: "-0.5px",
            }}
          >
            Convert<span style={{ color: "#10B981" }}>Sheet</span>
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "52px",
            fontWeight: 800,
            textAlign: "center",
            maxWidth: "960px",
            lineHeight: 1.18,
            marginBottom: "24px",
            letterSpacing: "-1px",
          }}
        >
          Fast, Private In-Browser Data Converters & Financial Calculators
        </div>

        {/* Feature Badges */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              padding: "10px 20px",
              borderRadius: "9999px",
              backgroundColor: "rgba(16, 185, 129, 0.15)",
              border: "1.5px solid #10B981",
              fontSize: "18px",
              fontWeight: 700,
              color: "#34D399",
            }}
          >
            🔒 100% Client-Side Privacy
          </div>
          <div
            style={{
              padding: "10px 20px",
              borderRadius: "9999px",
              backgroundColor: "#181F2C",
              border: "1.5px solid #272F3D",
              fontSize: "18px",
              fontWeight: 600,
              color: "#E4E4E7",
            }}
          >
            ⚡ WebAssembly Engine
          </div>
          <div
            style={{
              padding: "10px 20px",
              borderRadius: "9999px",
              backgroundColor: "#181F2C",
              border: "1.5px solid #272F3D",
              fontSize: "18px",
              fontWeight: 600,
              color: "#E4E4E7",
            }}
          >
            🚀 Zero Server Uploads
          </div>
        </div>

        {/* Format list footer */}
        <div
          style={{
            fontSize: "19px",
            color: "#94A3B8",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span>Excel</span>
          <span>•</span>
          <span>JSON</span>
          <span>•</span>
          <span>CSV</span>
          <span>•</span>
          <span>SQLite</span>
          <span>•</span>
          <span>XML</span>
          <span>•</span>
          <span>Parquet</span>
          <span>•</span>
          <span>Salary & Tax Calculators</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
