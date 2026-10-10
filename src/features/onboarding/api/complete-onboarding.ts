import type { OnboardingAnswers } from "../model/onboarding-steps";

export type OnboardingRequest = {
  coffeeChatAllowed?: boolean;
  contactType?: "EMAIL" | "KAKAO_TALK";
  contactValue?: string;
  coreTime?: string;
  doings?: string[];
  laboratoryId?: number;
  purpose: "FINDER" | "RESEARCHER";
  weeklyMeeting?: string;
};

type OnboardingResponse = {
  code?: unknown;
  message?: unknown;
};

type CompleteOnboardingResult = { ok: true } | { message: string; ok: false };

const ERROR_MESSAGE = "온보딩 저장 중 문제가 발생했습니다.";
const ERROR_MESSAGES: Record<string, string> = {
  LABORATORY_NOT_FOUND: "선택한 연구실을 찾을 수 없습니다. 다시 선택해주세요.",
  ONBOARDING_ALREADY_DONE: "이미 온보딩을 완료했습니다.",
  TOKEN_INVALID: "로그인이 만료되었습니다. 다시 로그인해주세요.",
};

export function toOnboardingRequest(
  answers: OnboardingAnswers,
): OnboardingRequest {
  const isExplorer = answers.purpose === "연구실을 알아보고 있어요";
  const coffeeChatAllowed = answers.coffeeChat === "네, 좋아요";
  const contactValue =
    typeof answers.contact === "string" ? answers.contact.trim() : undefined;
  const coreTime =
    typeof answers.coreTime === "string" ? answers.coreTime : undefined;
  const doings = Array.isArray(answers.activities)
    ? answers.activities
    : undefined;
  const laboratoryId = answers.laboratoryId;
  const weeklyMeeting =
    typeof answers.meetingFrequency === "string"
      ? answers.meetingFrequency
      : undefined;

  return {
    coffeeChatAllowed: isExplorer ? false : coffeeChatAllowed,
    ...(isExplorer
      ? {}
      : {
          ...(coffeeChatAllowed && contactValue
            ? {
                contactType: contactValue.startsWith("https://open.kakao.com/")
                  ? "KAKAO_TALK"
                  : "EMAIL",
                contactValue,
              }
            : {}),
          coreTime,
          doings,
          laboratoryId,
          weeklyMeeting,
        }),
    purpose: isExplorer ? "FINDER" : "RESEARCHER",
  };
}

function getRequestValidationError(request: OnboardingRequest) {
  if (request.purpose === "FINDER") {
    return null;
  }

  if (!request.laboratoryId || !Number.isInteger(request.laboratoryId)) {
    return "연구실 정보를 다시 선택해주세요.";
  }

  if (!request.coreTime || !request.weeklyMeeting || !request.doings?.length) {
    return "연구실 활동 정보를 모두 선택해주세요.";
  }

  if (request.coffeeChatAllowed && !request.contactValue) {
    return "커피챗 연락처를 입력해주세요.";
  }

  return null;
}

function getErrorMessage(response: OnboardingResponse) {
  if (typeof response.code === "string" && ERROR_MESSAGES[response.code]) {
    return ERROR_MESSAGES[response.code];
  }

  return typeof response.message === "string"
    ? response.message
    : ERROR_MESSAGE;
}

export async function completeOnboarding(
  answers: OnboardingAnswers,
): Promise<CompleteOnboardingResult> {
  const request = toOnboardingRequest(answers);
  const validationError = getRequestValidationError(request);

  if (validationError) {
    return { message: validationError, ok: false };
  }

  try {
    const response = await fetch("/api/auth/onboarding", {
      body: JSON.stringify({
        ...request,
        ...(request.purpose === "FINDER" && answers.departmentCode
          ? { departmentCode: answers.departmentCode }
          : {}),
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (response.ok) {
      return { ok: true };
    }

    const result: OnboardingResponse = await response.json().catch(() => ({}));
    return { message: getErrorMessage(result), ok: false };
  } catch {
    return { message: ERROR_MESSAGE, ok: false };
  }
}
