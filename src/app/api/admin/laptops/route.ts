import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase-admin";
import { isAdminAuthenticated } from "@/app/lib/admin-auth";

const text = (value: unknown, length: number) => typeof value === "string" ? value.trim().slice(0, length) : "";
const number = (value: unknown, min: number, max: number) => {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : null;
};
const uuid = (value: unknown) => typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value) ? value : null;
const select = "*,processor:laptop_processors(id,name,performance_order),graphics:laptop_graphics(id,name,performance_order)";

function validLocalImage(value: unknown) {
  const url = text(value, 1000);
  if (!url) return "";
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" ? url : "";
  } catch { return ""; }
}

function laptopPayload(body: Record<string, unknown>) {
  return {
    brand: text(body.brand, 80), model: text(body.model, 180),
    image_url: validLocalImage(body.image_url), review_slug: text(body.review_slug, 220),
    processor_id: uuid(body.processor_id), graphics_id: uuid(body.graphics_id),
    graphics_watts: number(body.graphics_watts, 1, 500),
    ram_gb: number(body.ram_gb, 1, 512), ram_speed_mhz: number(body.ram_speed_mhz, 100, 15000),
    ram_upgradable: text(body.ram_upgradable, 100),
    screen_inches: number(body.screen_inches, 5, 30), resolution: text(body.resolution, 80),
    panel: text(body.panel, 80), refresh_hz: number(body.refresh_hz, 1, 500),
    brightness_nits: number(body.brightness_nits, 1, 3000), color_gamut: text(body.color_gamut, 80),
    ssd_gb: number(body.ssd_gb, 1, 16384), ssd_type: text(body.ssd_type, 100),
    battery_wh: number(body.battery_wh, 1, 250), weight_kg: number(body.weight_kg, 0.5, 10),
    ports: text(body.ports, 500), wireless: text(body.wireless, 120),
    notes: text(body.notes, 500), published: body.published === true,
    updated_at: new Date().toISOString(),
  };
}

async function reviewExists(slug: string) {
  if (!slug) return false;
  const {data,error} = await supabaseAdmin.from("reviews").select("id").eq("slug",slug).eq("published",true).maybeSingle();
  return !error && Boolean(data);
}

export async function GET(request: NextRequest) {
  if (!await isAdminAuthenticated(request)) return NextResponse.json({error:"Yetkisiz işlem."},{status:401});
  const [laptops, processors, graphics] = await Promise.all([
    supabaseAdmin.from("laptops").select(select).order("model"),
    supabaseAdmin.from("laptop_processors").select("*").order("name"),
    supabaseAdmin.from("laptop_graphics").select("*").order("name"),
  ]);
  const error = laptops.error || processors.error || graphics.error;
  if (error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({laptops:laptops.data || [],processors:processors.data || [],graphics:graphics.data || []});
}

export async function POST(request: NextRequest) {
  if (!await isAdminAuthenticated(request)) return NextResponse.json({error:"Yetkisiz işlem."},{status:401});
  try {
    const body = await request.json();
    if (body.kind === "processor" || body.kind === "graphics") {
      const name = text(body.name, 120);
      const order = number(body.performance_order, 1, 1000);
      if (name.length < 2) return NextResponse.json({error:"Bileşen adı gerekli."},{status:400});
      const table = body.kind === "processor" ? "laptop_processors" : "laptop_graphics";
      const {error} = await supabaseAdmin.from(table).insert({name,performance_order:order});
      if (error) throw error;
      return NextResponse.json({success:true});
    }
    const payload = laptopPayload(body);
    if (payload.brand.length < 2 || payload.model.length < 2) return NextResponse.json({error:"Marka ve model gerekli."},{status:400});
    if (payload.published && !await reviewExists(payload.review_slug)) return NextResponse.json({error:"Yayınlamak için yayındaki bir laptop incelemesi seç."},{status:400});
    const {error} = await supabaseAdmin.from("laptops").insert(payload);
    if (error) throw error;
    return NextResponse.json({success:true});
  } catch (error) { return NextResponse.json({error:error instanceof Error ? error.message : "Kayıt yapılamadı."},{status:500}); }
}

export async function PUT(request: NextRequest) {
  if (!await isAdminAuthenticated(request)) return NextResponse.json({error:"Yetkisiz işlem."},{status:401});
  try {
    const body = await request.json();
    const id = uuid(body.id);
    if (!id) return NextResponse.json({error:"Geçersiz kayıt."},{status:400});
    if (body.kind === "processor" || body.kind === "graphics") {
      const name = text(body.name, 120);
      if (name.length < 2) return NextResponse.json({error:"Bileşen adı gerekli."},{status:400});
      const table = body.kind === "processor" ? "laptop_processors" : "laptop_graphics";
      const {error} = await supabaseAdmin.from(table).update({name,performance_order:number(body.performance_order,1,1000)}).eq("id",id);
      if (error) throw error;
      return NextResponse.json({success:true});
    }
    const payload = laptopPayload(body);
    if (payload.brand.length < 2 || payload.model.length < 2) return NextResponse.json({error:"Marka ve model gerekli."},{status:400});
    if (payload.published && !await reviewExists(payload.review_slug)) return NextResponse.json({error:"Yayınlamak için yayındaki bir laptop incelemesi seç."},{status:400});
    const {error} = await supabaseAdmin.from("laptops").update(payload).eq("id",id);
    if (error) throw error;
    return NextResponse.json({success:true});
  } catch (error) { return NextResponse.json({error:error instanceof Error ? error.message : "Güncelleme yapılamadı."},{status:500}); }
}

export async function DELETE(request: NextRequest) {
  if (!await isAdminAuthenticated(request)) return NextResponse.json({error:"Yetkisiz işlem."},{status:401});
  const id = uuid(request.nextUrl.searchParams.get("id"));
  if (!id) return NextResponse.json({error:"Geçersiz kayıt."},{status:400});
  const {error} = await supabaseAdmin.from("laptops").delete().eq("id",id);
  if (error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({success:true});
}
