"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  Cpu,
  Monitor,
  Gamepad2,
  Sparkles,
  Loader2,
  AlertTriangle,
} from "lucide-react";

import type { PricedHardwareItem } from "@/app/lib/hardware-types";
import ToolGuide from "@/app/components/ToolGuide";

type Resolution =
  | "1080p"
  | "1440p"
  | "4K";

type GameProfile = {
  name: string;
  gpuWeight: number;
  cpuWeight: number;
  mediumBase: number;
  ultraPenalty: number;
  resolution1440p: number;
  resolution4K: number;
  fpsCap?: number;
};

type GameResult = {
  name: string;
  mediumFps: number;
  ultraFps: number;
};

const popularGames: GameProfile[] = [
  {
    name: "Cyberpunk 2077",
    gpuWeight: 0.88,
    cpuWeight: 0.12,
    mediumBase: 92,
    ultraPenalty: 0.66,
    resolution1440p: 0.74,
    resolution4K: 0.43,
  },
  {
    name: "Black Myth: Wukong",
    gpuWeight: 0.92,
    cpuWeight: 0.08,
    mediumBase: 82,
    ultraPenalty: 0.62,
    resolution1440p: 0.71,
    resolution4K: 0.39,
  },
  {
    name: "Monster Hunter Wilds",
    gpuWeight: 0.84,
    cpuWeight: 0.16,
    mediumBase: 86,
    ultraPenalty: 0.66,
    resolution1440p: 0.73,
    resolution4K: 0.42,
  },
  {
    name: "Grand Theft Auto V",
    gpuWeight: 0.48,
    cpuWeight: 0.52,
    mediumBase: 150,
    ultraPenalty: 0.78,
    resolution1440p: 0.82,
    resolution4K: 0.61,
  },
  {
    name: "Counter-Strike 2",
    gpuWeight: 0.28,
    cpuWeight: 0.72,
    mediumBase: 260,
    ultraPenalty: 0.86,
    resolution1440p: 0.9,
    resolution4K: 0.76,
  },
  {
    name: "Valorant",
    gpuWeight: 0.2,
    cpuWeight: 0.8,
    mediumBase: 330,
    ultraPenalty: 0.9,
    resolution1440p: 0.93,
    resolution4K: 0.82,
  },
  {
    name: "Fortnite",
    gpuWeight: 0.62,
    cpuWeight: 0.38,
    mediumBase: 170,
    ultraPenalty: 0.74,
    resolution1440p: 0.77,
    resolution4K: 0.51,
  },
  {
    name: "Alan Wake 2",
    gpuWeight: 0.94,
    cpuWeight: 0.06,
    mediumBase: 76,
    ultraPenalty: 0.58,
    resolution1440p: 0.7,
    resolution4K: 0.37,
  },
  {
    name: "Elden Ring",
    gpuWeight: 0.68,
    cpuWeight: 0.32,
    mediumBase: 92,
    ultraPenalty: 0.74,
    resolution1440p: 0.8,
    resolution4K: 0.58,
    fpsCap: 60,
  },
  {
    name: "Baldur's Gate 3",
    gpuWeight: 0.52,
    cpuWeight: 0.48,
    mediumBase: 130,
    ultraPenalty: 0.78,
    resolution1440p: 0.84,
    resolution4K: 0.64,
  },
  {
    name: "Call of Duty: Warzone",
    gpuWeight: 0.72,
    cpuWeight: 0.28,
    mediumBase: 145,
    ultraPenalty: 0.72,
    resolution1440p: 0.75,
    resolution4K: 0.47,
  },
  {
    name: "God of War Ragnarok",
    gpuWeight: 0.82,
    cpuWeight: 0.18,
    mediumBase: 110,
    ultraPenalty: 0.69,
    resolution1440p: 0.73,
    resolution4K: 0.42,
  },
  {
    name: "Forza Horizon 5",
    gpuWeight: 0.68,
    cpuWeight: 0.32,
    mediumBase: 160,
    ultraPenalty: 0.8,
    resolution1440p: 0.79,
    resolution4K: 0.55,
  },
  {
    name: "Marvel Rivals",
    gpuWeight: 0.6,
    cpuWeight: 0.4,
    mediumBase: 150,
    ultraPenalty: 0.74,
    resolution1440p: 0.8,
    resolution4K: 0.57,
  },
  {
    name: "Helldivers 2",
    gpuWeight: 0.8,
    cpuWeight: 0.2,
    mediumBase: 112,
    ultraPenalty: 0.72,
    resolution1440p: 0.74,
    resolution4K: 0.44,
  },
];

