import type { Metadata } from "next";
import ComparisonClient from "./ComparisonClient";
import type { Laptop } from "./comparison";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Laptop Karşılaştırma",
  description: "Donanım Portalı incelemelerinde yer alan laptopların ekran, bellek, depolama, bağlantı ve taşınabilirlik özelliklerini yan yana karşılaştırın.",
  alternates: {canonical:"https://donanimportali.com/laptop-karsilastirma"},
};

async function getLaptops(): Promise<Laptop[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return [];
  try {
    const url = new URL(`${supabaseUrl}/rest/v1/laptops`);
    url.searchParams.set("select","id,brand,model,image_url,review_slug,graphics_watts,ram_gb,ram_speed_mhz,ram_upgradable,screen_inches,resolution,panel,refresh_hz,brightness_nits,color_gamut,ssd_gb,ssd_type,battery_wh,weight_kg,ports,wireless,notes,processor:laptop_processors(name,performance_order),graphics:laptop_graphics(name,performance_order)");
    url.searchParams.set("published","eq.true");
    url.searchParams.set("order","model.asc");
    const response = await fetch(url,{headers:{apikey:anonKey,Authorization:`Bearer ${anonKey}`},cache:"no-store"});
    if (!response.ok) return [];
    return await response.json() as Laptop[];
  } catch { return []; }
}

export default async function Page() { return <ComparisonClient initialLaptops={await getLaptops()}/>; }
