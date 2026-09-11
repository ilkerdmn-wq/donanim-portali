import {
  NextRequest,
  NextResponse,
} from "next/server";
import { isAdminAuthenticated } from "@/app/lib/admin-auth";

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

  if (!(await isAdminAuthenticated(request))) {
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