function getSpec(
  item:
    | PricedHardwareItem
    | null
    | undefined,
  keys: string[]
) {
  const specs = item?.specs;

  if (!specs) {
    return "";
  }

  for (const key of keys) {
    const value = specs[key];

    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      return String(value).trim();
    }
  }

  const normalizedKeys =
    keys.map((key) =>
      key.toLocaleLowerCase("tr-TR")
    );

  for (
    const [key, value]
    of Object.entries(specs)
  ) {
    if (
      normalizedKeys.includes(
        key.toLocaleLowerCase("tr-TR")
      ) &&
      value !== undefined &&
      value !== null
    ) {
      return String(value).trim();
    }
  }

  return "";
}

function firstNumber(
  value: string
) {
  const match =
    value
      .replace(",", ".")
      .match(/(\d+(?:\.\d+)?)/);

  return match
    ? Number(match[1])
    : 0;
}

function normalizeText(
  value: string
) {
  return value
    .toLocaleUpperCase("tr-TR")
    .replace(/\s+/g, " ")
    .trim();
}

function parseCpuCores(
  item: PricedHardwareItem
) {
  const direct =
    firstNumber(
      getSpec(
        item,
        [
          "Çekirdek",
          "Çekirdek Sayısı",
          "Cores",
        ]
      )
    );

  if (direct > 0) {
    return direct;
  }

  const raw =
    `${item.name} ${item.description || ""}`;

  const match =
    raw.match(
      /(\d{1,2})\s*(?:çekirdek|core)/i
    );

  return match
    ? Number(match[1])
    : 4;
}

function parseCpuBoost(
  item: PricedHardwareItem
) {
  const direct =
    firstNumber(
      getSpec(
        item,
        [
          "Boost Frekans",
          "Boost",
          "Maks. Frekans",
        ]
      )
    );

  if (direct > 0) {
    return direct;
  }

  const raw =
    `${item.name} ${item.description || ""}`;

  const matches =
    [
      ...raw.matchAll(
        /(\d+(?:[.,]\d+)?)\s*GHz/gi
      ),
    ].map((match) =>
      Number(
        match[1].replace(",", ".")
      )
    );

  if (!matches.length) {
    return 4;
  }

  return Math.max(...matches);
}

function cpuGenerationFactor(
  name: string
) {
  const n =
    normalizeText(name);

  if (
    n.includes("ATHLON") ||
    n.includes("CELERON") ||
    n.includes("PENTIUM")
  ) {
    return 0.48;
  }

  if (
    n.includes("X3D")
  ) {
    if (/RYZEN\s+[3579]\s+9\d{3}/.test(n)) return 1.32;
    if (/RYZEN\s+[3579]\s+7\d{3}/.test(n)) return 1.28;
    if (/RYZEN\s+[3579]\s+5\d{3}/.test(n)) return 1.1;
  }

  if (
    /RYZEN\s+[3579]\s+9\d{3}/.test(n)
  ) {
    return 1.2;
  }

  if (
    /RYZEN\s+[3579]\s+8\d{3}/.test(n)
  ) {
    return 1.16;
  }

  if (
    /RYZEN\s+[3579]\s+7\d{3}/.test(n)
  ) {
    return 1.12;
  }

  if (
    /RYZEN\s+[3579]\s+5\d{3}/.test(n)
  ) {
    return 0.98;
  }

  if (
    /RYZEN\s+[3579]\s+3\d{3}/.test(n)
  ) {
    return 0.82;
  }

  const intel =
    n.match(
      /I[3579]-(\d{2})\d{3}/
    );

  if (intel) {
    const generation =
      Number(intel[1]);

    if (generation >= 15) {
      return 1.2;
    }

    if (generation >= 14) {
      return 1.16;
    }

    if (generation >= 13) {
      return 1.12;
    }

    if (generation >= 12) {
      return 1.06;
    }

    if (generation >= 10) {
      return 0.94;
    }
  }

  return 0.9;
}

