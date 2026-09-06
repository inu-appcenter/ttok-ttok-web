"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { MOCK_LABS, SelectedLabCard } from "@/entities/lab";
import { Field } from "@/shared/ui";

import {
  getOnboardingQuestions,
  ONBOARDING_QUESTIONS,
} from "../model/onboarding-steps";
import { ChatMessage } from "./chat-message";
import { OnboardingProgress } from "./onboarding-progress";
import { OnboardingSubmit } from "./onboarding-submit";
import { MultiQuickReplies, QuickReplies } from "./quick-replies";

type AnswerValue = string | string[];
type Answers = Partial<
  Record<(typeof ONBOARDING_QUESTIONS)[number]["id"], AnswerValue>
>;

type OnboardingFlowProps = {
  completionHref?: string;
  renderLabSearch: (props: {
    onSelect: (labId: string) => void;
    selectedLabId?: string;
  }) => ReactNode;
};

function formatAnswer(answer: AnswerValue | undefined) {
  return Array.isArray(answer) ? answer.join(", ") : answer;
}

export function OnboardingFlow({
  completionHref = "/",
  renderLabSearch,
}: OnboardingFlowProps) {
  const [answers, setAnswers] = useState<Answers>({});
  const [pendingAnswer, setPendingAnswer] = useState("");
  const [pendingSelections, setPendingSelections] = useState<string[]>([]);
  const activeStepRef = useRef<HTMLElement>(null);
  const isInitialRender = useRef(true);

  const purpose =
    typeof answers.purpose === "string" ? answers.purpose : undefined;
  const activeQuestions = getOnboardingQuestions(purpose);

  const completedQuestionCount = activeQuestions.filter(
    (question) => {
      const answer = answers[question.id];
      return Array.isArray(answer) ? answer.length > 0 : Boolean(answer);
    },
  ).length;
  const currentQuestion = activeQuestions[completedQuestionCount];
  const isComplete = currentQuestion === undefined;
  const currentStep = isComplete ? 8 : completedQuestionCount + 1;

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
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
      currentQuestion.type === "multi-choice"
        ? pendingSelections
        : pendingAnswer.trim();

    if (nextAnswer.length === 0) return;

    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [currentQuestion.id]: nextAnswer,
    }));
    setPendingAnswer("");
    setPendingSelections([]);
  }

  return (
    <>
      <OnboardingProgress currentStep={currentStep} />
      <section className="mx-auto flex w-full max-w-[680px] flex-col gap-[var(--spacing-spacing-4)] overflow-y-auto overscroll-y-contain px-[var(--spacing-spacing-4)] pb-[max(var(--spacing-spacing-10),env(safe-area-inset-bottom))] pt-[var(--spacing-spacing-10)] max-md:min-h-0 max-md:flex-1 md:overflow-visible md:px-0">
        {activeQuestions.slice(0, completedQuestionCount).map((question) => (
          <div className="contents" key={question.id}>
            <ChatMessage sender="bot">{question.question}</ChatMessage>
            {question.helper ? (
              <ChatMessage emphasis="subtle" sender="bot">
                {question.helper}
              </ChatMessage>
            ) : null}
            {question.id === "lab" ? (
              <SelectedLabCard
                lab={
                  MOCK_LABS.find((lab) => lab.labId === answers.lab) ?? MOCK_LABS[0]
                }
              />
            ) : (
              <ChatMessage sender="user">
                {formatAnswer(answers[question.id])}
              </ChatMessage>
            )}
          </div>
        ))}

        {isComplete ? (
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
              <Link
                className="mt-[var(--spacing-spacing-3)] inline-flex cursor-pointer items-center justify-center gap-[var(--spacing-spacing-1-5)] rounded-[var(--radius-md)] border border-[color:var(--color-bg-primary-hover)] bg-bg-default px-[var(--spacing-spacing-6)] py-[var(--spacing-spacing-3)] text-[length:var(--font-size-headline1)] font-semibold leading-[1.4] text-[color:var(--color-bg-primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary"
                href={completionHref}
              >
                시작하기
                <Image alt="" height={18} src="/icons/arrow-right.svg" width={18} />
              </Link>
            </div>
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
            <ChatMessage sender="bot">{currentQuestion.question}</ChatMessage>
            {currentQuestion.helper ? (
              <ChatMessage emphasis="subtle" sender="bot">
                {currentQuestion.helper}
              </ChatMessage>
            ) : null}
            {currentQuestion.type === "choice" ? (
              <QuickReplies
                name={currentQuestion.id}
                onValueChange={setPendingAnswer}
                options={currentQuestion.options ?? []}
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
                onSelect: setPendingAnswer,
                selectedLabId: pendingAnswer,
              })
            ) : (
              <div className="ml-auto w-full max-w-[444px]">
                <Field
                  aria-label="오픈채팅 링크"
                  onChange={(event) => setPendingAnswer(event.target.value)}
                  placeholder="https://open.kakao.com/..."
                  type="url"
                  value={pendingAnswer}
                />
              </div>
            )}
            <div className="flex justify-end">
              <OnboardingSubmit
                disabled={
                  currentQuestion.type === "multi-choice"
                    ? pendingSelections.length === 0
                    : !pendingAnswer.trim()
                }
              />
            </div>
          </form>
        )}
      </section>
    </>
  );
}

export type { OnboardingFlowProps };
