"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { LabCard } from "@/entities/lab";
import type { LabSummary } from "@/entities/lab";
import { BottomSheet, Button, Checkbox, SearchField } from "@/shared/ui";

type SheetType = "department" | "field" | null;

const researchFields = [
  "데이터베이스",
  "빅데이터",
  "NLP",
  "LLM",
  "컴퓨터비전",
  "로보틱스",
  "보안",
  "네트워크",
  "시스템",
  "임베디드",
  "반도체",
  "HCI",
  "그래픽스",
  "알고리즘",
  "프로그래밍언어",
  "바이오인포매틱스",
  "양자컴퓨팅",
  "클라우드",
];

const colleges = ["공과대학", "자연과학대학", "인문대학", "사회과학대학", "경영대학", "생활과학대학"];

const departmentsByCollege: Record<string, string[]> = {
  공과대학: [
    "컴퓨터공학부",
    "전기공학과",
    "기계공학과",
    "화학공학과",
    "신소재공학과",
    "산업공학과",
    "임베디드시스템공학과",
  ],
  자연과학대학: ["수학과", "물리학과", "화학과", "생명과학과"],
  인문대학: ["국어국문학과", "영어영문학과"],
  사회과학대학: ["행정학과", "사회복지학과"],
  경영대학: ["경영학부", "세무회계학과"],
  생활과학대학: ["소비자학과", "패션산업학과"],
};

export type MobileLabExplorerProps = {
  labs: LabSummary[];
};

function FilterButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      className="inline-flex cursor-pointer items-center justify-center rounded-full border border-border-subtle bg-bg-default px-2 py-0.5 text-[length:var(--font-size-label2)] leading-[1.5] text-text-default focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary"
      onClick={onClick}
      type="button"
    >
      {label}
      <Image
        alt=""
        height={12}
        src="/icons/home/mobile/chevron-down.svg"
        width={12}
      />
    </button>
  );
}

