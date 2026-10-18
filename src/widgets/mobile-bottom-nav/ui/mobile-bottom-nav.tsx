"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

type MobileBottomNavItem = {
  href: string;
  icon: string;
  activeIcon: string;
  iconSize: number;
  label: string;
};

export type MobileBottomNavProps = {
  activeHref?: string;
};

const items: MobileBottomNavItem[] = [
  {
    href: "/",
    icon: "/icons/mobile-bottom-nav/home.svg",
    activeIcon: "/icons/mobile-bottom-nav/home-active.svg",
    iconSize: 24,
    label: "홈",
  },
  {
    href: "/search",
    icon: "/icons/mobile-bottom-nav/explore.svg",
    activeIcon: "/icons/mobile-bottom-nav/explore-active.svg",
    iconSize: 24,
    label: "탐색",
  },
  {
    href: "/recommendations",
    icon: "/icons/mobile-bottom-nav/ai.svg",
    activeIcon: "/icons/mobile-bottom-nav/ai-active.svg",
    iconSize: 24,
    label: "AI추천",
  },
  {
    href: "/mypage",
    icon: "/icons/mobile-bottom-nav/my.svg",
    activeIcon: "/icons/mobile-bottom-nav/my-active.svg",
    iconSize: 22,
    label: "마이",
  },
];

const AI_GRADIENT =
  "linear-gradient(90deg, #a7c0db 0%, #b4bade 33%, #c2aed6 66%, #d699c5 100%)";

export function MobileBottomNav({ activeHref }: MobileBottomNavProps) {
  const pathname = usePathname() ?? "";
  const currentPathname = activeHref ?? pathname;

  return (
    <nav
      aria-label="모바일 주요 메뉴"
      className="fixed bottom-[calc(24px_+_env(safe-area-inset-bottom))] left-1/2 z-40 flex h-[71px] w-[calc(100%_-_32px)] max-w-[343px] -translate-x-1/2 items-center rounded-[var(--radius-full)] bg-bg-neutral p-1 shadow-[0_4px_16px_var(--color-opacity-black-10)] md:hidden"
    >
      {items.map((item) => {
        const isActive =
          item.href === "/"
            ? currentPathname === item.href
            : currentPathname === item.href ||
              currentPathname.startsWith(`${item.href}/`) ||
              (item.href === "/search" && currentPathname.startsWith("/labs/"));
        const isAiActive = isActive && item.href === "/recommendations";
        const icon = isActive ? item.activeIcon
          : item.href === "/search" && currentPathname === "/"
            ? "/icons/mobile-bottom-nav/explore-home.svg" : item.icon;

        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-[var(--radius-full)] py-2 font-semibold leading-[1.5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary ${isActive ? "bg-bg-default shadow-[0_4px_16px_var(--color-opacity-black-10)]" : ""}`}
            href={item.href}
            key={item.href}
          >
            <Image
              alt=""
              className="shrink-0"
              height={item.iconSize}
              src={icon}
              width={item.iconSize}
            />
            <span
              className={`whitespace-nowrap text-[length:var(--font-size-label1)] ${isAiActive ? "bg-clip-text text-transparent" : isActive ? "text-text-primary" : "text-text-subtlest"}`}
              style={isAiActive ? { backgroundImage: AI_GRADIENT } : undefined}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
