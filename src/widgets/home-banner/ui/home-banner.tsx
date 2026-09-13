"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
} from "react";

const AUTO_PLAY_INTERVAL = 5_000;
const SLIDE_COUNT = 3;

type BannerIndex = 0 | 1 | 2;

const banners = [
  {
    desktopImage: "/images/home/banner/slide-1-desktop.png",
    description: "관심 분야와 조건만 알려주면, 꼭 맞는 연구실을 추천해드려요",
    mobileImage: "/images/home/banner/slide-1-mobile.png",
    title: <>나에게 딱 맞는 연구실,<br />AI가 찾아드려요</>,
  },
  {
    desktopImage: "/images/home/banner/slide-2-desktop.png",
    description: "직접 경험한 연구실 정보를 공유하고, 더 나은 선택을 도와주세요",
    mobileImage: "/images/home/banner/slide-2-mobile.png",
    title: <>연구실 정보를 제공해주세요!<br />후배들에게 큰 도움이 됩니다</>,
  },
  {
    desktopImage: "/images/home/banner/slide-3-desktop.png",
    description: "“AI 연구실 요약”을 통해 쉽게 확인해보세요",
    mobileImage: "/images/home/banner/slide-3-mobile.png",
    title: <>여기저기 흩어진 연구실 공고,<br />한 곳에서 모아보세요</>,
  },
] as const;

function Pagination({
  activeIndex,
  onSelect,
}: {
  activeIndex: BannerIndex;
  onSelect: (index: BannerIndex) => void;
}) {
  return (
    <div className="absolute bottom-4 left-1/2 z-10 flex h-1.5 -translate-x-1/2 items-center gap-1.5 md:bottom-8">
      {banners.map((_, index) => {
        const isActive = activeIndex === index;

        return (
          <button
            aria-current={isActive ? "true" : undefined}
            aria-label={`${index + 1}번째 배너 보기`}
            className={`block rounded-full bg-white transition-[width,opacity] duration-300 ${isActive ? "h-1.5 w-4" : "size-1.5 opacity-50"}`}
            key={index}
            onClick={() => onSelect(index as BannerIndex)}
            type="button"
          />
        );
      })}
    </div>
  );
}

export function HomeBanner() {
  const [activeIndex, setActiveIndex] = useState<BannerIndex>(0);
  const intervalIdRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);

  const clearAutoplay = useCallback(() => {
    if (intervalIdRef.current !== null) {
      window.clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  }, []);

  const startAutoplay = useCallback(() => {
    clearAutoplay();

    if (isPausedRef.current) {
      return;
    }

    intervalIdRef.current = window.setInterval(() => {
      setActiveIndex((index) => ((index + 1) % SLIDE_COUNT) as BannerIndex);
    }, AUTO_PLAY_INTERVAL);
  }, [clearAutoplay]);

  useEffect(() => {
    startAutoplay();

    return clearAutoplay;
  }, [clearAutoplay, startAutoplay]);

  const selectBanner = (index: BannerIndex) => {
    setActiveIndex(index);
    startAutoplay();
  };

  const handleMove = (direction: -1 | 1) => {
    setActiveIndex(
      (index) => ((index + direction + SLIDE_COUNT) % SLIDE_COUNT) as BannerIndex,
    );
    startAutoplay();
  };

  const pauseAutoplay = () => {
    isPausedRef.current = true;
    clearAutoplay();
  };

  const resumeAutoplay = () => {
    isPausedRef.current = false;
    startAutoplay();
  };

  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      resumeAutoplay();
    }
  };

  return (
    <section
      aria-label="서비스 소개 배너"
      className="relative aspect-[5/2] overflow-hidden rounded-[var(--radius-xl)] text-white md:aspect-[4/1] md:rounded-none"
      onBlur={handleBlur}
      onFocus={pauseAutoplay}
      onMouseEnter={pauseAutoplay}
      onMouseLeave={resumeAutoplay}
    >
      <div
        className="flex h-full transition-transform duration-500 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {banners.map((banner, index) => (
          <article
            aria-hidden={activeIndex !== index}
            className="relative w-full shrink-0 px-6 md:px-8"
            key={index}
          >
            <span aria-hidden="true" className="absolute inset-0 md:hidden">
              <Image
                alt=""
                fill
                priority={index === 0}
                sizes="100vw"
                src={banner.mobileImage}
              />
            </span>
            <span aria-hidden="true" className="absolute inset-0 hidden md:block">
              <Image
                alt=""
                fill
                priority={index === 0}
                sizes="100vw"
                src={banner.desktopImage}
              />
            </span>
            <div className="relative mx-auto flex h-full max-w-[1184px] items-center">
              <div className="z-10 flex flex-col gap-5">
                <h1 className="text-[16px] font-semibold leading-[1.4] tracking-[-0.01em] md:text-[40px] md:font-bold md:leading-[1.3] md:tracking-[-0.025em]">
                  {banner.title}
                </h1>
                <p className="whitespace-nowrap text-[11px] leading-[1.5] text-white/85 md:text-[18px]">
                  {banner.description}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
      <Pagination activeIndex={activeIndex} onSelect={selectBanner} />
      <button
        aria-label="이전 배너"
        className="absolute left-8 top-1/2 z-10 hidden size-10 -translate-y-1/2 cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-inverse lg:block"
        onClick={() => handleMove(-1)}
        type="button"
      >
        <Image alt="" fill sizes="40px" src="/icons/home/hero-arrow-left.svg" />
      </button>
      <button
        aria-label="다음 배너"
        className="absolute right-8 top-1/2 z-10 hidden size-10 -translate-y-1/2 cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-inverse lg:block"
        onClick={() => handleMove(1)}
        type="button"
      >
        <Image alt="" fill sizes="40px" src="/icons/home/hero-arrow-right-control.svg" />
      </button>
    </section>
  );
}
