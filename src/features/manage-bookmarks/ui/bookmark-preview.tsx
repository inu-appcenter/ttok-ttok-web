"use client";
import Image from "next/image";
import Link from "next/link";
import { useBookmarks, type BookmarkActions } from "../model/use-bookmarks";

export function BookmarkPreview(props: BookmarkActions) {
  const { bookmarks, pending, error, refresh, toggle, needsRefresh, loaded } = useBookmarks(props);
  return <section className="min-w-0 rounded-xl bg-bg-default px-5 py-3 shadow-[0_2px_4px_var(--color-opacity-black-10)]">
    <Link className="flex items-center gap-1 text-base font-semibold leading-6 text-text-subtle hover:underline focus-visible:outline-2 focus-visible:outline-border-primary" href="/mypage/bookmarks">
      나의 관심 연구실<Image alt="" src="/icons/lab-detail/chevron-right.svg" width={16} height={16} />
    </Link>
    <ul className="mt-3">{bookmarks.slice(0, 3).map(({ id, laboratory: lab }) => <li key={id} className="flex min-h-[76px] items-center justify-between gap-3 border-b border-border-subtlest py-3 last:border-0">
      <Link href={`/labs/${lab.laboratoryId}`} className="min-w-0 hover:underline focus-visible:outline-2 focus-visible:outline-border-primary">
        <h3 className="truncate text-lg font-semibold leading-[1.4] text-text-subtle" title={lab.name}>{lab.name}</h3>
        <p className="truncate text-[13px] font-semibold leading-[1.5] text-text-subtlest">{lab.professorName} 교수 · {lab.department}</p>
      </Link>
      <button type="button" aria-label={`${lab.name} 관심 연구실 해제`} aria-pressed="true" disabled={pending || needsRefresh} onClick={() => void toggle(lab.laboratoryId)} className="h-[30px] shrink-0 cursor-pointer rounded-lg border border-border-primary bg-bg-primary-subtle px-2 text-xs text-text-primary disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-border-primary">관심 등록</button>
    </li>)}</ul>
    {!bookmarks.length && loaded && !error ? <p className="py-8 text-center text-sm text-text-subtlest">등록한 관심 연구실이 없어요.</p> : null}
    {!loaded && !error ? <p role="status" className="py-6 text-sm text-text-subtle">관심 연구실을 불러오는 중이에요.</p> : null}
    {error ? <p role="alert" className="mt-3 text-sm text-text-error">{error} <button className="underline" type="button" disabled={pending} onClick={() => void refresh()}>다시 불러오기</button></p> : null}
  </section>;
}
