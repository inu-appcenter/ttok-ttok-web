"use client";

import { LazyMotion, MotionConfig, domAnimation, useInView } from "motion/react";
import * as m from "motion/react-m";
import { useEffect, useRef, useState, type ReactNode } from "react";

const ROW_STAGGER = 0.12;

type PendingReveal = { element: HTMLElement; reveal: (delay: number) => void };
let pendingReveals: PendingReveal[] = [];
let isFlushScheduled = false;

// 같은 프레임에 화면에 들어온 카드를 줄(top 위치)별로 묶어 위 줄부터 차례로 나타나게 한다.
function scheduleReveal(entry: PendingReveal) {
  pendingReveals.push(entry);
  if (isFlushScheduled) return;
  isFlushScheduled = true;
  requestAnimationFrame(() => {
    const batch = pendingReveals;
    pendingReveals = [];
    isFlushScheduled = false;
    const rowTops = [...new Set(batch.map(({ element }) => Math.round(element.getBoundingClientRect().top)))].sort((a, b) => a - b);
    batch.forEach(({ element, reveal }) => {
      reveal(rowTops.indexOf(Math.round(element.getBoundingClientRect().top)) * ROW_STAGGER);
    });
  });
}

// 스크롤로 연구실 카드가 화면에 들어오면 아래에서 떠오르며 나타난다.
// 모션 줄이기 설정에서는 이동 없이 투명도만 바뀐다.
export function HomeLabReveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { amount: 0.3, once: true });
  const [delay, setDelay] = useState<number | null>(null);

  useEffect(() => {
    if (!isInView || !ref.current) return;
    scheduleReveal({ element: ref.current, reveal: setDelay });
  }, [isInView]);

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <m.div
          animate={delay === null ? undefined : { opacity: 1, y: 0 }}
          // 그리드 셀 높이를 카드 링크가 그대로 채우도록 grid로 감싼다.
          className="grid min-w-0"
          initial={{ opacity: 0, y: 24 }}
          ref={ref}
          transition={{ delay: delay ?? 0, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </m.div>
      </MotionConfig>
    </LazyMotion>
  );
}
