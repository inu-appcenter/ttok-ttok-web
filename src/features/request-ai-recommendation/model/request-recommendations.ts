import type {
  RecommendationRequest,
  RecommendationResult,
} from "./recommendation-contract";
export class RecommendationApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}
async function post(path: string, body: unknown, signal: AbortSignal) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result || !("data" in result))
    throw new RecommendationApiError(
      result?.message || "결과를 불러오지 못했어요. 다시 시도해주세요.",
      response.status,
    );
  return result.data;
}
export async function suggestKeywords(
  interest: string,
  signal: AbortSignal,
): Promise<string[]> {
  return post("/api/recommendations/keywords", { interest }, signal);
}
export async function requestRecommendations(
  input: RecommendationRequest,
  signal: AbortSignal,
): Promise<RecommendationResult> {
  return post("/api/recommendations", input, signal);
}
