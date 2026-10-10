type OnboardingQuestionId =
  | "purpose"
  | "department"
  | "interest"
  | "lab"
  | "coreTime"
  | "meetingFrequency"
  | "activities"
  | "coffeeChat"
  | "contact";

type OnboardingQuestion = {
  helper?: string;
  id: OnboardingQuestionId;
  options?: Array<{ label: string; value: string }>;
  question: string;
  type: "choice" | "lab-search" | "multi-choice" | "text";
};

type OnboardingAnswerValue = string | string[];
type OnboardingAnswers = Partial<
  Record<OnboardingQuestionId, OnboardingAnswerValue>
> & {
  laboratoryId?: number;
  departmentCode?: string;
};

const ONBOARDING_PURPOSE = {
  explore: "연구실을 알아보고 있어요",
  member: "학부연구생 / 대학원생이에요",
} as const;

const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: "purpose",
    question: "어떤 목적으로 방문하셨나요?",
    helper: "선택하신 역할에 맞춰 가장 적합한 연구실 정보를 보여드릴게요",
    type: "choice",
    options: [
      { label: ONBOARDING_PURPOSE.explore, value: ONBOARDING_PURPOSE.explore },
      {
        label: ONBOARDING_PURPOSE.member,
        value: ONBOARDING_PURPOSE.member,
      },
    ],
  },
  {
    id: "lab",
    question: "좋아요! 소속된 연구실이 어디신가요?",
    helper: "연구실 이름이나 교수님 성함을 입력하면 찾을 수 있어요",
    type: "lab-search",
  },
  { id: "coreTime", question: "연구실에 코어타임이 있나요?", type: "choice" },
  {
    id: "meetingFrequency",
    question: "미팅은 얼마나 자주 갖나요?",
    type: "choice",
  },
  {
    id: "activities",
    question: "마지막으로, 주로 하는 일을 알려주세요!",
    helper: "최대 3개 선택할 수 있어요",
    type: "multi-choice",
  },
  {
    id: "coffeeChat",
    question: "커피챗을 허용하시겠어요?",
    helper: "연구실이 궁금한 후배들에게 자세한 얘기를 해줄 수 있어요",
    type: "choice",
    options: [
      { label: "네, 좋아요", value: "네, 좋아요" },
      { label: "아니요, 괜찮아요", value: "아니요, 괜찮아요" },
    ],
  },
  {
    id: "contact",
    question: "연락 가능한 오픈채팅 링크를 남겨주세요",
    helper: "연구실이 궁금한 후배들이 편하게 연락할 수 있어요",
    type: "text",
  },
];

function toOptions(values: string[]) {
  return values.map((value) => ({ label: value, value }));
}

function getOnboardingQuestions(
  purpose?: string,
  reviewOptions?: OnboardingReviewOptions,
) {
  const questions = ONBOARDING_QUESTIONS.map((question) => {
    if (question.id === "coreTime") {
      return { ...question, options: toOptions(reviewOptions?.coreTime ?? []) };
    }

    if (question.id === "meetingFrequency") {
      return {
        ...question,
        options: toOptions(reviewOptions?.weeklyMeeting ?? []),
      };
    }

    if (question.id === "activities") {
      return { ...question, options: toOptions(reviewOptions?.works ?? []) };
    }

    return question;
  });

  return purpose === ONBOARDING_PURPOSE.explore
    ? [questions[0], ...FINDER_QUESTIONS]
    : questions;
}

const FINDER_QUESTIONS: OnboardingQuestion[] = [
  { id: "department", question: "어느 학과에 다니고 계세요?", type: "text" },
  {
    id: "interest",
    question: "요즘 어떤 연구에 관심이 가세요?",
    helper: "키워드만 적어도 괜찮아요",
    type: "text",
  },
];

export { getOnboardingQuestions, ONBOARDING_PURPOSE, ONBOARDING_QUESTIONS };
export type { OnboardingAnswers, OnboardingQuestion, OnboardingQuestionId };
import type { OnboardingReviewOptions } from "./review-options";
