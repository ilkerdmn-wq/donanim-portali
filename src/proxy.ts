import {
  NextRequest,
  NextResponse,
} from "next/server";

const COOKIE_NAME =
  "donanim_admin_session";

async function createExpectedToken() {
  const password =
    process.env.ADMIN_PASSWORD;

  const sessionSecret =
    process.env.ADMIN_SESSION_SECRET;

  if (
    !password ||
    !sessionSecret
  ) {
    return null;
  }

  const data =
    new TextEncoder().encode(
      `${sessionSecret}:${password}`
    );

  const hash =
    await crypto.subtle.digest(
      "SHA-256",
      data
    );

  return Array.from(
    new Uint8Array(hash)
  )
    .map((byte) =>
      byte
        .toString(16)
        .padStart(2, "0")
    )
    .join("");
}

export async function proxy(
  request: NextRequest
) {
  const pathname =
    request.nextUrl.pathname;

  if (
    pathname ===
    "/yonetim/giris"
  ) {
    return NextResponse.next();
  }

  const expectedToken =
    await createExpectedToken();

  const currentToken =
    request.cookies.get(
      COOKIE_NAME
    )?.value;

  if (
    !expectedToken ||
    !currentToken ||
    currentToken !==
      expectedToken
  ) {
    const loginUrl =
      new URL(
        "/yonetim/giris",
        request.url
      );

    return NextResponse.redirect(
      loginUrl
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/yonetim/:path*",
  ],
};
