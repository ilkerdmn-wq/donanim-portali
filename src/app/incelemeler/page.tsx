import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { publishedReviews } from "@/app/lib/reviews-server";
import ReviewCard from "@/app/components/ReviewCard";
import {readComparison} from "@/app/lib/manual-comparison-server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Laptop İncelemeleri",
  description: "Laptopların teknik özellikleri, kullanım alanları, güçlü ve sınırlı tarafları.",
  alternates: { canonical: "https://donanimportali.com/incelemeler" },
};

async function hasLaptopComparison() {
  try { return (await readComparison())?.published===true; } catch { return false; }
}

export default async function ReviewsPage() {
  const [reviews, showComparison] = await Promise.all([publishedReviews(), hasLaptopComparison()]);
  return <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
    <header className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 md:p-8">
      <p className="text-[10px] font-black tracking-widest text-cyan-400">LAPTOP İNCELEMELERİ</p>
      <h1 className="mt-5 text-3xl font-black text-white md:text-5xl">Donanımı tanı, ihtiyacına göre değerlendir.</h1>
      <p className="mt-4 leading-7 text-zinc-400">Laptopların özelliklerini kullanım açısından ele alan incelemeler; güçlü yönler, sınırlı taraflar ve teknik ayrıntılar.</p>
    </header>
    {showComparison && <Link href="/laptop-karsilastirma" className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-cyan-500/25 bg-cyan-500/5 px-5 py-4 hover:border-cyan-400/60">
      <span><strong className="block text-sm text-white">Laptop karşılaştırma</strong><span className="mt-1 block text-xs text-zinc-400">İncelediğimiz laptopları özelliklerine göre yan yana gör.</span></span>
      <ArrowRight size={18} className="shrink-0 text-cyan-400" />
    </Link>}
    <h2 className="mb-5 mt-8 text-2xl font-black">Güncel incelemeler</h2>
    {reviews.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{reviews.map(review => <ReviewCard key={review.id} review={review} />)}</div> : <p className="rounded-3xl border border-zinc-800 p-10 text-center text-zinc-400">Henüz yayımlanmış inceleme bulunmuyor.</p>}
  </main>;
}
