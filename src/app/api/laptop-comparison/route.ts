import {NextResponse} from "next/server";
import {readComparison} from "@/app/lib/manual-comparison-server";
export const dynamic="force-dynamic";
export async function GET() {
  try {const document=await readComparison();return NextResponse.json({document:document?.published?document:null},{headers:{"Cache-Control":"no-store"}});} catch {return NextResponse.json({document:null},{headers:{"Cache-Control":"no-store"}});}
}
