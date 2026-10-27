import { NextResponse, type NextRequest } from "next/server";

import { ACCESS_TOKEN_COOKIE } from "@/shared/lib/auth/cookies";
import { clearAuthCookies } from "@/shared/lib/auth/clear-auth-cookies";
import {
  getSessionStatus,
  requiresCompleteSession,
} from "@/shared/lib/auth/session-status";
import {
  getLabReturnPath,
  getLoginNotice,
  getLoginPath,
  LOGIN_NOTICE_PARAM,
  LOGIN_REQUIRED_NOTICE,
} from "@/shared/lib/auth/return-path";

// 보호 경로에서 보낸 로그인 이동에만 안내 값을 붙이고, 로그인 화면 자체는 기존 허용 값만 유지한다.
function getLoginRedirect(request: NextRequest, needsSession: boolean) {
  const { pathname, searchParams } = request.nextUrl;
  const loginPath =
    pathname === "/login"
      ? getLoginPath({
          notice: getLoginNotice(searchParams.get(LOGIN_NOTICE_PARAM)),
          returnTo: searchParams.get("returnTo"),
        })
      : getLoginPath({
          notice: needsSession ? LOGIN_REQUIRED_NOTICE : undefined,
          returnTo: pathname,
        });
  return NextResponse.redirect(new URL(loginPath, request.url));
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const needsSession = requiresCompleteSession(path);
  if (!accessToken) {
    return needsSession
      ? getLoginRedirect(request, needsSession)
      : NextResponse.next();
  }
  const session = await getSessionStatus(accessToken, process.env.API_BASE_URL);
  if (session.state === "invalid") {
    return clearAuthCookies(getLoginRedirect(request, needsSession));
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
