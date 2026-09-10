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


type CompatibilityState = {
  errors: string[];
  warnings: string[];
  notes: string[];
};

function normalizeText(value: string) {
  return value
    .toLocaleUpperCase("tr-TR")
    .replace(/\s+/g, " ")
    .trim();
}

function getFlexibleSpec(
  item: PricedHardwareItem | null | undefined,
  keys: string[]
) {
  const specs = item?.specs;
  if (!specs) return "";

  for (const key of keys) {
    const direct = specs[key];

    if (
      direct !== undefined &&
      direct !== null &&
      String(direct).trim() !== ""
    ) {
      return String(direct).trim();
    }
  }

  const wanted = keys.map((key) =>
    key.toLocaleLowerCase("tr-TR")
  );

  for (const [key, value] of Object.entries(specs)) {
    if (
      wanted.includes(
        key.toLocaleLowerCase("tr-TR")
      ) &&
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      return String(value).trim();
    }
  }

  return "";
}

function inferSocket(
  item: PricedHardwareItem | null | undefined
) {
  if (!item) return "";

  const raw = normalizeText(
    [
      getFlexibleSpec(item, [
        "Soket",
        "Socket",
        "İşlemci Soketi",
      ]),
      item.name,
      item.description || "",
    ].join(" ")
  );

  const match = raw.match(
    /(AM4|AM5|LGA1200|LGA1700|LGA1851|STR5|STRX4|TR4)/
  );

  return match?.[1] || "";
}

function inferMemoryType(
  item: PricedHardwareItem | null | undefined
) {
  if (!item) return "";

  const raw = normalizeText(
    [
      getFlexibleSpec(item, [
        "Bellek Türü",
        "RAM Tipi",
        "Bellek Desteği",
        "Tür",
      ]),
      item.name,
      item.description || "",
    ].join(" ")
  );

  if (raw.includes("DDR5")) return "DDR5";
  if (raw.includes("DDR4")) return "DDR4";
  if (raw.includes("DDR3")) return "DDR3";

  return "";
}

function parseWatt(value: string) {
  const match = value.match(
    /(\d{2,4})\s*W?/i
  );

  return match ? Number(match[1]) : 0;
}

function getPsuWatt(
  item: PricedHardwareItem | null | undefined
) {
  if (!item) return 0;

  return parseWatt(
    getFlexibleSpec(item, [
      "Güç",
      "Watt",
      "PSU Gücü",
    ]) || item.name
  );
}

function getGpuRecommendedPsu(
  item: PricedHardwareItem | null | undefined
) {
  if (!item) return 0;

  const direct = parseWatt(
    getFlexibleSpec(item, [
      "Önerilen PSU",
      "Önerilen Güç Kaynağı",
      "PSU",
    ])
  );

  if (direct > 0) {
    return direct;
  }

  const name = normalizeText(item.name).replace(/\s+/g, "");

  if (name.includes("RTX5090")) return 1000;
  if (name.includes("RTX5080")) return 850;
  if (name.includes("RTX5070")) return 750;
  if (name.includes("RTX5060TI")) return 650;
  if (name.includes("RTX5060")) return 600;
  if (name.includes("RTX4090")) return 850;
  if (name.includes("RTX4080")) return 850;
  if (name.includes("RTX4070TI")) return 750;
  if (name.includes("RTX4070")) return 650;
  if (name.includes("RTX4060TI")) return 650;
  if (name.includes("RTX4060")) return 550;
  if (name.includes("RTX3050")) return 500;

  if (name.includes("RX7900XTX")) return 850;
  if (name.includes("RX7900")) return 750;
  if (name.includes("RX7800")) return 750;
  if (name.includes("RX7700")) return 700;
  if (name.includes("RX7600")) return 600;

  return 0;
}


function ramCompatibilityFlags(
  item: PricedHardwareItem | null | undefined
) {
  const raw = normalizeText(
    [
      getFlexibleSpec(item, [
        "ECC",
        "Bellek Tipi",
        "RAM Tipi",
        "Modül Tipi",
        "Registered",
        "Unbuffered",
      ]),
      item?.name || "",
      item?.description || "",
    ].join(" ")
  );

  return {
    isRegistered:
      raw.includes("RDIMM") ||
      raw.includes("REGISTERED"),
    isEcc: raw.includes("ECC"),
    isUdimm:
      raw.includes("UDIMM") ||
      raw.includes("UNBUFFERED"),
  };
}

