import Link from "next/link";
import {
  Newspaper,
  Cpu,
  Code2,
  Gamepad2,
  BrainCircuit,
  Smartphone,
  Layers3,
  ArrowRight,
} from "lucide-react";

const categories = [
  {
    title: "Genel",
    slug: "genel",
    description:
      "Teknoloji dünyasından genel gelişmeler, duyurular ve güncel haberler.",
    icon: Newspaper,
  },
  {
    title: "Donanım",
    slug: "donanim",
    description:
      "İşlemci, ekran kartı, anakart, bellek ve diğer donanım haberleri.",
    icon: Cpu,
  },
  {
    title: "Yazılım",
    slug: "yazilim",
    description:
      "İşletim sistemleri, uygulamalar, geliştirici araçları ve yazılım dünyası.",
    icon: Code2,
  },
  {
    title: "Oyun",
    slug: "oyun",
    description:
      "PC ve konsol oyunları, güncellemeler, performans ve oyun dünyası.",
    icon: Gamepad2,
  },
  {
    title: "Yapay Zeka",
    slug: "yapay-zeka",
    description:
      "Yapay zeka modelleri, araçlar, gelişmeler ve yeni teknolojiler.",
    icon: BrainCircuit,
  },
  {
    title: "Mobil",
    slug: "mobil",
    description:
      "Akıllı telefonlar, tabletler, mobil işletim sistemleri ve mobil teknoloji haberleri.",
    icon: Smartphone,
  },
];

export default function NewsPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-[1100px] mx-auto px-5 md:px-6 py-10 md:py-14">
        {/* BAŞLIK */}
        <div className="mb-10">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Layers3 size={21} className="text-cyan-400" />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-400">
                HABER MERKEZİ
              </p>

              <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                Haber Kategorileri
              </h1>
            </div>
          </div>

          <p className="text-sm text-zinc-500 mt-3">
            İlgi alanına göre haber kategorisini seç ve güncel içerikleri incele.
          </p>
        </div>

        {/* KATEGORİLER */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <Link
                key={category.slug}
                href={`/news/${category.slug}`}
                className="group min-h-[250px] rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 flex flex-col justify-between transition-all duration-200 hover:border-cyan-500/30 hover:bg-zinc-900/80"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="w-11 h-11 rounded-xl border border-zinc-800 bg-zinc-950 flex items-center justify-center">
                      <Icon
                        size={20}
                        className="text-cyan-400"
                      />
                    </div>

                    <ArrowRight
                      size={17}
                      className="text-zinc-700 transition-all group-hover:text-cyan-400 group-hover:translate-x-1"
                    />
                  </div>

                  <h2 className="text-xl font-black mt-7">
                    {category.title}
                  </h2>

                  <p className="text-sm text-zinc-500 leading-6 mt-3">
                    {category.description}
                  </p>
                </div>

                <div className="pt-5 mt-5 border-t border-zinc-800">
                  <span className="text-xs font-black text-cyan-400">
                    Haberleri Gör
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}