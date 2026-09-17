import { MetadataRoute } from "next";
import { getAllConverterSlugs } from "@/lib/registry";
import { getAllToolSlugs } from "@/lib/tool-registry";
import { getAllPresetStaticParams } from "@/lib/programmatic-presets";
import { getAllBlogPostSlugs } from "@/lib/blog-registry";
import { getAllComparisonSlugs } from "@/lib/comparison-data";

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

  const categorySiloRoutes: MetadataRoute.Sitemap = [
    "financial",
    "data-developer",
    "utility",
  ].map((category) => ({
    url: `${baseUrl}/tools/category/${category}`,
    lastModified: currentDate,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const toolRoutes: MetadataRoute.Sitemap = getAllToolSlugs().map((slug) => ({
    url: `${baseUrl}/tools/${slug}`,
    lastModified: currentDate,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  const presetRoutes: MetadataRoute.Sitemap = getAllPresetStaticParams().map(
    ({ slug, preset }) => ({
      url: `${baseUrl}/tools/${slug}/${preset}`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    })
  );

  const blogPostRoutes: MetadataRoute.Sitemap = getAllBlogPostSlugs().map(
    (slug) => ({
      url: `${baseUrl}/blog/${slug}`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    })
  );

  const comparisonRoutes: MetadataRoute.Sitemap = getAllComparisonSlugs().map(
    (slug) => ({
      url: `${baseUrl}/compare/${slug}`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.85,
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
      url: `${baseUrl}/tools`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...categorySiloRoutes,
    ...converterRoutes,
    ...toolRoutes,
    ...presetRoutes,
    ...blogPostRoutes,
    ...comparisonRoutes,
  ];
}