function motherboardRamFlags(
  item: PricedHardwareItem | null | undefined
) {
  const raw = normalizeText(
    [
      getFlexibleSpec(item, [
        "ECC Desteği",
        "Bellek Desteği",
        "RAM Desteği",
        "Registered Memory",
        "UDIMM",
      ]),
      item?.name || "",
      item?.description || "",
    ].join(" ")
  );

  return {
    supportsRegistered:
      raw.includes("RDIMM") ||
      raw.includes("REGISTERED"),
    mentionsEcc:
      raw.includes("ECC"),
    mentionsUdimm:
      raw.includes("UDIMM"),
  };
}

function cpuClassScore(
  item: PricedHardwareItem | null | undefined
) {
  if (!item) return 0;

  const n = normalizeText(item.name);

  if (n.includes("7800X3D")) return 90;
  if (n.includes("9800X3D")) return 96;
  if (n.includes("7950X3D")) return 96;
  if (n.includes("9950X3D")) return 100;

  const ryzen = n.match(
    /RYZEN\s+[3579]\s+(\d{4})/
  );

  if (ryzen) {
    const model = Number(ryzen[1]);

    if (model >= 9900) return 95;
    if (model >= 9700) return 86;
    if (model >= 9600) return 78;
    if (model >= 7950) return 94;
    if (model >= 7900) return 90;
    if (model >= 7800) return 88;
    if (model >= 7700) return 82;
    if (model >= 7600) return 74;
    if (model >= 5950) return 82;
    if (model >= 5900) return 79;
    if (model >= 5800) return 76;
    if (model >= 5700) return 70;
    if (model >= 5600) return 64;
    if (model >= 5500) return 56;
  }

  const intel = n.match(
    /I[3579]-(\d{4,5})/
  );

  if (intel) {
    const model = Number(intel[1]);

    if (model >= 14900) return 100;
    if (model >= 14700) return 94;
    if (model >= 14600) return 88;
    if (model >= 14500) return 80;
    if (model >= 14400) return 74;
    if (model >= 13900) return 97;
    if (model >= 13700) return 91;
    if (model >= 13600) return 85;
    if (model >= 13500) return 78;
    if (model >= 13400) return 72;
    if (model >= 12900) return 88;
    if (model >= 12700) return 82;
    if (model >= 12600) return 76;
    if (model >= 12400) return 68;
  }

  return 60;
}

function gpuClassScore(
  item: PricedHardwareItem | null | undefined
) {
  if (!item) return 0;

  const n = normalizeText(item.name)
    .replace(/\s+/g, "");

  const rtx = n.match(
    /RTX(\d{4})(TI|SUPER)?/
  );

  if (rtx) {
    const model = Number(rtx[1]);
    const variant = rtx[2] || "";
    let score = 0;

    if (model >= 5090) score = 100;
    else if (model >= 5080) score = 94;
    else if (model >= 5070) score = 84;
    else if (model >= 5060) score = 72;
    else if (model >= 4090) score = 98;
    else if (model >= 4080) score = 92;
    else if (model >= 4070) score = 82;
    else if (model >= 4060) score = 68;
    else if (model >= 3090) score = 84;
    else if (model >= 3080) score = 78;
    else if (model >= 3070) score = 70;
    else if (model >= 3060) score = 60;
    else if (model >= 3050) score = 48;

    if (variant === "TI") score += 5;
    if (variant === "SUPER") score += 3;

    return score;
  }

  const rx = n.match(
    /RX(\d{4})(XT|XTX)?/
  );

  if (rx) {
    const model = Number(rx[1]);
    const variant = rx[2] || "";
    let score = 0;

    if (model >= 9070) score = 86;
    else if (model >= 7900) score = 90;
    else if (model >= 7800) score = 82;
    else if (model >= 7700) score = 74;
    else if (model >= 7600) score = 64;
    else if (model >= 6950) score = 80;
    else if (model >= 6900) score = 77;
    else if (model >= 6800) score = 72;
    else if (model >= 6750) score = 66;
    else if (model >= 6700) score = 62;
    else if (model >= 6650) score = 56;
    else if (model >= 6600) score = 52;

    if (variant === "XT") score += 4;
    if (variant === "XTX") score += 7;

    return score;
  }

  return 55;
}

