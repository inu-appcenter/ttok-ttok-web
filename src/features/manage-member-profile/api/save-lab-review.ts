import "server-only";

import {
  AuthenticatedApiError,
  authenticatedRequest,
} from "@/shared/api/authenticated-request";

/** 서버 LabReviewRequestDto 제약: coreTime·weeklyMeeting 30자, doings 1~20개 */
export const LAB_REVIEW_TEXT_MAX_LENGTH = 30;
export const LAB_REVIEW_MAX_DOINGS = 20;

export type LabReviewInput = {
  coreTime: string;
  doings: string[];
  weeklyMeeting: string;
};

function toText(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed && trimmed.length <= LAB_REVIEW_TEXT_MAX_LENGTH
    ? trimmed
    : null;
}

/** 요청 본문에서 연구실 리뷰 값을 검증한다. 하나라도 어긋나면 null. */
export function toLabReviewInput(
  body: Record<string, unknown>,
  maxDoings = LAB_REVIEW_MAX_DOINGS,
): LabReviewInput | null {
  const coreTime = toText(body.coreTime);
  const weeklyMeeting = toText(body.weeklyMeeting);
  if (!coreTime || !weeklyMeeting || !Array.isArray(body.doings)) return null;
  const doings = body.doings.map(toText);
  if (
    doings.length < 1 ||
    doings.length > Math.min(maxDoings, LAB_REVIEW_MAX_DOINGS) ||
    !doings.every((item): item is string => item !== null) ||
    new Set(doings).size !== doings.length
  )
    return null;
  return { coreTime, doings, weeklyMeeting };
}

// Swagger 예시는 ...EXISTS, 실제 서버 ErrorCode 값은 ...EXIST라서 둘 다 받는다.
const ALREADY_EXISTS_CODES = new Set([
  "LAB_REVIEW_ALREADY_EXIST",
  "LAB_REVIEW_ALREADY_EXISTS",
]);

function isApiError(error: unknown, status: number, codes: Set<string>) {
  return (
    error instanceof AuthenticatedApiError &&
    error.status === status &&
    error.code !== undefined &&
    codes.has(error.code)
  );
}

/**
 * 연구실 리뷰를 생성하거나 수정한다. 회원 정보의 제공 이력이 실제 서버 상태와
 * 어긋나도 이미 있음(400)·없음(404) 응답을 보고 반대 메서드로 한 번만 재시도한다.
 */
export async function saveLabReview(
  input: LabReviewInput,
  { preferUpdate = false }: { preferUpdate?: boolean } = {},
) {
  const body = JSON.stringify(input);
  const send = (method: "PATCH" | "POST") =>
    authenticatedRequest("/api/lab-review", { body, method });
  try {
    return await send(preferUpdate ? "PATCH" : "POST");
  } catch (error) {
    if (!preferUpdate && isApiError(error, 400, ALREADY_EXISTS_CODES))
      return send("PATCH");
    if (
      preferUpdate &&
      isApiError(error, 404, new Set(["LAB_REVIEW_NOT_FOUND"]))
    )
      return send("POST");
    throw error;
  }
}
