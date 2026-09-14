"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Laptop, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Review } from "../lib/reviews";
import ReviewCard from "./ReviewCard";

export default function HomeReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setFailed(false);
      try {
        const { data, error } = await supabase.from("reviews")
          .select("id,slug,title,subtitle,excerpt,image_url,category,featured")
          .eq("published", true)
          .order("featured", { ascending: false })
          .order("published_at", { ascending: false })
          .limit(2);
        if (error) throw error;
        if (active) setReviews((data || []) as Review[]);
      } catch {
        if (active) setFailed(true);
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [attempt]);

  return (
    <section aria-labelledby="home-reviews-title" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <h2 id="home-reviews-title" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
          <Laptop size={14} className="text-cyan-400" /> İncelemeler
        </h2>
        <Link href="/incelemeler" className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300">
          Tüm İncelemeler <ArrowRight size={14} />
        </Link>
      </div>
      <p className="px-1 text-sm leading-6 text-zinc-400">
        Bu laptop sana uygun mu? Güçlü yönlerini, sınırlamalarını ve hangi ihtiyaçlara karşılık geldiğini keşfet.
      </p>
      {loading ? (
        <div role="status" className="flex min-h-32 items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/20 text-sm text-zinc-400">
          <Loader2 size={20} className="animate-spin text-cyan-400" /> İncelemeler yükleniyor…
        </div>
      ) : failed ? (
        <div role="status" className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6 text-sm text-zinc-400">
          İncelemeler şu anda yüklenemiyor.
          <button type="button" onClick={() => setAttempt(value => value + 1)} className="ml-3 text-cyan-400 hover:underline">Tekrar dene</button>
        </div>
      ) : reviews.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {reviews.map(review => <ReviewCard key={review.id} review={review} />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 text-sm text-zinc-400">
          Henüz yayınlanmış inceleme bulunmuyor. Yeni incelemeler burada yer alacak.
        </div>
      )}
    </section>
  );
}
