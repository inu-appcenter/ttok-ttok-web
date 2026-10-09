"use client";

import Link from "next/link";
import Image from "next/image";
import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { CollegeLabCount } from "@/entities/lab";
import { createSearchHref } from "@/features/search-lab";
import { Button } from "@/shared/ui";

export type HomeDepartmentDirectoryProps = {
  colleges?: CollegeLabCount[];
  status?: "ready" | "loading" | "error";
};

function CollegeCard({ college }: { college: CollegeLabCount }) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  const visibleDepartments = expanded
    ? college.departments
    : college.departments.slice(0, 3);
  return (
    <article className="flex min-h-[240px] min-w-0 flex-col gap-3 rounded-[var(--radius-xl)] bg-bg-default p-4 shadow-[0_4px_16px_var(--color-opacity-black-10)]">
      <h3
        className="truncate pb-1 text-[length:var(--font-size-heading1)] font-semibold leading-[1.5] tracking-[-0.01em]"
        title={college.collegeName}
      >
        <Link
          className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary"
          href={createSearchHref({ college: college.collegeName })}
        >
          {college.collegeName}
        </Link>
      </h3>
      <ul
        className="flex flex-col gap-3 text-[length:var(--font-size-body1)] leading-[1.5] text-text-subtle"
        id={id}
      >
        {visibleDepartments.map((department) => (
          <li
            className="min-w-0 border-b border-border-subtle pb-1 last:border-b-0"
            key={department.department}
          >
            <Link
              className="group/department flex min-w-0 items-center justify-between gap-2 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary"
              href={createSearchHref({ department: department.departmentName })}
              title={department.departmentName}
            >
              <span className="min-w-0 truncate group-hover/department:font-semibold group-hover/department:text-text-default group-focus-visible/department:font-semibold group-focus-visible/department:text-text-default">
                {department.departmentName}
              </span>
              <span className="shrink-0">
                {department.count.toLocaleString("ko-KR")}개
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {college.departments.length > 3 ? (
        <button
          aria-controls={id}
          aria-expanded={expanded}
          aria-label={`${college.collegeName} ${expanded ? "학과 접기" : "학과 더보기"}`}
          className="mt-auto self-center rounded-sm pt-1 text-[length:var(--font-size-body2)] leading-[1.5] text-text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary"
          onClick={() => setExpanded(!expanded)}
          type="button"
        >
          {expanded
            ? "접기"
            : `+${college.departments.length - 3}개 학과 더보기`}
        </button>
      ) : null}
    </article>
  );
}

function MobileCollegeAccordion({ colleges }: { colleges: CollegeLabCount[] }) {
  const defaultCollege = colleges.find((college) => college.collegeName === "공과대학") ?? colleges[0];
  const [expandedCollege, setExpandedCollege] = useState<string | null>(defaultCollege?.college ?? null);
  const id = useId();

  return (
    <div className="flex flex-col gap-2 md:hidden">
      {colleges.map((college) => {
        const isExpanded = expandedCollege === college.college;
        const panelId = `${id}-${college.college}`;
        return (
          <article className="min-w-0 overflow-hidden rounded-[var(--radius-2xl)] bg-bg-default shadow-[0_2px_8px_var(--color-opacity-black-10)]" key={college.college}>
            <h3>
              <button aria-controls={panelId} aria-expanded={isExpanded} aria-label={`${college.collegeName} 학과 ${isExpanded ? "접기" : "펼치기"}`} className="flex w-full items-center gap-3 px-4 py-3.5 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-border-primary" onClick={() => setExpandedCollege(isExpanded ? null : college.college)} type="button">
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-[length:var(--font-size-headline2)] font-semibold leading-[1.4] tracking-[-0.01em]">{college.collegeName}</span>
                  <span className="truncate text-[12px] leading-[1.5] text-text-subtle">{college.departments.slice(0, 3).map((department) => department.departmentName).join(" · ")}</span>
                </span>
                <Image alt="" className={isExpanded ? "rotate-180" : ""} height={18} src="/icons/home/mobile/chevron-down.svg" width={18} />
              </button>
            </h3>
            <ul className="grid grid-cols-2 gap-2 px-3 pb-3.5" hidden={!isExpanded} id={panelId}>
              {college.departments.map((department) => (
                <li className="min-w-0" key={department.department}>
                  <Link className="flex h-full min-h-16 flex-col justify-between gap-1 rounded-[var(--radius-xl)] bg-bg-primary-subtle px-3 py-2.5 focus-visible:outline-2 focus-visible:outline-border-primary" href={createSearchHref({ department: department.departmentName })}>
                    <span className="break-words text-[length:var(--font-size-label1)] font-semibold leading-[1.5]">{department.departmentName}</span>
                    <span className="flex items-center justify-between gap-1 text-[12px] leading-[1.5] text-text-primary">
                      <span>연구실 {department.count.toLocaleString("ko-KR")}개</span>
                      <Image alt="" className="-rotate-90" height={16} src="/icons/home/search/chevron-down.svg" width={16} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </article>
        );
      })}
    </div>
  );
}

export function HomeDepartmentDirectory({
  colleges = [],
  status = "ready",
}: HomeDepartmentDirectoryProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <section
      aria-labelledby="home-departments-heading"
      aria-busy={status === "loading" || pending}
      className="flex flex-col gap-3 py-8 md:gap-5 md:pb-12 md:pt-6"
    >
      <h2
        className="text-[20px] font-semibold leading-[1.5] tracking-[-0.01em] md:text-[length:var(--font-size-heading2)]"
        id="home-departments-heading"
      >
        단과대학 · 학과별 연구실
      </h2>
      {status === "loading" ? (
        <div role="status">
          <span className="sr-only">학과별 연구실을 불러오는 중</span>
          <div
            aria-hidden="true"
            className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-6 xl:grid-cols-4"
          >
            {Array.from({ length: 4 }, (_, index) => (
              <div
                className="h-[236px] animate-pulse rounded-[var(--radius-xl)] bg-bg-subtle"
                key={index}
              />
            ))}
          </div>
        </div>
      ) : status === "error" ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-[length:var(--font-size-body2)] text-text-subtle">
            학과별 연구실을 불러오지 못했어요.
          </p>
          <Button
            disabled={pending}
            onClick={() => startTransition(() => router.refresh())}
            variant="outline"
          >
            다시 시도
          </Button>
        </div>
      ) : colleges.length ? (
        <>
        <MobileCollegeAccordion colleges={colleges} />
        <div className="hidden grid-cols-2 gap-6 md:grid xl:grid-cols-4">
          {colleges.map((college) => (
            <CollegeCard college={college} key={college.college} />
          ))}
        </div>
        </>
      ) : (
        <p className="py-10 text-center text-[length:var(--font-size-body2)] text-text-subtle">
          표시할 학과별 연구실이 없어요.
        </p>
      )}
    </section>
  );
}
