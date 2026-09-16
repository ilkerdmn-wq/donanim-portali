"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowRight,
  Laptop,
  Scale,
} from "lucide-react";

import type {
  ManualComparison,
} from "@/app/lib/manual-comparison";

export default function HomeComparison() {
  const [
    comparisons,
    setComparisons,
  ] =
    useState<ManualComparison[]>(
      []
    );

  useEffect(() => {
    let active = true;

    void fetch(
      "/api/laptop-comparison",
      {
        cache: "no-store",
      }
    )
      .then(
        (response) =>
          response.json()
      )
      .then((data) => {
        if (!active) {
          return;
        }

        setComparisons(
          Array.isArray(
            data.comparisons
          )
            ? data.comparisons
            : []
        );
      })
      .catch(() => {
        if (active) {
          setComparisons([]);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const latestComparison =
    comparisons[0] || null;

  const olderComparisons =
    comparisons.slice(1);

  const targetUrl =
    latestComparison
      ? `/karsilastirma/laptop/${latestComparison.slug}`
      : "/karsilastirma/laptop";

  return (
    <section
      aria-labelledby="home-comparison-title"
      className="flex flex-col gap-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <h2
          id="home-comparison-title"
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400"
        >
          <Scale
            size={14}
            className="text-cyan-400"
          />

          Karşılaştırma
        </h2>

        <span className="text-[11px] font-medium text-zinc-600">
          Laptoplar yan yana
        </span>
      </div>

      <Link
        href={targetUrl}
        className="group relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 transition-all hover:border-cyan-500/40"
      >
        <div className="p-6 md:p-8">
          <span className="rounded-lg bg-cyan-500 px-2.5 py-1 text-[10px] font-black uppercase text-zinc-950">
            Karşılaştırma
          </span>

          <h3 className="mt-5 text-2xl font-black leading-tight text-white transition-colors group-hover:text-cyan-300 md:text-4xl">
            {latestComparison
              ? latestComparison.title
              : "Laptop Karşılaştırmaları"}
          </h3>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
            {latestComparison?.summary ||
              "İncelediğimiz laptop modellerini teknik özellikleri üzerinden yan yana karşılaştırın."}
          </p>

          {latestComparison ? (
            <div className="mt-7 flex items-stretch justify-center gap-2 sm:gap-3">
              {latestComparison.columns.map(
                (
                  column,
                  index
                ) => (
                  <div
                    key={
                      column.id
                    }
                    className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3"
                  >
                    {index >
                      0 && (
                      <span className="shrink-0 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2 py-1 text-xs font-black text-cyan-300">
                        VS
                      </span>
                    )}

                    <div className="min-w-0 flex-1 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3 text-center sm:p-4">
                      <div className="flex h-28 items-center justify-center overflow-hidden rounded-xl bg-white p-2 sm:h-40">
                        {column.imageUrl ? (
                          <img
                            src={
                              column.imageUrl
                            }
                            alt={
                              column.name
                            }
                            className="h-full w-full object-contain"
                            loading="lazy"
                          />
                        ) : (
                          <Laptop
                            size={38}
                            className="text-zinc-400"
                          />
                        )}
                      </div>

                      <p className="mt-3 break-words text-xs font-black leading-5 text-white sm:text-sm">
                        {
                          column.name
                        }
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="mt-7 flex items-center justify-center gap-3">
              <div className="flex min-w-0 flex-1 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
                <Laptop
                  size={42}
                  className="text-zinc-400"
                />
              </div>

              <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-xs font-black text-cyan-300">
                VS
              </span>

              <div className="flex min-w-0 flex-1 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
                <Laptop
                  size={42}
                  className="text-zinc-400"
                />
              </div>
            </div>
          )}
        </div>
      </Link>

      {olderComparisons.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/30">
          <div className="border-b border-zinc-800 px-4 py-3">
            <span className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-500">
              Önceki Karşılaştırmalar
            </span>
          </div>

          <div className="max-h-[240px] overflow-y-auto">
            <div className="divide-y divide-zinc-800">
              {olderComparisons.map(
                (comparison) => (
                  <Link
                    key={comparison.slug}
                    href={`/karsilastirma/laptop/${comparison.slug}`}
                    className="group flex min-h-[80px] items-center gap-4 p-3 transition-colors hover:bg-zinc-900/70"
                  >
                    <div className="flex w-[150px] shrink-0 items-center gap-1">
                      {comparison.columns
                        .slice(0, 2)
                        .map(
                          (column) => (
                            <div
                              key={column.id}
                              className="flex h-14 min-w-0 flex-1 items-center justify-center overflow-hidden rounded-lg bg-white p-1"
                            >
                              {column.imageUrl ? (
                                <img
                                  src={column.imageUrl}
                                  alt={column.name}
                                  className="h-full w-full object-contain"
                                  loading="lazy"
                                />
                              ) : (
                                <Laptop
                                  size={20}
                                  className="text-zinc-400"
                                />
                              )}
                            </div>
                          )
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] font-black uppercase text-cyan-400">
                        Laptop Karşılaştırması
                      </span>

                      <h4 className="mt-1 line-clamp-1 text-xs font-black text-white transition-colors group-hover:text-cyan-300 sm:text-sm">
                        {comparison.title}
                      </h4>

                      <p className="mt-1 line-clamp-1 text-[10px] text-zinc-600">
                        {comparison.columns
                          .map(
                            (column) =>
                              column.name
                          )
                          .join(" • ")}
                      </p>
                    </div>

                    <ArrowRight
                      size={15}
                      className="shrink-0 text-zinc-700 transition-all group-hover:translate-x-1 group-hover:text-cyan-400"
                    />
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end pt-1">
        <Link
          href="/karsilastirma/laptop"
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-xs font-black text-zinc-200 transition-all hover:border-cyan-500/30 hover:text-cyan-400"
        >
          Tüm karşılaştırmalar

          <ArrowRight
            size={14}
          />
        </Link>
      </div>
    </section>
  );
}