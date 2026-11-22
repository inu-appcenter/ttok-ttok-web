"use client";

import { captureAnalytics } from "@/shared/lib/analytics";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { CollegeLabCount } from "@/entities/lab";
import { createSearchHref } from "@/features/search-lab";
import { Button } from "@/shared/ui";

export type HomeDepartmentDirectoryProps = {
  colleges?: CollegeLabCount[];
  status?: "ready" | "loading" | "error";
};

const VISIBLE_DEPARTMENT_COUNT = 3;

type ExpandedRows = { columnCount: number; rows: number[] };

function DepartmentLink({ college, department }: { college: string; department: CollegeLabCount["departments"][number] }) {
  return (
    <Link
      className="group/department flex min-w-0 items-center justify-between gap-2 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary"
      href={createSearchHref({ department: department.departmentName })}
      title={department.departmentName}
      onClick={() => captureAnalytics("click_home_lab_list_select", { college, department: department.department })}
    >
      <span className="min-w-0 truncate group-hover/department:font-semibold group-hover/department:text-text-default group-focus-visible/department:font-semibold group-focus-visible/department:text-text-default">
        {department.departmentName}
      </span>
      <span className="shrink-0">
        {department.count.toLocaleString("ko-KR")}개
      </span>
    </Link>
  );
}

const departmentListClasses =
  "flex flex-col gap-3 text-[length:var(--font-size-body1)] leading-[1.5] text-text-subtle";

function CollegeCard({
  college,
  isExpanded,
  onToggle,
}: {
  college: CollegeLabCount;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const id = useId();
  const visibleDepartments = college.departments.slice(0, VISIBLE_DEPARTMENT_COUNT);
  const extraDepartments = college.departments.slice(VISIBLE_DEPARTMENT_COUNT);
  const hasExtra = extraDepartments.length > 0;

  return (
    <article className="flex min-h-[240px] min-w-0 flex-col gap-3 rounded-[var(--radius-xl)] bg-bg-default p-4 shadow-[0_4px_16px_var(--color-opacity-black-10)]">
      <h3
        className="truncate pb-1 text-[length:var(--font-size-heading1)] font-semibold leading-[1.5] tracking-[-0.01em]"
        title={college.collegeName}
      >
        <Link
          className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary"
          href={createSearchHref({ college: college.collegeName })}
          onClick={() => captureAnalytics("click_home_lab_list_select", { college: college.college, department: null })}
        >
          {college.collegeName}
        </Link>
      </h3>
      <div>
        <ul className={departmentListClasses}>
          {visibleDepartments.map((department, index) => (
            <li
              className={`min-w-0 pb-1 ${index < visibleDepartments.length - 1 || (hasExtra && isExpanded) ? "border-b border-border-subtle" : ""}`}
              key={department.department}
            >
              <DepartmentLink college={college.college} department={department} />
            </li>
          ))}
        </ul>
        {hasExtra ? (
          // 높이를 재지 않고 grid 행을 0fr↔1fr로 바꿔 숨긴 학과 수만큼 펼친다.
          <div
            className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            id={id}
            inert={!isExpanded}
          >
            <div className="min-h-0 overflow-hidden">
              <ul className={`${departmentListClasses} pt-3`}>
                {extraDepartments.map((department) => (
                  <li
                    className="min-w-0 border-b border-border-subtle pb-1 last:border-b-0"
                    key={department.department}
                  >
                    <DepartmentLink college={college.college} department={department} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>
      {hasExtra ? (
        <button
          aria-controls={id}
          aria-expanded={isExpanded}
          aria-label={`${college.collegeName} ${isExpanded ? "학과 접기" : "학과 더보기"}`}
          className="mt-auto self-center rounded-sm pt-1 text-[length:var(--font-size-body2)] leading-[1.5] text-text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary"
          onClick={onToggle}
          type="button"
        >
          {isExpanded ? "접기" : `+${extraDepartments.length}개 학과 더보기`}
        </button>
      ) : null}
    </article>
  );
}

function getColumnCount(grid: HTMLElement | null) {
  if (!grid) return 0;
  const columns = getComputedStyle(grid).gridTemplateColumns;
  return columns === "none" ? 0 : columns.split(" ").filter(Boolean).length;
}

// 한 줄의 카드는 가장 긴 카드 높이로 늘어나므로 같은 줄을 함께 펼쳐 숨긴 학과 옆에 빈 공간이 생기지 않게 한다.
// 열 수가 바뀌면 줄 구성이 달라지므로 펼친 상태를 적용하지 않는다(모두 접힘).
function DesktopCollegeGrid({ colleges }: { colleges: CollegeLabCount[] }) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [columnCount, setColumnCount] = useState(0);
  const [expandedRows, setExpandedRows] = useState<ExpandedRows>({ columnCount: 0, rows: [] });

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const observer = new ResizeObserver(() => setColumnCount(getColumnCount(grid)));
    observer.observe(grid);
    return () => observer.disconnect();
  }, []);

  function handleToggle(index: number) {
    const currentColumnCount = getColumnCount(gridRef.current) || 1;
    const row = Math.floor(index / currentColumnCount);
    setExpandedRows((previous) => {
      const rows = previous.columnCount === currentColumnCount ? previous.rows : [];
      return {
        columnCount: currentColumnCount,
        rows: rows.includes(row) ? rows.filter((value) => value !== row) : [...rows, row],
      };
    });
  }

  function isRowExpanded(index: number) {
    if (!columnCount || expandedRows.columnCount !== columnCount) return false;
    return expandedRows.rows.includes(Math.floor(index / columnCount));
  }

  return (
    <div className="hidden grid-cols-2 gap-6 md:grid xl:grid-cols-4" ref={gridRef}>
      {colleges.map((college, index) => (
        <CollegeCard
          college={college}
          isExpanded={isRowExpanded(index)}
          key={college.college}
          onToggle={() => {
            captureAnalytics("click_home_dept_lab_list_more", { college: college.college, college_expanded: !isRowExpanded(index) });
            handleToggle(index);
          }}
        />
      ))}
    </div>
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
              <button aria-controls={panelId} aria-expanded={isExpanded} aria-label={`${college.collegeName} 학과 ${isExpanded ? "접기" : "펼치기"}`} className="flex w-full items-center gap-3 px-4 py-3.5 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-border-primary" onClick={() => {
                captureAnalytics("click_home_dept_lab_list_more", { college: college.college, college_expanded: !isExpanded });
                setExpandedCollege(isExpanded ? null : college.college);
              }} type="button">
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
                  <Link className="flex h-full min-h-16 flex-col justify-between gap-1 rounded-[var(--radius-xl)] bg-bg-primary-subtle px-3 py-2.5 focus-visible:outline-2 focus-visible:outline-border-primary" href={createSearchHref({ department: department.departmentName })} onClick={() => captureAnalytics("click_home_lab_list_select", { college: college.college, department: department.department })}>
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
        <DesktopCollegeGrid colleges={colleges} />
        </>
      ) : (
        <p className="py-10 text-center text-[length:var(--font-size-body2)] text-text-subtle">
          표시할 학과별 연구실이 없어요.
        </p>
      )}
    </section>
  );
}
