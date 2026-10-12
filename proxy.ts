import { NextResponse, type NextRequest } from "next/server";

import { ACCESS_TOKEN_COOKIE } from "@/shared/lib/auth/cookies";
import { clearAuthCookies } from "@/shared/lib/auth/clear-auth-cookies";
import {
  getSessionStatus,
  requiresCompleteSession,
} from "@/shared/lib/auth/session-status";
import { getLabReturnPath } from "@/shared/lib/auth/return-path";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const needsSession = requiresCompleteSession(path);
  if (!accessToken) {
    return needsSession
      ? NextResponse.redirect(new URL("/login", request.url))
      : NextResponse.next();
  }
  const session = await getSessionStatus(accessToken, process.env.API_BASE_URL);
  if (session.state === "invalid") {
    return clearAuthCookies(
      NextResponse.redirect(new URL("/login", request.url)),
    );
  }
  if (session.state === "unavailable") {
    if (!needsSession) return NextResponse.next();
    const retryPage = new URL("/auth-unavailable", request.url);
    retryPage.searchParams.set("returnTo", path);
    return NextResponse.rewrite(retryPage, { status: 503 });
  }
  if (session.isNew && path !== "/onboarding") {
    const onboarding = new URL("/onboarding", request.url);
    const returnTo = getLabReturnPath(path);
    if (returnTo) onboarding.searchParams.set("returnTo", returnTo);
    return NextResponse.redirect(onboarding);
  }
  if (!session.isNew && (path === "/onboarding" || path === "/login")) {
    const returnTo = getLabReturnPath(
      request.nextUrl.searchParams.get("returnTo"),
    );
    return NextResponse.redirect(new URL(returnTo ?? "/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/search",
    "/labs/:path*",
    "/mypage/:path*",
    "/recommendations",
    "/onboarding",
    "/login",
    "/terms",
    "/privacy",
  ],
};
