"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Layers } from "lucide-react";

export default function BirimDonusturucuPage() {
  const [category, setCategory] = useState<"storage" | "freq">("storage");
  const [inputValue, setInputValue] = useState<number>(1);
  const [fromUnit, setFromUnit] = useState<string>("GB");
  const [toUnit, setToUnit] = useState<string>("MB");

  // Dönüşüm mantığı
  const convertStorage = (val: number, from: string, to: string) => {
    // Tüm birimleri MB cinsine çevir
    let inMb = val;
    if (from === "GB") inMb = val * 1024;
    if (from === "TB") inMb = val * 1024 * 1024;
    if (from === "KB") inMb = val / 1024;

    // MB cinsinden hedef birime çevir
    if (to === "MB") return inMb;
    if (to === "GB") return inMb / 1024;
    if (to === "TB") return inMb / (1024 * 1024);
    if (to === "KB") return inMb * 1024;
    return inMb;
  };

  const convertFreq = (val: number, from: string, to: string) => {
    let inMhz = val;
    if (from === "GHz") inMhz = val * 1000;

    if (to === "MHz") return inMhz;
    if (to === "GHz") return inMhz / 1000;
    return inMhz;
  };

  const result = category === "storage" 
    ? convertStorage(inputValue, fromUnit, toUnit)
    : convertFreq(inputValue, fromUnit, toUnit);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link href="/araclar" className="text-xs text-zinc-400 hover:text-cyan-400 transition-colors flex items-center gap-1 w-fit mb-2">
          <ArrowLeft size={14} /> Araçlara dön
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <span className="text-cyan-400">🔄</span> Donanım Birim Dönüştürücü
        </h1>
        <p className="text-zinc-400 text-sm">Dijital depolama ve saat hızı (Frekans) birimlerini anında dönüştürün.</p>
      </div>

      <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col gap-6 shadow-sm">
        <div className="flex gap-2 border-b border-zinc-800 pb-4">
          <button
            onClick={() => { setCategory("storage"); setFromUnit("GB"); setToUnit("MB"); }}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              category === "storage" ? "bg-cyan-500 text-zinc-950 shadow-lg" : "bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-white"
            }`}
          >
            Depolama (GB / MB / TB)
          </button>
          <button
            onClick={() => { setCategory("freq"); setFromUnit("GHz"); setToUnit("MHz"); }}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              category === "freq" ? "bg-cyan-500 text-zinc-950 shadow-lg" : "bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-white"
            }`}
          >
            Frekans (GHz / MHz)
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-5 flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-400">Değer</label>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(Number(e.target.value))}
              className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-white font-bold text-lg focus:outline-none focus:border-cyan-500"
            />
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-zinc-300 text-xs focus:outline-none"
            >
              {category === "storage" ? (
                <>
                  <option value="TB">Terabayt (TB)</option>
                  <option value="GB">Gigabayt (GB)</option>
                  <option value="MB">Megabayt (MB)</option>
                  <option value="KB">Kilobayt (KB)</option>
                </>
              ) : (
                <>
                  <option value="GHz">Gigahertz (GHz)</option>
                  <option value="MHz">Megahertz (MHz)</option>
                </>
              )}
            </select>
          </div>

          <div className="md:col-span-2 flex justify-center text-cyan-400 py-2">
            <RefreshCw size={24} className="animate-spin-slow" />
          </div>

          <div className="md:col-span-5 flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-400">Sonuç</label>
            <div className="w-full p-4 bg-zinc-950 border border-cyan-500/40 rounded-2xl text-cyan-400 font-extrabold text-lg flex items-center min-h-[58px]">
              {result.toLocaleString("tr-TR", { maximumFractionDigits: 4 })}
            </div>
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-zinc-300 text-xs focus:outline-none"
            >
              {category === "storage" ? (
                <>
                  <option value="TB">Terabayt (TB)</option>
                  <option value="GB">Gigabayt (GB)</option>
                  <option value="MB">Megabayt (MB)</option>
                  <option value="KB">Kilobayt (KB)</option>
                </>
              ) : (
                <>
                  <option value="GHz">Gigahertz (GHz)</option>
                  <option value="MHz">Megahertz (MHz)</option>
                </>
              )}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}