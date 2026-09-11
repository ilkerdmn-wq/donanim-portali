import type { Metadata } from "next";
import {
  notFound,
  redirect,
} from "next/navigation";

import NewsDetailClient from "./NewsDetailClient";

type PageProps = {
  params: Promise<{
    category: string;
    slug: string;
  }>;
};

type NewsSeoRow = {
  title: string;
  slug: string;
  excerpt: string | null;
  image_url: string | null;
  category: string | null;
  published: boolean;
  created_at: string | null;
};

const SITE_URL =
  "https://donanimportali.com";

function normalizeParam(
  value: string
) {
  return decodeURIComponent(
    value || ""
  ).trim();
}

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

async function getNewsBySlug(
  slug: string
): Promise<NewsSeoRow | null> {
  const supabaseUrl =
    process.env
      .NEXT_PUBLIC_SUPABASE_URL;

  const anonKey =
    process.env
      .NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !supabaseUrl ||
    !anonKey ||
    !slug
  ) {
    return null;
  }

  const url = new URL(
    `${supabaseUrl}/rest/v1/news`
  );

  url.searchParams.set(
    "select",
    "title,slug,excerpt,image_url,category,published,created_at"
  );

  url.searchParams.set(
    "slug",
    `eq.${slug}`
  );

  url.searchParams.set(
    "published",
    "eq.true"
  );

  url.searchParams.set(
    "limit",
    "1"
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
        "Haber SEO verisi alınamadı:",
        response.status,
        response.statusText
      );

      return null;
    }

    const rows =
      (await response.json()) as NewsSeoRow[];

    return rows[0] ??
      null;
  } catch (
    error
  ) {
    console.error(
      "Haber SEO verisi alınırken hata:",
      error
    );

    return null;
  }
}

function getCanonicalData(
  news: NewsSeoRow
) {
  const categorySlug =
    categoryToSlug(
      news.category ||
        "Genel"
    ) || "genel";

  const canonical =
    `${SITE_URL}/news/` +
    `${categorySlug}/` +
    `${encodeURIComponent(
      news.slug
    )}`;

  return {
    categorySlug,
    canonical,
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams =
    await params;

  const slug =
    normalizeParam(
      resolvedParams.slug
    );

  const news =
    await getNewsBySlug(
      slug
    );

  if (!news) {
    return {
      title:
        "Haber bulunamadı",

      description:
        "Aradığınız haber bulunamadı veya yayından kaldırılmış olabilir.",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description =
    news.excerpt?.trim() ||
    `${news.title} hakkında güncel teknoloji haberi ve detaylar.`;

  const {
    canonical,
  } =
    getCanonicalData(
      news
    );

  return {
    title:
      news.title,

    description,

    alternates: {
      canonical,
    },

    openGraph: {
      type:
        "article",

      locale:
        "tr_TR",

      url:
        canonical,

      siteName:
        "Donanım Portalı",

      title:
        news.title,

      description,

      publishedTime:
        news.created_at ||
        undefined,

      images:
        news.image_url
          ? [
              {
                url:
                  news.image_url,
                alt:
                  news.title,
              },
            ]
          : undefined,
    },

    twitter: {
      card:
        "summary_large_image",

      title:
        news.title,

      description,

      images:
        news.image_url
          ? [
              news.image_url,
            ]
          : undefined,
    },
  };
}

export default async function NewsDetailPage({
  params,
}: PageProps) {
  const resolvedParams =
    await params;

  const requestedCategory =
    normalizeParam(
      resolvedParams.category
    )
      .toLocaleLowerCase(
        "tr-TR"
      );

  const slug =
    normalizeParam(
      resolvedParams.slug
    );

  const news =
    await getNewsBySlug(
      slug
    );

  if (!news) {
    notFound();
  }

  const {
    categorySlug:
      actualCategorySlug,
    canonical,
  } =
    getCanonicalData(
      news
    );

  if (
    requestedCategory !==
    actualCategorySlug
  ) {
    redirect(
      `/news/${actualCategorySlug}/${encodeURIComponent(
        news.slug
      )}`
    );
  }

  const description =
    news.excerpt?.trim() ||
    `${news.title} hakkında güncel teknoloji haberi ve detaylar.`;

  const articleJsonLd = {
    "@context":
      "https://schema.org",

    "@type":
      "NewsArticle",

    headline:
      news.title,

    description,

    mainEntityOfPage:
      canonical,

    datePublished:
      news.created_at ||
      undefined,

    dateModified:
      news.created_at ||
      undefined,

    inLanguage:
      "tr-TR",

    author: {
      "@type":
        "Organization",

      name:
        "Donanım Portalı",

      url:
        SITE_URL,
    },

    publisher: {
      "@type":
        "Organization",

      name:
        "Donanım Portalı",

      url:
        SITE_URL,
    },

    image:
      news.image_url
        ? [
            news.image_url,
          ]
        : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              articleJsonLd
            ),
        }}
      />

      <NewsDetailClient
        categorySlug={
          actualCategorySlug
        }
        newsSlug={
          news.slug
        }
      />
    </>
  );
}
