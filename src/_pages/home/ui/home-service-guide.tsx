"use client";

import { captureAnalytics } from "@/shared/lib/analytics";
import { LazyMotion, domAnimation } from "motion/react";
import type { ReactNode } from "react";

import { LoginRequiredLink } from "@/shared/lib/auth/login-required";

import { MailPreview, RecommendationPreview } from "./home-service-previews";

function CoffeeChatPreview() {
  return (
    <div className="w-full rounded-[var(--radius-2xl)] bg-bg-default px-4 pb-2 pt-3.5">
      <p className="mb-2.5 text-[length:var(--font-size-label1)] font-semibold">커피챗</p>
      <div className="py-1 text-[length:var(--font-size-caption1)] text-text-subtle">
        <p className="flex justify-between gap-2 border-b border-border-subtle py-1"><span>학부연구생 A</span><span className="text-text-primary">오픈채팅 열기 ↗</span></p>
        <p className="flex justify-between gap-2 py-1"><span>학부연구생 B</span><span className="text-text-primary">ttokttok@inu.ac.kr</span></p>
      </div>
    </div>
  );
}

function ServiceCard({ card, title, description, children, href, linkLabel, requiresLogin = false }: {
  card: "recommend" | "mail" | "coffeechat";
  title: string;
  description: ReactNode;
  children: ReactNode;
  href?: string;
  linkLabel?: string;
  requiresLogin?: boolean;
}) {
  return (
    <article onClickCapture={() => captureAnalytics("click_home_guide", { card })} className="flex min-h-[121px] min-w-0 overflow-hidden rounded-[var(--radius-xl)] bg-bg-default shadow-[0_2px_8px_var(--color-opacity-black-10)] md:flex-col md:rounded-[var(--radius-2xl)] md:shadow-[0_4px_16px_var(--color-opacity-black-10)]">
      <div aria-hidden="true" className="relative flex w-[min(160px,46.65%)] shrink-0 items-center justify-center overflow-hidden bg-[var(--color-primary-primary-100)] md:h-[218px] md:w-full md:px-6 md:py-4"><div className="absolute top-1/2 w-[333.333px] shrink-0 -translate-y-1/2 scale-[0.4] md:static md:w-full md:shrink md:translate-y-0 md:scale-100">{children}</div></div>
      <div className="flex min-w-0 flex-1 flex-col items-start justify-center gap-1 py-3 pl-4 pr-3 md:justify-start md:gap-2.5 md:p-6">
        <h3 className="text-[length:var(--font-size-headline2)] font-semibold leading-[1.4] tracking-[-0.01em] md:text-[length:var(--font-size-heading2)] md:leading-[1.5]">{title}</h3>
        <p className="text-[length:var(--font-size-label2)] leading-[1.5] text-text-subtle md:text-[length:var(--font-size-body2)]">{description}</p>
        {href && linkLabel && <LoginRequiredLink className="rounded-sm text-[length:var(--font-size-label1)] font-semibold leading-[1.5] text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary md:text-[length:var(--font-size-body2)]" href={href} onClickCapture={() => captureAnalytics("click_home_guide_suggestion")} isAuthenticated={requiresLogin ? undefined : true}>{linkLabel}<span aria-hidden="true"> →</span></LoginRequiredLink>}
      </div>
    </article>
  );
}

export function HomeServiceGuide({ headingId = "home-services-heading" }: { headingId?: string }) {
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3 py-8 md:gap-5 md:py-12">
      <h2 className="text-[20px] font-semibold leading-[1.5] tracking-[-0.01em] md:text-[length:var(--font-size-heading2)]" id={headingId}>처음이라면 이렇게 시작해 보세요</h2>
      <LazyMotion features={domAnimation} strict>
        <div className="grid grid-cols-1 gap-2 md:gap-5 lg:grid-cols-3">
          <ServiceCard card="recommend" href="/recommendations" requiresLogin linkLabel="추천 받으러 가기" title="AI 추천 받기" description="대화하듯 관심사를 말하면 연구실을 추천해드려요"><RecommendationPreview /></ServiceCard>
          <ServiceCard card="mail" title="교수님께 메일 쓰기" description={<>원하는 연구실을 고르고,<br />교수님께 보낼 메일을 첨삭받아 보세요</>}><MailPreview /></ServiceCard>
          <ServiceCard card="coffeechat" title="커피챗 신청하기" description={<>궁금한 연구실 선배에게<br />커피챗으로 연구실 생활을 물어보세요</>}><CoffeeChatPreview /></ServiceCard>
        </div>
      </LazyMotion>
    </section>
  );
}
