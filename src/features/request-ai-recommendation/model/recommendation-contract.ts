export type RecommendationRequest = {
  interest: string;
  selectedKeywords: string[];
};
export type Recommendation = {
  id: number;
  name: string;
  department: string;
  professor: string;
  tags: string[];
  reasons: string[];
};
export type RecommendationResult = {
  noMatch: boolean;
  recommendations: Recommendation[];
};

export function validInterest(value: unknown): value is string {
  return typeof value === "string" && !!value.trim() && value.length <= 300;
}
export function validSelectedKeywords(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length <= 3 &&
    value.every(
      (item) => typeof item === "string" && !!item.trim() && item.length <= 30,
    ) &&
    new Set(value).size === value.length
  );
}
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("추천 응답이 올바르지 않습니다.");
  return value as Record<string, unknown>;
}
function text(value: unknown): string {
  if (typeof value !== "string" || !value.trim())
    throw new Error("추천 응답이 올바르지 않습니다.");
  return value.trim();
}
function strings(value: unknown): string[] {
  if (!Array.isArray(value)) throw new Error("추천 응답이 올바르지 않습니다.");
  return [...new Set(value.map(text))];
}
export function parseSuggestedKeywords(value: unknown): string[] {
  const keywords = strings(object(value).keywords);
  if (keywords.length > 5 || keywords.some((item) => item.length > 30))
    throw new Error("키워드 응답이 올바르지 않습니다.");
  return keywords;
}
export function parseRecommendationResult(
  value: unknown,
): RecommendationResult {
  const data = object(value);
  if (
    typeof data.noMatch !== "boolean" ||
    !Array.isArray(data.recommendations) ||
    data.recommendations.length > 3 ||
    data.noMatch !== (data.recommendations.length === 0)
  )
    throw new Error("추천 응답이 올바르지 않습니다.");
  const ids = new Set<number>();
  const recommendations = data.recommendations.map((value) => {
    const item = object(value);
    if (
      typeof item.laboratoryId !== "number" ||
      !Number.isSafeInteger(item.laboratoryId) ||
      item.laboratoryId < 1 ||
      ids.has(item.laboratoryId)
    )
      throw new Error("추천 연구실 ID가 올바르지 않습니다.");
    ids.add(item.laboratoryId);
    return {
      id: item.laboratoryId,
      name: text(item.labName),
      department: text(item.department),
      professor: text(item.professorName),
      tags: strings(item.keywords),
      reasons: item.reason === null ? [] : [text(item.reason)],
    };
  });
  return { noMatch: data.noMatch, recommendations };
}
