"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Sparkles, Gauge } from "lucide-react";

export default function SteamDownloadPage() {
  const [fileSize, setFileSize] = useState<number>(50); // GB
  const [speed, setSpeed] = useState<number>(50); // Mbps
  const [result, setResult] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

  const calculateTime = () => {
    if (!fileSize || !speed || speed <= 0) return;

    // Boyut GB -> Megabit (GB * 1024 * 8)
    const totalMegabits = fileSize * 1024 * 8;
    // Toplam süre saniye cinsinden (Megabit / Mbps)
    const totalSeconds = totalMegabits / speed;

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    setResult({ hours, minutes, seconds });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link href="/araclar" className="text-xs text-zinc-400 hover:text-cyan-400 transition-colors flex items-center gap-1 w-fit mb-2">
          <ArrowLeft size={14} /> Araçlara dön
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <span className="text-cyan-400">📥</span> Steam İndirme Süresi Hesaplayıcı
        </h1>
        <p className="text-zinc-400 text-sm">Oyun boyutuna ve internet hızınıza göre indirme süresini anında hesaplayın.</p>
      </div>

      <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col gap-6 shadow-sm">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
              <Download size={14} className="text-cyan-400" /> Oyun Boyutu (GB)
            </label>
            <input
              type="number"
              value={fileSize}
              onChange={(e) => setFileSize(Number(e.target.value))}
              className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-white text-sm focus:outline-none focus:border-cyan-500 font-mono"
              placeholder="Örn: 50"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
              <Gauge size={14} className="text-cyan-400" /> İnternet Hızı (Mbps)
            </label>
            <input
              type="number"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-white text-sm focus:outline-none focus:border-cyan-500 font-mono"
              placeholder="Örn: 100"
            />
          </div>
        </div>

        <button
          onClick={calculateTime}
          className="w-full py-4 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-zinc-950 font-bold rounded-2xl transition-all shadow-lg text-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles size={16} /> Süreyi Hesapla
        </button>

        {result && (
          <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-3 text-center mt-2">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Tahmini İndirme Süresi</span>
            <div className="text-2xl md:text-3xl font-extrabold text-cyan-400 font-mono">
              {result.hours > 0 && `${result.hours} saat `}
              {result.minutes > 0 && `${result.minutes} dakika `}
              {result.seconds} saniye
            </div>
            <span className="text-[11px] text-zinc-500">
              (Yaklaşık {(speed / 8).toFixed(1)} MB/s indirme hızı ile)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}