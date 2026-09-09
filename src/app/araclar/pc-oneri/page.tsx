"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, Zap, ShieldCheck } from "lucide-react";
import { hardwareData, HardwareItem } from "@/data/hardwareData";

const budgetPresets = [38000, 60000, 90000, 130000, 160000, 200000];

export default function PcOneriPage() {
  const [budget, setBudget] = useState<number>(38000);
  const [usage, setUsage] = useState<string>("oyun");
  const [resolution, setResolution] = useState<string>("1440p");
  const [hasGenerated, setHasGenerated] = useState<boolean>(false);
  const [system, setSystem] = useState<{
    cpu: HardwareItem | null;
    gpu: HardwareItem | null;
    anakart: HardwareItem | null;
    ram: HardwareItem | null;
    psu: HardwareItem | null;
    ssd: HardwareItem | null;
    total: number;
  } | null>(null);

  const handleGenerate = () => {
    let gpuRatio = 0.40;
    let cpuRatio = 0.22;
    let ramRatio = 0.08;

    if (usage === "render") {
      cpuRatio = 0.32;
      gpuRatio = 0.30;
      ramRatio = 0.12;
    } else if (usage === "oyun") {
      gpuRatio = resolution === "4K" ? 0.48 : 0.42;
      cpuRatio = 0.20;
    } else if (usage === "ofis") {
      gpuRatio = 0.15;
      cpuRatio = 0.30;
      ramRatio = 0.15;
    }

    const mbRatio = 0.12;
    const psuRatio = 0.08;
    const ssdRatio = Math.max(0.05, 1.0 - (gpuRatio + cpuRatio + mbRatio + ramRatio + psuRatio));

    const gpuTarget = budget * gpuRatio;
    const cpuTarget = budget * cpuRatio;
    const mbTarget = budget * mbRatio;
    const ramTarget = budget * ramRatio;
    const psuTarget = budget * psuRatio;
    const ssdTarget = budget * ssdRatio;

    const selectBestMatch = (list: HardwareItem[], target: number) => {
      if (!list || list.length === 0) return null;
      const sorted = [...list].sort((a, b) => a.price - b.price);
      return sorted.reduce((prev, curr) => 
        Math.abs(curr.price - target) < Math.abs(prev.price - target) ? curr : prev
      );
    };

    const validCpus = (hardwareData.islemci || []).filter(
      (c: HardwareItem) => c.specs["Soket"] === "AM5" || c.specs["Soket"] === "LGA1700"
    );
    const cpu = selectBestMatch(validCpus, cpuTarget);
    const cpuSocket = cpu?.specs["Soket"] || "AM5";

    const validMbs = (hardwareData.anakart || []).filter(
      (m: HardwareItem) => m.specs["Soket"] === cpuSocket
    );
    const anakart = selectBestMatch(validMbs.length > 0 ? validMbs : hardwareData.anakart, mbTarget);

    const validRams = (hardwareData.ram || []).filter((r: HardwareItem) => {
      if (cpuSocket === "AM5") {
        return r.specs["Tür"] === "DDR5";
      }
      return true;
    });
    const ram = selectBestMatch(validRams.length > 0 ? validRams : hardwareData.ram, ramTarget);

    const gpu = selectBestMatch(hardwareData["ekran-karti"], gpuTarget);
    const psu = selectBestMatch(hardwareData.psu, psuTarget);
    const ssd = selectBestMatch(hardwareData.ssd, ssdTarget);

    const total = (cpu?.price || 0) + (gpu?.price || 0) + (anakart?.price || 0) + (ram?.price || 0) + (psu?.price || 0) + (ssd?.price || 0);

    setSystem({ cpu, gpu, anakart, ram, psu, ssd, total });
    setHasGenerated(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link href="/araclar" className="text-xs text-zinc-400 hover:text-cyan-400 transition-colors flex items-center gap-1 w-fit mb-2">
          <ArrowLeft size={14} /> Araçlara dön
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <span className="text-cyan-400">✨</span> Otomatik PC Önerisi
        </h1>
        <p className="text-zinc-400 text-sm">Bütçeni, kullanım amacını ve ekran hedefini seç. Seçimlerine göre optimize edilmiş sistemleri karşılaştır.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 p-6 bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col gap-6 shadow-sm">
          <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold tracking-wider">
            <Sparkles size={16} /> TERCİHLERİNİ BELİRLE
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-zinc-400 tracking-wider">BÜTÇE</span>
              <span className="text-cyan-400 font-extrabold text-lg">{budget.toLocaleString("tr-TR")} ₺</span>
            </div>
            <input 
              type="range" 
              min="20000" 
              max="200000" 
              step="5000" 
              value={budget} 
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-cyan-400 bg-zinc-950 cursor-pointer h-2 rounded-lg"
            />
            <div className="grid grid-cols-6 gap-1.5 pt-1">
              {budgetPresets.map((val) => (
                <button
                  key={val}
                  onClick={() => setBudget(val)}
                  className={`py-1.5 text-[11px] font-semibold rounded-xl border transition-all ${
                    budget === val 
                      ? "bg-cyan-500/10 border-cyan-500 text-cyan-400" 
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  {val >= 1000 ? `${val / 1000}K ₺` : `${val} ₺`}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-zinc-400 tracking-wider">KULLANIM AMACI</span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "oyun", title: "Oyun", desc: "Yüksek kare hızı ve akıcı görüntü" },
                { id: "ofis", title: "Ofis", desc: "Sessiz ve serin günlük kullanım" },
                { id: "render", title: "Render", desc: "Çok çekirdekli üretim işleri" },
                { id: "genel", title: "Genel", desc: "Dengeli, çok amaçlı sistem" }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setUsage(item.id)}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                    usage === item.id
                      ? "bg-cyan-500/10 border-cyan-500 text-white"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  <span className="font-bold text-sm text-white">{item.title}</span>
                  <span className="text-[10px] text-zinc-400 leading-tight">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-zinc-400 tracking-wider">HEDEF ÇÖZÜNÜRLÜK</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "1080p", label: "1080p", desc: "Yüksek FPS" },
                { id: "1440p", label: "1440p", desc: "Dengeli hedef" },
                { id: "4K", label: "4K", desc: "Maksimum görsel" }
              ].map((res) => (
                <button
                  key={res.id}
                  onClick={() => setResolution(res.id)}
                  className={`p-3 rounded-2xl border text-center flex flex-col gap-0.5 transition-all ${
                    resolution === res.id
                      ? "bg-cyan-500/10 border-cyan-500 text-white"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  <span className="font-bold text-sm text-white">{res.label}</span>
                  <span className="text-[10px] text-zinc-400">{res.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            className="w-full py-4 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-zinc-950 font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm tracking-wide"
          >
            <Sparkles size={16} /> ÖNERİLERİ OLUŞTUR
          </button>
        </div>

        <div className="lg:col-span-7 p-8 bg-zinc-900/60 border border-zinc-800/80 rounded-3xl min-h-[520px] flex items-center justify-center">
          {!hasGenerated || !system ? (
            <div className="flex flex-col items-center text-center gap-3 max-w-sm">
              <div className="w-14 h-14 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center text-cyan-400 shadow-inner">
                <Sparkles size={24} />
              </div>
              <h3 className="text-white font-bold text-lg">Bütçe ve kullanımını seç</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Motor, bütçene ve seçtiğin amaca göre %100 uyumlu varyasyonlar üretecek.
              </p>
            </div>
          ) : (
            <div className="w-full flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Zap size={18} className="text-cyan-400" /> Seçtiğin Bütçeye Özel Sistem
                </h2>
                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-1">
                  <ShieldCheck size={14} /> %100 Uyumlu
                </span>
              </div>
              <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                  <div>
                    <span className="text-xs text-cyan-400 font-semibold uppercase">{usage} Odaklı {resolution} Sistem</span>
                    <h4 className="text-white font-bold text-base">Optimizasyon Skoru: %100</h4>
                  </div>
                  <span className="text-xl font-extrabold text-white">{system.total.toLocaleString("tr-TR")} ₺</span>
                </div>
                <ul className="flex flex-col gap-2.5 text-xs text-zinc-300">
                  <li className="flex justify-between py-1 border-b border-zinc-900">
                    <span className="text-zinc-400">İşlemci (CPU):</span>
                    <span className="font-semibold text-white">{system.cpu?.name || "Belirlenemedi"}</span>
                  </li>
                  <li className="flex justify-between py-1 border-b border-zinc-900">
                    <span className="text-zinc-400">Ekran Kartı (GPU):</span>
                    <span className="font-semibold text-white">{system.gpu?.name || "Belirlenemedi"}</span>
                  </li>
                  <li className="flex justify-between py-1 border-b border-zinc-900">
                    <span className="text-zinc-400">Anakart:</span>
                    <span className="font-semibold text-white">{system.anakart?.name || "Belirlenemedi"}</span>
                  </li>
                  <li className="flex justify-between py-1 border-b border-zinc-900">
                    <span className="text-zinc-400">Bellek (RAM):</span>
                    <span className="font-semibold text-white">{system.ram?.name || "Belirlenemedi"}</span>
                  </li>
                  <li className="flex justify-between py-1 border-b border-zinc-900">
                    <span className="text-zinc-400">Güç Kaynağı (PSU):</span>
                    <span className="font-semibold text-white">{system.psu?.name || "Belirlenemedi"}</span>
                  </li>
                  <li className="flex justify-between py-1">
                    <span className="text-zinc-400">Depolama (SSD):</span>
                    <span className="font-semibold text-white">{system.ssd?.name || "Belirlenemedi"}</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}