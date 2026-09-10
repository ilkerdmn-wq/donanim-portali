"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Home,
  Search,
  Wrench,
  Zap,
} from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-[70vh] bg-zinc-950 text-zinc-100 flex items-center">
      <div className="max-w-4xl mx-auto px-5 sm:px-6 py-16 md:py-24 w-full">
        <div className="rounded-[32px] border border-zinc-800 bg-zinc-900/40 overflow-hidden shadow-2xl shadow-black/20">
          <div className="p-7 sm:p-10 md:p-12">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 flex items-center justify-center">
                <Zap
                  size={22}
                  className="text-cyan-400 fill-cyan-400"
                />
              </div>

              <div>
                <p className="text-[10px] font-black tracking-[0.18em] text-cyan-400 uppercase">
                  DONANIM PORTALI
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Aradığınız sayfaya ulaşılamadı
                </p>
              </div>
            </div>

            <div className="mt-10">
              <p className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter text-zinc-800">
                404
              </p>

              <h1 className="mt-2 text-3xl md:text-5xl font-black tracking-tight text-white">
                Bu sayfa sistemde yok.
              </h1>

              <p className="mt-4 max-w-2xl text-sm md:text-base leading-7 text-zinc-400">
                Adres değiştirilmiş, içerik kaldırılmış veya bağlantı hatalı
                olabilir. Arama yapabilir ya da Donanım Portalı&apos;nın ana
                bölümlerinden birine geçebilirsiniz.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-xs font-black text-zinc-950 hover:bg-cyan-300 transition"
              >
                <Home size={15} />
                Ana Sayfaya Dön
              </Link>

              <Link
                href="/arama"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-3 text-xs font-black text-zinc-200 hover:border-cyan-500/30 hover:text-cyan-400 transition"
              >
                <Search size={15} />
                Sitede Ara
              </Link>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 border-t border-zinc-800">
            <Link
              href="/news"
              className="group p-5 sm:p-6 border-b sm:border-b-0 sm:border-r border-zinc-800 hover:bg-zinc-900/70 transition"
            >
              <BookOpen
                size={18}
                className="text-cyan-400"
              />
              <p className="mt-3 text-sm font-black text-white">
                Haberler
              </p>
              <p className="mt-1 text-xs leading-5 text-zinc-600">
                Güncel teknoloji haberlerine göz at.
              </p>
            </Link>

            <Link
              href="/rehber"
              className="group p-5 sm:p-6 border-b sm:border-b-0 sm:border-r border-zinc-800 hover:bg-zinc-900/70 transition"
            >
              <BookOpen
                size={18}
                className="text-cyan-400"
              />
              <p className="mt-3 text-sm font-black text-white">
                Rehberler
              </p>
              <p className="mt-1 text-xs leading-5 text-zinc-600">
                Donanım seçim rehberlerini incele.
              </p>
            </Link>

            <Link
              href="/araclar"
              className="group p-5 sm:p-6 hover:bg-zinc-900/70 transition"
            >
              <Wrench
                size={18}
                className="text-cyan-400"
              />
              <p className="mt-3 text-sm font-black text-white">
                Araçlar
              </p>
              <p className="mt-1 text-xs leading-5 text-zinc-600">
                Hesaplayıcı ve sistem araçlarını kullan.
              </p>
            </Link>
          </div>
        </div>

        <button
          type="button"
          onClick={() => history.back()}
          className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-zinc-300 transition"
        >
          <ArrowLeft size={14} />
          Önceki sayfaya dön
        </button>
      </div>
    </main>
  );
}
