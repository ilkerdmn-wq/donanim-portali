import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "donanim_admin_session";

async function createExpectedToken() {
  const password = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!password || !sessionSecret) {
    return null;
  }

  const data = new TextEncoder().encode(
    `${sessionSecret}:${password}`
  );

  const hash = await crypto.subtle.digest(
    "SHA-256",
    data
  );

  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function GET(request: NextRequest) {
  try {
    const expectedToken = await createExpectedToken();

    if (!expectedToken) {
      return NextResponse.json(
        { authenticated: false },
        { status: 200 }
      );
    }

    const currentToken =
      request.cookies.get(COOKIE_NAME)?.value || "";

    return NextResponse.json({
      authenticated: currentToken === expectedToken,
    });
  } catch (error) {
    console.error("Admin oturum kontrol hatası:", error);

    return NextResponse.json(
      { authenticated: false },
      { status: 200 }
    );
  }
}
