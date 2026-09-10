"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Zap,
  Home,
  Newspaper,
  Sparkles,
  Wrench,
  Layers,
  ShieldCheck,
  Construction,
  X,
} from "lucide-react";

import {
  SiteSettingsProvider,
  useSiteSettings,
} from "./SiteSettingsProvider";

function PortalShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname =
    usePathname();

  const {
    settings,
    hydrated,
  } = useSiteSettings();

  const isManagement =
    pathname.startsWith(
      "/yonetim"
    );

  if (
    hydrated &&
    settings.maintenanceMode &&
    !isManagement
  ) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center px-6">
        <div className="max-w-xl w-full rounded-3xl border border-amber-500/20 bg-zinc-900/70 p-8 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Construction
              size={26}
              className="text-amber-400"
            />
          </div>

          <h1 className="text-3xl font-black mt-5">
            Bakım Modu
          </h1>

          <p className="text-sm text-zinc-400 mt-3 leading-6">
            {settings.siteName} şu anda kısa süreli bakımda.
            Lütfen daha sonra tekrar kontrol edin.
          </p>

          <Link
            href="/yonetim"
            className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-xl border border-zinc-700 bg-zinc-950 text-xs font-bold text-zinc-300 hover:text-white"
          >
            <ShieldCheck
              size={14}
              className="text-cyan-400"
            />
            Yönetim Paneli
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 to-cyan-400 flex items-center justify-center text-zinc-950 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Zap
                size={20}
                className="fill-zinc-950"
              />
            </div>

            <div className="flex flex-col">
              <span className="text-sm font-extrabold tracking-wider text-white">
                {settings.siteName.toLocaleUpperCase("tr-TR")}
              </span>

              <span className="text-[9px] text-zinc-400 font-semibold tracking-widest uppercase">
                {settings.siteSlogan}
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 bg-zinc-900/50 border border-zinc-800/80 px-3 py-1.5 rounded-2xl">
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-all flex items-center gap-1.5"
            >
              <Home size={14} />
              Ana Sayfa
            </Link>

            <Link
              href="/news"
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-all flex items-center gap-1.5"
            >
              <Newspaper size={14} />
              Haberler
            </Link>

            <Link
              href="/araclar/pc-oneri"
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-all flex items-center gap-1.5"
            >
              <Sparkles size={14} />
              Sistem Önerisi
            </Link>

            <Link
              href="/araclar"
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-all flex items-center gap-1.5"
            >
              <Wrench size={14} />
              Araçlar
            </Link>

            <Link
              href="/donanim"
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-900/50 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Layers size={14} />
              Donanım
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/yonetim"
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 shadow-sm"
            >
              <ShieldCheck
                size={14}
                className="text-cyan-400"
              />
              Yönetim
            </Link>
          </div>
        </div>
      </header>

      {hydrated &&
        settings.showAnnouncement &&
        settings.announcement.trim() && (
          <div className="border-b border-cyan-500/20 bg-cyan-500/10">
            <div className="max-w-[1400px] mx-auto px-6 py-2.5">
              <p className="text-xs text-cyan-100 text-center font-semibold">
                {settings.announcement}
              </p>
            </div>
          </div>
        )}

      <main className="flex-1">
        {children}
      </main>
    </>
  );
}

export default function SiteShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteSettingsProvider>
      <PortalShell>
        {children}
      </PortalShell>
    </SiteSettingsProvider>
  );
}
