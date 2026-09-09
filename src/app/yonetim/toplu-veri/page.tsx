"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import {
  ArrowLeft,
  Database,
  Upload,
  Download,
  Trash2,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  PackageSearch,
  Loader2,
} from "lucide-react";

import { supabase } from "../../lib/supabase";

type CategoryKey =
  | "islemciler"
  | "ekran-kartlari"
  | "anakartlar"
  | "bellekler"
  | "guc-kaynaklari"
  | "depolama";

type ParsedRow = {
  slug: string;
  name: string;
  price: number;
  description: string;
  specs: Record<string, string>;
};

const categories: {
  key: CategoryKey;
  title: string;
  dbCategory: string;
  description: string;
}[] = [
  {
    key: "islemciler",
    title: "İşlemciler",
    dbCategory: "islemciler",
    description: "CPU kayıtlarını toplu olarak yönet.",
  },
  {
    key: "ekran-kartlari",
    title: "Ekran Kartları",
    dbCategory: "ekran-kartlari",
    description: "GPU kayıtlarını toplu olarak yönet.",
  },
  {
    key: "anakartlar",
    title: "Anakartlar",
    dbCategory: "anakartlar",
    description: "Anakart kayıtlarını toplu olarak yönet.",
  },
  {
    key: "bellekler",
    title: "Bellekler",
    dbCategory: "bellekler",
    description: "RAM kayıtlarını toplu olarak yönet.",
  },
  {
    key: "guc-kaynaklari",
    title: "Güç Kaynakları",
    dbCategory: "guc-kaynaklari",
    description: "PSU kayıtlarını toplu olarak yönet.",
  },
  {
    key: "depolama",
    title: "Depolama",
    dbCategory: "depolama",
    description: "SSD ve HDD kayıtlarını toplu olarak yönet.",
  },
];

function createSlug(text: string) {
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
}

function parseCSVLine(line: string) {
  const values: string[] = [];

  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current.trim());

  return values;
}

function parseCSV(text: string): ParsedRow[] {
  const cleanText = text.replace(/^\uFEFF/, "");

  const lines = cleanText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error("CSV dosyasında veri bulunamadı.");
  }

  const headers = parseCSVLine(lines[0]).map((header) =>
    header.toLowerCase().trim()
  );

  const nameIndex = headers.indexOf("name");
  const slugIndex = headers.indexOf("slug");
  const priceIndex = headers.indexOf("price");
  const descriptionIndex = headers.indexOf("description");

  if (nameIndex === -1) {
    throw new Error('CSV dosyasında "name" sütunu bulunmak zorunda.');
  }

  const rows: ParsedRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);

    const name = values[nameIndex]?.trim();

    if (!name) {
      continue;
    }

    const rawPrice =
      priceIndex >= 0 ? values[priceIndex]?.trim() || "0" : "0";

    let numericPrice = 0;

    if (rawPrice) {
      const normalizedPrice = rawPrice
        .replace(/\s/g, "")
        .replace(/₺/g, "")
        .replace(/TL/gi, "")
        .replace(/\./g, "")
        .replace(",", ".")
        .replace(/[^\d.]/g, "");

      numericPrice = Number(normalizedPrice);
    }

    if (!Number.isFinite(numericPrice)) {
      numericPrice = 0;
    }

    const specs: Record<string, string> = {};

    headers.forEach((header, index) => {
      if (
        header !== "name" &&
        header !== "slug" &&
        header !== "price" &&
        header !== "description"
      ) {
        const value = values[index]?.trim();

        if (value) {
          specs[header] = value;
        }
      }
    });

    rows.push({
      name,
      slug:
        slugIndex >= 0 && values[slugIndex]?.trim()
          ? createSlug(values[slugIndex])
          : createSlug(name),
      price: numericPrice,
      description:
        descriptionIndex >= 0
          ? values[descriptionIndex]?.trim() || ""
          : "",
      specs,
    });
  }

  return rows;
}

