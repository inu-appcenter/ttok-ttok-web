import type { OnboardingAnswers } from "../model/onboarding-steps";

export type OnboardingRequest = {
  coffeeChatAllowed?: boolean;
  contactType?: "EMAIL" | "KAKAO_TALK";
  contactValue?: string;
  coreTime?: string;
  doings?: string[];
  laboratoryId?: number;
  purpose: "EXPLORER" | "RESEARCHER";
  weeklyMeeting?: string;
};

type OnboardingResponse = {
  message?: unknown;
};

type CompleteOnboardingResult =
  | { ok: true }
  | { message: string; ok: false };

const ERROR_MESSAGE = "온보딩 저장 중 문제가 발생했습니다.";

function toRequest(answers: OnboardingAnswers): OnboardingRequest {
  const isExplorer = answers.purpose === "연구실을 알아보고 있어요";
  const coffeeChatAllowed = answers.coffeeChat === "네, 좋아요";
  const contactValue =
    typeof answers.contact === "string" ? answers.contact : undefined;
  const coreTime =
    typeof answers.coreTime === "string" ? answers.coreTime : undefined;
  const doings = Array.isArray(answers.activities)
    ? answers.activities
    : undefined;
  const laboratoryId =
    typeof answers.lab === "string" ? Number(answers.lab) : undefined;
  const weeklyMeeting =
    typeof answers.meetingFrequency === "string"
      ? answers.meetingFrequency
      : undefined;

  return {
    ...(isExplorer
      ? {}
      : {
          coffeeChatAllowed,
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
    purpose: isExplorer ? "EXPLORER" : "RESEARCHER",
  };
}

export async function completeOnboarding(
  answers: OnboardingAnswers,
): Promise<CompleteOnboardingResult> {
  const request: OnboardingRequest = toRequest(answers);

  if (
    request.purpose === "RESEARCHER" &&
    (!request.laboratoryId || Number.isNaN(request.laboratoryId))
  ) {
    return { message: "연구실 정보를 다시 선택해주세요.", ok: false };
  }

  try {
    const response = await fetch("/api/auth/onboarding", {
      body: JSON.stringify(request),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (response.ok) {
      return { ok: true };
    }

    const result: OnboardingResponse = await response.json().catch(() => ({}));
    return {
      message:
        typeof result.message === "string" ? result.message : ERROR_MESSAGE,
      ok: false,
    };
  } catch {
    return { message: ERROR_MESSAGE, ok: false };
  }
}
