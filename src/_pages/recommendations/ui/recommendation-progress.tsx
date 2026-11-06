import Image from "next/image";
import type { RecommendationStep } from "@/features/request-ai-recommendation";
import { GRADIENT_BACKGROUND_CLASS } from "./recommendation-styles";

const STEPS = [
  { waiting: "관심 주제 파악하는 중…", done: "관심 주제 이해하기" },
  { waiting: "키워드 정리하는 중…", done: "키워드 정리하기" },
  { waiting: "딱 맞는 연구실 찾는 중…", done: "딱 맞는 연구실 찾기" },
] as const;

type StepStatus = "done" | "loading" | "current" | "waiting";

function getStepStatus(index: number, activeIndex: number, isPending: boolean): StepStatus {
  if (index < activeIndex) return "done";
  if (index > activeIndex) return "waiting";
  return isPending ? "loading" : "current";
}

function StepIcon({ status }: { status: StepStatus }) {
  if (status === "done") {
    return (
      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-bg-primary">
        <Image src="/icons/recommendations/step-check.svg" width={12} height={12} alt="" />
      </span>
    );
  }
  if (status === "loading") {
    return (
      <Image
        className="shrink-0 animate-spin"
        src="/icons/recommendations/step-loader.svg"
        width={20}
        height={20}
        alt=""
      />
    );
  }
  if (status === "current") {
    return <Image className="shrink-0" src="/icons/recommendations/step-target.svg" width={20} height={20} alt="" />;
  }
  return <span className="size-5 shrink-0 rounded-full border-2 border-border-subtle" />;
}

export function RecommendationProgress({
  step,
  isPending,
  isMobile = false,
}: {
  step: RecommendationStep;
  isPending: boolean;
  isMobile?: boolean;
}) {
  const activeIndex = step === "keywords" && isPending
    ? 2
    : { interest: 0, keywords: 1, results: 2 }[step];
  if (isMobile) {
    if (step === "results") return null;
    const status = getStepStatus(activeIndex, activeIndex, isPending);
    return (
      <div className="mt-3 rounded-2xl bg-bg-neutral px-4 py-3 lg:hidden" aria-label="추천 준비 단계">
        <div className="flex items-center gap-2 text-[length:var(--font-size-label1)] font-semibold leading-[1.5]">
          <StepIcon status={status} />
          <span>{STEPS[activeIndex].waiting}</span>
        </div>
        <div className="mt-2 flex gap-1" aria-hidden="true">
          {STEPS.map((item, index) => (
            <span
              key={item.done}
              className={`h-1 flex-1 rounded-sm ${index === activeIndex && isPending ? GRADIENT_BACKGROUND_CLASS : index <= activeIndex ? "bg-bg-primary" : "bg-border-subtle"}`}
            />
          ))}
        </div>
      </div>
    );
  }
  return (
    <ol className="mt-8 space-y-[22px]" aria-label="추천 준비 단계">
      {STEPS.map((item, index) => {
        const status = getStepStatus(index, activeIndex, isPending);
        return (
          <li
            key={item.done}
            className={`flex items-center gap-[10px] text-[length:var(--font-size-headline2)] font-semibold leading-[1.4] ${status === "done" ? "text-text-subtle" : status === "waiting" ? "text-text-subtlest" : "text-text-default"}`}
            aria-current={index === activeIndex ? "step" : undefined}
          >
            <StepIcon status={status} />
            {status === "done" ? item.done : status === "waiting" ? item.done : item.waiting}
          </li>
        );
      })}
    </ol>
  );
}
