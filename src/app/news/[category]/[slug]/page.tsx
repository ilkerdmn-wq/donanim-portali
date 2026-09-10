import type { Metadata } from "next";
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

const SITE_URL = "https://donanim-portali.vercel.app";

function normalizeParam(value: string) {
  return decodeURIComponent(value || "").trim();
}

async function getNewsBySlug(
  slug: string
): Promise<NewsSeoRow | null> {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey || !slug) {
    return null;
  }

  const url = new URL(
    `${supabaseUrl}/rest/v1/news`
  );

  url.searchParams.set(
    "select",
    "title,slug,excerpt,image_url,category,published,created_at"
  );
  url.searchParams.set("slug", `eq.${slug}`);
  url.searchParams.set("published", "eq.true");
  url.searchParams.set("limit", "1");

  try {
    const response = await fetch(url.toString(), {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      next: {
        revalidate: 300,
      },
    });

    if (!response.ok) {
      console.error(
        "Haber SEO verisi alınamadı:",
        response.status,
        response.statusText
      );
      return null;
    }

    const rows =
      (await response.json()) as NewsSeoRow[];

    return rows[0] ?? null;
  } catch (error) {
    console.error(
      "Haber SEO verisi alınırken hata:",
      error
    );
    return null;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;

  const category =
    normalizeParam(resolvedParams.category)
      .toLocaleLowerCase("tr-TR");

  const slug =
    normalizeParam(resolvedParams.slug);

  const news = await getNewsBySlug(slug);

  if (!news) {
    return {
      title: "Haber bulunamadı",
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

  const canonical =
    `${SITE_URL}/news/${category}/${encodeURIComponent(slug)}`;

  return {
    title: news.title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "article",
      locale: "tr_TR",
      url: canonical,
      siteName: "Donanım Portalı",
      title: news.title,
      description,
      publishedTime:
        news.created_at || undefined,
      images: news.image_url
        ? [
            {
              url: news.image_url,
              alt: news.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: news.title,
      description,
      images: news.image_url
        ? [news.image_url]
        : undefined,
    },
  };
}

export default async function NewsDetailPage({
  params,
}: PageProps) {
  const resolvedParams = await params;

  const category =
    normalizeParam(resolvedParams.category);

  const slug =
    normalizeParam(resolvedParams.slug);

  return (
    <NewsDetailClient
      categorySlug={category}
      newsSlug={slug}
    />
  );
}
