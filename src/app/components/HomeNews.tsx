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

const categorySlugs: Record<string, string> = {
  Genel: "genel",
  Donanım: "donanim",
  Yazılım: "yazilim",
  Oyun: "oyun",
  "Yapay Zeka": "yapay-zeka",
};

export default function HomeNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("news")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("ANA SAYFA HABER HATASI:", error);
      setLoading(false);
      return;
    }

    setNews((data || []) as NewsItem[]);
    setLoading(false);
  };

  const createSlug = (text: string) => {
    return text
      .toLowerCase()
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

    return categorySlugs[category] || "genel";
  };

  const getNewsUrl = (item: NewsItem) => {
    const categorySlug = getCategorySlug(item.category);

    const newsSlug =
      item.slug && item.slug.trim() !== ""
        ? item.slug
        : createSlug(item.title);

    return `/news/${categorySlug}/${newsSlug}`;
  };

  /*
    Önce featured=true olan haberi buluyoruz.

    Eğer hiç manşet seçilmediyse en yeni haber
    otomatik olarak manşet oluyor.
  */
  const featuredNews =
    news.find((item) => item.featured === true) || news[0];

  /*
    Manşette gösterilen haberi normal haber
    listesinden çıkartıyoruz.
  */
  const otherNews = featuredNews
    ? news.filter((item) => item.id !== featuredNews.id)
    : [];

  return (
    <section className="flex flex-col gap-4">

      {/* BÖLÜM BAŞLIĞI */}
      <div className="flex justify-between items-center px-1">

        <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">

          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />

          MASADAN YENİ NOTLAR

        </div>

        <Link
          href="/news"
          className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500 font-medium hover:text-cyan-400 transition-colors"
        >
          Tüm Akış ({news.length})

          <ArrowRight size={12} />
        </Link>

      </div>

      {/* YÜKLENİYOR */}
      {loading && (

        <div className="min-h-[180px] border border-zinc-800/60 rounded-2xl bg-zinc-900/20 flex items-center justify-center">

          <Loader2
            size={26}
            className="animate-spin text-cyan-400"
          />

        </div>

      )}

      {/* HABER YOK */}
      {!loading && news.length === 0 && (

        <div className="p-10 border border-zinc-800/60 rounded-2xl bg-zinc-900/20 flex items-center justify-center min-h-[120px]">

          <span className="text-xs text-zinc-600 font-medium">
            Henüz yayınlanmış haber bulunmuyor.
          </span>

        </div>

      )}

      {/* HABERLER */}
      {!loading && featuredNews && (

        <div className="flex flex-col gap-4">

          {/* =============================== */}
          {/* MANŞET HABER */}
          {/* =============================== */}

          <Link
            href={getNewsUrl(featuredNews)}
            className="group relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/60 hover:border-cyan-500/40 transition-all"
          >

            {/* MANŞET GÖRSELİ */}

            {featuredNews.image_url ? (

              <div className="relative h-[300px] md:h-[360px] overflow-hidden">

                <img
                  src={featuredNews.image_url}
                  alt={featuredNews.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.025] transition-transform duration-500"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                {/* MANŞET İÇERİĞİ */}

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

              /*
                Görsel yoksa yine büyük manşet alanı
                gösteriyoruz.
              */

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

          {/* =============================== */}
          {/* DİĞER HABERLER */}
          {/* HER HABER TEK SATIR */}
          {/* =============================== */}

          {otherNews.map((item) => (

            <Link
              key={item.id}
              href={getNewsUrl(item)}
              className="group flex items-center gap-5 rounded-2xl border border-zinc-800/70 bg-zinc-900/30 p-4 hover:border-cyan-500/30 hover:bg-zinc-900/60 transition-all"
            >

              {/* KÜÇÜK GÖRSEL */}

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

              {/* HABER BİLGİLERİ */}

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

              {/* SAĞ OK */}

              <div className="hidden sm:flex w-9 h-9 shrink-0 rounded-full border border-zinc-800 items-center justify-center group-hover:border-cyan-500/40 transition-colors">

                <ArrowRight
                  size={15}
                  className="text-zinc-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all"
                />

              </div>

            </Link>

          ))}

        </div>

      )}

    </section>
  );
}