"use client";

import Image from "next/image";
import { useState } from "react";

export function MobileAiSummary({ paragraphs }: { paragraphs: string[] }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <section>
      <button
        aria-expanded={isExpanded}
        className="flex w-full cursor-pointer items-center justify-between rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary"
        onClick={() => setIsExpanded((current) => !current)}
        type="button"
      >
        <span className="flex items-center gap-2">
          <Image alt="" height={20} src="/icons/header/ai-active.svg" width={20} />
          <span className="bg-[linear-gradient(90deg,#a7c0db_0%,#b4bade_33%,#c2aed6_66%,#d699c5_100%)] bg-clip-text text-[length:var(--font-size-headline1)] font-semibold leading-[1.4] tracking-[-0.01em] text-transparent">
            AI 연구실 요약
          </span>
        </span>
        <span className={`relative size-6 transition-transform ${isExpanded ? "rotate-180" : ""}`}>
          <Image alt="" fill src="/icons/home/mobile/chevron-down.svg" />
        </span>
      </button>
      {isExpanded ? (
        <div className="mt-[10px] rounded-[var(--radius-xl)] border border-[#a7c0db] p-4 text-[length:var(--font-size-label2)] leading-[1.5] text-text-subtle">
          {paragraphs.map((paragraph) => (
            <p className="not-last:mb-4" key={paragraph}>
              {paragraph}
            </p>
          ))}
        </div>
      ) : null}
    </section>
  );
}
