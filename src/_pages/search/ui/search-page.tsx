import Link from "next/link";

import { LabCard, type LabSummaryPage } from "@/entities/lab";
import { LaboratorySearchField } from "@/features/search-lab";
import { SiteHeader } from "@/widgets/site-header";

export type SearchPageStatus = "error" | "loading" | "ready";

export type SearchPageProps = {
  errorMessage?: string;
  initialQuery?: string;
  isAuthenticated?: boolean;
  page?: number;
  result?: LabSummaryPage;
  status?: SearchPageStatus;
};

function createSearchHref(query: string, page: number) {
  const searchParams = new URLSearchParams({ page: String(page) });

  if (query) {
    searchParams.set("q", query);
  }

  return `/search?${searchParams.toString()}`;
}

function getVisiblePages(currentPage: number, totalPages: number) {
  const firstPage = Math.max(0, Math.min(currentPage - 2, totalPages - 5));
  const lastPage = Math.min(totalPages, firstPage + 5);

  return Array.from(
    { length: lastPage - firstPage },
    (_, index) => firstPage + index,
  );
}

function SearchPageSkeleton() {
  return (
    <div
      aria-label="연구실 목록을 불러오는 중"
      aria-live="polite"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
    >
      {Array.from({ length: 6 }, (_, index) => (
        <div
          className="h-[140px] animate-pulse rounded-[var(--radius-xl)] bg-bg-subtle"
          key={index}
        />
      ))}
    </div>
  );
}

export function SearchPage({
  errorMessage,
  initialQuery = "",
  isAuthenticated = false,
  page = 0,
  result,
  status = "ready",
}: SearchPageProps) {
  const normalizedQuery = initialQuery.trim();
  const labs = result?.content ?? [];
  const visiblePages = result
    ? getVisiblePages(result.page, result.totalPages)
    : [];

  return (
    <div className="min-h-screen bg-bg-default text-text-default">
      <SiteHeader activeItem="search" isAuthenticated={isAuthenticated} />
      <main>
        <section className="border-b border-border-disabled px-4 py-6 md:p-10">
          <div className="mx-auto w-full max-w-[1014px]">
            <LaboratorySearchField
              initialQuery={initialQuery}
              isDisabled={status === "loading"}
              key={initialQuery}
            />
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1184px] px-4 py-8 md:px-10">
          <div className="mb-6 flex min-h-6 items-center justify-between gap-4">
            <p className="text-[length:var(--font-size-label1)] text-text-subtle">
              {status === "ready"
                ? `${normalizedQuery ? `‘${normalizedQuery}’ 검색 결과` : "전체 연구실"} · ${result?.totalElements ?? 0}개 연구실`
                : "연구실 검색 결과"}
            </p>
          </div>

          {status === "loading" ? <SearchPageSkeleton /> : null}

          {status === "error" ? (
            <div className="flex flex-col items-center gap-5 py-24 text-center">
              <div>
                <h1 className="text-[length:var(--font-size-heading1)] font-bold">
                  연구실을 불러오지 못했어요
                </h1>
                <p className="mt-2 text-[length:var(--font-size-body2)] text-text-subtle">
                  {errorMessage ?? "잠시 후 다시 시도해주세요."}
                </p>
              </div>
              <Link
                className="rounded-[var(--radius-lg)] border border-border-primary px-5 py-2.5 text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary"
                href={createSearchHref(normalizedQuery, page)}
              >
                다시 시도
              </Link>
            </div>
          ) : null}

          {status === "ready" && labs.length ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {labs.map((lab) => (
                  <LabCard key={lab.labId} lab={lab} />
                ))}
              </div>

              {result && result.totalPages > 1 ? (
                <nav
                  aria-label="연구실 검색 결과 페이지"
                  className="mt-10 flex items-center justify-center gap-2"
                >
                  {result.page > 0 ? (
                    <Link
                      aria-label="이전 페이지"
                      className="rounded-md border border-border-subtle px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary"
                      href={createSearchHref(normalizedQuery, result.page - 1)}
                    >
                      이전
                    </Link>
                  ) : (
                    <span
                      aria-disabled="true"
                      className="rounded-md border border-border-disabled px-3 py-2 text-sm text-text-disabled"
                    >
                      이전
                    </span>
                  )}

                  {visiblePages.map((page) => (
                    <Link
                      aria-current={page === result.page ? "page" : undefined}
                      aria-label={`${page + 1}페이지`}
                      className={`size-10 items-center justify-center rounded-md text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary ${
                        page === result.page
                          ? "flex bg-bg-primary font-semibold text-text-inverse"
                          : "hidden border border-border-subtle text-text-default sm:flex"
                      }`}
                      href={createSearchHref(normalizedQuery, page)}
                      key={page}
                    >
                      {page + 1}
                    </Link>
                  ))}

                  {result.hasNext ? (
                    <Link
                      aria-label="다음 페이지"
                      className="rounded-md border border-border-subtle px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary"
                      href={createSearchHref(normalizedQuery, result.page + 1)}
                    >
                      다음
                    </Link>
                  ) : (
                    <span
                      aria-disabled="true"
                      className="rounded-md border border-border-disabled px-3 py-2 text-sm text-text-disabled"
                    >
                      다음
                    </span>
                  )}
                </nav>
              ) : null}
            </>
          ) : null}

          {status === "ready" && !labs.length ? (
            <div className="flex flex-col items-center gap-6 py-24 text-center">
              <div>
                <h1 className="text-[length:var(--font-size-display2)] font-bold leading-[1.5] tracking-[-0.01em]">
                  {normalizedQuery
                    ? `‘${normalizedQuery}’ 검색 결과가 없어요`
                    : "등록된 연구실이 없어요"}
                </h1>
                <p className="mt-1 text-[length:var(--font-size-heading1)] text-text-subtle">
                  {normalizedQuery
                    ? "다른 연구실명이나 교수명으로 다시 찾아보세요"
                    : "연구실 정보가 등록되면 이곳에 표시됩니다"}
                </p>
              </div>
              {normalizedQuery ? (
                <Link
                  className="rounded-[var(--radius-lg)] border border-border-primary bg-bg-default px-5 py-2.5 text-[length:var(--font-size-body2)] text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary"
                  href={createSearchHref("", 0)}
                >
                  검색 초기화
                </Link>
              ) : null}
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
