import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import type { LabDetail, LabDetailListState, LabPaper } from "@/entities/lab";
import { Tag } from "@/shared/ui";
import { ContactEmailButton } from "@/features/write-contact-email";

import { DetailRetryButton } from "./detail-retry-button";

export function DetailContentCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-[var(--radius-2xl)] bg-bg-default px-4 py-[14px] shadow-[0_4px_16px_var(--color-opacity-black-10)] md:px-6 md:py-5">
      <h2 className="text-[length:var(--font-size-label1)] font-semibold leading-[1.5] md:text-[length:var(--font-size-heading1)]">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function DetailPagination({
  lab,
  kind,
  state,
  anchor,
}: {
  lab: LabDetail;
  kind: "projects" | "publications";
  state?: LabDetailListState;
  anchor?: string;
}) {
  if (!state || state.status === "error" || state.totalPages < 2) return null;
  function getHref(page: number) {
    const params = new URLSearchParams();
    const projects = kind === "projects" ? page : (lab.projectState?.page ?? 0);
    const publications =
      kind === "publications" ? page : (lab.publicationState?.page ?? 0);
    if (projects) params.set("projects", String(projects));
    if (publications) params.set("publications", String(publications));
    return `/labs/${lab.laboratoryId}${params.size ? `?${params}` : ""}#${anchor ?? kind}`;
  }
  const label = kind === "projects" ? "연구과제" : "논문";
  return (
    <nav
      aria-label={`${label} 페이지`}
      className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[length:var(--font-size-caption1)] text-text-primary"
    >
      {state.page > 0 ? (
        <Link
          className="rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-border-primary"
          href={getHref(state.page - 1)}
        >
          이전 {label}
        </Link>
      ) : (
        <span />
      )}
      <span>
        {state.page + 1} / {state.totalPages}
      </span>
      {state.page + 1 < state.totalPages ? (
        <Link
          className="rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-border-primary"
          href={getHref(state.page + 1)}
        >
          다음 {label}
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

export function ResearchProjects({
  lab,
  isMobile = false,
}: {
  lab: LabDetail;
  isMobile?: boolean;
}) {
  return (
    <div
      className="scroll-mt-24"
      id={isMobile ? "mobile-projects" : "projects"}
    >
      <DetailContentCard title="연구과제">
        {lab.projectState?.status === "error" ? (
          <p
            role="status"
            className="mt-5 text-[length:var(--font-size-body3)] text-text-subtle"
          >
            연구과제를 불러오지 못했어요.
            <br />
            <DetailRetryButton />
          </p>
        ) : lab.projects?.length ? (
          <ul className="mt-5 flex flex-col gap-5">
            {lab.projects.map((project) => (
              <li className="flex min-w-0 flex-col gap-1" key={project.id}>
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <Tag
                    className="shrink-0 !font-semibold"
                    size="sm"
                    tone={project.isOngoing ? "primary" : "default"}
                  >
                    {project.isOngoing ? "진행중" : "종료"}
                  </Tag>
                  <p className="min-w-0 text-[length:var(--font-size-caption1)] leading-[1.5] text-text-subtle md:text-[14px]">
                    {[project.period, project.agency]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <div className="min-w-0 w-full">
                  <h3
                    title={project.title}
                    className={`truncate text-[length:var(--font-size-label1)] font-semibold leading-[1.5] md:text-[length:var(--font-size-heading2)] ${project.isOngoing ? "text-text-primary" : "text-text-default"}`}
                  >
                    {project.url ? (
                      <a
                        className="block truncate hover:underline focus-visible:outline-2 focus-visible:outline-border-primary"
                        href={project.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {project.title}
                      </a>
                    ) : (
                      project.title
                    )}
                  </h3>
                  {project.keywords?.length ? (
                    <ul
                      className="mt-1 flex flex-wrap gap-2"
                      aria-label="과제 키워드"
                    >
                      {project.keywords.map((keyword) => (
                        <li
                          key={keyword}
                          className={`max-w-full break-words rounded-[var(--radius-lg)] px-2 py-1 text-[length:var(--font-size-caption1)] ${project.isOngoing ? "bg-bg-primary-subtle text-text-primary" : "bg-bg-neutral text-text-subtle"}`}
                        >
                          {keyword}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 text-[length:var(--font-size-body3)] text-text-subtle">
            등록된 연구과제가 없어요.
          </p>
        )}
        <DetailPagination
          lab={lab}
          kind="projects"
          state={lab.projectState}
          anchor={isMobile ? "mobile-projects" : "projects"}
        />
      </DetailContentCard>
    </div>
  );
}

export function PaperTitle({ paper }: { paper: LabPaper }) {
  return paper.url ? (
    <a
      className="block truncate hover:underline focus-visible:outline-2 focus-visible:outline-border-primary"
      title={paper.title}
      href={paper.url}
      rel="noreferrer"
      target="_blank"
    >
      {paper.title} ↗
    </a>
  ) : (
    <span className="block truncate" title={paper.title}>
      {paper.title}
    </span>
  );
}

export function ProfessorCard({ lab }: { lab: LabDetail; isMobile?: boolean }) {
  const professor = lab.professor;
  return (
    <section className="min-w-0 rounded-[var(--radius-2xl)] bg-bg-default p-4 shadow-[0_4px_16px_var(--color-opacity-black-10)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[length:var(--font-size-headline2)] font-semibold leading-[1.4]">
            {professor?.name ?? lab.professorName} 교수
          </h2>
          {professor?.position ? (
            <p className="mt-1 text-[length:var(--font-size-caption1)] text-text-subtlest">
              {professor.position}
            </p>
          ) : null}
        </div>
        <ContactEmailButton
          compact
          key={lab.labId}
          recipient={{
            professorName: professor?.name ?? lab.professorName,
            labName: lab.name,
            email: professor?.email ?? null,
          }}
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[length:var(--font-size-caption1)] font-semibold text-text-primary">
        {professor?.email ? (
          <a
            className="break-all underline focus-visible:outline-2 focus-visible:outline-border-primary"
            href={`mailto:${professor.email}`}
          >
            {professor.email}
          </a>
        ) : null}
        {professor?.phone ? (
          <a
            className="underline focus-visible:outline-2 focus-visible:outline-border-primary"
            href={`tel:${professor.phone}`}
          >
            {professor.phone}
          </a>
        ) : null}
      </div>
    </section>
  );
}

export function RecentPapers({
  lab,
  isMobile = false,
}: {
  lab: LabDetail;
  isMobile?: boolean;
}) {
  return (
    <section
      id={isMobile ? "mobile-publications" : "publications"}
      className="min-w-0 scroll-mt-24 rounded-[var(--radius-2xl)] bg-bg-default px-4 py-[14px] shadow-[0_4px_16px_var(--color-opacity-black-10)] md:px-6 md:py-5"
    >
      <h2>
        <Link
          href={`/labs/${lab.laboratoryId}/papers`}
          className="inline-flex items-center gap-1 text-[length:var(--font-size-label1)] font-semibold leading-[1.5] hover:underline focus-visible:outline-2 focus-visible:outline-border-primary md:text-[length:var(--font-size-heading1)]"
        >
          최근 논문
          <Image
            alt=""
            src="/icons/lab-detail/papers-chevron.svg"
            width={22}
            height={21}
          />
        </Link>
      </h2>
      {lab.publicationState?.status === "error" ? (
        <p role="status" className="mt-5 text-sm text-text-subtle">
          논문을 불러오지 못했어요.
          <br />
          <DetailRetryButton />
        </p>
      ) : lab.papers.length ? (
        <ul className="mt-5 flex min-w-0 flex-col gap-3">
          {lab.papers.map((paper) => (
            <li className="min-w-0" key={`${paper.year}-${paper.title}`}>
              <h3 className="min-w-0 text-[length:var(--font-size-label1)] font-semibold leading-[1.5] text-text-primary md:text-[length:var(--font-size-heading2)]">
                <PaperTitle paper={paper} />
              </h3>
              <p className="truncate text-[length:var(--font-size-caption1)] leading-[1.5] text-text-subtle md:text-[14px]">
                {[paper.year, paper.venue]
                  .filter((value) => value !== null && value !== "")
                  .join(" · ")}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 text-sm text-text-subtle">등록된 논문이 없어요.</p>
      )}
    </section>
  );
}
