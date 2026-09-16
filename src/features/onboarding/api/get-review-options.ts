import "server-only";

import type { OnboardingReviewOptions } from "../model/review-options";

const ERROR_MESSAGE = "온보딩 선택지를 불러오지 못했습니다.";

function getApiBaseUrl() {
  const apiBaseUrl = process.env.API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error(ERROR_MESSAGE);
  }

  return apiBaseUrl.replace(/\/$/, "");
}

function getStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    return null;
  }

  return value;
}

function toReviewOptions(value: unknown): OnboardingReviewOptions {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(ERROR_MESSAGE);
  }

  const data = value as Record<string, unknown>;
  const coreTime = getStringArray(data.coreTime);
  const weeklyMeeting = getStringArray(data.weeklyMeeting);
  const works = getStringArray(data.works);

  if (!coreTime || !weeklyMeeting || !works) {
    throw new Error(ERROR_MESSAGE);
  }

  return { coreTime, weeklyMeeting, works };
}

export async function getOnboardingReviewOptions(
  accessToken: string,
): Promise<OnboardingReviewOptions> {
  let response: Response;

  try {
    response = await fetch(`${getApiBaseUrl()}/api/lab-review/options`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      next: { revalidate: 3600 },
    });
  } catch {
    throw new Error(ERROR_MESSAGE);
  }

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok || !body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error(ERROR_MESSAGE);
  }

  const responseBody = body as Record<string, unknown>;

  return toReviewOptions(responseBody.data);
}
