"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  ArrowLeft,
  BrainCircuit,
  CalendarDays,
  Code2,
  Cpu,
  Gamepad2,
  Image as ImageIcon,
  Newspaper,
  Smartphone,
  Tag,
} from "lucide-react";

import { supabase } from "../../../lib/supabase";

type ContentBlock = {
  type: string;
  value?: string;
  url?: string;
  src?: string;
  items?: string[];
  caption?: string;
};

type NewsItem = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: any;
  image_url: string | null;
  category: string;
  published: boolean;
  featured?: boolean;
  created_at: string;
};

type CategoryInfo = {
  title: string;
  dbName: string;
  icon: any;
};

const categoryMap: Record<string, CategoryInfo> = {
  genel: {
    title: "Genel",
    dbName: "Genel",
    icon: Newspaper,
  },

  donanim: {
    title: "Donanım",
    dbName: "Donanım",
    icon: Cpu,
  },

  yazilim: {
    title: "Yazılım",
    dbName: "Yazılım",
    icon: Code2,
  },

  oyun: {
    title: "Oyun",
    dbName: "Oyun",
    icon: Gamepad2,
  },

  "yapay-zeka": {
    title: "Yapay Zeka",
    dbName: "Yapay Zeka",
    icon: BrainCircuit,
  },

  mobil: {
    title: "Mobil",
    dbName: "Mobil",
    icon: Smartphone,
  },
};

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

function parseContent(content: any): ContentBlock[] {
  if (!content) return [];

  if (Array.isArray(content)) {
    return content;
  }

  if (typeof content === "string") {
    try {
      const parsed = JSON.parse(content);

      if (Array.isArray(parsed)) {
        return parsed;
      }

      return [
        {
          type: "paragraph",
          value: content,
        },
      ];
    } catch {
      return [
        {
          type: "paragraph",
          value: content,
        },
      ];
    }
  }

  return [];
}

