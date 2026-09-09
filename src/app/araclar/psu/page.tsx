"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Cpu, Monitor, Zap, ShieldCheck, Sparkles, HardDrive } from "lucide-react";
import { hardwareData, HardwareItem as BaseHardwareItem } from "@/data/hardwareData";

type HardwareItem = BaseHardwareItem & {
  description?: string | null;
  brand?: string | null;
};

export default function PsuHesaplayiciPage() {
  const [selectedCpu, setSelectedCpu] = useState<HardwareItem | null>(hardwareData.islemci[3] || null);
  const [selectedGpu, setSelectedGpu] = useState<HardwareItem | null>(hardwareData["ekran-karti"][3] || null);
  const [ramCount, setRamCount] = useState<number>(2);
  const [storageCount, setStorageCount] = useState<number>(2);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);

  const [psuResult, setPsuResult] = useState<{
    totalWatt: number;
    recommendedWatt: number;
    matchingPsus: HardwareItem[];
  }>({ totalWatt: 0, recommendedWatt: 0, matchingPsus: [] });

  const handleCalculate = () => {
    if (!selectedCpu || !selectedGpu) return;

    // TDP ve Güç Tüketimi değerlerini metinden sayıya dönüştür
    const cpuTdpStr = selectedCpu.specs["TDP"] || "65W";
    const cpuWatt = parseInt(cpuTdpStr) || 65;

    const gpuPowerStr = selectedGpu.specs["Güç Tüketimi"] || "200W";
    const gpuWatt = parseInt(gpuPowerStr) || 200;

    // Diğer bileşenlerin ortalama güç tüketimi (Anakart, RAM, SSD, Fanlar)
    const otherWatt = 50 + (ramCount * 5) + (storageCount * 8);

    const totalWatt = cpuWatt + gpuWatt + otherWatt;
    
    // Güvenlik payı (%30 headroom) ekleyerek standart PSU kademesine yuvarla
    const rawRecommended = totalWatt * 1.3;
    let recommendedWatt = 500;
    if (rawRecommended > 500) recommendedWatt = 600;
    if (rawRecommended > 600) recommendedWatt = 650;
    if (rawRecommended > 650) recommendedWatt = 750;
    if (rawRecommended > 750) recommendedWatt = 850;
    if (rawRecommended > 850) recommendedWatt = 1000;

    // Veritabanından uygun güç kaynaklarını filtrele
    const matchingPsus = (hardwareData.psu || []).filter((p) => {
      const psuWattStr = p.specs["Güç"] || "650W";
      const psuWatt = parseInt(psuWattStr) || 650;
      return psuWatt >= recommendedWatt;
    }).slice(0, 3);

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
        <Link href="/araclar" className="text-xs text-zinc-400 hover:text-cyan-400 transition-colors flex items-center gap-1 w-fit mb-2">
          <ArrowLeft size={14} /> Araçlara dön
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <span className="text-cyan-400">🔌</span> PSU Watt Hesaplayıcı
        </h1>
        <p className="text-zinc-400 text-sm">Sisteminize ait bileşenleri seçerek gereken minimum güç kaynağı (Watt) değerini hesaplayın.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sol Panel: Bileşen Seçimleri */}
        <div className="lg:col-span-6 p-6 bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col gap-6 shadow-sm">
          <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold tracking-wider">
            <Zap size={18} /> SİSTEM YAPILANDIRMASI
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
                  {item.name} ({item.specs["TDP"] || "65W"})
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
                  {item.name} ({item.specs["Güç Tüketimi"] || "200W"})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-400 tracking-wider">RAM Modül Sayısı</label>
              <select
                value={ramCount}
                onChange={(e) => setRamCount(Number(e.target.value))}
                className="w-full p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl text-white text-sm focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
              >
                <option value={2}>2 Adet (Kit)</option>
                <option value={4}>4 Adet</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-400 tracking-wider flex items-center gap-1">
                <HardDrive size={13} /> Depolama / SSD
              </label>
              <select
                value={storageCount}
                onChange={(e) => setStorageCount(Number(e.target.value))}
                className="w-full p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl text-white text-sm focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
              >
                <option value={1}>1 Adet</option>
                <option value={2}>2 Adet</option>
                <option value={3}>3+ Adet</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleCalculate}
            className="w-full py-4 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-zinc-950 font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm tracking-wide mt-2"
          >
            <Sparkles size={16} /> Güç İhtiyacını Hesapla
          </button>
        </div>

        {/* Sağ Panel: Sonuçlar */}
        <div className="lg:col-span-6 p-8 bg-zinc-900/60 border border-zinc-800/80 rounded-3xl min-h-[460px] flex items-center justify-center">
          {!hasCalculated ? (
            <div className="flex flex-col items-center text-center gap-3 max-w-sm">
              <div className="w-14 h-14 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center text-cyan-400 shadow-inner">
                <Zap size={24} />
              </div>
              <h3 className="text-white font-bold text-lg">Sisteminizi yapılandırın</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                İşlemci ve ekran kartı seçimi yaparak sistemin çektiği toplam Watt değerini ve önerilen PSU kapasitesini hesaplayın.
              </p>
            </div>
          ) : (
            <div className="w-full flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                <h3 className="text-base font-bold text-white">Güç Raporu</h3>
                <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold rounded-xl flex items-center gap-1">
                  <ShieldCheck size={14} /> Güvenli Baş Yükü (%30 Pay)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col gap-1">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Tahmini Anlık Tüketim</span>
                  <span className="text-3xl font-extrabold text-white">{psuResult.totalWatt} W</span>
                </div>
                <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col gap-1">
                  <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">Önerilen Minimum PSU</span>
                  <span className="text-3xl font-extrabold text-cyan-400">{psuResult.recommendedWatt} W</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold text-zinc-300">Portaldan Uygun Güç Kaynağı Önerileri:</span>
                <div className="flex flex-col gap-2">
                  {psuResult.matchingPsus.length === 0 ? (
                    <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-400">
                      Bu güç ihtiyacını karşılayan uygun model bulunamadı.
                    </div>
                  ) : (
                    psuResult.matchingPsus.map((psu) => (
                      <div key={psu.id} className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl flex justify-between items-center">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-white">{psu.name}</span>
                          <span className="text-[11px] text-zinc-400">{psu.description}</span>
                        </div>
                        <span className="text-sm font-extrabold text-cyan-400 whitespace-nowrap ml-4">
                          {psu.price.toLocaleString("tr-TR")} ₺
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}