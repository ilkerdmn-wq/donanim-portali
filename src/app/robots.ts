import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    "https://donanimportali.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/yonetim",
        "/api",
      ],
    },

    sitemap:
      `${baseUrl}/sitemap.xml`,
  };
}