function cpuPerformanceScore(
  item: PricedHardwareItem
) {
  const cores =
    Math.min(
      parseCpuCores(item),
      12
    );

  const boost =
    parseCpuBoost(item);

  const generation =
    cpuGenerationFactor(
      item.name
    );

  const raw =
    cores *
    boost *
    generation;

  return Math.max(
    0.35,
    Math.min(
      1.65,
      raw / 42
    )
  );
}

function parseVram(
  item: PricedHardwareItem
) {
  const raw = [
    getSpec(
      item,
      [
        "VRAM",
        "Ekran Kartı Belleği",
      ]
    ),
    item.name,
    item.description || "",
  ].join(" ");

  const gb =
    raw.match(
      /\b(\d{1,2})\s*GB\b/i
    );

  if (gb) {
    return Number(gb[1]);
  }

  const mb =
    raw.match(
      /\b(\d{3,5})\s*MB\b/i
    );

  if (mb) {
    return Number(mb[1]) / 1024;
  }

  return 4;
}

function gpuModelBaseScore(
  name: string
) {
  const n =
    normalizeText(name)
      .replace(/\s+/g, "");

  const rtx =
    n.match(
      /RTX(\d{4})(TI|SUPER)?/
    );

  if (rtx) {
    const model =
      Number(rtx[1]);

    let score = 0;

    if (model >= 5090) score = 1.7;
    else if (model >= 5080) score = 1.55;
    else if (model >= 5070) score = 1.32;
    else if (model >= 5060) score = 1.1;
    else if (model >= 4090) score = 1.6;
    else if (model >= 4080) score = 1.42;
    else if (model >= 4070) score = 1.2;
    else if (model >= 4060) score = 1;
    else if (model >= 3090) score = 1.28;
    else if (model >= 3080) score = 1.17;
    else if (model >= 3070) score = 1.02;
    else if (model >= 3060) score = 0.86;
    else if (model >= 3050) score = 0.68;

    if (rtx[2] === "TI") {
      score += 0.08;
    }

    if (rtx[2] === "SUPER") {
      score += 0.06;
    }

    return score;
  }

  const rx =
    n.match(
      /RX(\d{4})(XT|XTX)?/
    );

  if (rx) {
    const model =
      Number(rx[1]);

    let score = 0;

    if (model >= 9070) score = 1.3;
    else if (model >= 7900) score = 1.42;
    else if (model >= 7800) score = 1.22;
    else if (model >= 7700) score = 1.08;
    else if (model >= 7600) score = 0.92;
    else if (model >= 6950) score = 1.2;
    else if (model >= 6900) score = 1.14;
    else if (model >= 6800) score = 1.06;
    else if (model >= 6750) score = 0.96;
    else if (model >= 6700) score = 0.91;
    else if (model >= 6650) score = 0.8;
    else if (model >= 6600) score = 0.74;

    if (rx[2] === "XT") {
      score += 0.07;
    }

    if (rx[2] === "XTX") {
      score += 0.12;
    }

    return score;
  }

  const arc =
    n.match(
      /ARC[A-Z]?(\d{3})/
    );

  if (arc) {
    const model =
      Number(arc[1]);

    if (model >= 770) return 0.9;
    if (model >= 750) return 0.8;
    if (model >= 580) return 0.74;
  }

  return 0.62;
}

function gpuPerformanceScore(
  item: PricedHardwareItem,
  resolution: Resolution
) {
  let score =
    gpuModelBaseScore(
      item.name
    );

  const vram =
    parseVram(item);

  if (
    resolution === "1080p"
  ) {
    if (vram < 6) {
      score *= 0.82;
    } else if (vram >= 8) {
      score *= 1.02;
    }
  }

  if (
    resolution === "1440p"
  ) {
    if (vram < 8) {
      score *= 0.76;
    } else if (vram >= 12) {
      score *= 1.03;
    }
  }

  if (resolution === "4K") {
    if (vram < 8) {
      score *= 0.62;
    } else if (vram < 12) {
      score *= 0.82;
    } else if (vram >= 16) {
      score *= 1.04;
    }
  }

  return Math.max(
    0.35,
    score
  );
}

