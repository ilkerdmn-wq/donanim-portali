"use client";

import {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Eye,
  EyeOff,
  ExternalLink,
  FileImage,
  FileText,
  GripVertical,
  Image as ImageIcon,
  Link2,
  List,
  Loader2,
  Pencil,
  Plus,
  Quote,
  Save,
  Search,
  Star,
  Trash2,
  Type,
  Wrench,
  X,
} from "lucide-react";

type BlockType = "paragraph" | "h2" | "h3" | "quote" | "list" | "image";

type ContentBlock = {
  id: string;
  type: BlockType;
  value: string;
  file?: File | null;
  previewUrl?: string;
  fileName?: string;
};

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

const createBlock = (type: BlockType = "paragraph"): ContentBlock => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  type,
  value: "",
  file: null,
  previewUrl: "",
  fileName: "",
});

function createSlug(value: string) {
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

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("tr-TR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function parseMarkdownBlocks(content: string | null | undefined): ContentBlock[] {
  if (!content?.trim()) return [createBlock("paragraph")];

  // Gelecekte JSON blok kaydı kullanılırsa da eski içerikleri açabilsin.
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      const blocks = parsed.map((raw) => {
        const type: BlockType = ["paragraph", "h2", "h3", "quote", "list", "image"].includes(raw?.type)
          ? raw.type
          : "paragraph";
        const value = String(raw?.value || "");
        return {
          ...createBlock(type),
          value,
          previewUrl: type === "image" ? value : "",
          fileName: type === "image" && value ? "Kayıtlı görsel" : "",
        };
      });
      return blocks.length ? blocks : [createBlock("paragraph")];
    }
  } catch {
    // Rehberlerin mevcut formatı Markdown; aşağıda bloklara dönüştürülüyor.
  }

  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ContentBlock[] = [];
  let paragraphLines: string[] = [];
  let listLines: string[] = [];

  const flushParagraph = () => {
    const value = paragraphLines.join("\n").trim();
    if (value) blocks.push({ ...createBlock("paragraph"), value });
    paragraphLines = [];
  };

  const flushList = () => {
    if (listLines.length) {
      blocks.push({ ...createBlock("list"), value: listLines.join("\n") });
    }
    listLines = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    if (line.startsWith("- ") || /^\d+\.\s+/.test(line)) {
      flushParagraph();
      listLines.push(line.replace(/^(-\s+|\d+\.\s+)/, "").trim());
      continue;
    }

    flushList();

    const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imageMatch) {
      flushParagraph();
      blocks.push({
        ...createBlock("image"),
        value: imageMatch[2],
        previewUrl: imageMatch[2],
        fileName: imageMatch[1] || "Kayıtlı görsel",
      });
      continue;
    }

    if (line.startsWith("### ")) {
      flushParagraph();
      blocks.push({ ...createBlock("h3"), value: line.slice(4).trim() });
      continue;
    }

    if (line.startsWith("## ") || line.startsWith("# ")) {
      flushParagraph();
      blocks.push({
        ...createBlock("h2"),
        value: line.replace(/^#{1,2}\s+/, "").trim(),
      });
      continue;
    }

    if (line.startsWith("> ")) {
      flushParagraph();
      blocks.push({ ...createBlock("quote"), value: line.slice(2).trim() });
      continue;
    }

    // Tablo veya özel Markdown satırları bozulmasın diye paragraf bloğunda tutulur.
    paragraphLines.push(rawLine);
  }

  flushParagraph();
  flushList();

  return blocks.length ? blocks : [createBlock("paragraph")];
}

function serializeBlocks(blocks: ContentBlock[]) {
  return blocks
    .map((block) => {
      const value = block.value.trim();
      if (!value) return "";

      switch (block.type) {
        case "h2":
          return `## ${value}`;
        case "h3":
          return `### ${value}`;
        case "quote":
          return value
            .split("\n")
            .map((line) => `> ${line}`)
            .join("\n");
        case "list":
          return value
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => `- ${line.replace(/^(-\s+|\d+\.\s+)/, "")}`)
            .join("\n");
        case "image":
          return `![Rehber görseli](${value})`;
        default:
          return value;
      }
    })
    .filter(Boolean)
    .join("\n\n");
}

