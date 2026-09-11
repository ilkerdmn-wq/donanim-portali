import { NextRequest, NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/app/lib/admin-auth";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    authenticated: await isAdminAuthenticated(request),
  });
}
