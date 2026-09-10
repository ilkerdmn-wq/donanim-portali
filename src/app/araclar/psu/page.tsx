"use client";

import {
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Cpu,
  Monitor,
  Zap,
  ShieldCheck,
  Sparkles,
  HardDrive,
  Loader2,
} from "lucide-react";

import type { PricedHardwareItem } from "@/app/lib/hardware-types";

function getSpec(
  item: PricedHardwareItem | null | undefined,
  keys: string[]
) {
  const specs = item?.specs;
  if (!specs) return "";

  for (const key of keys) {
    const value = specs[key];

    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      return String(value);
    }
  }

  return "";
}

function parseWatt(value: string) {
  const match = value.match(
    /(\d{2,4})/
  );

  return match
    ? Number(match[1])
    : 0;
}

function formatPrice(
  value: number | null | undefined
) {
  if (value == null) return "-";

  return `${Math.round(
    Number(value)
  ).toLocaleString("tr-TR")} ₺`;
}


function normalizeText(value: string) {
  return value
    .toLocaleUpperCase("tr-TR")
    .replace(/\s+/g, "")
    .trim();
}

function fallbackGpuPower(
  item: PricedHardwareItem
) {
  const n = normalizeText(item.name);

  const rtx = n.match(
    /RTX(\d{4})(TI|SUPER)?/
  );

  if (rtx) {
    const model = Number(rtx[1]);
    const variant = rtx[2] || "";

    if (model >= 5090) return 575;
    if (model >= 5080) return 360;
    if (model >= 5070) return 250;
    if (model >= 5060) {
      return variant === "TI" ? 180 : 145;
    }
    if (model >= 4090) return 450;
    if (model >= 4080) {
      return variant === "SUPER" ? 320 : 320;
    }
    if (model >= 4070) {
      if (variant === "TI") return 285;
      if (variant === "SUPER") return 220;
      return 200;
    }
    if (model >= 4060) {
      return variant === "TI" ? 160 : 115;
    }
    if (model >= 3090) return 350;
    if (model >= 3080) return 320;
    if (model >= 3070) return 220;
    if (model >= 3060) return 170;
    if (model >= 3050) return 130;
  }

  const rx = n.match(
    /RX(\d{4})(XT|XTX)?/
  );

  if (rx) {
    const model = Number(rx[1]);
    const variant = rx[2] || "";

    if (model >= 9070) {
      return variant === "XT" ? 304 : 220;
    }
    if (model >= 7900) {
      return variant === "XTX" ? 355 : 315;
    }
    if (model >= 7800) return 263;
    if (model >= 7700) return 245;
    if (model >= 7600) return 165;
    if (model >= 6950) return 335;
    if (model >= 6900) return 300;
    if (model >= 6800) return 250;
    if (model >= 6750) return 250;
    if (model >= 6700) return 230;
    if (model >= 6650) return 180;
    if (model >= 6600) return 132;
  }

  const arc = n.match(
    /ARC[A-Z]?(\d{3})/
  );

  if (arc) {
    const model = Number(arc[1]);

    if (model >= 770) return 225;
    if (model >= 750) return 225;
    if (model >= 580) return 185;
  }

  return 200;
}

function fallbackCpuPower(
  item: PricedHardwareItem
) {
  const n = item.name.toUpperCase();

  if (n.includes("7800X3D")) return 120;
  if (n.includes("9800X3D")) return 120;
  if (n.includes("7950X3D")) return 120;
  if (n.includes("9950X3D")) return 170;

  const ryzen = n.match(
    /RYZEN\s+[3579]\s+(\d{4})/
  );

  if (ryzen) {
    const model = Number(ryzen[1]);

    if (model >= 9950) return 170;
    if (model >= 9900) return 120;
    if (model >= 9700) return 65;
    if (model >= 9600) return 65;
    if (model >= 7950) return 170;
    if (model >= 7900) return 120;
    if (model >= 7800) return 120;
    if (model >= 7700) return 65;
    if (model >= 7600) return 65;
    if (model >= 5950) return 105;
    if (model >= 5900) return 105;
    if (model >= 5800) return 105;
    if (model >= 5700) return 65;
    if (model >= 5600) return 65;
    if (model >= 5500) return 65;
  }

  const intel = n.match(
    /I[3579]-(\d{4,5})/
  );

  if (intel) {
    const model = Number(intel[1]);

    if (model >= 14900) return 253;
    if (model >= 14700) return 253;
    if (model >= 14600) return 181;
    if (model >= 14500) return 154;
    if (model >= 14400) return 148;
    if (model >= 13900) return 253;
    if (model >= 13700) return 253;
    if (model >= 13600) return 181;
    if (model >= 13500) return 154;
    if (model >= 13400) return 148;
    if (model >= 12900) return 241;
    if (model >= 12700) return 180;
    if (model >= 12600) return 150;
    if (model >= 12400) return 117;
  }

  return 65;
}

