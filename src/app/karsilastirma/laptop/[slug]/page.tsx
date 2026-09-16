import type { Metadata } from "next";

import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  Scale,
} from "lucide-react";

import {
  notFound,
} from "next/navigation";

import {
  readComparisonBySlug,
} from "@/app/lib/manual-comparison-server";

const SITE_URL =
  "https://donanimportali.com";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } =
    await params;

  const comparison =
    await readComparisonBySlug(
      slug
    );

  if (
    !comparison ||
    !comparison.published
  ) {
    return {
      title:
        "Karşılaştırma Bulunamadı | Donanım Portalı",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description =
    comparison.summary ||
    `${comparison.columns
      .map(
        (column) =>
          column.name
      )
      .filter(Boolean)
      .join(
        " ve "
      )} modellerini teknik özellikleriyle karşılaştırın.`;

  return {
    title:
      `${comparison.title} | Donanım Portalı`,

    description,

    alternates: {
      canonical:
        `${SITE_URL}/karsilastirma/laptop/${comparison.slug}`,
    },

    openGraph: {
      title:
        comparison.title,

      description,

      url:
        `${SITE_URL}/karsilastirma/laptop/${comparison.slug}`,

      siteName:
        "Donanım Portalı",

      type:
        "article",

      images:
        comparison.columns
          .filter(
            (column) =>
              Boolean(
                column.imageUrl
              )
          )
          .slice(0, 1)
          .map(
            (column) => ({
              url:
                column.imageUrl,
              alt:
                column.name,
            })
          ),
    },
  };
}

export default async function LaptopComparisonDetailPage({
  params,
}: PageProps) {
  const { slug } =
    await params;

  const comparison =
    await readComparisonBySlug(
      slug
    );

  if (
    !comparison ||
    !comparison.published
  ) {
    notFound();
  }

  const visibleRows =
    comparison.rows.filter(
      (row) =>
        row.label.trim() &&
        comparison.columns.some(
          (column) =>
            row.cells[
              column.id
            ]?.value?.trim()
        )
    );

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 md:py-14">
        <Link
          href="/karsilastirma/laptop"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 transition-colors hover:text-cyan-400"
        >
          <ArrowLeft
            size={15}
          />

          Laptop karşılaştırmalarına dön
        </Link>

        <header className="mt-7">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-400">
            <Scale
              size={15}
            />

            LAPTOP KARŞILAŞTIRMASI
          </div>

          <h1 className="mt-4 max-w-5xl text-3xl font-black leading-tight tracking-tight text-white md:text-5xl">
            {comparison.title}
          </h1>

          {comparison.summary && (
            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400 md:text-base">
              {
                comparison.summary
              }
            </p>
          )}
        </header>

        <section className="mt-8 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/40">
          <div
            className="grid"
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
                <article
                  key={
                    column.id
                  }
                  className={
                    index <
                    comparison
                      .columns
                      .length -
                      1
                      ? "border-r border-zinc-800 p-4 sm:p-6"
                      : "p-4 sm:p-6"
                  }
                >
                  <div className="flex min-h-44 items-center justify-center overflow-hidden rounded-2xl border border-zinc-800 bg-white p-4 sm:min-h-56">
                    {column.imageUrl ? (
                      <img
                        src={
                          column.imageUrl
                        }
                        alt={
                          column.name
                        }
                        className="h-full max-h-52 w-full object-contain"
                      />
                    ) : (
                      <div className="text-center text-xs font-bold text-zinc-400">
                        Ürün görseli
                      </div>
                    )}
                  </div>

                  <p className="mt-4 text-center text-sm font-black leading-6 text-white sm:text-base">
                    {column.name}
                  </p>

                  {column.reviewSlug && (
                    <div className="mt-4 flex justify-center">
                      <Link
                        href={`/incelemeler/${column.reviewSlug}`}
                        className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-2.5 text-xs font-black text-cyan-400 transition-all hover:border-cyan-500/40 hover:bg-cyan-500/10"
                      >
                        İncelemesini oku

                        <ArrowRight
                          size={14}
                        />
                      </Link>
                    </div>
                  )}
                </article>
              )
            )}
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-4">
            <h2 className="text-2xl font-black">
              Teknik Özellik Karşılaştırması
            </h2>

            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Cyan ile vurgulanan değerler, karşılaştırma hazırlanırken ilgili satırda öne çıkarılan özellikleri gösterir.
            </p>
          </div>

          <div className="max-w-full overflow-x-auto rounded-3xl border border-zinc-800 bg-zinc-900/30">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="bg-zinc-900/90">
                  <th className="w-56 border-b border-r border-zinc-800 p-4 text-xs font-black uppercase tracking-wide text-zinc-500">
                    Özellik
                  </th>

                  {comparison.columns.map(
                    (
                      column
                    ) => (
                      <th
                        key={
                          column.id
                        }
                        className="min-w-64 border-b border-r border-zinc-800 p-4 text-sm font-black text-white last:border-r-0"
                      >
                        {
                          column.name
                        }
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {visibleRows.map(
                  (
                    row,
                    rowIndex
                  ) => (
                    <tr
                      key={
                        row.id
                      }
                      className={
                        rowIndex %
                          2 ===
                        0
                          ? "bg-zinc-950/20"
                          : "bg-zinc-900/20"
                      }
                    >
                      <th className="border-b border-r border-zinc-800 p-4 text-xs font-bold leading-5 text-zinc-400">
                        {
                          row.label
                        }
                      </th>

                      {comparison.columns.map(
                        (
                          column
                        ) => {
                          const cell =
                            row.cells[
                              column.id
                            ];

                          const highlighted =
                            cell?.highlighted ===
                            true;

                          return (
                            <td
                              key={
                                column.id
                              }
                              className={
                                highlighted
                                  ? "border-b border-r border-zinc-800 bg-cyan-500/10 p-4 text-sm font-black text-cyan-300 last:border-r-0"
                                  : "border-b border-r border-zinc-800 p-4 text-sm font-semibold text-zinc-200 last:border-r-0"
                              }
                            >
                              {cell
                                ?.value ||
                                "—"}
                            </td>
                          );
                        }
                      )}
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-7">
          <div className="flex items-center gap-2">
            <Scale
              size={18}
              className="text-cyan-400"
            />

            <h2 className="text-lg font-black">
              Modelleri Daha Ayrıntılı İncele
            </h2>
          </div>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Karşılaştırmadaki laptopların işlemci, ekran kartı, ekran, RAM, depolama ve diğer özelliklerinin ayrıntılı değerlendirmelerine kendi inceleme sayfalarından ulaşabilirsin.
          </p>

          <div
            className="mt-5 grid gap-3"
            style={{
              gridTemplateColumns:
                `repeat(${Math.min(
                  comparison
                    .columns
                    .length,
                  3
                )}, minmax(0, 1fr))`,
            }}
          >
            {comparison.columns.map(
              (
                column
              ) => (
                <Link
                  key={
                    column.id
                  }
                  href={
                    column.reviewSlug
                      ? `/incelemeler/${column.reviewSlug}`
                      : "#"
                  }
                  className={
                    column.reviewSlug
                      ? "group flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-3 transition-all hover:border-cyan-500/40"
                      : "pointer-events-none flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-3 opacity-50"
                  }
                >
                  <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-800 bg-white p-1">
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
                      <span className="text-[9px] font-bold text-zinc-400">
                        Görsel yok
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-black leading-5 text-white transition-colors group-hover:text-cyan-300">
                      {
                        column.name
                      }
                    </p>

                    <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-cyan-400">
                      İncelemeyi oku

                      <ArrowRight
                        size={11}
                      />
                    </span>
                  </div>
                </Link>
              )
            )}
          </div>
        </section>
      </div>
    </main>
  );
}