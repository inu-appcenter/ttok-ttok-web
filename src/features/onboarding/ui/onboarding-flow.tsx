"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { SelectedLabCard } from "@/entities/lab";
import type { CollegeOption, LabSummary } from "@/entities/lab";
import { Button, Field } from "@/shared/ui";

import {
  getOnboardingQuestions,
  ONBOARDING_PURPOSE,
} from "../model/onboarding-steps";
import type { OnboardingAnswers } from "../model/onboarding-steps";
import type { OnboardingReviewOptions } from "../model/review-options";
import { ChatMessage } from "./chat-message";
import { DepartmentCombobox } from "./department-combobox";
import { OnboardingProgress } from "./onboarding-progress";
import { OnboardingSubmit } from "./onboarding-submit";
import { MultiQuickReplies, QuickReplies } from "./quick-replies";

type OnboardingFlowProps = {
  completionHref?: string;
  onComplete?: (answers: OnboardingAnswers, href?: string) => Promise<void>;
  colleges?: CollegeOption[];
  collegesError?: string;
  renderFinderResults?: (props: {
    onOpen: (href: string) => void;
    disabled: boolean;
  }) => ReactNode;
  renderLabSearch: (props: {
    onClearSelection: () => void;
    onSelect: (lab: LabSummary) => void;
    selectedLaboratoryId?: number;
  }) => ReactNode;
  reviewOptions?: OnboardingReviewOptions;
  reviewOptionsError?: string;
};

function formatAnswer(answer: string | string[] | undefined) {
  return Array.isArray(answer) ? answer.join(", ") : answer;
}

