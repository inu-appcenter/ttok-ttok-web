import { NextResponse } from "next/server";
import { getMyMember } from "@/entities/member/api";
import {
  authenticatedRequest,
  authenticatedErrorResponse,
  AuthenticatedApiError,
} from "@/shared/api/authenticated-request";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (
    !body ||
    typeof body.coreTime !== "string" ||
    !body.coreTime.trim() ||
    body.coreTime.length > 30 ||
    typeof body.weeklyMeeting !== "string" ||
    !body.weeklyMeeting.trim() ||
    body.weeklyMeeting.length > 30 ||
    !Array.isArray(body.doings) ||
    body.doings.length > 20 ||
    !body.doings.every(
      (item: unknown) => typeof item === "string" && item.trim(),
    ) ||
    new Set(body.doings.map((item: string) => item.trim())).size !==
      body.doings.length
  )
    return NextResponse.json(
      { message: "코어타임·미팅·하는 일을 확인해주세요." },
      { status: 400 },
    );
  try {
    const profile = await getMyMember();
    if (
      profile.userType !== "RESEARCHER" ||
      !profile.researchProfile?.laboratoryId
    )
      throw new AuthenticatedApiError(
        "연결된 연구실의 연구생만 수정할 수 있어요.",
        403,
      );
    await authenticatedRequest("/api/lab-review", {
      method: profile.hasContributedReview ? "PATCH" : "POST",
      body: JSON.stringify({
        coreTime: body.coreTime.trim(),
        weeklyMeeting: body.weeklyMeeting.trim(),
        doings: body.doings.map((item: string) => item.trim()),
      }),
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return authenticatedErrorResponse(error);
  }
}
