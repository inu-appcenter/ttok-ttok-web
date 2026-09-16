import type { LabSummary, LabSummaryPage } from "@/entities/lab";

const ERROR_MESSAGE = "연구실을 불러오지 못했습니다.";

type SearchResponse = LabSummaryPage | { message?: unknown };

export async function searchOnboardingLaboratories(
  keyword: string,
): Promise<LabSummary[]> {
  const normalizedKeyword = keyword.trim();

  if (!normalizedKeyword) {
    return [];
  }

  const response = await fetch(
    `/api/onboarding/laboratories?q=${encodeURIComponent(normalizedKeyword)}`,
  );
  const body: SearchResponse = await response.json().catch(() => ({}));

  if (!response.ok || !("content" in body) || !Array.isArray(body.content)) {
    const message = "message" in body && typeof body.message === "string"
      ? body.message
      : ERROR_MESSAGE;

    throw new Error(message);
  }

  return body.content;
}
