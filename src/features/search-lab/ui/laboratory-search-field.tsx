"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { SearchField } from "@/shared/ui";

import { createSearchHref } from "../model/search-conditions";

export type LaboratorySearchFieldProps = {
  initialQuery?: string;
  isDisabled?: boolean;
};

export function LaboratorySearchField({
  initialQuery = "",
  isDisabled = false,
}: LaboratorySearchFieldProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  function handleSearch(value: string) {
    const normalizedQuery = value.trim();
    startTransition(() => {
      router.push(createSearchHref({ query: normalizedQuery }));
    });
  }

  return (
    <SearchField
      aria-busy={isPending}
      aria-label="연구실 검색"
      disabled={isDisabled || isPending}
      onChange={(event) => setQuery(event.target.value)}
      onSearch={handleSearch}
      placeholder="연구실명 · 교수명 검색"
      size="lg"
      value={query}
    />
  );
}
