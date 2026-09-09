"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  AlignLeft,
  CalendarDays,
  ChevronDown,
  Eye,
  EyeOff,
  FileText,
  GripVertical,
  Image as ImageIcon,
  Link2,
  List,
  Loader2,
  Newspaper,
  Pencil,
  Plus,
  Quote,
  Save,
  Search,
  Star,
  Tag,
  Trash2,
  Type,
  X,
} from "lucide-react";

import { supabase } from "../../lib/supabase";

type BlockType = "paragraph" | "h2" | "h3" | "quote" | "list" | "image";

type ContentBlock = {
  id: string;
  type: BlockType;
  value: string;
  file?: File | null;
  previewUrl?: string;
  fileName?: string;
};

type NewsItem = {
  id: number;
  title: string;
  slug: string | null;
  excerpt: string | null;
  content: string | null;
  image_url: string | null;
  category: string | null;
  published: boolean;
  featured?: boolean;
  created_at: string;
};

const categories = [
  "Genel",
  "Donanım",
  "Yazılım",
  "Oyun",
  "Yapay Zeka",
  "Mobil",
];

const STORAGE_BUCKET = "news-images";

const categorySlugMap: Record<string, string> = {
  Genel: "genel",
  Donanım: "donanim",
  Yazılım: "yazilim",
  Oyun: "oyun",
  "Yapay Zeka": "yapay-zeka",
  Mobil: "mobil",
};

const createBlock = (type: BlockType = "paragraph"): ContentBlock => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  type,
  value: "",
  file: null,
  previewUrl: "",
  fileName: "",
});

