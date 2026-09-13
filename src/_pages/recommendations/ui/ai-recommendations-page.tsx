"use client";

import Image from "next/image";
import { useState } from "react";

import { LabCard } from "@/entities/lab";
import type { LabSummary } from "@/entities/lab";
import { AiRecommendationButton } from "@/features/request-ai-recommendation";
import { Textarea } from "@/shared/ui";
import { MobileBottomNav } from "@/widgets/mobile-bottom-nav";
import { SiteHeader } from "@/widgets/site-header";

type RecommendationView = "form" | "results";

export type AiRecommendationsPageProps = {
  initialPrompt?: string;
  initialView?: RecommendationView;
  isAuthenticated?: boolean;
  labs: LabSummary[];
};

const promptPlaceholder =
  "예) 추천시스템에 관심이 있고, 파이썬으로 크롤링 프로젝트를 해봤어요. 데이터 다루는 걸 좋아합니다.";

export function AiRecommendationsPage({
  initialPrompt = "",
  initialView = "form",
  isAuthenticated = false,
  labs,
}: AiRecommendationsPageProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [view, setView] = useState<RecommendationView>(initialView);
  const recommendations = labs.slice(0, 3);

  function handleRecommend() {
    if (prompt.trim()) setView("results");
  }

  function handleEdit() {
    setView("form");
  }

  return (
    <div className="min-h-screen bg-bg-default pb-[calc(111px_+_env(safe-area-inset-bottom))] text-text-default md:pb-0">
      <SiteHeader activeItem="ai" isAuthenticated={isAuthenticated} />
      <main className="mx-auto w-full max-w-[1440px] px-4 pt-7 md:px-10 md:pt-10">
        {view === "form" ? (
          <section className="flex flex-col gap-[10px] md:gap-9">
            <div className="rounded-[var(--radius-md)] bg-bg-default p-3 md:p-0">
              <div className="flex items-center gap-1 md:hidden">
                <Image alt="" height={20} src="/icons/home/mobile/sparkles.svg" width={20} />
                <h1 className="bg-[linear-gradient(90deg,#a7c0db_0%,#b4bade_33%,#c2aed6_66%,#d699c5_100%)] bg-clip-text text-[length:var(--font-size-heading1)] font-semibold leading-[1.5] tracking-[-0.01em] text-transparent">
                  AI 랩 추천
                </h1>
              </div>
              <div className="hidden md:block">
                <h1 className="text-[32px] font-bold leading-[1.5]">AI 연구실 추천</h1>
                <p className="text-[20px] font-medium leading-[1.5] text-text-subtle">
                  하고 싶은 연구, 잘하는 것을 자유롭게 적어 주세요.
                </p>
              </div>
              <p className="mt-1 text-[length:var(--font-size-heading1)] font-semibold leading-[1.5] tracking-[-0.01em] md:hidden">
                하고 싶은 연구, 잘하는 것을
                <br />
                자유롭게 적어주세요
              </p>
            </div>

            <Textarea
              aria-label="AI 연구실 추천 요청"
              className="h-[160px] border-[#a7c0db] bg-bg-default text-[length:var(--font-size-label2)] placeholder:text-text-subtle md:h-[117px] md:text-[length:var(--font-size-caption1)]"
              onChange={(event) => setPrompt(event.target.value)}
              placeholder={promptPlaceholder}
              value={prompt}
            />

            <AiRecommendationButton
              className="h-[39px] w-full text-[length:var(--font-size-body1)] md:h-[49px] md:w-[240px] md:text-[length:var(--font-size-heading1)]"
              disabled={!prompt.trim()}
              onClick={handleRecommend}
            />
          </section>
        ) : (
          <section className="flex flex-col gap-5 md:gap-8">
            <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[#a7c0db] bg-[var(--color-opacity-black-5)] px-4 py-1.5 text-[length:var(--font-size-label2)] md:max-w-[1014px]">
              <p className="min-w-0 flex-1 truncate">{prompt}</p>
              <button
                className="shrink-0 cursor-pointer underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary"
                onClick={handleEdit}
                type="button"
              >
                수정
              </button>
            </div>

            <div className="flex items-center gap-1 md:gap-2">
              <Image alt="" height={20} src="/icons/home/mobile/sparkles.svg" width={20} />
              <h1 className="bg-[linear-gradient(90deg,#a7c0db_0%,#b4bade_33%,#c2aed6_66%,#d699c5_100%)] bg-clip-text text-[length:var(--font-size-headline1)] font-semibold leading-[1.4] tracking-[-0.01em] text-transparent md:text-[length:var(--font-size-heading1)] md:leading-[1.5]">
                이런 연구실이 잘 맞을 것 같아요
              </h1>
            </div>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-3 md:gap-6">
              {recommendations.map((lab) => (
                <LabCard key={lab.labId} lab={lab} />
              ))}
            </div>
          </section>
        )}
      </main>
      <MobileBottomNav activeHref="/recommendations" />
    </div>
  );
}
