import { MetadataRoute } from "next";
import { getAllConverterSlugs } from "@/lib/registry";

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

  return [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...converterRoutes,
  ];
}