function escapeCSV(value: unknown) {
  const str =
    value === null || value === undefined ? "" : String(value);

  if (
    str.includes(",") ||
    str.includes('"') ||
    str.includes("\n")
  ) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

export default function BulkDataManagementPage() {
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryKey>("islemciler");

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [parsedRows, setParsedRows] =
    useState<ParsedRow[]>([]);

  const [isImporting, setIsImporting] =
    useState(false);

  const [isExporting, setIsExporting] =
    useState(false);

  const [message, setMessage] =
    useState<string>("");

  const selectedCategoryInfo = useMemo(() => {
    return categories.find(
      (item) => item.key === selectedCategory
    )!;
  }, [selectedCategory]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      setSelectedFile(null);
      setParsedRows([]);
      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      alert("Şimdilik sadece CSV dosyası destekleniyor.");

      event.target.value = "";
      return;
    }

    try {
      const text = await file.text();

      const rows = parseCSV(text);

      setSelectedFile(file);
      setParsedRows(rows);

      setMessage(
        `${rows.length} kayıt CSV dosyasından okundu.`
      );
    } catch (error: any) {
      console.error(error);

      setSelectedFile(null);
      setParsedRows([]);

      alert(
        error?.message ||
          "CSV dosyası okunamadı."
      );
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      alert("Önce CSV dosyası seç.");
      return;
    }

    if (parsedRows.length === 0) {
      alert("CSV dosyasında aktarılacak kayıt bulunamadı.");
      return;
    }

    const confirmed = window.confirm(
      `${selectedCategoryInfo.title} kategorisine ${parsedRows.length} kayıt aktarılacak.\n\nDevam etmek istiyor musun?`
    );

    if (!confirmed) {
      return;
    }

    setIsImporting(true);
    setMessage("");

    try {
      const uniqueMap = new Map<string, ParsedRow>();

      parsedRows.forEach((row) => {
        uniqueMap.set(row.slug, row);
      });

      const uniqueRows = Array.from(
        uniqueMap.values()
      );

      const payload = uniqueRows.map((row) => ({
        slug: row.slug,
        category: selectedCategoryInfo.dbCategory,
        name: row.name,
        price: row.price,
        description: row.description,
        specs: row.specs,
        updated_at: new Date().toISOString(),
      }));

      const {
        data: existingItems,
        error: existingError,
      } = await supabase
        .from("hardware_items")
        .select("id, slug")
        .eq(
          "category",
          selectedCategoryInfo.dbCategory
        );

      if (existingError) {
        throw existingError;
      }

      const existingMap = new Map<string, number>();

      (existingItems || []).forEach((item: any) => {
        existingMap.set(item.slug, item.id);
      });

      let insertedCount = 0;
      let updatedCount = 0;

      for (const item of payload) {
        const existingId =
          existingMap.get(item.slug);

        if (existingId) {
          const { error } = await supabase
            .from("hardware_items")
            .update({
              category: item.category,
              name: item.name,
              price: item.price,
              description: item.description,
              specs: item.specs,
              updated_at: item.updated_at,
            })
            .eq("id", existingId);

          if (error) {
            throw error;
          }

          updatedCount++;
        } else {
          const { data, error } = await supabase
            .from("hardware_items")
            .insert({
              slug: item.slug,
              category: item.category,
              name: item.name,
              price: item.price,
              description: item.description,
              specs: item.specs,
              updated_at: item.updated_at,
            })
            .select("id, slug")
            .single();

          if (error) {
            throw error;
          }

          if (data) {
            existingMap.set(data.slug, data.id);
          }

          insertedCount++;
        }
      }

      setMessage(
        `İşlem tamamlandı. ${insertedCount} yeni kayıt eklendi, ${updatedCount} kayıt güncellendi.`
      );

      alert(
        `Aktarım tamamlandı.\n\nYeni eklenen: ${insertedCount}\nGüncellenen: ${updatedCount}`
      );

      setSelectedFile(null);
      setParsedRows([]);
    } catch (error: any) {
      console.error(
        "TOPLU AKTARIM HATASI:",
        error
      );

      alert(
        "Aktarım sırasında hata oluştu.\n\n" +
          (error?.message ||
            JSON.stringify(error))
      );
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const { data, error } = await supabase
        .from("hardware_items")
        .select(
          "slug,name,price,description,specs"
        )
        .eq(
          "category",
          selectedCategoryInfo.dbCategory
        )
        .order("name");

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        alert(
          "Bu kategoride dışa aktarılacak kayıt bulunamadı."
        );
        return;
      }

      const specKeys = new Set<string>();

      data.forEach((item: any) => {
        if (
          item.specs &&
          typeof item.specs === "object"
        ) {
          Object.keys(item.specs).forEach(
            (key) => specKeys.add(key)
          );
        }
      });

      const dynamicSpecKeys =
        Array.from(specKeys);

      const headers = [
        "slug",
        "name",
        "price",
        "description",
        ...dynamicSpecKeys,
      ];

      const csvRows = [
        headers.join(","),
        ...data.map((item: any) => {
          return headers
            .map((header) => {
              if (
                dynamicSpecKeys.includes(header)
              ) {
                return escapeCSV(
                  item.specs?.[header] ?? ""
                );
              }

              return escapeCSV(
                item[header]
              );
            })
            .join(",");
        }),
      ];

      const csvContent =
        "\uFEFF" + csvRows.join("\n");

      const blob = new Blob(
        [csvContent],
        {
          type: "text/csv;charset=utf-8;",
        }
      );

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;
      link.download = `${selectedCategory}.csv`;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error(
        "DIŞA AKTARMA HATASI:",
        error
      );

      alert(
        "CSV oluşturulamadı.\n\n" +
          (error?.message ||
            JSON.stringify(error))
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteCategory = async () => {
    const confirmed =
      window.confirm(
        `${selectedCategoryInfo.title} kategorisindeki TÜM kayıtlar silinecek.\n\nBu işlem geri alınamaz.\n\nEmin misin?`
      );

    if (!confirmed) {
      return;
    }

    const secondConfirm =
      window.confirm(
        "Son onay:\n\nBu kategorideki bütün ürünler kalıcı olarak silinsin mi?"
      );

    if (!secondConfirm) {
      return;
    }

    try {
      const { error } = await supabase
        .from("hardware_items")
        .delete()
        .eq(
          "category",
          selectedCategoryInfo.dbCategory
        );

      if (error) {
        throw error;
      }

      alert(
        `${selectedCategoryInfo.title} kategorisi temizlendi.`
      );
    } catch (error: any) {
      console.error(
        "TOPLU SİLME HATASI:",
        error
      );

      alert(
        "Kayıtlar silinemedi.\n\n" +
          (error?.message ||
            JSON.stringify(error))
      );
    }
  };

  const handlePriceUpdate = async () => {
    const rawValue =
      window.prompt(
        `${selectedCategoryInfo.title} fiyatlarını yüzde kaç değiştirmek istiyorsun?\n\nÖrnek:\n10 = %10 artır\n-10 = %10 azalt`
      );

    if (rawValue === null) {
      return;
    }

    const percentage = Number(
      rawValue
        .replace(",", ".")
        .trim()
    );

    if (!Number.isFinite(percentage)) {
      alert("Geçerli bir yüzde gir.");
      return;
    }

    const confirmed =
      window.confirm(
        `${selectedCategoryInfo.title} fiyatları %${percentage} oranında değiştirilecek.\n\nDevam edilsin mi?`
      );

    if (!confirmed) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from("hardware_items")
        .select("id, price")
        .eq(
          "category",
          selectedCategoryInfo.dbCategory
        );

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        alert("Bu kategoride kayıt yok.");
        return;
      }

      for (const item of data) {
        const currentPrice =
          Number(item.price) || 0;

        const newPrice = Math.round(
          currentPrice *
            (1 + percentage / 100)
        );

        const { error: updateError } =
          await supabase
            .from("hardware_items")
            .update({
              price: newPrice,
              updated_at:
                new Date().toISOString(),
            })
            .eq("id", item.id);

        if (updateError) {
          throw updateError;
        }
      }

      alert(
        `${data.length} ürünün fiyatı güncellendi.`
      );
    } catch (error: any) {
      console.error(
        "FİYAT GÜNCELLEME HATASI:",
        error
      );

      alert(
        "Fiyatlar güncellenemedi.\n\n" +
          (error?.message ||
            JSON.stringify(error))
      );
    }
  };

  const handleValidation = async () => {
    try {
      const { data, error } = await supabase
        .from("hardware_items")
        .select(
          "id,name,slug,price,description,specs"
        )
        .eq(
          "category",
          selectedCategoryInfo.dbCategory
        );

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        alert(
          "Bu kategoride kayıt bulunamadı."
        );
        return;
      }

      const problems = data.filter(
        (item: any) => {
          const hasSpecs =
            item.specs &&
            typeof item.specs ===
              "object" &&
            Object.keys(item.specs)
              .length > 0;

          return (
            !item.name ||
            !item.slug ||
            !item.price ||
            !item.description ||
            !hasSpecs
          );
        }
      );

      if (problems.length === 0) {
        alert(
          `Kontrol tamamlandı.\n\n${data.length} kaydın tamamı temel alanlara sahip.`
        );

        return;
      }

      const problemText =
        problems
          .slice(0, 15)
          .map(
            (item: any, index) =>
              `${index + 1}. ${
                item.name ||
                "İsimsiz kayıt"
              }`
          )
          .join("\n");

      alert(
        `${problems.length} kayıtta eksik veri bulundu.\n\n${problemText}${
          problems.length > 15
            ? "\n\n..."
            : ""
        }`
      );
    } catch (error: any) {
      console.error(
        "VERİ KONTROL HATASI:",
        error
      );

      alert(
        "Veriler kontrol edilemedi.\n\n" +
          (error?.message ||
            JSON.stringify(error))
      );
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-[1180px] mx-auto px-5 md:px-6 py-10 md:py-14">
        <Link
          href="/yonetim"
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-cyan-400 transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          Yönetim paneline dön
        </Link>

        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <Database
                size={22}
                className="text-cyan-400"
              />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-400">
                VERİ YÖNETİMİ
              </p>

              <h1 className="text-3xl md:text-4xl font-black tracking-tight mt-1">
                Toplu Veri Yönetimi
              </h1>

              <p className="text-sm text-zinc-500 mt-2 max-w-2xl leading-6">
                Donanım verilerini toplu ekle,
                dışa aktar, kontrol et ve kategori
                bazında yönet.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl border border-zinc-800 bg-zinc-950 flex items-center justify-center">
                <PackageSearch
                  size={18}
                  className="text-cyan-400"
                />
              </div>

              <span className="text-[9px] font-black uppercase tracking-wider text-zinc-600">
                Kategori
              </span>
            </div>

            <div className="mt-5">
              <p className="text-2xl font-black">
                {categories.length}
              </p>

              <p className="text-xs text-zinc-500 mt-1">
                Yönetilebilir donanım kategorisi
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl border border-zinc-800 bg-zinc-950 flex items-center justify-center">
                <FileSpreadsheet
                  size={18}
                  className="text-cyan-400"
                />
              </div>

              <span className="text-[9px] font-black uppercase tracking-wider text-zinc-600">
                İçe Aktarma
              </span>
            </div>

            <div className="mt-5">
              <p className="text-2xl font-black">
                CSV
              </p>

              <p className="text-xs text-zinc-500 mt-1">
                Gerçek toplu veri aktarımı
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl border border-zinc-800 bg-zinc-950 flex items-center justify-center">
                <CheckCircle2
                  size={18}
                  className="text-emerald-400"
                />
              </div>

              <span className="text-[9px] font-black uppercase tracking-wider text-zinc-600">
                Sistem
              </span>
            </div>

            <div className="mt-5">
              <p className="text-2xl font-black text-emerald-400">
                Supabase
              </p>

              <p className="text-xs text-zinc-500 mt-1">
                Veritabanına bağlı
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-5">
              <div className="mb-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                  KATEGORİ SEÇ
                </p>

                <h2 className="text-xl font-black mt-1">
                  Veri Grubu
                </h2>

                <p className="text-xs text-zinc-500 mt-2 leading-5">
                  İşlem yapmak istediğin donanım
                  kategorisini seç.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                {categories.map((category) => {
                  const active =
                    selectedCategory === category.key;

                  return (
                    <button
                      key={category.key}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(
                          category.key
                        );

                        setSelectedFile(null);
                        setParsedRows([]);
                        setMessage("");
                      }}
                      className={`w-full text-left px-4 py-4 rounded-2xl border transition-all ${
                        active
                          ? "border-cyan-500/40 bg-cyan-500/10"
                          : "border-zinc-800 bg-zinc-950/40 hover:bg-zinc-900"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span
                          className={`text-sm font-black ${
                            active
                              ? "text-cyan-400"
                              : "text-zinc-200"
                          }`}
                        >
                          {category.title}
                        </span>

                        {active && (
                          <CheckCircle2
                            size={16}
                            className="text-cyan-400"
                          />
                        )}
                      </div>

                      <p className="text-[11px] text-zinc-600 mt-1.5 leading-5">
                        {category.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                    TOPLU İÇE AKTAR
                  </p>

                  <h2 className="text-xl font-black mt-1">
                    CSV Dosyası Yükle
                  </h2>

                  <p className="text-xs text-zinc-500 mt-2 leading-5">
                    Seçili kategori:
                    <span className="text-zinc-300 font-bold ml-1">
                      {selectedCategoryInfo.title}
                    </span>
                  </p>
                </div>

                <Upload
                  size={22}
                  className="text-cyan-400"
                />
              </div>

              <label className="block rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/40 hover:border-cyan-500/40 transition-all cursor-pointer p-8">
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={handleFileChange}
                />

                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <FileSpreadsheet
                      size={22}
                      className="text-cyan-400"
                    />
                  </div>

                  <p className="text-sm font-black mt-4">
                    CSV seçmek için tıkla
                  </p>

                  <p className="text-xs text-zinc-600 mt-2">
                    .csv
                  </p>

                  {selectedFile && (
                    <div className="mt-4 px-4 py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                      <p className="text-xs font-bold text-cyan-400">
                        {selectedFile.name}
                      </p>

                      <p className="text-[10px] text-zinc-500 mt-1">
                        {parsedRows.length} kayıt bulundu
                      </p>
                    </div>
                  )}
                </div>
              </label>

              {parsedRows.length > 0 && (
                <div className="mt-4 rounded-2xl border border-zinc-800 overflow-hidden">
                  <div className="px-4 py-3 bg-zinc-950/60 border-b border-zinc-800">
                    <p className="text-xs font-black">
                      Ön İzleme
                    </p>
                  </div>

                  <div className="max-h-[250px] overflow-auto">
                    {parsedRows
                      .slice(0, 8)
                      .map((row, index) => (
                        <div
                          key={`${row.slug}-${index}`}
                          className="px-4 py-3 border-b border-zinc-800/60 last:border-b-0 flex items-center justify-between gap-4"
                        >
                          <div>
                            <p className="text-xs font-bold text-zinc-200">
                              {row.name}
                            </p>

                            <p className="text-[10px] text-zinc-600 mt-1">
                              {row.slug}
                            </p>
                          </div>

                          <span className="text-xs font-black text-cyan-400">
                            {row.price.toLocaleString(
                              "tr-TR"
                            )}{" "}
                            ₺
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                disabled={isImporting}
                onClick={handleImport}
                className="w-full mt-4 h-12 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-black text-sm transition-colors inline-flex items-center justify-center gap-2"
              >
                {isImporting ? (
                  <>
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                    Aktarılıyor...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Dosyayı İçe Aktar
                  </>
                )}
              </button>

              {message && (
                <div className="mt-4 px-4 py-3 rounded-xl border border-emerald-900/50 bg-emerald-950/20">
                  <p className="text-xs text-emerald-400 font-bold">
                    {message}
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">
              <div className="mb-5">
                <p className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                  HIZLI İŞLEMLER
                </p>

                <h2 className="text-xl font-black mt-1">
                  Toplu Veri Araçları
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  disabled={isExporting}
                  onClick={handleExport}
                  className="text-left rounded-2xl border border-zinc-800 bg-zinc-950/40 hover:bg-zinc-900 transition-all p-5 disabled:opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                      {isExporting ? (
                        <Loader2
                          size={18}
                          className="text-cyan-400 animate-spin"
                        />
                      ) : (
                        <Download
                          size={18}
                          className="text-cyan-400"
                        />
                      )}
                    </div>

                    <span className="text-[9px] font-black uppercase text-zinc-600">
                      DIŞA AKTAR
                    </span>
                  </div>

                  <h3 className="text-sm font-black mt-5">
                    CSV Olarak İndir
                  </h3>

                  <p className="text-xs text-zinc-600 leading-5 mt-2">
                    Seçili kategorideki tüm ürünleri
                    CSV olarak indir.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={handlePriceUpdate}
                  className="text-left rounded-2xl border border-zinc-800 bg-zinc-950/40 hover:bg-zinc-900 transition-all p-5"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                      <RefreshCw
                        size={18}
                        className="text-cyan-400"
                      />
                    </div>

                    <span className="text-[9px] font-black uppercase text-zinc-600">
                      GÜNCELLE
                    </span>
                  </div>

                  <h3 className="text-sm font-black mt-5">
                    Toplu Fiyat Güncelle
                  </h3>

                  <p className="text-xs text-zinc-600 leading-5 mt-2">
                    Seçili kategorideki fiyatları
                    yüzde olarak artır veya azalt.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={handleValidation}
                  className="text-left rounded-2xl border border-zinc-800 bg-zinc-950/40 hover:bg-zinc-900 transition-all p-5"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                      <AlertTriangle
                        size={18}
                        className="text-amber-400"
                      />
                    </div>

                    <span className="text-[9px] font-black uppercase text-zinc-600">
                      KONTROL
                    </span>
                  </div>

                  <h3 className="text-sm font-black mt-5">
                    Eksik Verileri Tara
                  </h3>

                  <p className="text-xs text-zinc-600 leading-5 mt-2">
                    Eksik isim, fiyat, açıklama veya
                    teknik özellik kayıtlarını bul.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={handleDeleteCategory}
                  className="text-left rounded-2xl border border-red-950 bg-red-950/10 hover:bg-red-950/20 transition-all p-5"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-red-950/30 border border-red-900/40 flex items-center justify-center">
                      <Trash2
                        size={18}
                        className="text-red-400"
                      />
                    </div>

                    <span className="text-[9px] font-black uppercase text-red-500/70">
                      TEHLİKELİ
                    </span>
                  </div>

                  <h3 className="text-sm font-black mt-5 text-red-300">
                    Kategoriyi Toplu Temizle
                  </h3>

                  <p className="text-xs text-zinc-600 leading-5 mt-2">
                    Seçili kategorideki bütün ürünleri
                    veritabanından sil.
                  </p>
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-cyan-950 bg-cyan-950/10 p-5">
              <div className="flex gap-3">
                <CheckCircle2
                  size={18}
                  className="text-cyan-400 shrink-0 mt-0.5"
                />

                <div>
                  <h3 className="text-sm font-black text-cyan-400">
                    CSV Formatı
                  </h3>

                  <p className="text-xs text-zinc-500 leading-6 mt-1">
                    Zorunlu sütun:
                    <strong className="text-zinc-300">
                      {" "}
                      name
                    </strong>
                    . Önerilen sütunlar:
                    <strong className="text-zinc-300">
                      {" "}
                      slug, price, description
                    </strong>
                    . Bunların dışındaki sütunlar otomatik
                    olarak teknik özellik yani specs içine
                    kaydedilir.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}