import "server-only";
import {supabaseAdmin} from "./supabase-admin";
import {normalizeComparison,type ManualComparison} from "./manual-comparison";
const bucket="editorial-content";
const path="laptop-comparison.json";
export async function readComparison():Promise<ManualComparison|null>{
  const {data,error}=await supabaseAdmin.storage.from(bucket).download(path);
  if(error||!data)return null;
  try{return normalizeComparison(JSON.parse(await data.text()))}catch{return null}
}
export async function saveComparison(document:ManualComparison){
  const storage=supabaseAdmin.storage;
  const {data:existing}=await storage.getBucket(bucket);
  if(!existing){const {error}=await storage.createBucket(bucket,{public:false,allowedMimeTypes:["application/json"],fileSizeLimit:1024*1024});if(error&&!/already exists/i.test(error.message))throw error}
  const {error}=await storage.from(bucket).upload(path,JSON.stringify(document),{contentType:"application/json",upsert:true,cacheControl:"0"});
  if(error)throw error;
}
