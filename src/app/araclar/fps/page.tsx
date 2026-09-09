"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Cpu, Monitor, Gamepad2, Sparkles } from "lucide-react";
import { hardwareData, HardwareItem } from "@/data/hardwareData";

const popularGames = [
  { name: "Cyberpunk 2077", baseWeight: 0.6 },
  { name: "Black Myth: Wukong", baseWeight: 0.65 },
  { name: "Monster Hunter Wilds", baseWeight: 0.62 },
  { name: "Grand Theft Auto V", baseWeight: 1.2 },
  { name: "Counter-Strike 2", baseWeight: 1.8 },
  { name: "Valorant", baseWeight: 2.0 },
  { name: "Fortnite", baseWeight: 1.3 },
  { name: "Alan Wake 2", baseWeight: 0.58 },
  { name: "Elden Ring", baseWeight: 0.9 },
  { name: "Baldur's Gate 3", baseWeight: 0.85 },
  { name: "Call of Duty: Warzone", baseWeight: 0.95 },
  { name: "God of War Ragnarok", baseWeight: 1.0 },
  { name: "Forza Horizon 5", baseWeight: 1.4 },
  { name: "Marvel Rivals", baseWeight: 1.1 },
  { name: "Helldivers 2", baseWeight: 0.88 },
];

export default function FpsHesaplayiciPage() {
  const [selectedCpu, setSelectedCpu] = useState<HardwareItem | null>(hardwareData.islemci[3] || null);
  const [selectedGpu, setSelectedGpu] = useState<HardwareItem | null>(hardwareData["ekran-karti"][3] || null);
  const [resolution, setResolution] = useState<string>("1080p");
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);

  const [gameResults, setGameResults] = useState<Array<{ name: string; mediumFps: number; ultraFps: number }>>([]);

  const handleCalculate = () => {
    if (!selectedCpu || !selectedGpu) return;

    // Donanım gücü skoru hesaplama
    const gpuPower = selectedGpu.price / 1000;
    const cpuPower = selectedCpu.price / 1500;
    const baseScore = Math.min(gpuPower, cpuPower * 1.3);

    // Çözünürlük çarpanı
    let resMultiplier = 1.0;
    if (resolution === "1440p") resMultiplier = 0.75;
    if (resolution === "4K") resMultiplier = 0.45;

    const results = popularGames.map((game) => {
      const rawMedium = Math.round(baseScore * game.baseWeight * resMultiplier * 14);
      const rawUltra = Math.round(rawMedium * 0.65); // Ultra ayarlar için düşüş

      return {
        name: game.name,
        mediumFps: Math.max(25, rawMedium),
        ultraFps: Math.max(15, rawUltra),
      };
    });

    setGameResults(results);
    setHasCalculated(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link href="/araclar" className="text-xs text-zinc-400 hover:text-cyan-400 transition-colors flex items-center gap-1 w-fit mb-2">
          <ArrowLeft size={14} /> Araçlara dön
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <span className="text-cyan-400">🎮</span> Oyun FPS Hesaplayıcı
        </h1>
        <p className="text-zinc-400 text-sm">Donanımınızın güncel popüler oyunlarda orta ve ultra ayarlarda vereceği tahmini FPS değerlerini görün.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sol Panel: Seçimler */}
        <div className="lg:col-span-5 p-6 bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col gap-6 shadow-sm sticky top-24">
          <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold tracking-wider">
            <Gamepad2 size={18} /> SİSTEM BİLEŞENLERİ
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-400 tracking-wider flex items-center gap-1.5">
              <Cpu size={14} className="text-cyan-400" /> İŞLEMCİ (CPU)
            </label>
            <select
              value={selectedCpu?.id || ""}
              onChange={(e) => {
                const found = hardwareData.islemci.find((i) => i.id === e.target.value);
                setSelectedCpu(found || null);
              }}
              className="w-full p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl text-white text-sm focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
            >
              {hardwareData.islemci.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-400 tracking-wider flex items-center gap-1.5">
              <Monitor size={14} className="text-cyan-400" /> EKRAN KARTI (GPU)
            </label>
            <select
              value={selectedGpu?.id || ""}
              onChange={(e) => {
                const found = hardwareData["ekran-karti"].find((i) => i.id === e.target.value);
                setSelectedGpu(found || null);
              }}
              className="w-full p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl text-white text-sm focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
            >
              {hardwareData["ekran-karti"].map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-400 tracking-wider">HEDEF ÇÖZÜNÜRLÜK</label>
            <div className="grid grid-cols-3 gap-2">
              {["1080p", "1440p", "4K"].map((res) => (
                <button
                  key={res}
                  onClick={() => setResolution(res)}
                  className={`py-3 rounded-2xl border text-xs font-bold transition-all ${
                    resolution === res
                      ? "bg-cyan-500/10 border-cyan-500 text-cyan-400"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  {res}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCalculate}
            className="w-full py-4 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-zinc-950 font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm tracking-wide mt-2"
          >
            <Sparkles size={16} /> FPS Değerlerini Hesapla
          </button>
        </div>

        {/* Sağ Panel: Oyun FPS Listesi */}
        <div className="lg:col-span-7 p-6 bg-zinc-900/60 border border-zinc-800/80 rounded-3xl min-h-[500px] flex flex-col">
          {!hasCalculated ? (
            <div className="flex flex-col items-center justify-center text-center gap-3 my-auto py-24">
              <div className="w-14 h-14 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center text-cyan-400 shadow-inner">
                <Gamepad2 size={24} />
              </div>
              <h3 className="text-white font-bold text-lg">Donanımınızı seçin</h3>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-xs">
                İşlemci ve ekran kartı seçimi yaparak güncel 15 oyundaki performans test sonuçlarını listeleyin.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Gamepad2 size={18} className="text-cyan-400" /> Oyun Performans Sonuçları ({resolution})
                </h3>
                <span className="text-xs text-zinc-400">15 Popüler Oyun</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                <div className="grid grid-cols-12 text-[11px] font-bold text-zinc-500 px-4 py-1 uppercase tracking-wider">
                  <span className="col-span-6">Oyun Adı</span>
                  <span className="col-span-3 text-center">Orta (Medium)</span>
                  <span className="col-span-3 text-center">Ultra</span>
                </div>

                {gameResults.map((game, index) => (
                  <div key={index} className="grid grid-cols-12 items-center p-4 bg-zinc-950 border border-zinc-800/80 rounded-2xl hover:border-cyan-500/40 transition-all">
                    <span className="col-span-6 text-sm font-bold text-white">{game.name}</span>
                    <div className="col-span-3 text-center">
                      <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-extrabold rounded-xl">
                        {game.mediumFps} FPS
                      </span>
                    </div>
                    <div className="col-span-3 text-center">
                      <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-extrabold rounded-xl">
                        {game.ultraFps} FPS
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}