// TTOK-65에서 실제 분류·개수 API로 교체할 Figma 화면 예시입니다.
const COLLEGE_PREVIEW = [
  { name: "공과대학", departments: ["바이오 로봇시스템공학과", "전기공학과", "산업경영공학과"] },
  { name: "도시과학대학", departments: ["도시환경공학부(건설환경공학전공)", "도시환경공학부(환경공학전공)", "도시공학과"] },
  { name: "자연과학대학", departments: ["해양학과", "물리학과", "화학과"] },
  { name: "예술체육대학", departments: ["운동건강학부", "디자인학부", "공연예술학과"] },
  { name: "글로벌정경대학", departments: ["소비자학과", "정치외교학과", "경제학과"] },
  { name: "사회과학대학", departments: ["창의인재개발학과", "미디어커뮤니케이션학과", "문헌정보학과"] },
  { name: "생명과학기술대학", departments: ["생명과학부(분자의생명전공)", "생명공학부(생명공학전공)", "생명공학부(나노바이오공학전공)"] },
  { name: "인공지능대학", departments: ["인공지능시스템공학과", "인공지능정보통신공학부", "컴퓨터공학부"] },
  { name: "경영대학", departments: ["세무회계학과", "데이터과학과", "경영학부"] },
  { name: "융합자유전공대학", departments: ["국제자유전공학부", "융합학부", "자유전공학부"] },
  { name: "인문대학", departments: ["일본지역문화학과"] },
] as const;

export function HomeDepartmentPreview() {
  return (
    <section aria-labelledby="home-departments-heading" className="flex flex-col gap-5 pb-12 pt-6">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h2 className="text-[length:var(--font-size-heading2)] font-semibold leading-[1.5] tracking-[-0.01em]" id="home-departments-heading">
          단과대학 · 학과별 연구실
        </h2>
        <p className="text-[length:var(--font-size-caption1)] text-text-subtle">
          화면 예시 · 연구실 수와 학과별 검색은 준비 중입니다.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-6 xl:grid-cols-4">
        {COLLEGE_PREVIEW.map((college) => (
          <div className="flex min-w-0 flex-col gap-3 rounded-[var(--radius-xl)] bg-bg-default p-4 shadow-[0_4px_16px_var(--color-opacity-black-10)]" key={college.name}>
            <h3 className="truncate pb-1 text-[length:var(--font-size-heading1)] font-semibold leading-[1.5] tracking-[-0.01em]" title={college.name}>
              {college.name}
            </h3>
            <ul className="flex flex-col text-[length:var(--font-size-body1)] leading-[1.5] text-text-subtle">
              {college.departments.map((department) => (
                <li className="truncate border-b border-border-subtle py-1 last:border-b-0" key={department} title={department}>
                  {department}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
