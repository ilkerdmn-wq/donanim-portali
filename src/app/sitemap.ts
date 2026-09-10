import type { MetadataRoute } from "next";

type NewsRow = {
  slug: string;
  category: string | null;
  created_at: string | null;
};

type GuideRow = {
  slug: string;
  updated_at: string | null;
  created_at: string | null;
};

const SITE_URL =
  "https://donanim-portali.vercel.app";

function categoryToSlug(category: string) {
  return category
    .toLocaleLowerCase("tr-TR")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function getPublishedNews(): Promise<NewsRow[]> {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return [];
  }

  const url = new URL(
    `${supabaseUrl}/rest/v1/news`
  );

  url.searchParams.set(
    "select",
    "slug,category,created_at"
  );

  url.searchParams.set(
    "published",
    "eq.true"
  );

  url.searchParams.set(
    "order",
    "created_at.desc"
  );

  try {
    const response = await fetch(
      url.toString(),
      {
        headers: {
          apikey: anonKey,
          Authorization:
            `Bearer ${anonKey}`,
        },
        next: {
          revalidate: 300,
        },
      }
    );

    if (!response.ok) {
      console.error(
        "Sitemap haberleri alınamadı:",
        response.status,
        response.statusText
      );

      return [];
    }

    return (
      (await response.json()) as NewsRow[]
    );
  } catch (error) {
    console.error(
      "Sitemap haber hatası:",
      error
    );

    return [];
  }
}

async function getPublishedGuides(): Promise<GuideRow[]> {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return [];
  }

  const url = new URL(
    `${supabaseUrl}/rest/v1/guides`
  );

  url.searchParams.set(
    "select",
    "slug,updated_at,created_at"
  );

  url.searchParams.set(
    "published",
    "eq.true"
  );

  url.searchParams.set(
    "order",
    "updated_at.desc"
  );

  try {
    const response = await fetch(
      url.toString(),
      {
        headers: {
          apikey: anonKey,
          Authorization:
            `Bearer ${anonKey}`,
        },
        next: {
          revalidate: 300,
        },
      }
    );

    if (!response.ok) {
      console.error(
        "Sitemap rehberleri alınamadı:",
        response.status,
        response.statusText
      );

      return [];
    }

    return (
      (await response.json()) as GuideRow[]
    );
  } catch (error) {
    console.error(
      "Sitemap rehber hatası:",
      error
    );

    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },

    {
      url: `${SITE_URL}/news`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },

    {
      url: `${SITE_URL}/donanim`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },

    {
      url: `${SITE_URL}/araclar`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },

    {
      url: `${SITE_URL}/araclar/pc-oneri`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },

    {
      url: `${SITE_URL}/araclar/toplama`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },

    {
      url: `${SITE_URL}/araclar/fps`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },

    {
      url: `${SITE_URL}/araclar/darbogaz`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },

    {
      url: `${SITE_URL}/araclar/psu`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },

    {
      url: `${SITE_URL}/iletisim`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },

    {
      url: `${SITE_URL}/rehber`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },

    {
      url: `${SITE_URL}/donanim/islemciler`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },

    {
      url: `${SITE_URL}/donanim/ekran-kartlari`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },

    {
      url: `${SITE_URL}/donanim/anakartlar`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },

    {
      url: `${SITE_URL}/donanim/bellekler`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },

    {
      url: `${SITE_URL}/donanim/guc-kaynaklari`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },

    {
      url: `${SITE_URL}/donanim/depolama`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  const news =
    await getPublishedNews();

  const guides =
    await getPublishedGuides();

  const newsPages: MetadataRoute.Sitemap =
    news
      .filter(
        (item) =>
          item.slug &&
          item.category
      )
      .map((item) => ({
        url:
          `${SITE_URL}/news/` +
          `${categoryToSlug(
            item.category!
          )}/` +
          `${encodeURIComponent(
            item.slug
          )}`,

        lastModified:
          item.created_at
            ? new Date(item.created_at)
            : new Date(),

        changeFrequency:
          "weekly" as const,

        priority: 0.7,
      }));

  const guidePages: MetadataRoute.Sitemap =
    guides
      .filter(
        (item) =>
          item.slug
      )
      .map((item) => ({
        url:
          `${SITE_URL}/rehber/` +
          `${encodeURIComponent(
            item.slug
          )}`,

        lastModified:
          item.updated_at
            ? new Date(item.updated_at)
            : item.created_at
            ? new Date(item.created_at)
            : new Date(),

        changeFrequency:
          "monthly" as const,

        priority: 0.8,
      }));

  return [
    ...staticPages,
    ...newsPages,
    ...guidePages,
  ];
}