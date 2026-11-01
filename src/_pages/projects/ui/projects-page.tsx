"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { LabResearchProject } from "@/entities/lab";
import { CollectionHeader } from "@/shared/ui/collection-header";
import { Tag } from "@/shared/ui";

export function ProjectsPage({
  laboratoryId,
  projects,
  error = false,
  nextPage = null,
  totalElements,
}: {
  laboratoryId: number;
  projects: LabResearchProject[];
  error?: boolean;
  nextPage?: number | null;
  totalElements?: number;
}) {
  const [sort, setSort] = useState<"default" | "name">("default");
  const router = useRouter();
  const [loaded, setLoaded] = useState({ projects, nextPage });
  const [hasLoadError, setHasLoadError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (loaded.nextPage === null) return;
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(
          `/api/labs/${laboratoryId}/projects?page=${loaded.nextPage}`,
          { signal: controller.signal },
        );
        const data: unknown = await response.json();
        if (
          !response.ok ||
          !isResearchProjectBatch(data) ||
          data.totalElements !== totalElements ||
          (data.nextPage !== null && data.nextPage <= (loaded.nextPage ?? 0))
        )
          throw new Error("연구과제 목록 응답이 올바르지 않습니다.");
        const combined = [...loaded.projects, ...data.projects];
        if (
          combined.length > data.totalElements ||
          (data.nextPage === null && combined.length !== data.totalElements)
        )
          throw new Error("연구과제 목록이 변경되었습니다.");
        if (!controller.signal.aborted)
          setLoaded({ projects: combined, nextPage: data.nextPage });
      } catch {
        if (!controller.signal.aborted) setHasLoadError(true);
      }
    }
    void load();
    return () => controller.abort();
  }, [laboratoryId, loaded, retry, totalElements]);
  const items = [...loaded.projects].sort((a, b) =>
    sort === "name"
      ? a.title.localeCompare(b.title, "ko")
      : 0,
  );
  return (
    <div className="bg-bg-default">
      <main className="mx-auto min-h-[calc(100dvh-53px)] max-w-[1264px] px-4 pb-20 pt-[27px] md:min-h-[calc(100dvh-72px)] md:px-10 md:pt-[50px]">
        <CollectionHeader
          title="연구과제 전체보기"
          defaultLabel="기본순"
          backHref={`/labs/${laboratoryId}`}
          sort={sort}
          onSort={setSort}
        />
        {error ? (
          <p role="alert" className="mt-8 text-sm text-text-error">
            연구과제를 불러오지 못했어요. {" "}
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
              총 {totalElements ?? loaded.projects.length}개
            </p>
            {loaded.nextPage !== null && (
              <p
                role={hasLoadError ? "alert" : "status"}
                className="mt-4 text-sm text-text-subtle"
              >
                {hasLoadError
                  ? "나머지 연구과제를 불러오지 못했어요."
                  : `연구과제를 불러오고 있어요. (${loaded.projects.length}/${totalElements})`}
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
                {items.map((project, index) => (
                  <li
                    key={`${project.id}-${index}`}
                    className="min-w-0 border-b border-border-subtlest py-3 last:border-0"
                  >
                    <Tag tone={project.isOngoing ? "primary" : "default"}>{project.isOngoing ? "진행중" : "종료"}</Tag>
                    <h2 className="mt-1 text-lg font-semibold leading-[1.5] text-text-primary md:text-[22px]">
                      {project.url ? (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noreferrer"
                          title={project.title}
                          className="flex min-w-0 items-center gap-1 hover:underline focus-visible:outline-2 focus-visible:outline-border-primary"
                        >
                          <span className="truncate">{project.title}</span>
                          <span aria-hidden="true" className="shrink-0">
                            ↗
                          </span>
                        </a>
                      ) : (
                        <span className="block truncate" title={project.title}>
                          {project.title}
                        </span>
                      )}
                    </h2>
                    <p className="text-sm font-bold leading-6 text-text-subtlest md:text-base">
                      {[project.period, project.agency]
                        .filter((item) => item !== null && item !== "")
                        .join(" · ")}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-20 text-center text-base text-text-subtlest">
                등록된 연구과제가 없어요.
              </p>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function isResearchProjectBatch(
  value: unknown,
): value is {
  projects: LabResearchProject[];
  nextPage: number | null;
  totalElements: number;
} {
  if (
    !value ||
    typeof value !== "object" ||
    !("projects" in value) ||
    !Array.isArray(value.projects) ||
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
  return value.projects.every(
    (project: unknown) =>
      project !== null &&
      typeof project === "object" &&
      "id" in project && typeof project.id === "string" &&
      "title" in project && typeof project.title === "string" &&
      "isOngoing" in project && typeof project.isOngoing === "boolean" &&
      "period" in project && typeof project.period === "string" &&
      "agency" in project && typeof project.agency === "string" &&
      "summary" in project && typeof project.summary === "string" &&
      "url" in project && (project.url === null || (typeof project.url === "string" && /^https?:\/\//.test(project.url))) &&
      (!("keywords" in project) || project.keywords === undefined || (Array.isArray(project.keywords) && project.keywords.every((keyword: unknown) => typeof keyword === "string"))),
  );
}
