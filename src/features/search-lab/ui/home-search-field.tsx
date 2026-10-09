"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type FormEvent } from "react";

import { Button, Toast } from "@/shared/ui";

import type { CollegeOption } from "@/entities/lab";
import { SearchConditionDropdown } from "./search-condition-dropdown";

import {
  createSearchHref,
  parseSearchConditions,
} from "../model/search-conditions";

// 현재 Figma의 표시 예시입니다. 서버의 인기순 추천이나 검색 결과로 사용하지 않습니다.
const RECOMMENDED_KEYWORDS = ["LLM", "컴퓨터비전", "강화학습", "IoT", "반도체"];

export type HomeSearchFieldProps = {
  categories?: string[];
  categoriesError?: string;
  colleges?: CollegeOption[];
  collegesError?: string;
  initialQuery?: string;
  initialCategory?: string;
  initialCollege?: string;
  initialDepartment?: string;
  isDisabled?: boolean;
  showRecommendations?: boolean;
};

export function HomeSearchField({
  categories = [],
  categoriesError,
  colleges = [],
  collegesError,
  initialQuery = "",
  initialCategory = "",
  initialCollege = "",
  initialDepartment = "",
  isDisabled = false,
  showRecommendations = true,
}: HomeSearchFieldProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [college, setCollege] = useState(initialCollege);
  const [department, setDepartment] = useState(initialDepartment);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedQuery = query.trim();
    if (
      category &&
      category !== initialCategory &&
      !categories.includes(category)
    ) {
      setMessage(
        "선택한 분야를 확인해주세요.",
      );
      return;
    }
    if (showRecommendations && !normalizedQuery && !category && !college && !department) {
      setMessage("검색어를 입력해주세요");
      inputRef.current?.focus();
      return;
    }
    const conditions = parseSearchConditions({
      q: normalizedQuery,
      category,
      college,
      department,
    });
    if (conditions.error) {
      setMessage(conditions.error);
      return;
    }
    setMessage("");
    startTransition(() => router.push(createSearchHref(conditions)));
  }

  return (
    <div className="flex w-full flex-col items-center gap-8">
      {message ? (
        <div className="fixed inset-x-4 top-20 z-50 flex justify-center">
          <Toast
            className="[&>span>span]:whitespace-normal"
            state="error"
            title={message}
          />
        </div>
      ) : null}
      <form
        aria-label="연구실 검색 조건"
        aria-busy={isPending}
        className="group/search grid w-full grid-cols-2 items-center gap-3 rounded-[var(--radius-xl)] bg-bg-default p-3 shadow-[0_2px_8px_var(--color-opacity-black-10)] xl:flex xl:h-20"
        onSubmit={handleSubmit}
      >
        <SearchConditionDropdown
          disabled={isPending || isDisabled}
          kind="category"
          onChange={(value) => {
            setCategory(value);
            setMessage("");
          }}
          options={categories}
          error={categoriesError}
          value={category}
        />
        <div
          aria-hidden="true"
          className="hidden h-[54px] w-px shrink-0 bg-border-subtle xl:block group-has-[[data-condition=category]:is(:hover,[data-open=true])]/search:invisible group-has-[[data-condition=department]:is(:hover,[data-open=true])]/search:invisible"
        />
        <SearchConditionDropdown
          disabled={isPending || isDisabled}
          kind="department"
          college={college}
          colleges={colleges}
          error={collegesError}
          onChange={(value, selectedCollege = "") => {
            setDepartment(value);
            setCollege(selectedCollege);
            setMessage("");
          }}
          value={department}
        />
        <div
          aria-hidden="true"
          className="hidden h-[54px] w-px shrink-0 bg-border-subtle xl:block group-has-[[data-condition=department]:is(:hover,[data-open=true])]/search:invisible"
        />
        <div className="col-span-2 flex min-w-0 items-center gap-3 xl:flex-1">
          <input
            aria-label="연구실 검색"
            className="h-[54px] min-w-0 flex-1 rounded-sm bg-bg-default px-2 text-[length:var(--font-size-body2)] leading-[1.5] text-text-default outline-none placeholder:text-text-subtle focus-visible:ring-2 focus-visible:ring-border-primary"
            disabled={isPending || isDisabled}
            onChange={(event) => {
              setQuery(event.target.value);
              setMessage("");
            }}
            placeholder="연구실명 · 교수명 검색"
            ref={inputRef}
            type="search"
            value={query}
          />
          <Button
            disabled={isPending || isDisabled}
            leadingIcon={
              <Image
                alt=""
                height={18}
                src="/icons/home/search/search.svg"
                width={18}
              />
            }
            size="lg"
            type="submit"
          >
            검색
          </Button>
        </div>
      </form>
      {showRecommendations ? (
        <div
          aria-label="추천 검색어"
          className="flex max-w-full flex-wrap items-center justify-center gap-2"
        >
          <span className="text-[length:var(--font-size-label1)] font-semibold text-text-subtle">
            추천 검색어
          </span>
          {RECOMMENDED_KEYWORDS.map((keyword) => (
            <button
              disabled
              className="rounded-full border border-border-subtle bg-bg-default px-3.5 py-1 text-[length:var(--font-size-body2)] leading-[1.5] text-text-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary"
              key={keyword}
              type="button"
            >
              {keyword}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
