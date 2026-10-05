"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";

import type { LabResearchMetrics } from "@/entities/lab";

export function ResearchMetrics({ metrics }: { metrics: LabResearchMetrics }) {
  const [activeMetric, setActiveMetric] = useState<string | null>(null);
  const tooltipId = useId();
  useEffect(() => {
    if (!activeMetric) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setActiveMetric(null);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeMetric]);
  const items = [
    {
      key: "h-index",
      label: "h-index",
      value: metrics.hIndex,
      percentile: metrics.hIndexPercentile,
    },
    {
      key: "citations",
      label: "피인용",
      value: metrics.citations,
      percentile: metrics.citationPercentile,
    },
    { key: "papers", label: "최근 5년 논문", value: metrics.fiveYearPapers },
  ];

  return (
    <section
      onMouseLeave={() => setActiveMetric(null)}
      className="relative rounded-[var(--radius-2xl)] bg-bg-default p-4 shadow-[0_4px_16px_var(--color-opacity-black-10)]"
    >
      <h2 className="text-[length:var(--font-size-headline2)] font-semibold leading-[1.4]">
        연구 지표
      </h2>
      <dl className="mt-[10px] grid grid-cols-3 gap-[10px]">
        {items.map((item) => (
          <div
            className="min-w-0 rounded-[var(--radius-2xl)] border border-icon-disabled p-[10px]"
            key={item.key}
          >
            <dt className="flex items-center justify-between gap-1 text-[length:var(--font-size-caption1)] leading-[1.5] text-text-subtle">
              {item.label}
              {item.key !== "papers" ? (
                <button
                  aria-label={`${item.label} 설명`}
                  aria-expanded={activeMetric === item.key}
                  aria-controls={
                    activeMetric === item.key ? tooltipId : undefined
                  }
                  className="shrink-0 cursor-pointer rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary"
                  onMouseEnter={() => setActiveMetric(item.key)}
                  onFocus={() => setActiveMetric(item.key)}
                  onBlur={() => setActiveMetric(null)}
                  onClick={() => setActiveMetric(item.key)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      event.preventDefault();
                      setActiveMetric(null);
                    }
                  }}
                  type="button"
                >
                  <Image
                    alt=""
                    src="/icons/lab-detail/metric-help.svg"
                    width={16}
                    height={16}
                  />
                </button>
              ) : null}
            </dt>
            <dd className="text-[length:var(--font-size-heading2)] font-semibold leading-[1.5] text-text-primary">
              {item.value?.toLocaleString("ko-KR") ?? "—"}
            </dd>
          </div>
        ))}
      </dl>
      {activeMetric ? (
        <div
          className="absolute bottom-[calc(100%_-_24px)] left-0 z-30 w-full xl:-left-[27px] xl:w-[440px] rounded-[var(--radius-2xl)] bg-bg-default p-6 shadow-[0_4px_16px_var(--color-opacity-black-10)]"
          id={tooltipId}
          onMouseLeave={() => setActiveMetric(null)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setActiveMetric(null);
          }}
          role="tooltip"
        >
          <Image
            alt=""
            className="absolute -top-[10px] right-10"
            src="/icons/lab-detail/tooltip-tail.svg"
            width={25.0526}
            height={14.25}
          />
          <h3 className="text-[length:var(--font-size-heading2)] font-semibold leading-[1.5]">
            {activeMetric === "citations" ? "피인용지수" : "h-index"}
          </h3>
          {metrics.syncedAt ? (
            <p className="mt-1 text-[length:var(--font-size-caption1)] text-text-subtle">
              기준일 {metrics.syncedAt.slice(0, 10)}
            </p>
          ) : null}
          {activeMetric === "citations" ? (
            <>
              <div className="mt-3 rounded-[var(--radius-2xl)] border border-icon-disabled p-3">
                {[10, 6, 3, 2].map((count, index) => (
                  <div
                    className="mb-2 flex items-center gap-[10px] text-[length:var(--font-size-label2)]"
                    key={count}
                  >
                    <span className="w-12 shrink-0 font-semibold">
                      논문 {String.fromCharCode(65 + index)}
                    </span>
                    <span
                      className="h-3 min-w-0 rounded-[var(--radius-md)] bg-bg-primary"
                      style={{ width: [187, 90, 48, 28][index] }}
                    />
                    <span className="w-8 shrink-0">{count}회</span>
                  </div>
                ))}
                <p className="rounded-[var(--radius-lg)] bg-bg-primary-subtle px-3 py-2 text-center text-[length:var(--font-size-label1)] font-semibold text-text-primary">
                  전부 더하면 21회 → 피인용지수 21
                </p>
              </div>
              <p className="mt-3 text-[length:var(--font-size-body2)] leading-[1.5]">
                연구가 얼마나 많이 참고됐는지 보여주는 총량이에요.
                <br />
                연구실 연구가 학계에서 많이 참고되고 있다는 뜻이에요.
              </p>
            </>
          ) : (
            <p className="mt-3 text-[length:var(--font-size-body2)] leading-[1.5]">
              h번 이상 인용된 논문이 h편 있다는 뜻이에요. 예를 들어 14번 이상
              인용된 논문이 14편이면 h-index는 14예요.
            </p>
          )}
        </div>
      ) : null}
    </section>
  );
}
