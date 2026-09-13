import { NextResponse, type NextRequest } from "next/server";

import { ACCESS_TOKEN_COOKIE } from "@/shared/lib/auth/cookies";

const protectedPaths = ["/mypage", "/recommendations"];

export function proxy(request: NextRequest) {
  const hasAccessToken = request.cookies.has(ACCESS_TOKEN_COOKIE);

  if (!hasAccessToken && protectedPaths.includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/mypage", "/recommendations"],
};