export function OnboardingFlow({
  completionHref = "/",
  onComplete,
  colleges = [],
  collegesError,
  renderFinderResults,
  renderLabSearch,
  reviewOptions,
  reviewOptionsError,
}: OnboardingFlowProps) {
  const [answers, setAnswers] = useState<OnboardingAnswers>({});
  const [draftAnswers, setDraftAnswers] = useState<OnboardingAnswers>({});
  const [selectedLaboratory, setSelectedLaboratory] =
    useState<LabSummary | null>(null);
  const [pendingAnswer, setPendingAnswer] = useState("");
  const [pendingSelections, setPendingSelections] = useState<string[]>([]);
  const [departmentCode, setDepartmentCode] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [contactError, setContactError] = useState("");
  const activeStepRef = useRef<HTMLElement>(null);
  const completionErrorRef = useRef<HTMLParagraphElement>(null);
  const isInitialRender = useRef(true);

  const purpose =
    typeof answers.purpose === "string" ? answers.purpose : undefined;
  const activeQuestions = getOnboardingQuestions(
    purpose,
    reviewOptions,
    answers,
  );
  const labDepartment = colleges
    .flatMap((college) => college.departments)
    .find(
      (department) =>
        department.departmentName === selectedLaboratory?.department,
    );
  const totalSteps =
    purpose === ONBOARDING_PURPOSE.explore ? 3 : activeQuestions.length + 1;
  function questionText(question: (typeof activeQuestions)[number]) {
    return question.id === "departmentConfirmation" && selectedLaboratory
      ? `${selectedLaboratory.department} 소속인가요?`
      : question.question;
  }

  const completedQuestionCount = activeQuestions.filter((question) => {
    const answer = answers[question.id];
    return Array.isArray(answer) ? answer.length > 0 : Boolean(answer);
  }).length;
  const currentQuestion = activeQuestions[completedQuestionCount];
  const isComplete = currentQuestion === undefined;
  const isFinder = purpose === ONBOARDING_PURPOSE.explore;
  const currentStep = isFinder
    ? Math.min(completedQuestionCount, 3)
    : isComplete
      ? totalSteps
      : completedQuestionCount + 1;

  useEffect(() => {
    if (submitError && isFinder) {
      completionErrorRef.current?.scrollIntoView({ block: "nearest" });
      completionErrorRef.current?.focus({ preventScroll: true });
    }
  }, [submitError, isFinder]);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      const behavior = window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches
        ? "auto"
        : "smooth";

      activeStepRef.current?.scrollIntoView({ behavior, block: "start" });
      activeStepRef.current?.focus({ preventScroll: true });
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [completedQuestionCount]);

  function handleSubmit() {
    if (!currentQuestion) {
      return;
    }

    const nextAnswer =
      currentQuestion.type === "lab-search"
        ? selectedLaboratory
          ? String(selectedLaboratory.laboratoryId)
          : ""
        : currentQuestion.type === "multi-choice"
          ? pendingSelections
          : pendingAnswer.trim();

    if (
      nextAnswer.length === 0 ||
      (currentQuestion.id === "department" && !departmentCode)
    )
      return;

    if (currentQuestion.id === "contact" && typeof nextAnswer === "string") {
      try {
        const url = new URL(nextAnswer);
        if (
          url.protocol !== "https:" ||
          url.hostname !== "open.kakao.com" ||
          url.pathname === "/"
        )
          throw new Error();
      } catch {
        setContactError(
          "https://open.kakao.com/으로 시작하는 오픈채팅 링크를 입력해주세요.",
        );
        return;
      }
    }
    setContactError("");

    if (
      currentQuestion.id === "departmentConfirmation" &&
      nextAnswer === "네, 맞아요" &&
      !labDepartment
    )
      return;
    const nextAnswers: OnboardingAnswers = {
      ...answers,
      [currentQuestion.id]: nextAnswer,
      ...(currentQuestion.id === "department" ? { departmentCode } : {}),
      ...(currentQuestion.id === "departmentConfirmation" &&
      nextAnswer === "네, 맞아요" &&
      labDepartment
        ? {
            department: labDepartment.departmentName,
            departmentCode: labDepartment.department,
          }
        : {}),
      ...(currentQuestion.type === "lab-search" && selectedLaboratory
        ? { laboratoryId: selectedLaboratory.laboratoryId }
        : {}),
    };
    if (
      currentQuestion.id === "coffeeChat" &&
      nextAnswer === "아니요, 괜찮아요"
    ) {
      delete nextAnswers.contact;
      setDraftAnswers((current) => {
        const next = { ...current };
        delete next.contact;
        return next;
      });
    }
    setAnswers(nextAnswers);
    const nextQuestions = getOnboardingQuestions(
      typeof nextAnswers.purpose === "string" ? nextAnswers.purpose : undefined,
      reviewOptions,
      nextAnswers,
    );
    const nextQuestion = nextQuestions[completedQuestionCount + 1];
    const draft = nextQuestion ? draftAnswers[nextQuestion.id] : undefined;
    setPendingAnswer(typeof draft === "string" ? draft : "");
    setPendingSelections(Array.isArray(draft) ? draft : []);
  }

  function editPreviousAnswer() {
    const previous = activeQuestions[completedQuestionCount - 1];
    if (!previous) return;
    setDraftAnswers((current) => ({
      ...current,
      ...answers,
      ...(currentQuestion ? { [currentQuestion.id]: pendingAnswer } : {}),
    }));
    const previousAnswer = answers[previous.id];
    setPendingAnswer(typeof previousAnswer === "string" ? previousAnswer : "");
    setPendingSelections(Array.isArray(previousAnswer) ? previousAnswer : []);
    setSubmitError("");
    setContactError("");
    if (
      ["purpose", "lab", "departmentConfirmation", "department"].includes(
        previous.id,
      )
    )
      setDepartmentCode(undefined);
    setAnswers((current) => {
      const next = { ...current };
      for (const question of activeQuestions.slice(completedQuestionCount - 1))
        delete next[question.id];
      if (
        ["purpose", "lab", "departmentConfirmation", "department"].includes(
          previous.id,
        )
      ) {
        delete next.department;
        delete next.departmentCode;
      }
      return next;
    });
  }

  async function handleCompletion(href = completionHref) {
    if (!onComplete || isSubmitting) {
      return;
    }

    setSubmitError("");
    setIsSubmitting(true);

    try {
      await onComplete(answers, href);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "온보딩 저장 중 문제가 발생했습니다. 다시 시도해주세요.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <OnboardingProgress currentStep={currentStep} totalSteps={totalSteps} />
      <section className="mx-auto flex w-full max-w-[680px] flex-col gap-[var(--spacing-spacing-4)] overflow-y-auto overscroll-y-contain px-[var(--spacing-spacing-4)] pb-[max(var(--spacing-spacing-10),env(safe-area-inset-bottom))] pt-[var(--spacing-spacing-10)] text-text-default max-md:min-h-0 max-md:flex-1 max-md:[scrollbar-width:none] md:overflow-visible md:px-0">
        <ChatMessage sender="bot">똑똑에 오신 걸 환영해요!</ChatMessage>
        {activeQuestions.slice(0, completedQuestionCount).map((question) => (
          <div className="contents" key={question.id}>
            {question.id === "department" && isFinder ? (
              <ChatMessage sender="bot">
                연구실 추천을 위해 몇 가지 물어볼게요!
              </ChatMessage>
            ) : null}
            <ChatMessage sender="bot">{questionText(question)}</ChatMessage>
            {question.helper ? (
              <ChatMessage emphasis="subtle" sender="bot">
                {question.helper}
              </ChatMessage>
            ) : null}
            {question.id === "lab" && selectedLaboratory ? (
              <SelectedLabCard lab={selectedLaboratory} />
            ) : (
              <ChatMessage sender="user">
                {formatAnswer(answers[question.id])}
              </ChatMessage>
            )}
          </div>
        ))}

        {isComplete && isFinder ? (
          <section
            aria-label="추천 연구실"
            className="flex flex-col gap-4 focus:outline-none"
            ref={(node) => {
              activeStepRef.current = node;
            }}
            tabIndex={-1}
          >
            <ChatMessage sender="bot">
              찾았어요! 이 연구실이 잘 맞을 것 같아요
            </ChatMessage>
            <ChatMessage emphasis="subtle" sender="bot">
              마음에 드는 곳이 있나요?{" "}
              <button
                className="cursor-pointer text-text-primary underline underline-offset-4 disabled:opacity-50"
                disabled={isSubmitting}
                onClick={() => handleCompletion()}
                type="button"
              >
                홈에서 더 둘러보기 ›
              </button>
            </ChatMessage>
            {submitError ? (
              <p
                className="text-sm text-text-error focus:outline-none"
                ref={completionErrorRef}
                role="alert"
                tabIndex={-1}
              >
                {submitError}
              </p>
            ) : null}
            {renderFinderResults?.({
              onOpen: (href) => {
                void handleCompletion(href);
              },
              disabled: isSubmitting,
            })}
            <button
              className="w-fit cursor-pointer text-sm text-text-subtle underline disabled:opacity-50"
              disabled={isSubmitting}
              onClick={editPreviousAnswer}
              type="button"
            >
              입력 내용 수정
            </button>
            {isSubmitting ? (
              <p role="status" className="text-sm text-text-subtle">
                온보딩을 저장하고 있어요.
              </p>
            ) : null}
          </section>
        ) : isComplete ? (
          <section
            aria-label="온보딩 완료"
            className="flex flex-col gap-[var(--spacing-spacing-4)] focus:outline-none"
            ref={(node) => {
              activeStepRef.current = node;
            }}
            tabIndex={-1}
          >
            <ChatMessage sender="bot">회원가입 축하드려요! 🥳</ChatMessage>
            <div className="w-fit max-w-full rounded-[var(--radius-xl)] bg-bg-neutral px-[var(--spacing-spacing-6)] py-[var(--spacing-spacing-4)]">
              <p className="text-[length:var(--font-size-body3)] font-normal leading-[1.5] text-text-subtle">
                이제 “똑똑”에서 자세한 연구실 정보를 확인해보세요!
              </p>
              {onComplete ? (
                <>
                  <Button
                    className="mt-[var(--spacing-spacing-3)]"
                    disabled={isSubmitting}
                    isLoading={isSubmitting}
                    onClick={() => handleCompletion()}
                    type="button"
                  >
                    시작하기
                  </Button>
                  {submitError ? (
                    <p
                      aria-live="polite"
                      className="mt-[var(--spacing-spacing-2)] text-[length:var(--font-size-label2)] text-text-error"
                    >
                      {submitError}
                    </p>
                  ) : null}
                </>
              ) : (
                <Link
                  className="mt-[var(--spacing-spacing-3)] inline-flex cursor-pointer items-center justify-center gap-[var(--spacing-spacing-1-5)] rounded-[var(--radius-md)] border border-[color:var(--color-bg-primary-hover)] bg-bg-default px-[var(--spacing-spacing-6)] py-[var(--spacing-spacing-3)] text-[length:var(--font-size-headline1)] font-semibold leading-[1.4] text-[color:var(--color-bg-primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary"
                  href={completionHref}
                >
                  시작하기
                  <Image
                    alt=""
                    height={18}
                    src="/icons/arrow-right.svg"
                    width={18}
                  />
                </Link>
              )}
            </div>
            <button
              className="w-fit cursor-pointer text-sm text-text-subtle underline disabled:opacity-50"
              disabled={isSubmitting}
              onClick={editPreviousAnswer}
              type="button"
            >
              이전 답변 수정
            </button>
          </section>
        ) : (
          <form
            aria-label={`${currentStep}단계 온보딩 질문`}
            className="flex scroll-mt-[var(--spacing-spacing-4)] flex-col gap-[var(--spacing-spacing-4)] focus:outline-none md:scroll-mt-[114px]"
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmit();
            }}
            ref={(node) => {
              activeStepRef.current = node;
            }}
            tabIndex={-1}
          >
            {currentQuestion.id === "department" && isFinder ? (
              <ChatMessage sender="bot">
                연구실 추천을 위해 몇 가지 물어볼게요!
              </ChatMessage>
            ) : null}
            <ChatMessage sender="bot">
              {questionText(currentQuestion)}
            </ChatMessage>
            {currentQuestion.helper ? (
              <ChatMessage emphasis="subtle" sender="bot">
                {currentQuestion.helper}
              </ChatMessage>
            ) : null}
            {reviewOptionsError &&
            ["coreTime", "meetingFrequency", "activities"].includes(
              currentQuestion.id,
            ) ? (
              <p
                aria-live="polite"
                className="text-[length:var(--font-size-label2)] text-text-error"
              >
                {reviewOptionsError}
              </p>
            ) : null}
            {currentQuestion.id === "department" ? (
              <>
                <DepartmentCombobox
                  colleges={colleges}
                  onChange={(value) => {
                    setPendingAnswer(value);
                    setDepartmentCode(undefined);
                  }}
                  onSelect={(department) => {
                    setPendingAnswer(department.departmentName);
                    setDepartmentCode(department.department);
                  }}
                  selectedCode={departmentCode}
                  value={pendingAnswer}
                />
                {collegesError ? (
                  <p role="alert" className="text-sm text-text-error">
                    {collegesError}
                  </p>
                ) : null}
              </>
            ) : currentQuestion.type === "choice" ? (
              <QuickReplies
                name={currentQuestion.id}
                onValueChange={setPendingAnswer}
                options={(currentQuestion.options ?? []).filter(
                  (option) =>
                    currentQuestion.id !== "departmentConfirmation" ||
                    labDepartment ||
                    option.value !== "네, 맞아요",
                )}
                value={pendingAnswer}
              />
            ) : currentQuestion.type === "multi-choice" ? (
              <MultiQuickReplies
                maxSelections={3}
                name={currentQuestion.id}
                onValueChange={setPendingSelections}
                options={currentQuestion.options ?? []}
                values={pendingSelections}
              />
            ) : currentQuestion.type === "lab-search" ? (
              renderLabSearch({
                onClearSelection: () => {
                  setSelectedLaboratory(null);
                  setPendingAnswer("");
                },
                onSelect: (lab) => {
                  setSelectedLaboratory(lab);
                  setPendingAnswer(String(lab.laboratoryId));
                },
                selectedLaboratoryId: selectedLaboratory?.laboratoryId,
              })
            ) : (
              <div
                className={`ml-auto w-full max-w-[444px] ${currentQuestion.id === "interest" ? "max-md:max-w-[320px]" : ""}`}
              >
                <Field
                  error={
                    currentQuestion.id === "contact" ? contactError : undefined
                  }
                  aria-label={
                    currentQuestion.id === "interest"
                      ? "관심 연구"
                      : "오픈채팅 링크"
                  }
                  className={
                    currentQuestion.id === "interest" ? "text-base" : undefined
                  }
                  maxLength={
                    currentQuestion.id === "interest" ? 1000 : undefined
                  }
                  onChange={(event) => {
                    setPendingAnswer(event.target.value);
                    setContactError("");
                  }}
                  placeholder={
                    currentQuestion.id === "interest"
                      ? "예: 추천시스템, 파이썬 크롤링"
                      : "https://open.kakao.com/..."
                  }
                  type={currentQuestion.id === "interest" ? "text" : "url"}
                  value={pendingAnswer}
                />
              </div>
            )}
            <div className="flex justify-end">
              <OnboardingSubmit
                disabled={
                  currentQuestion.id === "department"
                    ? !departmentCode
                    : currentQuestion.type === "multi-choice"
                      ? pendingSelections.length === 0
                      : !pendingAnswer.trim()
                }
              />
            </div>
            {completedQuestionCount > 0 ? (
              <button
                className="w-fit cursor-pointer text-sm text-text-subtle underline"
                onClick={editPreviousAnswer}
                type="button"
              >
                이전 답변 수정
              </button>
            ) : null}
          </form>
        )}
      </section>
    </>
  );
}

export type { OnboardingFlowProps };