export default function GuideManagementPage() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingGuide, setEditingGuide] = useState<Guide | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("Genel");
  const [slug, setSlug] = useState("");
  const [published, setPublished] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [relatedToolLabel, setRelatedToolLabel] = useState("");
  const [relatedToolUrl, setRelatedToolUrl] = useState("");

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [coverFileName, setCoverFileName] = useState("");
  const [existingCoverUrl, setExistingCoverUrl] = useState("");

  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([
    createBlock("paragraph"),
  ]);

  const coverInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadGuides();
  }, []);

  useEffect(() => {
    return () => {
      if (coverPreview.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
      contentBlocks.forEach((block) => {
        if (block.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(block.previewUrl);
      });
    };
  }, []);

  const loadGuides = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/guides", { cache: "no-store" });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Rehberler yüklenemedi.");
      }

      setGuides(result.guides || []);
    } catch (err: any) {
      setError(err?.message || "Rehberler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  const cleanupLocalUrls = () => {
    if (coverPreview.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
    contentBlocks.forEach((block) => {
      if (block.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(block.previewUrl);
    });
  };

  const resetForm = () => {
    cleanupLocalUrls();

    setEditingGuide(null);
    setTitle("");
    setExcerpt("");
    setCategory("Genel");
    setSlug("");
    setPublished(false);
    setFeatured(false);
    setSeoTitle("");
    setSeoDescription("");
    setSourceName("");
    setSourceUrl("");
    setRelatedToolLabel("");
    setRelatedToolUrl("");

    setCoverFile(null);
    setCoverPreview("");
    setCoverFileName("");
    setExistingCoverUrl("");
    setContentBlocks([createBlock("paragraph")]);
  };

  const openNewEditor = () => {
    resetForm();
    setEditorOpen(true);
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openEditEditor = (guide: Guide) => {
    resetForm();

    setEditingGuide(guide);
    setTitle(guide.title || "");
    setExcerpt(guide.excerpt || "");
    setCategory(guide.category || "Genel");
    setSlug(guide.slug || createSlug(guide.title));
    setPublished(Boolean(guide.published));
    setFeatured(Boolean(guide.featured));
    setSeoTitle(guide.seo_title || "");
    setSeoDescription(guide.seo_description || "");
    setSourceName(guide.source_name || "");
    setSourceUrl(guide.source_url || "");
    setRelatedToolLabel(guide.related_tool_label || "");
    setRelatedToolUrl(guide.related_tool_url || "");

    setExistingCoverUrl(guide.cover_image_url || "");
    setCoverPreview(guide.cover_image_url || "");
    setCoverFileName(guide.cover_image_url ? "Kayıtlı kapak görseli" : "");
    setContentBlocks(parseMarkdownBlocks(guide.content));

    setEditorOpen(true);
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setPreviewOpen(false);
    resetForm();
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!editingGuide) setSlug(createSlug(value));
  };

  const handleCoverFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Sadece JPG, JPEG, PNG veya WEBP görsel seçebilirsin.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Görsel boyutu en fazla 5 MB olabilir.");
      event.target.value = "";
      return;
    }

    if (coverPreview.startsWith("blob:")) URL.revokeObjectURL(coverPreview);

    const preview = URL.createObjectURL(file);
    setCoverFile(file);
    setCoverPreview(preview);
    setCoverFileName(file.name);
    setError("");
  };

  const removeCover = () => {
    if (coverPreview.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
    setCoverFile(null);
    setCoverPreview("");
    setCoverFileName("");
    setExistingCoverUrl("");
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const addBlock = (type: BlockType) => {
    setContentBlocks((current) => [...current, createBlock(type)]);
  };

  const updateBlockValue = (id: string, value: string) => {
    setContentBlocks((current) =>
      current.map((block) => (block.id === id ? { ...block, value } : block))
    );
  };

  const handleBlockImage = (id: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("İçerik görseli JPG, PNG veya WEBP olmalıdır.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("İçerik görseli en fazla 5 MB olabilir.");
      event.target.value = "";
      return;
    }

    setContentBlocks((current) =>
      current.map((block) => {
        if (block.id !== id) return block;
        if (block.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(block.previewUrl);

        return {
          ...block,
          file,
          previewUrl: URL.createObjectURL(file),
          fileName: file.name,
          value: "",
        };
      })
    );
    setError("");
  };

  const removeBlockImage = (id: string) => {
    setContentBlocks((current) =>
      current.map((block) => {
        if (block.id !== id) return block;
        if (block.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(block.previewUrl);
        return { ...block, file: null, previewUrl: "", fileName: "", value: "" };
      })
    );
  };

  const removeBlock = (id: string) => {
    setContentBlocks((current) => {
      const target = current.find((block) => block.id === id);
      if (target?.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(target.previewUrl);

      const next = current.filter((block) => block.id !== id);
      return next.length ? next : [createBlock("paragraph")];
    });
  };

  const moveBlock = (id: string, direction: "up" | "down") => {
    setContentBlocks((current) => {
      const index = current.findIndex((block) => block.id === id);
      if (index === -1) return current;
      const nextIndex = direction === "up" ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= current.length) return current;

      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  };

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/admin/guides/upload", {
      method: "POST",
      body: formData,
    });
    const result = await response.json();

    if (!response.ok || !result.success || !result.url) {
      throw new Error(result.error || "Görsel yüklenemedi.");
    }

    return String(result.url);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Rehber başlığı zorunludur.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      let finalCoverUrl = existingCoverUrl;
      if (coverFile) finalCoverUrl = await uploadImage(coverFile);

      const savedBlocks: ContentBlock[] = [];

      for (const block of contentBlocks) {
        if (block.type === "image") {
          let imageUrl = block.value.trim();
          if (block.file) imageUrl = await uploadImage(block.file);
          if (imageUrl) savedBlocks.push({ ...block, value: imageUrl, file: null, previewUrl: imageUrl });
        } else if (block.value.trim()) {
          savedBlocks.push({ ...block, value: block.value.trim() });
        }
      }

      const finalSlug = createSlug(slug || title);
      const content = serializeBlocks(savedBlocks);

      const payload = {
        id: editingGuide?.id ?? null,
        title: title.trim(),
        slug: finalSlug,
        category: category.trim() || "Genel",
        excerpt: excerpt.trim(),
        content,
        seo_title: seoTitle.trim(),
        seo_description: seoDescription.trim(),
        cover_image_url: finalCoverUrl,
        source_name: sourceName.trim(),
        source_url: sourceUrl.trim(),
        related_tool_label: relatedToolLabel.trim(),
        related_tool_url: relatedToolUrl.trim(),
        published,
        featured,
      };

      const response = await fetch("/api/admin/guides", {
        method: editingGuide ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Rehber kaydedilemedi.");
      }

      setSuccess(editingGuide ? "Rehber güncellendi." : "Rehber kaydedildi.");
      setEditorOpen(false);
      resetForm();
      await loadGuides();
    } catch (err: any) {
      setError(err?.message || "Rehber kaydedilemedi.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (guide: Guide) => {
    const accepted = window.confirm(`“${guide.title}” rehberini silmek istediğine emin misin?`);
    if (!accepted) return;

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/guides?id=${guide.id}`, { method: "DELETE" });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Rehber silinemedi.");
      }

      setGuides((current) => current.filter((item) => item.id !== guide.id));
      setSuccess("Rehber silindi.");
    } catch (err: any) {
      setError(err?.message || "Rehber silinemedi.");
    }
  };

  const blockLabel = (type: BlockType) => {
    switch (type) {
      case "paragraph": return "Paragraf";
      case "h2": return "Başlık";
      case "h3": return "Alt Başlık";
      case "quote": return "Alıntı";
      case "list": return "Liste";
      case "image": return "Görsel";
    }
  };

  const previewBlocks = useMemo(
    () => contentBlocks.filter((block) =>
      block.type === "image" ? Boolean(block.previewUrl || block.value) : Boolean(block.value.trim())
    ),
    [contentBlocks]
  );

  const filteredGuides = useMemo(() => {
    const q = search.trim().toLocaleLowerCase("tr-TR");
    if (!q) return guides;

    return guides.filter((guide) =>
      guide.title.toLocaleLowerCase("tr-TR").includes(q) ||
      (guide.category || "").toLocaleLowerCase("tr-TR").includes(q) ||
      (guide.slug || "").toLocaleLowerCase("tr-TR").includes(q)
    );
  }, [guides, search]);

  const stats = useMemo(() => ({
    total: guides.length,
    published: guides.filter((guide) => guide.published).length,
    draft: guides.filter((guide) => !guide.published).length,
  }), [guides]);

  const categoryOptions = useMemo(() => {
    const values = new Set(["Genel", ...guides.map((guide) => guide.category).filter(Boolean)]);
    return Array.from(values).sort((a, b) => a.localeCompare(b, "tr"));
  }, [guides]);

  const renderPreviewBlock = (block: ContentBlock) => {
    if (block.type === "image") {
      const src = block.previewUrl || block.value;
      return src ? (
        <img src={src} alt="Rehber içerik görseli" className="w-full rounded-2xl border border-zinc-800" />
      ) : null;
    }
    if (block.type === "h2") return <h2 className="text-2xl font-black text-white">{block.value}</h2>;
    if (block.type === "h3") return <h3 className="text-xl font-black text-white">{block.value}</h3>;
    if (block.type === "quote") return <blockquote className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 px-5 py-4 text-cyan-100">{block.value}</blockquote>;
    if (block.type === "list") {
      return (
        <ul className="list-disc pl-5 space-y-2 text-zinc-300">
          {block.value.split("\n").map((line) => line.trim()).filter(Boolean).map((line, index) => <li key={index}>{line}</li>)}
        </ul>
      );
    }
    return <p className="whitespace-pre-wrap leading-8 text-zinc-300">{block.value}</p>;
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div>
            <Link href="/yonetim" className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-cyan-400 transition">
              <ArrowLeft size={14} /> Yönetim Paneli
            </Link>

            <div className="flex items-center gap-3 mt-4">
              <div className="w-11 h-11 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 flex items-center justify-center">
                <BookOpen size={20} className="text-cyan-400" />
              </div>
              <div>
                <p className="text-[10px] font-black tracking-[0.18em] text-cyan-400 uppercase">İÇERİK</p>
                <h1 className="text-2xl md:text-3xl font-black">Rehber Yönetimi</h1>
              </div>
            </div>
          </div>

          {!editorOpen && (
            <button type="button" onClick={openNewEditor} className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-xs font-black text-zinc-950 hover:bg-cyan-300">
              <Plus size={15} /> Yeni Rehber
            </button>
          )}
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
        )}
        {success && (
          <div className="mt-5 flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            <CheckCircle2 size={16} /> {success}
          </div>
        )}

        {editorOpen ? (
          <section className="mt-7 rounded-3xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
            <div className="px-5 sm:px-7 py-5 border-b border-zinc-800 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black tracking-[0.16em] text-cyan-400 uppercase">YENİ İÇERİK</p>
                <h2 className="mt-1 text-xl md:text-2xl font-black">{editingGuide ? "Rehberi Düzenle" : "Yeni Rehber Oluştur"}</h2>
              </div>
              <button type="button" onClick={closeEditor} className="w-10 h-10 rounded-xl border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="grid lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="p-5 sm:p-7 space-y-7 lg:border-r border-zinc-800">
                <label className="block">
                  <span className="flex items-center gap-2 text-[11px] font-black uppercase text-zinc-400"><Type size={13} /> Rehber Başlığı</span>
                  <input
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Rehber başlığını yaz..."
                    className="mt-3 w-full h-14 rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-lg font-black text-white outline-none focus:border-cyan-500/40"
                  />
                </label>

                <label className="block">
                  <span className="flex items-center gap-2 text-[11px] font-black uppercase text-zinc-400"><FileText size={13} /> Kısa Açıklama</span>
                  <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    rows={4}
                    maxLength={500}
                    placeholder="Ana sayfa ve rehber kartlarında görünecek kısa açıklama..."
                    className="mt-3 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-sm leading-6 text-white outline-none focus:border-cyan-500/40 resize-none"
                  />
                  <div className="mt-2 text-right text-[10px] text-zinc-600">{excerpt.length} / 500 karakter</div>
                </label>

                <div>
                  <div className="flex items-center gap-2 mb-3 text-[11px] font-black uppercase text-zinc-400"><FileImage size={13} /> Kapak Görseli</div>
                  <input ref={coverInputRef} type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={handleCoverFile} className="hidden" />

                  {!coverPreview ? (
                    <button type="button" onClick={() => coverInputRef.current?.click()} className="w-full min-h-[250px] rounded-2xl border border-dashed border-zinc-800 bg-zinc-950 flex flex-col items-center justify-center hover:border-cyan-500/40 transition">
                      <ImageIcon size={32} className="text-zinc-700 mb-3" />
                      <span className="text-xs font-black text-zinc-300">PC&apos;den Kapak Görseli Seç</span>
                      <span className="text-[10px] text-zinc-600 mt-1">JPG • PNG • WEBP • Maksimum 5 MB</span>
                    </button>
                  ) : (
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
                      <img src={coverPreview} alt="Kapak ön izlemesi" className="w-full aspect-video object-cover" />
                      <div className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-zinc-800">
                        <span className="text-xs text-zinc-500 truncate">{coverFileName || "Kapak görseli"}</span>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => coverInputRef.current?.click()} className="px-3 py-2 rounded-lg border border-zinc-800 text-[10px] font-bold text-zinc-400 hover:text-white">Görseli Değiştir</button>
                          <button type="button" onClick={removeCover} className="px-3 py-2 rounded-lg border border-zinc-800 text-[10px] font-bold text-zinc-500 hover:text-red-400">Kaldır</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-2 text-[11px] font-black uppercase text-zinc-400"><FileText size={13} /> Rehber İçeriği</label>
                    <span className="text-[10px] text-zinc-600">{contentBlocks.length} blok</span>
                  </div>

                  <div className="space-y-3">
                    {contentBlocks.map((block, index) => (
                      <div key={block.id} className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
                        <div className="min-h-10 px-3 py-2 border-b border-zinc-800 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <GripVertical size={14} className="text-zinc-700" />
                            {block.type === "image" ? <ImageIcon size={13} className="text-cyan-400" /> : <FileText size={13} className="text-cyan-400" />}
                            <span className="text-[10px] font-black uppercase text-zinc-500">{index + 1}. {blockLabel(block.type)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button type="button" onClick={() => moveBlock(block.id, "up")} disabled={index === 0} className="w-7 h-7 rounded-lg text-zinc-600 hover:text-white disabled:opacity-20" title="Yukarı taşı">↑</button>
                            <button type="button" onClick={() => moveBlock(block.id, "down")} disabled={index === contentBlocks.length - 1} className="w-7 h-7 rounded-lg text-zinc-600 hover:text-white disabled:opacity-20" title="Aşağı taşı">↓</button>
                            <button type="button" onClick={() => removeBlock(block.id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-600 hover:text-red-400"><X size={13} /></button>
                          </div>
                        </div>

                        <div className="p-3">
                          {block.type === "image" ? (
                            <div>
                              <input id={`guide-image-${block.id}`} type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={(e) => handleBlockImage(block.id, e)} className="hidden" />
                              {!block.previewUrl && !block.value ? (
                                <label htmlFor={`guide-image-${block.id}`} className="min-h-[170px] rounded-xl border border-dashed border-zinc-800 flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500/40">
                                  <ImageIcon size={28} className="text-zinc-700 mb-2" />
                                  <span className="text-xs font-black text-zinc-300">PC&apos;den Görsel Seç</span>
                                  <span className="text-[10px] text-zinc-600 mt-1">JPG • PNG • WEBP</span>
                                </label>
                              ) : (
                                <div className="rounded-xl border border-zinc-800 overflow-hidden">
                                  <img src={block.previewUrl || block.value} alt="İçerik görseli" className="w-full max-h-[420px] object-cover" />
                                  <div className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-zinc-800">
                                    <span className="text-[10px] text-zinc-500 truncate">{block.fileName || "Kayıtlı görsel"}</span>
                                    <div className="flex gap-2">
                                      <label htmlFor={`guide-image-${block.id}`} className="px-3 py-2 rounded-lg border border-zinc-800 text-[10px] font-bold text-zinc-400 hover:text-white cursor-pointer">Değiştir</label>
                                      <button type="button" onClick={() => removeBlockImage(block.id)} className="px-3 py-2 rounded-lg border border-zinc-800 text-[10px] font-bold text-zinc-500 hover:text-red-400">Kaldır</button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : block.type === "h2" || block.type === "h3" ? (
                            <input
                              value={block.value}
                              onChange={(e) => updateBlockValue(block.id, e.target.value)}
                              placeholder={block.type === "h2" ? "Bölüm başlığı..." : "Alt başlık..."}
                              className={`w-full bg-transparent outline-none ${block.type === "h2" ? "text-xl font-black" : "text-lg font-bold"}`}
                            />
                          ) : (
                            <textarea
                              value={block.value}
                              onChange={(e) => updateBlockValue(block.id, e.target.value)}
                              rows={block.type === "paragraph" ? 7 : 4}
                              placeholder={block.type === "paragraph" ? "Rehber metnini yaz..." : block.type === "quote" ? "Alıntı metni..." : "Her satıra bir liste maddesi yaz..."}
                              className="w-full bg-transparent outline-none resize-y text-sm leading-7 text-zinc-300 min-h-[110px]"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 p-4">
                    <p className="text-[9px] font-black tracking-[0.12em] text-zinc-600 uppercase mb-3">İçerik Bloğu Ekle</p>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => addBlock("paragraph")} className="editor-add-button"><Plus size={12} /> Paragraf</button>
                      <button type="button" onClick={() => addBlock("h2")} className="editor-add-button"><Plus size={12} /> Başlık</button>
                      <button type="button" onClick={() => addBlock("h3")} className="editor-add-button"><Plus size={12} /> Alt Başlık</button>
                      <button type="button" onClick={() => addBlock("quote")} className="editor-add-button"><Quote size={12} /> Alıntı</button>
                      <button type="button" onClick={() => addBlock("list")} className="editor-add-button"><List size={12} /> Liste</button>
                      <button type="button" onClick={() => addBlock("image")} className="editor-add-button"><ImageIcon size={12} /> Görsel</button>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
                    <div className="flex items-center gap-2 mb-4"><Link2 size={14} className="text-cyan-400" /><h3 className="text-xs font-black">Kaynak</h3></div>
                    <div className="space-y-3">
                      <input value={sourceName} onChange={(e) => setSourceName(e.target.value)} placeholder="Kaynak adı" className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-cyan-500/40" />
                      <input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://..." className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-cyan-500/40" />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
                    <div className="flex items-center gap-2 mb-4"><Wrench size={14} className="text-cyan-400" /><h3 className="text-xs font-black">İlgili Araç</h3></div>
                    <div className="space-y-3">
                      <input value={relatedToolLabel} onChange={(e) => setRelatedToolLabel(e.target.value)} placeholder="Buton yazısı" className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-cyan-500/40" />
                      <input value={relatedToolUrl} onChange={(e) => setRelatedToolUrl(e.target.value)} placeholder="/araclar/..." className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-cyan-500/40" />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
                  <p className="text-[9px] font-black tracking-[0.12em] text-cyan-400 uppercase">SEO</p>
                  <div className="grid md:grid-cols-2 gap-4 mt-3">
                    <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="SEO başlığı" className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-cyan-500/40" />
                    <textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} rows={3} placeholder="Google sonuç açıklaması" className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-cyan-500/40 resize-none" />
                  </div>
                </div>
              </div>

              <aside className="p-5 sm:p-7 bg-zinc-950/20">
                <div className="lg:sticky lg:top-6 space-y-5">
                  <div>
                    <p className="text-[10px] font-black tracking-[0.16em] text-cyan-400 uppercase">YAYIN AYARLARI</p>
                    <h3 className="mt-1 text-lg font-black">Rehber Bilgileri</h3>
                  </div>

                  <label className="block">
                    <span className="text-[10px] font-black uppercase text-zinc-500">Kategori</span>
                    <input list="guide-categories" value={category} onChange={(e) => setCategory(e.target.value)} className="mt-2 w-full h-12 rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-sm outline-none focus:border-cyan-500/40" />
                    <datalist id="guide-categories">{categoryOptions.map((item) => <option key={item} value={item} />)}</datalist>
                  </label>

                  <label className="block">
                    <span className="text-[10px] font-black uppercase text-zinc-500">Rehber Adresi / Slug</span>
                    <input value={slug} onChange={(e) => setSlug(createSlug(e.target.value))} placeholder="rehber-adresi" className="mt-2 w-full h-12 rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-sm outline-none focus:border-cyan-500/40" />
                    <p className="mt-2 text-[9px] text-zinc-700">/rehber/{slug || "rehber-basligi"}</p>
                  </label>

                  <div className="rounded-2xl border border-zinc-800 overflow-hidden">
                    <button type="button" onClick={() => setPublished((value) => !value)} className="w-full p-4 flex items-center justify-between gap-4 hover:bg-zinc-900/50">
                      <div className="flex items-center gap-3 text-left">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${published ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-900 text-zinc-600"}`}>{published ? <Eye size={15} /> : <EyeOff size={15} />}</div>
                        <div><p className="text-xs font-black">Yayın Durumu</p><p className="text-[9px] text-zinc-600 mt-1">{published ? "Rehber yayına alınır." : "Rehber taslak olarak kalır."}</p></div>
                      </div>
                      <div className={`w-10 h-6 rounded-full p-1 transition ${published ? "bg-cyan-500" : "bg-zinc-800"}`}><div className={`w-4 h-4 rounded-full bg-white transition ${published ? "translate-x-4" : ""}`} /></div>
                    </button>

                    <button type="button" onClick={() => setFeatured((value) => !value)} className="w-full p-4 flex items-center justify-between gap-4 border-t border-zinc-800 hover:bg-zinc-900/50">
                      <div className="flex items-center gap-3 text-left">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${featured ? "bg-amber-500/10 text-amber-400" : "bg-zinc-900 text-zinc-600"}`}><Star size={15} /></div>
                        <div><p className="text-xs font-black">Öne Çıkan Rehber</p><p className="text-[9px] text-zinc-600 mt-1">Rehber listesinde vurgulanır.</p></div>
                      </div>
                      <div className={`w-10 h-6 rounded-full p-1 transition ${featured ? "bg-cyan-500" : "bg-zinc-800"}`}><div className={`w-4 h-4 rounded-full bg-white transition ${featured ? "translate-x-4" : ""}`} /></div>
                    </button>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
                    <p className="text-[9px] font-black tracking-[0.12em] text-zinc-600 uppercase">Rehber Özeti</p>
                    <div className="mt-3 space-y-2 text-[10px]">
                      <div className="flex justify-between gap-4"><span className="text-zinc-600">Kategori</span><span className="font-bold text-zinc-300">{category || "Genel"}</span></div>
                      <div className="flex justify-between gap-4"><span className="text-zinc-600">Durum</span><span className={published ? "text-emerald-400 font-bold" : "text-zinc-400 font-bold"}>{published ? "Yayında" : "Taslak"}</span></div>
                      <div className="flex justify-between gap-4"><span className="text-zinc-600">Öne Çıkan</span><span className={featured ? "text-amber-400 font-bold" : "text-zinc-500"}>{featured ? "Evet" : "Hayır"}</span></div>
                      <div className="flex justify-between gap-4"><span className="text-zinc-600">İçerik Bloğu</span><span className="font-bold">{contentBlocks.length}</span></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button type="button" onClick={() => setPreviewOpen(true)} className="w-full h-12 rounded-xl border border-zinc-800 bg-zinc-950 inline-flex items-center justify-center gap-2 text-xs font-black text-zinc-400 hover:text-white hover:border-zinc-700"><Eye size={14} /> Ön İzle</button>
                    {editingGuide && (
                      <Link href={`/rehber/${slug || editingGuide.slug}`} target="_blank" className="w-full h-12 rounded-xl border border-zinc-800 bg-zinc-950 inline-flex items-center justify-center gap-2 text-xs font-black text-zinc-400 hover:text-white hover:border-zinc-700">
                        <ExternalLink size={14} /> Yayındaki Rehberi Görüntüle
                      </Link>
                    )}
                    <button type="button" onClick={handleSave} disabled={saving} className="w-full h-12 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 text-xs font-black text-zinc-950">
                      {saving ? <><Loader2 size={14} className="animate-spin" /> Kaydediliyor...</> : <><Save size={14} /> {editingGuide ? "Değişiklikleri Kaydet" : "Rehberi Kaydet"}</>}
                    </button>
                    {editingGuide && (
                      <button type="button" onClick={async () => { await handleDelete(editingGuide); closeEditor(); }} className="w-full h-11 rounded-xl border border-red-500/20 bg-red-500/5 inline-flex items-center justify-center gap-2 text-[11px] font-black text-red-300 hover:bg-red-500/10">
                        <Trash2 size={13} /> Rehberi Sil
                      </button>
                    )}
                    <button type="button" onClick={closeEditor} className="w-full h-10 rounded-xl text-[11px] font-bold text-zinc-600 hover:text-zinc-300">İptal</button>
                  </div>
                </div>
              </aside>
            </div>
          </section>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-7">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4"><BookOpen size={17} className="text-cyan-400" /><p className="text-2xl font-black mt-3">{stats.total}</p><p className="text-xs text-zinc-500 mt-1">Toplam rehber</p></div>
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4"><Eye size={17} className="text-emerald-400" /><p className="text-2xl font-black mt-3">{stats.published}</p><p className="text-xs text-zinc-500 mt-1">Yayında</p></div>
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4"><EyeOff size={17} className="text-amber-400" /><p className="text-2xl font-black mt-3">{stats.draft}</p><p className="text-xs text-zinc-500 mt-1">Taslak</p></div>
            </div>

            <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div><h2 className="text-sm font-black">Kayıtlı Rehberler</h2><p className="text-[10px] text-zinc-600 mt-1">Toplam {guides.length} rehber</p></div>
                <div className="relative w-full sm:w-[300px]"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rehber ara..." className="w-full h-10 pl-9 pr-4 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-zinc-300 outline-none focus:border-cyan-500/40" /></div>
              </div>

              {loading ? (
                <div className="p-16 flex items-center justify-center gap-3 text-xs text-zinc-600"><Loader2 size={16} className="animate-spin" /> Rehberler yükleniyor...</div>
              ) : filteredGuides.length === 0 ? (
                <div className="p-16 text-center text-xs text-zinc-600">Rehber bulunamadı.</div>
              ) : (
                <div className="divide-y divide-zinc-800">
                  {filteredGuides.map((guide) => (
                    <div key={guide.id} className="p-4 flex flex-col md:flex-row md:items-center gap-4 hover:bg-zinc-900/60">
                      <div className="w-10 h-10 shrink-0 rounded-xl border border-zinc-800 bg-zinc-950 flex items-center justify-center"><BookOpen size={17} className="text-cyan-400" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-black">{guide.title}</h3>
                          <span className="px-2 py-0.5 rounded-md border border-zinc-800 text-[8px] font-bold text-zinc-500">{guide.category || "Genel"}</span>
                          {guide.published && <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black text-emerald-400">YAYINDA</span>}
                          {guide.featured && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[8px] font-black text-amber-400"><Star size={8} /> ÖNE ÇIKAN</span>}
                        </div>
                        <p className="text-[10px] text-zinc-600 mt-1 line-clamp-1">/rehber/{guide.slug} • {formatDate(guide.updated_at || guide.created_at)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => openEditEditor(guide)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-800 text-[10px] font-bold text-zinc-400 hover:text-white"><Pencil size={12} /> Düzenle</button>
                        <button type="button" onClick={() => handleDelete(guide)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-800 text-[10px] font-bold text-zinc-500 hover:text-red-400"><Trash2 size={12} /> Sil</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {previewOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="max-w-4xl mx-auto my-8 rounded-3xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between gap-4">
              <div><p className="text-[10px] font-black text-cyan-400 uppercase">Ön İzleme</p><h2 className="text-lg font-black mt-1">{title || "Rehber Başlığı"}</h2></div>
              <button type="button" onClick={() => setPreviewOpen(false)} className="w-9 h-9 rounded-xl border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white"><X size={15} /></button>
            </div>
            <div className="p-5 sm:p-8">
              {coverPreview && <img src={coverPreview} alt="Kapak ön izlemesi" className="w-full aspect-video object-cover rounded-2xl border border-zinc-800" />}
              {excerpt && <p className="mt-5 text-zinc-400 leading-7">{excerpt}</p>}
              <div className="mt-7 space-y-6">{previewBlocks.map((block) => <div key={block.id}>{renderPreviewBlock(block)}</div>)}</div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .editor-add-button {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          border: 1px solid rgb(39 39 42);
          border-radius: 0.65rem;
          padding: 0.55rem 0.75rem;
          font-size: 10px;
          font-weight: 800;
          color: rgb(161 161 170);
          background: rgb(9 9 11);
          transition: 150ms ease;
        }
        .editor-add-button:hover {
          color: white;
          border-color: rgb(63 63 70);
        }
      `}</style>
    </main>
  );
}
