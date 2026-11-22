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

// 스크롤로 연구실 카드가 화면에 들어올 때마다 아래에서 떠오르며 나타난다.
// 카드가 화면 아래쪽으로 빠지면 다시 숨겨 두고, 위쪽으로 지나간 카드는 그대로 둔다.
// 그래서 내려갈 때마다 재생되고, 위로 되돌아갈 때 이미 본 카드가 다시 떠오르지 않는다.
// 모션 줄이기 설정에서는 이동 없이 투명도만 바뀐다.
export function HomeLabReveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { amount: 0.3 });
  const [delay, setDelay] = useState<number | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (isInView) {
      scheduleReveal({ element, reveal: setDelay });
      return;
    }
    // 화면 아래로 빠진 카드만 다음 등장을 위해 숨김 상태로 되돌린다.
    if (element.getBoundingClientRect().top <= 0) return;
    const frameId = requestAnimationFrame(() => setDelay(null));
    return () => cancelAnimationFrame(frameId);
  }, [isInView]);

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <m.div
          animate={delay === null ? "hidden" : "visible"}
          // 그리드 셀 높이를 카드 링크가 그대로 채우도록 grid로 감싼다.
          className="grid min-w-0"
          initial="hidden"
          ref={ref}
          variants={{
            // 숨길 때는 화면 밖이므로 즉시 되돌린다.
            hidden: { opacity: 0, transition: { duration: 0 }, y: 24 },
            visible: { opacity: 1, transition: { delay: delay ?? 0, duration: 0.5, ease: [0.22, 1, 0.36, 1] }, y: 0 },
          }}
        >
          {children}
        </m.div>
      </MotionConfig>
    </LazyMotion>
  );
}
