"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { LabPaper } from "@/entities/lab";
import { CollectionHeader } from "@/shared/ui/collection-header";

export function PapersPage({ laboratoryId, papers, error = false }: { laboratoryId: number; papers: LabPaper[]; error?: boolean }) {
  const [sort, setSort] = useState<"default" | "name">("default");
  const router = useRouter();
  const items = [...papers].sort((a, b) => sort === "name" ? a.title.localeCompare(b.title, "ko") : (b.year ?? -1) - (a.year ?? -1));
  return <main className="mx-auto min-h-screen max-w-[1264px] px-4 pb-20 pt-[27px] md:px-10 md:pt-[50px]">
    <CollectionHeader title="논문 전체보기" backHref={`/labs/${laboratoryId}#publications`} sort={sort} onSort={setSort} />
    {error ? <p role="alert" className="mt-8 text-sm text-text-error">논문을 불러오지 못했어요. <button type="button" className="underline" onClick={() => router.refresh()}>다시 불러오기</button></p> : <>
      <p className="mt-8 text-base font-bold leading-6 text-text-subtle">총 {papers.length}개</p>
      {items.length ? <ul className="mt-8">{items.map((paper, index) => <li key={`${paper.url}-${paper.title}-${index}`} className="min-w-0 border-b border-border-subtlest py-3 last:border-0">
        <h2 className="text-lg font-semibold leading-[1.5] text-text-primary md:text-[22px]">{paper.url ? <a href={paper.url} target="_blank" rel="noreferrer" title={paper.title} className="flex min-w-0 items-center gap-1 hover:underline focus-visible:outline-2 focus-visible:outline-border-primary"><span className="truncate">{paper.title}</span><span aria-hidden="true" className="shrink-0">↗</span></a> : <span className="block truncate" title={paper.title}>{paper.title}</span>}</h2>
        <p className="text-sm font-bold leading-6 text-text-subtlest md:text-base">{[paper.year, paper.venue].filter((item) => item !== null && item !== "").join(" · ")}</p>
      </li>)}</ul> : <p className="mt-20 text-center text-base text-text-subtlest">등록된 논문이 없어요.</p>}
    </>}
  </main>;
}
