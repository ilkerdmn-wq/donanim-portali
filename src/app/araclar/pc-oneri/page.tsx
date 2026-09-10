"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  Zap,
  ShieldCheck,
  Loader2,
  AlertTriangle,
} from "lucide-react";

import type { PricedHardwareItem } from "@/app/lib/hardware-types";

type BudgetTier = "dusuk" | "orta" | "yuksek";

const budgetTiers: Record<
  BudgetTier,
  {
    label: string;
    min: number;
    max: number;
    targetMin: number;
    targetMax: number;
  }
> = {
  dusuk: {
    label: "Düşük",
    min: 40000,
    max: 65000,
    targetMin: 40000,
    targetMax: 65000,
  },
  orta: {
    label: "Orta",
    min: 65000,
    max: 100000,
    targetMin: 65000,
    targetMax: 100000,
  },
  yuksek: {
    label: "Yüksek",
    min: 100000,
    max: 200000,
    targetMin: 110000,
    targetMax: 200000,
  },
};

type GroupedHardware = {
  islemci: PricedHardwareItem[];
  "ekran-karti": PricedHardwareItem[];
  anakart: PricedHardwareItem[];
  ram: PricedHardwareItem[];
  psu: PricedHardwareItem[];
  ssd: PricedHardwareItem[];
};

type BuildSystem = {
  cpu: PricedHardwareItem;
  gpu: PricedHardwareItem;
  anakart: PricedHardwareItem;
  ram: PricedHardwareItem;
  psu: PricedHardwareItem;
  ssd: PricedHardwareItem;
  total: number;
  score: number;
  cpuSocket: string;
  memoryType: string;
  recommendedPsuWatt: number;
  storageGb: number;
  gpuVramGb: number;
  ramCapacityGb: number;
  ramModuleCount: number;
  psuWatt: number;
  psuEfficiencyRank: number;
  cpuCores: number;
  cpuGpuPriceRatio: number;
};

const emptyHardware: GroupedHardware = {
  islemci: [],
  "ekran-karti": [],
  anakart: [],
  ram: [],
  psu: [],
  ssd: [],
};

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
      return String(value).trim();
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
      value !== null
    ) {
      return String(value).trim();
    }
  }

  return "";
}

function currentPrice(item: PricedHardwareItem) {
  return Number(item.current_price || 0);
}

function formatPrice(value: number) {
  return `${Math.round(value).toLocaleString("tr-TR")} ₺`;
}

function normalizeText(value: string) {
  return value
    .toLocaleUpperCase("tr-TR")
    .replace(/\s+/g, " ")
    .trim();
}

function parseFirstNumber(value: string) {
  const match = value
    .replace(",", ".")
    .match(/(\d+(?:\.\d+)?)/);

  return match ? Number(match[1]) : 0;
}

function parseCapacityGb(item: PricedHardwareItem) {
  const raw = normalizeText(
    [
      getSpec(item, ["Kapasite", "kapasite"]),
      item.name,
    ].join(" ")
  );

  const tb = raw.match(/(\d+(?:[.,]\d+)?)\s*TB/i);
  if (tb) {
    return Number(tb[1].replace(",", ".")) * 1024;
  }

  const gb = raw.match(/(\d+(?:[.,]\d+)?)\s*GB/i);
  if (gb) {
    return Number(gb[1].replace(",", "."));
  }

  return 0;
}

function parseVramGb(item: PricedHardwareItem) {
  const raw = normalizeText(
    [
      getSpec(item, [
        "VRAM",
        "Ekran Kartı Belleği",
        "Bellek Kapasitesi",
      ]),
      item.name,
      item.description || "",
    ].join(" ")
  );

  const gb = raw.match(
    /\b(\d{1,2}(?:[.,]\d+)?)\s*GB\b/i
  );

  if (gb) {
    return Number(gb[1].replace(",", "."));
  }

  const mb = raw.match(
    /\b(\d{3,5})\s*MB\b/i
  );

  if (mb) {
    return Number(mb[1]) / 1024;
  }

  return 0;
}

function minGamingVramGb(
  budget: number,
  resolution: string
) {
  if (resolution === "4K") {
    return 12;
  }

  if (resolution === "1440p") {
    return budget >= 60000 ? 12 : 8;
  }

  // 1080p
  return budget >= 45000 ? 8 : 6;
}

function parseRamModuleCount(item: PricedHardwareItem) {
  const raw = normalizeText(
    [
      getSpec(item, [
        "Modül Yapısı",
        "Kit",
        "Modül",
      ]),
      item.name,
    ].join(" ")
  );

  const match = raw.match(
    /\b(\d+)\s*[X×]\s*\d+\s*GB\b/i
  );

  return match ? Number(match[1]) : 1;
}

