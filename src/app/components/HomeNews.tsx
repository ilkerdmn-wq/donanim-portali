"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Newspaper,
  ArrowRight,
  CalendarDays,
  Tag,
  Loader2,
  Star,
  BookOpen,
} from "lucide-react";

import { supabase } from "../lib/supabase";

type NewsItem = {
  id: number;
  slug: string | null;
  title: string;
  excerpt: string | null;
  image_url: string | null;
  category: string | null;
  published: boolean;
  featured: boolean;
  created_at: string;
};

type GuideItem = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  category: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
};

const categorySlugs: Record<string, string> = {
  Genel: "genel",
  Donanım: "donanim",
  Yazılım: "yazilim",
  Oyun: "oyun",
  "Yapay Zeka": "yapay-zeka",
  Mobil: "mobil",
};

export default function HomeNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [guides, setGuides] = useState<GuideItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeContent();
  }, []);

  const loadHomeContent = async () => {
    setLoading(true);

    const [
      { data: newsData, error: newsError },
      { data: guideData, error: guideError },
    ] = await Promise.all([
      supabase
        .from("news")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false }),
      supabase
        .from("guides")
        .select(
          "id,title,slug,excerpt,cover_image_url,category,published,created_at,updated_at"
        )
        .eq("published", true)
        .order("updated_at", { ascending: false })
        .limit(2),
    ]);

    if (newsError) {
      console.error("ANA SAYFA HABER HATASI:", newsError);
    }

    if (guideError) {
      console.error("ANA SAYFA REHBER HATASI:", guideError);
    }

    setNews((newsData || []) as NewsItem[]);
    setGuides((guideData || []) as GuideItem[]);
    setLoading(false);
  };

  const createSlug = (text: string) => {
    return text
      .toLocaleLowerCase("tr-TR")
      .replace(/ç/g, "c")
      .replace(/ğ/g, "g")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ş/g, "s")
      .replace(/ü/g, "u")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  const getCategorySlug = (category: string | null) => {
    if (!category) {
      return "genel";
    }

    return categorySlugs[category] || createSlug(category) || "genel";
  };

  const getNewsUrl = (item: NewsItem) => {
    const categorySlug = getCategorySlug(item.category);

    const newsSlug =
      item.slug && item.slug.trim() !== ""
        ? item.slug
        : createSlug(item.title);

    return `/news/${categorySlug}/${newsSlug}`;
  };

  const featuredNews =
    news.find((item) => item.featured === true) || news[0];

  const otherNews = featuredNews
    ? news.filter((item) => item.id !== featuredNews.id).slice(0, 4)
    : [];

  return (
    <section className="flex flex-col gap-8">
      {loading && (
        <div className="min-h-[180px] border border-zinc-800/60 rounded-2xl bg-zinc-900/20 flex items-center justify-center">
          <Loader2
            size={26}
            className="animate-spin text-cyan-400"
          />
        </div>
      )}

      {!loading && news.length === 0 && (
        <div className="p-10 border border-zinc-800/60 rounded-2xl bg-zinc-900/20 flex items-center justify-center min-h-[120px]">
          <span className="text-xs text-zinc-600 font-medium">
            Henüz yayınlanmış haber bulunmuyor.
          </span>
        </div>
      )}

      {!loading && featuredNews && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center px-1">
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
              HABERLER
            </div>

            <span className="text-[11px] text-zinc-600 font-medium">
              Son 5 haber
            </span>
          </div>

          <Link
            href={getNewsUrl(featuredNews)}
            className="group relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/60 hover:border-cyan-500/40 transition-all"
          >
            {featuredNews.image_url ? (
              <div className="relative h-[300px] md:h-[360px] overflow-hidden">
                <img
                  src={featuredNews.image_url}
                  alt={featuredNews.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.025] transition-transform duration-500"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-7 md:p-8">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500 text-zinc-950 text-[10px] font-black uppercase tracking-wide">
                      <Star size={11} />
                      MANŞET
                    </span>

                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-cyan-300">
                      <Tag size={11} />
                      {featuredNews.category || "Genel"}
                    </span>

                    <span className="inline-flex items-center gap-1.5 text-[10px] text-zinc-400">
                      <CalendarDays size={11} />
                      {formatDate(featuredNews.created_at)}
                    </span>
                  </div>

                  <h2 className="max-w-3xl text-2xl md:text-4xl font-black text-white leading-tight group-hover:text-cyan-300 transition-colors">
                    {featuredNews.title}
                  </h2>

                  {featuredNews.excerpt && (
                    <p className="max-w-2xl mt-3 text-sm text-zinc-300 leading-6 line-clamp-2">
                      {featuredNews.excerpt}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="relative min-h-[270px] p-8 flex flex-col justify-end bg-gradient-to-br from-zinc-900 to-zinc-950">
                <Newspaper
                  size={70}
                  className="absolute right-8 top-8 text-zinc-800"
                />

                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500 text-zinc-950 text-[10px] font-black uppercase tracking-wide">
                    <Star size={11} />
                    MANŞET
                  </span>

                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-cyan-400">
                    <Tag size={11} />
                    {featuredNews.category || "Genel"}
                  </span>

                  <span className="inline-flex items-center gap-1.5 text-[10px] text-zinc-600">
                    <CalendarDays size={11} />
                    {formatDate(featuredNews.created_at)}
                  </span>
                </div>

                <h2 className="max-w-3xl text-2xl md:text-4xl font-black text-white leading-tight group-hover:text-cyan-400 transition-colors">
                  {featuredNews.title}
                </h2>

                <p className="max-w-2xl mt-3 text-sm text-zinc-500 leading-6 line-clamp-2">
                  {featuredNews.excerpt ||
                    "Bu haber için kısa açıklama eklenmemiş."}
                </p>
              </div>
            )}
          </Link>

          {otherNews.map((item) => (
            <Link
              key={item.id}
              href={getNewsUrl(item)}
              className="group flex items-center gap-5 rounded-2xl border border-zinc-800/70 bg-zinc-900/30 p-4 hover:border-cyan-500/30 hover:bg-zinc-900/60 transition-all"
            >
              {item.image_url ? (
                <div className="w-[150px] h-[95px] shrink-0 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="w-[150px] h-[95px] shrink-0 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                  <Newspaper
                    size={30}
                    className="text-zinc-800"
                  />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-cyan-400">
                    <Tag size={10} />
                    {item.category || "Genel"}
                  </span>

                  <span className="inline-flex items-center gap-1.5 text-[10px] text-zinc-600">
                    <CalendarDays size={10} />
                    {formatDate(item.created_at)}
                  </span>
                </div>

                <h3 className="text-base md:text-lg font-black text-white leading-tight group-hover:text-cyan-400 transition-colors">
                  {item.title}
                </h3>

                <p className="text-[11px] md:text-xs text-zinc-500 leading-5 mt-2 line-clamp-2">
                  {item.excerpt ||
                    "Bu haber için kısa açıklama eklenmemiş."}
                </p>
              </div>

              <div className="hidden sm:flex w-9 h-9 shrink-0 rounded-full border border-zinc-800 items-center justify-center group-hover:border-cyan-500/40 transition-colors">
                <ArrowRight
                  size={15}
                  className="text-zinc-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all"
                />
              </div>
            </Link>
          ))}

          <div className="flex justify-end pt-1">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-xs font-black text-zinc-200 hover:border-cyan-500/30 hover:text-cyan-400 transition-all"
            >
              Diğer Haberler
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {!loading && (
        <div className="flex flex-col gap-4 pt-1">
          <div className="flex justify-between items-center px-1">
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <BookOpen size={14} className="text-cyan-400" />
              REHBERLER
            </div>

            <span className="text-[11px] text-zinc-600 font-medium">
              Son 2 rehber
            </span>
          </div>

          {guides.length === 0 ? (
            <div className="p-8 border border-zinc-800/60 rounded-2xl bg-zinc-900/20 text-center">
              <span className="text-xs text-zinc-600">
                Henüz yayınlanmış rehber bulunmuyor.
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {guides.map((guide) => (
                <Link
                  key={guide.id}
                  href={`/rehber/${guide.slug}`}
                  className="group overflow-hidden rounded-2xl border border-zinc-800/70 bg-zinc-900/30 hover:border-cyan-500/30 hover:bg-zinc-900/60 transition-all"
                >
                  {guide.cover_image_url ? (
                    <div className="aspect-[16/9] overflow-hidden border-b border-zinc-800 bg-zinc-900">
                      <img
                        src={guide.cover_image_url}
                        alt={guide.title}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[16/9] border-b border-zinc-800 bg-zinc-950 flex items-center justify-center">
                      <BookOpen size={34} className="text-zinc-800" />
                    </div>
                  )}

                  <div className="p-5">
                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-wider">
                      {guide.category || "Genel"}
                    </span>

                    <h3 className="mt-3 text-lg font-black text-white leading-tight group-hover:text-cyan-400 transition-colors">
                      {guide.title}
                    </h3>

                    {guide.excerpt && (
                      <p className="mt-3 text-xs text-zinc-500 leading-6 line-clamp-2">
                        {guide.excerpt}
                      </p>
                    )}

                    <div className="mt-4 inline-flex items-center gap-2 text-xs font-black text-cyan-400">
                      Rehberi Oku
                      <ArrowRight
                        size={14}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-1">
            <Link
              href="/rehber"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-xs font-black text-zinc-200 hover:border-cyan-500/30 hover:text-cyan-400 transition-all"
            >
              Diğer Rehberler
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
