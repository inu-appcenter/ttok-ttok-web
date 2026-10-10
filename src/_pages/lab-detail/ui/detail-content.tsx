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
              <li className="flex min-w-0 items-start gap-5" key={project.id}>
                <Tag
                  className="mt-1 shrink-0 !font-semibold"
                  size="md"
                  tone={project.isOngoing ? "primary" : "default"}
                >
                  {project.isOngoing ? "진행중" : "종료"}
                </Tag>
                <div className="min-w-0 flex-1">
                  <h3
                    className={`text-[length:var(--font-size-label1)] font-semibold leading-[1.5] md:text-[length:var(--font-size-heading2)] ${project.isOngoing ? "text-text-primary" : "text-text-default"}`}
                  >
                    {project.url ? (
                      <a
                        className="hover:underline focus-visible:outline-2 focus-visible:outline-border-primary"
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
                  <p className="line-clamp-2 text-[length:var(--font-size-caption1)] leading-[1.5] text-text-subtle md:line-clamp-1 md:text-[length:var(--font-size-body3)]">
                    {[project.period, project.agency, project.summary]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
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

export function LabNews({ lab }: { lab: LabDetail }) {
  if (!lab.news?.length) return null;
  return (
    <DetailContentCard title="랩 소식">
      <ul className="mt-5 flex flex-col gap-5">
        {lab.news.map((item) => (
          <li key={item.id}>
            <h3 className="text-[length:var(--font-size-heading2)] font-semibold leading-[1.5] text-text-primary">
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline focus-visible:outline-2 focus-visible:outline-border-primary"
                >
                  {item.title} ↗
                </a>
              ) : (
                item.title
              )}
            </h3>
            <p className="text-[length:var(--font-size-body3)] leading-[1.5] text-text-subtle">
              {[item.date, item.source].filter(Boolean).join(" · ")}
            </p>
          </li>
        ))}
      </ul>
    </DetailContentCard>
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

export function ProfessorCard({
  lab,
  isMobile = false,
}: {
  lab: LabDetail;
  isMobile?: boolean;
}) {
  const professor = lab.professor;
  return (
    <section
      className="scroll-mt-24 rounded-[var(--radius-2xl)] bg-bg-default p-4 shadow-[0_4px_16px_var(--color-opacity-black-10)]"
      id={isMobile ? "mobile-publications" : "publications"}
    >
      <h2 className="text-[length:var(--font-size-headline2)] font-semibold leading-[1.4]">
        {professor?.name ?? lab.professorName} 교수
      </h2>
      {professor?.position ? (
        <p className="mt-3 text-[length:var(--font-size-caption1)] text-text-subtlest">
          {professor.position}
        </p>
      ) : null}
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[length:var(--font-size-caption1)] font-semibold text-text-primary">
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
      <ContactEmailButton
        key={lab.labId}
        recipient={{
          professorName: professor?.name ?? lab.professorName,
          labName: lab.name,
          email: professor?.email ?? null,
        }}
      />
      <div className="mt-3 border-t border-border-subtle pt-3">
        <h3 className="flex items-center text-[length:var(--font-size-label1)] font-semibold text-text-subtle">
          최근 논문
          <Image
            alt=""
            src="/icons/lab-detail/chevron-right.svg"
            width={16}
            height={16}
          />
        </h3>
        {lab.publicationState?.status === "error" ? (
          <p
            role="status"
            className="mt-2 text-[length:var(--font-size-caption1)] text-text-subtle"
          >
            논문을 불러오지 못했어요.
            <br />
            <DetailRetryButton />
          </p>
        ) : lab.papers.length ? (
          <ul className="mt-1">
            {lab.papers.map((paper) => (
              <li
                className="flex items-start justify-between gap-2 border-b border-border-subtlest py-1 last:border-0"
                key={`${paper.year}-${paper.title}`}
              >
                <div className="min-w-0 flex-1 text-[length:var(--font-size-caption1)] font-semibold leading-[1.5] text-text-primary">
                  <PaperTitle paper={paper} />
                </div>
                <span className="max-w-[35%] shrink-0 truncate text-right text-[length:var(--font-size-caption1)] leading-[1.5] text-text-subtlest">
                  {[paper.venue, paper.year]
                    .filter((value) => value !== null && value !== "")
                    .join(" · ")}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-[length:var(--font-size-caption1)] text-text-subtle">
            등록된 논문이 없어요.
          </p>
        )}
        <DetailPagination
          lab={lab}
          kind="publications"
          state={lab.publicationState}
          anchor={isMobile ? "mobile-publications" : "publications"}
        />
      </div>
    </section>
  );
}
