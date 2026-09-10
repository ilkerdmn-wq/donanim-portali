import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const onlyPriced = searchParams.get("onlyPriced") !== "false";

    let query = supabaseAdmin
      .from("hardware_items_with_price")
      .select("*")
      .order("name", { ascending: true });

    if (category) {
      query = query.eq("category", category);
    }

    if (onlyPriced) {
      query = query
        .eq("has_valid_price", true)
        .not("current_price", "is", null);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: data?.length ?? 0,
      items: data ?? [],
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Bilinmeyen hata",
      },
      { status: 500 }
    );
  }
}
