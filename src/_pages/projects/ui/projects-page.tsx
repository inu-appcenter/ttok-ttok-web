import Link from "next/link";
import type { LabDetailListState, LabResearchProject } from "@/entities/lab";
import { Tag } from "@/shared/ui";

export function ProjectsPage({ laboratoryId, projects, state, error }: {
  laboratoryId: number;
  projects: LabResearchProject[];
  state?: LabDetailListState;
  error: boolean;
}) {
  const base = `/labs/${laboratoryId}/projects`;
  return (
    <main className="mx-auto min-h-[calc(100dvh-53px)] max-w-[1264px] px-4 pb-20 pt-[27px] md:min-h-[calc(100dvh-72px)] md:px-10 md:pt-[50px]">
      <header className="flex items-center gap-3">
        <Link aria-label="이전 페이지" href={`/labs/${laboratoryId}`} className="rounded-sm text-xl focus-visible:outline-2 focus-visible:outline-border-primary">‹</Link>
        <h1 className="text-[22px] font-bold leading-[1.5] md:text-[28px]">연구과제 전체보기</h1>
      </header>
      {error ? (
        <p role="alert" className="mt-8 text-sm text-text-error">연구과제를 불러오지 못했어요. <a className="underline" href={base}>다시 불러오기</a></p>
      ) : projects.length ? (
        <ul className="mt-8">
          {projects.map((project) => (
            <li key={project.id} className="border-b border-border-subtlest py-4 last:border-0">
              <div className="flex flex-wrap items-center gap-2"><Tag tone={project.isOngoing ? "primary" : "default"}>{project.isOngoing ? "진행중" : "종료"}</Tag><p className="text-sm text-text-subtle">{[project.period, project.agency].filter(Boolean).join(" · ")}</p></div>
              <h2 className="mt-1 text-lg font-semibold text-text-primary">{project.url ? <a href={project.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{project.title} ↗</a> : project.title}</h2>
            </li>
          ))}
        </ul>
      ) : <p className="mt-20 text-center text-text-subtlest">등록된 연구과제가 없어요.</p>}
      {state && state.totalPages > 1 && (
        <nav aria-label="연구과제 페이지" className="mt-8 flex items-center justify-between text-text-primary">
          {state.page > 0 ? <Link href={`${base}?page=${state.page - 1}`}>이전</Link> : <span />}
          <span>{state.page + 1} / {state.totalPages}</span>
          {state.page + 1 < state.totalPages ? <Link href={`${base}?page=${state.page + 1}`}>다음</Link> : <span />}
        </nav>
      )}
    </main>
  );
}