export default function HaberYonetimiPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("Genel");
  const [slug, setSlug] = useState("");
  const [published, setPublished] = useState(false);
  const [featured, setFeatured] = useState(false);

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [coverFileName, setCoverFileName] = useState("");
  const [existingCoverUrl, setExistingCoverUrl] = useState("");

  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([
    createBlock("paragraph"),
  ]);

  const coverInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadNews();
  }, []);

  useEffect(() => {
    return () => {
      if (coverPreview.startsWith("blob:")) {
        URL.revokeObjectURL(coverPreview);
      }

      contentBlocks.forEach((block) => {
        if (block.previewUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(block.previewUrl);
        }
      });
    };
  }, []);

  const loadNews = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("news")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("HABERLER YÜKLENEMEDİ:", error);
      alert("Haberler yüklenemedi.\n\n" + error.message);
      setLoading(false);
      return;
    }

    setNews((data || []) as NewsItem[]);
    setLoading(false);
  };

  const createSlug = (text: string) => {
    return text
      .toLocaleLowerCase("tr-TR")
      .replace(/ç/g, "c")
      .replace(/ğ/g, "g")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ş/g, "s")
      .replace(/ü/g, "u")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const categorySlug = categorySlugMap[category] || createSlug(category);

  const handleTitleChange = (value: string) => {
    setTitle(value);

    if (!editingNews) {
      setSlug(createSlug(value));
    }
  };

  const cleanupLocalUrls = () => {
    if (coverPreview.startsWith("blob:")) {
      URL.revokeObjectURL(coverPreview);
    }

    contentBlocks.forEach((block) => {
      if (block.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(block.previewUrl);
      }
    });
  };

  const resetForm = () => {
    cleanupLocalUrls();

    setEditingNews(null);
    setTitle("");
    setExcerpt("");
    setCategory("Genel");
    setSlug("");
    setPublished(false);
    setFeatured(false);

    setCoverFile(null);
    setCoverPreview("");
    setCoverFileName("");
    setExistingCoverUrl("");

    setContentBlocks([createBlock("paragraph")]);
  };

  const openNewEditor = () => {
    resetForm();
    setEditorOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const parseStoredBlocks = (content: string | null): ContentBlock[] => {
    if (!content) return [createBlock("paragraph")];

    try {
      const parsed = JSON.parse(content);

      if (Array.isArray(parsed)) {
        return parsed.map((block) => {
          const type: BlockType =
            block?.type === "image" ||
            block?.type === "h2" ||
            block?.type === "h3" ||
            block?.type === "quote" ||
            block?.type === "list"
              ? block.type
              : "paragraph";

          return {
            ...createBlock(type),
            value: String(block?.value || ""),
            previewUrl: type === "image" ? String(block?.value || "") : "",
            fileName: type === "image" ? "Kayıtlı görsel" : "",
          };
        });
      }
    } catch {
      // Eski düz metin içerikleri paragraf olarak aç.
    }

    return [
      {
        ...createBlock("paragraph"),
        value: content,
      },
    ];
  };

  const openEditEditor = (item: NewsItem) => {
    resetForm();

    setEditingNews(item);
    setTitle(item.title || "");
    setExcerpt(item.excerpt || "");
    setCategory(item.category || "Genel");
    setSlug(item.slug || createSlug(item.title));
    setPublished(Boolean(item.published));
    setFeatured(Boolean(item.featured));

    setExistingCoverUrl(item.image_url || "");
    setCoverPreview(item.image_url || "");
    setCoverFileName(item.image_url ? "Kayıtlı kapak görseli" : "");

    setContentBlocks(parseStoredBlocks(item.content));
    setEditorOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setPreviewOpen(false);
    resetForm();
  };

  const handleCoverFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("Sadece JPG, JPEG, PNG veya WEBP görsel seçebilirsin.");
      event.target.value = "";
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert("Görsel boyutu en fazla 8 MB olabilir.");
      event.target.value = "";
      return;
    }

    if (coverPreview.startsWith("blob:")) {
      URL.revokeObjectURL(coverPreview);
    }

    const preview = URL.createObjectURL(file);

    setCoverFile(file);
    setCoverPreview(preview);
    setCoverFileName(file.name);
  };

  const removeCover = () => {
    if (coverPreview.startsWith("blob:")) {
      URL.revokeObjectURL(coverPreview);
    }

    setCoverFile(null);
    setCoverPreview("");
    setCoverFileName("");
    setExistingCoverUrl("");

    if (coverInputRef.current) {
      coverInputRef.current.value = "";
    }
  };

  const addBlock = (type: BlockType) => {
    setContentBlocks((current) => [...current, createBlock(type)]);
  };

  const updateBlockValue = (id: string, value: string) => {
    setContentBlocks((current) =>
      current.map((block) =>
        block.id === id ? { ...block, value } : block
      )
    );
  };

  const handleBlockImage = (
    id: string,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("Sadece JPG, JPEG, PNG veya WEBP görsel seçebilirsin.");
      event.target.value = "";
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert("Görsel boyutu en fazla 8 MB olabilir.");
      event.target.value = "";
      return;
    }

    setContentBlocks((current) =>
      current.map((block) => {
        if (block.id !== id) return block;

        if (block.previewUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(block.previewUrl);
        }

        return {
          ...block,
          file,
          previewUrl: URL.createObjectURL(file),
          fileName: file.name,
          value: "",
        };
      })
    );
  };

  const removeBlockImage = (id: string) => {
    setContentBlocks((current) =>
      current.map((block) => {
        if (block.id !== id) return block;

        if (block.previewUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(block.previewUrl);
        }

        return {
          ...block,
          file: null,
          previewUrl: "",
          fileName: "",
          value: "",
        };
      })
    );
  };

  const removeBlock = (id: string) => {
    setContentBlocks((current) => {
      const block = current.find((x) => x.id === id);

      if (block?.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(block.previewUrl);
      }

      const next = current.filter((x) => x.id !== id);

      return next.length > 0 ? next : [createBlock("paragraph")];
    });
  };

  const moveBlock = (id: string, direction: "up" | "down") => {
    setContentBlocks((current) => {
      const index = current.findIndex((block) => block.id === id);
      if (index === -1) return current;

      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= current.length) return current;

      const next = [...current];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  const sanitizeFileName = (name: string) => {
    const ext = name.includes(".") ? "." + name.split(".").pop() : "";
    const base = name.replace(/\.[^/.]+$/, "");

    return (
      createSlug(base).slice(0, 70) ||
      `image-${Date.now()}`
    ) + ext.toLowerCase();
  };

  const uploadImage = async (file: File, folder: string) => {
    const cleanName = sanitizeFileName(file.name);
    const path = `${folder}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}-${cleanName}`;

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      throw new Error(
        `Görsel yüklenemedi: ${error.message}\n\nSupabase Storage'da "${STORAGE_BUCKET}" isimli bucket oluşturulduğundan emin ol.`
      );
    }

    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(path);

    return data.publicUrl;
  };

  const validateForm = () => {
    if (!title.trim()) {
      alert("Haber başlığı boş bırakılamaz.");
      return false;
    }

    if (!slug.trim()) {
      alert("Haber adresi / slug boş bırakılamaz.");
      return false;
    }

    if (!category.trim()) {
      alert("Kategori seçmelisin.");
      return false;
    }

    if (
      !contentBlocks.some(
        (block) =>
          (block.type !== "image" && block.value.trim()) ||
          (block.type === "image" &&
            (block.file || block.value || block.previewUrl))
      )
    ) {
      alert("Habere en az bir içerik eklemelisin.");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm() || saving) return;

    setSaving(true);

    try {
      let finalCoverUrl = existingCoverUrl || "";

      if (coverFile) {
        finalCoverUrl = await uploadImage(coverFile, "covers");
      } else if (!coverPreview) {
        finalCoverUrl = "";
      }

      const savedBlocks: Array<{ type: BlockType; value: string }> = [];

      for (const block of contentBlocks) {
        if (block.type === "image") {
          let imageUrl = block.value || "";

          if (block.file) {
            imageUrl = await uploadImage(block.file, "content");
          } else if (!imageUrl && block.previewUrl && !block.previewUrl.startsWith("blob:")) {
            imageUrl = block.previewUrl;
          }

          if (imageUrl) {
            savedBlocks.push({
              type: "image",
              value: imageUrl,
            });
          }

          continue;
        }

        if (block.value.trim()) {
          savedBlocks.push({
            type: block.type,
            value: block.value.trim(),
          });
        }
      }

      const finalSlug = createSlug(slug);

      const duplicateQuery = supabase
        .from("news")
        .select("id")
        .eq("slug", finalSlug);

      const { data: duplicateRows, error: duplicateError } = editingNews
        ? await duplicateQuery.neq("id", editingNews.id)
        : await duplicateQuery;

      if (duplicateError) {
        throw duplicateError;
      }

      if ((duplicateRows || []).length > 0) {
        throw new Error(
          "Bu haber adresi (slug) başka bir haberde kullanılıyor. Slug alanını değiştir."
        );
      }

      if (featured) {
        const featuredResetQuery = supabase
          .from("news")
          .update({ featured: false })
          .eq("featured", true);

        const { error: featuredResetError } = editingNews
          ? await featuredResetQuery.neq("id", editingNews.id)
          : await featuredResetQuery;

        if (featuredResetError) {
          throw featuredResetError;
        }
      }

      const payload = {
        title: title.trim(),
        slug: finalSlug,
        excerpt: excerpt.trim() || null,
        content: JSON.stringify(savedBlocks),
        image_url: finalCoverUrl || null,
        category,
        published,
        featured,
      };

      if (editingNews) {
        const { error } = await supabase
          .from("news")
          .update(payload)
          .eq("id", editingNews.id);

        if (error) throw error;

        alert("Haber başarıyla güncellendi.");
      } else {
        const { error } = await supabase
          .from("news")
          .insert(payload);

        if (error) throw error;

        alert("Haber başarıyla kaydedildi.");
      }

      setEditorOpen(false);
      resetForm();
      await loadNews();
    } catch (error: any) {
      console.error("HABER KAYDETME HATASI:", error);
      alert(
        "Haber kaydedilemedi.\n\n" +
          (error?.message || String(error))
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: NewsItem) => {
    const accepted = window.confirm(
      `"${item.title}" haberini silmek istediğine emin misin?`
    );

    if (!accepted) return;

    const { error } = await supabase
      .from("news")
      .delete()
      .eq("id", item.id);

    if (error) {
      console.error("HABER SİLME HATASI:", error);
      alert("Haber silinemedi.\n\n" + error.message);
      return;
    }

    await loadNews();
  };

  const previewBlocks = useMemo(() => {
    return contentBlocks.filter(
      (block) =>
        (block.type === "image" &&
          (block.previewUrl || block.value)) ||
        (block.type !== "image" && block.value.trim())
    );
  }, [contentBlocks]);

  const filteredNews = useMemo(() => {
    const value = search.trim().toLocaleLowerCase("tr-TR");

    if (!value) return news;

    return news.filter(
      (item) =>
        item.title.toLocaleLowerCase("tr-TR").includes(value) ||
        (item.category || "")
          .toLocaleLowerCase("tr-TR")
          .includes(value)
    );
  }, [news, search]);

  const blockLabel = (type: BlockType) => {
    switch (type) {
      case "paragraph":
        return "Paragraf";
      case "h2":
        return "Başlık";
      case "h3":
        return "Alt Başlık";
      case "quote":
        return "Alıntı";
      case "list":
        return "Liste";
      case "image":
        return "Görsel";
    }
  };

  const renderPreviewBlock = (block: ContentBlock) => {
    if (block.type === "image") {
      const src = block.previewUrl || block.value;
      if (!src) return null;

      return (
        <div
          key={block.id}
          className="overflow-hidden rounded-2xl border border-zinc-800"
        >
          <img
            src={src}
            alt="Haber içeriği"
            className="w-full max-h-[600px] object-cover"
          />
        </div>
      );
    }

    if (block.type === "h2") {
      return (
        <h2
          key={block.id}
          className="text-2xl md:text-3xl font-black text-white mt-8"
        >
          {block.value}
        </h2>
      );
    }

    if (block.type === "h3") {
      return (
        <h3
          key={block.id}
          className="text-xl md:text-2xl font-black text-white mt-6"
        >
          {block.value}
        </h3>
      );
    }

    if (block.type === "quote") {
      return (
        <blockquote
          key={block.id}
          className="border-l-2 border-cyan-500 pl-5 py-2 text-zinc-400 italic leading-8"
        >
          {block.value}
        </blockquote>
      );
    }

    if (block.type === "list") {
      const lines = block.value
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      return (
        <ul
          key={block.id}
          className="list-disc pl-6 space-y-2 text-zinc-300"
        >
          {lines.map((line, index) => (
            <li key={index}>{line}</li>
          ))}
        </ul>
      );
    }

    return (
      <p
        key={block.id}
        className="text-[15px] md:text-base text-zinc-300 leading-8 whitespace-pre-line"
      >
        {block.value}
      </p>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <main className="max-w-[1200px] mx-auto px-5 md:px-6 py-8 md:py-10">
        {!editorOpen && (
          <>
            <Link
              href="/yonetim"
              className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-cyan-400 mb-7"
            >
              <ArrowLeft size={14} />
              Yönetim paneline dön
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Newspaper size={22} className="text-cyan-400" />
                </div>

                <div>
                  <p className="text-[10px] font-black tracking-[0.18em] uppercase text-cyan-400">
                    İçerik Yönetimi
                  </p>
                  <h1 className="text-3xl font-black">Haber Yönetimi</h1>
                  <p className="text-xs text-zinc-500 mt-1">
                    Haber ekle, düzenle, yayınla ve portal içeriğini yönet.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={openNewEditor}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-cyan-500 text-zinc-950 text-xs font-black hover:bg-cyan-400"
              >
                <Plus size={15} />
                Yeni Haber Ekle
              </button>
            </div>
          </>
        )}

        {editorOpen && (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
            <div className="px-5 md:px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-400">
                  {editingNews ? "Haberi Düzenle" : "Yeni İçerik"}
                </p>
                <h2 className="text-xl font-black mt-1">
                  {editingNews ? editingNews.title : "Yeni Haber Oluştur"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeEditor}
                className="w-10 h-10 rounded-xl border border-zinc-800 bg-zinc-950 flex items-center justify-center text-zinc-500 hover:text-white"
              >
                <X size={17} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-8 p-5 md:p-7 lg:p-8 border-b lg:border-b-0 lg:border-r border-zinc-800">
                <div className="space-y-7">
                  <div>
                    <label className="flex items-center gap-2 text-[11px] font-black uppercase text-zinc-400 mb-2">
                      <Type size={13} />
                      Haber Başlığı
                    </label>

                    <input
                      type="text"
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Haber başlığını yaz..."
                      className="w-full h-14 rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-base md:text-lg font-black outline-none focus:border-cyan-500/50"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-[11px] font-black uppercase text-zinc-400 mb-2">
                      <AlignLeft size={13} />
                      Kısa Açıklama
                    </label>

                    <textarea
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      placeholder="Ana sayfa ve haber kartlarında görünecek kısa açıklama..."
                      rows={4}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-sm text-zinc-300 outline-none resize-none focus:border-cyan-500/50"
                    />

                    <div className="text-right mt-1 text-[10px] text-zinc-600">
                      {excerpt.length} karakter
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-[11px] font-black uppercase text-zinc-400 mb-2">
                      <ImageIcon size={13} />
                      Kapak Görseli
                    </label>

                    <input
                      ref={coverInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      onChange={handleCoverFile}
                      className="hidden"
                    />

                    {!coverPreview ? (
                      <button
                        type="button"
                        onClick={() => coverInputRef.current?.click()}
                        className="w-full aspect-[16/7] rounded-2xl border border-dashed border-zinc-800 bg-zinc-950 flex flex-col items-center justify-center hover:border-cyan-500/40"
                      >
                        <ImageIcon size={34} className="text-zinc-700 mb-3" />
                        <span className="text-xs font-black text-zinc-300">
                          PC'den Kapak Görseli Seç
                        </span>
                        <span className="text-[10px] text-zinc-600 mt-1">
                          JPG • PNG • WEBP • Maksimum 8 MB
                        </span>
                      </button>
                    ) : (
                      <div className="rounded-2xl border border-zinc-800 overflow-hidden bg-zinc-950">
                        <div className="aspect-[16/7]">
                          <img
                            src={coverPreview}
                            alt="Kapak önizleme"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-zinc-800">
                          <div className="min-w-0">
                            <p className="text-[9px] uppercase text-zinc-600">
                              Seçilen Görsel
                            </p>
                            <p className="text-xs font-bold text-zinc-300 truncate">
                              {coverFileName || "Kapak görseli"}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => coverInputRef.current?.click()}
                              className="px-3 py-2 rounded-lg border border-zinc-800 text-[10px] font-bold text-zinc-400 hover:text-white"
                            >
                              Görseli Değiştir
                            </button>

                            <button
                              type="button"
                              onClick={removeCover}
                              className="px-3 py-2 rounded-lg border border-zinc-800 text-[10px] font-bold text-zinc-500 hover:text-red-400"
                            >
                              Kaldır
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center gap-2 text-[11px] font-black uppercase text-zinc-400">
                        <FileText size={13} />
                        Haber İçeriği
                      </label>

                      <span className="text-[10px] text-zinc-600">
                        {contentBlocks.length} blok
                      </span>
                    </div>

                    <div className="space-y-3">
                      {contentBlocks.map((block, index) => (
                        <div
                          key={block.id}
                          className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden"
                        >
                          <div className="min-h-10 px-3 py-2 border-b border-zinc-800 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <GripVertical size={14} className="text-zinc-700" />
                              {block.type === "image" ? (
                                <ImageIcon size={13} className="text-cyan-400" />
                              ) : (
                                <FileText size={13} className="text-cyan-400" />
                              )}
                              <span className="text-[10px] font-black uppercase text-zinc-500">
                                {index + 1}. {blockLabel(block.type)}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => moveBlock(block.id, "up")}
                                disabled={index === 0}
                                className="w-7 h-7 rounded-lg text-zinc-600 hover:text-white disabled:opacity-20"
                                title="Yukarı taşı"
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                onClick={() => moveBlock(block.id, "down")}
                                disabled={index === contentBlocks.length - 1}
                                className="w-7 h-7 rounded-lg text-zinc-600 hover:text-white disabled:opacity-20"
                                title="Aşağı taşı"
                              >
                                ↓
                              </button>
                              <button
                                type="button"
                                onClick={() => removeBlock(block.id)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-600 hover:text-red-400"
                              >
                                <X size={13} />
                              </button>
                            </div>
                          </div>

                          <div className="p-3">
                            {block.type === "image" ? (
                              <div>
                                <input
                                  id={`image-${block.id}`}
                                  type="file"
                                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                                  onChange={(e) => handleBlockImage(block.id, e)}
                                  className="hidden"
                                />

                                {!block.previewUrl && !block.value ? (
                                  <label
                                    htmlFor={`image-${block.id}`}
                                    className="min-h-[170px] rounded-xl border border-dashed border-zinc-800 flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500/40"
                                  >
                                    <ImageIcon size={28} className="text-zinc-700 mb-2" />
                                    <span className="text-xs font-black text-zinc-300">
                                      PC'den Görsel Seç
                                    </span>
                                    <span className="text-[10px] text-zinc-600 mt-1">
                                      JPG • PNG • WEBP
                                    </span>
                                  </label>
                                ) : (
                                  <div className="rounded-xl border border-zinc-800 overflow-hidden">
                                    <img
                                      src={block.previewUrl || block.value}
                                      alt="İçerik görseli"
                                      className="w-full max-h-[420px] object-cover"
                                    />

                                    <div className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-zinc-800">
                                      <span className="text-[10px] text-zinc-500 truncate">
                                        {block.fileName || "Kayıtlı görsel"}
                                      </span>

                                      <div className="flex gap-2">
                                        <label
                                          htmlFor={`image-${block.id}`}
                                          className="px-3 py-2 rounded-lg border border-zinc-800 text-[10px] font-bold text-zinc-400 hover:text-white cursor-pointer"
                                        >
                                          Değiştir
                                        </label>

                                        <button
                                          type="button"
                                          onClick={() => removeBlockImage(block.id)}
                                          className="px-3 py-2 rounded-lg border border-zinc-800 text-[10px] font-bold text-zinc-500 hover:text-red-400"
                                        >
                                          Kaldır
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : block.type === "h2" || block.type === "h3" ? (
                              <input
                                type="text"
                                value={block.value}
                                onChange={(e) =>
                                  updateBlockValue(block.id, e.target.value)
                                }
                                placeholder={
                                  block.type === "h2"
                                    ? "Bölüm başlığı..."
                                    : "Alt başlık..."
                                }
                                className={`w-full bg-transparent outline-none ${
                                  block.type === "h2"
                                    ? "text-xl font-black"
                                    : "text-lg font-bold"
                                }`}
                              />
                            ) : (
                              <textarea
                                value={block.value}
                                onChange={(e) =>
                                  updateBlockValue(block.id, e.target.value)
                                }
                                placeholder={
                                  block.type === "quote"
                                    ? "Alıntı metni..."
                                    : block.type === "list"
                                    ? "Her liste maddesini yeni satıra yaz..."
                                    : "Haber metnini yaz..."
                                }
                                rows={block.type === "paragraph" ? 6 : 4}
                                className="w-full bg-transparent outline-none resize-none text-sm text-zinc-300 leading-7"
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/50 p-4">
                      <p className="text-[10px] font-black uppercase text-zinc-600 mb-3">
                        İçerik Bloğu Ekle
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {[
                          ["paragraph", "Paragraf"],
                          ["h2", "Başlık"],
                          ["h3", "Alt Başlık"],
                          ["quote", "Alıntı"],
                          ["list", "Liste"],
                          ["image", "Görsel"],
                        ].map(([type, label]) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => addBlock(type as BlockType)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-800 text-[11px] font-bold text-zinc-400 hover:text-cyan-400 hover:border-cyan-500/30"
                          >
                            {type === "image" ? (
                              <ImageIcon size={13} />
                            ) : (
                              <Plus size={12} />
                            )}
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <aside className="lg:col-span-4 p-5 md:p-7 bg-zinc-950/30">
                <div className="lg:sticky lg:top-24 space-y-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-400">
                      Yayın Ayarları
                    </p>
                    <h3 className="text-lg font-black mt-1">Haber Bilgileri</h3>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-500 mb-2">
                      <Tag size={12} />
                      Kategori
                    </label>

                    <div className="relative">
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="appearance-none w-full h-12 rounded-xl border border-zinc-800 bg-zinc-950 px-4 pr-10 text-sm font-bold text-zinc-300 outline-none focus:border-cyan-500/50"
                      >
                        {categories.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>

                      <ChevronDown
                        size={14}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-500 mb-2">
                      <Link2 size={12} />
                      Haber Adresi / Slug
                    </label>

                    <input
                      value={slug}
                      onChange={(e) => setSlug(createSlug(e.target.value))}
                      placeholder="haber-adresi"
                      className="w-full h-12 rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-xs text-zinc-400 outline-none focus:border-cyan-500/50"
                    />

                    <p className="text-[9px] text-zinc-700 mt-2 break-all">
                      /news/{categorySlug}/{slug || "haber-basligi"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setPublished((value) => !value)}
                      className="w-full px-4 py-4 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            published
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-zinc-900 text-zinc-600"
                          }`}
                        >
                          {published ? <Eye size={16} /> : <EyeOff size={16} />}
                        </div>

                        <div className="text-left">
                          <p className="text-xs font-black text-zinc-300">
                            Yayın Durumu
                          </p>
                          <p className="text-[10px] text-zinc-600 mt-0.5">
                            {published
                              ? "Haber ziyaretçilere açık."
                              : "Haber taslak olarak kalır."}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`w-10 h-5 rounded-full p-0.5 ${
                          published ? "bg-emerald-500" : "bg-zinc-800"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            published ? "translate-x-5" : ""
                          }`}
                        />
                      </div>
                    </button>

                    <div className="border-t border-zinc-800" />

                    <button
                      type="button"
                      onClick={() => setFeatured((value) => !value)}
                      className="w-full px-4 py-4 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            featured
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-zinc-900 text-zinc-600"
                          }`}
                        >
                          <Star size={16} />
                        </div>

                        <div className="text-left">
                          <p className="text-xs font-black text-zinc-300">
                            Manşet Haber
                          </p>
                          <p className="text-[10px] text-zinc-600 mt-0.5">
                            Ana sayfada büyük göster.
                          </p>
                        </div>
                      </div>

                      <div
                        className={`w-10 h-5 rounded-full p-0.5 ${
                          featured ? "bg-amber-500" : "bg-zinc-800"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            featured ? "translate-x-5" : ""
                          }`}
                        />
                      </div>
                    </button>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                    <p className="text-[10px] font-black uppercase text-zinc-600 mb-3">
                      Haber Özeti
                    </p>

                    <div className="space-y-2 text-[11px]">
                      <div className="flex justify-between gap-4">
                        <span className="text-zinc-600">Kategori</span>
                        <span className="font-bold">{category}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-zinc-600">Durum</span>
                        <span
                          className={
                            published
                              ? "text-emerald-400 font-bold"
                              : "text-zinc-400 font-bold"
                          }
                        >
                          {published ? "Yayında" : "Taslak"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-zinc-600">Manşet</span>
                        <span
                          className={
                            featured
                              ? "text-amber-400 font-bold"
                              : "text-zinc-500"
                          }
                        >
                          {featured ? "Evet" : "Hayır"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-zinc-600">İçerik Bloğu</span>
                        <span className="font-bold">{contentBlocks.length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setPreviewOpen(true)}
                      className="w-full h-12 rounded-xl border border-zinc-800 bg-zinc-950 inline-flex items-center justify-center gap-2 text-xs font-black text-zinc-400 hover:text-white hover:border-zinc-700"
                    >
                      <Eye size={14} />
                      Ön İzle
                    </button>

                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="w-full h-12 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 text-xs font-black text-zinc-950"
                    >
                      {saving ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Kaydediliyor...
                        </>
                      ) : (
                        <>
                          <Save size={14} />
                          {editingNews
                            ? "Değişiklikleri Kaydet"
                            : "Haberi Kaydet"}
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={closeEditor}
                      className="w-full h-10 rounded-xl text-[11px] font-bold text-zinc-600 hover:text-zinc-300"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        )}

        {!editorOpen && (
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-black">Kayıtlı Haberler</h2>
                <p className="text-[10px] text-zinc-600 mt-1">
                  Toplam {news.length} haber
                </p>
              </div>

              <div className="relative w-full sm:w-[300px]">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Haber ara..."
                  className="w-full h-10 pl-9 pr-4 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-zinc-300 outline-none focus:border-cyan-500/40"
                />
              </div>
            </div>

            {loading ? (
              <div className="p-16 flex items-center justify-center gap-3 text-xs text-zinc-600">
                <Loader2 size={16} className="animate-spin" />
                Haberler yükleniyor...
              </div>
            ) : filteredNews.length === 0 ? (
              <div className="p-16 text-center text-xs text-zinc-600">
                Haber bulunamadı.
              </div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {filteredNews.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 flex flex-col md:flex-row md:items-center gap-4 hover:bg-zinc-900/60"
                  >
                    <div className="w-10 h-10 shrink-0 rounded-xl border border-zinc-800 bg-zinc-950 flex items-center justify-center">
                      <Newspaper size={17} className="text-cyan-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-black">{item.title}</h3>
                        <span className="px-2 py-0.5 rounded-md border border-zinc-800 text-[8px] font-bold text-zinc-500">
                          {item.category || "Genel"}
                        </span>
                        {item.published && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black text-emerald-400">
                            YAYINDA
                          </span>
                        )}
                        {item.featured && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[8px] font-black text-amber-400">
                            <Star size={8} />
                            MANŞET
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] text-zinc-600 mt-1 line-clamp-1">
                        {item.excerpt || "Kısa açıklama bulunmuyor."}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEditEditor(item)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-800 text-[10px] font-bold text-zinc-400 hover:text-white"
                      >
                        <Pencil size={12} />
                        Düzenle
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-800 text-[10px] font-bold text-zinc-500 hover:text-red-400"
                      >
                        <Trash2 size={12} />
                        Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {previewOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-screen px-4 py-8">
            <div className="max-w-[900px] mx-auto">
              <div className="sticky top-3 z-10 flex justify-end mb-4">
                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-black"
                >
                  <X size={14} />
                  Ön İzlemeyi Kapat
                </button>
              </div>

              <article className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-10">
                <div className="flex flex-wrap items-center gap-3 mb-5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-black text-cyan-400">
                    <Tag size={13} />
                    {category}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-zinc-600">
                    <CalendarDays size={13} />
                    Ön İzleme
                  </span>
                  {featured && (
                    <span className="inline-flex items-center gap-1 text-xs font-black text-amber-400">
                      <Star size={12} />
                      Manşet
                    </span>
                  )}
                </div>

                <h1 className="text-3xl md:text-5xl font-black leading-tight">
                  {title || "Haber başlığı"}
                </h1>

                {excerpt && (
                  <p className="text-base md:text-lg leading-8 text-zinc-400 mt-5">
                    {excerpt}
                  </p>
                )}

                {coverPreview ? (
                  <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-800">
                    <img
                      src={coverPreview}
                      alt="Kapak"
                      className="w-full max-h-[560px] object-cover"
                    />
                  </div>
                ) : (
                  <div className="mt-8 aspect-[16/7] rounded-2xl border border-zinc-800 bg-zinc-900 flex items-center justify-center">
                    <ImageIcon size={44} className="text-zinc-800" />
                  </div>
                )}

                <div className="mt-8 pt-8 border-t border-zinc-800 space-y-6">
                  {previewBlocks.length > 0 ? (
                    previewBlocks.map(renderPreviewBlock)
                  ) : (
                    <p className="text-zinc-600">
                      Henüz içerik eklenmedi.
                    </p>
                  )}
                </div>
              </article>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
