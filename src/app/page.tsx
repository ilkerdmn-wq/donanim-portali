import Link from "next/link";
import {
  Sparkles,
  Shuffle,
  Zap,
  Gamepad2,
  Download,
  RefreshCw,
  Image as ImageIcon,
  FileText,
  Settings,
  Monitor,
  Layout,
  Database,
  HardDrive,
} from "lucide-react";

import HomeNews from "./components/HomeNews";

const quickTools = [
  {
    title: "Otomatik PC önerisi",
    href: "/araclar/pc-oneri",
    icon: Sparkles,
    isSpecial: true,
  },
  {
    title: "PC toplama ve karşılaştırma",
    href: "/araclar/toplama",
    icon: Shuffle,
  },
  {
    title: "Darboğaz hesaplayıcı",
    href: "/araclar/darbogaz",
    icon: Zap,
  },
  {
    title: "Oyun FPS hesaplayıcı",
    href: "/araclar/fps",
    icon: Gamepad2,
  },
  {
    title: "PSU watt hesaplayıcı",
    href: "/araclar/psu",
    icon: Zap,
  },
  {
    title: "Steam indirme süresi",
    href: "/araclar/steam",
    icon: Download,
  },
  {
    title: "Birim dönüştürücü",
    href: "/araclar/birim",
    icon: RefreshCw,
  },
  {
    title: "Online Resim Dönüştürücü",
    href: "/araclar/resim",
    icon: ImageIcon,
  },
  {
    title: "Online Belge Dönüştürücü",
    href: "/araclar/belge",
    icon: FileText,
  },
];

const hardwareLists = [
  {
    title: "İşlemciler",
    count: 0,
    icon: Settings,
    href: "/donanim/islemciler",
  },
  {
    title: "Ekran Kartları",
    count: 0,
    icon: Monitor,
    href: "/donanim/ekran-kartlari",
  },
  {
    title: "Anakartlar",
    count: 0,
    icon: Layout,
    href: "/donanim/anakartlar",
  },
  {
    title: "Bellekler",
    count: 0,
    icon: Database,
    href: "/donanim/bellekler",
  },
  {
    title: "Güç Kaynakları",
    count: 0,
    icon: Zap,
    href: "/donanim/guc-kaynaklari",
  },
  {
    title: "Depolama",
    count: 0,
    icon: HardDrive,
    href: "/donanim/depolama",
  },
];

export default function HomePage() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* SOL SÜTUN */}
        <div className="lg:col-span-8 flex flex-col gap-8">

          {/* ANA BANNER */}
          <div className="p-10 border border-zinc-800/80 rounded-3xl bg-zinc-900/40 flex flex-col items-start gap-4 shadow-sm">

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/50 border border-cyan-900/50 text-cyan-400 text-[10px] font-extrabold uppercase tracking-widest">

              <Sparkles size={12} />

              YENİ NESİL TEKNOLOJİ ÜSSÜ

            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Bugünün sistemini daha bilinçli kur.
            </h1>

            <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl">
              Güncel donanım haberleri, nokta atışı test notları ve karar
              vermeyi hızlandıran gelişmiş hesap makineleri ile gürültüden
              arındırılmış teknoloji rehberi.
            </p>

          </div>

          {/* SUPABASE HABERLER */}
          <HomeNews />

        </div>

        {/* SAĞ SÜTUN */}
        <div className="lg:col-span-4 flex flex-col gap-6">

          {/* HIZLI ARAÇLAR */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-5 flex flex-col gap-3 shadow-sm">

            <h2 className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase px-2 mb-1">
              HIZLI ARAÇLAR
            </h2>

            <div className="flex flex-col gap-1">

              {quickTools.map((tool) => {

                const Icon = tool.icon;

                return (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all text-[13px] font-semibold ${
                      tool.isSpecial
                        ? "bg-cyan-950/30 border border-cyan-900/50 text-cyan-400 shadow-sm"
                        : "text-zinc-300 hover:text-white hover:bg-zinc-800/40 border border-transparent"
                    }`}
                  >

                    <span>
                      {tool.title}
                    </span>

                    <Icon
                      size={16}
                      className={
                        tool.isSpecial
                          ? "text-cyan-400"
                          : "text-zinc-500"
                      }
                    />

                  </Link>
                );

              })}

            </div>

          </div>

          {/* DONANIM LİSTELERİ */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-5 flex flex-col gap-3 shadow-sm">

            <h2 className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase px-2 mb-1">
              DONANIM LİSTELERİ
            </h2>

            <div className="flex flex-col gap-1">

              {hardwareLists.map((hw, idx) => {

                const Icon = hw.icon;

                return (
                  <Link
                    key={idx}
                    href={hw.href}
                    className="flex items-center justify-between px-4 py-3.5 rounded-2xl hover:bg-zinc-800/40 transition-all group border border-transparent"
                  >

                    <div className="flex items-center gap-3.5">

                      <Icon
                        size={16}
                        className="text-zinc-500 group-hover:text-zinc-300 transition-colors"
                      />

                      <span className="text-[13px] font-semibold text-zinc-300 group-hover:text-white transition-colors">
                        {hw.title}
                      </span>

                    </div>

                    <span className="px-2 py-0.5 rounded-md bg-zinc-800/80 text-[10px] text-zinc-400 font-bold">
                      {hw.count}
                    </span>

                  </Link>
                );

              })}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}