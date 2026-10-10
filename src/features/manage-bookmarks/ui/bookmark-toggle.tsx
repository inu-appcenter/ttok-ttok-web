"use client";
import Link from "next/link";
import { useBookmarks, type BookmarkActions } from "../model/use-bookmarks";

export function BookmarkToggle({
  laboratoryId,
  isAuthenticated,
  ...props
}: BookmarkActions & { laboratoryId: number; isAuthenticated: boolean }) {
  const state = useBookmarks({
    ...props,
    ...(!isAuthenticated
      ? { initialBookmarks: [], onLoad: async () => [] }
      : {}),
  });
  if (!isAuthenticated)
    return (
      <Link
        href="/login"
        className="inline-flex rounded-lg border border-border-primary px-3 py-1.5 text-sm text-text-primary"
      >
        관심 연구실
      </Link>
    );
  const selected = state.bookmarks.some(
    (item) => item.laboratory.laboratoryId === laboratoryId,
  );
  return (
    <div>
      <button
        type="button"
        aria-pressed={selected}
        disabled={state.pending || !state.loaded || state.needsRefresh}
        onClick={() => void state.toggle(laboratoryId)}
        className={`cursor-pointer rounded-lg border border-border-primary px-3 py-1.5 text-sm text-text-primary disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-border-primary ${selected ? "bg-bg-primary-subtle" : "bg-bg-default"}`}
      >
        {selected ? "관심 연구실 ✓" : "관심 연구실"}
      </button>
      {state.error ? (
        <p role="alert" className="mt-2 text-xs text-text-error">
          {state.error}{" "}
          <button
            type="button"
            className="underline"
            disabled={state.pending}
            onClick={() => void state.refresh()}
          >
            다시 불러오기
          </button>
        </p>
      ) : null}
    </div>
  );
}
