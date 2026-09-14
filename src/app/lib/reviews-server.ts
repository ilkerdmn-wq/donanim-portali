import "server-only";
import {createClient} from "@supabase/supabase-js";
import type {Review} from "./reviews";
export async function publishedReviews(slug?:string):Promise<Review[]>{
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return [];
 const client=createClient(url,key,{auth:{persistSession:false}});
 let query=client.from("reviews").select("*").eq("published",true).order("featured",{ascending:false}).order("published_at",{ascending:false}).limit(100);
 if(slug)query=query.eq("slug",slug).limit(1);
 const {data,error}=await query;if(error)throw new Error("İncelemeler şu anda yüklenemiyor.");return data as Review[];
}
