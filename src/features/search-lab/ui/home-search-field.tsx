"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type FormEvent } from "react";

import { Button, Toast } from "@/shared/ui";

// 현재 Figma의 표시 예시입니다. 서버의 인기순 추천이나 검색 결과로 사용하지 않습니다.
const RECOMMENDED_KEYWORDS = ["LLM", "컴퓨터비전", "강화학습", "IoT", "반도체"];

export type HomeSearchFieldProps = {
  categories?: string[];
  categoriesError?: string;
};

export function HomeSearchField({ categories = [], categoriesError }: HomeSearchFieldProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedQuery = query.trim();
    if (!normalizedQuery && !category) {
      setMessage("검색어를 입력해주세요");
      inputRef.current?.focus();
      return;
    }
    if (normalizedQuery && category) {
      setMessage("분야와 검색어는 각각 검색할 수 있어요. 하나의 조건만 선택해주세요.");
      return;
    }
    setMessage("");
    const params = new URLSearchParams(category ? { category } : { q: normalizedQuery });
    startTransition(() => router.push(`/search?${params.toString()}`));
  }

  return (
    <div className="flex w-full flex-col items-center gap-8">
      {message ? (
        <div className="fixed inset-x-4 top-20 z-50 flex justify-center">
          <Toast className="[&>span>span]:whitespace-normal" state="error" title={message} />
        </div>
      ) : null}
      <form aria-label="연구실 검색 조건" aria-busy={isPending} className="grid w-full grid-cols-2 items-center gap-3 rounded-[var(--radius-xl)] bg-bg-default p-3 shadow-[0_2px_8px_var(--color-opacity-black-10)] xl:flex xl:h-20" onSubmit={handleSubmit}>
        <div className="relative flex min-w-0 items-center border-r border-border-subtle pl-2 pr-4 xl:h-full xl:w-[253px] xl:shrink-0">
          <label className="flex min-w-0 flex-1 flex-col text-[length:var(--font-size-body2)] leading-[1.5] text-text-subtle">
            분야
            <select aria-label="분야" aria-describedby={categoriesError ? "home-category-error" : undefined} className="w-full appearance-none rounded-sm bg-transparent pr-6 text-[length:var(--font-size-heading2)] font-semibold tracking-[-0.01em] text-text-default focus-visible:outline-2 focus-visible:outline-border-primary disabled:cursor-not-allowed" disabled={isPending || categories.length === 0} onChange={(event) => { setCategory(event.target.value); setMessage(""); }} value={category}>
              <option value="">전체</option>
              {categories.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
          </label>
          <Image alt="" className="pointer-events-none absolute right-4" height={18} src="/icons/home/search/chevron-down.svg" width={18} />
        </div>
        <div className="relative flex min-w-0 items-center pl-2 pr-4 xl:h-full xl:w-[253px] xl:shrink-0 xl:border-r xl:border-border-subtle">
          <label className="flex min-w-0 flex-1 flex-col text-[length:var(--font-size-body2)] leading-[1.5] text-text-subtle">
            학과
            <select aria-label="학과" className="w-full cursor-not-allowed appearance-none bg-transparent pr-6 text-[length:var(--font-size-heading2)] font-semibold tracking-[-0.01em] text-text-default" disabled value="">
              <option value="">전체</option>
            </select>
          </label>
          <Image alt="" className="pointer-events-none absolute right-4" height={18} src="/icons/home/search/chevron-down.svg" width={18} />
        </div>
        <div className="col-span-2 flex min-w-0 items-center gap-3 xl:flex-1">
          <input aria-label="연구실 검색" className="h-[54px] min-w-0 flex-1 rounded-sm bg-bg-default px-2 text-[length:var(--font-size-body2)] leading-[1.5] text-text-default outline-none placeholder:text-text-subtle focus-visible:ring-2 focus-visible:ring-border-primary" disabled={isPending} onChange={(event) => { setQuery(event.target.value); setMessage(""); }} placeholder="연구실명 · 교수명 검색" ref={inputRef} type="search" value={query} />
          <Button disabled={isPending} leadingIcon={<Image alt="" height={18} src="/icons/home/search/search.svg" width={18} />} size="lg" type="submit">검색</Button>
        </div>
      </form>
      <div aria-label="추천 검색어" className="flex max-w-full flex-wrap items-center justify-center gap-2">
        <span className="text-[length:var(--font-size-label1)] font-semibold text-text-subtle">추천 검색어</span>
        {RECOMMENDED_KEYWORDS.map((keyword) => (
          <button disabled className="rounded-full border border-border-subtle bg-bg-default px-3.5 py-1 text-[length:var(--font-size-body2)] leading-[1.5] text-text-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary" key={keyword} type="button">{keyword}</button>
        ))}
      </div>
      {categoriesError ? (
        <p className="-mt-6 text-center text-[length:var(--font-size-caption1)] text-text-subtle" id="home-category-error">
          {categoriesError}
        </p>
      ) : null}
    </div>
  );
}
