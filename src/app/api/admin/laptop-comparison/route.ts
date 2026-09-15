import {NextRequest,NextResponse} from "next/server";
import {isAdminAuthenticated} from "@/app/lib/admin-auth";
import {supabaseAdmin} from "@/app/lib/supabase-admin";
import {emptyComparison,normalizeComparison} from "@/app/lib/manual-comparison";
import {readComparison,saveComparison} from "@/app/lib/manual-comparison-server";

export async function GET(request:NextRequest) {
  if (!await isAdminAuthenticated(request)) return NextResponse.json({error:"Yetkisiz işlem."},{status:401});
  try {
    const [document,reviews]=await Promise.all([readComparison(),supabaseAdmin.from("reviews").select("slug,title").eq("published",true).order("title")]);
    if (reviews.error) throw reviews.error;
    return NextResponse.json({document:document||emptyComparison(),reviews:reviews.data||[]},{headers:{"Cache-Control":"no-store"}});
  } catch { return NextResponse.json({error:"Karşılaştırma yüklenemedi."},{status:500}); }
}

export async function PUT(request:NextRequest) {
  if (!await isAdminAuthenticated(request)) return NextResponse.json({error:"Yetkisiz işlem."},{status:401});
  if (request.headers.get("origin") && request.headers.get("origin")!==new URL(request.url).origin) return NextResponse.json({error:"Yetkisiz işlem."},{status:403});
  try {
    const document=normalizeComparison(await request.json());
    if (document.published) {
      const slugs=document.columns.map(col=>col.reviewSlug);
      if (new Set(slugs).size!==slugs.length) return NextResponse.json({error:"Her laptop için ayrı bir inceleme seç."},{status:400});
      const {data,error}=await supabaseAdmin.from("reviews").select("slug").eq("published",true).in("slug",slugs);
      if (error) throw error;
      if ((data||[]).length!==slugs.length) return NextResponse.json({error:"Her sütun için yayımlanmış inceleme seç."},{status:400});
    }
    await saveComparison(document);
    return NextResponse.json({document});
  } catch (error) {return NextResponse.json({error:error instanceof Error?error.message:"Kaydedilemedi."},{status:400});}
}
