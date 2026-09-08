"use client";

import { useMemo, useState } from "react";

import { LabCard } from "@/entities/lab";
import type { LabSummary } from "@/entities/lab";
import { Checkbox, Radio, SearchField } from "@/shared/ui";
import { SiteHeader } from "@/widgets/site-header";

const researchFields = ["AI / ML", "데이터", "보안", "시스템", "비전", "NLP"];
const departments = [
  "컴퓨터공학부",
  "임베디드시스템공학과",
  "정보통신공학과",
  "전기공학과",
  "생명공학부",
  "스포츠과학부",
];

export type SearchPageProps = {
  initialQuery?: string;
  isAuthenticated?: boolean;
  labs: LabSummary[];
};

export function SearchPage({
  initialQuery = "",
  isAuthenticated = false,
  labs,
}: SearchPageProps) {
  const [query, setQuery] = useState(initialQuery);
  const [selectedField, setSelectedField] = useState("");
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);

  const filteredLabs = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ko-KR");

    return labs.filter((lab) => {
      const matchesQuery =
        !normalizedQuery ||
        [lab.name, lab.professorName, lab.department, ...lab.tags].some((value) =>
          value.toLocaleLowerCase("ko-KR").includes(normalizedQuery),
        );
      const matchesField = !selectedField || lab.tags.includes(selectedField);
      const matchesDepartment =
        !selectedDepartments.length || selectedDepartments.includes(lab.department);

      return matchesQuery && matchesField && matchesDepartment;
    });
  }, [labs, query, selectedDepartments, selectedField]);

  function handleDepartmentChange(department: string) {
    setSelectedDepartments((current) =>
      current.includes(department)
        ? current.filter((item) => item !== department)
        : [...current, department],
    );
  }

  function handleReset() {
    setQuery("");
    setSelectedField("");
    setSelectedDepartments([]);
  }

  return (
    <div className="min-h-screen bg-bg-default text-text-default">
      <SiteHeader activeItem="search" isAuthenticated={isAuthenticated} />
      <main>
        <section className="border-b border-border-disabled p-10">
          <div className="mx-auto w-full max-w-[1014px]">
            <SearchField
              aria-label="연구실 검색"
              onChange={(event) => setQuery(event.target.value)}
              onSearch={setQuery}
              placeholder="연구실명 · 교수명 · 키워드 검색"
              size="lg"
              value={query}
            />
          </div>
        </section>

        <div className="mx-auto flex w-full max-w-[1440px] items-start gap-6 px-10">
          <aside className="w-[208px] shrink-0">
            <section className="flex flex-col items-center gap-[14px] border-b border-border-subtle py-[30px]">
              <h2 className="w-full text-[20px] font-bold leading-[1.5]">연구 분야</h2>
              <div className="flex w-full flex-wrap gap-2">
                {researchFields.map((field) => (
                  <Radio
                    appearance="chip"
                    checked={selectedField === field}
                    key={field}
                    name="research-field"
                    onChange={() => setSelectedField(selectedField === field ? "" : field)}
                    value={field}
                  >
                    {field}
                  </Radio>
                ))}
              </div>
              <button
                className="cursor-pointer text-[length:var(--font-size-body3)] text-text-subtle underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary"
                onClick={() => setSelectedField("")}
                type="button"
              >
                더보기
              </button>
            </section>

            <section className="flex flex-col items-center gap-[14px] border-b border-border-subtle py-[30px]">
              <h2 className="w-full text-[20px] font-bold leading-[1.5]">소속 학과</h2>
              <div className="flex w-full flex-col gap-2">
                {departments.map((department) => (
                  <Checkbox
                    checked={selectedDepartments.includes(department)}
                    key={department}
                    onChange={() => handleDepartmentChange(department)}
                  >
                    {department}
                  </Checkbox>
                ))}
              </div>
              <button
                className="cursor-pointer text-[length:var(--font-size-body3)] text-text-subtle underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary"
                onClick={() => setSelectedDepartments([])}
                type="button"
              >
                더보기
              </button>
            </section>
          </aside>

          <section className="min-w-0 flex-1">
            <div className="flex items-center pb-[30px] pt-8">
              <p className="text-[length:var(--font-size-label1)] text-text-subtle">
                필터 결과 · {filteredLabs.length}개 연구실
              </p>
            </div>

            {filteredLabs.length ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredLabs.map((lab) => (
                  <LabCard key={lab.labId} lab={lab} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6 pt-[92px] text-center">
                <div>
                  <h1 className="text-[length:var(--font-size-display2)] font-bold leading-[1.5] tracking-[-0.01em]">
                    {query.trim() ? `‘${query.trim()}’ 검색 결과가 없어요` : "검색 결과가 없어요"}
                  </h1>
                  <p className="mt-1 text-[length:var(--font-size-heading1)] text-text-subtle">
                    다른 키워드나 필터로 다시 찾아보세요
                  </p>
                </div>
                <button
                  className="cursor-pointer rounded-[var(--radius-lg)] border border-border-primary bg-bg-default px-5 py-[10px] text-[length:var(--font-size-body2)] text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary"
                  onClick={handleReset}
                  type="button"
                >
                  검색 초기화
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
