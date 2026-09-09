"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BrainCircuit,
  Cpu,
  Gamepad2,
  Image as ImageIcon,
  Newspaper,
  Smartphone,
  Code2,
  Tag,
  CalendarDays,
} from "lucide-react";

import { supabase } from "../../lib/supabase";

type NewsItem = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  image_url: string | null;
  category: string;
  published: boolean;
  featured?: boolean;
  created_at: string;
};

type CategoryInfo = {
  title: string;
  dbName: string;
  description: string;
  icon: any;
};

const categoryMap: Record<string, CategoryInfo> = {
  genel: {
    title: "Genel Haberler",
    dbName: "Genel",
    description:
      "Teknoloji dünyasından genel gelişmeler, duyurular ve güncel haberler.",
    icon: Newspaper,
  },

  donanim: {
    title: "Donanım Haberleri",
    dbName: "Donanım",
    description:
      "İşlemci, ekran kartı, anakart, bellek ve diğer donanım gelişmeleri.",
    icon: Cpu,
  },

  yazilim: {
    title: "Yazılım Haberleri",
    dbName: "Yazılım",
    description:
      "İşletim sistemleri, uygulamalar, geliştirici araçları ve yazılım dünyası.",
    icon: Code2,
  },

  oyun: {
    title: "Oyun Haberleri",
    dbName: "Oyun",
    description:
      "PC ve konsol oyunları, güncellemeler, performans ve oyun dünyası.",
    icon: Gamepad2,
  },

  "yapay-zeka": {
    title: "Yapay Zeka Haberleri",
    dbName: "Yapay Zeka",
    description:
      "Yapay zeka modelleri, araçlar, gelişmeler ve yeni teknolojiler.",
    icon: BrainCircuit,
  },

  mobil: {
    title: "Mobil Haberler",
    dbName: "Mobil",
    description:
      "Akıllı telefonlar, tabletler, mobil işletim sistemleri ve mobil teknoloji haberleri.",
    icon: Smartphone,
  },
};

export default function NewsCategoryPage() {
  const params = useParams();

  const categorySlug =
    typeof params.category === "string" ? params.category : "";

  const categoryInfo = categoryMap[categorySlug];

  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categoryInfo) {
      setLoading(false);
      return;
    }

    loadNews();
  }, [categorySlug]);

  const loadNews = async () => {
    if (!categoryInfo) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("news")
      .select(
        "id,title,slug,excerpt,image_url,category,published,featured,created_at"
      )
      .eq("category", categoryInfo.dbName)
      .eq("published", true)
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Kategori haberleri yüklenemedi:", error);
      setNews([]);
      setLoading(false);
      return;
    }

    setNews((data || []) as NewsItem[]);
    setLoading(false);
  };

  const featuredNews = useMemo(() => {
    return news.find((item) => item.featured);
  }, [news]);

  const normalNews = useMemo(() => {
    if (!featuredNews) return news;

    return news.filter((item) => item.id !== featuredNews.id);
  }, [news, featuredNews]);

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  };

  if (!categoryInfo) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white">
        <div className="max-w-[1100px] mx-auto px-5 md:px-6 py-14">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-cyan-400"
          >
            <ArrowLeft size={14} />
            Haber kategorilerine dön
          </Link>

          <div className="mt-10 min-h-[260px] rounded-3xl border border-zinc-800 bg-zinc-900/50 flex flex-col items-center justify-center">
            <Newspaper size={40} className="text-zinc-800 mb-4" />

            <h1 className="text-xl font-black">
              Kategori bulunamadı
            </h1>
          </div>
        </div>
      </main>
    );
  }

  const CategoryIcon = categoryInfo.icon;

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-[1100px] mx-auto px-5 md:px-6 py-10 md:py-14">
        <Link
          href="/news"
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-cyan-400 mb-8"
        >
          <ArrowLeft size={14} />
          Haber Kategorilerine Dön
        </Link>

        <div className="mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <CategoryIcon
                size={22}
                className="text-cyan-400"
              />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-400">
                HABERLER
              </p>

              <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                {categoryInfo.title}
              </h1>
            </div>
          </div>

          <p className="text-sm text-zinc-500 mt-3">
            {categoryInfo.description}
          </p>
        </div>

        {loading ? (
          <div className="min-h-[250px] rounded-3xl border border-zinc-800 bg-zinc-900/40 flex items-center justify-center">
            <span className="text-sm text-zinc-600">
              Haberler yükleniyor...
            </span>
          </div>
        ) : news.length === 0 ? (
          <div className="min-h-[250px] rounded-3xl border border-zinc-800 bg-zinc-900/40 flex flex-col items-center justify-center">
            <Newspaper size={38} className="text-zinc-800 mb-4" />

            <p className="text-sm font-black text-zinc-400">
              Bu kategoride henüz yayınlanmış haber yok.
            </p>
          </div>
        ) : (
          <>
            {featuredNews && (
              <Link
                href={`/news/${categorySlug}/${featuredNews.slug}`}
                className="group block mb-8 rounded-3xl overflow-hidden border border-cyan-500/30 bg-zinc-900/50 hover:border-cyan-400/50 transition-all"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12">
                  <div className="lg:col-span-7 aspect-[16/8] lg:aspect-auto min-h-[330px] bg-zinc-900">
                    {featuredNews.image_url ? (
                      <img
                        src={featuredNews.image_url}
                        alt={featuredNews.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon
                          size={46}
                          className="text-zinc-800"
                        />
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-5 p-7 md:p-9 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-cyan-400">
                        <Tag size={12} />
                        {featuredNews.category}
                      </span>

                      <span className="inline-flex items-center gap-1.5 text-[10px] text-zinc-600">
                        <CalendarDays size={12} />
                        {formatDate(featuredNews.created_at)}
                      </span>
                    </div>

                    <span className="inline-flex self-start mb-3 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[9px] font-black text-amber-400">
                      MANŞET HABER
                    </span>

                    <h2 className="text-2xl md:text-3xl font-black leading-tight group-hover:text-cyan-400 transition-colors">
                      {featuredNews.title}
                    </h2>

                    <p className="text-sm text-zinc-500 leading-6 mt-4 line-clamp-4">
                      {featuredNews.excerpt ||
                        "Bu haber için kısa açıklama eklenmemiş."}
                    </p>
                  </div>
                </div>
              </Link>
            )}

            {normalNews.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {normalNews.map((item) => (
                  <Link
                    key={item.id}
                    href={`/news/${categorySlug}/${item.slug}`}
                    className="group rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-900/50 hover:border-cyan-500/30 transition-all"
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
                            size={40}
                            className="text-zinc-800"
                          />
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="inline-flex items-center gap-1 text-[9px] font-black text-cyan-400">
                          <Tag size={10} />
                          {item.category}
                        </span>

                        <span className="inline-flex items-center gap-1 text-[9px] text-zinc-600">
                          <CalendarDays size={10} />
                          {formatDate(item.created_at)}
                        </span>
                      </div>

                      <h2 className="text-lg font-black leading-snug group-hover:text-cyan-400 transition-colors">
                        {item.title}
                      </h2>

                      <p className="text-xs text-zinc-500 leading-6 mt-3 line-clamp-3">
                        {item.excerpt ||
                          "Bu haber için kısa açıklama eklenmemiş."}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}