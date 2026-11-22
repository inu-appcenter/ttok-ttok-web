"use client";
import Image from "next/image";
import Link from "next/link";
import { useBookmarks, type BookmarkActions } from "../model/use-bookmarks";

export function BookmarkPreview(props: BookmarkActions) {
  const { bookmarks, pending, error, refresh, toggle, needsRefresh, loaded } =
    useBookmarks(props);
  return (
    <section className="min-w-0 rounded-xl bg-bg-default px-5 py-3 shadow-[0_2px_4px_var(--color-opacity-black-10)]">
      <Link
        className="flex w-full items-center gap-1 text-[length:var(--font-size-headline2)] font-semibold leading-[1.4] tracking-[-0.01em] text-text-default hover:underline focus-visible:outline-2 focus-visible:outline-border-primary md:justify-between md:text-base md:tracking-normal md:text-text-subtle"
        href="/mypage/bookmarks"
      >
        나의 관심 연구실
        <Image
          alt=""
          src="/icons/lab-detail/chevron-right.svg"
          width={16}
          height={16}
        />
      </Link>
      <ul>
        {bookmarks.slice(0, 3).map(({ id, laboratory: lab }) => (
          <li
            key={id}
            className="flex items-center justify-between gap-3 border-b border-border-subtle py-3 last:border-0 md:min-h-[76px] md:border-border-subtlest"
          >
            <Link
              href={`/labs/${lab.laboratoryId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-0 hover:underline focus-visible:outline-2 focus-visible:outline-border-primary"
            >
              <h3
                className="truncate text-[length:var(--font-size-label1)] font-semibold leading-[1.5] text-text-subtle md:text-lg md:leading-[1.4]"
                title={lab.name}
              >
                {lab.name}
              </h3>
              <p className="truncate text-[length:var(--font-size-caption2)] leading-[1.5] text-text-subtlest md:mt-1 md:text-[13px] md:font-semibold">
                {lab.professorName} 교수 · {lab.department}
              </p>
            </Link>
            <button
              type="button"
              aria-label={`${lab.name} 관심 연구실 해제`}
              aria-pressed="true"
              disabled={pending || needsRefresh}
              onClick={() => void toggle(lab.laboratoryId)}
              className="shrink-0 cursor-pointer rounded-[var(--radius-md)] border border-bg-primary-hover bg-bg-primary-subtle px-2.5 py-1.5 text-[length:var(--font-size-caption1)] leading-[1.5] text-bg-primary-hover disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-border-primary md:h-[30px] md:rounded-lg md:border-border-primary md:px-2 md:py-0 md:text-xs md:text-text-primary"
            >
              <span className="md:hidden">관심 연구실</span>
              <span className="max-md:hidden">관심 등록</span>
            </button>
          </li>
        ))}
      </ul>
      {!bookmarks.length && loaded && !error ? (
        <p className="py-8 text-center text-sm text-text-subtlest">
          등록한 관심 연구실이 없어요.
        </p>
      ) : null}
      {!loaded && !error ? (
        <p role="status" className="py-6 text-sm text-text-subtle">
          관심 연구실을 불러오는 중이에요.
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-3 text-sm text-text-error">
          {error}{" "}
          <button
            className="underline"
            type="button"
            disabled={pending}
            onClick={() => void refresh()}
          >
            다시 불러오기
          </button>
        </p>
      ) : null}
    </section>
  );
}
