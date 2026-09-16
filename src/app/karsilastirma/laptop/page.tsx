import type { Metadata } from "next";

import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  Laptop,
  Scale,
} from "lucide-react";

import {
  listComparisons,
} from "@/app/lib/manual-comparison-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Laptop Karşılaştırmaları | Donanım Portalı",

  description:
    "Donanım Portalı'nda incelediğimiz laptop modellerini teknik özelliklerine göre karşılaştırın.",

  alternates: {
    canonical:
      "https://donanimportali.com/karsilastirma/laptop",
  },
};

export default async function LaptopComparisonsPage() {
  const comparisons =
    await listComparisons();

  const publishedComparisons =
    comparisons.filter(
      (comparison) =>
        comparison.published
    );

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 sm:py-14">
        <Link
          href="/karsilastirma"
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 transition-colors hover:text-cyan-400"
        >
          <ArrowLeft size={16} />
          Karşılaştırma merkezine dön
        </Link>

        <div className="mt-7 max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-cyan-400 sm:text-sm">
            <Laptop size={16} />
            Laptop Karşılaştırmaları
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
            Laptop Karşılaştırmaları
          </h1>

          <p className="mt-4 text-sm leading-7 text-zinc-400 sm:text-base">
            İncelediğimiz laptop modellerini işlemci, grafik birimi, RAM,
            depolama, ekran, bağlantılar, batarya ve diğer teknik özellikleri
            üzerinden yan yana karşılaştırın.
          </p>
        </div>

        {publishedComparisons.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 sm:p-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
              <Scale size={24} />
            </div>

            <h2 className="mt-5 text-xl font-black text-white sm:text-2xl">
              Henüz laptop karşılaştırması eklenmedi
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              Yeni laptop karşılaştırmaları yayınlandığında bu sayfada kartlar
              halinde listelenecek. Her karşılaştırmanın kendi ayrı sayfası ve
              bağlantısı olacak.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-2">
            {publishedComparisons.map(
              (comparison) => (
                <Link
                  key={
                    comparison.slug
                  }
                  href={`/karsilastirma/laptop/${comparison.slug}`}
                  className="group overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/50 transition-all hover:border-cyan-500/30 hover:bg-zinc-900/70"
                >
                  <div
                    className="grid border-b border-zinc-800 bg-zinc-950/40"
                    style={{
                      gridTemplateColumns:
                        `repeat(${comparison.columns.length}, minmax(0, 1fr))`,
                    }}
                  >
                    {comparison.columns.map(
                      (
                        column,
                        index
                      ) => (
                        <div
                          key={
                            column.id
                          }
                          className={
                            index <
                            comparison
                              .columns
                              .length -
                              1
                              ? "border-r border-zinc-800 p-4"
                              : "p-4"
                          }
                        >
                          <div className="flex h-36 items-center justify-center overflow-hidden rounded-2xl border border-zinc-800 bg-white p-3 sm:h-44">
                            {column.imageUrl ? (
                              <img
                                src={
                                  column.imageUrl
                                }
                                alt={
                                  column.name
                                }
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              <span className="text-xs font-semibold text-zinc-400">
                                Görsel yok
                              </span>
                            )}
                          </div>

                          <p className="mt-3 line-clamp-2 text-center text-xs font-black leading-5 text-zinc-200 sm:text-sm">
                            {
                              column.name
                            }
                          </p>
                        </div>
                      )
                    )}
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-400">
                      <Scale
                        size={14}
                      />

                      Laptop Karşılaştırması
                    </div>

                    <h2 className="mt-3 text-xl font-black leading-7 text-white transition-colors group-hover:text-cyan-300">
                      {
                        comparison.title
                      }
                    </h2>

                    {comparison.summary && (
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-400">
                        {
                          comparison.summary
                        }
                      </p>
                    )}

                    <div className="mt-5 flex items-center gap-2 text-xs font-black text-cyan-400">
                      Karşılaştırmayı görüntüle

                      <ArrowRight
                        size={14}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </div>
                  </div>
                </Link>
              )
            )}
          </div>
        )}
      </section>
    </main>
  );
}