import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { clearAuthCookies } from "@/shared/lib/auth/clear-auth-cookies";
import { ACCESS_TOKEN_COOKIE } from "@/shared/lib/auth/cookies";

const WITHDRAWAL_ERROR_MESSAGE =
  "회원 탈퇴를 완료하지 못했습니다. 잠시 후 다시 시도해주세요.";

export async function DELETE() {
  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return clearAuthCookies(
      NextResponse.json(
        { message: "로그인이 필요합니다.", requiresLogin: true },
        { status: 401 },
      ),
    );
  }

  const apiBaseUrl = process.env.API_BASE_URL;

  if (!apiBaseUrl) {
    return NextResponse.json(
      { message: WITHDRAWAL_ERROR_MESSAGE },
      { status: 500 },
    );
  }

  try {
    const upstreamResponse = await fetch(
      `${apiBaseUrl.replace(/\/$/, "")}/api/member`,
      {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        method: "DELETE",
      },
    );

    if (upstreamResponse.ok) {
      return clearAuthCookies(NextResponse.json({ ok: true }));
    }

    if (upstreamResponse.status === 401) {
      return clearAuthCookies(
        NextResponse.json(
          { message: "로그인 정보가 만료되었습니다.", requiresLogin: true },
          { status: 401 },
        ),
      );
    }

    const response: { message?: unknown } = await upstreamResponse
      .json()
      .catch(() => ({}));

    return NextResponse.json(
      {
        message:
          typeof response.message === "string"
            ? response.message
            : WITHDRAWAL_ERROR_MESSAGE,
      },
      { status: upstreamResponse.status === 404 ? 404 : 502 },
    );
  } catch {
    return NextResponse.json(
      { message: WITHDRAWAL_ERROR_MESSAGE },
      { status: 502 },
    );
  }
}
