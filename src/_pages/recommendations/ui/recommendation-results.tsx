import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import {
  RecommendationResultCards,
  type RecommendationResult,
  type RecommendationStep,
} from "@/features/request-ai-recommendation";
import { Dialog } from "@/shared/ui";
import { RecommendationProgress } from "./recommendation-progress";
import { GRADIENT_CLASS, ACTION_CLASS } from "./recommendation-styles";

type ResultsProps = {
  result: RecommendationResult;
  resultTitle: string;
  step: RecommendationStep;
  onStartNew: () => void;
};

function ResultsFooter({ onStartNew }: { onStartNew: () => void }) {
  return (
    <div className="mt-5 text-center">
      <p className="mb-2 text-[13px] text-text-subtle">
        원하는 연구실이 없나요?
      </p>
      <button type="button" className={ACTION_CLASS} onClick={onStartNew}>
        연구실 추천 다시 받기
      </button>
    </div>
  );
}

export function RecommendationResultsSidebar({
  result,
  resultTitle,
  step,
  isPending,
  onStartNew,
}: Omit<ResultsProps, "result"> & {
  result?: RecommendationResult;
  isPending: boolean;
}) {
  const hasResults = result !== undefined;
  const recommendations = result?.recommendations ?? [];
  return (
    <aside className="hidden h-[calc(100dvh-168px)] w-[440px] overflow-y-auto shrink-0 rounded-[20px] bg-[#f5f5f5] p-9 shadow-[0_4px_16px_#0000001a] lg:block">
      {hasResults ? (
        <>
          <h2
            className={`flex items-center gap-2 text-[20px] font-semibold ${GRADIENT_CLASS}`}
          >
            <Image
              src="/icons/recommendations/result-sparkles.svg"
              width={24}
              height={24}
              alt=""
            />
            {resultTitle}
          </h2>
          <p className="mb-6 mt-2 text-[14px] text-text-subtle">
            {result?.noMatch
              ? "관심 연구나 키워드를 바꿔 다시 시도해보세요."
              : "나눈 이야기를 바탕으로 골랐어요"}
          </p>
          <RecommendationResultCards recommendations={recommendations} />
          <ResultsFooter onStartNew={onStartNew} />
        </>
      ) : (
        <>
          <h2 className="text-[20px] font-semibold">
            어떤 연구실이 잘 맞을까요?
          </h2>
          <p className="mt-2 text-[14px] text-text-subtle">
            나눈 이야기로 잘 맞는 연구실을 찾아볼게요
          </p>
          <RecommendationProgress step={step} isPending={isPending} />
        </>
      )}
    </aside>
  );
}

export function RecommendationResultsSheet({
  result,
  resultTitle,
  step,
  onStartNew,
}: ResultsProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const resultTrigger = useRef<HTMLButtonElement>(null);
  // Dialog가 열리며 autoFocus가 실행되기 전의 트리거는 이 컴포넌트가 소유한다.
  const handleClose = useCallback(() => {
    setIsSheetOpen(false);
    resultTrigger.current?.focus();
  }, []);
  const recommendations = result.recommendations;
  function handleStartNew() {
    handleClose();
    onStartNew();
  }
  return (
    <>
      <button
        ref={resultTrigger}
        type="button"
        onClick={() => setIsSheetOpen(true)}
        aria-haspopup="dialog"
        className="fixed bottom-[calc(108px_+_env(safe-area-inset-bottom))] left-1/2 flex w-[calc(100%_-_32px)] max-w-[343px] -translate-x-1/2 items-center justify-between rounded-2xl bg-white p-4 shadow-[0_4px_16px_#00000026] lg:hidden"
      >
        <span
          className={`flex items-center gap-2 text-[13px] font-semibold ${GRADIENT_CLASS}`}
        >
          <Image
            src="/icons/recommendations/result-sparkles.svg"
            width={20}
            height={20}
            alt=""
          />
          {step === "results"
            ? resultTitle
            : `이전 추천 ${recommendations.length}곳`}
        </span>
        <span className="text-[13px]">결과 보기 ⌃</span>
      </button>
      <div>
        <Dialog
          isOpen={isSheetOpen}
          mobileBottomSheet
          onClose={handleClose}
          title={resultTitle}
          className="max-h-[82dvh] [&_h2]:text-[18px] [&_h2]:text-text-primary"
        >
          <div className="px-5 pt-2 pb-5">
            <p className="mb-5 text-[14px] text-text-subtle">
              {result?.noMatch
                ? "관심 연구나 키워드를 바꿔 다시 시도해보세요."
                : "나눈 이야기를 바탕으로 골랐어요"}
            </p>
            <RecommendationResultCards
              recommendations={recommendations}
              isMobile
            />
            <ResultsFooter onStartNew={handleStartNew} />
          </div>
        </Dialog>
      </div>
    </>
  );
}
