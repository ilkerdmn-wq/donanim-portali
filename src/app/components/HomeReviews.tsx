"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Laptop, Loader2, Star, Tag } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Review } from "../lib/reviews";

type HomeReview = Pick<Review, "id" | "slug" | "title" | "subtitle" | "excerpt" | "image_url" | "category" | "featured" | "published_at" | "created_at">;

function reviewDate(review: HomeReview) {
  const date = new Date(review.published_at || review.created_at);
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit", month: "short", year: "numeric",
  }).format(date);
}

export default function HomeReviews() {
  const [reviews, setReviews] = useState<HomeReview[]>([]);
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
          .select("id,slug,title,subtitle,excerpt,image_url,category,featured,published_at,created_at")
          .eq("published", true)
          .order("featured", { ascending: false })
          .order("published_at", { ascending: false })
          .limit(26);
        if (error) throw error;
        if (active) setReviews(data || []);
      } catch {
        if (active) setFailed(true);
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [attempt]);

  const featuredReview = reviews[0];
  const otherReviews = reviews.slice(1).sort((a, b) =>
    new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime()
  );

  return (
    <section aria-labelledby="home-reviews-title" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <h2 id="home-reviews-title" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
          <Laptop size={14} className="text-cyan-400" /> İncelemeler
        </h2>
        <span className="text-[11px] font-medium text-zinc-600">Manşet ve son incelemeler</span>
      </div>
      {loading ? (
        <div role="status" className="flex min-h-32 items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/20 text-sm text-zinc-400">
          <Loader2 size={20} className="animate-spin text-cyan-400" /> İncelemeler yükleniyor…
        </div>
      ) : failed ? (
        <div role="status" className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6 text-sm text-zinc-400">
          İncelemeler şu anda yüklenemiyor.
          <button type="button" onClick={() => setAttempt(value => value + 1)} className="ml-3 text-cyan-400 hover:underline">Tekrar dene</button>
        </div>
      ) : featuredReview ? (
        <>
          <Link href={`/incelemeler/${featuredReview.slug}`} className="group relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/60 transition-all hover:border-cyan-500/40">
            <div className="relative flex min-h-[300px] flex-col justify-end overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950 md:min-h-[360px]">
              {featuredReview.image_url ? (
                <>
                  <img src={featuredReview.image_url} alt={featuredReview.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                </>
              ) : <Laptop size={70} className="absolute right-8 top-8 text-zinc-800" />}
              <div className="relative p-7 md:p-8">
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-zinc-950"><Star size={11} /> Manşet</span>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-cyan-300"><Tag size={11} />{featuredReview.category}</span>
                  <span className="inline-flex items-center gap-1.5 text-[10px] text-zinc-400"><CalendarDays size={11} />{reviewDate(featuredReview)}</span>
                </div>
                <h3 className="max-w-3xl text-2xl font-black leading-tight text-white transition-colors group-hover:text-cyan-300 md:text-4xl">{featuredReview.title}</h3>
                {featuredReview.subtitle && <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-zinc-200">{featuredReview.subtitle}</p>}
                {featuredReview.excerpt && <p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-6 text-zinc-300">{featuredReview.excerpt}</p>}
              </div>
            </div>
          </Link>
          {otherReviews.length > 0 && (
            <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/25 p-2">
              <div className="px-2.5 pb-2 pt-1 text-[10px] font-black uppercase tracking-wider text-zinc-500">Son İncelemeler</div>
              <div tabIndex={0} aria-label="Son incelemeler, diğer incelemeler için aşağı kaydırın" className="max-h-[322px] space-y-2 overflow-y-auto overscroll-contain pr-1 [scrollbar-color:#3f3f46_transparent] [scrollbar-width:thin] focus-visible:outline-2 focus-visible:outline-cyan-400">
                {otherReviews.map(review => (
                  <Link key={review.id} href={`/incelemeler/${review.slug}`} className="group flex h-[102px] items-center gap-4 rounded-xl border border-zinc-800/70 bg-zinc-900/30 p-3 transition-all hover:border-cyan-500/30 hover:bg-zinc-900/60">
                    <div className="flex h-[76px] w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 sm:w-[112px]">
                      {review.image_url ? <img src={review.image_url} alt={review.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" /> : <Laptop size={26} className="text-zinc-800" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-cyan-400"><Tag size={10} />{review.category}</span>
                        <span className="inline-flex items-center gap-1 text-[10px] text-zinc-600"><CalendarDays size={10} />{reviewDate(review)}</span>
                      </div>
                      <h3 className="line-clamp-2 text-sm font-black leading-tight text-white transition-colors group-hover:text-cyan-400 md:text-base">{review.title}</h3>
                      {review.subtitle && <p className="mt-1 line-clamp-1 text-xs text-zinc-400">{review.subtitle}</p>}
                    </div>
                    <span className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-800 transition-colors group-hover:border-cyan-500/40 sm:flex"><ArrowRight size={14} className="text-zinc-600 group-hover:text-cyan-400" /></span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 text-sm text-zinc-400">
          Henüz yayınlanmış inceleme bulunmuyor. Yeni incelemeler burada yer alacak.
        </div>
      )}
      <div className="flex justify-end pt-1">
        <Link href="/incelemeler" className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-xs font-black text-zinc-200 transition-all hover:border-cyan-500/30 hover:text-cyan-400">
          Tüm İncelemeler <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}
