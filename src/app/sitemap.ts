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
  "https://donanimportali.com";

function categoryToSlug(
  category: string
) {
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

async function getPublishedNews(): Promise<
  NewsRow[]
> {
  const supabaseUrl =
    process.env
      .NEXT_PUBLIC_SUPABASE_URL;

  const anonKey =
    process.env
      .NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !supabaseUrl ||
    !anonKey
  ) {
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
    const response =
      await fetch(
        url.toString(),
        {
          headers: {
            apikey:
              anonKey,

            Authorization:
              `Bearer ${anonKey}`,
          },

          next: {
            revalidate:
              300,
          },
        }
      );

    if (
      !response.ok
    ) {
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
  } catch (
    error
  ) {
    console.error(
      "Sitemap haber hatası:",
      error
    );

    return [];
  }
}

async function getPublishedGuides(): Promise<
  GuideRow[]
> {
  const supabaseUrl =
    process.env
      .NEXT_PUBLIC_SUPABASE_URL;

  const anonKey =
    process.env
      .NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !supabaseUrl ||
    !anonKey
  ) {
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
    const response =
      await fetch(
        url.toString(),
        {
          headers: {
            apikey:
              anonKey,

            Authorization:
              `Bearer ${anonKey}`,
          },

          next: {
            revalidate:
              300,
          },
        }
      );

    if (
      !response.ok
    ) {
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
  } catch (
    error
  ) {
    console.error(
      "Sitemap rehber hatası:",
      error
    );

    return [];
  }
}

export default async function sitemap(): Promise<
  MetadataRoute.Sitemap
> {
  const staticPages:
    MetadataRoute.Sitemap = [
      {
        url:
          SITE_URL,
        changeFrequency:
          "daily",
        priority: 1,
      },

      {
        url:
          `${SITE_URL}/news`,
        changeFrequency:
          "daily",
        priority: 0.9,
      },

      {
        url:
          `${SITE_URL}/news/genel`,
        changeFrequency:
          "daily",
        priority: 0.75,
      },

      {
        url:
          `${SITE_URL}/news/donanim`,
        changeFrequency:
          "daily",
        priority: 0.8,
      },

      {
        url:
          `${SITE_URL}/news/yazilim`,
        changeFrequency:
          "daily",
        priority: 0.75,
      },

      {
        url:
          `${SITE_URL}/news/oyun`,
        changeFrequency:
          "daily",
        priority: 0.75,
      },

      {
        url:
          `${SITE_URL}/news/yapay-zeka`,
        changeFrequency:
          "daily",
        priority: 0.75,
      },

      {
        url:
          `${SITE_URL}/news/mobil`,
        changeFrequency:
          "daily",
        priority: 0.75,
      },

      {
        url:
          `${SITE_URL}/rehber`,
        changeFrequency:
          "weekly",
        priority: 0.85,
      },

      {
        url:
          `${SITE_URL}/donanim`,
        changeFrequency:
          "daily",
        priority: 0.9,
      },

      {
        url:
          `${SITE_URL}/donanim/islemciler`,
        changeFrequency:
          "daily",
        priority: 0.8,
      },

      {
        url:
          `${SITE_URL}/donanim/ekran-kartlari`,
        changeFrequency:
          "daily",
        priority: 0.8,
      },

      {
        url:
          `${SITE_URL}/donanim/anakartlar`,
        changeFrequency:
          "daily",
        priority: 0.8,
      },

      {
        url:
          `${SITE_URL}/donanim/bellekler`,
        changeFrequency:
          "daily",
        priority: 0.8,
      },

      {
        url:
          `${SITE_URL}/donanim/guc-kaynaklari`,
        changeFrequency:
          "daily",
        priority: 0.8,
      },

      {
        url:
          `${SITE_URL}/donanim/depolama`,
        changeFrequency:
          "daily",
        priority: 0.8,
      },

      {
        url:
          `${SITE_URL}/araclar`,
        changeFrequency:
          "weekly",
        priority: 0.8,
      },

      {
        url:
          `${SITE_URL}/araclar/pc-oneri`,
        changeFrequency:
          "weekly",
        priority: 0.8,
      },

      {
        url:
          `${SITE_URL}/araclar/toplama`,
        changeFrequency:
          "weekly",
        priority: 0.8,
      },

      {
        url:
          `${SITE_URL}/araclar/fps`,
        changeFrequency:
          "weekly",
        priority: 0.8,
      },

      {
        url:
          `${SITE_URL}/araclar/darbogaz`,
        changeFrequency:
          "weekly",
        priority: 0.8,
      },

      {
        url:
          `${SITE_URL}/araclar/psu`,
        changeFrequency:
          "weekly",
        priority: 0.8,
      },

      {
        url:
          `${SITE_URL}/araclar/steam`,
        changeFrequency:
          "monthly",
        priority: 0.65,
      },

      {
        url:
          `${SITE_URL}/araclar/birim`,
        changeFrequency:
          "monthly",
        priority: 0.65,
      },

      {
        url:
          `${SITE_URL}/araclar/resim`,
        changeFrequency:
          "monthly",
        priority: 0.65,
      },

      {
        url:
          `${SITE_URL}/araclar/belge`,
        changeFrequency:
          "monthly",
        priority: 0.65,
      },

      {
        url:
          `${SITE_URL}/iletisim`,
        changeFrequency:
          "monthly",
        priority: 0.5,
      },

      {
        url: `${SITE_URL}/hakkimizda`,
        changeFrequency: "monthly",
        priority: 0.5,
      },

      {
        url: `${SITE_URL}/gizlilik-politikasi`,
        changeFrequency: "monthly",
        priority: 0.4,
      },

      {
        url: `${SITE_URL}/cerez-politikasi`,
        changeFrequency: "monthly",
        priority: 0.4,
      },

      {
        url: `${SITE_URL}/kullanim-kosullari`,
        changeFrequency: "monthly",
        priority: 0.4,
      },

      {
        url: `${SITE_URL}/sorumluluk-reddi`,
        changeFrequency: "monthly",
        priority: 0.4,
      },
    ];

  const news =
    await getPublishedNews();

  const guides =
    await getPublishedGuides();

  const newsPages:
    MetadataRoute.Sitemap =
    news
      .filter(
        (item) =>
          item.slug &&
          item.category
      )
      .map(
        (item) => ({
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
              ? new Date(
                  item.created_at
                )
              : undefined,

          changeFrequency:
            "weekly" as const,

          priority:
            0.7,
        })
      );

  const guidePages:
    MetadataRoute.Sitemap =
    guides
      .filter(
        (item) =>
          item.slug
      )
      .map(
        (item) => ({
          url:
            `${SITE_URL}/rehber/` +
            `${encodeURIComponent(
              item.slug
            )}`,

          lastModified:
            item.updated_at
              ? new Date(
                  item.updated_at
                )
              : item.created_at
              ? new Date(
                  item.created_at
                )
              : undefined,

          changeFrequency:
            "monthly" as const,

          priority:
            0.8,
        })
      );

  return [
    ...staticPages,
    ...newsPages,
    ...guidePages,
  ];
}
