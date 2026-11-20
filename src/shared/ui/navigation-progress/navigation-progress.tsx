"use client";

import NextTopLoader, { useTopLoader } from "nextjs-toploader";
import { useEffect } from "react";

/** 클릭해도 페이지를 이동하지 않는 링크에 붙여 진행 표시를 바로 정리한다. */
export const SKIP_NAVIGATION_PROGRESS_ATTRIBUTE = "data-skip-navigation-progress";

// 라이브러리는 링크 클릭만 보고 진행 표시를 시작한다. Next Link도 내부 이동 시 기본 동작을 막으므로
// defaultPrevented로는 실제 이동 여부를 알 수 없어, 이동하지 않는 링크를 속성으로 구분한다.
// window 리스너는 라이브러리의 document 리스너 다음에 실행된다.
function useSkipProgressForStaticLinks() {
  const topLoader = useTopLoader();

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;
      if (!event.target.closest(`a[${SKIP_NAVIGATION_PROGRESS_ATTRIBUTE}]`)) return;
      if (topLoader.isStarted()) topLoader.done(true);
    }

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [topLoader]);
}

/**
 * router.push처럼 링크 클릭이 아닌 내부 이동을 시작할 때 진행 표시를 함께 시작한다.
 * 이동이 반영되면 라이브러리가 history 변경을 감지해 정리한다.
 */
export function useStartNavigationProgress() {
  const topLoader = useTopLoader();

  return (href: string) => {
    if (new URL(href, window.location.href).href === window.location.href) return;
    topLoader.start();
  };
}

/** 내부 페이지 이동 중 화면 상단에 표시하는 진행 바. 온보딩 단계 표시와는 별개다. */
export function NavigationProgress() {
  useSkipProgressForStaticLinks();

  return (
    <NextTopLoader
      color="var(--color-bg-primary)"
      height={3}
      shadow={false}
      showSpinner={false}
      zIndex={1600}
    />
  );
}
