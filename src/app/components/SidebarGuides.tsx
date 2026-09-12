"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

import { supabase } from "../lib/supabase";

type Guide = {
  id: number;
  title: string;
  slug: string;
  category: string | null;
  cover_image_url: string | null;
};

export default function SidebarGuides() {
  const [guides, setGuides] = useState<Guide[]>([]);

  useEffect(() => {
    const loadGuides = async () => {
      const { data, error } = await supabase
        .from("guides")
        .select("id,title,slug,category,cover_image_url")
        .eq("published", true)
        .order("updated_at", { ascending: false })
        .limit(3);

      if (error) {
        console.error("YAN MENÜ REHBER HATASI:", error);
        return;
      }

      setGuides((data || []) as Guide[]);
    };

    loadGuides();
  }, []);

  if (guides.length === 0) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-zinc-800/80 bg-zinc-900/40 p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
          <BookOpen size={14} className="text-cyan-400" />
          Öne Çıkan Rehberler
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {guides.map((guide) => (
          <Link
            key={guide.id}
            href={`/rehber/${guide.slug}`}
            className="group flex items-center gap-3 rounded-2xl border border-transparent p-2 transition-colors hover:border-cyan-500/30 hover:bg-zinc-800/50"
          >
            {guide.cover_image_url ? (
              <img
                src={guide.cover_image_url}
                alt=""
                className="h-14 w-20 shrink-0 rounded-xl border border-zinc-800 object-cover"
              />
            ) : (
              <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950">
                <BookOpen size={20} className="text-zinc-700" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <span className="text-[9px] font-black uppercase tracking-wider text-cyan-400">
                {guide.category || "Genel"}
              </span>
              <h2 className="mt-1 line-clamp-2 text-xs font-bold leading-5 text-zinc-200 transition-colors group-hover:text-white">
                {guide.title}
              </h2>
            </div>
          </Link>
        ))}
      </div>

      <Link
        href="/rehber"
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3 text-xs font-black text-zinc-200 transition-colors hover:border-cyan-500/30 hover:text-cyan-400"
      >
        Tüm Rehberler
        <ArrowRight size={14} />
      </Link>
    </section>
  );
}