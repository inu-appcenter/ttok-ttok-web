"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const desktopBanners = [
  "/images/home/banner/desktop-1.png",
  "/images/home/banner/desktop-2.png",
  "/images/home/banner/desktop-3.png",
] as const;

const mobileBanners = [
  "/images/home/banner/mobile-1.png",
  "/images/home/banner/mobile-2.png",
  "/images/home/banner/mobile-3.png",
] as const;

const AUTO_PLAY_INTERVAL = 5_000;

export function HomeBanner() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % desktopBanners.length);
    }, AUTO_PLAY_INTERVAL);

    return () => window.clearInterval(intervalId);
  }, []);

  const moveBanner = (direction: -1 | 1) => {
    setActiveIndex(
      (index) => (index + direction + desktopBanners.length) % desktopBanners.length,
    );
  };

  return (
    <section aria-label="서비스 소개 배너" className="relative h-40 overflow-hidden md:h-[360px]">
      <Image
        alt=""
        aria-hidden="true"
        className="object-fill md:hidden"
        fill
        priority
        sizes="100vw"
        src={mobileBanners[activeIndex]}
      />
      <Image
        alt=""
        aria-hidden="true"
        className="hidden object-fill md:block"
        fill
        priority
        sizes="100vw"
        src={desktopBanners[activeIndex]}
      />
      <button
        aria-label="이전 배너"
        className="absolute left-8 top-1/2 hidden size-10 -translate-y-1/2 cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-inverse lg:block"
        onClick={() => moveBanner(-1)}
        type="button"
      />
      <button
        aria-label="다음 배너"
        className="absolute right-8 top-1/2 hidden size-10 -translate-y-1/2 cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-inverse lg:block"
        onClick={() => moveBanner(1)}
        type="button"
      />
    </section>
  );
}
