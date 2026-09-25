import type { Metadata } from "next";

import Link from "next/link";

import {
  ArrowRight,
  Laptop,
  Scale,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Donanım Karşılaştırmaları",
  description:
    "Laptop ve diğer donanım kategorilerindeki ürünleri teknik özelliklerine göre karşılaştırın.",
  alternates: {
    canonical:
      "https://donanimportali.com/karsilastirma",
  },
};

export default function ComparisonHubPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 sm:py-14">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-cyan-400 sm:text-sm">
            <Scale size={16} />
            Karşılaştırma Merkezi
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
            Donanım Karşılaştırmaları
          </h1>

          <p className="mt-4 text-sm leading-7 text-zinc-400 sm:text-base">
            İncelediğimiz ürünleri teknik özellikleri
            üzerinden yan yana karşılaştırın.
            Karşılaştırma kategorileri zamanla
            genişletilecek.
          </p>
        </div>

        <section className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
          <Link
            href="/karsilastirma/laptop"
            className="group rounded-3xl border border-cyan-500/20 bg-cyan-500/[0.04] p-6 transition-all hover:border-cyan-400/40 hover:bg-cyan-500/[0.07]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10">
              <Laptop
                size={22}
                className="text-cyan-400"
              />
            </div>

            <h2 className="mt-5 text-xl font-black text-white transition-colors group-hover:text-cyan-300">
              Laptop Karşılaştırmaları
            </h2>

            <p className="mt-3 text-sm leading-6 text-zinc-500">
              Laptop modellerini işlemci, grafik birimi,
              RAM, depolama, ekran, bağlantılar, batarya
              ve diğer teknik özellikleri üzerinden
              karşılaştırın.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 text-xs font-black text-cyan-400">
              Karşılaştırmaları görüntüle

              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-1"
              />
            </div>
          </Link>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 opacity-65">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950">
              <Scale
                size={22}
                className="text-zinc-500"
              />
            </div>

            <div className="mt-5 flex items-center gap-2">
              <h2 className="text-xl font-black text-zinc-300">
                Yeni Kategoriler
              </h2>

              <span className="rounded-full border border-zinc-700 bg-zinc-900 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-zinc-500">
                Yakında
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Tablet, monitör, ekran kartı ve işlemci
              karşılaştırmaları ilerleyen dönemde bu
              merkeze eklenecek.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
