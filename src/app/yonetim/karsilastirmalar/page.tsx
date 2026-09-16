import Link from "next/link";

import {
  ArrowLeft,
  Cpu,
  Laptop,
  Monitor,
  Scale,
  Tablet,
} from "lucide-react";

const upcomingCategories = [
  {
    title: "Tablet Karşılaştırmaları",
    description:
      "Tablet modelleri için teknik karşılaştırma sistemi.",
    icon: Tablet,
  },
  {
    title: "Monitör Karşılaştırmaları",
    description:
      "Monitör modelleri için teknik karşılaştırma sistemi.",
    icon: Monitor,
  },
  {
    title: "Ekran Kartı Karşılaştırmaları",
    description:
      "Ekran kartları için teknik karşılaştırma sistemi.",
    icon: Scale,
  },
  {
    title: "İşlemci Karşılaştırmaları",
    description:
      "İşlemciler için teknik karşılaştırma sistemi.",
    icon: Cpu,
  },
];

export default function ComparisonManagementPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-[1180px] px-5 py-10 md:px-6 md:py-14">
        <Link
          href="/yonetim"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 transition-colors hover:text-cyan-400"
        >
          <ArrowLeft size={15} />
          Yönetim paneline dön
        </Link>

        <div className="mt-7">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10">
              <Scale
                size={22}
                className="text-cyan-400"
              />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-400">
                KARŞILAŞTIRMA YÖNETİMİ
              </p>

              <h1 className="mt-1 text-3xl font-black tracking-tight md:text-4xl">
                Donanım Karşılaştırmaları
              </h1>
            </div>
          </div>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-500">
            Laptop ve diğer ürün grupları için
            karşılaştırma içeriklerini buradan
            yönetebilirsin.
          </p>
        </div>

        <section className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
          <Link
            href="/yonetim/karsilastirmalar/laptop"
            className="group rounded-3xl border border-cyan-500/20 bg-cyan-500/[0.04] p-6 transition-all hover:border-cyan-400/40 hover:bg-cyan-500/[0.07]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10">
              <Laptop
                size={22}
                className="text-cyan-400"
              />
            </div>

            <div className="mt-5 flex items-center gap-2">
              <h2 className="text-xl font-black text-white transition-colors group-hover:text-cyan-300">
                Laptop Karşılaştırmaları
              </h2>

              <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-cyan-300">
                Aktif
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-zinc-500">
              Laptop modellerini teknik özellikleri
              üzerinden karşılaştıran içerikleri
              oluştur, düzenle ve yayınla.
            </p>
          </Link>

          {upcomingCategories.map(
            ({
              title,
              description,
              icon: Icon,
            }) => (
              <div
                key={title}
                className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 opacity-65"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950">
                  <Icon
                    size={22}
                    className="text-zinc-500"
                  />
                </div>

                <div className="mt-5 flex items-center gap-2">
                  <h2 className="text-xl font-black text-zinc-300">
                    {title}
                  </h2>

                  <span className="rounded-full border border-zinc-700 bg-zinc-900 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-zinc-500">
                    Yakında
                  </span>
                </div>

                <p className="mt-3 text-sm leading-6 text-zinc-600">
                  {description}
                </p>
              </div>
            )
          )}
        </section>
      </div>
    </main>
  );
}