import Link from "next/link";

import {
  ArrowRight,
  Laptop,
  Scale,
} from "lucide-react";

export default function HomeComparison() {
  return (
    <section
      aria-labelledby="home-comparison-title"
      className="flex flex-col gap-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <h2
          id="home-comparison-title"
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400"
        >
          <Scale
            size={14}
            className="text-cyan-400"
          />

          Karşılaştırma
        </h2>

        <span className="text-[11px] font-medium text-zinc-600">
          Laptoplar yan yana
        </span>
      </div>

      <Link
        href="/karsilastirma/laptop"
        className="group relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 transition-all hover:border-cyan-500/40"
      >
        <div className="p-6 md:p-8">
          <span className="rounded-lg bg-cyan-500 px-2.5 py-1 text-[10px] font-black uppercase text-zinc-950">
            Karşılaştırma
          </span>

          <h3 className="mt-5 text-2xl font-black leading-tight text-white transition-colors group-hover:text-cyan-300 md:text-4xl">
            Laptop Karşılaştırmaları
          </h3>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
            İncelediğimiz laptop modellerini teknik özellikleri üzerinden
            yan yana karşılaştırın.
          </p>

          <div className="mt-7 flex items-center justify-center gap-3">
            <div className="flex min-w-0 flex-1 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
              <div className="text-center">
                <div className="mx-auto flex h-24 w-full max-w-[180px] items-center justify-center rounded-xl bg-white sm:h-32">
                  <Laptop
                    size={42}
                    className="text-zinc-400"
                  />
                </div>

                <p className="mt-3 text-xs font-black text-white sm:text-sm">
                  Laptop 1
                </p>
              </div>
            </div>

            <span className="shrink-0 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-xs font-black text-cyan-300">
              VS
            </span>

            <div className="flex min-w-0 flex-1 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
              <div className="text-center">
                <div className="mx-auto flex h-24 w-full max-w-[180px] items-center justify-center rounded-xl bg-white sm:h-32">
                  <Laptop
                    size={42}
                    className="text-zinc-400"
                  />
                </div>

                <p className="mt-3 text-xs font-black text-white sm:text-sm">
                  Laptop 2
                </p>
              </div>
            </div>
          </div>
        </div>
      </Link>

      <div className="flex justify-end pt-1">
        <Link
          href="/karsilastirma/laptop"
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-xs font-black text-zinc-200 transition-all hover:border-cyan-500/30 hover:text-cyan-400"
        >
          Karşılaştırmaları gör

          <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}