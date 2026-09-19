import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { publishedReviews } from "@/app/lib/reviews-server";
import ReviewsSearchGrid from "../components/ReviewsSearchGrid";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Laptop İncelemeleri",
  description:
    "Laptopların teknik özellikleri, kullanım alanları, güçlü ve sınırlı tarafları.",
  alternates: {
    canonical: "https://donanimportali.com/incelemeler",
  },
};

export default async function ReviewsPage() {
  const reviews = await publishedReviews();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
      <header className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 md:p-8">
        <p className="text-[10px] font-black tracking-widest text-cyan-400">
          LAPTOP İNCELEMELERİ
        </p>

        <h1 className="mt-5 text-3xl font-black text-white md:text-5xl">
          Donanımı tanı, ihtiyacına göre değerlendir.
        </h1>

        <p className="mt-4 leading-7 text-zinc-400">
          Laptopların özelliklerini kullanım açısından ele alan
          incelemeler; güçlü yönler, sınırlı taraflar ve teknik
          ayrıntılar.
        </p>
      </header>

      <Link
        href="/karsilastirma/laptop"
        className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-cyan-500/25 bg-cyan-500/5 px-5 py-4 transition-colors hover:border-cyan-400/60"
      >
        <span>
          <strong className="block text-sm text-white">
            Laptop karşılaştırmaları
          </strong>

          <span className="mt-1 block text-xs text-zinc-400">
            İncelediğimiz laptopları özelliklerine göre yan yana gör.
          </span>
        </span>

        <ArrowRight
          size={18}
          className="shrink-0 text-cyan-400"
        />
      </Link>

      <ReviewsSearchGrid reviews={reviews} />
    </main>
  );
}