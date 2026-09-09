"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Cpu, Monitor, Gauge, AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";
import { hardwareData, HardwareItem } from "@/data/hardwareData";

export default function DarbogazPage() {
  const [selectedCpu, setSelectedCpu] = useState<HardwareItem | null>(hardwareData.islemci[3] || null);
  const [selectedGpu, setSelectedGpu] = useState<HardwareItem | null>(hardwareData["ekran-karti"][3] || null);
  const [resolution, setResolution] = useState<string>("1440p");
  const [analyzed, setAnalyzed] = useState<boolean>(false);

  const [bottleneckResult, setBottleneckResult] = useState<{
    percentage: number;
    status: string;
    description: string;
    color: string;
  }>({ percentage: 0, status: "", description: "", color: "" });

  const handleCalculate = () => {
    if (!selectedCpu || !selectedGpu) return;

    // Basit ama gerçekçi bir darboğaz simülasyon mantığı (Fiyat ve güç oranlarına göre)
    const cpuScore = selectedCpu.price;
    const gpuScore = selectedGpu.price / 2.2; // GPU fiyat ölçeğini dengele

    let ratio = 0;
    if (resolution === "1080p") {
      // 1080p'de işlemci gücü çok önemlidir
      if (gpuScore > cpuScore * 1.3) {
        ratio = Math.min(32, Math.round(((gpuScore - cpuScore) / cpuScore) * 18));
      } else {
        ratio = Math.floor(Math.random() * 4) + 1; // %1 - %4 İdeal
      }
    } else if (resolution === "1440p") {
      if (gpuScore > cpuScore * 1.6) {
        ratio = Math.min(22, Math.round(((gpuScore - cpuScore) / cpuScore) * 12));
      } else {
        ratio = Math.floor(Math.random() * 3); // %0 - %2 İdeal
      }
    } else { // 4K
      // 4K'da yük tamamen ekran kartındadır
      if (gpuScore > cpuScore * 2.2) {
        ratio = Math.min(10, Math.round(((gpuScore - cpuScore) / cpuScore) * 5));
      } else {
        ratio = 0; // Kusursuz
      }
    }

    const finalPercentage = Math.max(0, ratio);

    let status = "";
    let description = "";
    let color = "";

    if (finalPercentage <= 5) {
      status = "İdeal Denge (Darboğaz Yok)";
      description = "Seçtiğiniz işlemci ve ekran kartı birbirini tam anlamıyla besliyor. Bileşenlerden tam performans alabilirsiniz.";
      color = "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    } else if (finalPercentage <= 15) {
      status = "Hafif Darboğaz";
      description = "Bazı yüksek kare hızına (FPS) odaklı rekabetçi oyunlarda işlemci hafif düzeyde sınırlama yaratabilir, günlük kullanımda sorun yaşatmaz.";
      color = "text-amber-400 bg-amber-500/10 border-amber-500/30";
    } else {
      status = "Belirgin Darboğaz";
      description = "Ekran kartınız işlemcinize kıyasla oldukça güçlü kalıyor. İşlemci yükseltmesi yapmanız veya çözünürlüğü artırmanız önerilir.";
      color = "text-red-400 bg-red-500/10 border-red-500/30";
    }

    setBottleneckResult({
      percentage: finalPercentage,
      status,
      description,
      color,
    });
    setAnalyzed(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link href="/araclar" className="text-xs text-zinc-400 hover:text-cyan-400 transition-colors flex items-center gap-1 w-fit mb-2">
          <ArrowLeft size={14} /> Araçlara dön
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <span className="text-cyan-400">⚡</span> Darboğaz Hesaplayıcı
        </h1>
        <p className="text-zinc-400 text-sm">İşlemci ve ekran kartı bileşenlerini seçerek performans uyumunu ve darboğaz oranını hesaplayın.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sol Panel: Seçimler */}
        <div className="lg:col-span-6 p-6 bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col gap-6 shadow-sm">
          <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold tracking-wider">
            <Gauge size={18} /> BİLEŞEN SEÇİMİ
          </div>

          {/* İşlemci Seçimi */}
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
                  {item.name} ({item.price.toLocaleString("tr-TR")} ₺)
                </option>
              ))}
            </select>
          </div>

          {/* Ekran Kartı Seçimi */}
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
                  {item.name} ({item.price.toLocaleString("tr-TR")} ₺)
                </option>
              ))}
            </select>
          </div>

          {/* Çözünürlük Seçimi */}
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
            <Sparkles size={16} /> Darboğazı Hesapla
          </button>
        </div>

        {/* Sağ Panel: Analiz Sonucu */}
        <div className="lg:col-span-6 p-8 bg-zinc-900/60 border border-zinc-800/80 rounded-3xl min-h-[460px] flex items-center justify-center">
          {!analyzed ? (
            <div className="flex flex-col items-center text-center gap-3 max-w-sm">
              <div className="w-14 h-14 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center text-cyan-400 shadow-inner">
                <Gauge size={24} />
              </div>
              <h3 className="text-white font-bold text-lg">Analiz için bileşen seçin</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                İşlemci ve ekran kartı eşleşmesini test ederek darboğaz oranını ve tavsiyeleri görüntüleyin.
              </p>
            </div>
          ) : (
            <div className="w-full flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                <h3 className="text-base font-bold text-white">Analiz Raporu</h3>
                <span className={`px-3 py-1 border rounded-xl text-xs font-bold flex items-center gap-1.5 ${bottleneckResult.color}`}>
                  {bottleneckResult.percentage <= 5 ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                  {bottleneckResult.status}
                </span>
              </div>

              <div className="flex flex-col items-center justify-center p-6 bg-zinc-950 border border-zinc-800 rounded-2xl gap-3">
                <span className="text-xs font-semibold text-zinc-400 tracking-wider">TAHMİNİ DARBOĞAZ ORANI</span>
                <div className="text-5xl font-extrabold text-cyan-400">
                  %{bottleneckResult.percentage}
                </div>
                <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden mt-2 border border-zinc-800">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      bottleneckResult.percentage <= 5 ? "bg-emerald-400" : bottleneckResult.percentage <= 15 ? "bg-amber-400" : "bg-red-400"
                    }`}
                    style={{ width: `${Math.min(100, bottleneckResult.percentage * 3)}%` }}
                  ></div>
                </div>
              </div>

              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col gap-2">
                <span className="text-xs font-bold text-zinc-300">Uzman Değerlendirmesi ({resolution}):</span>
                <p className="text-xs text-zinc-400 leading-relaxed">{bottleneckResult.description}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}