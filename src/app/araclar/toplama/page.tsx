"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Cpu,
  Monitor,
  Zap,
  HardDrive,
  ShieldCheck,
  Trash2,
  Plus,
  Loader2,
} from "lucide-react";

import type { PricedHardwareItem } from "@/app/lib/hardware-types";

type SelectedParts = {
  islemci?: PricedHardwareItem;
  "ekran-karti"?: PricedHardwareItem;
  anakart?: PricedHardwareItem;
  ram?: PricedHardwareItem;
  psu?: PricedHardwareItem;
  ssd?: PricedHardwareItem;
};

const categories = [
  {
    id: "islemci",
    dbCategory: "islemciler",
    name: "İşlemci (CPU)",
    icon: Cpu,
  },
  {
    id: "ekran-karti",
    dbCategory: "ekran-kartlari",
    name: "Ekran Kartı (GPU)",
    icon: Monitor,
  },
  {
    id: "anakart",
    dbCategory: "anakartlar",
    name: "Anakart",
    icon: ShieldCheck,
  },
  {
    id: "ram",
    dbCategory: "bellekler",
    name: "Bellek (RAM)",
    icon: Zap,
  },
  {
    id: "psu",
    dbCategory: "guc-kaynaklari",
    name: "Güç Kaynağı (PSU)",
    icon: Zap,
  },
  {
    id: "ssd",
    dbCategory: "depolama",
    name: "Depolama (SSD)",
    icon: HardDrive,
  },
];

