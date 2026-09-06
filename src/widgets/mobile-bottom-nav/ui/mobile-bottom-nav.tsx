"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type MobileBottomNavItem = {
  href: string;
  icon: string;
  iconSize: number;
  label: string;
};

const items: MobileBottomNavItem[] = [
  {
    href: "/",
    icon: "/icons/home/mobile/home.svg",
    iconSize: 24,
    label: "홈",
  },
  {
    href: "/recommendations",
    icon: "/icons/home/mobile/sparkles.svg",
    iconSize: 24,
    label: "AI추천",
  },
  {
    href: "/mypage",
    icon: "/icons/home/mobile/profile.svg",
    iconSize: 22,
    label: "마이",
  },
];

const AI_GRADIENT =
  "linear-gradient(90deg, #a7c0db 0%, #b4bade 33%, #c2aed6 66%, #d699c5 100%)";

export function MobileBottomNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav
      aria-label="모바일 주요 메뉴"
      className="fixed bottom-[calc(20px_+_env(safe-area-inset-bottom))] left-1/2 z-40 flex h-[71px] w-[calc(100%_-_32px)] max-w-[343px] -translate-x-1/2 items-center rounded-[var(--radius-full)] bg-bg-neutral p-1 shadow-[0_4px_8px_var(--color-opacity-black-10)] md:hidden"
    >
      {items.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === item.href ||
              pathname.startsWith("/labs/") ||
              pathname.startsWith("/search")
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const isAiActive = isActive && item.href === "/recommendations";
        const activeColor = isAiActive ? AI_GRADIENT : "var(--color-text-primary)";

        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-[var(--radius-full)] py-2 font-semibold leading-[1.5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary ${isActive ? "bg-bg-default shadow-[0_4px_8px_var(--color-opacity-black-10)]" : ""}`}
            href={item.href}
            key={item.href}
          >
            <span
              aria-hidden="true"
              className="block shrink-0"
              style={{
                background: isActive ? activeColor : "var(--color-text-subtlest)",
                height: item.iconSize,
                maskImage: `url(${item.icon})`,
                maskPosition: "center",
                maskRepeat: "no-repeat",
                maskSize: "contain",
                WebkitMaskImage: `url(${item.icon})`,
                WebkitMaskPosition: "center",
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskSize: "contain",
                width: item.iconSize,
              }}
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
