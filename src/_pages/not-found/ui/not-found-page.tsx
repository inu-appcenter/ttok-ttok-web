"use client";

import { useRouter } from "next/navigation";

import { Button, Logo } from "@/shared/ui";
import { SiteHeader } from "@/widgets/site-header";

export function NotFoundPage() {
  const router = useRouter();

  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push("/");
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg-default text-text-default">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center gap-5 px-4 pb-12 md:gap-6 md:pb-20">
        <Logo alt="똑똑" className="h-[120px] w-[83px] md:h-[173px] md:w-[120px]" priority variant="stacked" />
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="font-semibold leading-[1.5] text-bg-primary text-[length:var(--font-size-heading1)] md:text-[36px] md:font-bold">
            똑똑.. 아무도 없네요
          </h1>
          <p className="text-[length:var(--font-size-body2)] font-semibold leading-[1.5] text-text-subtle md:text-[length:var(--font-size-heading1)]">
            이전 페이지로 돌아가 볼까요?
          </p>
        </div>
        <Button className="h-11 rounded-[var(--radius-xl)] border border-bg-primary-hover bg-bg-default px-6 text-[length:var(--font-size-body2)] font-normal text-bg-primary-hover hover:bg-[var(--color-opacity-black-5)] md:h-[49px]" onClick={goBack} variant="outline">
          이전 페이지로
        </Button>
      </main>
    </div>
  );
}
