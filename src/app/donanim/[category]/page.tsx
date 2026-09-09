"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Cpu,
  Monitor,
  CircuitBoard,
  MemoryStick,
  Zap,
  HardDrive,
  Loader2,
} from "lucide-react";

import { supabase } from "../../lib/supabase";

type HardwareItem = {
  id: number;
  slug: string;
  category: string;
  name: string;
  price: number;
  description: string | null;
  specs: Record<string, string> | null;
};

const categoryInfo: Record<
  string,
  {
    title: string;
    description: string;
    icon: React.ElementType;
  }
> = {
  islemciler: {
    title: "İşlemciler Modelleri",
    description:
      "Bu kategoride yer alan tüm işlemcileri inceleyin ve teknik özellikleri karşılaştırın.",
    icon: Cpu,
  },

  "ekran-kartlari": {
    title: "Ekran Kartları Modelleri",
    description:
      "Bu kategoride yer alan tüm ekran kartlarını inceleyin ve teknik özellikleri karşılaştırın.",
    icon: Monitor,
  },

  anakartlar: {
    title: "Anakart Modelleri",
    description:
      "Bu kategoride yer alan tüm anakartları inceleyin ve teknik özellikleri karşılaştırın.",
    icon: CircuitBoard,
  },

  bellekler: {
    title: "Bellek Modelleri",
    description:
      "Bu kategoride yer alan tüm RAM modellerini inceleyin ve teknik özellikleri karşılaştırın.",
    icon: MemoryStick,
  },

  "guc-kaynaklari": {
    title: "Güç Kaynakları Modelleri",
    description:
      "Bu kategoride yer alan tüm güç kaynaklarını inceleyin ve teknik özellikleri karşılaştırın.",
    icon: Zap,
  },

  depolama: {
    title: "Depolama Modelleri",
    description:
      "Bu kategoride yer alan tüm SSD ve depolama ürünlerini inceleyin ve teknik özellikleri karşılaştırın.",
    icon: HardDrive,
  },
};

export default function HardwareCategoryPage() {
  const params = useParams();

  const category = String(params.category || "");

  const [items, setItems] = useState<HardwareItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const info = categoryInfo[category];

  useEffect(() => {
    if (!category) return;

    loadItems();
  }, [category]);

  const loadItems = async () => {
    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("hardware_items")
      .select("*")
      .eq("category", category)
      .order("price", { ascending: true });

    if (error) {
      console.error(error);
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setItems((data || []) as HardwareItem[]);
    setLoading(false);
  };

  if (!info) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <div className="max-w-[1100px] mx-auto px-6 py-12">
          <Link
            href="/donanim"
            className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-cyan-400"
          >
            <ArrowLeft size={14} />
            Kategorilere dön
          </Link>

          <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-10">
            <h1 className="text-2xl font-black">
              Kategori bulunamadı
            </h1>

            <p className="text-sm text-zinc-500 mt-2">
              Geçersiz donanım kategorisi.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const Icon = info.icon;

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-[1100px] mx-auto px-6 py-10">

        <Link
          href="/donanim"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-cyan-400 transition-colors mb-5"
        >
          <ArrowLeft size={14} />
          Kategorilere Dön
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Icon size={20} className="text-cyan-400" />
          </div>

          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">
              {info.title}
            </h1>

            <p className="text-sm text-zinc-500 mt-1">
              {info.description}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">

            <Loader2
              size={30}
              className="animate-spin text-cyan-400 mb-4"
            />

            <p className="text-sm text-zinc-500">
              Donanım verileri yükleniyor...
            </p>

          </div>
        ) : errorMessage ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">

            <p className="text-sm font-bold text-red-400">
              Veriler yüklenemedi
            </p>

            <p className="text-xs text-zinc-500 mt-2">
              {errorMessage}
            </p>

          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-10 text-center">

            <Icon
              size={30}
              className="mx-auto text-zinc-700 mb-3"
            />

            <p className="text-sm font-bold text-zinc-400">
              Bu kategoride henüz ürün bulunmuyor.
            </p>

          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {items.map((item) => (

              <div
                key={item.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 hover:border-cyan-500/20 transition-all"
              >

                <div className="flex items-start justify-between gap-4 mb-4">

                  <div>
                    <h2 className="text-lg font-black text-white">
                      {item.name}
                    </h2>
                  </div>

                  <span className="shrink-0 text-xs font-black px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {Number(item.price).toLocaleString("tr-TR")} ₺
                  </span>

                </div>

                <p className="text-sm text-zinc-500 leading-6 min-h-[48px]">
                  {item.description || "Açıklama bulunmuyor."}
                </p>

                <div className="border-t border-zinc-800 mt-5 pt-4 space-y-2">

                  {item.specs &&
                    Object.entries(item.specs).map(([key, value]) => (

                      <div
                        key={key}
                        className="flex items-center justify-between gap-4"
                      >

                        <span className="text-xs text-zinc-500">
                          {key}:
                        </span>

                        <span className="text-xs font-bold text-zinc-300 text-right">
                          {value || "-"}
                        </span>

                      </div>

                    ))}

                </div>

              </div>

            ))}

          </div>
        )}

      </div>
    </div>
  );
}