function preferredRamCapacityGb(
  budget: number,
  usage: string
) {
  if (usage === "render") {
    return budget >= 60000 ? 32 : 16;
  }

  if (usage === "oyun") {
    return budget >= 60000 ? 32 : 16;
  }

  if (usage === "genel") {
    return budget >= 70000 ? 32 : 16;
  }

  return 16;
}

function minRamCapacityGb(
  budget: number,
  usage: string
) {
  if (usage === "render") {
    return budget >= 60000 ? 32 : 16;
  }

  return 16;
}

function ramMarketingFlags(item: PricedHardwareItem) {
  const raw = normalizeText(
    [
      item.name,
      item.description || "",
      getSpec(item, [
        "Soğutma",
        "RGB",
        "Aydınlatma",
        "Özellik",
      ]),
    ].join(" ")
  );

  const liquidCooling =
    raw.includes("SIVI") ||
    raw.includes("LIQUID") ||
    raw.includes("WATER");

  const rgb =
    raw.includes("RGB") ||
    raw.includes("ARGB");

  const premiumSeries =
    raw.includes("DOMINATOR") ||
    raw.includes("TRIDENT Z") ||
    raw.includes("TRIDENTZ") ||
    raw.includes("ROYAL") ||
    raw.includes("TITANIUM") ||
    raw.includes("EXTREME");

  return {
    liquidCooling,
    rgb,
    premiumSeries,
  };
}

function isBudgetFriendlyRam(
  item: PricedHardwareItem,
  budget: number,
  usage: string
) {
  const flags = ramMarketingFlags(item);
  const capacity = parseCapacityGb(item);
  const preferred =
    preferredRamCapacityGb(
      budget,
      usage
    );

  // Bu fonksiyon artık sert eleme için değil,
  // puanlama / tercih mantığı için kullanılır.
  if (
    budget <= 60000 &&
    flags.liquidCooling
  ) {
    return false;
  }

  if (
    isPricePerformanceBand(budget) &&
    capacity > preferred * 2
  ) {
    return false;
  }

  return true;
}

function parsePsuEfficiencyRank(
  item: PricedHardwareItem
) {
  const raw = normalizeText(
    [
      getSpec(item, [
        "Verimlilik",
        "Sertifika",
      ]),
      item.name,
      item.description || "",
    ].join(" ")
  );

  if (raw.includes("TITANIUM")) return 5;
  if (raw.includes("PLATINUM")) return 4;
  if (raw.includes("GOLD")) return 3;
  if (raw.includes("SILVER")) return 2;
  if (raw.includes("BRONZE")) return 1;

  return 0;
}

function isPricePerformanceBand(
  budget: number
) {
  return budget >= 40000 && budget <= 65000;
}

