import { NextResponse } from "next/server";
import { getMyMember } from "@/entities/member/api";
import {
  authenticatedRequest,
  authenticatedErrorResponse,
  AuthenticatedApiError,
} from "@/shared/api/authenticated-request";

async function save(request: Request) {
  const body = await request.json().catch(() => null);
  if (
    !body ||
    !["EMAIL", "KAKAO_TALK"].includes(body.contactType) ||
    typeof body.contactValue !== "string" ||
    !body.contactValue.trim()
  )
    return NextResponse.json(
      { message: "연락처를 입력해주세요." },
      { status: 400 },
    );
  const contactValue = body.contactValue.trim();
  const valid =
    body.contactType === "EMAIL"
      ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactValue)
      : /^https:\/\/open\.kakao\.com\/[^\s]+$/.test(contactValue);
  if (!valid)
    return NextResponse.json(
      { message: "이메일 또는 카카오 오픈채팅 주소를 확인해주세요." },
      { status: 400 },
    );
  try {
    const profile = await getMyMember(),
      research = profile.researchProfile;
    if (profile.userType !== "RESEARCHER" || !research?.laboratoryId)
      throw new AuthenticatedApiError(
        "연구실에 등록된 연구생만 설정할 수 있어요.",
        403,
      );
    const current = research.coffeeChat;
    const data = await authenticatedRequest(
      current ? `/api/coffee-chat/${current.id}` : "/api/coffee-chat",
      {
        method: current ? "PATCH" : "POST",
        body: JSON.stringify({
          contactType: body.contactType,
          contactValue,
          ...(!current ? { laboratoryId: research.laboratoryId } : {}),
        }),
      },
    );
    if (
      !data ||
      typeof data !== "object" ||
      !("id" in data) ||
      typeof data.id !== "number" ||
      !Number.isSafeInteger(data.id) ||
      data.id < 1 ||
      !("contactValue" in data) ||
      typeof data.contactValue !== "string" ||
      !data.contactValue.trim()
    )
      throw new AuthenticatedApiError(
        "변경 후 연락처 정보를 확인하지 못했어요. 다시 불러와주세요.",
        502,
      );
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return authenticatedErrorResponse(error);
  }
}
export const POST = save;
export const PATCH = save;
export async function DELETE() {
  try {
    const profile = await getMyMember();
    if (profile.userType !== "RESEARCHER")
      throw new AuthenticatedApiError("연구생만 설정할 수 있어요.", 403);
    const current = profile.researchProfile?.coffeeChat;
    if (current)
      await authenticatedRequest(`/api/coffee-chat/${current.id}`, {
        method: "DELETE",
      });
    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return authenticatedErrorResponse(error);
  }
}
