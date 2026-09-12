"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const AUTO_PLAY_INTERVAL = 5_000;

type BannerIndex = 0 | 1 | 2;

const bannerCopy = [
  {
    description: "관심 분야와 조건만 알려주면, 꼭 맞는 연구실을 추천해드려요",
    title: <>나에게 딱 맞는 연구실,<br />AI가 찾아드려요</>,
  },
  {
    description: "직접 경험한 연구실 정보를 공유하고, 더 나은 선택을 도와주세요",
    title: <>연구실 정보를 제공해주세요!<br />후배들에게 큰 도움이 됩니다</>,
  },
  {
    description: "“AI 연구실 요약”을 통해 쉽게 확인해보세요",
    title: <>여기저기 흩어진 연구실 공고,<br />한 곳에서 모아보세요</>,
  },
] as const;

const desktopBackgrounds = [
  "bg-[linear-gradient(90deg,#a7c0db_0%,#b4bade_33%,#c2aed6_66%,#d699c5_100%)]",
  "bg-[#d699c5]",
  "bg-[#a7c0db]",
] as const;

function Pagination({ activeIndex }: { activeIndex: BannerIndex }) {
  return (
    <div aria-label={`${activeIndex + 1}번째 배너`} className="absolute bottom-4 left-1/2 flex h-1.5 -translate-x-1/2 items-center gap-1.5 md:bottom-8">
      {[0, 1, 2].map((index) => (
        <span
          aria-hidden="true"
          className={`block rounded-full bg-white ${activeIndex === index ? "h-1.5 w-4" : "size-1.5 opacity-50"}`}
          key={index}
        />
      ))}
    </div>
  );
}

function StickyNotes() {
  return (
    <div aria-hidden="true" className="relative h-[57px] w-[84px] md:h-[205px] md:w-[304px]">
      <div className="absolute h-[205px] w-[304px] origin-top-left scale-[0.278] md:scale-100">
        <span className="absolute left-[-54px] top-[68px] flex size-[117px] rotate-[8deg] items-center justify-center bg-[#fff1ae] text-center font-mono text-[22px] font-bold leading-[1.15] text-[#382e29] shadow-[0_7px_8px_rgba(26,8,20,0.22)]">코어타임<br />있음</span>
        <span className="absolute left-[84px] top-[-35px] flex size-[117px] -rotate-[6deg] items-center justify-center bg-[#c9f2de] text-center font-mono text-[22px] font-bold leading-[1.15] text-[#382e29] shadow-[0_7px_8px_rgba(26,8,20,0.22)]">주 1회<br />미팅해요</span>
        <span className="absolute left-[192px] top-[95px] flex size-[117px] rotate-[4deg] items-center justify-center bg-[#fbd7e7] text-center font-mono text-[22px] font-bold leading-[1.15] text-[#382e29] shadow-[0_7px_8px_rgba(26,8,20,0.22)]">교수님,<br />최고에요!</span>
      </div>
    </div>
  );
}

function SubjectTags() {
  const tags = [
    ["AI・ML", "left-0 top-[14px] rotate-[8deg] bg-[#29384c] text-white"],
    ["재료공학", "left-[118px] top-0 -rotate-[6deg] bg-white text-[#29384c]"],
    ["정치외교학", "left-[151px] top-[58px] rotate-[5deg] bg-[#5d7fae] text-white"],
    ["분자생물학", "left-[10px] top-[99px] -rotate-[5deg] bg-[#749fda] text-[#29384c]"],
    ["LLM", "left-[91px] top-[150px] rotate-[4deg] bg-[#29384c] text-white"],
  ] as const;

  return (
    <div aria-hidden="true" className="relative h-[57px] w-[84px] md:h-[205px] md:w-[304px]">
      <div className="absolute h-[205px] w-[304px] origin-top-left scale-[0.278] md:scale-100">
        {tags.map(([label, position]) => (
          <span className={`absolute rounded-[2px] border-[3px] border-[#0d0d0d] px-4 py-2 text-[22px] font-semibold leading-[1.5] tracking-[-0.01em] shadow-[6px_6px_0_#0d0d0d] ${position}`} key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}

function BannerArtwork({ activeIndex }: { activeIndex: BannerIndex }) {
  if (activeIndex === 0) {
    return (
      <span className="relative block size-[180px] max-md:size-[43px]">
        <Image alt="" fill sizes="(min-width: 768px) 180px, 43px" src="/icons/home/hero-sparkle.svg" />
      </span>
    );
  }

  return activeIndex === 1 ? <StickyNotes /> : <SubjectTags />;
}

export function HomeBanner() {
  const [activeIndex, setActiveIndex] = useState<BannerIndex>(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveIndex((index) => ((index + 1) % bannerCopy.length) as BannerIndex);
    }, AUTO_PLAY_INTERVAL);

    return () => window.clearInterval(intervalId);
  }, []);

  const handleMove = (direction: -1 | 1) => {
    setActiveIndex(
      (index) => ((index + direction + bannerCopy.length) % bannerCopy.length) as BannerIndex,
    );
  };

  const copy = bannerCopy[activeIndex];

  return (
    <section aria-label="서비스 소개 배너" className={`relative h-40 overflow-hidden rounded-[var(--radius-xl)] px-6 text-white md:h-[360px] md:rounded-none md:px-8 ${desktopBackgrounds[activeIndex]}`}>
      <div className="mx-auto flex h-full max-w-[1184px] items-center justify-between gap-5 md:items-start md:pt-[77px]">
        <div className="z-10 flex flex-col gap-5">
          <h1 className="text-[16px] font-semibold leading-[1.4] tracking-[-0.01em] md:text-[40px] md:font-bold md:leading-[1.3] md:tracking-[-0.025em]">{copy.title}</h1>
          <p className="whitespace-nowrap text-[11px] leading-[1.5] text-white/85 md:text-[18px]">{copy.description}</p>
        </div>
        <div className="mr-0 shrink-0 md:mr-0">
          <BannerArtwork activeIndex={activeIndex} />
        </div>
      </div>
      <Pagination activeIndex={activeIndex} />
      <button aria-label="이전 배너" className="absolute left-8 top-1/2 hidden size-10 -translate-y-1/2 cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-inverse lg:block" onClick={() => handleMove(-1)} type="button">
        <Image alt="" fill sizes="40px" src="/icons/home/hero-arrow-left.svg" />
      </button>
      <button aria-label="다음 배너" className="absolute right-8 top-1/2 hidden size-10 -translate-y-1/2 cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-inverse lg:block" onClick={() => handleMove(1)} type="button">
        <Image alt="" fill sizes="40px" src="/icons/home/hero-arrow-right-control.svg" />
      </button>
    </section>
  );
}
