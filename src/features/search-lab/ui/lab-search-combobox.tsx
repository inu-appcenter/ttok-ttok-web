"use client";

import { useEffect, useId, useMemo, useState } from "react";

import { LabSearchResultItem } from "@/entities/lab";
import type { LabSummary } from "@/entities/lab";
import { SearchField } from "@/shared/ui";

type LabSearchComboboxProps = {
  autoFocus?: boolean;
  className?: string;
  errorMessage?: string;
  isLoading?: boolean;
  labs?: LabSummary[];
  onClearSelection?: () => void;
  onSearch?: (keyword: string) => Promise<LabSummary[]>;
  onSelect: (lab: LabSummary) => void;
  selectedLabId?: string;
};

export function LabSearchCombobox({
  autoFocus = false,
  className,
  errorMessage,
  isLoading = false,
  labs = [],
  onClearSelection,
  onSearch,
  onSelect,
  selectedLabId,
}: LabSearchComboboxProps) {
  const [query, setQuery] = useState("");
  const [remoteResults, setRemoteResults] = useState<LabSummary[]>([]);
  const [searchError, setSearchError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const listboxId = useId();
  const shouldShowResults = isOpen && query.trim().length > 0;
  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ko-KR");

    if (!normalizedQuery) {
      return [];
    }

    if (onSearch) {
      return remoteResults;
    }

    return labs.filter((lab) =>
      [lab.name, lab.professorName, lab.department, ...lab.tags].some((value) =>
        value.toLocaleLowerCase("ko-KR").includes(normalizedQuery),
      ),
    );
  }, [labs, onSearch, query, remoteResults]);
  const resolvedErrorMessage = errorMessage ?? searchError;
  const resolvedIsLoading = isLoading || isSearching;
  const activeResult = results[activeIndex];
  const activeOptionId = activeResult ? `${listboxId}-option-${activeResult.labId}` : undefined;

  function selectLab(lab: LabSummary) {
    setQuery(lab.name);
    setIsOpen(false);
    onSelect(lab);
  }

  useEffect(() => {
    if (!onSearch) {
      return;
    }

    const keyword = query.trim();

    if (!keyword) {
      return;
    }

    let isCurrentRequest = true;
    const timeoutId = window.setTimeout(() => {
      setIsSearching(true);
      setSearchError("");

      onSearch(keyword)
        .then((labs) => {
          if (isCurrentRequest) {
            setRemoteResults(labs);
            setActiveIndex(0);
          }
        })
        .catch((error: unknown) => {
          if (isCurrentRequest) {
            setRemoteResults([]);
            setSearchError(
              error instanceof Error ? error.message : "연구실을 불러오지 못했습니다.",
            );
          }
        })
        .finally(() => {
          if (isCurrentRequest) {
            setIsSearching(false);
          }
        });
    }, 300);

    return () => {
      isCurrentRequest = false;
      window.clearTimeout(timeoutId);
    };
  }, [onSearch, query]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!shouldShowResults || results.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((currentIndex) => (currentIndex + 1) % results.length);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(
        (currentIndex) => (currentIndex - 1 + results.length) % results.length,
      );
    }

    if (event.key === "Enter" && activeResult) {
      event.preventDefault();
      selectLab(activeResult);
    }

    if (event.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <div className={`ml-auto w-full max-w-[300px] md:max-w-[444px] ${className ?? ""}`}>
      <div className="overflow-hidden rounded-[var(--radius-2xl)] bg-bg-default shadow-[0_4px_16px_var(--color-opacity-black-10)]">
        <label className="sr-only" htmlFor={`${listboxId}-input`}>
          연구실 이름 또는 교수명 검색
        </label>
        <SearchField
          autoFocus={autoFocus}
          aria-activedescendant={shouldShowResults ? activeOptionId : undefined}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={shouldShowResults}
          aria-invalid={Boolean(resolvedErrorMessage)}
          autoComplete="off"
          elevated={false}
          id={`${listboxId}-input`}
          onChange={(event) => {
            setQuery(event.target.value);
            if (onSearch) {
              setRemoteResults([]);
              setSearchError("");
            }
            setActiveIndex(0);
            setIsOpen(true);
            if (selectedLabId) onClearSelection?.();
          }}
          onFocus={() => {
            if (query.trim()) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          onSearch={() => {
            if (query.trim()) setIsOpen(true);
          }}
          placeholder="연구실 이름 또는 교수명"
          role="combobox"
          rounded={shouldShowResults ? "top" : "all"}
          value={query}
        />

        {shouldShowResults ? (
          <ul
            className="max-h-[248px] overflow-y-auto bg-bg-default"
            id={listboxId}
            role="listbox"
          >
            {resolvedIsLoading ? (
              <li
                className="px-[var(--spacing-spacing-4)] py-[var(--spacing-spacing-6)] text-center text-[length:var(--font-size-body3)] text-text-subtle"
                role="status"
              >
                연구실을 찾고 있어요
              </li>
            ) : resolvedErrorMessage ? (
              <li
                className="px-[var(--spacing-spacing-4)] py-[var(--spacing-spacing-6)] text-center text-[length:var(--font-size-body3)] text-text-error"
                role="alert"
              >
                {resolvedErrorMessage}
              </li>
            ) : results.length > 0 ? (
              results.map((lab, index) => (
                <LabSearchResultItem
                  active={index === activeIndex}
                  key={lab.labId}
                  lab={lab}
                  onSelect={selectLab}
                  optionId={`${listboxId}-option-${lab.labId}`}
                  selected={lab.labId === selectedLabId}
                />
              ))
            ) : (
              <li
                className="px-[var(--spacing-spacing-4)] py-[var(--spacing-spacing-6)] text-center text-[length:var(--font-size-body3)] text-text-subtle"
                role="option"
                aria-selected="false"
              >
                검색 결과가 없어요
              </li>
            )}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

export type { LabSearchComboboxProps };
