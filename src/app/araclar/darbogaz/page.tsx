"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Activity,
  Cpu,
  Monitor,
  Loader2,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";

import type { PricedHardwareItem } from "@/app/lib/hardware-types";
import ToolGuide from "@/app/components/ToolGuide";

type Resolution = "1080p" | "1440p" | "4K";

type BalanceResult = {
  risk: number;
  status: "good" | "warning" | "high";
  title: string;
  description: string;
  cpuScore: number;
  gpuScore: number;
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

function firstNumber(value: string) {
  const match = value
    .replace(",", ".")
    .match(/(\d+(?:\.\d+)?)/);

  return match ? Number(match[1]) : 0;
}

function parseCpuCores(item: PricedHardwareItem) {
  const direct = firstNumber(
    getSpec(item, [
      "Çekirdek",
      "Çekirdek Sayısı",
      "Cores",
    ])
  );

  if (direct > 0) return direct;

  const raw = `${item.name} ${item.description || ""}`;

  const match = raw.match(
    /(\d{1,2})\s*(?:çekirdek|core)/i
  );

  return match ? Number(match[1]) : 4;
}

function parseCpuBoost(item: PricedHardwareItem) {
  const direct = firstNumber(
    getSpec(item, [
      "Boost Frekans",
      "Boost",
      "Maks. Frekans",
    ])
  );

  if (direct > 0) return direct;

  const raw = `${item.name} ${item.description || ""}`;

  const matches = [
    ...raw.matchAll(
      /(\d+(?:[.,]\d+)?)\s*GHz/gi
    ),
  ].map((m) =>
    Number(m[1].replace(",", "."))
  );

  return matches.length
    ? Math.max(...matches)
    : 4;
}

function cpuGenerationBonus(name: string) {
  const n = name.toUpperCase();

  if (n.includes("X3D")) {
    if (/RYZEN\s+[3579]\s+9\d{3}/.test(n)) return 1.30;
    if (/RYZEN\s+[3579]\s+7\d{3}/.test(n)) return 1.26;
    if (/RYZEN\s+[3579]\s+5\d{3}/.test(n)) return 1.08;
  }

  if (/RYZEN\s+[3579]\s+9\d{3}/.test(n)) return 1.18;
  if (/RYZEN\s+[3579]\s+8\d{3}/.test(n)) return 1.14;
  if (/RYZEN\s+[3579]\s+7\d{3}/.test(n)) return 1.1;
  if (/RYZEN\s+[3579]\s+5\d{3}/.test(n)) return 0.95;
  if (/RYZEN\s+[3579]\s+3\d{3}/.test(n)) return 0.78;

  const intel = n.match(/I[3579]-(\d{2})\d{3}/);
  if (intel) {
    const gen = Number(intel[1]);

    if (gen >= 15) return 1.2;
    if (gen >= 14) return 1.15;
    if (gen >= 13) return 1.1;
    if (gen >= 12) return 1.03;
    if (gen >= 10) return 0.9;
  }

  if (
    n.includes("ATHLON") ||
    n.includes("CELERON") ||
    n.includes("PENTIUM")
  ) {
    return 0.45;
  }

  return 0.9;
}

function cpuStrength(item: PricedHardwareItem) {
  const cores = parseCpuCores(item);
  const boost = parseCpuBoost(item);
  const generation = cpuGenerationBonus(item.name);

  return (
    Math.min(cores, 12) *
    boost *
    generation
  );
}

function parseVram(item: PricedHardwareItem) {
  const raw = [
    getSpec(item, [
      "VRAM",
      "Ekran Kartı Belleği",
    ]),
    item.name,
    item.description || "",
  ].join(" ");

  const gb = raw.match(
    /(\d{1,2})\s*GB/i
  );

  if (gb) return Number(gb[1]);

  const mb = raw.match(
    /(\d{3,5})\s*MB/i
  );

  if (mb) {
    return Number(mb[1]) / 1024;
  }

  return 4;
}

function gpuModelScore(name: string) {
  const n = name
    .toUpperCase()
    .replace(/\s+/g, "");

  const rtx = n.match(
    /RTX(\d{4})(TI|SUPER)?/
  );

  if (rtx) {
    const model = Number(rtx[1]);
    let score = 0;

    if (model >= 5090) score = 100;
    else if (model >= 5080) score = 90;
    else if (model >= 5070) score = 76;
    else if (model >= 5060) score = 62;
    else if (model >= 4090) score = 94;
    else if (model >= 4080) score = 84;
    else if (model >= 4070) score = 72;
    else if (model >= 4060) score = 58;
    else if (model >= 3090) score = 78;
    else if (model >= 3080) score = 70;
    else if (model >= 3070) score = 60;
    else if (model >= 3060) score = 50;
    else if (model >= 3050) score = 39;

    if (rtx[2] === "TI") score += 6;
    if (rtx[2] === "SUPER") score += 4;

    return score;
  }

  const rx = n.match(
    /RX(\d{4})(XT|XTX)?/
  );

  if (rx) {
    const model = Number(rx[1]);
    let score = 0;

    if (model >= 9070) score = 79;
    else if (model >= 7900) score = 84;
    else if (model >= 7800) score = 73;
    else if (model >= 7700) score = 65;
    else if (model >= 7600) score = 54;
    else if (model >= 6950) score = 74;
    else if (model >= 6900) score = 70;
    else if (model >= 6800) score = 64;
    else if (model >= 6750) score = 57;
    else if (model >= 6700) score = 54;
    else if (model >= 6650) score = 47;
    else if (model >= 6600) score = 44;

    if (rx[2] === "XT") score += 4;
    if (rx[2] === "XTX") score += 8;

    return score;
  }

  const arc = n.match(/ARC[A-Z]?(\d{3})/);

  if (arc) {
    const model = Number(arc[1]);

    if (model >= 770) return 52;
    if (model >= 750) return 47;
    if (model >= 580) return 43;
  }

  return 35;
}

function gpuStrength(
  item: PricedHardwareItem,
  resolution: Resolution
) {
  const model = gpuModelScore(item.name);
  const vram = parseVram(item);

  let vramBonus = 0;

  if (resolution === "1080p") {
    if (vram >= 8) vramBonus = 4;
    else if (vram < 6) vramBonus = -8;
  }

  if (resolution === "1440p") {
    if (vram >= 12) vramBonus = 6;
    else if (vram < 8) vramBonus = -10;
  }

  if (resolution === "4K") {
    if (vram >= 16) vramBonus = 8;
    else if (vram < 12) vramBonus = -12;
  }

  return Math.max(20, model + vramBonus);
}

function calculateBalance(
  cpu: PricedHardwareItem,
  gpu: PricedHardwareItem,
  resolution: Resolution
): BalanceResult {
  const rawCpu = cpuStrength(cpu);
  const rawGpu = gpuStrength(
    gpu,
    resolution
  );

  // CPU gücünü GPU ölçeğine yaklaştır.
  const cpuScore = rawCpu * 2.35;

  // Çözünürlük yükseldikçe CPU üzerindeki baskı azalır,
  // GPU sınırlaması daha baskın hale gelir.
  const resolutionFactor =
    resolution === "1080p"
      ? 1
      : resolution === "1440p"
      ? 0.80
      : 0.62;

  const requiredCpu =
    rawGpu * resolutionFactor;

  const ratio =
    cpuScore /
    Math.max(requiredCpu, 1);

  let risk = 0;
  let title = "";
  let description = "";
  let status: BalanceResult["status"] =
    "good";

  if (ratio < 0.55) {
    // Çok güçlü GPU + belirgin zayıf CPU.
    risk = Math.round(
      Math.min(
        45,
        24 +
          (0.55 - ratio) * 50
      )
    );

    status = "high";
    title =
      "Yüksek CPU darboğazı riski";

    description =
      "İşlemci, seçilen ekran kartını özellikle 1080p ve işlemci ağırlıklı oyunlarda belirgin şekilde sınırlayabilir.";
  } else if (ratio < 0.78) {
    // Orta düzey CPU yetersizliği.
    risk = Math.round(
      Math.min(
        24,
        10 +
          (0.78 - ratio) * 35
      )
    );

    status = "warning";
    title =
      "Orta düzey CPU darboğazı riski";

    description =
      "Sistem kullanılabilir ancak bazı oyunlarda ekran kartı tam kapasitesine ulaşamayabilir. Daha yüksek çözünürlükte bu risk genellikle azalır.";
  } else if (ratio > 2.15) {
    // CPU çok daha güçlü; bu klasik darboğaz değil,
    // sistemin GPU tarafından sınırlanmasıdır.
    risk = Math.round(
      Math.min(
        35,
        12 +
          (ratio - 2.15) * 10
      )
    );

    status = "warning";
    title =
      "GPU sınırlı sistem";

    description =
      "İşlemci ekran kartına göre belirgin şekilde daha güçlü. Bu bir CPU darboğazı değildir; oyun performansını ağırlıklı olarak ekran kartı belirler.";
  } else if (ratio > 1.75) {
    risk = Math.round(
      Math.min(
        18,
        8 +
          (ratio - 1.75) * 12
      )
    );

    status = "warning";
    title =
      "Hafif GPU sınırlaması";

    description =
      "İşlemci tarafında yeterli pay var. Oyunlarda ana sınırlayıcı çoğunlukla ekran kartı olacaktır.";
  } else {
    // Dengeli bant.
    const center = 1.18;
    risk = Math.round(
      Math.max(
        1,
        Math.min(
          8,
          Math.abs(center - ratio) * 10
        )
      )
    );

    status = "good";
    title = "Dengeli eşleşme";

    description =
      "İşlemci ve ekran kartı seçilen çözünürlük için genel olarak dengeli görünüyor.";
  }

  return {
    risk,
    status,
    title,
    description,
    cpuScore,
    gpuScore: rawGpu,
  };
}

export default function DarbogazPage() {
  const [cpus, setCpus] = useState<
    PricedHardwareItem[]
  >([]);

  const [gpus, setGpus] = useState<
    PricedHardwareItem[]
  >([]);

  const [cpuId, setCpuId] =
    useState<number | null>(null);

  const [gpuId, setGpuId] =
    useState<number | null>(null);

  const [resolution, setResolution] =
    useState<Resolution>("1080p");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [result, setResult] =
    useState<BalanceResult | null>(null);

  useEffect(() => {
    async function loadHardware() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          "/api/hardware/available",
          {
            cache: "no-store",
          }
        );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.error ||
              "Donanımlar yüklenemedi."
          );
        }

        const items =
          data.items as PricedHardwareItem[];

        const cpuItems = items
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
                sensitivity: "base",
              }
            )
          );

        const gpuItems = items
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
                sensitivity: "base",
              }
            )
          );

        setCpus(cpuItems);
        setGpus(gpuItems);

        if (cpuItems[0]) {
          setCpuId(cpuItems[0].id);
        }

        if (gpuItems[0]) {
          setGpuId(gpuItems[0].id);
        }
      } catch (err: any) {
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

  const selectedCpu = useMemo(
    () =>
      cpus.find(
        (item) => item.id === cpuId
      ) || null,
    [cpus, cpuId]
  );

  const selectedGpu = useMemo(
    () =>
      gpus.find(
        (item) => item.id === gpuId
      ) || null,
    [gpus, gpuId]
  );

  const handleCalculate = () => {
    if (!selectedCpu || !selectedGpu) {
      setResult(null);
      return;
    }

    setResult(
      calculateBalance(
        selectedCpu,
        selectedGpu,
        resolution
      )
    );
  };

  const resultClasses =
    result?.status === "good"
      ? "border-emerald-500/30 bg-emerald-500/5"
      : result?.status === "high"
      ? "border-red-500/30 bg-red-500/5"
      : "border-amber-500/30 bg-amber-500/5";

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-6">
      <Link
        href="/araclar"
        className="text-xs text-zinc-400 hover:text-cyan-400 transition-colors flex items-center gap-1 w-fit"
      >
        <ArrowLeft size={14} />
        Araçlara dön
      </Link>

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <Activity
            size={28}
            className="text-cyan-400"
          />
          Darboğaz Hesaplayıcı
        </h1>

        <p className="text-sm text-zinc-500 mt-2">
          İşlemci ve ekran kartının seçilen
          çözünürlükte ne kadar dengeli olduğunu
          tahmini olarak analiz eder.
        </p>
      </div>

      {loading && (
        <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900 flex items-center gap-3 text-zinc-400">
          <Loader2
            size={18}
            className="animate-spin text-cyan-400"
          />
          Güncel donanımlar yükleniyor...
        </div>
      )}

      {error && (
        <div className="p-5 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 p-6 rounded-3xl border border-zinc-800 bg-zinc-900 flex flex-col gap-5">
            <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold">
              <Cpu size={17} />
              DONANIM SEÇİMİ
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-400">
                İşlemci (CPU)
              </label>

              <select
                value={cpuId ?? ""}
                onChange={(e) => {
                  setCpuId(
                    Number(e.target.value)
                  );
                  setResult(null);
                }}
                className="w-full p-3.5 rounded-xl border border-zinc-800 bg-zinc-950 text-sm text-white outline-none focus:border-cyan-500/50"
              >
                {cpus.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
                <Monitor size={14} />
                Ekran Kartı (GPU)
              </label>

              <select
                value={gpuId ?? ""}
                onChange={(e) => {
                  setGpuId(
                    Number(e.target.value)
                  );
                  setResult(null);
                }}
                className="w-full p-3.5 rounded-xl border border-zinc-800 bg-zinc-950 text-sm text-white outline-none focus:border-cyan-500/50"
              >
                {gpus.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-400">
                Çözünürlük
              </label>

              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    "1080p",
                    "1440p",
                    "4K",
                  ] as Resolution[]
                ).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setResolution(item);
                      setResult(null);
                    }}
                    className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                      resolution === item
                        ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                        : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleCalculate}
              disabled={
                !selectedCpu ||
                !selectedGpu
              }
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-cyan-500 text-zinc-950 font-black text-sm disabled:opacity-40"
            >
              DARBOĞAZI ANALİZ ET
            </button>
          </div>

          <div className="lg:col-span-7 min-h-[430px] p-7 rounded-3xl border border-zinc-800 bg-zinc-900/60 flex items-center justify-center">
            {!result ? (
              <div className="text-center max-w-sm">
                <Activity
                  size={35}
                  className="mx-auto text-zinc-700 mb-3"
                />

                <p className="text-sm text-zinc-500">
                  İşlemci, ekran kartı ve
                  çözünürlüğü seçip analizi
                  başlat.
                </p>
              </div>
            ) : (
              <div className="w-full flex flex-col gap-5">
                <div
                  className={`p-6 rounded-2xl border ${resultClasses}`}
                >
                  <div className="flex items-start gap-3">
                    {result.status ===
                    "good" ? (
                      <ShieldCheck
                        size={22}
                        className="text-emerald-400 shrink-0"
                      />
                    ) : (
                      <AlertTriangle
                        size={22}
                        className={
                          result.status ===
                          "high"
                            ? "text-red-400 shrink-0"
                            : "text-amber-400 shrink-0"
                        }
                      />
                    )}

                    <div>
                      <h2 className="text-lg font-black text-white">
                        {result.title}
                      </h2>

                      <p className="text-sm text-zinc-400 mt-2 leading-6">
                        {result.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950">
                    <div className="text-[11px] text-zinc-500">
                      Tahmini denge riski
                    </div>

                    <div className="text-3xl font-black text-cyan-400 mt-1">
                      %{result.risk}
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950">
                    <div className="text-[11px] text-zinc-500">
                      Çözünürlük
                    </div>

                    <div className="text-3xl font-black text-white mt-1">
                      {resolution}
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950 space-y-3">
                  <div className="flex justify-between gap-4 text-xs">
                    <span className="text-zinc-500">
                      İşlemci
                    </span>

                    <span className="text-white font-bold text-right">
                      {selectedCpu?.name}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 text-xs">
                    <span className="text-zinc-500">
                      Ekran Kartı
                    </span>

                    <span className="text-white font-bold text-right">
                      {selectedGpu?.name}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 text-xs">
                    <span className="text-zinc-500">
                      CPU çekirdek
                    </span>

                    <span className="text-zinc-300 font-bold">
                      {selectedCpu
                        ? parseCpuCores(
                            selectedCpu
                          )
                        : "-"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 text-xs">
                    <span className="text-zinc-500">
                      GPU VRAM
                    </span>

                    <span className="text-zinc-300 font-bold">
                      {selectedGpu
                        ? `${parseVram(
                            selectedGpu
                          )} GB`
                        : "-"}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-[11px] leading-5 text-amber-200/80">
                  Bu araç tahmini denge analizi yapar; gösterilen yüzde kesin bir performans kaybı değildir.
                  Gerçek sınırlama; oyun, çözünürlük, grafik ayarı, sürücü, RAM ve arka plan yüküne göre değişebilir.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <ToolGuide tool="darbogaz" />
    </div>
  );
}