function gameResolutionMultiplier(
  resolution: Resolution,
  game: GameProfile
) {
  if (resolution === "1440p") {
    return game.resolution1440p;
  }

  if (resolution === "4K") {
    return game.resolution4K;
  }

  return 1;
}

function estimateGameFps(
  cpu: PricedHardwareItem,
  gpu: PricedHardwareItem,
  resolution: Resolution,
  game: GameProfile
) {
  const cpuScore =
    cpuPerformanceScore(cpu);

  const gpuScore =
    gpuPerformanceScore(
      gpu,
      resolution
    );

  const resFactor =
    gameResolutionMultiplier(
      resolution,
      game
    );

  const cpuContribution =
    cpuScore *
    game.cpuWeight;

  const gpuContribution =
    gpuScore *
    game.gpuWeight;

  const combined =
    cpuContribution +
    gpuContribution;

  // Darboğaz etkisi:
  // CPU ve GPU'dan biri çok gerideyse
  // toplam performans da aşağı çekilir.
  const bottleneckFactor =
    Math.min(
      1,
      Math.min(
        cpuScore / Math.max(gpuScore, 0.01),
        gpuScore / Math.max(cpuScore, 0.01)
      ) + 0.45
    );

  const medium =
    game.mediumBase *
    combined *
    resFactor *
    bottleneckFactor;

  const ultra =
    medium *
    game.ultraPenalty;

  const cap =
    game.fpsCap ?? Infinity;

  const mediumFps =
    Math.min(
      cap,
      Math.max(
        15,
        Math.round(medium)
      )
    );

  const ultraFps =
    Math.min(
      cap,
      Math.max(
        10,
        Math.round(ultra)
      )
    );

  return {
    mediumFps,
    ultraFps,
  };
}

