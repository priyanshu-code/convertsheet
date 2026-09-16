import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ConvertSheet - 100% Private Offline Data Tools",
    short_name: "ConvertSheet",
    description:
      "100% in-browser offline file converters, financial calculators, and developer utilities with zero cloud uploads.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#10b981",
    orientation: "portrait-primary",
    scope: "/",
    categories: ["business", "finance", "productivity", "utilities", "developer tools"],
    icons: [
      {
        src: "/icons/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
