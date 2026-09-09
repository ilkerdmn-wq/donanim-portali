import React, { useState, useEffect } from "react";
import { Layers, Cpu, Gpu, HardDrive, CpuIcon, Wrench, Newspaper, Home, Shield, Compass } from "lucide-react";

type HardwareKey = 'cpu' | 'gpu' | 'mobo' | 'ram' | 'psu' | 'ssd';

const hardwareLabels: Record<HardwareKey, string> = {
  cpu: "İşlemciler",
  gpu: "Ekran Kartları",
  mobo: "Anakartlar",
  ram: "Bellekler",
  psu: "Güç Kaynakları",
  ssd: "Depolama"
};

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("home");

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="w-full bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer">
          <span className="p-2 bg-cyan-500 text-zinc-950 font-bold rounded-xl text-lg">⚡</span>
          <div className="flex flex-col">
            <span className="text-white font-bold tracking-wider text-sm">DONANIM PORTALI</span>
            <span className="text-[10px] text-zinc-400 tracking-widest">HABER • ARAÇ • KEŞİF</span>
          </div>
        </div>
        <nav className="flex items-center gap-2 text-sm text-zinc-300">
          <a href="/" className="px-3.5 py-2 rounded-xl hover:text-white hover:bg-zinc-800/60 transition-all">Ana Sayfa</a>
          <a href="/news" className="px-3.5 py-2 rounded-xl hover:text-white hover:bg-zinc-800/60 transition-all">Haberler</a>
          <a href="/sistem-onerisi" className="px-3.5 py-2 rounded-xl hover:text-white hover:bg-zinc-800/60 transition-all">Sistem Önerisi</a>
          <a href="/araclar" className="px-3.5 py-2 rounded-xl hover:text-white hover:bg-zinc-800/60 transition-all">Araçlar</a>
          <a href="/donanim" className="px-3.5 py-2 rounded-xl text-cyan-400 font-semibold bg-zinc-800/80 transition-all flex items-center gap-1.5">
            <Layers size={14} /> Donanım
          </a>
          <a href="/yonetim" className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-all font-medium ml-2">Yönetim</a>
        </nav>
      </header>
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-8">
        <section className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <span className="text-cyan-400">⚡</span> Donanım Kategorileri ve Rehberler
          </h1>
          <p className="text-zinc-400 text-sm">Güncel donanım bileşenleri, mimari karşılaştırmaları ve detaylı teknik özellikler.</p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Object.keys(hardwareLabels) as HardwareKey[]).map((key) => (
            <a 
              key={key} 
              href={`/donanim/${key}`}
              className="group p-6 bg-zinc-900/80 border border-zinc-800/80 rounded-2xl hover:border-cyan-500/50 hover:bg-zinc-900 transition-all flex flex-col gap-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl p-3 bg-zinc-950 border border-zinc-800 rounded-xl group-hover:scale-105 transition-transform">
                  {key === 'cpu' ? '💻' : key === 'gpu' ? '🎮' : key === 'mobo' ? '🔌' : key === 'ram' ? '⚡' : key === 'psu' ? '🔋' : '💾'}
                </span>
                <span className="text-zinc-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all text-lg font-bold">&rarr;</span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">{hardwareLabels[key]}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">En güncel {hardwareLabels[key].toLowerCase()} modelleri ve detaylı teknik incelemeleri.</p>
              </div>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}