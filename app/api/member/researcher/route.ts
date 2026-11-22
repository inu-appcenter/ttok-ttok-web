import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getMyMember } from "@/entities/member/api";
import {
  saveLabReview,
  toLabReviewInput,
  type LabReviewInput,
} from "@/features/manage-member-profile/api";
import { getOnboardingReviewOptions } from "@/features/onboarding/api";
import { authenticatedRequest, authenticatedErrorResponse, AuthenticatedApiError } from "@/shared/api/authenticated-request";
import { ACCESS_TOKEN_COOKIE } from "@/shared/lib/auth/cookies";

const NO_STORE = { "Cache-Control": "private, no-store" };
const REVIEW_SAVE_FAILED_MESSAGE =
  "코어타임·미팅 빈도·하는 일을 저장하지 못했어요. 정보 수정하기에서 다시 입력해주세요.";
/** 온보딩과 같은 기준으로 하는 일은 최대 3개까지 받는다. */
const MAX_REGISTER_DOINGS = 3;

type RegisterRequest = LabReviewInput & { laboratoryId: number };

function toRegisterRequest(body: unknown): RegisterRequest | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const record = body as Record<string, unknown>;
  const { laboratoryId } = record;
  if (typeof laboratoryId !== "number" || !Number.isSafeInteger(laboratoryId) || laboratoryId < 1) return null;
  const review = toLabReviewInput(record, MAX_REGISTER_DOINGS);
  return review ? { ...review, laboratoryId } : null;
}

// 학부연구생 등록 후 같은 요청에서 코어타임·미팅 빈도·하는 일을 연구실 리뷰로 저장한다.
export async function POST(request: Request) {
  const input = toRegisterRequest(await request.json().catch(() => null));
  if (!input) {
    return NextResponse.json(
      { message: "소속 연구실과 코어타임·미팅 빈도·하는 일을 선택해주세요." },
      { status: 400 },
    );
  }
  try {
    const profile = await getMyMember();
    if (profile.userType !== "FINDER") throw new AuthenticatedApiError("탐색자만 연구생으로 등록할 수 있어요.", 403);

    // 화면 선택지와 같은 서버 선택지 안의 값만 받는다.
    const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
    if (!accessToken) throw new AuthenticatedApiError("로그인이 필요합니다.", 401);
    const options = await getOnboardingReviewOptions(accessToken).catch(() => null);
    if (!options) {
      return NextResponse.json({ message: "선택지를 확인하지 못했어요. 잠시 후 다시 시도해주세요." }, { status: 502 });
    }
    if (
      !options.coreTime.includes(input.coreTime) ||
      !options.weeklyMeeting.includes(input.weeklyMeeting) ||
      !input.doings.every((item) => options.works.includes(item))
    ) {
      return NextResponse.json({ message: "코어타임·미팅 빈도·하는 일을 다시 선택해주세요." }, { status: 400 });
    }

    await authenticatedRequest("/api/researcher", { method: "POST", body: JSON.stringify({ laboratoryId: input.laboratoryId }) });

    try {
      // 방금 등록한 연구생은 리뷰가 없으므로 생성부터 시도하고, 이미 있으면 수정한다.
      await saveLabReview({ coreTime: input.coreTime, weeklyMeeting: input.weeklyMeeting, doings: input.doings });
    } catch (error) {
      if (error instanceof AuthenticatedApiError && error.status === 401) return authenticatedErrorResponse(error);
      const status = error instanceof AuthenticatedApiError ? error.status : undefined;
      const code = error instanceof AuthenticatedApiError ? error.code : undefined;
      // 토큰·회원 정보 없이 실패 단계와 업스트림 상태만 남긴다.
      console.error("[member/researcher] lab review save failed", { stage: "lab-review", status, code });
      // 등록은 이미 반영됐으므로 등록 상태를 함께 알린다.
      return NextResponse.json(
        { message: REVIEW_SAVE_FAILED_MESSAGE, registered: true, ...(code ? { code } : {}) },
        { status: 502, headers: NO_STORE },
      );
    }

    return NextResponse.json({ ok: true }, { headers: NO_STORE });
  } catch (error) { return authenticatedErrorResponse(error); }
}

export async function DELETE() {
  try {
    const profile = await getMyMember();
    if (profile.userType !== "RESEARCHER") throw new AuthenticatedApiError("등록된 연구생만 해제할 수 있어요.", 403);
    await authenticatedRequest("/api/researcher/me", { method: "DELETE" });
    return NextResponse.json({ ok: true }, { headers: NO_STORE });
  } catch (error) { return authenticatedErrorResponse(error); }
}
