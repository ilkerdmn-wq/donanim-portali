import type { Metadata } from "next";
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
import SidebarGuides from "./components/SidebarGuides";

const SITE_URL =
  "https://donanimportali.com";

export const metadata: Metadata = {
  title: "Donanım Portalı",
  description:
    "Güncel donanım haberleri, PC toplama araçları, FPS ve darboğaz hesaplayıcıları, PSU hesaplama ve bilgisayar donanımı rehberleri.",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: SITE_URL,
    siteName: "Donanım Portalı",
    title: "Donanım Portalı",
    description:
      "Güncel donanım haberleri, PC toplama araçları ve sistem analiz rehberleri.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Donanım Portalı",
    description:
      "Güncel donanım haberleri, PC toplama araçları ve sistem analiz rehberleri.",
  },
};

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
    icon: Settings,
    href: "/donanim/islemciler",
  },
  {
    title: "Ekran Kartları",
    icon: Monitor,
    href: "/donanim/ekran-kartlari",
  },
  {
    title: "Anakartlar",
    icon: Layout,
    href: "/donanim/anakartlar",
  },
  {
    title: "Bellekler",
    icon: Database,
    href: "/donanim/bellekler",
  },
  {
    title: "Güç Kaynakları",
    icon: Zap,
    href: "/donanim/guc-kaynaklari",
  },
  {
    title: "Depolama",
    icon: HardDrive,
    href: "/donanim/depolama",
  },
];

export default function HomePage() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 flex flex-col gap-8">
          <section className="relative overflow-hidden p-6 sm:p-7 border border-zinc-800/80 rounded-3xl bg-zinc-900/50 flex flex-col items-start gap-3 shadow-[0_0_40px_rgba(8,145,178,0.07)]">
            <div
              aria-hidden="true"
              className="absolute -right-20 -top-24 h-56 w-56 rounded-full bg-cyan-500/15 blur-3xl motion-safe:animate-pulse"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-28 left-1/3 h-48 w-48 rounded-full bg-blue-600/10 blur-3xl motion-safe:animate-pulse"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(34,211,238,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.07)_1px,transparent_1px)] [background-size:28px_28px]"
            />

            <div className="relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/70 text-cyan-300 text-[10px] font-extrabold uppercase tracking-widest">
              <Sparkles size={12} />
              YENİ NESİL TEKNOLOJİ ÜSSÜ
            </div>

            <h1 className="relative max-w-3xl text-2xl md:text-3xl font-extrabold leading-[1.15] tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-400">
              Donanım Haberleri, PC Toplama ve Hesaplama Araçları
            </h1>

            <p className="relative text-zinc-300 text-sm leading-relaxed max-w-2xl">
              Güncel donanım gelişmelerini takip et; işlemci, ekran kartı ve
              sistem bileşenlerini karşılaştır. PC toplama, FPS, darboğaz ve
              PSU hesaplama araçlarıyla ihtiyaçlarına uygun sistemi daha
              bilinçli seç.
            </p>

            <div className="relative flex flex-wrap gap-3 pt-1">
              <Link
                href="/araclar/pc-oneri"
                className="rounded-xl bg-cyan-400 px-4 py-2 text-xs font-extrabold text-zinc-950 transition-colors hover:bg-cyan-300"
              >
                Sistemini Oluştur
              </Link>
              <Link
                href="/news"
                className="rounded-xl border border-zinc-700 bg-zinc-950/40 px-4 py-2 text-xs font-extrabold text-zinc-200 transition-colors hover:border-zinc-500 hover:text-white"
              >
                Haberleri İncele
              </Link>
            </div>
          </section>

          <HomeNews />
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
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
                    <span>{tool.title}</span>

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

          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-5 flex flex-col gap-3 shadow-sm">
            <h2 className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase px-2 mb-1">
              DONANIM LİSTELERİ
            </h2>

            <div className="flex flex-col gap-1">
              {hardwareLists.map((hw) => {
                const Icon = hw.icon;

                return (
                  <Link
                    key={hw.href}
                    href={hw.href}
                    className="flex items-center px-4 py-3.5 rounded-2xl hover:bg-zinc-800/40 transition-all group border border-transparent"
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
                  </Link>
                );
              })}
            </div>
          </div>

          <SidebarGuides />
        </div>
      </div>
    </div>
  );
}
