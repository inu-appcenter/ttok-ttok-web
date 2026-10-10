import { NextResponse } from "next/server";
import { getMyBookmarks } from "@/entities/bookmark/api";
import { authenticatedRequest, authenticatedErrorResponse } from "@/shared/api/authenticated-request";

export async function GET() {
  try { return NextResponse.json({ data: await getMyBookmarks() }, { headers: { "Cache-Control": "private, no-store" } }); }
  catch (error) { return authenticatedErrorResponse(error); }
}
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || !Number.isSafeInteger(body.laboratoryId) || body.laboratoryId < 1) return NextResponse.json({ message: "연구실 ID가 올바르지 않습니다." }, { status: 400 });
  try {
    await authenticatedRequest(`/api/bookmark?laboratoryId=${body.laboratoryId}`, { method: "POST" });
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return authenticatedErrorResponse(error); }
}
