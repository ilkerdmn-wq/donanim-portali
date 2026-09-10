"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Edit3,
  Eye,
  EyeOff,
  ExternalLink,
  FileImage,
  FilePlus2,
  Link2,
  Loader2,
  Save,
  Search,
  Star,
  Trash2,
  Upload,
  ImageOff,
  Wrench,
  X,
} from "lucide-react";

type Guide = {
  id: number;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  seo_title: string;
  seo_description: string;
  cover_image_url: string;
  source_name: string;
  source_url: string;
  related_tool_label: string;
  related_tool_url: string;
  published: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
};

type GuideForm = {
  id: number | null;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  seo_title: string;
  seo_description: string;
  cover_image_url: string;
  source_name: string;
  source_url: string;
  related_tool_label: string;
  related_tool_url: string;
  published: boolean;
  featured: boolean;
};

const emptyForm: GuideForm = {
  id: null,
  title: "",
  slug: "",
  category: "Genel",
  excerpt: "",
  content: "",
  seo_title: "",
  seo_description: "",
  cover_image_url: "",
  source_name: "",
  source_url: "",
  related_tool_label: "",
  related_tool_url: "",
  published: false,
  featured: false,
};

function createSlug(
  value: string
) {
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

function formatDate(
  value: string
) {
  try {
    return new Intl.DateTimeFormat(
      "tr-TR",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    ).format(
      new Date(value)
    );
  } catch {
    return value;
  }
}

export default function GuideManagementPage() {
  const [
    guides,
    setGuides,
  ] =
    useState<Guide[]>([]);

  const [
    form,
    setForm,
  ] =
    useState<GuideForm>(
      emptyForm
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    success,
    setSuccess,
  ] =
    useState("");

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    editorOpen,
    setEditorOpen,
  ] =
    useState(false);

  const [
    uploadingCover,
    setUploadingCover,
  ] =
    useState(false);

  const [
    localCoverPreview,
    setLocalCoverPreview,
  ] =
    useState("");

  const loadGuides =
    async () => {
      setLoading(true);
      setError("");

      try {
        const response =
          await fetch(
            "/api/admin/guides",
            {
              cache:
                "no-store",
            }
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.error ||
              "Rehberler yüklenemedi."
          );
        }

        setGuides(
          result.guides || []
        );
      } catch (
        err: any
      ) {
        setError(
          err?.message ||
            "Rehberler yüklenemedi."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadGuides();
  }, []);

  const filteredGuides =
    useMemo(() => {
      const q =
        search
          .trim()
          .toLocaleLowerCase(
            "tr-TR"
          );

      if (!q) {
        return guides;
      }

      return guides.filter(
        (guide) =>
          guide.title
            .toLocaleLowerCase(
              "tr-TR"
            )
            .includes(q) ||
          guide.category
            .toLocaleLowerCase(
              "tr-TR"
            )
            .includes(q) ||
          guide.slug
            .toLocaleLowerCase(
              "tr-TR"
            )
            .includes(q)
      );
    }, [
      guides,
      search,
    ]);

  const stats =
    useMemo(() => {
      return {
        total:
          guides.length,
        published:
          guides.filter(
            (guide) =>
              guide.published
          ).length,
        draft:
          guides.filter(
            (guide) =>
              !guide.published
          ).length,
      };
    }, [guides]);

  const updateForm =
    (
      key: keyof GuideForm,
      value:
        | string
        | boolean
        | number
        | null
    ) => {
      setForm(
        (current) => ({
          ...current,
          [key]: value,
        })
      );
    };

  const newGuide =
    () => {
      setForm(
        emptyForm
      );
      setLocalCoverPreview("");
      setEditorOpen(true);
      setError("");
      setSuccess("");
    };

  const editGuide =
    (guide: Guide) => {
      setLocalCoverPreview("");

      setForm({
        id: guide.id,
        title: guide.title,
        slug: guide.slug,
        category:
          guide.category ||
          "Genel",
        excerpt:
          guide.excerpt ||
          "",
        content:
          guide.content ||
          "",
        seo_title:
          guide.seo_title ||
          "",
        seo_description:
          guide.seo_description ||
          "",
        cover_image_url:
          guide.cover_image_url ||
          "",
        source_name:
          guide.source_name ||
          "",
        source_url:
          guide.source_url ||
          "",
        related_tool_label:
          guide.related_tool_label ||
          "",
        related_tool_url:
          guide.related_tool_url ||
          "",
        published:
          guide.published,
        featured:
          guide.featured,
      });

      setEditorOpen(true);
      setError("");
      setSuccess("");
    };

  const uploadCoverImage =
    async (
      file: File
    ) => {
      setError("");
      setSuccess("");

      if (
        ![
          "image/jpeg",
          "image/png",
          "image/webp",
        ].includes(file.type)
      ) {
        setError(
          "Kapak görseli JPG, PNG veya WEBP olmalıdır."
        );
        return;
      }

      if (
        file.size >
        5 * 1024 * 1024
      ) {
        setError(
          "Kapak görseli en fazla 5 MB olabilir."
        );
        return;
      }

      const previewUrl =
        URL.createObjectURL(file);

      setLocalCoverPreview(
        previewUrl
      );
      setUploadingCover(true);

      try {
        const formData =
          new FormData();

        formData.append(
          "file",
          file
        );

        const response =
          await fetch(
            "/api/admin/guides/upload",
            {
              method: "POST",
              body: formData,
            }
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success ||
          !result.url
        ) {
          throw new Error(
            result.error ||
              "Görsel yüklenemedi."
          );
        }

        updateForm(
          "cover_image_url",
          result.url
        );

        setSuccess(
          "Kapak görseli yüklendi. Rehberi kaydettiğinde kalıcı olarak bağlanacak."
        );
      } catch (
        err: any
      ) {
        setError(
          err?.message ||
            "Görsel yüklenemedi."
        );
        setLocalCoverPreview("");
      } finally {
        setUploadingCover(false);
      }
    };

  const removeCoverImage =
    () => {
      setLocalCoverPreview("");
      updateForm(
        "cover_image_url",
        ""
      );
    };

  const saveGuide =
    async () => {
      if (
        !form.title.trim()
      ) {
        setError(
          "Rehber başlığı zorunludur."
        );
        return;
      }

      setSaving(true);
      setError("");
      setSuccess("");

      try {
        const method =
          form.id === null
            ? "POST"
            : "PATCH";

        const response =
          await fetch(
            "/api/admin/guides",
            {
              method,
              headers: {
                "Content-Type":
                  "application/json",
              },
              body:
                JSON.stringify({
                  ...form,
                  slug:
                    form.slug ||
                    createSlug(
                      form.title
                    ),
                }),
            }
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.error ||
              "Rehber kaydedilemedi."
          );
        }

        const saved =
          result.guide as Guide;

        setGuides(
          (current) => {
            const exists =
              current.some(
                (item) =>
                  item.id ===
                  saved.id
              );

            if (exists) {
              return current.map(
                (item) =>
                  item.id ===
                  saved.id
                    ? saved
                    : item
              );
            }

            return [
              saved,
              ...current,
            ];
          }
        );

        editGuide(
          saved
        );

        setSuccess(
          form.id === null
            ? "Rehber oluşturuldu."
            : "Rehber güncellendi."
        );
      } catch (
        err: any
      ) {
        setError(
          err?.message ||
            "Rehber kaydedilemedi."
        );
      } finally {
        setSaving(false);
      }
    };

  const deleteGuide =
    async (
      guide: Guide
    ) => {
      const approved =
        window.confirm(
          `"${guide.title}" rehberi kalıcı olarak silinsin mi?`
        );

      if (!approved) {
        return;
      }

      setError("");
      setSuccess("");

      try {
        const response =
          await fetch(
            `/api/admin/guides?id=${guide.id}`,
            {
              method:
                "DELETE",
            }
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.error ||
              "Rehber silinemedi."
          );
        }

        setGuides(
          (current) =>
            current.filter(
              (item) =>
                item.id !==
                guide.id
            )
        );

        if (
          form.id ===
          guide.id
        ) {
          setForm(
            emptyForm
          );
          setEditorOpen(false);
        }

        setSuccess(
          "Rehber silindi."
        );
      } catch (
        err: any
      ) {
        setError(
          err?.message ||
            "Rehber silinemedi."
        );
      }
    };

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div>
            <Link
              href="/yonetim"
              className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-cyan-400 transition"
            >
              <ArrowLeft size={14} />
              Yönetim Paneli
            </Link>

            <div className="flex items-center gap-3 mt-4">
              <div className="w-11 h-11 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 flex items-center justify-center">
                <BookOpen
                  size={20}
                  className="text-cyan-400"
                />
              </div>

              <div>
                <p className="text-[10px] font-black tracking-[0.18em] text-cyan-400 uppercase">
                  İÇERİK
                </p>

                <h1 className="text-2xl md:text-3xl font-black">
                  Rehber Yönetimi
                </h1>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={newGuide}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-xs font-black text-zinc-950 hover:bg-cyan-300"
          >
            <FilePlus2 size={15} />
            Yeni Rehber
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-7">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
            <BookOpen
              size={17}
              className="text-cyan-400"
            />
            <p className="text-2xl font-black mt-3">
              {stats.total}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Toplam rehber
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <Eye
              size={17}
              className="text-emerald-400"
            />
            <p className="text-2xl font-black mt-3">
              {stats.published}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Yayında
            </p>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
            <EyeOff
              size={17}
              className="text-amber-400"
            />
            <p className="text-2xl font-black mt-3">
              {stats.draft}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Taslak
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-5 flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            <CheckCircle2
              size={16}
            />
            {success}
          </div>
        )}

        <div className="mt-6 grid lg:grid-cols-[0.82fr_1.18fr] gap-5">
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
            <div className="p-4 border-b border-zinc-800">
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Rehber ara..."
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-9 pr-4 py-2.5 text-xs text-white outline-none focus:border-cyan-500/40"
                />
              </div>
            </div>

            {loading ? (
              <div className="min-h-[560px] flex items-center justify-center">
                <Loader2
                  size={24}
                  className="animate-spin text-cyan-400"
                />
              </div>
            ) : filteredGuides.length ===
              0 ? (
              <div className="min-h-[560px] flex flex-col items-center justify-center text-center px-6">
                <BookOpen
                  size={32}
                  className="text-zinc-700"
                />

                <p className="mt-4 text-sm font-bold text-zinc-400">
                  Henüz rehber bulunmuyor.
                </p>

                <button
                  type="button"
                  onClick={newGuide}
                  className="mt-4 text-xs font-bold text-cyan-400"
                >
                  İlk rehberi oluştur
                </button>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {filteredGuides.map(
                  (guide) => (
                    <button
                      key={
                        guide.id
                      }
                      type="button"
                      onClick={() =>
                        editGuide(
                          guide
                        )
                      }
                      className="w-full text-left p-4 sm:p-5 hover:bg-zinc-900/70 transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-black text-white truncate">
                            {
                              guide.title
                            }
                          </p>

                          <p className="mt-1 text-xs text-zinc-500 truncate">
                            /rehber/
                            {
                              guide.slug
                            }
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {guide.featured && (
                            <Star
                              size={14}
                              className="text-amber-400 fill-amber-400"
                            />
                          )}

                          <span
                            className={`rounded-lg border px-2 py-1 text-[9px] font-black ${
                              guide.published
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                            }`}
                          >
                            {guide.published
                              ? "YAYINDA"
                              : "TASLAK"}
                          </span>
                        </div>
                      </div>

                      <p className="mt-3 text-[10px] text-zinc-600">
                        {guide.category} •{" "}
                        {formatDate(
                          guide.updated_at ||
                            guide.created_at
                        )}
                      </p>
                    </button>
                  )
                )}
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-zinc-800 bg-zinc-900/50 min-h-[560px]">
            {!editorOpen ? (
              <div className="h-full min-h-[560px] flex flex-col items-center justify-center text-center p-6">
                <Edit3
                  size={32}
                  className="text-zinc-700"
                />

                <p className="mt-4 text-sm font-bold text-zinc-400">
                  Düzenlemek için soldan bir rehber seç veya yeni rehber oluştur.
                </p>
              </div>
            ) : (
              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black tracking-[0.14em] text-cyan-400 uppercase">
                      {form.id ===
                      null
                        ? "YENİ REHBER"
                        : "REHBER DÜZENLE"}
                    </p>

                    <h2 className="mt-1 text-xl font-black">
                      {form.id ===
                      null
                        ? "Yeni içerik"
                        : form.title}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setEditorOpen(
                        false
                      )
                    }
                    className="w-9 h-9 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-500 flex items-center justify-center hover:text-white"
                    aria-label="Editörü kapat"
                  >
                    <X
                      size={16}
                    />
                  </button>
                </div>

                <div className="mt-6 space-y-5">
                  <label className="block">
                    <span className="text-xs font-bold text-zinc-300">
                      Başlık
                    </span>

                    <input
                      type="text"
                      value={
                        form.title
                      }
                      onChange={(
                        event
                      ) => {
                        const value =
                          event
                            .target
                            .value;

                        updateForm(
                          "title",
                          value
                        );

                        if (
                          form.id ===
                          null
                        ) {
                          updateForm(
                            "slug",
                            createSlug(
                              value
                            )
                          );
                        }
                      }}
                      className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/40"
                      placeholder="Rehber başlığı"
                    />
                  </label>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <label className="block">
                      <span className="text-xs font-bold text-zinc-300">
                        Slug
                      </span>

                      <input
                        type="text"
                        value={
                          form.slug
                        }
                        onChange={(
                          event
                        ) =>
                          updateForm(
                            "slug",
                            createSlug(
                              event
                                .target
                                .value
                            )
                          )
                        }
                        className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/40"
                        placeholder="rehber-url"
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs font-bold text-zinc-300">
                        Kategori
                      </span>

                      <input
                        type="text"
                        value={
                          form.category
                        }
                        onChange={(
                          event
                        ) =>
                          updateForm(
                            "category",
                            event
                              .target
                              .value
                          )
                        }
                        className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/40"
                        placeholder="Güç Kaynağı"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="text-xs font-bold text-zinc-300">
                      Kısa açıklama
                    </span>

                    <textarea
                      value={
                        form.excerpt
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "excerpt",
                          event
                            .target
                            .value
                        )
                      }
                      rows={3}
                      className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm leading-6 text-white outline-none focus:border-cyan-500/40"
                      placeholder="Rehber liste kartında görünecek kısa açıklama"
                    />
                  </label>

                  <div className="rounded-3xl border border-zinc-800 bg-zinc-950/60 overflow-hidden">
                    <div className="flex items-center justify-between gap-3 border-b border-zinc-800 px-5 py-4">
                      <div className="flex items-center gap-2">
                        <FileImage
                          size={16}
                          className="text-cyan-400"
                        />
                        <div>
                          <p className="text-xs font-black text-white">
                            Kapak Görseli
                          </p>
                          <p className="mt-0.5 text-[10px] text-zinc-600">
                            Önerilen: 1600 × 900 px • 16:9 • WEBP/JPG/PNG
                          </p>
                        </div>
                      </div>

                      {(localCoverPreview ||
                        form.cover_image_url) && (
                        <button
                          type="button"
                          onClick={
                            removeCoverImage
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/5 px-2.5 py-1.5 text-[10px] font-bold text-red-300 hover:bg-red-500/10"
                        >
                          <ImageOff size={13} />
                          Kaldır
                        </button>
                      )}
                    </div>

                    <div className="p-5">
                      {(localCoverPreview ||
                        form.cover_image_url) ? (
                        <div className="relative aspect-video overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              localCoverPreview ||
                              form.cover_image_url
                            }
                            alt="Kapak önizleme"
                            className="h-full w-full object-cover"
                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />

                          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
                            <div>
                              <p className="text-xs font-black text-white">
                                Kapak önizlemesi
                              </p>
                              <p className="mt-1 text-[10px] text-zinc-300">
                                Kart ve rehber sayfasında 16:9 gösterilecek.
                              </p>
                            </div>

                            <label className="shrink-0 cursor-pointer rounded-xl bg-white/10 px-3 py-2 text-[10px] font-black text-white backdrop-blur hover:bg-white/20">
                              Değiştir
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                disabled={
                                  uploadingCover
                                }
                                onChange={(
                                  event
                                ) => {
                                  const file =
                                    event.target
                                      .files?.[0];

                                  if (file) {
                                    uploadCoverImage(
                                      file
                                    );
                                  }

                                  event.target.value =
                                    "";
                                }}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <label className="flex aspect-video cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 px-6 text-center hover:border-cyan-500/40 hover:bg-cyan-500/5 transition">
                          {uploadingCover ? (
                            <Loader2
                              size={28}
                              className="animate-spin text-cyan-400"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10">
                              <Upload
                                size={21}
                                className="text-cyan-400"
                              />
                            </div>
                          )}

                          <p className="mt-4 text-sm font-black text-white">
                            {uploadingCover
                              ? "Görsel yükleniyor..."
                              : "Bilgisayardan kapak görseli seç"}
                          </p>

                          <p className="mt-2 max-w-sm text-[11px] leading-5 text-zinc-500">
                            Görseli buraya bırakabilir veya tıklayarak seçebilirsin.
                            En fazla 5 MB.
                          </p>

                          <span className="mt-4 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-[10px] font-black text-zinc-300">
                            Dosya Seç
                          </span>

                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            disabled={
                              uploadingCover
                            }
                            onChange={(
                              event
                            ) => {
                              const file =
                                event.target
                                  .files?.[0];

                              if (file) {
                                uploadCoverImage(
                                  file
                                );
                              }

                              event.target.value =
                                "";
                            }}
                            className="hidden"
                          />
                        </label>
                      )}

                      <input
                        type="hidden"
                        value={
                          form.cover_image_url
                        }
                        readOnly
                      />

                      {form.cover_image_url && (
                        <p className="mt-3 text-[10px] text-emerald-400">
                          ✓ Görsel Storage&apos;a yüklendi ve rehber kaydına bağlanmaya hazır.
                        </p>
                      )}
                    </div>
                  </div>

                  <label className="block">
                    <span className="text-xs font-bold text-zinc-300">
                      İçerik
                    </span>

                    <textarea
                      value={
                        form.content
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "content",
                          event
                            .target
                            .value
                        )
                      }
                      rows={16}
                      className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm leading-7 text-white outline-none focus:border-cyan-500/40"
                      placeholder={"Rehber içeriğini buraya yaz...\n\nBaşlıklar ve paragraflar için satır boşluklarını kullanabilirsin."}
                    />

                    <p className="mt-2 text-[10px] leading-5 text-zinc-600">
                      Şimdilik sade metin editörüdür. Sonraki adımda başlık, alt başlık ve liste biçimlendirmesini public rehber sayfasında destekleyeceğiz.
                    </p>
                  </label>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Link2
                        size={15}
                        className="text-cyan-400"
                      />
                      <p className="text-xs font-black text-white">
                        Kaynak
                      </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <label className="block">
                        <span className="text-xs font-bold text-zinc-300">
                          Kaynak adı
                        </span>

                        <input
                          type="text"
                          value={
                            form.source_name
                          }
                          onChange={(
                            event
                          ) =>
                            updateForm(
                              "source_name",
                              event
                                .target
                                .value
                            )
                          }
                          className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/40"
                          placeholder="NVIDIA"
                        />
                      </label>

                      <label className="block">
                        <span className="text-xs font-bold text-zinc-300">
                          Kaynak URL
                        </span>

                        <input
                          type="text"
                          value={
                            form.source_url
                          }
                          onChange={(
                            event
                          ) =>
                            updateForm(
                              "source_url",
                              event
                                .target
                                .value
                            )
                          }
                          className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/40"
                          placeholder="https://..."
                        />
                      </label>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Wrench
                        size={15}
                        className="text-cyan-400"
                      />
                      <p className="text-xs font-black text-white">
                        İlgili Araç
                      </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <label className="block">
                        <span className="text-xs font-bold text-zinc-300">
                          Buton yazısı
                        </span>

                        <input
                          type="text"
                          value={
                            form.related_tool_label
                          }
                          onChange={(
                            event
                          ) =>
                            updateForm(
                              "related_tool_label",
                              event
                                .target
                                .value
                            )
                          }
                          className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/40"
                          placeholder="PSU Hesaplayıcıyı Aç"
                        />
                      </label>

                      <label className="block">
                        <span className="text-xs font-bold text-zinc-300">
                          Araç URL
                        </span>

                        <input
                          type="text"
                          value={
                            form.related_tool_url
                          }
                          onChange={(
                            event
                          ) =>
                            updateForm(
                              "related_tool_url",
                              event
                                .target
                                .value
                            )
                          }
                          className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/40"
                          placeholder="/araclar/psu"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
                    <p className="text-xs font-black text-white mb-4">
                      SEO
                    </p>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <label className="block">
                        <span className="text-xs font-bold text-zinc-300">
                          SEO Başlık
                        </span>

                        <input
                          type="text"
                          value={
                            form.seo_title
                          }
                          onChange={(
                            event
                          ) =>
                            updateForm(
                              "seo_title",
                              event
                                .target
                                .value
                            )
                          }
                          className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/40"
                          placeholder="Google başlığı"
                        />
                      </label>

                      <label className="block">
                        <span className="text-xs font-bold text-zinc-300">
                          SEO Açıklama
                        </span>

                        <textarea
                          value={
                            form.seo_description
                          }
                          onChange={(
                            event
                          ) =>
                            updateForm(
                              "seo_description",
                              event
                                .target
                                .value
                            )
                          }
                          rows={3}
                          className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm leading-6 text-white outline-none focus:border-cyan-500/40"
                          placeholder="Google sonuç açıklaması"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <label className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={
                          form.published
                        }
                        onChange={(
                          event
                        ) =>
                          updateForm(
                            "published",
                            event
                              .target
                              .checked
                          )
                        }
                        className="accent-cyan-400"
                      />

                      <div>
                        <p className="text-xs font-black text-white">
                          Yayında
                        </p>

                        <p className="text-[10px] text-zinc-600 mt-1">
                          Ziyaretçiler görebilir.
                        </p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={
                          form.featured
                        }
                        onChange={(
                          event
                        ) =>
                          updateForm(
                            "featured",
                            event
                              .target
                              .checked
                          )
                        }
                        className="accent-amber-400"
                      />

                      <div>
                        <p className="text-xs font-black text-white">
                          Öne Çıkan
                        </p>

                        <p className="text-[10px] text-zinc-600 mt-1">
                          Rehber ana sayfasında öne çıkar.
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      type="button"
                      onClick={
                        saveGuide
                      }
                      disabled={
                        saving ||
                        uploadingCover
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-xs font-black text-zinc-950 hover:bg-cyan-300 disabled:opacity-50"
                    >
                      {saving ? (
                        <Loader2
                          size={15}
                          className="animate-spin"
                        />
                      ) : (
                        <Save
                          size={15}
                        />
                      )}

                      Kaydet
                    </button>

                    {form.id !==
                      null && (
                      <>
                        <Link
                          href={`/rehber/${form.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-xs font-bold text-zinc-300 hover:text-white"
                        >
                          <ExternalLink
                            size={14}
                          />
                          Görüntüle
                        </Link>

                        <button
                          type="button"
                          onClick={() => {
                            const guide =
                              guides.find(
                                (
                                  item
                                ) =>
                                  item.id ===
                                  form.id
                              );

                            if (
                              guide
                            ) {
                              deleteGuide(
                                guide
                              );
                            }
                          }}
                          className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs font-bold text-red-300"
                        >
                          <Trash2
                            size={14}
                          />
                          Sil
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
