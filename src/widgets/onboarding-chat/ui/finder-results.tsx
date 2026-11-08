"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { ChatMessage } from "@/features/onboarding";
import {
  requestRecommendations,
  type RecommendationRequest,
  type RecommendationResult,
} from "@/features/request-ai-recommendation";

type ResultState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; result: RecommendationResult };

type FinderResultsProps = {
  disabled: boolean;
  interest: string;
  onHome: () => void;
  onOpen: (href: string) => void;
  onRecommend?: (
    input: RecommendationRequest,
    signal: AbortSignal,
  ) => Promise<RecommendationResult>;
};

function HomeLink({ disabled, onHome }: Pick<FinderResultsProps, "disabled" | "onHome">) {
  return (
    <ChatMessage emphasis="subtle" sender="bot">
      마음에 드는 곳이 없나요?{" "}
      <button
        className="inline-flex cursor-pointer items-center font-semibold text-[#5777a4] underline underline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled}
        onClick={onHome}
        type="button"
      >
        홈에서 더 둘러보기
        <Image alt="" height={16} src="/icons/onboarding/home-chevron-right.svg" width={16} />
      </button>
    </ChatMessage>
  );
}

export function FinderResults({
  disabled,
  interest,
  onHome,
  onOpen,
  onRecommend = requestRecommendations,
}: FinderResultsProps) {
  const [state, setState] = useState<ResultState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    onRecommend({ interest, selectedKeywords: [] }, controller.signal).then(
      (result) => {
        if (!controller.signal.aborted) setState({ status: "success", result });
      },
      (error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          status: "error",
          message: error instanceof Error ? error.message : "추천 결과를 불러오지 못했어요.",
        });
      },
    );
    return () => controller.abort();
  }, [attempt, interest, onRecommend]);

  if (state.status === "loading") {
    return (
      <div aria-label="연구실을 찾고 있어요" className="flex min-h-10 items-center" role="status">
        <Image
          alt=""
          className="animate-spin"
          height={20}
          src="/icons/recommendations/step-loader.svg"
          width={20}
        />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex flex-col items-start gap-4">
        <ChatMessage sender="bot">추천 결과를 불러오지 못했어요.</ChatMessage>
        <p className="text-sm text-text-error" role="alert">{state.message}</p>
        <button
          className="cursor-pointer font-semibold text-text-primary underline underline-offset-4"
          onClick={() => {
            setState({ status: "loading" });
            setAttempt((current) => current + 1);
          }}
          type="button"
        >
          다시 시도하기
        </button>
        <HomeLink disabled={disabled} onHome={onHome} />
      </div>
    );
  }

  const { noMatch, recommendations } = state.result;
  if (noMatch) {
    return (
      <div className="flex flex-col items-start gap-4">
        <ChatMessage sender="bot">맞는 연구실을 찾지 못했어요.</ChatMessage>
        <HomeLink disabled={disabled} onHome={onHome} />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-start gap-4">
      <ChatMessage sender="bot">찾았어요! 이 연구실이 잘 맞을 것 같아요</ChatMessage>
      <div className="hidden md:block">
        <HomeLink disabled={disabled} onHome={onHome} />
      </div>
      <div className="md:hidden">
        <ChatMessage emphasis="subtle" sender="bot">이 연구실부터 구경해보세요!</ChatMessage>
      </div>
      <div className="flex w-full max-w-[400px] flex-col gap-3">
        {recommendations.map((lab, index) => (
          <article
            className="rounded-xl border border-transparent bg-bg-default px-4 py-3 shadow-[0_4px_16px_var(--color-opacity-black-10)] transition-colors hover:border-border-primary hover:bg-bg-primary-subtle focus-within:border-border-primary focus-within:bg-bg-primary-subtle"
            key={lab.id}
          >
            {index === 0 ? (
              <span className="mb-2 inline-block rounded-full bg-[linear-gradient(90deg,#a7c0db_0%,#b4bade_33%,#c2aed6_66%,#d699c5_100%)] px-3 py-1 text-sm font-semibold text-white">
                가장 잘 맞아요
              </span>
            ) : null}
            <h3 className="break-words text-xl font-semibold leading-[1.5] tracking-[-0.01em]">
              {lab.name}
            </h3>
            <p className="text-[13px] leading-[1.5] text-text-subtle">
              {lab.professor} 교수 · {lab.department}
            </p>
            <div className="my-2 flex flex-wrap gap-2">
              {lab.tags.map((tag) => (
                <span
                  className="rounded-full bg-bg-primary px-2.5 text-[13px] leading-[1.5] text-white"
                  key={tag}
                >
                  {tag}
                </span>
              ))}
            </div>
            {lab.reasons.length > 0 ? (
              <ul className="space-y-1 text-sm leading-[1.5]">
                {lab.reasons.map((reason) => (
                  <li className="flex gap-2" key={reason}>
                    <span aria-hidden="true" className="text-text-primary">•</span>
                    {reason}
                  </li>
                ))}
              </ul>
            ) : null}
            <button
              aria-label={`${lab.name} 보기`}
              className="ml-auto mt-2 flex cursor-pointer items-center gap-1 text-sm font-semibold text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
              disabled={disabled}
              onClick={() => onOpen(`/labs/${lab.id}`)}
              type="button"
            >
              연구실 보기
              <Image alt="" height={13} src="/icons/recommendations/chevron-right.svg" width={13} />
            </button>
          </article>
        ))}
      </div>
      <div className="md:hidden">
        <HomeLink disabled={disabled} onHome={onHome} />
      </div>
    </div>
  );
}
