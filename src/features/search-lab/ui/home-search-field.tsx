"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { SearchField } from "@/shared/ui";

export function HomeSearchField() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(value: string) {
    const normalizedValue = value.trim();
    router.push(normalizedValue ? `/search?q=${encodeURIComponent(normalizedValue)}` : "/search");
  }

  return (
    <SearchField
      aria-label="연구실 검색"
      elevated={false}
      onChange={(event) => setQuery(event.target.value)}
      onSearch={handleSearch}
      placeholder="연구실명 · 교수명 · 키워드 검색"
      size="lg"
      value={query}
    />
  );
}
