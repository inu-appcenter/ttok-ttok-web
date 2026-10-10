"use client";
import Image from "next/image";
import Link from "next/link";

export function CollectionHeader({ title, backHref, sort, onSort, defaultLabel = "최신순" }: { title: string; backHref: string; sort: "default" | "name"; onSort: (sort: "default" | "name") => void; defaultLabel?: string }) {
  return <header className="flex flex-wrap items-center justify-between gap-4">
    <div className="flex min-w-0 items-center gap-3"><Link aria-label="이전 페이지" href={backHref} className="flex size-6 shrink-0 items-center justify-center rounded-sm focus-visible:outline-2 focus-visible:outline-border-primary"><Image alt="" src="/icons/mypage/back.svg" width={18} height={18} /></Link><h1 className="text-[22px] font-bold leading-[1.5] tracking-[-0.02em] text-text-default md:text-[28px]">{title}</h1></div>
    <div aria-label="목록 정렬" className="flex rounded-full bg-bg-neutral p-1">{([['default', defaultLabel], ['name', '이름순']] as const).map(([value, label]) => <button type="button" key={value} aria-pressed={sort === value} onClick={() => onSort(value)} className={`cursor-pointer rounded-full px-4 py-2 text-sm font-bold leading-6 md:text-base focus-visible:outline-2 focus-visible:outline-border-primary ${sort === value ? "bg-bg-default text-text-default" : "text-text-subtlest"}`}>{label}</button>)}</div>
  </header>;
}
