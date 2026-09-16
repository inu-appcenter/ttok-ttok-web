import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getOnboardingReviewOptions } from "@/features/onboarding/api";
import { ACCESS_TOKEN_COOKIE } from "@/shared/lib/auth/cookies";

const ERROR_MESSAGE = "온보딩 선택지를 불러오지 못했습니다.";

export async function GET() {
  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return NextResponse.json(
      { code: "TOKEN_INVALID", message: "로그인이 필요합니다." },
      { status: 401 },
    );
  }

  try {
    return NextResponse.json(await getOnboardingReviewOptions(accessToken));
  } catch {
    return NextResponse.json({ message: ERROR_MESSAGE }, { status: 502 });
  }
}
