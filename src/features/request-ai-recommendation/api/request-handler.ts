import "server-only";
import { NextResponse } from "next/server";
import {
  authenticatedRequest,
  authenticatedErrorResponse,
  AuthenticatedApiError,
} from "@/shared/api/authenticated-request";
import {
  validInterest,
  validSelectedKeywords,
  parseSuggestedKeywords,
  parseRecommendationResult,
} from "../model/recommendation-contract";

export async function handleRecommendationRequest(
  request: Request,
  keywordsOnly = false,
) {
  const body = await request.json().catch(() => null);
  if (
    !body ||
    !validInterest(body.interest) ||
    (!keywordsOnly && !validSelectedKeywords(body.selectedKeywords ?? []))
  )
    return NextResponse.json(
      {
        message:
          "관심 연구는 300자, 키워드는 최대 3개·각 30자 이내로 입력해주세요.",
      },
      { status: 400 },
    );
  try {
    const raw = await authenticatedRequest(
      `/api/chat/research-lab${keywordsOnly ? "/keywords" : ""}`,
      {
        method: "POST",
        signal: AbortSignal.any([request.signal, AbortSignal.timeout(60000)]),
        body: JSON.stringify({
          interest: body.interest.trim(),
          ...(!keywordsOnly
            ? { selectedKeywords: body.selectedKeywords ?? [] }
            : {}),
        }),
      },
    );
    let data;
    try {
      data = keywordsOnly
        ? parseSuggestedKeywords(raw)
        : parseRecommendationResult(raw);
    } catch {
      throw new AuthenticatedApiError(
        "추천 응답을 확인하지 못했어요. 다시 시도해주세요.",
        502,
      );
    }
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return authenticatedErrorResponse(error);
  }
}
