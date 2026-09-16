import { NextResponse } from "next/server";

import { getOnboardingReviewOptions } from "@/features/onboarding/api";

const ERROR_MESSAGE = "온보딩 선택지를 불러오지 못했습니다.";

export async function GET() {
  try {
    return NextResponse.json(await getOnboardingReviewOptions());
  } catch {
    return NextResponse.json({ message: ERROR_MESSAGE }, { status: 502 });
  }
}
