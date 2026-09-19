"use client";

import {
  Search,
  X,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import ReviewCard from "@/app/components/ReviewCard";

import type {
  Review,
} from "@/app/lib/reviews";

type ReviewsSearchGridProps = {
  reviews: Review[];
};

export default function ReviewsSearchGrid({
  reviews,
}: ReviewsSearchGridProps) {
  const [search, setSearch] =
    useState("");

  const filteredReviews =
    useMemo(() => {
      const query = search
        .trim()
        .toLocaleLowerCase(
          "tr-TR"
        );

      if (!query) {
        return reviews;
      }

      return reviews.filter(
        (review) => {
          const searchableText = [
            review.title,
            review.subtitle,
            review.excerpt,
            review.category,
            review.sku,
            ...Object.values(
              review.specs || {}
            ),
          ]
            .filter(Boolean)
            .join(" ")
            .toLocaleLowerCase(
              "tr-TR"
            );

          return searchableText.includes(
            query
          );
        }
      );
    }, [reviews, search]);

  if (!reviews.length) {
    return (
      <section className="mt-8">
        <div className="mb-5">
          <h2 className="text-2xl font-black text-white">
            Güncel incelemeler
          </h2>
        </div>

        <p className="rounded-3xl border border-zinc-800 p-10 text-center text-zinc-400">
          Henüz yayımlanmış inceleme bulunmuyor.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">
            Güncel incelemeler
          </h2>

          <p className="mt-1 text-xs text-zinc-500">
            Model veya donanım özelliğine göre incelemelerde ara.
          </p>
        </div>

        <div className="w-full md:w-[380px]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Laptop modeli veya donanım ara..."
              aria-label="Laptop incelemelerinde ara"
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/60 py-3.5 pl-12 pr-12 text-sm text-white outline-none transition-all placeholder:text-zinc-600 hover:border-zinc-700 focus:border-cyan-500/60 focus:bg-zinc-900"
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                aria-label="Aramayı temizle"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-white"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {search && (
            <p className="mt-2 text-right text-xs text-zinc-500">
              {
                filteredReviews.length
              }{" "}
              inceleme bulundu
            </p>
          )}
        </div>
      </div>

      {filteredReviews.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredReviews.map(
            (review) => (
              <ReviewCard
                key={review.id}
                review={review}
              />
            )
          )}
        </div>
      ) : (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 px-6 py-12 text-center">
          <Search
            size={28}
            className="mx-auto text-zinc-600"
          />

          <p className="mt-4 font-bold text-white">
            İnceleme bulunamadı
          </p>

          <p className="mt-2 text-sm text-zinc-500">
            “{search}” için yayımlanmış bir laptop incelemesi bulunmuyor.
          </p>

          <button
            type="button"
            onClick={() =>
              setSearch("")
            }
            className="mt-5 text-xs font-black text-cyan-400 transition-colors hover:text-cyan-300"
          >
            Aramayı temizle
          </button>
        </div>
      )}
    </section>
  );
}