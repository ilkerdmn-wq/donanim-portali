"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  Eye,
  Laptop,
  Pencil,
  Plus,
  Scale,
  Trash2,
} from "lucide-react";

import type {
  ManualComparison,
} from "@/app/lib/manual-comparison";

export default function LaptopComparisonManagementPage() {
  const [
    comparisons,
    setComparisons,
  ] = useState<ManualComparison[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    deletingSlug,
    setDeletingSlug,
  ] = useState("");

  useEffect(() => {
    void loadComparisons();
  }, []);

  const loadComparisons =
    async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const response =
          await fetch(
            "/api/admin/laptop-comparison",
            {
              cache: "no-store",
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Karşılaştırmalar yüklenemedi."
          );
        }

        setComparisons(
          Array.isArray(
            data.comparisons
          )
            ? data.comparisons
            : []
        );
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Karşılaştırmalar yüklenemedi."
        );
      } finally {
        setLoading(false);
      }
    };

  const removeComparison =
    async (
      comparison: ManualComparison
    ) => {
      const confirmed =
        window.confirm(
          `"${comparison.title}" karşılaştırmasını silmek istediğine emin misin?`
        );

      if (!confirmed) {
        return;
      }

      setDeletingSlug(
        comparison.slug
      );

      setErrorMessage("");

      try {
        const response =
          await fetch(
            `/api/admin/laptop-comparison/${encodeURIComponent(
              comparison.slug
            )}`,
            {
              method: "DELETE",
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Karşılaştırma silinemedi."
          );
        }

        setComparisons(
          (current) =>
            current.filter(
              (item) =>
                item.slug !==
                comparison.slug
            )
        );
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Karşılaştırma silinemedi."
        );
      } finally {
        setDeletingSlug("");
      }
    };

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-[1180px] px-5 py-10 md:px-6 md:py-14">
        <Link
          href="/yonetim/karsilastirmalar"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 transition-colors hover:text-cyan-400"
        >
          <ArrowLeft size={15} />
          Karşılaştırma yönetimine dön
        </Link>

        <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10">
                <Laptop
                  size={22}
                  className="text-cyan-400"
                />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-400">
                  KARŞILAŞTIRMA YÖNETİMİ
                </p>

                <h1 className="mt-1 text-3xl font-black tracking-tight md:text-4xl">
                  Laptop Karşılaştırmaları
                </h1>
              </div>
            </div>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-500">
              Laptop karşılaştırmalarını oluştur,
              düzenle ve yayınla. Her karşılaştırma
              ayrı bir sayfa olarak saklanacak.
            </p>
          </div>

          <Link
            href="/yonetim/karsilastirmalar/laptop/yeni"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-black text-zinc-950 transition-colors hover:bg-cyan-300"
          >
            <Plus size={17} />
            Yeni Laptop Karşılaştırması
          </Link>
        </div>

        <section className="mt-10">
          <div className="mb-4">
            <h2 className="text-xl font-black">
              Kayıtlı Karşılaştırmalar
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              Oluşturulan laptop karşılaştırmaları
              burada listelenir.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 rounded-2xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-300">
              {errorMessage}
            </div>
          )}

          {loading ? (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8 sm:p-10">
              <p className="text-sm text-zinc-500">
                Karşılaştırmalar yükleniyor...
              </p>
            </div>
          ) : comparisons.length === 0 ? (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8 sm:p-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10">
                <Scale
                  size={23}
                  className="text-cyan-400"
                />
              </div>

              <h3 className="mt-5 text-xl font-black">
                Henüz karşılaştırma yok
              </h3>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
                İlk laptop karşılaştırmasını
                oluşturduğunda burada kart olarak
                görüntülenecek.
              </p>

              <Link
                href="/yonetim/karsilastirmalar/laptop/yeni"
                className="mt-6 inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm font-bold text-cyan-400 transition-colors hover:border-cyan-500/40"
              >
                <Plus size={16} />
                İlk karşılaştırmayı oluştur
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {comparisons.map(
                (comparison) => (
                  <article
                    key={
                      comparison.slug
                    }
                    className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={
                              comparison.published
                                ? "rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black uppercase text-emerald-300"
                                : "rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[10px] font-black uppercase text-amber-300"
                            }
                          >
                            {comparison.published
                              ? "Yayında"
                              : "Taslak"}
                          </span>

                          <span className="text-[10px] text-zinc-600">
                            {
                              comparison.columns.length
                            }{" "}
                            laptop
                          </span>
                        </div>

                        <h3 className="mt-4 text-lg font-black leading-6 text-white">
                          {
                            comparison.title
                          }
                        </h3>

                        {comparison.summary && (
                          <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-500">
                            {
                              comparison.summary
                            }
                          </p>
                        )}

                        <p className="mt-3 break-all text-[10px] text-zinc-700">
                          /karsilastirma/laptop/
                          {
                            comparison.slug
                          }
                        </p>
                      </div>

                      <Scale
                        size={20}
                        className="shrink-0 text-cyan-400"
                      />
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2 border-t border-zinc-800 pt-4">
                      <Link
                        href={`/yonetim/karsilastirmalar/laptop/${comparison.slug}`}
                        className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2 text-xs font-bold text-zinc-200 transition-colors hover:border-cyan-500/40 hover:text-cyan-400"
                      >
                        <Pencil size={14} />
                        Düzenle
                      </Link>

                      {comparison.published && (
                        <Link
                          href={`/karsilastirma/laptop/${comparison.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2 text-xs font-bold text-zinc-200 transition-colors hover:border-cyan-500/40 hover:text-cyan-400"
                        >
                          <Eye size={14} />
                          Görüntüle
                        </Link>
                      )}

                      <button
                        type="button"
                        disabled={
                          deletingSlug ===
                          comparison.slug
                        }
                        onClick={() =>
                          void removeComparison(
                            comparison
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 px-3.5 py-2 text-xs font-bold text-rose-300 transition-colors hover:border-rose-500/40 disabled:opacity-50"
                      >
                        <Trash2
                          size={14}
                        />

                        {deletingSlug ===
                        comparison.slug
                          ? "Siliniyor..."
                          : "Sil"}
                      </button>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}