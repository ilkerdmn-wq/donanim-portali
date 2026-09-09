"use client";

import { useState } from "react";
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
} from "lucide-react";

import {
  hardwareData,
  HardwareItem as BaseHardwareItem,
} from "@/data/hardwareData";

type HardwareItem = BaseHardwareItem & {
  brand?: string | null;
  description?: string | null;
};

export default function PcToplamaPage() {
  const [selectedParts, setSelectedParts] = useState<{
    islemci?: HardwareItem;
    "ekran-karti"?: HardwareItem;
    anakart?: HardwareItem;
    ram?: HardwareItem;
    psu?: HardwareItem;
    ssd?: HardwareItem;
  }>({});

  const [activeCategory, setActiveCategory] =
    useState<string | null>(null);

  const categories = [
    {
      id: "islemci",
      name: "İşlemci (CPU)",
      icon: Cpu,
    },
    {
      id: "ekran-karti",
      name: "Ekran Kartı (GPU)",
      icon: Monitor,
    },
    {
      id: "anakart",
      name: "Anakart",
      icon: ShieldCheck,
    },
    {
      id: "ram",
      name: "Bellek (RAM)",
      icon: Zap,
    },
    {
      id: "psu",
      name: "Güç Kaynağı (PSU)",
      icon: Zap,
    },
    {
      id: "ssd",
      name: "Depolama (SSD)",
      icon: HardDrive,
    },
  ];

  const totalPrice = Object.values(
    selectedParts
  ).reduce(
    (acc, item) =>
      acc + (item?.price || 0),
    0
  );

  const handleSelectPart = (
    category: string,
    item: HardwareItem
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
      const copy = {
        ...prev,
      };

      delete copy[
        category as keyof typeof copy
      ];

      return copy;
    });
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
          Parçaları birleştirin, toplam bütçeyi görün ve sistem
          uyumluluğunu test edin.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SOL ALAN */}

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
                    cat.id as keyof typeof selectedParts
                  ];

                return (
                  <div
                    key={cat.id}
                    className="p-4 bg-zinc-950 border border-zinc-800/80 rounded-2xl flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-cyan-400">
                        <Icon size={18} />
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                          {cat.name}
                        </span>

                        {selected ? (
                          <h4 className="text-sm font-bold text-white">
                            {selected.name}
                          </h4>
                        ) : (
                          <p className="text-xs text-zinc-600 italic">
                            Seçim yapılmadı
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {selected ? (
                        <>
                          <span className="text-sm font-extrabold text-cyan-400">
                            {selected.price.toLocaleString(
                              "tr-TR"
                            )}{" "}
                            ₺
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
                          onClick={() =>
                            setActiveCategory(
                              cat.id
                            )
                          }
                          className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
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

        {/* SAĞ ALAN */}

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
                <span>
                  Uyumluluk Durumu:
                </span>

                <span className="text-emerald-400 font-bold">
                  Sorunsuz (Uyumlu)
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1 pt-4 border-t border-zinc-800">
              <span className="text-xs text-zinc-400 font-semibold">
                TOPLAM TUTAR
              </span>

              <span className="text-2xl font-extrabold text-cyan-400">
                {totalPrice.toLocaleString(
                  "tr-TR"
                )}{" "}
                ₺
              </span>
            </div>

            <button
              disabled={
                Object.keys(
                  selectedParts
                ).length === 0
              }
              className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 disabled:opacity-50 text-zinc-950 font-bold rounded-2xl transition-all shadow-lg text-sm tracking-wide"
            >
              Sistemi Kaydet ve Paylaş
            </button>
          </div>
        </div>
      </div>

      {/* PARÇA SEÇİM MODALI */}

      {activeCategory && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white capitalize">
                {
                  categories.find(
                    (c) =>
                      c.id ===
                      activeCategory
                  )?.name
                }{" "}
                Seçimi
              </h3>

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
                  className="p-4 bg-zinc-950 border border-zinc-800 hover:border-cyan-500/50 rounded-2xl cursor-pointer transition-all flex justify-between items-center group"
                >
                  <div className="flex flex-col gap-1">
                    {item.brand && (
                      <span className="text-[10px] text-cyan-400 font-semibold">
                        {item.brand}
                      </span>
                    )}

                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {item.name}
                    </h4>

                    {item.description && (
                      <p className="text-[11px] text-zinc-400">
                        {
                          item.description
                        }
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="text-sm font-extrabold text-cyan-400">
                      {item.price.toLocaleString(
                        "tr-TR"
                      )}{" "}
                      ₺
                    </span>

                    <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-[11px] font-bold rounded-xl group-hover:bg-cyan-500 group-hover:text-zinc-950 transition-all">
                      Seç
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}