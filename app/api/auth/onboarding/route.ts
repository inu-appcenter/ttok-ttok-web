import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ACCESS_TOKEN_COOKIE } from "@/shared/lib/auth/cookies";

const API_ERROR_MESSAGE = "온보딩 저장 중 문제가 발생했습니다.";

export async function POST(request: Request) {
  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return NextResponse.json(
      { code: "TOKEN_INVALID", message: "로그인이 필요합니다." },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { code: "INVALID_INPUT", message: "온보딩 정보를 확인해주세요." },
      { status: 400 },
    );
  }

  const apiBaseUrl = process.env.API_BASE_URL;
  if (!apiBaseUrl) {
    return NextResponse.json({ message: API_ERROR_MESSAGE }, { status: 500 });
  }

  try {
    const upstreamResponse = await fetch(
      `${apiBaseUrl.replace(/\/$/, "")}/api/onboarding`,
      {
        body: JSON.stringify(body),
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        method: "POST",
      },
    );
    const response: unknown = await upstreamResponse.json().catch(() => ({}));

    if (upstreamResponse.ok) {
      return NextResponse.json(response);
    }

    const status = [400, 401, 403, 404].includes(upstreamResponse.status)
      ? upstreamResponse.status
      : 502;

    return NextResponse.json(response, { status });
  } catch {
    return NextResponse.json({ message: API_ERROR_MESSAGE }, { status: 502 });
  }
}
