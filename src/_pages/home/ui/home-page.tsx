import Link from "next/link";
import type { CollegeOption } from "@/entities/lab";
import type { ReactNode } from "react";

import { LabCard } from "@/entities/lab";
import type { LabSummary } from "@/entities/lab";
import { HomeSearchField, MobileLabExplorer } from "@/features/search-lab";
import { MobileBottomNav } from "@/widgets/mobile-bottom-nav";
import { HomeBanner } from "@/widgets/home-banner";
import { SiteFooter } from "@/widgets/site-footer";

import { HomeDepartmentDirectory } from "./home-department-directory";
import { HomeServiceGuide } from "./home-service-guide";

export type HomePageProps = {
  labs: LabSummary[];
  departmentSection?: ReactNode;
  labsError?: string;
  categories?: string[];
  categoriesError?: string;
  colleges?: CollegeOption[];
  collegesError?: string;
};

function LabLoadError({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <p className="text-[length:var(--font-size-body2)] text-text-subtle">
        {message}
      </p>
      <Link
        className="text-[length:var(--font-size-body3)] text-text-primary underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary"
        href="/"
      >
        다시 시도하기
      </Link>
    </div>
  );
}

export function HomePage({
  labs,
  labsError,
  categories,
  categoriesError,
  colleges,
  collegesError,
  departmentSection,
}: HomePageProps) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-bg-default pb-[calc(111px_+_env(safe-area-inset-bottom))] text-text-default md:pb-0">
      <main>
        <div className="px-4 pt-[27px] md:hidden">
          <HomeBanner />
        </div>

        <div className="px-4 pb-11 md:hidden">
          <div className="mt-5">
            <MobileLabExplorer categories={categories} categoriesError={categoriesError} colleges={colleges} collegesError={collegesError} />
            <section aria-label="홈 연구실 목록" className="mt-8 flex flex-col gap-3">
              <h2 className="text-[length:var(--font-size-heading2)] font-semibold">인기 연구실 둘러보기</h2>
              {labsError ? <LabLoadError message={labsError} /> : labs.length ? (
                <div className="flex flex-col gap-2">{labs.map((lab) => <LabCard key={lab.labId} lab={lab} />)}</div>
              ) : <p className="py-10 text-center text-text-subtle">표시할 연구실이 아직 없어요.</p>}
            </section>
          </div>
        </div>

        <div className="hidden md:block">
          <section
            aria-labelledby="home-search-heading"
            className="flex min-h-[600px] items-center bg-bg-primary-subtle"
          >
            <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-8 px-[clamp(24px,8.89vw,128px)] py-12">
              <h1
                className="bg-[linear-gradient(90deg,#a7c0db_0%,#b4bade_33%,#c2aed6_66%,#d699c5_100%)] bg-clip-text text-center text-[length:var(--font-size-display2)] font-bold leading-[1.3] tracking-[-0.025em] text-transparent"
                id="home-search-heading"
              >
                어떤 연구를 하고 싶으세요?
              </h1>
              <HomeSearchField
                categories={categories}
                categoriesError={categoriesError}
                colleges={colleges}
                collegesError={collegesError}
              />
            </div>
          </section>
          <div className="mx-auto w-full max-w-[1440px] px-[clamp(24px,8.89vw,128px)]">
            <HomeServiceGuide />
            <section
              aria-labelledby="home-labs-heading"
              className="flex flex-col gap-5 pb-12 pt-6"
            >
              <h2
                className="text-[length:var(--font-size-heading2)] font-semibold leading-[1.5] tracking-[-0.01em]"
                id="home-labs-heading"
              >
                연구실 둘러보기
              </h2>
              <div className="grid grid-cols-2 gap-6 xl:grid-cols-3">
                {labsError ? (
                  <div className="col-span-full">
                    <LabLoadError message={labsError} />
                  </div>
                ) : labs.length > 0 ? (
                  labs.map((lab) => <LabCard key={lab.labId} lab={lab} />)
                ) : (
                  <p className="col-span-full py-10 text-center text-[length:var(--font-size-body2)] leading-[1.5] text-text-subtle">
                    표시할 연구실이 아직 없어요.
                  </p>
                )}
              </div>
            </section>
            {departmentSection ?? <HomeDepartmentDirectory />}
          </div>
        </div>
      </main>
      <MobileBottomNav />
      <SiteFooter />
    </div>
  );
}
