export const SPEC_FIELDS = [
 ["cpu","İşlemci"],["gpu","Ekran Kartı"],["ram","RAM"],["storage","Depolama"],["display","Ekran"],
 ["gpu_power","GPU Gücü / TGP"],["memory_layout","Bellek Düzeni"],["expansion","Yükseltilebilirlik"],
 ["ports","Bağlantılar"],["battery","Batarya"],["weight","Ağırlık"],["os","İşletim Sistemi"]] as const;
export type ReviewBlock = {type:"paragraph"|"h2"|"h3"|"quote"|"list"|"image"|"table";value:string};
export type Review = {id:number;title:string;subtitle:string;slug:string;excerpt:string;content:string;image_url:string;category:string;sku:string;specs:Record<string,string>;published:boolean;featured:boolean;created_at:string;updated_at:string;published_at:string|null};
export function imageUrl(value:unknown):string {
 if(typeof value!=="string") return "";
 if(value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) return value;
 try {const url=new URL(value); return ["https:","http:"].includes(url.protocol)?url.href:"";}catch{return "";}
}
export function parseReviewBlocks(content:string):ReviewBlock[] {
 try {const rows=JSON.parse(content); if(!Array.isArray(rows)) return []; return rows.filter(b=>b && ["paragraph","h2","h3","quote","list","image","table"].includes(b.type) && typeof b.value==="string");}catch{return [];}
}
export function reviewPayload(body:Record<string,unknown>) {
 const text=(key:string,max:number)=>typeof body[key]==="string"?(body[key] as string).trim().slice(0,max):"";
 const title=text("title",180), slug=(text("slug",220)||title).toLocaleLowerCase("tr-TR").replace(/ç/g,"c").replace(/ğ/g,"g").replace(/ı/g,"i").replace(/ö/g,"o").replace(/ş/g,"s").replace(/ü/g,"u").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
 if(!title || !slug) throw new Error("Başlık ve geçerli adres zorunludur.");
 const raw=typeof body.content==="string"?body.content:"";
 if(raw.length>200000) throw new Error("İçerik çok uzun.");
 const blocks=parseReviewBlocks(raw);
 if(!blocks.length || blocks.length>200) throw new Error("1–200 içerik bloğu gereklidir.");
 for(const b of blocks) {if(!b.value.trim() || b.value.length>50000) throw new Error("İçerik bloğu boş veya çok uzun."); if(b.type==="image" && !imageUrl(b.value)) throw new Error("Geçersiz görsel adresi.");}
 const specs:Record<string,string>={}; const input=body.specs as Record<string,unknown>|undefined;
 for(const [key] of SPEC_FIELDS) if(input && typeof input[key]==="string") specs[key]=(input[key] as string).trim().slice(0,180);
 return {title,slug,subtitle:text("subtitle",300),excerpt:text("excerpt",500),content:JSON.stringify(blocks),image_url:imageUrl(body.image_url),category:"Laptop",sku:text("sku",120),specs,published:body.published===true,featured:body.featured===true,updated_at:new Date().toISOString()};
}
