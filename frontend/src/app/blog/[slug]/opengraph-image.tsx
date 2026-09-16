import { ImageResponse } from "next/og";
import { getBlogPostBySlug, getAllBlogPostSlugs } from "@/lib/blog-registry";

export const alt = "ConvertSheet Engineering Blog";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllBlogPostSlugs().map((slug) => ({ slug }));
}

export default async function Image({ params }: { params: { slug: string } }) {
  const post = getBlogPostBySlug(params.slug);
  const title = post ? post.title : "ConvertSheet Engineering Blog";
  const category = post ? post.category : "Technical Guide";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#09090b",
          padding: "60px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: "#10b981",
              color: "#ffffff",
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            CS
          </div>
          <span
            style={{
              color: "#ffffff",
              fontSize: "24px",
              fontWeight: "bold",
              letterSpacing: "-0.5px",
            }}
          >
            ConvertSheet Engineering
          </span>
          <span
            style={{
              marginLeft: "12px",
              padding: "6px 14px",
              borderRadius: "9999px",
              backgroundColor: "rgba(16, 185, 129, 0.15)",
              color: "#34d399",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            {category}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h1
            style={{
              fontSize: "52px",
              fontWeight: "800",
              color: "#ffffff",
              lineHeight: 1.2,
              letterSpacing: "-1px",
              margin: 0,
            }}
          >
            {title}
          </h1>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #27272a",
            paddingTop: "24px",
            color: "#a1a1aa",
            fontSize: "18px",
          }}
        >
          <span>100% Client-Side • In-Browser WASM • Zero Cloud Uploads</span>
          <span style={{ color: "#34d399", fontWeight: "bold" }}>
            convertsheet.com/blog
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