function checkCompatibility(
  parts: SelectedParts
): CompatibilityState {
  const errors: string[] = [];
  const warnings: string[] = [];
  const notes: string[] = [];

  const cpuSocket = inferSocket(parts.islemci);
  const boardSocket = inferSocket(parts.anakart);

  if (parts.islemci && parts.anakart) {
    if (
      cpuSocket &&
      boardSocket &&
      cpuSocket !== boardSocket
    ) {
      errors.push(
        `İşlemci soketi (${cpuSocket}) ile anakart soketi (${boardSocket}) uyumlu değil.`
      );
    } else if (!cpuSocket || !boardSocket) {
      warnings.push(
        "İşlemci / anakart soket bilgisi eksik olduğu için soket uyumu kesin doğrulanamadı."
      );
    }
  }

  const boardMemory =
    inferMemoryType(parts.anakart);

  const ramMemory =
    inferMemoryType(parts.ram);

  if (parts.anakart && parts.ram) {
    if (
      boardMemory &&
      ramMemory &&
      boardMemory !== ramMemory
    ) {
      errors.push(
        `Anakart ${boardMemory}, seçilen RAM ise ${ramMemory}. Bellek türleri uyumlu değil.`
      );
    } else if (!boardMemory || !ramMemory) {
      warnings.push(
        "Anakart / RAM bellek türü bilgisi eksik olduğu için DDR uyumu kesin doğrulanamadı."
      );
    }

    const ramFlags =
      ramCompatibilityFlags(parts.ram);

    const boardFlags =
      motherboardRamFlags(parts.anakart);

    if (
      ramFlags.isRegistered &&
      !boardFlags.supportsRegistered
    ) {
      errors.push(
        "Seçilen RAM Registered/RDIMM tipinde görünüyor. Bu anakartla uyumlu kabul edilmedi."
      );
    } else if (
      ramFlags.isEcc &&
      !ramFlags.isRegistered
    ) {
      warnings.push(
        "Seçilen RAM ECC özellikli görünüyor. Anakart desteğini üretici belgesinden ayrıca doğrulayın."
      );
    }
  }

  if (
    parts["ekran-karti"] &&
    parts.psu
  ) {
    const psuWatt =
      getPsuWatt(parts.psu);

    const recommended =
      getGpuRecommendedPsu(
        parts["ekran-karti"]
      );

    if (
      recommended > 0 &&
      psuWatt > 0 &&
      psuWatt < recommended
    ) {
      errors.push(
        `Seçilen ekran kartı için yaklaşık ${recommended}W PSU öneriliyor; seçilen PSU ${psuWatt}W.`
      );
    } else if (
      recommended > 0 &&
      psuWatt === 0
    ) {
      warnings.push(
        "PSU watt bilgisi okunamadığı için ekran kartı güç gereksinimi kesin doğrulanamadı."
      );
    }
  }

  if (
    parts.islemci &&
    parts["ekran-karti"]
  ) {
    const cpuScore =
      cpuClassScore(parts.islemci);

    const gpuScore =
      gpuClassScore(
        parts["ekran-karti"]
      );

    const diff = gpuScore - cpuScore;

    if (diff >= 25) {
      warnings.push(
        "Ekran kartı, işlemciye göre belirgin şekilde daha üst sınıfta. Özellikle 1080p oyunlarda CPU sınırlaması oluşabilir."
      );
    } else if (diff <= -28) {
      notes.push(
        "İşlemci ekran kartına göre oldukça güçlü. Oyun performansını ağırlıklı olarak GPU belirleyecektir."
      );
    }
  }

  return {
    errors,
    warnings,
    notes,
  };
}

