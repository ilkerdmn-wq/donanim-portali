"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  PackageSearch,
  Loader2,
  ShieldCheck,
  Eye,
  KeyRound,
  FileSpreadsheet,
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

type CategoryStats = {
  total: number;
  validPrice: number;
  invalidPrice: number;
};

type PreviewItem = {
  rawName?: string;
  name: string;
  price: number;
  productUrl?: string;
  specs?: Record<string, string>;
  matchStatus?: "existing" | "new";
  existingId?: number;
};

type ImportResponse = {
  success: boolean;
  category?: CategoryKey;
  mode?: "preview" | "commit";
  found?: number;
  inserted?: number;
  updated?: number;
  sourcesCreated?: number;
  skipped?: number;
  errors?: string[];
  preview?: PreviewItem[];
};

const categories: {
  key: CategoryKey;
  title: string;
  description: string;
}[] = [
  {
    key: "islemciler",
    title: "İşlemciler",
    description: "CPU kayıtlarını yönet.",
  },
  {
    key: "ekran-kartlari",
    title: "Ekran Kartları",
    description: "GPU kayıtlarını yönet.",
  },
  {
    key: "anakartlar",
    title: "Anakartlar",
    description: "Anakart kayıtlarını yönet.",
  },
  {
    key: "bellekler",
    title: "Bellekler",
    description: "RAM kayıtlarını yönet.",
  },
  {
    key: "guc-kaynaklari",
    title: "Güç Kaynakları",
    description: "PSU kayıtlarını yönet.",
  },
  {
    key: "depolama",
    title: "Depolama",
    description: "SSD ve depolama kayıtlarını yönet.",
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
      if (
        insideQuotes &&
        line[i + 1] === '"'
      ) {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (
      char === "," &&
      !insideQuotes
    ) {
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
  const cleanText =
    text.replace(/^\uFEFF/, "");

  const lines = cleanText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error(
      "CSV dosyasında veri bulunamadı."
    );
  }

  const headers =
    parseCSVLine(lines[0]).map(
      (header) =>
        header.toLowerCase().trim()
    );

  const nameIndex =
    headers.indexOf("name");

  const slugIndex =
    headers.indexOf("slug");

  const priceIndex =
    headers.indexOf("price");

  const descriptionIndex =
    headers.indexOf(
      "description"
    );

  if (nameIndex === -1) {
    throw new Error(
      'CSV dosyasında "name" sütunu bulunmak zorunda.'
    );
  }

  const rows: ParsedRow[] = [];

  for (
    let i = 1;
    i < lines.length;
    i++
  ) {
    const values =
      parseCSVLine(lines[i]);

    const name =
      values[nameIndex]?.trim();

    if (!name) {
      continue;
    }

    const rawPrice =
      priceIndex >= 0
        ? values[
            priceIndex
          ]?.trim() || "0"
        : "0";

    let numericPrice = 0;

    if (rawPrice) {
      const normalizedPrice =
        rawPrice
          .replace(/\s/g, "")
          .replace(/₺/g, "")
          .replace(/TL/gi, "")
          .replace(/\./g, "")
          .replace(",", ".")
          .replace(
            /[^\d.]/g,
            ""
          );

      numericPrice =
        Number(
          normalizedPrice
        );
    }

    if (
      !Number.isFinite(
        numericPrice
      )
    ) {
      numericPrice = 0;
    }

    const specs: Record<
      string,
      string
    > = {};

    headers.forEach(
      (
        header,
        index
      ) => {
        if (
          header !== "name" &&
          header !== "slug" &&
          header !== "price" &&
          header !==
            "description"
        ) {
          const value =
            values[
              index
            ]?.trim();

          if (value) {
            specs[header] =
              value;
          }
        }
      }
    );

    rows.push({
      name,
      slug:
        slugIndex >= 0 &&
        values[
          slugIndex
        ]?.trim()
          ? createSlug(
              values[
                slugIndex
              ]
            )
          : createSlug(name),
      price: numericPrice,
      description:
        descriptionIndex >=
        0
          ? values[
              descriptionIndex
            ]?.trim() ||
            ""
          : "",
      specs,
    });
  }

  return rows;
}

function escapeCSV(
  value: unknown
) {
  const str =
    value === null ||
    value === undefined
      ? ""
      : String(value);

  if (
    str.includes(",") ||
    str.includes('"') ||
    str.includes("\n")
  ) {
    return `"${str.replace(
      /"/g,
      '""'
    )}"`;
  }

  return str;
}

function formatNumber(
  value: number
) {
  return Math.round(
    value
  ).toLocaleString("tr-TR");
}

export default function BulkDataManagementPage() {
  const [
    selectedCategory,
    setSelectedCategory,
  ] =
    useState<CategoryKey>(
      "islemciler"
    );

  const [
    selectedFile,
    setSelectedFile,
  ] =
    useState<File | null>(
      null
    );

  const [
    parsedRows,
    setParsedRows,
  ] =
    useState<ParsedRow[]>(
      []
    );

  const [
    secret,
    setSecret,
  ] =
    useState("");

  const [
    showSecret,
    setShowSecret,
  ] =
    useState(false);

  const [
    isLoadingStats,
    setIsLoadingStats,
  ] =
    useState(true);

  const [
    stats,
    setStats,
  ] =
    useState<CategoryStats>({
      total: 0,
      validPrice: 0,
      invalidPrice: 0,
    });

  const [
    isPreviewing,
    setIsPreviewing,
  ] =
    useState(false);

  const [
    isSyncing,
    setIsSyncing,
  ] =
    useState(false);

  const [
    isPriceUpdating,
    setIsPriceUpdating,
  ] =
    useState(false);

  const [
    isImporting,
    setIsImporting,
  ] =
    useState(false);

  const [
    isExporting,
    setIsExporting,
  ] =
    useState(false);

  const [
    isValidating,
    setIsValidating,
  ] =
    useState(false);

  const [
    previewResult,
    setPreviewResult,
  ] =
    useState<
      ImportResponse | null
    >(null);

  const [
    message,
    setMessage,
  ] =
    useState("");

  const selectedCategoryInfo =
    useMemo(
      () =>
        categories.find(
          (item) =>
            item.key ===
            selectedCategory
        )!,
      [selectedCategory]
    );

  useEffect(() => {
    try {
      const stored =
        sessionStorage.getItem(
          "donanim_portali_admin_secret"
        );

      if (stored) {
        setSecret(stored);
      }
    } catch {
      // sessionStorage kullanılamıyorsa sessizce geç.
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [selectedCategory]);

  const saveSecret = (
    value: string
  ) => {
    setSecret(value);

    try {
      sessionStorage.setItem(
        "donanim_portali_admin_secret",
        value
      );
    } catch {
      // sessionStorage kullanılamıyorsa sessizce geç.
    }
  };

  const loadStats = async () => {
    setIsLoadingStats(
      true
    );

    try {
      const {
        data,
        error,
      } = await supabase
        .from(
          "hardware_items_with_price"
        )
        .select(
          "id,current_price,has_valid_price"
        )
        .eq(
          "category",
          selectedCategory
        );

      if (error) {
        throw error;
      }

      const items =
        data || [];

      const validPrice =
        items.filter(
          (item: any) =>
            item.has_valid_price ===
              true &&
            item.current_price !==
              null
        ).length;

      setStats({
        total:
          items.length,
        validPrice,
        invalidPrice:
          items.length -
          validPrice,
      });
    } catch (error) {
      console.error(
        "İstatistik yükleme hatası:",
        error
      );

      setStats({
        total: 0,
        validPrice: 0,
        invalidPrice: 0,
      });
    } finally {
      setIsLoadingStats(
        false
      );
    }
  };

  const requireSecret = () => {
    if (!secret.trim()) {
      alert(
        "Inventus ve fiyat işlemleri için yönetim anahtarını gir."
      );

      return false;
    }

    return true;
  };

  const handleInventusPreview =
    async () => {
      if (!requireSecret()) {
        return;
      }

      setIsPreviewing(
        true
      );

      setPreviewResult(
        null
      );

      setMessage("");

      try {
        const params =
          new URLSearchParams({
            category:
              selectedCategory,
          });

        const response =
          await fetch(
            `/api/import/inventus?${params.toString()}`,
            {
              cache:
                "no-store",
              headers: {
                "x-price-update-secret": secret.trim(),
              },
            }
          );

        const result =
          (await response.json()) as ImportResponse;

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.errors?.[0] ||
              "Inventus önizleme başarısız."
          );
        }

        setPreviewResult(
          result
        );

        setMessage(
          `${selectedCategoryInfo.title}: ${result.found || 0} Inventus ürünü bulundu. Önizleme modunda veritabanına yazılmadı.`
        );
      } catch (
        error: any
      ) {
        alert(
          error?.message ||
            "Inventus önizleme başarısız."
        );
      } finally {
        setIsPreviewing(
          false
        );
      }
    };

  const handleInventusSync =
    async () => {
      if (!requireSecret()) {
        return;
      }

      const confirmed =
        window.confirm(
          `${selectedCategoryInfo.title} kategorisi Inventus ile senkronize edilecek.\n\nMevcut eşleşen kayıtlar güncellenecek, yeni ürünler eklenecek.\n\nDevam edilsin mi?`
        );

      if (!confirmed) {
        return;
      }

      setIsSyncing(true);
      setMessage("");

      try {
        const params =
          new URLSearchParams({
            category:
              selectedCategory,
            commit: "true",
          });

        const response =
          await fetch(
            `/api/import/inventus?${params.toString()}`,
            {
              cache:
                "no-store",
              headers: {
                "x-price-update-secret": secret.trim(),
              },
            }
          );

        const result =
          (await response.json()) as ImportResponse;

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.errors?.[0] ||
              "Inventus senkronizasyonu başarısız."
          );
        }

        setMessage(
          `Inventus senkronizasyonu tamamlandı. Bulunan: ${result.found || 0}, yeni: ${result.inserted || 0}, güncellenen: ${result.updated || 0}, hata: ${result.errors?.length || 0}.`
        );

        setPreviewResult(
          result
        );

        await loadStats();
      } catch (
        error: any
      ) {
        alert(
          error?.message ||
            "Inventus senkronizasyonu başarısız."
        );
      } finally {
        setIsSyncing(
          false
        );
      }
    };

  const handlePriceUpdate =
    async () => {
      if (!requireSecret()) {
        return;
      }

      const confirmed =
        window.confirm(
          "Aktif fiyat kaynakları kontrol edilerek güncel fiyatlar çekilecek.\n\nBu işlem biraz sürebilir.\n\nDevam edilsin mi?"
        );

      if (!confirmed) {
        return;
      }

      setIsPriceUpdating(
        true
      );

      setMessage("");

      try {
        const response =
          await fetch(
            "/api/prices/update",
            {
              cache:
                "no-store",
              headers: {
                "x-price-update-secret": secret.trim(),
              },
            }
          );

        const result =
          await response.json();

        if (
          !response.ok
        ) {
          throw new Error(
            result?.error ||
              "Fiyat güncellemesi başarısız."
          );
        }

        setMessage(
          `Fiyat güncellemesi tamamlandı. Başarılı: ${result?.successful ?? "-"}, başarısız: ${result?.failed ?? "-"}.`
        );

        await loadStats();
      } catch (
        error: any
      ) {
        alert(
          error?.message ||
            "Fiyat güncellemesi başarısız."
        );
      } finally {
        setIsPriceUpdating(
          false
        );
      }
    };

  const handleFileChange =
    async (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      const file =
        event.target
          .files?.[0];

      if (!file) {
        setSelectedFile(
          null
        );

        setParsedRows([]);

        return;
      }

      if (
        !file.name
          .toLowerCase()
          .endsWith(
            ".csv"
          )
      ) {
        alert(
          "Şimdilik sadece CSV dosyası destekleniyor."
        );

        event.target.value =
          "";

        return;
      }

      try {
        const text =
          await file.text();

        const rows =
          parseCSV(
            text
          );

        setSelectedFile(
          file
        );

        setParsedRows(
          rows
        );

        setMessage(
          `${rows.length} kayıt CSV dosyasından okundu.`
        );
      } catch (
        error: any
      ) {
        setSelectedFile(
          null
        );

        setParsedRows([]);

        alert(
          error?.message ||
            "CSV dosyası okunamadı."
        );
      }
    };

  const handleImport =
    async () => {
      if (!selectedFile) {
        alert(
          "Önce CSV dosyası seç."
        );

        return;
      }

      if (
        parsedRows.length ===
        0
      ) {
        alert(
          "CSV dosyasında aktarılacak kayıt bulunamadı."
        );

        return;
      }

      const confirmed =
        window.confirm(
          `${selectedCategoryInfo.title} kategorisine ${parsedRows.length} CSV kaydı aktarılacak.\n\nInventus tarafından yönetilen mevcut ürünler CSV ile ezilmeyecek.\n\nDevam edilsin mi?`
        );

      if (!confirmed) {
        return;
      }

      setIsImporting(
        true
      );

      setMessage("");

      try {
        const uniqueMap =
          new Map<
            string,
            ParsedRow
          >();

        parsedRows.forEach(
          (row) => {
            uniqueMap.set(
              row.slug,
              row
            );
          }
        );

        const uniqueRows =
          Array.from(
            uniqueMap.values()
          );

        const {
          data:
            existingItems,
          error:
            existingError,
        } = await supabase
          .from(
            "hardware_items"
          )
          .select(
            "id,slug,price_source"
          )
          .eq(
            "category",
            selectedCategory
          );

        if (
          existingError
        ) {
          throw existingError;
        }

        const existingMap =
          new Map<
            string,
            {
              id: number;
              price_source:
                | string
                | null;
            }
          >();

        (
          existingItems ||
          []
        ).forEach(
          (item: any) => {
            existingMap.set(
              item.slug,
              {
                id: item.id,
                price_source:
                  item.price_source,
              }
            );
          }
        );

        let insertedCount =
          0;

        let updatedCount =
          0;

        let protectedCount =
          0;

        for (
          const row of
          uniqueRows
        ) {
          const existing =
            existingMap.get(
              row.slug
            );

          if (
            existing &&
            existing.price_source ===
              "Inventus"
          ) {
            protectedCount++;
            continue;
          }

          const payload = {
            slug: row.slug,
            category:
              selectedCategory,
            name: row.name,
            price:
              row.price > 0
                ? row.price
                : 1,
            description:
              row.description,
            specs:
              row.specs,
            updated_at:
              new Date().toISOString(),
          };

          if (existing) {
            const {
              error,
            } = await supabase
              .from(
                "hardware_items"
              )
              .update(
                payload
              )
              .eq(
                "id",
                existing.id
              );

            if (error) {
              throw error;
            }

            updatedCount++;
          } else {
            const {
              data,
              error,
            } = await supabase
              .from(
                "hardware_items"
              )
              .insert(
                payload
              )
              .select(
                "id,slug"
              )
              .single();

            if (error) {
              throw error;
            }

            if (data) {
              existingMap.set(
                data.slug,
                {
                  id:
                    data.id,
                  price_source:
                    null,
                }
              );
            }

            insertedCount++;
          }
        }

        setMessage(
          `CSV aktarımı tamamlandı. Yeni: ${insertedCount}, güncellenen: ${updatedCount}, Inventus koruması nedeniyle atlanan: ${protectedCount}.`
        );

        setSelectedFile(
          null
        );

        setParsedRows([]);

        await loadStats();
      } catch (
        error: any
      ) {
        alert(
          "CSV aktarımında hata oluştu.\n\n" +
            (error?.message ||
              JSON.stringify(
                error
              ))
        );
      } finally {
        setIsImporting(
          false
        );
      }
    };

  const handleExport =
    async () => {
      setIsExporting(
        true
      );

      try {
        const {
          data,
          error,
        } = await supabase
          .from(
            "hardware_items"
          )
          .select(
            "slug,name,price,description,specs,price_source,price_url,price_updated_at"
          )
          .eq(
            "category",
            selectedCategory
          )
          .order(
            "name"
          );

        if (error) {
          throw error;
        }

        if (
          !data ||
          data.length ===
            0
        ) {
          alert(
            "Bu kategoride dışa aktarılacak kayıt bulunamadı."
          );

          return;
        }

        const specKeys =
          new Set<string>();

        data.forEach(
          (item: any) => {
            if (
              item.specs &&
              typeof item.specs ===
                "object"
            ) {
              Object.keys(
                item.specs
              ).forEach(
                (key) =>
                  specKeys.add(
                    key
                  )
              );
            }
          }
        );

        const dynamicSpecKeys =
          Array.from(
            specKeys
          );

        const headers = [
          "slug",
          "name",
          "price",
          "description",
          "price_source",
          "price_url",
          "price_updated_at",
          ...dynamicSpecKeys,
        ];

        const csvRows = [
          headers.join(","),
          ...data.map(
            (item: any) =>
              headers
                .map(
                  (header) => {
                    if (
                      dynamicSpecKeys.includes(
                        header
                      )
                    ) {
                      return escapeCSV(
                        item.specs?.[
                          header
                        ] ??
                          ""
                      );
                    }

                    return escapeCSV(
                      item[
                        header
                      ]
                    );
                  }
                )
                .join(",")
          ),
        ];

        const csvContent =
          "\uFEFF" +
          csvRows.join(
            "\n"
          );

        const blob =
          new Blob(
            [
              csvContent,
            ],
            {
              type: "text/csv;charset=utf-8;",
            }
          );

        const url =
          URL.createObjectURL(
            blob
          );

        const link =
          document.createElement(
            "a"
          );

        link.href = url;

        link.download =
          `${selectedCategory}.csv`;

        document.body.appendChild(
          link
        );

        link.click();

        document.body.removeChild(
          link
        );

        URL.revokeObjectURL(
          url
        );
      } catch (
        error: any
      ) {
        alert(
          "CSV oluşturulamadı.\n\n" +
            (error?.message ||
              JSON.stringify(
                error
              ))
        );
      } finally {
        setIsExporting(
          false
        );
      }
    };

  const handleValidation =
    async () => {
      setIsValidating(
        true
      );

      try {
        const {
          data,
          error,
        } = await supabase
          .from(
            "hardware_items_with_price"
          )
          .select(
            "id,name,slug,description,specs,current_price,has_valid_price"
          )
          .eq(
            "category",
            selectedCategory
          );

        if (error) {
          throw error;
        }

        if (
          !data ||
          data.length ===
            0
        ) {
          alert(
            "Bu kategoride kayıt bulunamadı."
          );

          return;
        }

        const missingData =
          data.filter(
            (item: any) => {
              const hasSpecs =
                item.specs &&
                typeof item.specs ===
                  "object" &&
                Object.keys(
                  item.specs
                ).length >
                  0;

              return (
                !item.name ||
                !item.slug ||
                !item.description ||
                !hasSpecs
              );
            }
          );

        const invalidPrice =
          data.filter(
            (item: any) =>
              item.has_valid_price !==
                true ||
              item.current_price ===
                null
          );

        alert(
          `Kontrol tamamlandı.\n\nToplam: ${data.length}\nEksik temel veri: ${missingData.length}\nGeçerli fiyatı olmayan: ${invalidPrice.length}`
        );
      } catch (
        error: any
      ) {
        alert(
          "Veriler kontrol edilemedi.\n\n" +
            (error?.message ||
              JSON.stringify(
                error
              ))
        );
      } finally {
        setIsValidating(
          false
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
          <ArrowLeft
            size={14}
          />
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
                Inventus senkronizasyonu, fiyat
                güncelleme, CSV işlemleri ve veri
                kontrolünü tek merkezden yönet.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 mb-6">
          <div className="flex gap-3">
            <ShieldCheck
              size={18}
              className="text-amber-400 shrink-0 mt-0.5"
            />

            <p className="text-xs text-amber-100/80 leading-6">
              Güvenlik nedeniyle eski toplu yüzde
              fiyat değiştirme ve kategori toplu
              silme işlemleri kaldırıldı. Inventus
              fiyatları otomatik fiyat sistemi
              üzerinden güncellenir.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            label="Toplam Ürün"
            value={
              isLoadingStats
                ? "..."
                : formatNumber(
                    stats.total
                  )
            }
            icon={
              <PackageSearch
                size={18}
                className="text-cyan-400"
              />
            }
          />

          <StatCard
            label="Geçerli Fiyat"
            value={
              isLoadingStats
                ? "..."
                : formatNumber(
                    stats.validPrice
                  )
            }
            icon={
              <CheckCircle2
                size={18}
                className="text-emerald-400"
              />
            }
          />

          <StatCard
            label="Fiyat Bekleyen"
            value={
              isLoadingStats
                ? "..."
                : formatNumber(
                    stats.invalidPrice
                  )
            }
            icon={
              <AlertTriangle
                size={18}
                className="text-amber-400"
              />
            }
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 flex flex-col gap-6">
            <section className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-5">
              <p className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                KATEGORİ
              </p>

              <h2 className="text-xl font-black mt-1 mb-4">
                Veri Grubu
              </h2>

              <div className="flex flex-col gap-2">
                {categories.map(
                  (
                    category
                  ) => {
                    const active =
                      selectedCategory ===
                      category.key;

                    return (
                      <button
                        key={
                          category.key
                        }
                        type="button"
                        onClick={() => {
                          setSelectedCategory(
                            category.key
                          );

                          setSelectedFile(
                            null
                          );

                          setParsedRows(
                            []
                          );

                          setPreviewResult(
                            null
                          );

                          setMessage(
                            ""
                          );
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
                            {
                              category.title
                            }
                          </span>

                          {active && (
                            <CheckCircle2
                              size={16}
                              className="text-cyan-400"
                            />
                          )}
                        </div>

                        <p className="text-[11px] text-zinc-600 mt-1.5">
                          {
                            category.description
                          }
                        </p>
                      </button>
                    );
                  }
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-5">
              <div className="flex items-center gap-2 mb-4">
                <KeyRound
                  size={16}
                  className="text-cyan-400"
                />

                <h2 className="text-sm font-black">
                  Yönetim Anahtarı
                </h2>
              </div>

              <div className="relative">
                <input
                  type={
                    showSecret
                      ? "text"
                      : "password"
                  }
                  value={secret}
                  onChange={(
                    e
                  ) =>
                    saveSecret(
                      e.target.value
                    )
                  }
                  placeholder="PRICE_UPDATE_SECRET"
                  autoComplete="off"
                  className="w-full h-11 px-4 pr-11 rounded-xl border border-zinc-800 bg-zinc-950 text-sm text-white outline-none focus:border-cyan-500/50"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowSecret(
                      (
                        prev
                      ) => !prev
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-cyan-400"
                >
                  <Eye
                    size={16}
                  />
                </button>
              </div>

              <p className="text-[10px] text-zinc-600 mt-2 leading-5">
                Anahtar yalnızca bu tarayıcı
                sekmesinin sessionStorage alanında
                tutulur; koda yazılmaz.
              </p>
            </section>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-6">
            <section className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">
              <p className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                INVENTUS
              </p>

              <h2 className="text-xl font-black mt-1">
                Otomatik Senkronizasyon
              </h2>

              <p className="text-xs text-zinc-500 mt-2 leading-5">
                Seçili kategori:{" "}
                <strong className="text-zinc-300">
                  {
                    selectedCategoryInfo.title
                  }
                </strong>
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
                <button
                  type="button"
                  disabled={
                    isPreviewing ||
                    isSyncing
                  }
                  onClick={
                    handleInventusPreview
                  }
                  className="h-12 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/15 disabled:opacity-50 text-cyan-400 font-black text-sm inline-flex items-center justify-center gap-2"
                >
                  {isPreviewing ? (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <Eye
                      size={16}
                    />
                  )}

                  Önizleme
                </button>

                <button
                  type="button"
                  disabled={
                    isPreviewing ||
                    isSyncing
                  }
                  onClick={
                    handleInventusSync
                  }
                  className="h-12 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-zinc-950 font-black text-sm inline-flex items-center justify-center gap-2"
                >
                  {isSyncing ? (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <RefreshCw
                      size={16}
                    />
                  )}

                  Inventus ile Eşitle
                </button>
              </div>

              {previewResult && (
                <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950/60 overflow-hidden">
                  <div className="p-4 border-b border-zinc-800 grid grid-cols-2 md:grid-cols-5 gap-3">
                    <MiniStat
                      title="Bulunan"
                      value={
                        previewResult.found ||
                        0
                      }
                    />

                    <MiniStat
                      title="Yeni"
                      value={
                        previewResult.preview?.filter(
                          (
                            item
                          ) =>
                            item.matchStatus ===
                            "new"
                        )
                          .length ||
                        previewResult.inserted ||
                        0
                      }
                    />

                    <MiniStat
                      title="Mevcut"
                      value={
                        previewResult.preview?.filter(
                          (
                            item
                          ) =>
                            item.matchStatus ===
                            "existing"
                        )
                          .length ||
                        previewResult.updated ||
                        0
                      }
                    />

                    <MiniStat
                      title="Kaynak"
                      value={
                        previewResult.sourcesCreated ||
                        0
                      }
                    />

                    <MiniStat
                      title="Hata"
                      value={
                        previewResult.errors?.length ||
                        0
                      }
                    />
                  </div>

                  {previewResult.preview &&
                    previewResult.preview.length >
                      0 && (
                      <div className="max-h-[280px] overflow-auto">
                        {previewResult.preview
                          .slice(
                            0,
                            12
                          )
                          .map(
                            (
                              item,
                              index
                            ) => (
                              <div
                                key={`${item.productUrl || item.name}-${index}`}
                                className="px-4 py-3 border-b border-zinc-800/60 last:border-b-0 flex items-center justify-between gap-4"
                              >
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-zinc-200 truncate">
                                    {
                                      item.name
                                    }
                                  </p>

                                  <p className="text-[10px] text-zinc-600 mt-1">
                                    {
                                      item.matchStatus ===
                                      "existing"
                                        ? "Mevcut kayıt"
                                        : "Yeni kayıt"
                                    }
                                  </p>
                                </div>

                                <span className="text-xs font-black text-cyan-400 whitespace-nowrap">
                                  {formatNumber(
                                    Number(
                                      item.price ||
                                      0
                                    )
                                  )}{" "}
                                  ₺
                                </span>
                              </div>
                            )
                          )}
                      </div>
                    )}
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">
              <p className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                FİYAT SİSTEMİ
              </p>

              <h2 className="text-xl font-black mt-1">
                Kaynak Fiyatlarını Güncelle
              </h2>

              <p className="text-xs text-zinc-500 mt-2 leading-5">
                Aktif fiyat kaynaklarını kontrol
                ederek doğrulanmış fiyatları
                yeniler. Manuel yüzde fiyat
                değiştirme kullanılmaz.
              </p>

              <button
                type="button"
                disabled={
                  isPriceUpdating
                }
                onClick={
                  handlePriceUpdate
                }
                className="w-full mt-5 h-12 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15 disabled:opacity-50 text-emerald-400 font-black text-sm inline-flex items-center justify-center gap-2"
              >
                {isPriceUpdating ? (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <RefreshCw
                    size={16}
                  />
                )}

                Güncel Fiyatları Çek
              </button>
            </section>

            <section className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">
              <p className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                CSV
              </p>

              <h2 className="text-xl font-black mt-1">
                Dosya İşlemleri
              </h2>

              <p className="text-xs text-zinc-500 mt-2">
                CSV içe aktarımında Inventus
                tarafından yönetilen mevcut
                kayıtlar korunur.
              </p>

              <label className="block mt-5 rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/40 hover:border-cyan-500/40 transition-all cursor-pointer p-7">
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={
                    handleFileChange
                  }
                />

                <div className="flex flex-col items-center text-center">
                  <FileSpreadsheet
                    size={24}
                    className="text-cyan-400"
                  />

                  <p className="text-sm font-black mt-3">
                    CSV seçmek için tıkla
                  </p>

                  {selectedFile && (
                    <p className="text-xs text-cyan-400 mt-2">
                      {
                        selectedFile.name
                      }{" "}
                      •{" "}
                      {
                        parsedRows.length
                      }{" "}
                      kayıt
                    </p>
                  )}
                </div>
              </label>

              {parsedRows.length >
                0 && (
                <div className="mt-4 max-h-[220px] overflow-auto rounded-2xl border border-zinc-800">
                  {parsedRows
                    .slice(
                      0,
                      8
                    )
                    .map(
                      (
                        row,
                        index
                      ) => (
                        <div
                          key={`${row.slug}-${index}`}
                          className="p-3 border-b border-zinc-800/60 last:border-0 flex justify-between gap-4"
                        >
                          <span className="text-xs text-zinc-300">
                            {
                              row.name
                            }
                          </span>

                          <span className="text-xs font-bold text-cyan-400">
                            {formatNumber(
                              row.price
                            )}{" "}
                            ₺
                          </span>
                        </div>
                      )
                    )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <button
                  type="button"
                  disabled={
                    isImporting ||
                    parsedRows.length ===
                      0
                  }
                  onClick={
                    handleImport
                  }
                  className="h-11 rounded-xl bg-zinc-100 hover:bg-white disabled:opacity-40 text-zinc-950 font-black text-xs inline-flex items-center justify-center gap-2"
                >
                  {isImporting ? (
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />
                  ) : (
                    <Upload
                      size={15}
                    />
                  )}

                  CSV İçe Aktar
                </button>

                <button
                  type="button"
                  disabled={
                    isExporting
                  }
                  onClick={
                    handleExport
                  }
                  className="h-11 rounded-xl border border-zinc-700 bg-zinc-950 hover:border-cyan-500/30 disabled:opacity-40 text-zinc-300 font-black text-xs inline-flex items-center justify-center gap-2"
                >
                  {isExporting ? (
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />
                  ) : (
                    <Download
                      size={15}
                    />
                  )}

                  CSV Dışa Aktar
                </button>
              </div>
            </section>

            <section className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">
              <p className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                KONTROL
              </p>

              <h2 className="text-xl font-black mt-1">
                Veri Sağlığını Tara
              </h2>

              <button
                type="button"
                disabled={
                  isValidating
                }
                onClick={
                  handleValidation
                }
                className="w-full mt-5 h-12 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/15 disabled:opacity-50 text-amber-400 font-black text-sm inline-flex items-center justify-center gap-2"
              >
                {isValidating ? (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <AlertTriangle
                    size={16}
                  />
                )}

                Eksik ve Fiyatsız Kayıtları Tara
              </button>
            </section>

            {message && (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <p className="text-xs text-emerald-400 font-bold leading-5">
                  {message}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl border border-zinc-800 bg-zinc-950 flex items-center justify-center">
          {icon}
        </div>

        <span className="text-[9px] font-black uppercase tracking-wider text-zinc-600">
          {label}
        </span>
      </div>

      <p className="text-2xl font-black mt-5">
        {value}
      </p>
    </div>
  );
}

function MiniStat({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-wider text-zinc-600 font-black">
        {title}
      </p>

      <p className="text-sm font-black text-zinc-200 mt-1">
        {formatNumber(
          value
        )}
      </p>
    </div>
  );
}
