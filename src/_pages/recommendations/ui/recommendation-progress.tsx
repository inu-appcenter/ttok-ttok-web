import Image from "next/image";
import type { RecommendationStep } from "@/features/request-ai-recommendation";

const PROGRESS_LABELS = [
  "관심 주제 파악하는 중…",
  "키워드 정리하는 중…",
  "딱 맞는 연구실 찾기",
];

type StepStatus = "done" | "loading" | "current" | "waiting";

// 완료는 파란 원+흰 체크, AI 요청 중은 로더, 대기는 빈 원으로 구분한다.
function StepIcon({ status }: { status: StepStatus }) {
  if (status === "done") {
    return (
      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-bg-primary">
        <Image
          src="/icons/recommendations/step-check.svg"
          width={12}
          height={12}
          alt=""
        />
      </span>
    );
  }
  if (status === "loading") {
    return (
      <Image
        className="shrink-0 animate-spin"
        src="/icons/email-editor/loader.svg"
        width={20}
        height={20}
        alt=""
      />
    );
  }
  if (status === "current") {
    return (
      <Image
        className="shrink-0"
        src="/icons/recommendations/step-target.svg"
        width={20}
        height={20}
        alt=""
      />
    );
  }
  return (
    <span className="size-5 shrink-0 rounded-full border border-border-subtle" />
  );
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
  const stepIndex = { interest: 0, keywords: 1, results: 2 }[step];
  if (isMobile)
    return (
      <>
        {step !== "results" && (
          <div className="mt-5 rounded-2xl bg-[#f5f5f5] px-4 py-3 lg:hidden">
            <div className="flex items-center gap-2 text-[16px] font-semibold">
              <StepIcon status={isPending ? "loading" : "current"} />
              {PROGRESS_LABELS[stepIndex]}
            </div>
            <div className="mt-2 flex gap-1">
              {PROGRESS_LABELS.map((label, index) => (
                <span
                  key={label}
                  className={`h-1 flex-1 rounded-full ${index <= stepIndex ? "bg-bg-primary" : "bg-border-subtle"}`}
                />
              ))}
            </div>
          </div>
        )}
      </>
    );
  return (
    <ol className="mt-8 space-y-[22px]">
      {["관심 주제 파악하기", "키워드 정리하기", "딱 맞는 연구실 찾기"].map(
        (label, index) => (
          <li
            key={label}
            className={`flex items-center gap-3 text-[20px] ${index <= stepIndex ? "font-semibold text-text-primary" : "text-text-subtle"}`}
          >
            <StepIcon
              status={
                index < stepIndex
                  ? "done"
                  : index === stepIndex
                    ? isPending
                      ? "loading"
                      : "current"
                    : "waiting"
              }
            />
            {index === stepIndex ? PROGRESS_LABELS[index] : label}
          </li>
        ),
      )}
    </ol>
  );
}