export default function FpsHesaplayiciPage() {
  const [
    cpus,
    setCpus,
  ] = useState<
    PricedHardwareItem[]
  >([]);

  const [
    gpus,
    setGpus,
  ] = useState<
    PricedHardwareItem[]
  >([]);

  const [
    selectedCpuId,
    setSelectedCpuId,
  ] = useState<
    number | null
  >(null);

  const [
    selectedGpuId,
    setSelectedGpuId,
  ] = useState<
    number | null
  >(null);

  const [
    resolution,
    setResolution,
  ] = useState<Resolution>(
    "1080p"
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const [
    hasCalculated,
    setHasCalculated,
  ] = useState(false);

  const [
    gameResults,
    setGameResults,
  ] = useState<
    GameResult[]
  >([]);

  useEffect(() => {
    async function loadHardware() {
      try {
        setLoading(true);
        setError(null);

        const response =
          await fetch(
            "/api/hardware/available",
            {
              cache: "no-store",
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
              "Donanımlar yüklenemedi."
          );
        }

        const all =
          result.items as PricedHardwareItem[];

        const cpuItems =
          all
            .filter(
              (item) =>
                item.category ===
                  "islemciler" &&
                item.has_valid_price &&
                item.current_price != null
            )
            .sort((a, b) =>
              a.name.localeCompare(
                b.name,
                "tr",
                {
                  sensitivity:
                    "base",
                }
              )
            );

        const gpuItems =
          all
            .filter(
              (item) =>
                item.category ===
                  "ekran-kartlari" &&
                item.has_valid_price &&
                item.current_price != null
            )
            .sort((a, b) =>
              a.name.localeCompare(
                b.name,
                "tr",
                {
                  sensitivity:
                    "base",
                }
              )
            );

        setCpus(cpuItems);
        setGpus(gpuItems);

        if (cpuItems[0]) {
          setSelectedCpuId(
            cpuItems[0].id
          );
        }

        if (gpuItems[0]) {
          setSelectedGpuId(
            gpuItems[0].id
          );
        }
      } catch (
        err: any
      ) {
        setError(
          err?.message ||
            "Donanımlar yüklenemedi."
        );
      } finally {
        setLoading(false);
      }
    }

    loadHardware();
  }, []);

  const selectedCpu =
    useMemo(
      () =>
        cpus.find(
          (item) =>
            item.id ===
            selectedCpuId
        ) || null,
      [
        cpus,
        selectedCpuId,
      ]
    );

  const selectedGpu =
    useMemo(
      () =>
        gpus.find(
          (item) =>
            item.id ===
            selectedGpuId
        ) || null,
      [
        gpus,
        selectedGpuId,
      ]
    );

  const handleCalculate =
    () => {
      if (
        !selectedCpu ||
        !selectedGpu
      ) {
        return;
      }

      const results =
        popularGames.map(
          (game) => {
            const fps =
              estimateGameFps(
                selectedCpu,
                selectedGpu,
                resolution,
                game
              );

            return {
              name: game.name,
              ...fps,
            };
          }
        );

      setGameResults(
        results
      );

      setHasCalculated(
        true
      );
    };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6 overflow-x-clip">
      <div className="flex flex-col gap-1">
        <Link
          href="/araclar"
          className="text-xs text-zinc-400 hover:text-cyan-400 transition-colors flex items-center gap-1 w-fit mb-2"
        >
          <ArrowLeft
            size={14}
          />
          Araçlara dön
        </Link>

        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <span className="text-cyan-400">
            🎮
          </span>
          Oyun FPS Hesaplayıcı
        </h1>

        <p className="text-zinc-400 text-sm">
          Güncel işlemci ve ekran kartlarıyla
          popüler oyunlarda tahmini FPS
          değerlerini karşılaştırın.
        </p>
      </div>

      {loading && (
        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center gap-3 text-zinc-400">
          <Loader2
            size={18}
            className="animate-spin text-cyan-400"
          />
          Güncel donanımlar yükleniyor...
        </div>
      )}

      {error && (
        <div className="p-5 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3 text-red-300 text-sm">
          <AlertTriangle
            size={17}
          />
          {error}
        </div>
      )}

      {!loading &&
        !error && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 p-6 bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col gap-6 shadow-sm lg:sticky lg:top-24">
              <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold tracking-wider">
                <Gamepad2
                  size={18}
                />
                SİSTEM BİLEŞENLERİ
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-400 tracking-wider flex items-center gap-1.5">
                  <Cpu
                    size={14}
                    className="text-cyan-400"
                  />
                  İŞLEMCİ (CPU)
                </label>

                <select
                  value={
                    selectedCpuId ??
                    ""
                  }
                  onChange={(
                    e
                  ) => {
                    setSelectedCpuId(
                      Number(
                        e.target
                          .value
                      )
                    );

                    setHasCalculated(
                      false
                    );
                  }}
                  className="w-full p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl text-white text-sm focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
                >
                  {cpus.map(
                    (item) => (
                      <option
                        key={
                          item.id
                        }
                        value={
                          item.id
                        }
                      >
                        {
                          item.name
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-400 tracking-wider flex items-center gap-1.5">
                  <Monitor
                    size={14}
                    className="text-cyan-400"
                  />
                  EKRAN KARTI (GPU)
                </label>

                <select
                  value={
                    selectedGpuId ??
                    ""
                  }
                  onChange={(
                    e
                  ) => {
                    setSelectedGpuId(
                      Number(
                        e.target
                          .value
                      )
                    );

                    setHasCalculated(
                      false
                    );
                  }}
                  className="w-full p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl text-white text-sm focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
                >
                  {gpus.map(
                    (item) => (
                      <option
                        key={
                          item.id
                        }
                        value={
                          item.id
                        }
                      >
                        {
                          item.name
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-400 tracking-wider">
                  HEDEF ÇÖZÜNÜRLÜK
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      "1080p",
                      "1440p",
                      "4K",
                    ] as Resolution[]
                  ).map(
                    (res) => (
                      <button
                        key={
                          res
                        }
                        type="button"
                        onClick={() => {
                          setResolution(
                            res
                          );

                          setHasCalculated(
                            false
                          );
                        }}
                        className={`py-3 rounded-2xl border text-xs font-bold transition-all ${
                          resolution ===
                          res
                            ? "bg-cyan-500/10 border-cyan-500 text-cyan-400"
                            : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                        }`}
                      >
                        {
                          res
                        }
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-[11px] leading-5 text-amber-200/80">
                Bu araç bilgilendirme ve tahmini performans
                karşılaştırması amaçlıdır. Sonuçlar native çözünürlük
                varsayımıyla hesaplanır; Ray Tracing, DLSS/FSR/XeSS ve
                Frame Generation kapalı kabul edilir. Gerçek FPS; oyun
                sürümü, RAM, sürücü, grafik ayarları ve sistem
                sıcaklıklarına göre değişebilir. Elden Ring standart
                60 FPS oyun limitiyle gösterilir.
              </div>

              <button
                onClick={
                  handleCalculate
                }
                disabled={
                  !selectedCpu ||
                  !selectedGpu
                }
                className="w-full py-4 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 disabled:opacity-40 text-zinc-950 font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm tracking-wide mt-2"
              >
                <Sparkles
                  size={16}
                />
                FPS Değerlerini Hesapla
              </button>
            </div>

            <div className="lg:col-span-7 min-w-0 p-4 sm:p-6 bg-zinc-900/60 border border-zinc-800/80 rounded-3xl min-h-[500px] flex flex-col">
              {!hasCalculated ? (
                <div className="flex flex-col items-center justify-center text-center gap-3 my-auto py-24">
                  <div className="w-14 h-14 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center text-cyan-400 shadow-inner">
                    <Gamepad2
                      size={24}
                    />
                  </div>

                  <h3 className="text-white font-bold text-lg">
                    Donanımınızı
                    seçin
                  </h3>

                  <p className="text-xs text-zinc-400 leading-relaxed max-w-xs">
                    İşlemci, ekran kartı
                    ve çözünürlük seçerek
                    15 popüler oyundaki
                    tahmini performansı
                    listeleyin.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border-b border-zinc-800 pb-3">
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Gamepad2
                          size={18}
                          className="text-cyan-400"
                        />
                        Oyun Performans
                        Sonuçları (
                        {
                          resolution
                        }
                        )
                      </h3>

                      <p className="text-[10px] text-zinc-500 mt-1 break-words">
                        CPU:{" "}
                        {
                          selectedCpu
                            ?.name
                        }{" "}
                        • GPU:{" "}
                        {
                          selectedGpu
                            ?.name
                        }
                      </p>

                      <p className="text-[10px] text-zinc-600 mt-1 break-words">
                        Native çözünürlük • RT kapalı • Upscaling kapalı • Frame Generation kapalı
                      </p>
                    </div>

                    <span className="text-xs text-zinc-400 shrink-0">
                      15 Popüler Oyun
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    <div className="grid grid-cols-12 text-[10px] sm:text-[11px] font-bold text-zinc-500 px-2 sm:px-4 py-1 uppercase tracking-wider">
                      <span className="col-span-6">
                        Oyun Adı
                      </span>

                      <span className="col-span-3 text-center">
                        Orta
                      </span>

                      <span className="col-span-3 text-center">
                        Ultra
                      </span>
                    </div>

                    {gameResults.map(
                      (
                        game
                      ) => (
                        <div
                          key={
                            game.name
                          }
                          className="grid grid-cols-12 items-center p-3 sm:p-4 bg-zinc-950 border border-zinc-800/80 rounded-2xl hover:border-cyan-500/40 transition-all"
                        >
                          <span className="col-span-6 min-w-0 break-words text-xs sm:text-sm font-bold text-white">
                            {
                              game.name
                            }
                          </span>

                          <div className="col-span-3 text-center">
                            <span className="whitespace-nowrap px-1.5 sm:px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-[10px] sm:text-xs font-extrabold rounded-xl">
                              {
                                game.mediumFps
                              }{" "}
                              FPS
                            </span>
                          </div>

                          <div className="col-span-3 text-center">
                            <span className="whitespace-nowrap px-1.5 sm:px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] sm:text-xs font-extrabold rounded-xl">
                              {
                                game.ultraFps
                              }{" "}
                              FPS
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      <ToolGuide tool="fps" />
    </div>
  );
}
