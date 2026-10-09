"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { LabCard } from "@/entities/lab";
import type { CollegeOption, LabSummary } from "@/entities/lab";
import { BottomSheet, Button, Checkbox, SearchField } from "@/shared/ui";

type SheetType = "department" | "field" | null;

export type MobileLabExplorerProps = {
  labs: LabSummary[];
  categories?: string[];
  categoriesError?: string;
  colleges?: CollegeOption[];
  collegesError?: string;
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

export function MobileLabExplorer({ labs, categories = [], categoriesError, colleges = [], collegesError }: MobileLabExplorerProps) {
  const [activeSheet, setActiveSheet] = useState<SheetType>(null);
  const [activeCollege, setActiveCollege] = useState("");
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

  const visibleFields = categories.filter((field) =>
    field.toLocaleLowerCase("ko-KR").includes(fieldQuery.trim().toLocaleLowerCase("ko-KR")),
  );

  const selectedCollege = colleges.find((college) => college.collegeName === activeCollege) ?? colleges[0];
  const visibleDepartments = (selectedCollege?.departments ?? []).map((department) => department.departmentName).filter((department) =>
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
        <SearchField
          aria-label="연구실명, 교수명 또는 키워드 검색"
          elevated={false}
          onChange={(event) => setSearchQuery(event.target.value)}
          onSearch={() => setSearchQuery(searchQuery)}
          placeholder="연구실명 · 교수명 · 키워드 검색"
          size="sm"
          value={searchQuery}
        />

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
                onChange={(event) => setFieldQuery(event.target.value)}
                onSearch={() => setFieldQuery(fieldQuery)}
                placeholder="분야 검색"
                size="sm"
                value={fieldQuery}
              />
              <div className="flex flex-wrap gap-1.5">
                {!visibleFields.length ? <p role="status" className="text-text-subtle">{categoriesError || (categories.length ? "검색한 분야가 없어요" : "등록된 분야가 없어요")}</p> : null}
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
                onChange={(event) => setDepartmentQuery(event.target.value)}
                onSearch={() => setDepartmentQuery(departmentQuery)}
                placeholder="학과 검색"
                size="sm"
                value={departmentQuery}
              />
              <div className="-mx-5 flex h-[264px] overflow-hidden bg-bg-default">
                <div className="w-[108px] shrink-0 overflow-y-auto border-r border-border-subtlest bg-bg-neutral p-1">
                  {colleges.map((college) => (
                    <button
                      className={`flex h-11 w-full cursor-pointer items-center rounded-[var(--radius-xl)] px-4 text-left text-[length:var(--font-size-body3)] ${selectedCollege?.college === college.college ? "bg-bg-default font-semibold text-[#465f83] shadow-[0_1px_4px_rgba(0,0,0,0.08)]" : "text-text-subtle"}`}
                      key={college.college}
                      onClick={() => setActiveCollege(college.collegeName)}
                      type="button"
                    >
                      {college.collegeName}
                    </button>
                  ))}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-2 overflow-y-auto px-4 py-3">
                  {!visibleDepartments.length ? <p role="status" className="text-text-subtle">{collegesError || "등록된 학과가 없어요"}</p> : null}
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