function roundPsuStep(
  value: number
) {
  const steps = [
    450,
    500,
    550,
    650,
    750,
    850,
    1000,
    1200,
  ];

  return (
    steps.find(
      (step) => step >= value
    ) || 1200
  );
}

function minimumPsuByGpuClass(
  item: PricedHardwareItem
) {
  const n = normalizeText(item.name);

  if (n.includes("RTX5090")) return 1000;
  if (n.includes("RTX5080")) return 850;
  if (n.includes("RTX5070")) return 750;
  if (n.includes("RTX5060TI")) return 650;
  if (n.includes("RTX5060")) return 600;
  if (n.includes("RTX4090")) return 850;
  if (n.includes("RTX4080")) return 850;
  if (n.includes("RTX4070TI")) return 750;
  if (n.includes("RTX4070")) return 650;
  if (n.includes("RTX4060TI")) return 650;
  if (n.includes("RTX4060")) return 550;
  if (n.includes("RTX3050")) return 500;

  if (n.includes("RX7900XTX")) return 850;
  if (n.includes("RX7900")) return 750;
  if (n.includes("RX7800")) return 750;
  if (n.includes("RX7700")) return 700;
  if (n.includes("RX7600")) return 600;

  return 500;
}

export default function PsuHesaplayiciPage() {
  const [cpus, setCpus] =
    useState<PricedHardwareItem[]>([]);

  const [gpus, setGpus] =
    useState<PricedHardwareItem[]>([]);

  const [psus, setPsus] =
    useState<PricedHardwareItem[]>([]);

  const [selectedCpu, setSelectedCpu] =
    useState<PricedHardwareItem | null>(
      null
    );

  const [selectedGpu, setSelectedGpu] =
    useState<PricedHardwareItem | null>(
      null
    );

  const [ramCount, setRamCount] =
    useState(2);

  const [storageCount, setStorageCount] =
    useState(2);

  const [loading, setLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState<string | null>(null);

  const [hasCalculated, setHasCalculated] =
    useState(false);

  const [psuResult, setPsuResult] =
    useState<{
      totalWatt: number;
      recommendedWatt: number;
      matchingPsus: PricedHardwareItem[];
    }>({
      totalWatt: 0,
      recommendedWatt: 0,
      matchingPsus: [],
    });

  useEffect(() => {
    async function loadHardware() {
      try {
        setLoading(true);
        setLoadError(null);

        const response = await fetch(
          "/api/hardware/available",
          { cache: "no-store" }
        );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.error ||
              "Donanımlar yüklenemedi."
          );
        }

        const all =
          result.items as PricedHardwareItem[];

        const newCpus = all.filter(
          (item) =>
            item.category ===
              "islemciler" &&
            item.has_valid_price
        );

        const newGpus = all.filter(
          (item) =>
            item.category ===
              "ekran-kartlari" &&
            item.has_valid_price
        );

        const newPsus = all.filter(
          (item) =>
            item.category ===
              "guc-kaynaklari" &&
            item.has_valid_price
        );

        setCpus(newCpus);
        setGpus(newGpus);
        setPsus(newPsus);

        setSelectedCpu(
          newCpus[0] || null
        );

        setSelectedGpu(
          newGpus[0] || null
        );
      } catch (error: any) {
        setLoadError(
          error?.message ||
            "Donanımlar yüklenemedi."
        );
      } finally {
        setLoading(false);
      }
    }

    loadHardware();
  }, []);

  const handleCalculate = () => {
    if (
      !selectedCpu ||
      !selectedGpu
    ) {
      return;
    }

    const cpuSpecWatt =
      parseWatt(
        getSpec(selectedCpu, [
          "TDP",
          "tdp",
          "Güç Tüketimi",
        ])
      );

    const cpuWatt =
      cpuSpecWatt > 0
        ? Math.max(
            cpuSpecWatt,
            fallbackCpuPower(
              selectedCpu
            )
          )
        : fallbackCpuPower(
            selectedCpu
          );

    const gpuSpecWatt =
      parseWatt(
        getSpec(selectedGpu, [
          "Güç Tüketimi",
          "TDP",
          "TBP",
          "TGP",
        ])
      );

    const gpuPower =
      gpuSpecWatt > 0
        ? gpuSpecWatt
        : fallbackGpuPower(
            selectedGpu
          );

    const gpuRecommendedPsu =
      parseWatt(
        getSpec(selectedGpu, [
          "Önerilen PSU",
          "önerilen psu",
          "Önerilen Güç Kaynağı",
        ])
      );

    // Anakart + fanlar + USB aygıtları +
    // RAM + depolama için temel sistem payı.
    const baseSystemWatt = 55;

    const ramWatt =
      ramCount * 4;

    const storageWatt =
      storageCount * 7;

    const totalWatt =
      cpuWatt +
      gpuPower +
      baseSystemWatt +
      ramWatt +
      storageWatt;

    const safetyRecommended =
      totalWatt * 1.3;

    const modelMinimum =
      minimumPsuByGpuClass(
        selectedGpu
      );

    const requiredWatt =
      Math.max(
        safetyRecommended,
        gpuRecommendedPsu,
        modelMinimum
      );

    const recommendedWatt =
      roundPsuStep(
        requiredWatt
      );

    const matchingPsus = [
      ...psus,
    ]
      .filter((item) => {
        const watt =
          parseWatt(
            getSpec(item, [
              "Güç",
              "güç",
            ]) || item.name
          );

        return (
          watt >=
          recommendedWatt
        );
      })
      .sort((a, b) => {
        const wattA =
          parseWatt(
            getSpec(a, ["Güç"]) ||
              a.name
          );

        const wattB =
          parseWatt(
            getSpec(b, ["Güç"]) ||
              b.name
          );

        if (wattA !== wattB) {
          return wattA - wattB;
        }

        return (
          Number(
            a.current_price || 0
          ) -
          Number(
            b.current_price || 0
          )
        );
      })
      .slice(0, 5);

    setPsuResult({
      totalWatt,
      recommendedWatt,
      matchingPsus,
    });

    setHasCalculated(true);
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
            🔌
          </span>
          PSU Watt Hesaplayıcı
        </h1>

        <p className="text-zinc-400 text-sm">
          Güncel fiyatı doğrulanmış
          işlemci, ekran kartı ve PSU
          kayıtlarını kullanır.
        </p>
      </div>

      {loading && (
        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center gap-3 text-zinc-400">
          <Loader2
            size={18}
            className="animate-spin text-cyan-400"
          />
          Donanımlar yükleniyor...
        </div>
      )}

      {loadError && (
        <div className="p-5 border border-red-500/30 bg-red-500/10 rounded-2xl text-red-300 text-sm">
          {loadError}
        </div>
      )}

      {!loading && !loadError && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 p-6 bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col gap-6">
            <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold tracking-wider">
              <Zap size={18} />
              SİSTEM YAPILANDIRMASI
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
                <Cpu
                  size={14}
                  className="text-cyan-400"
                />
                İŞLEMCİ (CPU)
              </label>

              <select
                value={
                  selectedCpu?.id || ""
                }
                onChange={(e) => {
                  const id = Number(
                    e.target.value
                  );

                  setSelectedCpu(
                    cpus.find(
                      (item) =>
                        item.id === id
                    ) || null
                  );
                }}
                className="w-full p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl text-white text-sm"
              >
                {cpus.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name} (
                    {getSpec(item, [
                      "TDP",
                    ]) || "65W"}
                    )
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
                <Monitor
                  size={14}
                  className="text-cyan-400"
                />
                EKRAN KARTI (GPU)
              </label>

              <select
                value={
                  selectedGpu?.id || ""
                }
                onChange={(e) => {
                  const id = Number(
                    e.target.value
                  );

                  setSelectedGpu(
                    gpus.find(
                      (item) =>
                        item.id === id
                    ) || null
                  );
                }}
                className="w-full p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl text-white text-sm"
              >
                {gpus.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name}
                    {getSpec(item, [
                      "Önerilen PSU",
                    ])
                      ? ` (${getSpec(
                          item,
                          [
                            "Önerilen PSU",
                          ]
                        )} PSU)`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-400">
                  RAM Modül Sayısı
                </label>

                <select
                  value={ramCount}
                  onChange={(e) =>
                    setRamCount(
                      Number(
                        e.target.value
                      )
                    )
                  }
                  className="w-full p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl text-white text-sm"
                >
                  <option value={1}>
                    1 Adet
                  </option>
                  <option value={2}>
                    2 Adet
                  </option>
                  <option value={4}>
                    4 Adet
                  </option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-400 flex items-center gap-1">
                  <HardDrive
                    size={13}
                  />
                  Depolama / SSD
                </label>

                <select
                  value={
                    storageCount
                  }
                  onChange={(e) =>
                    setStorageCount(
                      Number(
                        e.target.value
                      )
                    )
                  }
                  className="w-full p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl text-white text-sm"
                >
                  <option value={1}>
                    1 Adet
                  </option>
                  <option value={2}>
                    2 Adet
                  </option>
                  <option value={3}>
                    3+ Adet
                  </option>
                </select>
              </div>
            </div>

            <button
              disabled={
                !selectedCpu ||
                !selectedGpu
              }
              onClick={
                handleCalculate
              }
              className="w-full py-4 bg-gradient-to-r from-cyan-400 to-cyan-500 disabled:opacity-50 text-zinc-950 font-bold rounded-2xl flex items-center justify-center gap-2 text-sm"
            >
              <Sparkles size={16} />
              Güç İhtiyacını Hesapla
            </button>
          </div>

          <div className="lg:col-span-6 p-8 bg-zinc-900/60 border border-zinc-800/80 rounded-3xl min-h-[460px] flex items-center justify-center">
            {!hasCalculated ? (
              <div className="text-center text-zinc-400 text-sm">
                İşlemci ve ekran kartını
                seçip hesaplama yap.
              </div>
            ) : (
              <div className="w-full flex flex-col gap-6">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                  <h3 className="text-base font-bold text-white">
                    Güç Raporu
                  </h3>

                  <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold rounded-xl flex items-center gap-1">
                    <ShieldCheck
                      size={14}
                    />
                    %30 Güvenlik Payı
                  </span>
                </div>

                <div className="text-[11px] leading-5 text-zinc-500 -mt-2">
                  Hesaplama; CPU güç sınıfı, GPU TGP/TBP değeri veya model bazlı yedek güç değeri,
                  RAM, depolama ve temel sistem tüketimi üzerinden yapılır.
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl">
                    <span className="text-[11px] text-zinc-400">
                      Tahmini Tüketim
                    </span>

                    <div className="text-3xl font-extrabold text-white">
                      {
                        psuResult.totalWatt
                      }{" "}
                      W
                    </div>
                  </div>

                  <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl">
                    <span className="text-[11px] text-cyan-400">
                      Önerilen Minimum
                    </span>

                    <div className="text-3xl font-extrabold text-cyan-400">
                      {
                        psuResult.recommendedWatt
                      }{" "}
                      W
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <span className="text-xs font-bold text-zinc-300">
                    Uygun güncel PSU
                    önerileri:
                  </span>

                  {psuResult
                    .matchingPsus
                    .length === 0 ? (
                    <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-400">
                      Bu güç ihtiyacını
                      karşılayan güncel fiyatlı
                      PSU bulunamadı.
                    </div>
                  ) : (
                    psuResult.matchingPsus.map(
                      (item) => (
                        <div
                          key={item.id}
                          className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl flex justify-between items-center gap-4"
                        >
                          <div>
                            <div className="text-xs font-bold text-white">
                              {
                                item.name
                              }
                            </div>

                            <div className="text-[11px] text-zinc-500 mt-1">
                              {getSpec(
                                item,
                                [
                                  "Güç",
                                ]
                              )}
                              {getSpec(
                                item,
                                [
                                  "Verimlilik",
                                ]
                              )
                                ? ` • ${getSpec(
                                    item,
                                    [
                                      "Verimlilik",
                                    ]
                                  )}`
                                : ""}
                            </div>
                          </div>

                          <span className="text-sm font-extrabold text-cyan-400 whitespace-nowrap">
                            {formatPrice(
                              item.current_price
                            )}
                          </span>
                        </div>
                      )
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