function isCompatibleCandidate(
  category: string,
  item: PricedHardwareItem,
  selected: SelectedParts
) {
  if (category === "islemci") {
    const boardSocket =
      inferSocket(selected.anakart);

    const cpuSocket =
      inferSocket(item);

    if (
      boardSocket &&
      cpuSocket &&
      boardSocket !== cpuSocket
    ) {
      return false;
    }
  }

  if (category === "anakart") {
    const cpuSocket =
      inferSocket(selected.islemci);

    const boardSocket =
      inferSocket(item);

    if (
      cpuSocket &&
      boardSocket &&
      cpuSocket !== boardSocket
    ) {
      return false;
    }

    const ramType =
      inferMemoryType(selected.ram);

    const boardMemory =
      inferMemoryType(item);

    if (
      ramType &&
      boardMemory &&
      ramType !== boardMemory
    ) {
      return false;
    }
  }

  if (category === "ram") {
    const boardMemory =
      inferMemoryType(selected.anakart);

    const ramType =
      inferMemoryType(item);

    if (
      boardMemory &&
      ramType &&
      boardMemory !== ramType
    ) {
      return false;
    }

    const ramFlags =
      ramCompatibilityFlags(item);

    const boardFlags =
      motherboardRamFlags(
        selected.anakart
      );

    if (
      ramFlags.isRegistered &&
      selected.anakart &&
      !boardFlags.supportsRegistered
    ) {
      return false;
    }
  }

  if (category === "psu") {
    const recommended =
      getGpuRecommendedPsu(
        selected["ekran-karti"]
      );

    const watt =
      getPsuWatt(item);

    if (
      recommended > 0 &&
      watt > 0 &&
      watt < recommended
    ) {
      return false;
    }
  }

  return true;
}

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

  const compatibility =
    checkCompatibility(
      selectedParts
    );

  const compatibleItems =
    activeCategory
      ? (
          hardwareData[
            activeCategory
          ] || []
        ).filter((item) =>
          isCompatibleCandidate(
            activeCategory,
            item,
            selectedParts
          )
        )
      : [];

  const handleResetAll = () => {
    setSelectedParts({});
    setActiveCategory(null);
  };

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
                            <>
                              <h4 className="text-sm font-bold text-white truncate">
                                {selected.name}
                              </h4>

                              <div className="flex flex-wrap gap-2 mt-1">
                              {cat.id === "islemci" &&
                                inferSocket(selected) && (
                                  <span className="text-[10px] text-zinc-500">
                                    Soket: {inferSocket(selected)}
                                  </span>
                                )}

                              {cat.id === "anakart" && (
                                <>
                                  {inferSocket(selected) && (
                                    <span className="text-[10px] text-zinc-500">
                                      Soket: {inferSocket(selected)}
                                    </span>
                                  )}

                                  {inferMemoryType(selected) && (
                                    <span className="text-[10px] text-zinc-500">
                                      RAM: {inferMemoryType(selected)}
                                    </span>
                                  )}
                                </>
                              )}

                              {cat.id === "ram" &&
                                inferMemoryType(selected) && (
                                  <span className="text-[10px] text-zinc-500">
                                    {inferMemoryType(selected)}
                                  </span>
                                )}

                              {cat.id === "psu" &&
                                getPsuWatt(selected) > 0 && (
                                  <span className="text-[10px] text-zinc-500">
                                    {getPsuWatt(selected)}W
                                  </span>
                                )}
                              </div>
                            </>
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
              <div className="flex items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                <h3 className="text-base font-bold text-white">
                  Sistem Özeti
                </h3>

                {Object.keys(selectedParts).length > 0 && (
                  <button
                    type="button"
                    onClick={handleResetAll}
                    className="text-[11px] font-bold text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    Tümünü Temizle
                  </button>
                )}
              </div>

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

              <div
                className={`p-4 rounded-2xl border ${
                  compatibility.errors.length > 0
                    ? "border-red-500/30 bg-red-500/5"
                    : compatibility.warnings.length > 0
                    ? "border-amber-500/30 bg-amber-500/5"
                    : compatibility.notes.length > 0
                    ? "border-cyan-500/30 bg-cyan-500/5"
                    : Object.keys(selectedParts).length >= 2
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-zinc-800 bg-zinc-950"
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck
                    size={16}
                    className={
                      compatibility.errors.length > 0
                        ? "text-red-400"
                        : compatibility.warnings.length > 0
                        ? "text-amber-400"
                        : compatibility.notes.length > 0
                        ? "text-cyan-400"
                        : Object.keys(selectedParts).length >= 2
                        ? "text-emerald-400"
                        : "text-zinc-500"
                    }
                  />

                  <span className="text-xs font-black text-white">
                    {compatibility.errors.length > 0
                      ? "Uyumsuz bileşen bulundu"
                      : compatibility.warnings.length > 0
                      ? "Kısmi uyum kontrolü"
                      : compatibility.notes.length > 0
                      ? "Teknik uyumlu, performans notu var"
                      : Object.keys(selectedParts).length >= 2
                      ? "Seçili parçalar uyumlu"
                      : "Uyum kontrolü bekliyor"}
                  </span>
                </div>

                {compatibility.errors.map((error) => (
                  <p
                    key={error}
                    className="text-[11px] text-red-300 mt-2 leading-5"
                  >
                    {error}
                  </p>
                ))}

                {compatibility.warnings.map((warning) => (
                  <p
                    key={warning}
                    className="text-[11px] text-amber-300 mt-2 leading-5"
                  >
                    {warning}
                  </p>
                ))}

                {compatibility.notes.map((note) => (
                  <p
                    key={note}
                    className="text-[11px] text-cyan-300 mt-2 leading-5"
                  >
                    {note}
                  </p>
                ))}

                {compatibility.errors.length === 0 &&
                  compatibility.warnings.length === 0 &&
                  compatibility.notes.length === 0 &&
                  Object.keys(selectedParts).length >= 2 && (
                    <p className="text-[11px] text-emerald-300/80 mt-2 leading-5">
                      Soket, bellek türü ve seçili GPU/PSU bilgileri üzerinden temel uyumluluk kontrolü geçti.
                    </p>
                  )}
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
                  Yalnızca güncel fiyatı doğrulanmış ve seçili parçalarla temel uyumluluk kontrolünden geçen ürünler gösteriliyor.
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
              {compatibleItems.map((item) => (
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

              {compatibleItems.length === 0 && (
                <div className="py-12 text-center text-zinc-500 text-sm">
                  Seçili parçalarla uyumlu ve güncel fiyatı doğrulanmış ürün bulunamadı.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