function ContentRenderer({ content }: { content: any }) {
  const blocks = parseContent(content);

  if (blocks.length === 0) {
    return (
      <p className="text-zinc-500 text-sm">
        Bu haber için içerik eklenmemiş.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {blocks.map((block, index) => {
        if (block.type === "paragraph") {
          return (
            <p
              key={index}
              className="text-[15px] md:text-base leading-8 text-zinc-300"
            >
              {block.value}
            </p>
          );
        }

        if (
          block.type === "heading" ||
          block.type === "title" ||
          block.type === "baslik"
        ) {
          return (
            <h2
              key={index}
              className="text-2xl md:text-3xl font-black text-white mt-3"
            >
              {block.value}
            </h2>
          );
        }

        if (
          block.type === "subheading" ||
          block.type === "subtitle" ||
          block.type === "alt-baslik"
        ) {
          return (
            <h3
              key={index}
              className="text-xl md:text-2xl font-black text-white mt-2"
            >
              {block.value}
            </h3>
          );
        }

        if (block.type === "image") {
          const imageSource =
            block.url || block.src || block.value || "";

          if (!imageSource) return null;

          return (
            <figure key={index} className="my-3">
              <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
                <img
                  src={imageSource}
                  alt={block.caption || "Haber görseli"}
                  className="w-full h-auto object-cover"
                />
              </div>

              {block.caption && (
                <figcaption className="text-xs text-zinc-600 mt-2">
                  {block.caption}
                </figcaption>
              )}
            </figure>
          );
        }

        if (block.type === "list") {
          if (Array.isArray(block.items)) {
            return (
              <ul
                key={index}
                className="list-disc pl-6 space-y-2 text-zinc-300 leading-7"
              >
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ul>
            );
          }

          if (block.value) {
            return (
              <ul
                key={index}
                className="list-disc pl-6 text-zinc-300 leading-7"
              >
                <li>{block.value}</li>
              </ul>
            );
          }
        }

        return block.value ? (
          <p
            key={index}
            className="text-[15px] md:text-base leading-8 text-zinc-300"
          >
            {block.value}
          </p>
        ) : null;
      })}
    </div>
  );
}

type NewsDetailClientProps = {
  categorySlug: string;
  newsSlug: string;
};

export default function NewsDetailClient({
  categorySlug,
  newsSlug,
}: NewsDetailClientProps) {
  const normalizedCategorySlug = decodeURIComponent(categorySlug)
    .toLocaleLowerCase("tr-TR")
    .trim();

  const normalizedNewsSlug = decodeURIComponent(newsSlug).trim();

  const categoryInfo = categoryMap[normalizedCategorySlug];

  const [news, setNews] = useState<NewsItem | null>(null);

  const [otherNews, setOtherNews] = useState<NewsItem[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categoryInfo || !normalizedNewsSlug) {
      setLoading(false);
      return;
    }

    loadNews();
  }, [normalizedCategorySlug, normalizedNewsSlug]);

  const loadNews = async () => {
    if (!categoryInfo) return;

    setLoading(true);

    /*
      ANA HABER
    */

    const { data, error } = await supabase
      .from("news")
      .select("*")
      .eq("slug", normalizedNewsSlug)
      .eq("published", true)
      .maybeSingle();

    if (error) {
      console.error(
        "Haber yüklenirken hata:",
        error
      );

      setNews(null);
      setLoading(false);

      return;
    }

    if (!data) {
      setNews(null);
      setLoading(false);

      return;
    }

    setNews(data as NewsItem);

    /*
      AYNI KATEGORİDEN DİĞER HABERLER
    */

    const actualCategory =
      String(data.category || categoryInfo.dbName).trim();

    const { data: otherData, error: otherError } =
      await supabase
        .from("news")
        .select(
          "id,title,slug,excerpt,image_url,category,published,featured,created_at"
        )
        .ilike("category", actualCategory)
        .eq("published", true)
        .neq("id", data.id)
        .limit(10);

    if (otherError) {
      console.error(
        "Diğer haberler yüklenemedi:",
        otherError
      );

      setOtherNews([]);
    } else {
      const shuffled = [
        ...(otherData || []),
      ].sort(() => Math.random() - 0.5);

      setOtherNews(
        shuffled.slice(0, 2) as NewsItem[]
      );
    }

    setLoading(false);
  };

  const formattedDate = useMemo(() => {
    if (!news?.created_at) return "";

    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(
      new Date(news.created_at)
    );
  }, [news]);

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white">
        <div className="max-w-[950px] mx-auto px-5 py-14">
          <div className="min-h-[320px] rounded-3xl border border-zinc-800 bg-zinc-900/50 flex items-center justify-center">
            <span className="text-sm text-zinc-600">
              Haber yükleniyor...
            </span>
          </div>
        </div>
      </main>
    );
  }

  if (!categoryInfo) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white">
        <div className="max-w-[950px] mx-auto px-5 py-14">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-cyan-400"
          >
            <ArrowLeft size={14} />
            Haber kategorilerine dön
          </Link>

          <div className="mt-8 min-h-[320px] rounded-3xl border border-zinc-800 bg-zinc-900/50 flex flex-col items-center justify-center">
            <Newspaper
              size={42}
              className="text-zinc-800 mb-4"
            />

            <h1 className="text-xl font-black">
              Kategori bulunamadı
            </h1>
          </div>
        </div>
      </main>
    );
  }

  if (!news) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white">
        <div className="max-w-[950px] mx-auto px-5 py-14">
          <Link
            href={`/news/${normalizedCategorySlug}`}
            className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-cyan-400"
          >
            <ArrowLeft size={14} />
            {categoryInfo.title} Haberlerine Dön
          </Link>

          <div className="mt-8 min-h-[320px] rounded-3xl border border-zinc-800 bg-zinc-900/50 flex flex-col items-center justify-center">
            <Newspaper
              size={42}
              className="text-zinc-800 mb-4"
            />

            <h1 className="text-xl font-black">
              Haber bulunamadı
            </h1>

            <p className="text-sm text-zinc-600 mt-2">
              Haber silinmiş, yayından kaldırılmış
              veya adresi değişmiş olabilir.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const CategoryIcon =
    categoryInfo.icon;

  const actualCategorySlug =
    categoryToSlug(
      news.category || categoryInfo.dbName
    );

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <article className="max-w-[950px] mx-auto px-5 md:px-6 py-10 md:py-14">
        {/* GERİ DÖN */}

        <Link
          href={`/news/${actualCategorySlug}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-cyan-400 transition-colors mb-8"
        >
          <ArrowLeft size={14} />

          {categoryInfo.title} Haberlerine Dön
        </Link>

        {/* ÜST BİLGİLER */}

        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl border border-cyan-500/20 bg-cyan-500/10 flex items-center justify-center">
            <CategoryIcon
              size={20}
              className="text-cyan-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-black text-cyan-400">
              <Tag size={13} />

              {news.category}
            </span>

            <span className="inline-flex items-center gap-1.5 text-xs text-zinc-600">
              <CalendarDays size={13} />

              {formattedDate}
            </span>

            {news.featured && (
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[9px] font-black text-amber-400">
                MANŞET
              </span>
            )}
          </div>
        </div>

        {/* BAŞLIK */}

        <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
          {news.title}
        </h1>

        {/* KISA AÇIKLAMA */}

        {news.excerpt && (
          <p className="text-base md:text-lg text-zinc-400 leading-8 mt-5">
            {news.excerpt}
          </p>
        )}

        {/* KAPAK */}

        <div className="mt-8 rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-900 min-h-[300px]">
          {news.image_url ? (
            <img
              src={news.image_url}
              alt={news.title}
              className="w-full max-h-[600px] object-cover"
            />
          ) : (
            <div className="min-h-[400px] flex items-center justify-center">
              <ImageIcon
                size={55}
                className="text-zinc-800"
              />
            </div>
          )}
        </div>

        {/* HABER İÇERİĞİ */}

        <div className="border-t border-zinc-800 mt-9 pt-9">
          <ContentRenderer
            content={news.content}
          />
        </div>

        {/* DİĞER HABERLER */}

        {otherNews.length > 0 && (
          <section className="border-t border-zinc-800 mt-12 pt-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] font-black tracking-[0.18em] text-cyan-400 uppercase">
                  DEVAMINI KEŞFET
                </p>

                <h2 className="text-2xl font-black mt-1">
                  Diğer {categoryInfo.title} Haberleri
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {otherNews.map((item) => (
                <Link
                  key={item.id}
                  href={`/news/${categoryToSlug(item.category)}/${item.slug}`}
                  className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:border-cyan-500/30 transition-all"
                >
                  <div className="aspect-[16/9] bg-zinc-900">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon
                          size={35}
                          className="text-zinc-800"
                        />
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-2 text-[9px] text-zinc-600 mb-3">
                      <Tag
                        size={10}
                        className="text-cyan-400"
                      />

                      <span className="text-cyan-400 font-black">
                        {item.category}
                      </span>

                      <span>•</span>

                      <span>
                        {new Intl.DateTimeFormat(
                          "tr-TR",
                          {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          }
                        ).format(
                          new Date(
                            item.created_at
                          )
                        )}
                      </span>
                    </div>

                    <h3 className="text-lg font-black group-hover:text-cyan-400 transition-colors">
                      {item.title}
                    </h3>

                    {item.excerpt && (
                      <p className="text-xs text-zinc-500 leading-6 mt-3 line-clamp-2">
                        {item.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ALT GERİ DÖN */}

        <div className="border-t border-zinc-800 mt-10 pt-7">
          <Link
            href={`/news/${actualCategorySlug}`}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-xs font-black transition-all"
          >
            <ArrowLeft size={14} />

            Diğer {categoryInfo.title} Haberleri
          </Link>
        </div>
      </article>
    </main>
  );
}