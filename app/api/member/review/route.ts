import { NextResponse } from "next/server";
import { getMyMember } from "@/entities/member/api";
import {
  saveLabReview,
  toLabReviewInput,
} from "@/features/manage-member-profile/api";
import {
  authenticatedErrorResponse,
  AuthenticatedApiError,
} from "@/shared/api/authenticated-request";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const record =
    body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : null;
  const laboratoryId = record?.laboratoryId;
  // 서버 계약상 하는 일은 1~20개가 필요하므로 빈 목록은 업스트림 호출 전에 거부한다.
  const input = record ? toLabReviewInput(record) : null;
  if (
    !input ||
    (laboratoryId !== undefined &&
      (typeof laboratoryId !== "number" ||
        !Number.isSafeInteger(laboratoryId) ||
        laboratoryId < 1))
  )
    return NextResponse.json(
      { message: "코어타임·미팅·하는 일을 확인해주세요." },
      { status: 400 },
    );
  try {
    const profile = await getMyMember();
    if (
      profile.userType !== "RESEARCHER" ||
      !profile.researchProfile?.laboratoryId ||
      (laboratoryId !== undefined &&
        laboratoryId !== profile.researchProfile.laboratoryId)
    )
      throw new AuthenticatedApiError(
        "연결된 연구실의 연구생만 수정할 수 있어요.",
        403,
      );
    await saveLabReview(input, { preferUpdate: profile.hasContributedReview });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return authenticatedErrorResponse(error);
  }
}
