"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  Plus,
  Save,
  Scale,
  Trash2,
} from "lucide-react";

import {
  createComparisonSlug,
  type ManualComparison,
} from "@/app/lib/manual-comparison";

type Review = {
  slug: string;
  title: string;
  image_url: string;
};

const input =
  "w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-cyan-400";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default function EditLaptopComparisonPage({
  params,
}: PageProps) {
  const [
    originalSlug,
    setOriginalSlug,
  ] = useState("");

  const [
    document,
    setDocument,
  ] =
    useState<ManualComparison | null>(
      null
    );

  const [
    reviews,
    setReviews,
  ] = useState<Review[]>([]);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    busy,
    setBusy,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    uploading,
    setUploading,
  ] = useState("");

  const [
    slugEdited,
    setSlugEdited,
  ] = useState(true);

  useEffect(() => {
    void loadComparison();
  }, []);

  const loadComparison =
    async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const {
          slug,
        } = await params;

        setOriginalSlug(
          slug
        );

        const response =
          await fetch(
            `/api/admin/laptop-comparison/${encodeURIComponent(
              slug
            )}`,
            {
              cache:
                "no-store",
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Karşılaştırma yüklenemedi."
          );
        }

        setDocument(
          data.document
        );

        setReviews(
          data.reviews ||
            []
        );
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Karşılaştırma yüklenemedi."
        );
      } finally {
        setLoading(false);
      }
    };

  const update = (
    fn: (
      current: ManualComparison
    ) => ManualComparison
  ) => {
    setDocument(
      (current) => {
        if (!current) {
          return current;
        }

        return fn(
          structuredClone(
            current
          )
        );
      }
    );
  };

  const handleTitleChange = (
    value: string
  ) => {
    update((current) => {
      current.title =
        value;

      if (!slugEdited) {
        current.slug =
          createComparisonSlug(
            value
          );
      }

      return current;
    });
  };

  const handleSlugChange = (
    value: string
  ) => {
    setSlugEdited(true);

    update((current) => {
      current.slug =
        createComparisonSlug(
          value
        );

      return current;
    });
  };

  const addColumn = () => {
    update((current) => {
      if (
        current.columns.length >=
        3
      ) {
        return current;
      }

      const id = `laptop-${
        current.columns.length +
        1
      }`;

      current.columns.push({
        id,
        name: "",
        reviewSlug: "",
        imageUrl: "",
      });

      current.rows.forEach(
        (row) => {
          row.cells[id] = {
            value: "",
            highlighted: false,
          };
        }
      );

      return current;
    });
  };

  const removeThirdColumn =
    () => {
      update((current) => {
        if (
          current.columns.length !==
          3
        ) {
          return current;
        }

        const removed =
          current.columns.pop();

        if (removed) {
          current.rows.forEach(
            (row) => {
              delete row.cells[
                removed.id
              ];
            }
          );
        }

        return current;
      });
    };

  const addRow = () => {
    update((current) => {
      const id = `feature-${Date.now()}`;

      current.rows.push({
        id,
        label: "",
        cells:
          Object.fromEntries(
            current.columns.map(
              (column) => [
                column.id,
                {
                  value: "",
                  highlighted:
                    false,
                },
              ]
            )
          ),
      });

      return current;
    });
  };

  const removeRow = (
    rowIndex: number
  ) => {
    update((current) => {
      current.rows.splice(
        rowIndex,
        1
      );

      return current;
    });
  };

  const uploadImage =
    async (
      columnId: string,
      file: File
    ) => {
      setUploading(
        columnId
      );

      setMessage("");
      setErrorMessage("");

      try {
        const form =
          new FormData();

        form.append(
          "file",
          file
        );

        const response =
          await fetch(
            "/api/admin/reviews/upload",
            {
              method: "POST",
              body: form,
            }
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.url
        ) {
          throw new Error(
            result.error ||
              "Görsel yüklenemedi."
          );
        }

        update((current) => {
          const column =
            current.columns.find(
              (item) =>
                item.id ===
                columnId
            );

          if (column) {
            column.imageUrl =
              result.url;
          }

          return current;
        });

        setMessage(
          "Görsel yüklendi."
        );
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Görsel yüklenemedi."
        );
      } finally {
        setUploading("");
      }
    };

  const save = async () => {
    if (!document) {
      return;
    }

    setBusy(true);
    setMessage("");
    setErrorMessage("");

    try {
      const payload = {
        ...document,

        slug:
          document.slug ||
          createComparisonSlug(
            document.title
          ),
      };

      const response =
        await fetch(
          `/api/admin/laptop-comparison/${encodeURIComponent(
            originalSlug
          )}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              payload
            ),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Karşılaştırma kaydedilemedi."
        );
      }

      setDocument(
        data.document
      );

      setOriginalSlug(
        data.document.slug
      );

      setMessage(
        data.document
          .published
          ? "Karşılaştırma güncellendi ve yayında."
          : "Karşılaştırma taslak olarak güncellendi."
      );

      if (
        data.document
          .slug !==
        originalSlug
      ) {
        window.history.replaceState(
          null,
          "",
          `/yonetim/karsilastirmalar/laptop/${data.document.slug}`
        );
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Karşılaştırma kaydedilemedi."
      );
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm text-zinc-500">
            Karşılaştırma
            yükleniyor...
          </p>
        </div>
      </main>
    );
  }

  if (
    !document
  ) {
    return (
      <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/yonetim/karsilastirmalar/laptop"
            className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-cyan-400"
          >
            <ArrowLeft size={15} />
            Laptop karşılaştırmalarına dön
          </Link>

          <p className="mt-6 text-sm text-rose-300">
            {errorMessage ||
              "Karşılaştırma bulunamadı."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/yonetim/karsilastirmalar/laptop"
          className="inline-flex items-center gap-2 text-xs text-zinc-400 transition-colors hover:text-cyan-400"
        >
          <ArrowLeft
            size={15}
          />

          Laptop
          karşılaştırmalarına
          dön
        </Link>

        <div className="mt-7 flex items-center gap-3">
          <Scale
            size={29}
            className="text-cyan-400"
          />

          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-cyan-400">
              KARŞILAŞTIRMA
              DÜZENLE
            </p>

            <h1 className="text-3xl font-black">
              Laptop
              Karşılaştırmasını
              Düzenle
            </h1>
          </div>
        </div>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
          Mevcut
          karşılaştırmanın
          başlık, ürün,
          özellik ve yayın
          bilgilerini
          düzenleyebilirsin.
        </p>

        <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <h2 className="text-sm font-black">
            Karşılaştırma
            bilgileri
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <label className="text-xs font-bold text-zinc-300">
              Karşılaştırma
              başlığı

              <input
                value={
                  document.title
                }
                onChange={(e) =>
                  handleTitleChange(
                    e.target.value
                  )
                }
                className={`mt-2 ${input}`}
              />
            </label>

            <label className="text-xs font-bold text-zinc-300">
              Sayfa adresi
              (slug)

              <input
                value={
                  document.slug
                }
                onChange={(e) =>
                  handleSlugChange(
                    e.target.value
                  )
                }
                className={`mt-2 ${input}`}
              />

              <span className="mt-2 block text-[10px] font-normal text-zinc-600">
                /karsilastirma/laptop/
                {document.slug}
              </span>
            </label>
          </div>

          <label className="mt-5 block text-xs font-bold text-zinc-300">
            Kart açıklaması

            <textarea
              value={
                document.summary
              }
              onChange={(e) =>
                update(
                  (current) => {
                    current.summary =
                      e.target.value;

                    return current;
                  }
                )
              }
              rows={3}
              maxLength={400}
              className={`mt-2 resize-y ${input}`}
            />

            <span className="mt-2 block text-right text-[10px] font-normal text-zinc-600">
              {
                document
                  .summary
                  .length
              }
              /400
            </span>
          </label>
        </section>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black">
              Laptoplar ve
              teknik özellikler
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={
                addColumn
              }
              disabled={
                document
                  .columns
                  .length >= 3
              }
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-bold transition-colors hover:border-cyan-400 disabled:opacity-40"
            >
              <Plus size={16} />
              Sütun ekle
            </button>

            {document.columns
              .length === 3 && (
              <button
                type="button"
                onClick={
                  removeThirdColumn
                }
                className="rounded-xl border border-zinc-700 px-4 py-2.5 text-xs font-bold text-rose-300"
              >
                Üçüncü sütunu
                kaldır
              </button>
            )}
          </div>
        </div>

        <div className="mt-5 max-w-full overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/40">
          <table className="w-full min-w-[800px] border-collapse text-left">
            <thead>
              <tr className="bg-zinc-900">
                <th className="w-52 border-b border-r border-zinc-800 p-3 text-xs text-zinc-400">
                  Donanım özelliği
                </th>

                {document.columns.map(
                  (
                    column,
                    index
                  ) => (
                    <th
                      key={
                        column.id
                      }
                      className="min-w-72 border-b border-r border-zinc-800 p-3 last:border-r-0"
                    >
                      <span className="text-[10px] uppercase tracking-wide text-zinc-500">
                        Laptop{" "}
                        {index +
                          1}
                      </span>

                      <input
                        value={
                          column.name
                        }
                        onChange={(
                          e
                        ) =>
                          update(
                            (
                              current
                            ) => {
                              current.columns[
                                index
                              ].name =
                                e.target.value;

                              return current;
                            }
                          )
                        }
                        className={`mt-1 ${input}`}
                      />
                    </th>
                  )
                )}
              </tr>

              <tr>
                <th className="border-b border-r border-zinc-800 p-3 text-xs text-zinc-400">
                  Ürün görseli
                </th>

                {document.columns.map(
                  (column) => (
                    <th
                      key={
                        column.id
                      }
                      className="border-b border-r border-zinc-800 p-3 font-normal last:border-r-0"
                    >
                      <div className="flex items-center gap-3">
                        {column.imageUrl && (
                          <img
                            src={
                              column.imageUrl
                            }
                            alt={
                              column.name
                            }
                            className="h-20 w-28 rounded-lg border border-zinc-700 bg-white object-contain"
                          />
                        )}

                        <label className="cursor-pointer rounded-lg border border-zinc-700 px-3 py-2 text-xs font-bold text-cyan-300 hover:border-cyan-400">
                          {uploading ===
                          column.id
                            ? "Yükleniyor..."
                            : "Görsel yükle"}

                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            disabled={Boolean(
                              uploading
                            )}
                            onChange={(
                              e
                            ) => {
                              const file =
                                e.target.files?.[0];

                              if (
                                file
                              ) {
                                void uploadImage(
                                  column.id,
                                  file
                                );
                              }

                              e.target.value =
                                "";
                            }}
                            className="sr-only"
                          />
                        </label>
                      </div>

                      {column.imageUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            update(
                              (
                                current
                              ) => {
                                const selected =
                                  current.columns.find(
                                    (
                                      item
                                    ) =>
                                      item.id ===
                                      column.id
                                  );

                                if (
                                  selected
                                ) {
                                  selected.imageUrl =
                                    "";
                                }

                                return current;
                              }
                            )
                          }
                          className="mt-2 text-xs text-zinc-500 hover:text-rose-300"
                        >
                          Görseli kaldır
                        </button>
                      )}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {document.rows.map(
                (
                  row,
                  rowIndex
                ) => (
                  <tr
                    key={
                      row.id
                    }
                    className="border-b border-zinc-800/70"
                  >
                    <td className="border-r border-zinc-800 p-2">
                      <div className="flex items-center gap-1">
                        <input
                          value={
                            row.label
                          }
                          onChange={(
                            e
                          ) =>
                            update(
                              (
                                current
                              ) => {
                                current.rows[
                                  rowIndex
                                ].label =
                                  e.target.value;

                                return current;
                              }
                            )
                          }
                          className={
                            input
                          }
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeRow(
                              rowIndex
                            )
                          }
                          className="p-1 text-zinc-600 hover:text-rose-300"
                        >
                          <Trash2
                            size={14}
                          />
                        </button>
                      </div>
                    </td>

                    {document.columns.map(
                      (
                        column
                      ) => (
                        <td
                          key={
                            column.id
                          }
                          className="border-r border-zinc-800 p-2 last:border-r-0"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              value={
                                row.cells[
                                  column.id
                                ]?.value ||
                                ""
                              }
                              onChange={(
                                e
                              ) =>
                                update(
                                  (
                                    current
                                  ) => {
                                    current.rows[
                                      rowIndex
                                    ].cells[
                                      column.id
                                    ].value =
                                      e.target.value;

                                    return current;
                                  }
                                )
                              }
                              className={`${input} min-w-0`}
                            />

                            <label className="flex shrink-0 items-center gap-1 text-xs text-zinc-400">
                              <input
                                type="checkbox"
                                checked={
                                  row.cells[
                                    column.id
                                  ]
                                    ?.highlighted ||
                                  false
                                }
                                onChange={(
                                  e
                                ) =>
                                  update(
                                    (
                                      current
                                    ) => {
                                      current.rows[
                                        rowIndex
                                      ].cells[
                                        column.id
                                      ].highlighted =
                                        e.target.checked;

                                      return current;
                                    }
                                  )
                                }
                                className="h-4 w-4 accent-cyan-400"
                              />

                              ✓
                            </label>
                          </div>
                        </td>
                      )
                    )}
                  </tr>
                )
              )}
            </tbody>

            <tfoot>
              <tr>
                <th className="border-r border-zinc-800 p-3 text-xs text-zinc-400">
                  İnceleme bağlantısı
                </th>

                {document.columns.map(
                  (
                    column,
                    index
                  ) => {
                    const selectedReview =
                      reviews.find(
                        (
                          review
                        ) =>
                          review.slug ===
                          column.reviewSlug
                      );

                    return (
                      <td
                        key={
                          column.id
                        }
                        className="border-r border-zinc-800 p-3 last:border-r-0"
                      >
                        <select
                          value={
                            column.reviewSlug
                          }
                          onChange={(
                            e
                          ) =>
                            update(
                              (
                                current
                              ) => {
                                current.columns[
                                  index
                                ].reviewSlug =
                                  e.target.value;

                                return current;
                              }
                            )
                          }
                          className={
                            input
                          }
                        >
                          <option value="">
                            İnceleme seç
                          </option>

                          {reviews.map(
                            (
                              review
                            ) => (
                              <option
                                key={
                                  review.slug
                                }
                                value={
                                  review.slug
                                }
                              >
                                {
                                  review.title
                                }
                              </option>
                            )
                          )}
                        </select>

                        {selectedReview && (
                          <Link
                            href={`/incelemeler/${selectedReview.slug}`}
                            target="_blank"
                            className="mt-3 flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 hover:border-cyan-500/40"
                          >
                            <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-800 bg-white">
                              {selectedReview.image_url ? (
                                <img
                                  src={
                                    selectedReview.image_url
                                  }
                                  alt={
                                    selectedReview.title
                                  }
                                  className="h-full w-full object-contain"
                                />
                              ) : (
                                <span className="text-[10px] text-zinc-500">
                                  Görsel yok
                                </span>
                              )}
                            </div>

                            <div className="min-w-0">
                              <span className="block text-[10px] font-black uppercase text-cyan-400">
                                Bağlı inceleme
                              </span>

                              <span className="mt-1 block text-xs font-bold leading-5">
                                {
                                  selectedReview.title
                                }
                              </span>
                            </div>
                          </Link>
                        )}
                      </td>
                    );
                  }
                )}
              </tr>
            </tfoot>
          </table>
        </div>

        <button
          type="button"
          onClick={addRow}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-bold hover:border-cyan-400"
        >
          <Plus size={16} />
          Özellik satırı ekle
        </button>

        <div className="mt-8 flex flex-wrap items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <label className="flex items-center gap-2 text-sm font-bold">
            <input
              type="checkbox"
              checked={
                document.published
              }
              onChange={(e) =>
                update(
                  (current) => {
                    current.published =
                      e.target.checked;

                    return current;
                  }
                )
              }
              className="h-4 w-4 accent-cyan-400"
            />

            Karşılaştırmayı yayınla
          </label>

          <button
            type="button"
            disabled={busy}
            onClick={save}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-black text-zinc-950 hover:bg-cyan-300 disabled:opacity-50"
          >
            <Save size={16} />

            {busy
              ? "Kaydediliyor..."
              : "Değişiklikleri kaydet"}
          </button>
        </div>

        {message && (
          <p className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-300">
            {message}
          </p>
        )}

        {errorMessage && (
          <p className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-300">
            {errorMessage}
          </p>
        )}
      </div>
    </main>
  );
}
