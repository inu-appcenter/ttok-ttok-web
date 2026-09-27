import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { clearAuthCookies } from "@/shared/lib/auth/clear-auth-cookies";
import { ACCESS_TOKEN_COOKIE } from "@/shared/lib/auth/cookies";

const LOGOUT_ERROR_MESSAGE =
  "로그아웃하지 못했습니다. 잠시 후 다시 시도해주세요.";

export async function POST() {
  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return clearAuthCookies(NextResponse.json({ ok: true }));
  }

  const apiBaseUrl = process.env.API_BASE_URL;

  if (!apiBaseUrl) {
    return NextResponse.json(
      { message: LOGOUT_ERROR_MESSAGE },
      { status: 500 },
    );
  }

  try {
    const upstreamResponse = await fetch(
      `${apiBaseUrl.replace(/\/$/, "")}/api/member/logout`,
      {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        method: "POST",
      },
    );

    if (upstreamResponse.ok || upstreamResponse.status === 401) {
      return clearAuthCookies(NextResponse.json({ ok: true }));
    }

    return NextResponse.json(
      { message: LOGOUT_ERROR_MESSAGE },
      { status: 502 },
    );
  } catch {
    return NextResponse.json(
      { message: LOGOUT_ERROR_MESSAGE },
      { status: 502 },
    );
  }
}
