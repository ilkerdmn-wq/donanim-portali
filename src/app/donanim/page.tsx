"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  Cpu,
  Monitor,
  CircuitBoard,
  MemoryStick,
  Zap,
  HardDrive,
  ArrowRight,
  Layers3,
  Loader2,
} from "lucide-react";

import { supabase } from "../lib/supabase";

type CategoryItem = {
  title: string;
  description: string;
  href: string;
  category: string;
  icon: any;
};

type CategoryCounts = {
  [key: string]: number;
};

const categories: CategoryItem[] = [
  {
    title: "İşlemciler (CPU)",
    description:
      "Intel ve AMD işlemci modelleri, soket yapıları ve teknik özellikler.",
    href: "/donanim/islemciler",
    category: "islemciler",
    icon: Cpu,
  },
  {
    title: "Ekran Kartları (GPU)",
    description:
      "NVIDIA ve AMD ekran kartı serileri ve güncel performans bilgileri.",
    href: "/donanim/ekran-kartlari",
    category: "ekran-kartlari",
    icon: Monitor,
  },
  {
    title: "Anakartlar",
    description:
      "Farklı chipsetler, soketler ve form faktörlerine sahip anakart modelleri.",
    href: "/donanim/anakartlar",
    category: "anakartlar",
    icon: CircuitBoard,
  },
  {
    title: "Bellekler (RAM)",
    description:
      "Yüksek hızlı DDR4 ve DDR5 bellek kitleri ve gecikme değerleri.",
    href: "/donanim/bellekler",
    category: "bellekler",
    icon: MemoryStick,
  },
  {
    title: "Güç Kaynakları (PSU)",
    description:
      "80+ sertifikalı ve farklı güç değerlerine sahip güç kaynağı seçenekleri.",
    href: "/donanim/guc-kaynaklari",
    category: "guc-kaynaklari",
    icon: Zap,
  },
  {
    title: "Depolama (SSD / HDD)",
    description:
      "Yüksek hızlı NVMe M.2 SSD'ler ve diğer depolama birimleri.",
    href: "/donanim/depolama",
    category: "depolama",
    icon: HardDrive,
  },
];

export default function HardwarePage() {
  const [counts, setCounts] = useState<CategoryCounts>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    setLoading(true);

    try {
      const results = await Promise.all(
        categories.map(async (category) => {
          const { count, error } = await supabase
            .from("hardware_items")
            .select("*", {
              count: "exact",
              head: true,
            })
            .eq("category", category.category);

          if (error) {
            console.error(
              `${category.category} sayısı alınamadı:`,
              error
            );

            return {
              category: category.category,
              count: 0,
            };
          }

          return {
            category: category.category,
            count: count || 0,
          };
        })
      );

      const newCounts: CategoryCounts = {};

      results.forEach((item) => {
        newCounts[item.category] = item.count;
      });

      setCounts(newCounts);
    } catch (error) {
      console.error(
        "Donanım kategorileri sayılırken hata oluştu:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-[1180px] mx-auto px-5 md:px-6 py-10 md:py-14">

        {/* BAŞLIK */}
        <div className="mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <Layers3
                size={22}
                className="text-cyan-400"
              />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-400">
                DONANIM MERKEZİ
              </p>

              <h1 className="text-3xl md:text-4xl font-black tracking-tight mt-1">
                Donanım Kategorileri
              </h1>

              <p className="text-sm text-zinc-500 mt-2">
                Bilgisayar bileşenlerini inceleyin,
                teknik özellikleri ve modelleri karşılaştırın.
              </p>
            </div>
          </div>
        </div>

        {/* KATEGORİLER */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => {
            const Icon = category.icon;

            const count =
              counts[category.category] ?? 0;

            return (
              <Link
                key={category.category}
                href={category.href}
                className="group relative rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 hover:border-cyan-500/40 hover:bg-zinc-900/70 transition-all"
              >
                {/* ÜST */}
                <div className="flex items-start justify-between gap-4">
                  <div className="w-11 h-11 rounded-xl border border-zinc-800 bg-zinc-950 flex items-center justify-center">
                    <Icon
                      size={20}
                      className="text-cyan-400"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="min-w-[55px] h-7 px-2.5 rounded-lg border border-zinc-800 bg-zinc-950 flex items-center justify-center">
                      {loading ? (
                        <Loader2
                          size={13}
                          className="text-cyan-400 animate-spin"
                        />
                      ) : (
                        <span className="text-[10px] font-black text-cyan-400">
                          {count} Ürün
                        </span>
                      )}
                    </div>

                    <ArrowRight
                      size={16}
                      className="text-zinc-700 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all"
                    />
                  </div>
                </div>

                {/* BAŞLIK */}
                <h2 className="text-lg font-black mt-5 group-hover:text-cyan-400 transition-colors">
                  {category.title}
                </h2>

                {/* AÇIKLAMA */}
                <p className="text-xs text-zinc-500 leading-5 mt-2 min-h-[40px]">
                  {category.description}
                </p>

                {/* ALT ÇİZGİ */}
                <div className="h-px bg-zinc-800 my-5" />

                {/* ALT */}
                <div className="flex items-center gap-2 text-xs font-black text-cyan-400">
                  Kategoriyi İncele

                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}