import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";
import {isAdminAuthenticated} from "@/app/lib/admin-auth";
import {reviewPayload} from "@/app/lib/reviews";
function db(){const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)throw new Error("Sunucu bağlantısı yapılandırılmamış.");return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});}
const denied=()=>NextResponse.json({error:"Yetkisiz işlem."},{status:401});
function failure(e:unknown){console.error("İnceleme API",e);return NextResponse.json({error:"İşlem tamamlanamadı. Veritabanı bağlantısını kontrol edin."},{status:500});}
export async function GET(req:NextRequest){if(!await isAdminAuthenticated(req))return denied();try{const {data,error}=await db().from("reviews").select("*").order("created_at",{ascending:false});if(error)throw error;return NextResponse.json({reviews:data},{headers:{"Cache-Control":"no-store"}});}catch(e){return failure(e);}}
async function save(req:NextRequest,update:boolean){
 if(!await isAdminAuthenticated(req))return denied();
 if(req.headers.get("origin") && req.headers.get("origin")!==new URL(req.url).origin)return denied();
 let body;let payload;
 try{body=await req.json();if(!body || typeof body!=="object" || Array.isArray(body))throw new Error("Geçersiz kayıt.");payload=reviewPayload(body);}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Geçersiz kayıt."},{status:400});}
 if(update && (!Number.isSafeInteger(body.id)||body.id<1))return NextResponse.json({error:"Geçersiz kimlik."},{status:400});
 try{const client=db();const query=update?client.from("reviews").update(payload).eq("id",body.id):client.from("reviews").insert(payload);const {data,error}=await query.select("*").single();if(error){if(error.code==="23505")return NextResponse.json({error:"Bu adres başka incelemede kullanılıyor."},{status:409});throw error;}return NextResponse.json({review:data});}catch(e){return failure(e);}
}
export const POST=(req:NextRequest)=>save(req,false);
export const PATCH=(req:NextRequest)=>save(req,true);
export async function DELETE(req:NextRequest){if(!await isAdminAuthenticated(req))return denied();if(req.headers.get("origin") && req.headers.get("origin")!==new URL(req.url).origin)return denied();const id=Number(req.nextUrl.searchParams.get("id"));if(!Number.isSafeInteger(id)||id<1)return NextResponse.json({error:"Geçersiz kimlik."},{status:400});try{const {error}=await db().from("reviews").delete().eq("id",id);if(error)throw error;return NextResponse.json({success:true});}catch(e){return failure(e);}}
