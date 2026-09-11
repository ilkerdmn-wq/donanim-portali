import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Search,
  Star,
} from "lucide-react";

export const dynamic = "force-dynamic";

type GuideRow = {
  id: number;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  cover_image_url: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
};

const SITE_URL =
  "https://donanimportali.com";

export const metadata: Metadata = {
  title:
    "Donanım Rehberleri",

  description:
    "PSU, ekran kartı, işlemci, darboğaz, FPS, uyumluluk ve PC toplama konularında güncel Donanım Portalı rehberleri.",

  alternates: {
    canonical:
      `${SITE_URL}/rehber`,
  },

  openGraph: {
    type:
      "website",

    locale:
      "tr_TR",

    url:
      `${SITE_URL}/rehber`,

    siteName:
      "Donanım Portalı",

    title:
      "Donanım Rehberleri",

    description:
      "Bilgisayar donanımı ve PC toplama hakkında pratik, teknik ve kullanıcı odaklı rehberler.",
  },

  twitter: {
    card:
      "summary_large_image",

    title:
      "Donanım Rehberleri",

    description:
      "Bilgisayar donanımı ve PC toplama hakkında pratik, teknik ve kullanıcı odaklı rehberler.",
  },
};

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

  const url =
    new URL(
      `${supabaseUrl}/rest/v1/guides`
    );

  url.searchParams.set(
    "select",
    "id,title,slug,category,excerpt,cover_image_url,featured,created_at,updated_at"
  );

  url.searchParams.set(
    "published",
    "eq.true"
  );

  url.searchParams.set(
    "order",
    "featured.desc,updated_at.desc"
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

          cache:
            "no-store",
        }
      );

    if (
      !response.ok
    ) {
      console.error(
        "Rehberler alınamadı:",
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
      "Rehber listeleme hatası:",
      error
    );

    return [];
  }
}

export default async function GuidesPage() {
  const guides =
    await getPublishedGuides();

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 md:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-[10px] font-black tracking-[0.16em] text-cyan-400 uppercase">
            <BookOpen size={14} />
            DONANIM REHBERLERİ
          </div>

          <h1 className="mt-5 text-3xl md:text-5xl font-black tracking-tight text-white">
            Doğru parçayı daha bilinçli seç.
          </h1>

          <p className="mt-4 max-w-3xl text-sm md:text-base leading-7 text-zinc-400">
            PSU seçimi, işlemci-ekran kartı dengesi,
            uyumluluk, FPS ve bütçeye göre sistem toplama
            gibi konularda kısa cevapla başlayan,
            detaylı rehberler.
          </p>
        </section>

        <section className="mt-8">
          <div className="flex items-end justify-between gap-4 mb-5">
            <div>
              <p className="text-[10px] font-black tracking-[0.14em] text-cyan-400 uppercase">
                YAYINDAKİ REHBERLER
              </p>

              <h2 className="mt-1 text-2xl font-black text-white">
                Güncel içerikler
              </h2>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-600">
              <Search size={14} />
              {guides.length} rehber
            </div>
          </div>

          {guides.length === 0 ? (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-10 text-center">
              <BookOpen
                size={32}
                className="mx-auto text-zinc-700"
              />

              <p className="mt-4 text-sm font-bold text-zinc-400">
                Henüz yayınlanmış rehber bulunmuyor.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
              {guides.map(
                (guide) => (
                  <Link
                    key={guide.id}
                    href={`/rehber/${guide.slug}`}
                    className="group overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/40 hover:border-cyan-500/30 hover:bg-zinc-900/60 transition-all"
                  >
                    {guide.cover_image_url && (
                      <div className="aspect-[16/9] overflow-hidden border-b border-zinc-800 bg-zinc-900">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            guide.cover_image_url
                          }
                          alt={
                            guide.title
                          }
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        />
                      </div>
                    )}

                    <div className="p-5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[10px] font-black tracking-wider text-cyan-400 uppercase">
                          {guide.category ||
                            "Genel"}
                        </span>

                        {guide.featured && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black text-amber-400">
                            <Star
                              size={12}
                              className="fill-amber-400"
                            />
                            ÖNE ÇIKAN
                          </span>
                        )}
                      </div>

                      <h3 className="mt-4 text-lg font-black leading-snug text-white">
                        {guide.title}
                      </h3>

                      <p className="mt-3 text-sm leading-6 text-zinc-500 line-clamp-3">
                        {guide.excerpt}
                      </p>

                      <div className="mt-5 inline-flex items-center gap-2 text-xs font-black text-cyan-400">
                        Rehberi Oku

                        <ArrowRight
                          size={14}
                          className="group-hover:translate-x-1 transition-transform"
                        />
                      </div>
                    </div>
                  </Link>
                )
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