function inferMemoryType(
  item: PricedHardwareItem | null | undefined
) {
  if (!item) return "";

  const raw = normalizeText(
    [
      getSpec(item, [
        "Bellek Türü",
        "Tür",
        "RAM Tipi",
        "Bellek Desteği",
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

function inferSocket(
  item: PricedHardwareItem | null | undefined
) {
  if (!item) return "";

  const raw = normalizeText(
    [
      getSpec(item, ["Soket", "Socket"]),
      item.name,
      item.description || "",
    ].join(" ")
  );

  const match = raw.match(
    /(AM4|AM5|LGA1200|LGA1700|LGA1851|STR5|STRX4|TR4)/
  );

  return match?.[1] || "";
}

function parsePsuWatt(item: PricedHardwareItem) {
  return parseFirstNumber(
    getSpec(item, ["Güç", "Watt"]) || item.name
  );
}

function parseGpuRecommendedPsu(
  item: PricedHardwareItem
) {
  return parseFirstNumber(
    getSpec(item, [
      "Önerilen PSU",
      "Önerilen Güç Kaynağı",
      "PSU",
    ])
  );
}

function parseCpuTdp(item: PricedHardwareItem) {
  return (
    parseFirstNumber(
      getSpec(item, ["TDP", "Güç Tüketimi"])
    ) || 65
  );
}

function parseCpuCores(item: PricedHardwareItem) {
  const direct = parseFirstNumber(
    getSpec(item, [
      "Çekirdek",
      "Cores",
      "Çekirdek Sayısı",
    ])
  );

  if (direct > 0) return direct;

  const raw = normalizeText(
    [
      item.name,
      item.description || "",
    ].join(" ")
  );

  const coreMatch = raw.match(
    /\b(\d{1,2})\s*(?:ÇEKİRDEK|CORE)\b/i
  );

  return coreMatch ? Number(coreMatch[1]) : 0;
}

function isVeryLowEndCpu(item: PricedHardwareItem) {
  const name = normalizeText(item.name);

  return (
    name.includes("ATHLON") ||
    name.includes("CELERON") ||
    name.includes("PENTIUM")
  );
}

function minimumCpuGpuPriceRatio(
  usage: string,
  resolution: string,
  budget: number
) {
  if (usage !== "oyun") {
    return 0.18;
  }

  if (resolution === "1080p") {
    return budget <= 60000 ? 0.28 : 0.24;
  }

  if (resolution === "1440p") {
    return 0.22;
  }

  return 0.18;
}

function isCpuGpuBalanced(
  cpu: PricedHardwareItem,
  gpu: PricedHardwareItem,
  usage: string,
  resolution: string,
  budget: number
) {
  const cpuPrice = currentPrice(cpu);
  const gpuPrice = currentPrice(gpu);

  if (cpuPrice <= 0 || gpuPrice <= 0) {
    return false;
  }

  if (usage === "oyun") {
    if (isVeryLowEndCpu(cpu)) {
      return false;
    }

    const cores = parseCpuCores(cpu);

    if (cores > 0 && cores < 4) {
      return false;
    }

    if (
      budget >= 60000 &&
      resolution !== "1080p" &&
      cores > 0 &&
      cores < 6
    ) {
      return false;
    }
  }

  const ratio = cpuPrice / gpuPrice;
  const minRatio = minimumCpuGpuPriceRatio(
    usage,
    resolution,
    budget
  );

  if (ratio < minRatio) {
    return false;
  }

  // Oyun sisteminde işlemciye GPU'dan fazla bütçe gömmeyi de önle.
  if (usage === "oyun" && ratio > 1.15) {
    return false;
  }

  return true;
}

function estimateGpuPower(item: PricedHardwareItem) {
  const direct = parseFirstNumber(
    getSpec(item, [
      "Güç Tüketimi",
      "TDP",
      "TBP",
      "TGP",
    ])
  );

  if (direct > 0) return direct;

  const recommended = parseGpuRecommendedPsu(item);

  if (recommended > 0) {
    return Math.max(120, Math.round(recommended * 0.45));
  }

  return 180;
}

function calcPsuRequirement(
  cpu: PricedHardwareItem,
  gpu: PricedHardwareItem
) {
  const cpuWatt = parseCpuTdp(cpu);
  const gpuWatt = estimateGpuPower(gpu);

  const systemWatt = cpuWatt + gpuWatt + 75;
  const withHeadroom = Math.ceil(systemWatt * 1.3);
  const gpuSuggested = parseGpuRecommendedPsu(gpu);

  const required = Math.max(
    400,
    withHeadroom,
    gpuSuggested
  );

  const steps = [
    400,
    450,
    500,
    550,
    600,
    650,
    700,
    750,
    850,
    1000,
    1200,
    1300,
    1500,
  ];

  return (
    steps.find((value) => value >= required) ||
    required
  );
}

function uniqueById(items: PricedHardwareItem[]) {
  const map = new Map<number, PricedHardwareItem>();

  for (const item of items) {
    map.set(item.id, item);
  }

  return [...map.values()];
}

function candidateList(
  items: PricedHardwareItem[],
  targetPrice: number,
  count = 5
) {
  const valid = items.filter(
    (item) => currentPrice(item) > 0
  );

  if (!valid.length) return [];

  const closest = [...valid]
    .sort(
      (a, b) =>
        Math.abs(currentPrice(a) - targetPrice) -
        Math.abs(currentPrice(b) - targetPrice)
    )
    .slice(0, count);

  const cheapest = [...valid]
    .sort((a, b) => currentPrice(a) - currentPrice(b))
    .slice(0, 2);

  return uniqueById([...closest, ...cheapest]);
}

function buildScore(
  build: Omit<BuildSystem, "score">,
  budget: number,
  usage: string,
  resolution: string
) {
  const utilization = build.total / budget;

  let score = utilization * 100;

  if (utilization > 1) {
    score -= 1000;
  }

  if (utilization < 0.78) {
    score -= (0.78 - utilization) * 80;
  }

  const gpuShare = currentPrice(build.gpu) / budget;
  const cpuShare = currentPrice(build.cpu) / budget;
  const gpuVram = build.gpuVramGb;

  if (usage === "oyun") {
    const minVram = minGamingVramGb(
      budget,
      resolution
    );

    if (gpuVram < minVram) {
      score -= 500;
    }

    if (gpuVram >= minVram + 4) {
      score += 8;
    } else if (gpuVram >= minVram) {
      score += 4;
    }
    const idealGpu =
      resolution === "4K"
        ? 0.44
        : resolution === "1440p"
        ? 0.4
        : 0.34;

    score -= Math.abs(gpuShare - idealGpu) * 100;
    score += gpuShare * 18;
  } else if (usage === "render") {
    score -= Math.abs(cpuShare - 0.28) * 80;
    score += cpuShare * 14;
  } else if (usage === "ofis") {
    score -= Math.abs(cpuShare - 0.28) * 40;
  }

  if (build.storageGb >= 1024) {
    score += 5;
  } else if (build.storageGb >= 500) {
    score += budget <= 45000 ? 1 : -6;
  }

  const preferredRamGb =
    preferredRamCapacityGb(
      budget,
      usage
    );

  if (
    build.ramCapacityGb === preferredRamGb
  ) {
    score += 6;
  } else if (
    build.ramCapacityGb >
    preferredRamGb
  ) {
    score += 1;
  }

  if (build.ramModuleCount >= 2) {
    score += 4;
  }

  const ramFlags =
    ramMarketingFlags(build.ram);

  if (isPricePerformanceBand(budget)) {
    if (ramFlags.liquidCooling) {
      score -= 100;
    }

    if (ramFlags.premiumSeries) {
      score -= 8;
    }

    if (ramFlags.rgb) {
      score -= 2;
    }

    const ramPriceShare =
      currentPrice(build.ram) / budget;

    if (ramPriceShare <= 0.1) {
      score += 6;
    } else if (ramPriceShare > 0.14) {
      score -= 12;
    }
  }

  const psuHeadroom =
    build.psuWatt -
    build.recommendedPsuWatt;

  if (
    psuHeadroom >= 0 &&
    psuHeadroom <= 150
  ) {
    score += 5;
  } else if (psuHeadroom > 300) {
    score -= 6;
  }

  if (build.psuEfficiencyRank >= 1) {
    score += 2;
  }

  if (
    build.memoryType === "DDR5" &&
    budget >= 55000
  ) {
    score += 2;
  }

  const balanceRatio =
    build.cpuGpuPriceRatio;

  if (usage === "oyun") {
    const idealRatio =
      resolution === "1080p"
        ? 0.42
        : resolution === "1440p"
        ? 0.34
        : 0.28;

    score -=
      Math.abs(balanceRatio - idealRatio) * 22;

    if (
      build.cpuCores >= 6 &&
      budget >= 45000
    ) {
      score += 4;
    }
  }

  if (isPricePerformanceBand(budget)) {
    const gpuShare =
      currentPrice(build.gpu) / budget;
    const cpuShare =
      currentPrice(build.cpu) / budget;
    const boardShare =
      currentPrice(build.anakart) / budget;
    const ramShare =
      currentPrice(build.ram) / budget;
    const psuShare =
      currentPrice(build.psu) / budget;

    if (usage === "oyun") {
      score += gpuShare * 30;
    }

    if (gpuShare < 0.28 && usage === "oyun") {
      score -= 12;
    }

    if (cpuShare > 0.27) {
      score -= 6;
    }

    if (boardShare > 0.15) {
      score -= 10;
    }

    if (ramShare > 0.14) {
      score -= 12;
    }

    if (psuShare > 0.12) {
      score -= 8;
    }

    if (build.storageGb >= 1024) {
      score += 3;
    }
  }

  return score;
}

function getBudgetForTier(
  tier: BudgetTier,
  generationIndex: number
) {
  const config = budgetTiers[tier];
  const span =
    config.targetMax - config.targetMin;

  const steps = 3;
  const step =
    span > 0 ? span / steps : 0;

  const offset =
    generationIndex % (steps + 1);

  return Math.round(
    config.targetMin + offset * step
  );
}

function buildSignature(
  build: BuildSystem
) {
  return [
    build.cpu.id,
    build.gpu.id,
    build.anakart.id,
    build.ram.id,
    build.psu.id,
    build.ssd.id,
  ].join("-");
}

function createBuilds(
  hardware: GroupedHardware,
  budget: number,
  usage: string,
  resolution: string
) {
  let cpuRatio = 0.2;
  let gpuRatio = 0.4;
  let boardRatio = 0.11;
  let ramRatio = 0.09;
  let psuRatio = 0.08;
  let ssdRatio = 0.12;

  if (usage === "oyun") {
    gpuRatio =
      resolution === "4K"
        ? 0.44
        : resolution === "1440p"
        ? 0.4
        : 0.34;

    cpuRatio =
      resolution === "1080p" ? 0.23 : 0.2;

    boardRatio = 0.11;
    ramRatio = 0.09;
    psuRatio = 0.08;
    ssdRatio =
      1 -
      (gpuRatio +
        cpuRatio +
        boardRatio +
        ramRatio +
        psuRatio);

    if (isPricePerformanceBand(budget)) {
      gpuRatio =
        resolution === "1440p"
          ? 0.39
          : 0.36;
      cpuRatio = 0.2;
      boardRatio = 0.1;
      ramRatio = 0.08;
      psuRatio = 0.08;
      ssdRatio = 0.18;
    }
  } else if (usage === "render") {
    cpuRatio = 0.29;
    gpuRatio = 0.27;
    boardRatio = 0.12;
    ramRatio = 0.14;
    psuRatio = 0.08;
    ssdRatio = 0.1;
  } else if (usage === "ofis") {
    cpuRatio = 0.3;
    gpuRatio = 0.12;
    boardRatio = 0.15;
    ramRatio = 0.13;
    psuRatio = 0.1;
    ssdRatio = 0.2;
  }

  const cpuCandidates = candidateList(
    hardware.islemci,
    budget * cpuRatio,
    8
  );

  const gpuPool = hardware["ekran-karti"].filter(
    (gpu) => {
      const vram = parseVramGb(gpu);

      if (usage === "oyun") {
        return (
          vram >=
          minGamingVramGb(
            budget,
            resolution
          )
        );
      }

      if (usage === "render") {
        return vram >= 6;
      }

      if (usage === "genel") {
        return vram >= 4;
      }

      return true;
    }
  );

  const gpuCandidates = candidateList(
    gpuPool.length
      ? gpuPool
      : hardware["ekran-karti"],
    budget * gpuRatio,
    10
  );

  const builds: BuildSystem[] = [];

  for (const cpu of cpuCandidates) {
    const cpuSocket = inferSocket(cpu);
    if (!cpuSocket) continue;

    const boards = hardware.anakart.filter(
      (board) => inferSocket(board) === cpuSocket
    );

    if (!boards.length) continue;

    const boardCandidates = candidateList(
      boards,
      budget * boardRatio,
      4
    );

    for (const gpu of gpuCandidates) {
      const gpuVramGb = parseVramGb(gpu);

      if (
        !isCpuGpuBalanced(
          cpu,
          gpu,
          usage,
          resolution,
          budget
        )
      ) {
        continue;
      }

      if (
        usage === "oyun" &&
        gpuVramGb <
          minGamingVramGb(
            budget,
            resolution
          )
      ) {
        continue;
      }

      if (
        usage === "render" &&
        gpuVramGb > 0 &&
        gpuVramGb < 6
      ) {
        continue;
      }

      const requiredPsuWatt =
        calcPsuRequirement(cpu, gpu);

      let psuPool = hardware.psu.filter(
        (item) => {
          const watt = parsePsuWatt(item);

          return (
            watt >= requiredPsuWatt &&
            watt <= requiredPsuWatt + 200
          );
        }
      );

      if (!psuPool.length) {
        psuPool = hardware.psu.filter(
          (item) =>
            parsePsuWatt(item) >=
            requiredPsuWatt
        );
      }

      if (!psuPool.length) continue;

      if (isPricePerformanceBand(budget)) {
        const certified = psuPool.filter(
          (item) =>
            parsePsuEfficiencyRank(item) >= 1
        );

        if (certified.length) {
          psuPool = certified;
        }
      }

      let psuCandidates = candidateList(
        psuPool,
        budget * psuRatio,
        4
      );

      if (!psuCandidates.length) {
        psuCandidates = candidateList(
          hardware.psu.filter(
            (item) =>
              parsePsuWatt(item) >=
              requiredPsuWatt
          ),
          budget * psuRatio,
          4
        );
      }

      if (!psuCandidates.length) continue;

      for (const anakart of boardCandidates) {
        const memoryType =
          inferMemoryType(anakart);

        const minRamGb =
          minRamCapacityGb(
            budget,
            usage
          );

        const preferredRamGb =
          preferredRamCapacityGb(
            budget,
            usage
          );

        // Önce yalnızca teknik uyumluluğu zorunlu tut.
        // Fiyat/performans tercihleri aşağıda "öncelik" olarak uygulanır;
        // uygun sistem bulmayı tamamen engellemez.
        const allCompatibleRam = hardware.ram.filter(
          (ram) => {
            const ramType = inferMemoryType(ram);
            const capacity = parseCapacityGb(ram);

            return (
              capacity >= minRamGb &&
              (!memoryType ||
                !ramType ||
                ramType === memoryType)
            );
          }
        );

        if (!allCompatibleRam.length) continue;

        let ramPool = [...allCompatibleRam];

        if (isPricePerformanceBand(budget)) {
          // 1) Önce hedef kapasiteyi tercih et.
          const preferredPool =
            ramPool.filter(
              (ram) =>
                parseCapacityGb(ram) ===
                preferredRamGb
            );

          if (preferredPool.length) {
            ramPool = preferredPool;
          }

          // 2) Aynı grupta düz / sade RAM varsa onu tercih et.
          const plainPool =
            ramPool.filter((ram) => {
              const flags =
                ramMarketingFlags(ram);

              return (
                !flags.liquidCooling &&
                !flags.premiumSeries &&
                !flags.rgb
              );
            });

          if (plainPool.length) {
            ramPool = plainPool;
          } else {
            // 3) Düz model yoksa sıvı soğutmalı olmayan,
            // daha normal alternatiflere geri dön.
            const normalPool =
              ramPool.filter((ram) => {
                const flags =
                  ramMarketingFlags(ram);

                return !flags.liquidCooling;
              });

            if (normalPool.length) {
              ramPool = normalPool;
            }
          }

          // 4) Eğer yukarıdaki tercihler sonucu havuz aşırı daraldıysa
          // tüm teknik uyumlu RAM'lere geri dön.
          if (!ramPool.length) {
            ramPool = [...allCompatibleRam];
          }
        }

        if (!ramPool.length) continue;

        const ramTarget =
          budget * ramRatio;

        let ramCandidates = candidateList(
          ramPool,
          ramTarget,
          4
        );

        if (!ramCandidates.length) {
          ramCandidates = candidateList(
            hardware.ram.filter((ram) => {
              const ramType = inferMemoryType(ram);
              const capacity = parseCapacityGb(ram);

              return (
                capacity >= minRamGb &&
                (!memoryType ||
                  !ramType ||
                  ramType === memoryType)
              );
            }),
            ramTarget,
            4
          );
        }

        if (!ramCandidates.length) continue;

        const preferredStorageGb =
          budget <= 60000
            ? 500
            : usage === "ofis"
            ? 500
            : 1000;

        const storagePool = hardware.ssd.filter(
          (ssd) =>
            parseCapacityGb(ssd) >=
            preferredStorageGb
        );

        if (!storagePool.length) continue;

        const ssdCandidates = candidateList(
          storagePool,
          budget * ssdRatio,
          4
        );

        for (const ram of ramCandidates) {
          const ramType = inferMemoryType(ram);

          if (
            memoryType &&
            ramType &&
            memoryType !== ramType
          ) {
            continue;
          }

          for (const psu of psuCandidates) {
            for (const ssd of ssdCandidates) {
              const total =
                currentPrice(cpu) +
                currentPrice(gpu) +
                currentPrice(anakart) +
                currentPrice(ram) +
                currentPrice(psu) +
                currentPrice(ssd);

              if (total > budget) continue;

              const storageGb =
                parseCapacityGb(ssd);

              const baseBuild = {
                cpu,
                gpu,
                anakart,
                ram,
                psu,
                ssd,
                total,
                cpuSocket,
                memoryType:
                  memoryType ||
                  ramType ||
                  "Bilinmiyor",
                recommendedPsuWatt:
                  requiredPsuWatt,
                storageGb,
                gpuVramGb,
                ramCapacityGb:
                  parseCapacityGb(ram),
                ramModuleCount:
                  parseRamModuleCount(ram),
                psuWatt:
                  parsePsuWatt(psu),
                psuEfficiencyRank:
                  parsePsuEfficiencyRank(psu),
                cpuCores:
                  parseCpuCores(cpu),
                cpuGpuPriceRatio:
                  currentPrice(cpu) /
                  Math.max(
                    currentPrice(gpu),
                    1
                  ),
              };

              builds.push({
                ...baseBuild,
                score: buildScore(
                  baseBuild,
                  budget,
                  usage,
                  resolution
                ),
              });
            }
          }
        }
      }
    }
  }

  return builds.sort(
    (a, b) => b.score - a.score
  );
}

export default function PcOneriPage() {
  const [budgetTier, setBudgetTier] =
    useState<BudgetTier>("dusuk");

  const [generationIndex, setGenerationIndex] =
    useState(0);

  const [usage, setUsage] =
    useState<string>("oyun");

  const [resolution, setResolution] =
    useState<string>("1080p");

  const [hardwareData, setHardwareData] =
    useState<GroupedHardware>(emptyHardware);

  const [loading, setLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState<string | null>(null);

  const [hasGenerated, setHasGenerated] =
    useState(false);

  const [generateError, setGenerateError] =
    useState<string | null>(null);

  const [system, setSystem] =
    useState<BuildSystem | null>(null);

  useEffect(() => {
    async function loadHardware() {
      try {
        setLoading(true);
        setLoadError(null);

        const response = await fetch(
          "/api/hardware/available",
          { cache: "no-store" }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.error ||
              "Donanımlar yüklenemedi."
          );
        }

        const grouped: GroupedHardware = {
          islemci: [],
          "ekran-karti": [],
          anakart: [],
          ram: [],
          psu: [],
          ssd: [],
        };

        for (
          const item of result.items as PricedHardwareItem[]
        ) {
          if (
            !item.has_valid_price ||
            item.current_price == null
          ) {
            continue;
          }

          switch (item.category) {
            case "islemciler":
              grouped.islemci.push(item);
              break;
            case "ekran-kartlari":
              grouped["ekran-karti"].push(item);
              break;
            case "anakartlar":
              grouped.anakart.push(item);
              break;
            case "bellekler":
              grouped.ram.push(item);
              break;
            case "guc-kaynaklari":
              grouped.psu.push(item);
              break;
            case "depolama":
              grouped.ssd.push(item);
              break;
          }
        }

        setHardwareData(grouped);
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

  const counts = useMemo(
    () => ({
      cpu: hardwareData.islemci.length,
      gpu: hardwareData["ekran-karti"].length,
      board: hardwareData.anakart.length,
      ram: hardwareData.ram.length,
      psu: hardwareData.psu.length,
      ssd: hardwareData.ssd.length,
    }),
    [hardwareData]
  );

  const handleGenerate = () => {
    setGenerateError(null);

    const budget = getBudgetForTier(
      budgetTier,
      generationIndex
    );

    const missing = [
      ["işlemci", hardwareData.islemci],
      ["ekran kartı", hardwareData["ekran-karti"]],
      ["anakart", hardwareData.anakart],
      ["bellek", hardwareData.ram],
      ["güç kaynağı", hardwareData.psu],
      ["depolama", hardwareData.ssd],
    ]
      .filter(([, list]) => list.length === 0)
      .map(([name]) => name);

    if (missing.length) {
      setGenerateError(
        `Güncel fiyatlı ürün bulunamayan kategoriler: ${missing.join(
          ", "
        )}.`
      );
      return;
    }

    const builds = createBuilds(
      hardwareData,
      budget,
      usage,
      resolution
    );

    if (!builds.length) {
      setGenerateError(
        "Bu seviye için dengeli ve uyumlu bir sistem bulunamadı. Bir üst seviye bütçe aralığını seçmeyi deneyin."
      );
      return;
    }

    let selectedBuild = builds[
      generationIndex % builds.length
    ];

    if (
      system &&
      builds.length > 1 &&
      buildSignature(selectedBuild) ===
        buildSignature(system)
    ) {
      selectedBuild = builds[
        (generationIndex + 1) % builds.length
      ];
    }

    setSystem(selectedBuild);
    setHasGenerated(true);
    setGenerationIndex((prev) => prev + 1);
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
            ✨
          </span>
          Otomatik PC Önerisi
        </h1>

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

      {loadError && (
        <div className="p-5 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
          {loadError}
        </div>
      )}

      {!loading && !loadError && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 p-6 bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col gap-6 shadow-sm">
            <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold tracking-wider">
              <Sparkles size={16} />
              TERCİHLERİNİ BELİRLE
            </div>

            <div className="grid grid-cols-3 gap-2 text-[10px] text-zinc-500">
              <span>CPU: {counts.cpu}</span>
              <span>GPU: {counts.gpu}</span>
              <span>Anakart: {counts.board}</span>
              <span>RAM: {counts.ram}</span>
              <span>PSU: {counts.psu}</span>
              <span>SSD: {counts.ssd}</span>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-zinc-400 tracking-wider">
                SİSTEM SEVİYESİ
              </span>

              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(
                  budgetTiers
                ) as BudgetTier[]).map(
                  (tier) => {
                    const config =
                      budgetTiers[tier];

                    return (
                      <button
                        key={tier}
                        onClick={() => {
                          setBudgetTier(tier);
                          setGenerationIndex(0);
                          setSystem(null);
                          setHasGenerated(false);
                          setGenerateError(null);
                        }}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          budgetTier === tier
                            ? "bg-cyan-500/10 border-cyan-500 text-white"
                            : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                        }`}
                      >
                        <div className="text-sm font-bold">
                          {config.label}
                        </div>

                        <div className="text-[10px] text-zinc-500 mt-1">
                          {tier === "dusuk"
                            ? "40–65K"
                            : tier === "orta"
                            ? "65–100K"
                            : "100K+"}
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-zinc-400 tracking-wider">
                KULLANIM AMACI
              </span>

              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    id: "oyun",
                    title: "Oyun",
                    desc: "GPU ağırlıklı dengeli sistem",
                  },
                  {
                    id: "ofis",
                    title: "Ofis",
                    desc: "Daha ekonomik ve dengeli",
                  },
                  {
                    id: "render",
                    title: "Render",
                    desc: "CPU ve RAM ağırlıklı",
                  },
                  {
                    id: "genel",
                    title: "Genel",
                    desc: "Dengeli çok amaçlı sistem",
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setUsage(item.id)}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                      usage === item.id
                        ? "bg-cyan-500/10 border-cyan-500 text-white"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <span className="font-bold text-sm text-white">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {item.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-zinc-400 tracking-wider">
                HEDEF ÇÖZÜNÜRLÜK
              </span>

              <div className="grid grid-cols-3 gap-2">
                {["1080p", "1440p", "4K"].map(
                  (res) => (
                    <button
                      key={res}
                      onClick={() => setResolution(res)}
                      className={`p-3 rounded-2xl border text-center ${
                        resolution === res
                          ? "bg-cyan-500/10 border-cyan-500 text-white"
                          : "bg-zinc-950 border-zinc-800 text-zinc-400"
                      }`}
                    >
                      {res}
                    </button>
                  )
                )}
              </div>
            </div>

            {generateError && (
              <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs flex gap-2">
                <AlertTriangle
                  size={15}
                  className="shrink-0"
                />
                {generateError}
              </div>
            )}

            <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-[11px] leading-5 text-amber-200/80">
              Bu araç bilgilendirme ve öneri amaçlıdır. Satın almadan önce parça uyumluluğunu,
              PSU gereksinimini ve güncel fiyatları ayrıca kontrol edin.
            </div>

            <button
              onClick={handleGenerate}
              className="w-full py-4 bg-gradient-to-r from-cyan-400 to-cyan-500 text-zinc-950 font-bold rounded-2xl flex items-center justify-center gap-2 text-sm"
            >
              <Sparkles size={16} />
              YENİ ÖNERİ OLUŞTUR
            </button>
          </div>

          <div className="lg:col-span-7 p-8 bg-zinc-900/60 border border-zinc-800/80 rounded-3xl min-h-[520px] flex items-center justify-center">
            {!hasGenerated || !system ? (
              <div className="text-center text-zinc-400 text-sm">
                Sistem seviyesini ve kullanım amacını
                belirleyip öneri oluştur.
              </div>
            ) : (
              <div className="w-full flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Zap
                      size={18}
                      className="text-cyan-400"
                    />
                    Önerilen Sistem
                  </h2>

                  <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-1">
                    <ShieldCheck size={14} />
                    Uyum kontrolü geçti
                  </span>
                </div>

                <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                    <div>
                      <div className="text-xs text-cyan-400 font-semibold uppercase">
                        {usage} / {resolution} / {budgetTiers[budgetTier].label}
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-1">
                        Soket: {system.cpuSocket} • RAM:{" "}
                        {system.memoryType} • PSU: en az{" "}
                        CPU: {system.cpuCores > 0
                          ? `${system.cpuCores} çekirdek`
                          : "çekirdek bilgisi yok"} • PSU: {system.psuWatt}W
                        (min. {system.recommendedPsuWatt}W) • RAM:{" "}
                        {system.ramCapacityGb} GB
                        {system.ramModuleCount >= 2
                          ? ` / ${system.ramModuleCount} modül`
                          : ""} • VRAM:{" "}
                        {system.gpuVramGb > 0
                          ? `${system.gpuVramGb} GB`
                          : "Bilinmiyor"} • SSD:{" "}
                        {system.storageGb >= 1024
                          ? `${Math.round(
                              system.storageGb / 1024
                            )} TB`
                          : `${Math.round(
                              system.storageGb
                            )} GB`}
                      </div>
                    </div>

                    <span className="text-xl font-extrabold text-white">
                      {formatPrice(system.total)}
                    </span>
                  </div>

                  {[
                    ["İşlemci", system.cpu],
                    ["Ekran Kartı", system.gpu],
                    ["Anakart", system.anakart],
                    ["Bellek", system.ram],
                    ["Güç Kaynağı", system.psu],
                    ["Depolama", system.ssd],
                  ].map(([label, item]) => {
                    const product =
                      item as PricedHardwareItem;

                    return (
                      <div
                        key={String(label)}
                        className="flex justify-between gap-4 py-2 border-b border-zinc-900 last:border-0"
                      >
                        <span className="text-xs text-zinc-400">
                          {String(label)}
                        </span>

                        <div className="text-right max-w-[70%]">
                          <div className="text-xs font-bold text-white">
                            {product.name}
                          </div>

                          <div className="text-[10px] text-cyan-400 mt-1">
                            {formatPrice(
                              currentPrice(product)
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