export default function PcToplamaPage() {
  const [selectedParts, setSelectedParts] =
    useState<SelectedParts>({});

  const [activeCategory, setActiveCategory] =
    useState<string | null>(null);

  const [hardwareData, setHardwareData] = useState<
    Record<string, PricedHardwareItem[]>
  >({});

  const [loadingHardware, setLoadingHardware] =
    useState(true);

  const [loadError, setLoadError] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadHardware() {
      try {
        setLoadingHardware(true);
        setLoadError(null);

        const response = await fetch(
          "/api/hardware/available",
          { cache: "no-store" }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.error || "Donanımlar yüklenemedi."
          );
        }

        const grouped: Record<
          string,
          PricedHardwareItem[]
        > = {};

        for (const category of categories) {
          grouped[category.id] = [];
        }

        for (
          const item of result.items as PricedHardwareItem[]
        ) {
          if (!item.has_valid_price) continue;
          if (item.current_price == null) continue;

          const matchedCategory = categories.find(
            (cat) => cat.dbCategory === item.category
          );

          if (!matchedCategory) continue;

          grouped[matchedCategory.id].push(item);
        }

        for (const key of Object.keys(grouped)) {
          grouped[key].sort((a, b) =>
            a.name.localeCompare(b.name, "tr", {
              sensitivity: "base",
            })
          );
        }

        setHardwareData(grouped);
      } catch (error: any) {
        console.error(
          "Donanımlar yüklenemedi:",
          error
        );

        setLoadError(
          error?.message ||
            "Donanımlar yüklenemedi."
        );
      } finally {
        setLoadingHardware(false);
      }
    }

    loadHardware();
  }, []);

  const totalPrice = Object.values(
    selectedParts
  ).reduce(
    (acc, item) =>
      acc + Number(item?.current_price || 0),
    0
  );

  const handleSelectPart = (
    category: string,
    item: PricedHardwareItem
  ) => {
    setSelectedParts((prev) => ({
      ...prev,
      [category]: item,
    }));

    setActiveCategory(null);
  };

  const handleRemovePart = (
    category: string
  ) => {
    setSelectedParts((prev) => {
      const copy = { ...prev };

      delete copy[
        category as keyof typeof copy
      ];

      return copy;
    });
  };

  const formatPrice = (
    price: number | null | undefined
  ) => {
    if (price == null) return "-";

    return `${Math.round(
      Number(price)
    ).toLocaleString("tr-TR")} ₺`;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link
          href="/araclar"
          className="text-xs text-zinc-400 hover:text-cyan-400 transition-colors flex items-center gap-1 w-fit mb-2"
        >
          <ArrowLeft size={14} />
          Araçlara dön
        </Link>

        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <span className="text-cyan-400">
            📊
          </span>
          PC Toplama ve Karşılaştırma Sihirbazı
        </h1>

        <p className="text-zinc-400 text-sm">
          Parçaları birleştirin, toplam bütçeyi
          görün ve sistem uyumluluğunu test edin.
        </p>

        <p className="text-zinc-500 text-xs">
          Inventus dahil yalnızca güncel fiyatı
          doğrulanmış ürünler listelenir.
        </p>
      </div>

      {loadingHardware && (
        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center gap-3 text-zinc-400">
          <Loader2
            size={18}
            className="animate-spin text-cyan-400"
          />
          Güncel donanımlar yükleniyor...
        </div>
      )}

      {loadError && (
        <div className="p-5 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-300 text-sm">
          {loadError}
        </div>
      )}

      {!loadingHardware && !loadError && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col gap-4 shadow-sm">
              <h2 className="text-base font-bold text-white tracking-wide border-b border-zinc-800 pb-3">
                Sistem Bileşenleri
              </h2>

              <div className="flex flex-col gap-3">
                {categories.map((cat) => {
                  const Icon = cat.icon;

                  const selected =
                    selectedParts[
                      cat.id as keyof SelectedParts
                    ];

                  const availableCount =
                    hardwareData[cat.id]?.length ??
                    0;

                  return (
                    <div
                      key={cat.id}
                      className="p-4 bg-zinc-950 border border-zinc-800/80 rounded-2xl flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-cyan-400 shrink-0">
                          <Icon size={18} />
                        </div>

                        <div className="min-w-0">
                          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                            {cat.name}
                          </span>

                          {selected ? (
                            <h4 className="text-sm font-bold text-white truncate">
                              {selected.name}
                            </h4>
                          ) : (
                            <p className="text-xs text-zinc-600 italic">
                              {availableCount > 0
                                ? `${availableCount} güncel ürün mevcut`
                                : "Güncel fiyatlı ürün bulunamadı"}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        {selected ? (
                          <>
                            <span className="text-sm font-extrabold text-cyan-400">
                              {formatPrice(
                                selected.current_price
                              )}
                            </span>

                            <button
                              onClick={() =>
                                handleRemovePart(
                                  cat.id
                                )
                              }
                              className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                              title="Parçayı Kaldır"
                            >
                              <Trash2
                                size={16}
                              />
                            </button>
                          </>
                        ) : (
                          <button
                            disabled={
                              availableCount === 0
                            }
                            onClick={() =>
                              setActiveCategory(
                                cat.id
                              )
                            }
                            className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Plus size={14} />
                            Parça Seç
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col gap-6 shadow-sm sticky top-24">
              <h3 className="text-base font-bold text-white border-b border-zinc-800 pb-3">
                Sistem Özeti
              </h3>

              <div className="flex flex-col gap-3 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>
                    Eklenen Parça Sayısı:
                  </span>

                  <span className="text-white font-bold">
                    {
                      Object.keys(
                        selectedParts
                      ).length
                    }{" "}
                    / 6
                  </span>
                </div>

                <div className="flex justify-between text-zinc-400">
                  <span>Fiyat Durumu:</span>
                  <span className="text-emerald-400 font-bold">
                    Güncel fiyatlar
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1 pt-4 border-t border-zinc-800">
                <span className="text-xs text-zinc-400 font-semibold">
                  TOPLAM TUTAR
                </span>

                <span className="text-2xl font-extrabold text-cyan-400">
                  {formatPrice(totalPrice)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeCategory && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {
                    categories.find(
                      (c) =>
                        c.id ===
                        activeCategory
                    )?.name
                  }{" "}
                  Seçimi
                </h3>

                <p className="text-xs text-zinc-500 mt-1">
                  Yalnızca güncel fiyatı
                  doğrulanmış ürünler gösteriliyor.
                </p>
              </div>

              <button
                onClick={() =>
                  setActiveCategory(null)
                }
                className="text-zinc-400 hover:text-white font-bold text-lg px-2 py-1 rounded-xl hover:bg-zinc-800 transition-all"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex flex-col gap-3">
              {(
                hardwareData[
                  activeCategory
                ] || []
              ).map((item) => (
                <div
                  key={item.id}
                  onClick={() =>
                    handleSelectPart(
                      activeCategory,
                      item
                    )
                  }
                  className="p-4 bg-zinc-950 border border-zinc-800 hover:border-cyan-500/50 rounded-2xl cursor-pointer transition-all flex justify-between items-center gap-4 group"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {item.name}
                    </h4>

                    {item.description && (
                      <p className="text-[11px] text-zinc-400 line-clamp-2">
                        {
                          item.description
                        }
                      </p>
                    )}

                    {item.current_price_source && (
                      <span className="text-[10px] text-zinc-600">
                        Kaynak:{" "}
                        {
                          item.current_price_source
                        }
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-sm font-extrabold text-cyan-400">
                      {formatPrice(
                        item.current_price
                      )}
                    </span>

                    <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-[11px] font-bold rounded-xl group-hover:bg-cyan-500 group-hover:text-zinc-950 transition-all">
                      Seç
                    </span>
                  </div>
                </div>
              ))}

              {(
                hardwareData[
                  activeCategory
                ]?.length ?? 0
              ) === 0 && (
                <div className="py-12 text-center text-zinc-500 text-sm">
                  Bu kategoride güncel fiyatı
                  doğrulanmış ürün bulunamadı.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
