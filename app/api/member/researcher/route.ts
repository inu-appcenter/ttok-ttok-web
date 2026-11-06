import { NextResponse } from "next/server";
import { getMyMember } from "@/entities/member/api";
import { authenticatedRequest, authenticatedErrorResponse, AuthenticatedApiError } from "@/shared/api/authenticated-request";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || !("laboratoryId" in body) || typeof body.laboratoryId !== "number" || !Number.isSafeInteger(body.laboratoryId) || body.laboratoryId < 1) {
    return NextResponse.json({ message: "소속 연구실을 선택해주세요." }, { status: 400 });
  }
  try {
    const profile = await getMyMember();
    if (profile.userType !== "FINDER") throw new AuthenticatedApiError("탐색자만 연구생으로 등록할 수 있어요.", 403);
    await authenticatedRequest("/api/researcher", { method: "POST", body: JSON.stringify({ laboratoryId: body.laboratoryId }) });
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return authenticatedErrorResponse(error); }
}

export async function DELETE() {
  try {
    const profile = await getMyMember();
    if (profile.userType !== "RESEARCHER") throw new AuthenticatedApiError("등록된 연구생만 해제할 수 있어요.", 403);
    await authenticatedRequest("/api/researcher/me", { method: "DELETE" });
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return authenticatedErrorResponse(error); }
}
