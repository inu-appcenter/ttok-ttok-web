"use client";

import Link from "next/link";
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
    <article className="flex min-w-0 flex-col gap-3 rounded-[var(--radius-xl)] bg-bg-default p-4 shadow-[0_4px_16px_var(--color-opacity-black-10)]">
      <h3
        className="truncate pb-1 text-[length:var(--font-size-heading1)] font-semibold leading-[1.5] tracking-[-0.01em]"
        title={college.collegeName}
      >
        {college.collegeName}
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
              className="flex min-w-0 items-center justify-between gap-2 rounded-sm hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary"
              href={createSearchHref({ department: department.departmentName })}
              title={department.departmentName}
            >
              <span className="min-w-0 truncate">
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
          className="self-center rounded-sm pt-1 text-[length:var(--font-size-body2)] leading-[1.5] text-text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary"
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
      className="flex flex-col gap-5 pb-12 pt-6"
    >
      <h2
        className="text-[length:var(--font-size-heading2)] font-semibold leading-[1.5] tracking-[-0.01em]"
        id="home-departments-heading"
      >
        단과대학 · 학과별 연구실
      </h2>
      {status === "loading" ? (
        <div role="status">
          <span className="sr-only">학과별 연구실을 불러오는 중</span>
          <div
            aria-hidden="true"
            className="grid grid-cols-2 gap-6 xl:grid-cols-4"
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
        <div className="grid grid-cols-2 gap-6 xl:grid-cols-4">
          {colleges.map((college) => (
            <CollegeCard college={college} key={college.college} />
          ))}
        </div>
      ) : (
        <p className="py-10 text-center text-[length:var(--font-size-body2)] text-text-subtle">
          표시할 학과별 연구실이 없어요.
        </p>
      )}
    </section>
  );
}
