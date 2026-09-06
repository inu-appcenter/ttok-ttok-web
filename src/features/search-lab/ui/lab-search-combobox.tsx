"use client";

import { useId, useState } from "react";

import { LabSearchResultItem, MOCK_LABS } from "@/entities/lab";
import type { LabSummary } from "@/entities/lab";
import { SearchField } from "@/shared/ui";

import { useLabSearch } from "../model/use-lab-search";

type LabSearchComboboxProps = {
  autoFocus?: boolean;
  className?: string;
  errorMessage?: string;
  isLoading?: boolean;
  labs?: LabSummary[];
  onClearSelection?: () => void;
  onSelect: (lab: LabSummary) => void;
  selectedLabId?: string;
};

export function LabSearchCombobox({
  autoFocus = false,
  className,
  errorMessage,
  isLoading = false,
  labs = MOCK_LABS,
  onClearSelection,
  onSelect,
  selectedLabId,
}: LabSearchComboboxProps) {
  const { query, results, setQuery } = useLabSearch(labs);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const listboxId = useId();
  const shouldShowResults = isOpen && query.trim().length > 0;
  const activeResult = results[activeIndex];
  const activeOptionId = activeResult ? `${listboxId}-option-${activeResult.labId}` : undefined;

  function selectLab(lab: LabSummary) {
    setQuery(lab.name);
    setIsOpen(false);
    onSelect(lab);
  }

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
          aria-invalid={Boolean(errorMessage)}
          autoComplete="off"
          elevated={false}
          id={`${listboxId}-input`}
          onChange={(event) => {
            setQuery(event.target.value);
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
            {isLoading ? (
              <li
                className="px-[var(--spacing-spacing-4)] py-[var(--spacing-spacing-6)] text-center text-[length:var(--font-size-body3)] text-text-subtle"
                role="status"
              >
                연구실을 찾고 있어요
              </li>
            ) : errorMessage ? (
              <li
                className="px-[var(--spacing-spacing-4)] py-[var(--spacing-spacing-6)] text-center text-[length:var(--font-size-body3)] text-text-error"
                role="alert"
              >
                {errorMessage}
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
