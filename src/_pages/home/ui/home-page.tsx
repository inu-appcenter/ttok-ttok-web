import Link from "next/link";

import { LabCard } from "@/entities/lab";
import type { LabSummary } from "@/entities/lab";
import { HomeSearchField, MobileLabExplorer } from "@/features/search-lab";
import { MobileBottomNav } from "@/widgets/mobile-bottom-nav";
import { HomeBanner } from "@/widgets/home-banner";
import { SiteFooter } from "@/widgets/site-footer";
import { SiteHeader } from "@/widgets/site-header";

const popularCategories = ["AI / ML", "데이터", "보안", "시스템", "비전", "NLP"];

export type HomePageProps = {
  isAuthenticated?: boolean;
  labs: LabSummary[];
};

export function HomePage({ isAuthenticated = false, labs }: HomePageProps) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-bg-default pb-[calc(111px_+_env(safe-area-inset-bottom))] text-text-default md:pb-0">
      <SiteHeader activeItem="home" isAuthenticated={isAuthenticated} />
      <main>
        <div className="px-4 pt-[27px] md:px-0 md:pt-0">
          <HomeBanner />
        </div>

        <div className="px-4 pb-11 md:hidden">
          <div className="mt-5">
            <MobileLabExplorer labs={labs} />
          </div>
        </div>

        <div className="hidden md:block">
        <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-[var(--spacing-spacing-4)] px-6 py-10 sm:flex-row sm:items-center md:px-[clamp(24px,8.89vw,128px)]">
          <div className="w-full flex-1">
            <HomeSearchField />
          </div>
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
