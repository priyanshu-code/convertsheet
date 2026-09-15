import { MetadataRoute } from "next";
import { getAllConverterSlugs } from "@/lib/registry";
import { getAllToolSlugs } from "@/lib/tool-registry";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://convertsheet.com";
  const currentDate = new Date();

  const converterRoutes: MetadataRoute.Sitemap = getAllConverterSlugs().map(
    (slug) => ({
      url: `${baseUrl}/convert/${slug}`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.9,
    })
  );

  const toolRoutes: MetadataRoute.Sitemap = getAllToolSlugs().map((slug) => ({
    url: `${baseUrl}/tools/${slug}`,
    lastModified: currentDate,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  return [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    ...converterRoutes,
    ...toolRoutes,
  ];
}
