import Image from "next/image";
import Link from "next/link";

import { LabCard } from "@/entities/lab";
import type { LabSummary } from "@/entities/lab";
import { MobileLabExplorer } from "@/features/search-lab";
import { SearchField } from "@/shared/ui";
import { MobileBottomNav } from "@/widgets/mobile-bottom-nav";
import { SiteFooter } from "@/widgets/site-footer";
import { SiteHeader } from "@/widgets/site-header";

const popularCategories = ["AI / ML", "데이터", "보안", "시스템", "비전", "NLP"];

export type HomePageProps = {
  labs: LabSummary[];
};

export function HomePage({ labs }: HomePageProps) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-bg-default pb-[calc(111px_+_env(safe-area-inset-bottom))] text-text-default md:pb-0">
      <SiteHeader activeItem="home" />
      <main>
        <div className="px-4 pb-11 pt-[27px] md:hidden">
          <section className="relative flex h-[156px] flex-col justify-center overflow-hidden rounded-[var(--radius-xl)] bg-[linear-gradient(90deg,#749fda_1.38%,#abc2e2_54.82%,#cba5d1_145.41%)] px-4 pb-4 pt-8">
            <div className="flex items-center">
              <div className="relative z-10 flex min-w-0 flex-col gap-[14px] pt-1">
                <h1 className="text-[length:var(--font-size-headline1)] font-semibold leading-[1.4] tracking-[-0.01em] text-text-inverse">
                  나에게 딱 맞는 연구실,
                  <br />
                  AI가 찾아드려요
                </h1>
                <p className="whitespace-nowrap text-[length:var(--font-size-caption1)] leading-[1.5] text-[rgba(255,255,255,0.85)]">
                  관심 분야와 조건만 알려주면, 꼭 맞는 연구실을 추천해드려요
                </p>
              </div>
              <Image
                alt=""
                aria-hidden="true"
                className="absolute right-[-12px] top-[39px] size-[71px]"
                height={71}
                src="/icons/home/mobile/hero-decoration.svg"
                width={71}
              />
            </div>
            <Image
              alt=""
              aria-hidden="true"
              className="absolute bottom-5 left-1/2 h-1.5 w-12 -translate-x-1/2"
              height={6}
              src="/icons/home/mobile/hero-pagination.svg"
              width={48}
            />
          </section>

          <div className="mt-5">
            <MobileLabExplorer labs={labs} />
          </div>
        </div>

        <div className="hidden md:block">
        <section className="relative h-[360px] overflow-hidden bg-[linear-gradient(90deg,#a7c0db_0%,#b4bade_33%,#c2aed6_66%,#d699c5_100%)]">
          <div className="mx-auto flex h-full w-full max-w-[1440px] items-start justify-between px-6 pt-12 md:px-[clamp(24px,8.89vw,128px)]">
            <div className="flex min-w-0 max-w-full flex-col items-start gap-5 pt-1">
              <span className="rounded-full bg-[rgba(255,255,255,0.18)] px-3 py-1.5 text-[length:var(--font-size-label1)] font-semibold leading-[1.5] text-text-inverse">
                AI 연구실 추천
              </span>
              <h1 className="text-[length:var(--font-size-display2)] font-bold leading-[1.3] tracking-[-0.025em] text-text-inverse">
                나에게 딱 맞는 연구실,
                <br />
                AI가 찾아드려요
              </h1>
              <p className="max-w-[560px] text-[length:var(--font-size-body1)] font-normal leading-[1.5] text-[rgba(255,255,255,0.85)] max-md:w-[270px] max-md:text-[16px]">
                관심 분야와 조건만 알려주면, 꼭 맞는 연구실을 추천해드려요
              </p>
              <Link
                className="inline-flex items-center gap-[6px] rounded-[8px] bg-bg-default px-[var(--spacing-spacing-6)] py-[14px] text-[length:var(--font-size-headline2)] font-semibold leading-[1.4] tracking-[-0.01em] text-[#344862] transition-colors hover:bg-bg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-inverse"
                href="/recommendations"
              >
                AI 추천 받아보기
                <Image alt="" height={18} src="/icons/home/hero-arrow-right.svg" width={18} />
              </Link>
            </div>
            <Image
              alt=""
              aria-hidden="true"
              className="mt-[49px] hidden size-[180px] md:block"
              height={180}
              src="/icons/home/hero-sparkle.svg"
              width={180}
            />
          </div>
          <button
            aria-label="이전 배너"
            className="absolute left-8 top-1/2 hidden size-10 -translate-y-1/2 cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-inverse lg:flex lg:items-center lg:justify-center"
            type="button"
          >
            <Image alt="" height={40} src="/icons/home/hero-arrow-left.svg" width={40} />
          </button>
          <button
            aria-label="다음 배너"
            className="absolute right-8 top-1/2 hidden size-10 -translate-y-1/2 cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-inverse lg:flex lg:items-center lg:justify-center"
            type="button"
          >
            <Image alt="" height={40} src="/icons/home/hero-arrow-right-control.svg" width={40} />
          </button>
          <Image
            alt=""
            aria-hidden="true"
            className="absolute bottom-[26px] left-1/2 hidden h-[6px] w-12 -translate-x-1/2 md:block"
            height={6}
            src="/icons/home/hero-pagination.svg"
            width={48}
          />
        </section>

        <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-[var(--spacing-spacing-4)] px-6 py-10 sm:flex-row sm:items-center md:px-[clamp(24px,8.89vw,128px)]">
          <div className="w-full flex-1">
            <SearchField
              aria-label="연구실 검색"
              elevated={false}
              placeholder="연구실명 · 교수명 · 키워드 검색"
              size="lg"
            />
          </div>
          <Link
            className="inline-flex shrink-0 items-center justify-center gap-1 overflow-hidden rounded-[var(--radius-xl)] bg-[linear-gradient(90deg,#a7c0db_0%,#b4bade_33%,#c2aed6_66%,#d699c5_100%)] px-[var(--spacing-spacing-4)] py-[var(--spacing-spacing-2)] text-[length:var(--font-size-headline2)] font-semibold leading-[1.4] tracking-[-0.01em] text-text-inverse focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary"
            href="/recommendations"
          >
            <Image alt="" height={16} src="/icons/home/ai-button-sparkles.svg" width={16} />
            AI 연구실 추천
          </Link>
        </section>

        <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-[var(--spacing-spacing-4)] px-6 py-[var(--spacing-spacing-2)] md:px-[clamp(24px,8.89vw,128px)]">
          <h2 className="text-[length:var(--font-size-heading2)] font-semibold leading-[1.5] tracking-[-0.01em] text-text-default">
            인기 분야로 둘러보기
          </h2>
          <div className="flex max-w-full flex-wrap gap-x-2 gap-y-3 sm:gap-3">
            {popularCategories.map((category) => (
              <Link
                className="rounded-full border border-border-subtle bg-bg-default px-[14px] py-1 text-[length:var(--font-size-body2)] font-normal leading-[1.5] text-text-subtle transition-colors hover:border-border-primary hover:bg-bg-primary-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary"
                href={`/search?category=${encodeURIComponent(category)}`}
                key={category}
              >
                {category}
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-6 pb-12 pt-6 md:px-[clamp(24px,8.89vw,128px)]">
          <h2 className="text-[length:var(--font-size-heading2)] font-semibold leading-[1.5] tracking-[-0.01em] text-text-default">
            인기 연구실 둘러보기
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {labs.length > 0 ? (
              labs.map((lab) => <LabCard key={lab.labId} lab={lab} />)
            ) : (
              <p className="col-span-full py-10 text-center text-[length:var(--font-size-body2)] text-text-subtle">
                표시할 연구실이 아직 없어요.
              </p>
            )}
          </div>
        </section>
        </div>
      </main>
      <MobileBottomNav />
      <SiteFooter />
    </div>
  );
}
