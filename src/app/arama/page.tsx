"use client";

import {
  FormEvent,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Cpu,
  Loader2,
  Newspaper,
  Search,
  Wrench,
} from "lucide-react";

import { supabase } from "../lib/supabase";

type NewsResult = {
  id: number;
  title: string;
  slug: string | null;
  excerpt: string | null;
  category: string | null;
  created_at: string;
};

type GuideResult = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  updated_at: string;
};

type HardwareResult = {
  id: number;
  name: string;
  slug: string | null;
  category: string;
  description: string | null;
};

const newsCategorySlugs: Record<string, string> = {
  Genel: "genel",
  Donanım: "donanim",
  Yazılım: "yazilim",
  Oyun: "oyun",
  "Yapay Zeka": "yapay-zeka",
  Mobil: "mobil",
};

function slugify(value: string) {
  return value
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

function hardwareCategoryUrl(category: string) {
  const map: Record<string, string> = {
    islemciler: "/donanim/islemciler",
    "ekran-kartlari": "/donanim/ekran-kartlari",
    anakartlar: "/donanim/anakartlar",
    bellekler: "/donanim/bellekler",
    "guc-kaynaklari": "/donanim/guc-kaynaklari",
    depolama: "/donanim/depolama",
  };

  return map[category] || "/donanim";
}

export default function SearchPage() {
  const [query, setQuery] =
    useState("");
  const [searchedQuery, setSearchedQuery] =
    useState("");
  const [news, setNews] =
    useState<NewsResult[]>([]);
  const [guides, setGuides] =
    useState<GuideResult[]>([]);
  const [hardware, setHardware] =
    useState<HardwareResult[]>([]);
  const [loading, setLoading] =
    useState(false);
  const [error, setError] =
    useState("");

  const totalResults =
    news.length +
    guides.length +
    hardware.length;

  const hasSearched =
    searchedQuery.length > 0;

  const safeSearchTerm =
    useMemo(
      () =>
        query
          .trim()
          .replace(/[%_,()]/g, " "),
      [query]
    );

  const handleSearch =
    async (
      event?: FormEvent
    ) => {
      event?.preventDefault();

      const term =
        safeSearchTerm.trim();

      if (term.length < 2) {
        setError(
          "Arama için en az 2 karakter yazın."
        );
        return;
      }

      setLoading(true);
      setError("");
      setSearchedQuery(term);

      try {
        const pattern =
          `%${term}%`;

        const [
          newsResponse,
          guideResponse,
          hardwareResponse,
        ] = await Promise.all([
          supabase
            .from("news")
            .select(
              "id,title,slug,excerpt,category,created_at"
            )
            .eq("published", true)
            .or(
              `title.ilike.${pattern},excerpt.ilike.${pattern}`
            )
            .order(
              "created_at",
              { ascending: false }
            )
            .limit(10),

          supabase
            .from("guides")
            .select(
              "id,title,slug,excerpt,category,updated_at"
            )
            .eq("published", true)
            .or(
              `title.ilike.${pattern},excerpt.ilike.${pattern},content.ilike.${pattern}`
            )
            .order(
              "updated_at",
              { ascending: false }
            )
            .limit(10),

          supabase
            .from("hardware_items")
            .select(
              "id,name,slug,category,description"
            )
            .or(
              `name.ilike.${pattern},description.ilike.${pattern}`
            )
            .order(
              "name",
              { ascending: true }
            )
            .limit(12),
        ]);

        if (
          newsResponse.error
        ) {
          console.error(
            "Arama haber hatası:",
            newsResponse.error
          );
        }

        if (
          guideResponse.error
        ) {
          console.error(
            "Arama rehber hatası:",
            guideResponse.error
          );
        }

        if (
          hardwareResponse.error
        ) {
          console.error(
            "Arama donanım hatası:",
            hardwareResponse.error
          );
        }

        setNews(
          (newsResponse.data ||
            []) as NewsResult[]
        );

        setGuides(
          (guideResponse.data ||
            []) as GuideResult[]
        );

        setHardware(
          (hardwareResponse.data ||
            []) as HardwareResult[]
        );
      } catch (
        searchError
      ) {
        console.error(
          "Arama hatası:",
          searchError
        );

        setError(
          "Arama sırasında bir sorun oluştu."
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 md:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-[10px] font-black tracking-[0.16em] text-cyan-400 uppercase">
            <Search size={14} />
            SİTE İÇİ ARAMA
          </div>

          <h1 className="mt-5 text-3xl md:text-5xl font-black tracking-tight text-white">
            Aradığını tek yerden bul.
          </h1>

          <p className="mt-4 max-w-2xl text-sm md:text-base leading-7 text-zinc-400">
            Haberlerde, rehberlerde ve donanım kayıtlarında aynı anda arama yap.
          </p>

          <form
            onSubmit={
              handleSearch
            }
            className="mt-7 flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
              />

              <input
                type="search"
                value={query}
                onChange={(
                  event
                ) =>
                  setQuery(
                    event.target.value
                  )
                }
                placeholder="Örn. RTX 5070, DDR5, Windows 11..."
                autoFocus
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 py-4 pl-12 pr-4 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-cyan-500/40"
              />
            </div>

            <button
              type="submit"
              disabled={
                loading
              }
              className="inline-flex min-w-32 items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-4 text-sm font-black text-zinc-950 hover:bg-cyan-300 disabled:opacity-50 transition"
            >
              {loading ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Search
                  size={17}
                />
              )}
              Ara
            </button>
          </form>

          {error && (
            <p className="mt-3 text-xs font-bold text-red-400">
              {error}
            </p>
          )}
        </section>

        {hasSearched &&
          !loading && (
            <div className="mt-8">
              <div className="flex items-end justify-between gap-4 mb-5">
                <div>
                  <p className="text-[10px] font-black tracking-[0.14em] text-cyan-400 uppercase">
                    ARAMA SONUÇLARI
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-white">
                    “{searchedQuery}”
                  </h2>
                </div>

                <span className="text-xs text-zinc-600">
                  {totalResults} sonuç
                </span>
              </div>

              {totalResults ===
              0 ? (
                <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-10 text-center">
                  <Search
                    size={32}
                    className="mx-auto text-zinc-700"
                  />
                  <p className="mt-4 text-sm font-black text-zinc-300">
                    Sonuç bulunamadı.
                  </p>
                  <p className="mt-2 text-xs text-zinc-600">
                    Daha kısa veya farklı bir kelime deneyin.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {news.length >
                    0 && (
                    <ResultSection
                      icon={
                        Newspaper
                      }
                      title="Haberler"
                    >
                      {news.map(
                        (item) => {
                          const category =
                            newsCategorySlugs[
                              item.category ||
                                ""
                            ] ||
                            slugify(
                              item.category ||
                                "Genel"
                            ) ||
                            "genel";

                          const slug =
                            item.slug ||
                            slugify(
                              item.title
                            );

                          return (
                            <ResultCard
                              key={`news-${item.id}`}
                              href={`/news/${category}/${slug}`}
                              eyebrow={
                                item.category ||
                                "Genel"
                              }
                              title={
                                item.title
                              }
                              description={
                                item.excerpt
                              }
                            />
                          );
                        }
                      )}
                    </ResultSection>
                  )}

                  {guides.length >
                    0 && (
                    <ResultSection
                      icon={
                        BookOpen
                      }
                      title="Rehberler"
                    >
                      {guides.map(
                        (item) => (
                          <ResultCard
                            key={`guide-${item.id}`}
                            href={`/rehber/${item.slug}`}
                            eyebrow={
                              item.category ||
                              "Rehber"
                            }
                            title={
                              item.title
                            }
                            description={
                              item.excerpt
                            }
                          />
                        )
                      )}
                    </ResultSection>
                  )}

                  {hardware.length >
                    0 && (
                    <ResultSection
                      icon={Cpu}
                      title="Donanım"
                    >
                      {hardware.map(
                        (item) => (
                          <ResultCard
                            key={`hardware-${item.id}`}
                            href={
                              hardwareCategoryUrl(
                                item.category
                              )
                            }
                            eyebrow="Donanım"
                            title={
                              item.name
                            }
                            description={
                              item.description ||
                              "Bu ürünün bulunduğu donanım listesine git."
                            }
                          />
                        )
                      )}
                    </ResultSection>
                  )}
                </div>
              )}
            </div>
          )}

        {!hasSearched &&
          !loading && (
            <div className="mt-8 grid sm:grid-cols-3 gap-4">
              {[
                {
                  href: "/news",
                  icon:
                    Newspaper,
                  title:
                    "Haberlerde Ara",
                  text:
                    "Yayınlanmış haber başlıkları ve açıklamaları.",
                },
                {
                  href: "/rehber",
                  icon:
                    BookOpen,
                  title:
                    "Rehberlerde Ara",
                  text:
                    "Teknik rehberler ve karar içerikleri.",
                },
                {
                  href: "/donanim",
                  icon: Wrench,
                  title:
                    "Donanımda Ara",
                  text:
                    "İşlemci, ekran kartı ve diğer bileşenler.",
                },
              ].map(
                (item) => {
                  const Icon =
                    item.icon;

                  return (
                    <Link
                      key={
                        item.href
                      }
                      href={
                        item.href
                      }
                      className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5 hover:border-cyan-500/30 hover:bg-zinc-900/60 transition"
                    >
                      <Icon
                        size={18}
                        className="text-cyan-400"
                      />
                      <p className="mt-3 text-sm font-black text-white">
                        {
                          item.title
                        }
                      </p>
                      <p className="mt-2 text-xs leading-5 text-zinc-600">
                        {
                          item.text
                        }
                      </p>
                    </Link>
                  );
                }
              )}
            </div>
          )}
      </div>
    </main>
  );
}

function ResultSection({
  icon: Icon,
  title,
  children,
}: {
  icon: any;
  title: string;
  children:
    React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
      <div className="flex items-center gap-2 border-b border-zinc-800 px-5 py-4">
        <Icon
          size={16}
          className="text-cyan-400"
        />
        <h3 className="text-sm font-black text-white">
          {title}
        </h3>
      </div>

      <div className="divide-y divide-zinc-800">
        {children}
      </div>
    </section>
  );
}

function ResultCard({
  href,
  eyebrow,
  title,
  description,
}: {
  href: string;
  eyebrow: string;
  title: string;
  description:
    | string
    | null;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 p-5 hover:bg-zinc-900/70 transition"
    >
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-black uppercase tracking-wider text-cyan-400">
          {eyebrow}
        </p>

        <h4 className="mt-1.5 text-sm md:text-base font-black text-white group-hover:text-cyan-300 transition">
          {title}
        </h4>

        {description && (
          <p className="mt-2 text-xs leading-5 text-zinc-600 line-clamp-2">
            {description}
          </p>
        )}
      </div>

      <ArrowRight
        size={16}
        className="shrink-0 text-zinc-700 group-hover:text-cyan-400 group-hover:translate-x-1 transition"
      />
    </Link>
  );
}
