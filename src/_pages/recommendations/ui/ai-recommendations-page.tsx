"use client";

import { RecommendationConversation } from "@/features/request-ai-recommendation";
import { MobileBottomNav } from "@/widgets/mobile-bottom-nav";
import {
  useRecommendationsPage,
  type RecommendationsPageOptions,
} from "../model/use-recommendations-page";
import { RecommendationProgress } from "./recommendation-progress";
import {
  RecommendationResultsSidebar,
  RecommendationResultsSheet,
} from "./recommendation-results";
import { GRADIENT_CLASS } from "./recommendation-styles";

export type AiRecommendationsPageProps = RecommendationsPageOptions;

export function AiRecommendationsPage(props: AiRecommendationsPageProps) {
  const flow = useRecommendationsPage(props);
  const { step, isPending, result, resultTitle, handleStartNew } = flow;
  return (
    <div className="min-h-screen bg-white pb-[calc(180px_+_env(safe-area-inset-bottom))] text-text-default lg:pb-0">
      <main className="mx-auto flex max-w-[1248px] gap-[60px] px-4 pt-5 lg:px-8 lg:py-12">
        <section className="min-w-0 flex-1">
          <h1
            className={`text-[24px] font-bold leading-[1.3] lg:text-[32px] ${GRADIENT_CLASS}`}
          >
            AI 연구실 추천
          </h1>
          <p className="mt-1 text-[16px] font-semibold text-text-subtle lg:text-[20px]">
            몇 가지만 답하면 나에게 맞는 연구실을 찾아드려요.
          </p>
          <RecommendationProgress step={step} isPending={isPending} isMobile />
          <RecommendationConversation flow={flow} />
        </section>
        <RecommendationResultsSidebar
          result={result}
          resultTitle={resultTitle}
          step={step}
          isPending={isPending}
          onStartNew={handleStartNew}
        />
      </main>
      {result && (
        <RecommendationResultsSheet
          result={result}
          resultTitle={resultTitle}
          step={step}
          onStartNew={handleStartNew}
        />
      )}
      <MobileBottomNav activeHref="/recommendations" />
    </div>
  );
}
