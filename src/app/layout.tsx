import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Zap, Home, Newspaper, Sparkles, Wrench, Layers, ShieldCheck } from "lucide-react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Donanım Portalı",
  description: "Yeni nesil teknoloji üssü ve donanım rehberi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-zinc-100 min-h-screen flex flex-col selection:bg-cyan-500 selection:text-zinc-950`}>
        
        {/* ÜST MENÜ / NAVBAR */}
        <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 to-cyan-400 flex items-center justify-center text-zinc-950 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <Zap size={20} className="fill-zinc-950" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-extrabold tracking-wider text-white">DONANIM PORTALI</span>
                <span className="text-[9px] text-zinc-400 font-semibold tracking-widest uppercase">HABER • ARAÇ • KEŞİF</span>
              </div>
            </Link>

            {/* Navigasyon Linkleri */}
            <nav className="hidden md:flex items-center gap-1 bg-zinc-900/50 border border-zinc-800/80 px-3 py-1.5 rounded-2xl">
              <Link href="/" className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-all flex items-center gap-1.5">
                <Home size={14} /> Ana Sayfa
              </Link>
              <Link href="/news" className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-all flex items-center gap-1.5">
                <Newspaper size={14} /> Haberler
              </Link>
              <Link href="/araclar/pc-oneri" className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-all flex items-center gap-1.5">
                <Sparkles size={14} /> Sistem Önerisi
              </Link>
              <Link href="/araclar" className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-all flex items-center gap-1.5">
                <Wrench size={14} /> Araçlar
              </Link>
              <Link href="/donanim" className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-900/50 transition-all flex items-center gap-1.5 shadow-sm">
                <Layers size={14} /> Donanım
              </Link>
            </nav>

            {/* Sağ Yönetim Butonu */}
            <div className="flex items-center gap-3">
              <Link href="/yonetim" className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 shadow-sm">
                <ShieldCheck size={14} className="text-cyan-400" /> Yönetim
              </Link>
            </div>

          </div>
        </header>

        {/* Ana İçerik */}
        <main className="flex-1">
          {children}
        </main>

      </body>
    </html>
  );
}