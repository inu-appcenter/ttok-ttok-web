"use client";
import { useState } from "react";
import { LabCard } from "@/entities/lab";
import { useBookmarks, type BookmarkActions } from "@/features/manage-bookmarks";
import { CollectionHeader } from "@/shared/ui/collection-header";
import { MobileBottomNav } from "@/widgets/mobile-bottom-nav";

export function BookmarksPage(props: BookmarkActions) {
  const { bookmarks, error, pending, loaded, refresh } = useBookmarks(props);
  const [sort, setSort] = useState<"default" | "name">("default");
  const items = sort === "name" ? [...bookmarks].sort((a, b) => a.laboratory.name.localeCompare(b.laboratory.name, "ko")) : bookmarks;
  return <div className="min-h-screen bg-bg-default"><main className="mx-auto max-w-[1264px] px-4 pb-28 pt-[27px] md:px-10 md:pb-20 md:pt-[50px]">
    <CollectionHeader title="관심 연구실 전체보기" backHref="/mypage" sort={sort} onSort={setSort} defaultLabel="기본순" />
    {loaded ? <p className="mt-8 text-base font-bold leading-6 text-text-subtle">총 {bookmarks.length}개</p> : null}
    {error ? <p role="alert" className="mt-8 text-sm text-text-error">{error} <button type="button" disabled={pending} className="underline" onClick={() => void refresh()}>다시 불러오기</button></p> : null}
    {!loaded && !error ? <p role="status" className="mt-8 text-sm text-text-subtle">관심 연구실을 불러오는 중이에요.</p> : null}
    {loaded && !bookmarks.length && !error ? <p className="mt-20 text-center text-base text-text-subtlest">아직 관심 연구실이 없어요.</p> : <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <LabCard key={item.id} lab={item.laboratory} />)}</div>}
  </main><MobileBottomNav activeHref="/mypage" /></div>;
}
