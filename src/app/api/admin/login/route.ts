import { NextResponse } from "next/server";

import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSessionToken,
  passwordMatches,
} from "@/app/lib/admin-auth";
import { checkRateLimit, getClientIdentifier } from "@/app/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit(`admin-login:${clientId}`, 5, 15 * 60 * 1000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Çok fazla giriş denemesi. Lütfen daha sonra tekrar deneyin." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
      );
    }

    const body = await request.json();
    const enteredPassword = String(body?.password || "");

    if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_SECRET) {
      return NextResponse.json(
        { success: false, error: "Yönetici oturum ayarları sunucuda eksik." },
        { status: 500 }
      );
    }

    if (!(await passwordMatches(enteredPassword))) {
      return NextResponse.json(
        { success: false, error: "Şifre hatalı." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(ADMIN_COOKIE_NAME, await createAdminSessionToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (error) {
    console.error("Admin giriş hatası:", error);
    return NextResponse.json(
      { success: false, error: "Giriş sırasında hata oluştu." },
      { status: 500 }
    );
  }
}