export function MobileLabExplorer({ labs }: MobileLabExplorerProps) {
  const [activeSheet, setActiveSheet] = useState<SheetType>(null);
  const [activeCollege, setActiveCollege] = useState(colleges[0]);
  const [appliedDepartments, setAppliedDepartments] = useState<string[]>([]);
  const [appliedFields, setAppliedFields] = useState<string[]>([]);
  const [departmentQuery, setDepartmentQuery] = useState("");
  const [draftDepartments, setDraftDepartments] = useState<string[]>([]);
  const [draftFields, setDraftFields] = useState<string[]>([]);
  const [fieldQuery, setFieldQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!activeSheet) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setActiveSheet(null);
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeSheet]);

  const filteredLabs = useMemo(
    () =>
      labs.filter((lab) => {
        const normalizedSearchQuery = searchQuery.trim().toLocaleLowerCase("ko-KR");
        const matchesSearch =
          !normalizedSearchQuery ||
          [lab.name, lab.professorName, lab.department, ...lab.tags].some((value) =>
            value.toLocaleLowerCase("ko-KR").includes(normalizedSearchQuery),
          );
        const matchesField =
          appliedFields.length === 0 ||
          appliedFields.some((field) => lab.tags.includes(field));
        const matchesDepartment =
          appliedDepartments.length === 0 ||
          appliedDepartments.includes(lab.department);

        return matchesSearch && matchesField && matchesDepartment;
      }),
    [appliedDepartments, appliedFields, labs, searchQuery],
  );

  const visibleFields = researchFields.filter((field) =>
    field.toLocaleLowerCase("ko-KR").includes(fieldQuery.trim().toLocaleLowerCase("ko-KR")),
  );

  const visibleDepartments = departmentsByCollege[activeCollege].filter((department) =>
    department
      .toLocaleLowerCase("ko-KR")
      .includes(departmentQuery.trim().toLocaleLowerCase("ko-KR")),
  );

  function openFieldSheet() {
    setDraftFields(appliedFields);
    setFieldQuery("");
    setActiveSheet("field");
  }

  function openDepartmentSheet() {
    setDraftDepartments(appliedDepartments);
    setDepartmentQuery("");
    setActiveSheet("department");
  }

  function toggleValue(value: string, values: string[], setValues: (next: string[]) => void) {
    setValues(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  }

  return (
    <>
      <div className="flex flex-col gap-5">
        <div className="flex h-[37px] w-full items-center gap-2 overflow-hidden rounded-[var(--radius-xl)] border border-border-subtle bg-bg-default px-3 focus-within:border-border-primary">
          <Image alt="" height={16} src="/icons/home/mobile/search.svg" width={16} />
          <input
            aria-label="연구실명, 교수명 또는 키워드 검색"
            className="min-w-0 flex-1 bg-transparent text-[length:var(--font-size-caption1)] leading-[1.5] text-text-default outline-none placeholder:text-text-subtle"
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="연구실명 · 교수명 · 키워드 검색"
            type="search"
            value={searchQuery}
          />
          <Link
            className="inline-flex shrink-0 items-center gap-0.5 rounded-[var(--radius-lg)] bg-[linear-gradient(90deg,#a7c0db_0%,#b4bade_33%,#c2aed6_66%,#d699c5_100%)] px-2.5 py-1 text-[length:var(--font-size-caption2)] font-semibold leading-[1.5] text-text-inverse focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary"
            href="/recommendations"
          >
            <Image alt="" height={12} src="/icons/home/ai-button-sparkles.svg" width={12} />
            AI 연구실 추천
          </Link>
        </div>

        <div className="flex gap-1">
          <FilterButton
            label={`연구 분야${appliedFields.length ? ` ${appliedFields.length}` : ""}`}
            onClick={openFieldSheet}
          />
          <FilterButton
            label={`소속 학과${appliedDepartments.length ? ` ${appliedDepartments.length}` : ""}`}
            onClick={openDepartmentSheet}
          />
        </div>

        <section className="flex flex-col gap-5">
          <h2 className="px-0.5 text-[length:var(--font-size-heading2)] font-semibold leading-[1.5] tracking-[-0.01em] text-text-default">
            {searchQuery.trim() || appliedFields.length || appliedDepartments.length
              ? `필터 결과 · ${filteredLabs.length}개 연구실`
              : "인기 연구실 둘러보기"}
          </h2>
          <div className="flex flex-col gap-2">
            {filteredLabs.length > 0 ? (
              filteredLabs.map((lab) => <LabCard key={lab.labId} lab={lab} />)
            ) : (
              <p className="py-10 text-center text-[length:var(--font-size-body3)] text-text-subtle">
                조건에 맞는 연구실이 없어요.
              </p>
            )}
          </div>
        </section>
      </div>

      {activeSheet ? (
        <div
          className="fixed inset-0 z-[100] flex items-end bg-[var(--color-opacity-black-50)] md:hidden"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setActiveSheet(null);
          }}
        >
          {activeSheet === "field" ? (
            <BottomSheet
              aria-modal="true"
              className="max-h-[calc(100dvh-24px)] max-w-none overflow-y-auto pb-8"
              onClose={() => setActiveSheet(null)}
              title="연구 분야"
            >
              <SearchField
                autoFocus
                elevated
                hoverBackground={false}
                onChange={(event) => setFieldQuery(event.target.value)}
                placeholder="분야 검색"
                size="sm"
                value={fieldQuery}
              />
              <div className="flex flex-wrap gap-1.5">
                {visibleFields.map((field) => (
                  <Checkbox
                    appearance="chip"
                    checked={draftFields.includes(field)}
                    key={field}
                    onChange={() => toggleValue(field, draftFields, setDraftFields)}
                  >
                    {field}
                  </Checkbox>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[length:var(--font-size-body2)] text-text-default">
                  {draftFields.length}개 선택됨
                </span>
                <Button
                  onClick={() => {
                    setAppliedFields(draftFields);
                    setActiveSheet(null);
                  }}
                  size="sm"
                >
                  적용하기
                </Button>
              </div>
            </BottomSheet>
          ) : null}

          {activeSheet === "department" ? (
            <BottomSheet
              aria-modal="true"
              className="max-h-[calc(100dvh-24px)] max-w-none pb-8"
              onClose={() => setActiveSheet(null)}
              title="소속 학과"
            >
              <SearchField
                autoFocus
                elevated
                hoverBackground={false}
                onChange={(event) => setDepartmentQuery(event.target.value)}
                placeholder="학과 검색"
                size="sm"
                value={departmentQuery}
              />
              <div className="-mx-5 flex h-[264px] overflow-hidden bg-bg-default">
                <div className="w-[108px] shrink-0 overflow-y-auto border-r border-border-subtlest bg-bg-neutral p-1">
                  {colleges.map((college) => (
                    <button
                      className={`flex h-11 w-full cursor-pointer items-center rounded-[var(--radius-xl)] px-4 text-left text-[length:var(--font-size-body3)] ${activeCollege === college ? "bg-bg-default font-semibold text-[#465f83] shadow-[0_1px_4px_rgba(0,0,0,0.08)]" : "text-text-subtle"}`}
                      key={college}
                      onClick={() => setActiveCollege(college)}
                      type="button"
                    >
                      {college}
                    </button>
                  ))}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-2 overflow-y-auto px-4 py-3">
                  {visibleDepartments.map((department) => (
                    <Checkbox
                      checked={draftDepartments.includes(department)}
                      key={department}
                      onChange={() =>
                        toggleValue(department, draftDepartments, setDraftDepartments)
                      }
                      size="sm"
                    >
                      {department}
                    </Checkbox>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[length:var(--font-size-body2)] text-text-default">
                  {draftDepartments.length}개 선택됨
                </span>
                <Button
                  onClick={() => {
                    setAppliedDepartments(draftDepartments);
                    setActiveSheet(null);
                  }}
                  size="sm"
                >
                  적용하기
                </Button>
              </div>
            </BottomSheet>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
