import "server-only";

import { createClient } from "@supabase/supabase-js";

export type PublishedNews = {
  id: number;
  slug: string | null;
  title: string;
  excerpt: string | null;
  image_url: string | null;
  category: string | null;
  published: boolean;
  featured: boolean;
  created_at: string;
};

export type PublishedGuide = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  category: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
};

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

export async function publishedNews(
  category?: string
): Promise<PublishedNews[]> {
  const supabase = client();
  if (!supabase) return [];

  let query = supabase
    .from("news")
    .select("id,slug,title,excerpt,image_url,category,published,featured,created_at")
    .eq("published", true);

  if (category) query = query.eq("category", category);

  const { data, error } = await query
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Yayınlanmış haberler alınamadı:", error.message);
    return [];
  }

  return (data || []) as PublishedNews[];
}

export async function publishedGuides(): Promise<PublishedGuide[]> {
  const supabase = client();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("guides")
    .select("id,title,slug,excerpt,cover_image_url,category,published,created_at,updated_at")
    .eq("published", true)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Yayınlanmış rehberler alınamadı:", error.message);
    return [];
  }

  return (data || []) as PublishedGuide[];
}
