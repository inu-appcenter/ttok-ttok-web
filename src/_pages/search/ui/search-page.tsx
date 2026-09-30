import Link from "next/link";

import { LabCard, type LabSummaryPage } from "@/entities/lab";
import { LaboratorySearchField } from "@/features/search-lab";
import { Checkbox, Radio } from "@/shared/ui";

const researchFields = ["AI / ML", "데이터", "보안", "시스템", "비전", "NLP"];
const departments = [
  "컴퓨터공학부",
  "임베디드시스템공학과",
  "정보통신공학과",
  "전기공학과",
  "생명공학부",
  "스포츠과학부",
];

export type SearchPageStatus = "error" | "loading" | "ready";

export type SearchPageProps = {
  errorMessage?: string;
  category?: string;
  initialQuery?: string;
  page?: number;
  result?: LabSummaryPage;
  status?: SearchPageStatus;
};

function createSearchHref(query: string, page: number, category = "") {
  const searchParams = new URLSearchParams({ page: String(page) });

  if (query) {
    searchParams.set("q", query);
  }

  if (category) searchParams.set("category", category);

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
  category = "",
  initialQuery = "",
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

        <div className="mx-auto flex w-full max-w-[1440px] items-start gap-6 px-4 md:px-10">
          <aside
            aria-label="연구실 필터"
            className="hidden w-[208px] shrink-0 md:block"
          >
            <section className="flex flex-col items-center gap-[14px] border-b border-border-subtle py-[30px]">
              <div className="w-full">
                <h2 className="text-[20px] font-bold leading-[1.5]">연구 분야</h2>
                <p className="mt-1 text-[length:var(--font-size-caption1)] text-text-subtle">
                  필터 API 준비 중
                </p>
              </div>
              <div className="flex w-full flex-wrap gap-2">
                {researchFields.map((field) => (
                  <Radio
                    appearance="chip"
                    disabled
                    key={field}
                    name="research-field"
                    value={field}
                  >
                    {field}
                  </Radio>
                ))}
              </div>
              <button
                className="text-[length:var(--font-size-body3)] text-text-disabled underline underline-offset-2"
                disabled
                type="button"
              >
                더보기
              </button>
            </section>

            <section className="flex flex-col items-center gap-[14px] border-b border-border-subtle py-[30px]">
              <div className="w-full">
                <h2 className="text-[20px] font-bold leading-[1.5]">소속 학과</h2>
                <p className="mt-1 text-[length:var(--font-size-caption1)] text-text-subtle">
                  필터 API 준비 중
                </p>
              </div>
              <div className="flex w-full flex-col gap-2">
                {departments.map((department) => (
                  <Checkbox disabled key={department}>
                    {department}
                  </Checkbox>
                ))}
              </div>
              <button
                className="text-[length:var(--font-size-body3)] text-text-disabled underline underline-offset-2"
                disabled
                type="button"
              >
                더보기
              </button>
            </section>
          </aside>

          <section className="min-w-0 flex-1 py-8">
            <div className="mb-6 flex min-h-6 items-center justify-between gap-4">
            <p className="text-[length:var(--font-size-label1)] text-text-subtle">
              {status === "ready"
                ? `${category ? `‘${category}’ 분야 검색 결과` : normalizedQuery ? `‘${normalizedQuery}’ 검색 결과` : "전체 연구실"} · ${result?.totalElements ?? 0}개 연구실`
                : "연구실 검색 결과"}
            </p>
            </div>

          {category ? <p className="mb-4 text-sm text-text-subtle">선택한 분야: {category} · <Link className="underline" href="/search">조건 초기화</Link></p> : null}
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
                href={createSearchHref(normalizedQuery, page, category)}
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
                      href={createSearchHref(normalizedQuery, result.page - 1, category)}
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
                      href={createSearchHref(normalizedQuery, page, category)}
                      key={page}
                    >
                      {page + 1}
                    </Link>
                  ))}

                  {result.hasNext ? (
                    <Link
                      aria-label="다음 페이지"
                      className="rounded-md border border-border-subtle px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary"
                      href={createSearchHref(normalizedQuery, result.page + 1, category)}
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
                  {category
                    ? `‘${category}’ 분야의 연구실이 없어요`
                    : normalizedQuery
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
        </div>
      </main>
    </div>
  );
}
