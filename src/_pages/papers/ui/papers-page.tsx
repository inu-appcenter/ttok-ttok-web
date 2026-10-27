"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { LabPaper } from "@/entities/lab";
import { CollectionHeader } from "@/shared/ui/collection-header";

export function PapersPage({
  laboratoryId,
  papers,
  error = false,
  nextPage = null,
  totalElements,
}: {
  laboratoryId: number;
  papers: LabPaper[];
  error?: boolean;
  nextPage?: number | null;
  totalElements?: number;
}) {
  const [sort, setSort] = useState<"default" | "name">("default");
  const router = useRouter();
  const [loaded, setLoaded] = useState({ papers, nextPage });
  const [hasLoadError, setHasLoadError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (loaded.nextPage === null) return;
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(
          `/api/labs/${laboratoryId}/publications?page=${loaded.nextPage}`,
          { signal: controller.signal },
        );
        const data: unknown = await response.json();
        if (
          !response.ok ||
          !isPublicationBatch(data) ||
          data.totalElements !== totalElements ||
          (data.nextPage !== null && data.nextPage <= (loaded.nextPage ?? 0))
        )
          throw new Error("논문 목록 응답이 올바르지 않습니다.");
        const combined = [...loaded.papers, ...data.papers];
        if (
          combined.length > data.totalElements ||
          (data.nextPage === null && combined.length !== data.totalElements)
        )
          throw new Error("논문 목록이 변경되었습니다.");
        if (!controller.signal.aborted)
          setLoaded({ papers: combined, nextPage: data.nextPage });
      } catch {
        if (!controller.signal.aborted) setHasLoadError(true);
      }
    }
    void load();
    return () => controller.abort();
  }, [laboratoryId, loaded, retry, totalElements]);
  const items = [...loaded.papers].sort((a, b) =>
    sort === "name"
      ? a.title.localeCompare(b.title, "ko")
      : (b.year ?? -1) - (a.year ?? -1),
  );
  return (
    <div className="bg-bg-default">
      <main className="mx-auto min-h-[calc(100dvh-53px)] max-w-[1264px] px-4 pb-20 pt-[27px] md:min-h-[calc(100dvh-72px)] md:px-10 md:pt-[50px]">
        <CollectionHeader
          title="논문 전체보기"
          backHref={`/labs/${laboratoryId}#publications`}
          sort={sort}
          onSort={setSort}
        />
        {error ? (
          <p role="alert" className="mt-8 text-sm text-text-error">
            논문을 불러오지 못했어요.{" "}
            <button
              type="button"
              className="underline"
              onClick={() => router.refresh()}
            >
              다시 불러오기
            </button>
          </p>
        ) : (
          <>
            <p className="mt-8 text-base font-bold leading-6 text-text-subtle">
              총 {totalElements ?? loaded.papers.length}개
            </p>
            {loaded.nextPage !== null && (
              <p
                role={hasLoadError ? "alert" : "status"}
                className="mt-4 text-sm text-text-subtle"
              >
                {hasLoadError
                  ? "나머지 논문을 불러오지 못했어요."
                  : `논문을 불러오고 있어요. (${loaded.papers.length}/${totalElements})`}
                {hasLoadError && (
                  <button
                    type="button"
                    className="ml-2 underline"
                    onClick={() => {
                      setHasLoadError(false);
                      setRetry((value) => value + 1);
                    }}
                  >
                    다시 불러오기
                  </button>
                )}
              </p>
            )}
            {items.length ? (
              <ul className="mt-8">
                {items.map((paper, index) => (
                  <li
                    key={`${paper.url}-${paper.title}-${index}`}
                    className="min-w-0 border-b border-border-subtlest py-3 last:border-0"
                  >
                    <h2 className="text-lg font-semibold leading-[1.5] text-text-primary md:text-[22px]">
                      {paper.url ? (
                        <a
                          href={paper.url}
                          target="_blank"
                          rel="noreferrer"
                          title={paper.title}
                          className="flex min-w-0 items-center gap-1 hover:underline focus-visible:outline-2 focus-visible:outline-border-primary"
                        >
                          <span className="truncate">{paper.title}</span>
                          <span aria-hidden="true" className="shrink-0">
                            ↗
                          </span>
                        </a>
                      ) : (
                        <span className="block truncate" title={paper.title}>
                          {paper.title}
                        </span>
                      )}
                    </h2>
                    <p className="text-sm font-bold leading-6 text-text-subtlest md:text-base">
                      {[paper.year, paper.venue]
                        .filter((item) => item !== null && item !== "")
                        .join(" · ")}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-20 text-center text-base text-text-subtlest">
                등록된 논문이 없어요.
              </p>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function isPublicationBatch(
  value: unknown,
): value is {
  papers: LabPaper[];
  nextPage: number | null;
  totalElements: number;
} {
  if (
    !value ||
    typeof value !== "object" ||
    !("papers" in value) ||
    !Array.isArray(value.papers) ||
    !("totalElements" in value) ||
    typeof value.totalElements !== "number" ||
    !Number.isSafeInteger(value.totalElements) ||
    value.totalElements < 0 ||
    !("nextPage" in value) ||
    !(
      value.nextPage === null ||
      (typeof value.nextPage === "number" &&
        Number.isSafeInteger(value.nextPage) &&
        value.nextPage > 0)
    )
  )
    return false;
  return value.papers.every(
    (paper: unknown) =>
      paper !== null &&
      typeof paper === "object" &&
      "title" in paper &&
      typeof paper.title === "string" &&
      "venue" in paper &&
      typeof paper.venue === "string" &&
      "year" in paper &&
      (paper.year === null || typeof paper.year === "number") &&
      "url" in paper &&
      (paper.url === null ||
        (typeof paper.url === "string" && /^https?:\/\//.test(paper.url))),
  );
}
