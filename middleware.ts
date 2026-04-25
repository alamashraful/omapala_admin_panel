import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { hasAdminAccessFromToken } from "@/lib/auth";

const ADMIN_BYPASS_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_ADMIN_BYPASS === "true";

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (ADMIN_BYPASS_ENABLED) {
    return NextResponse.next();
  }

  const token = request.cookies.get("omapala_access_token")?.value;

  if (!token) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!hasAdminAccessFromToken(token)) {
    const deniedUrl = new URL("/", request.url);
    deniedUrl.searchParams.set("reason", "admin_access_required");
    return NextResponse.redirect(deniedUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};
