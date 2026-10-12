"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { SiteHeader, type HeaderActiveItem } from "./site-header";

export function AppHeader({ isAuthenticated }: { isAuthenticated: boolean }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  useEffect(() => {
    // Proxy에서 쿠키가 제거된 이동에도 공유 레이아웃의 로그인 표시를 갱신합니다.
    if (pathname === "/login" && isAuthenticated) router.refresh();
  }, [pathname, isAuthenticated, router]);

  if (pathname === "/onboarding") return null;

  let activeItem: HeaderActiveItem | undefined;

  if (pathname === "/") activeItem = "home";
  else if (pathname === "/search" || pathname.startsWith("/labs/")) {
    activeItem = "search";
  } else if (pathname === "/recommendations") activeItem = "ai";

  return (
    <SiteHeader
      activeItem={activeItem}
      isAuthenticated={pathname === "/login" ? false : isAuthenticated}
    />
  );
}
