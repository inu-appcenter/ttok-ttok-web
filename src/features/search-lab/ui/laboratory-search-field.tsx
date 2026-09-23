"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { SearchField } from "@/shared/ui";

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
    const searchParams = new URLSearchParams({ page: "0" });

    if (normalizedQuery) {
      searchParams.set("q", normalizedQuery);
    }

    startTransition(() => {
      router.push(`/search?${searchParams.toString()}`);
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
