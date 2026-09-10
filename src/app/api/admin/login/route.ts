import { NextResponse } from "next/server";

const COOKIE_NAME = "donanim_admin_session";

async function createSessionToken() {
  const password = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!password || !sessionSecret) {
    throw new Error(
      "ADMIN_PASSWORD veya ADMIN_SESSION_SECRET tanımlı değil."
    );
  }

  const data = new TextEncoder().encode(
    `${sessionSecret}:${password}`
  );

  const hash = await crypto.subtle.digest(
    "SHA-256",
    data
  );

  return Array.from(
    new Uint8Array(hash)
  )
    .map((byte) =>
      byte.toString(16).padStart(2, "0")
    )
    .join("");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const enteredPassword = String(
      body?.password || ""
    );

    const adminPassword =
      process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Sunucuda ADMIN_PASSWORD tanımlı değil.",
        },
        { status: 500 }
      );
    }

    if (
      !enteredPassword ||
      enteredPassword !== adminPassword
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Şifre hatalı.",
        },
        { status: 401 }
      );
    }

    const token =
      await createSessionToken();

    const response =
      NextResponse.json({
        success: true,
      });

    response.cookies.set(
      COOKIE_NAME,
      token,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 8,
      }
    );

    return response;
  } catch (error: any) {
    console.error(
      "Admin giriş hatası:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Giriş sırasında hata oluştu.",
      },
      { status: 500 }
    );
  }
}
