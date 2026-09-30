"use client";

import { usePathname } from "next/navigation";

import { SiteHeader, type HeaderActiveItem } from "./site-header";

export function AppHeader({ isAuthenticated }: { isAuthenticated: boolean }) {
  const pathname = usePathname() ?? "";

  if (pathname === "/onboarding") return null;

  let activeItem: HeaderActiveItem | undefined;

  if (pathname === "/") activeItem = "home";
  else if (pathname === "/search" || pathname.startsWith("/labs/")) {
    activeItem = "search";
  } else if (pathname === "/recommendations") activeItem = "ai";

  return <SiteHeader activeItem={activeItem} isAuthenticated={isAuthenticated} />;
}
