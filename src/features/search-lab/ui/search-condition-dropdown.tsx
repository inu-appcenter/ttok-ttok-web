"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";

import {
  COLLEGE_PREVIEW,
  FIELD_INDEX,
  getFieldIndex,
  getInitials,
  matchesField,
} from "../model/search-options";

type SearchConditionDropdownProps = {
  kind: "category" | "department";
  value: string;
  college?: string;
  options?: string[];
  disabled?: boolean;
  onChange: (value: string, college?: string) => void;
};

function HighlightedField({ value, query }: { value: string; query: string }) {
  const start = query.trim()
    ? (value.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
        ? value
        : getInitials(value)
      )
        .toLocaleLowerCase()
        .indexOf(query.trim().toLocaleLowerCase())
    : -1;
  if (start < 0) return value;
  const end = start + query.trim().length;
  return (
    <>
      {value.slice(0, start)}
      <span className="font-medium text-text-primary">
        {value.slice(start, end)}
      </span>
      {value.slice(end)}
    </>
  );
}

export function SearchConditionDropdown({
  kind,
  value,
  college = "",
  options = [],
  disabled,
  onChange,
}: SearchConditionDropdownProps) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState("");
  const [activeCollege, setActiveCollege] = useState(college || COLLEGE_PREVIEW.find((group) => group.departments.includes(value))?.name || "전체");
  useEffect(() => {
    if (!isOpen) return;
    const firstControl =
      kind === "category"
        ? rootRef.current?.querySelector<HTMLElement>("input")
        : (rootRef.current?.querySelector<HTMLElement>(
            '[data-option-group="department"][aria-pressed="true"]',
          ) ??
          rootRef.current?.querySelector<HTMLElement>(
            '[data-option-group="department"]',
          ));
    firstControl?.focus({ preventScroll: true });
    function handleOutsidePointer(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      )
        setIsOpen(false);
    }
    document.addEventListener("pointerdown", handleOutsidePointer);
    return () =>
      document.removeEventListener("pointerdown", handleOutsidePointer);
  }, [isOpen, kind]);
  const selectedLabel = value || (kind === "department" ? college : "");
  const label = kind === "category" ? "분야" : "학과";
  const fields = [...new Set([...options, ...(value ? [value] : [])])].sort(
    (left, right) => left.localeCompare(right, "ko"),
  );
  const visibleFields = fields.filter((field) => matchesField(field, query));
  const groups = FIELD_INDEX.map((index) => ({
    index,
    fields: visibleFields.filter((field) => getFieldIndex(field) === index),
  }));
  const departments =
    activeCollege === "전체"
      ? COLLEGE_PREVIEW.flatMap((college) => college.departments)
      : (COLLEGE_PREVIEW.find((college) => college.name === activeCollege)
          ?.departments ?? []);

  function handleSelect(nextValue: string) {
    onChange(nextValue, kind === "department" && !nextValue && activeCollege !== "전체" ? activeCollege : "");
    setIsOpen(false);
    setQuery("");
    triggerRef.current?.focus();
  }

  return (
    <div
      className="relative min-w-0 xl:w-[240px] xl:shrink-0"
      data-condition={kind}
      data-open={isOpen}
      ref={rootRef}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setIsOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          setIsOpen(false);
          triggerRef.current?.focus();
          return;
        }
        if (!isOpen && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
          event.preventDefault();
          setQuery("");
          setActiveIndex("");
          setIsOpen(true);
          return;
        }
        const target = event.target;
        if (!isOpen || !(target instanceof HTMLElement)) return;
        if (target instanceof HTMLInputElement && event.key === "ArrowDown") {
          event.preventDefault();
          rootRef.current
            ?.querySelector<HTMLButtonElement>('[data-option-group="category"]')
            ?.focus();
          return;
        }
        const group = target.dataset.optionGroup;
        if (!group) return;
        if (
          (group === "college" && event.key === "ArrowRight") ||
          (group === "department" && event.key === "ArrowLeft")
        ) {
          event.preventDefault();
          const nextGroup = group === "college" ? "department" : "college";
          const selected = rootRef.current?.querySelector<HTMLButtonElement>(
            `[data-option-group="${nextGroup}"][aria-pressed="true"]`,
          );
          (
            selected ??
            rootRef.current?.querySelector<HTMLButtonElement>(
              `[data-option-group="${nextGroup}"]`,
            )
          )?.focus();
          return;
        }
        const controls = [
          ...(rootRef.current?.querySelectorAll<HTMLButtonElement>(
            `[data-option-group="${group}"]:not(:disabled)`,
          ) ?? []),
        ];
        const current = controls.findIndex((control) => control === target);
        const columns = group === "category" ? 3 : 1;
        const hasReset = controls[0]?.hasAttribute("data-reset");
        let next = current;
        if (event.key === "ArrowDown") next = hasReset && current === 0 ? 1 : current + columns;
        else if (event.key === "ArrowUp") next = hasReset && current <= columns ? 0 : current - columns;
        else if (group === "category" && event.key === "ArrowRight") next += 1;
        else if (group === "category" && event.key === "ArrowLeft") next -= 1;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = controls.length - 1;
        else return;
        event.preventDefault();
        controls[Math.max(0, Math.min(next, controls.length - 1))]?.focus();
      }}
    >
      <div
        className={`flex h-[54px] items-center rounded-lg hover:bg-bg-primary-subtle ${isOpen ? "bg-bg-primary-subtle" : ""}`}
      >
        <button
          aria-controls={id}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-label={`${label}: ${selectedLabel || "전체"}`}
          className="flex h-full min-w-0 flex-1 cursor-pointer items-center gap-1 rounded-lg pl-2 pr-4 text-left focus-visible:outline-2 focus-visible:outline-border-primary"
          disabled={disabled}
          onClick={() => {
            setIsOpen(!isOpen);
            setQuery("");
            setActiveIndex("");
          }}
          ref={triggerRef}
          type="button"
        >
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-[length:var(--font-size-body2)] leading-[1.5] text-text-subtle">
              {label}
            </span>
            <span
              className={`truncate text-[20px] font-semibold leading-[1.5] tracking-[-0.01em] ${selectedLabel ? "text-text-primary" : "text-text-default"}`}
            >
              {selectedLabel || "전체"}
            </span>
          </span>
          <Image
            alt=""
            className={isOpen ? "rotate-180" : ""}
            height={18}
            src="/icons/home/search/chevron-down.svg"
            width={18}
          />
        </button>
        {selectedLabel ? (
          <button
            aria-label={`${label} 초기화`}
            className="mr-2 rounded px-1 text-text-subtle focus-visible:outline-2 focus-visible:outline-border-primary"
            disabled={disabled}
            onClick={() => {
              onChange("", "");
              setActiveCollege("전체");
              setIsOpen(false);
              triggerRef.current?.focus();
            }}
            type="button"
          >
            ×
          </button>
        ) : null}
      </div>
      {isOpen ? (
        <div
          aria-label={`${label} 선택`}
          className={`absolute left-0 top-[calc(100%+20px)] z-30 overflow-hidden rounded-[var(--radius-xl)] bg-bg-default shadow-[0_8px_24px_var(--color-opacity-black-10)] ${kind === "category" ? "w-[min(502px,calc(100vw-56px))]" : "w-[min(400px,calc(100vw-56px))] max-xl:left-auto max-xl:right-0"}`}
          id={id}
          role="dialog"
        >
          {kind === "category" ? (
            <>
              <label className="flex h-[42px] items-center gap-2 border-b border-border-disabled px-3">
                <Image
                  alt=""
                  height={16}
                  src="/icons/home/search/field-search.svg"
                  width={16}
                />
                <input
                  aria-label="분야 검색"
                  className="min-w-0 flex-1 bg-transparent text-[13px] leading-[1.5] text-text-default outline-none placeholder:text-text-subtlest focus-visible:ring-2 focus-visible:ring-border-primary"
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setActiveIndex("");
                    listRef.current?.scrollTo({ top: 0 });
                  }}
                  placeholder="분야 검색"
                  value={query}
                />
              </label>
              {!query.trim() ? (
                <div
                  aria-label="분야 초성 인덱스"
                  className="flex gap-0.5 overflow-x-auto border-b border-border-disabled px-3 py-2"
                >
                  {groups.map((group) => (
                    <button
                      aria-label={`${group.index} ${group.fields.length}개`}
                      aria-pressed={
                        (activeIndex ||
                          groups.find((group) => group.fields.length)
                            ?.index) === group.index
                      }
                      className="flex min-w-[30px] shrink-0 flex-col whitespace-nowrap items-center rounded-md px-1 py-1 text-[14px] font-semibold text-text-subtle aria-pressed:bg-bg-primary aria-pressed:text-text-inverse disabled:text-text-disabled focus-visible:outline-2 focus-visible:outline-border-primary"
                      disabled={!group.fields.length}
                      key={group.index}
                      onClick={() => {
                        const section = sectionRefs.current[group.index];
                        if (section && listRef.current)
                          listRef.current.scrollTo({
                            top: section.offsetTop,
                            behavior: "smooth",
                          });
                        setActiveIndex(group.index);
                      }}
                      type="button"
                    >
                      {group.index}
                      <span className="text-[11px] font-normal">
                        {group.fields.length}
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}
              <div
                className="relative max-h-[400px] overflow-y-auto p-2"
                onScroll={() => {
                  const list = listRef.current;
                  if (!list) return;
                  const first = groups.find((group) => {
                    const section = sectionRefs.current[group.index];
                    return (
                      section &&
                      section.offsetTop + section.offsetHeight >
                        list.scrollTop + 8
                    );
                  });
                  if (first) setActiveIndex(first.index);
                }}
                ref={listRef}
              >
                {!query ? (
                  <button
                    data-option-group="category"
                    data-reset=""
                    className="mb-1 w-full rounded-md px-2 py-1 text-left text-[14px] hover:bg-bg-primary-subtle focus-visible:outline-2 focus-visible:outline-border-primary"
                    onClick={() => handleSelect("")}
                    type="button"
                  >
                    전체
                  </button>
                ) : null}
                {groups
                  .filter((group) => group.fields.length)
                  .map((group) => (
                    <section
                      key={group.index}
                      ref={(element) => {
                        sectionRefs.current[group.index] = element;
                      }}
                    >
                      <div className="flex justify-between px-2 py-1 text-[12px] leading-[1.5]">
                        <span className="text-text-primary">{group.index}</span>
                        <span className="text-text-subtlest">
                          {group.fields.length}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-x-1 px-1 pb-1.5">
                        {group.fields.map((field) => (
                          <button
                            data-option-group="category"
                            aria-pressed={value === field}
                            className="truncate rounded-md px-2 py-1 text-left text-[14px] leading-[1.5] text-text-default hover:bg-bg-primary-subtle aria-pressed:bg-bg-primary-subtle aria-pressed:font-semibold aria-pressed:text-text-primary focus-visible:outline-2 focus-visible:outline-border-primary"
                            key={field}
                            onClick={() => handleSelect(field)}
                            title={field}
                            type="button"
                          >
                            <HighlightedField query={query} value={field} />
                          </button>
                        ))}
                      </div>
                    </section>
                  ))}
                {!visibleFields.length ? (
                  <p className="px-2 py-3 text-[12px] text-text-subtlest">
                    ‘{query}’에 맞는 분야가 없어요
                  </p>
                ) : null}
              </div>
            </>
          ) : (
            <div className="flex max-h-[400px]">
              <div
                aria-label="단과대학"
                className="w-[124px] shrink-0 overflow-y-auto bg-bg-subtle p-2"
              >
                {[
                  "전체",
                  ...COLLEGE_PREVIEW.map((college) => college.name),
                ].map((college) => (
                  <button
                    data-option-group="college"
                    aria-pressed={activeCollege === college}
                    className="flex min-h-[37px] w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[14px] text-text-subtle aria-pressed:bg-bg-default aria-pressed:font-semibold aria-pressed:text-text-primary aria-pressed:shadow-sm focus-visible:outline-2 focus-visible:outline-border-primary"
                    key={college}
                    onClick={() => setActiveCollege(college)}
                    onFocus={() => setActiveCollege(college)}
                    onMouseEnter={() => setActiveCollege(college)}
                    type="button"
                  >
                    {college}
                    {activeCollege === college ? (
                      <Image
                        alt=""
                        className="-rotate-90"
                        height={18}
                        src="/icons/home/search/chevron-down.svg"
                        width={18}
                      />
                    ) : null}
                  </button>
                ))}
              </div>
              <div
                aria-label="학과 목록"
                className="min-w-0 flex-1 overflow-y-auto p-2"
              >
                {["", ...departments].map((department) => (
                  <button
                    data-option-group="department"
                    aria-pressed={department === value && (department !== "" || college === (activeCollege === "전체" ? "" : activeCollege))}
                    className="block min-h-[37px] w-full rounded-lg px-3 py-2 text-left text-[14px] leading-[1.5] text-text-default hover:bg-bg-primary-subtle aria-pressed:bg-bg-primary-subtle aria-pressed:font-semibold aria-pressed:text-text-primary focus-visible:outline-2 focus-visible:outline-border-primary"
                    key={department}
                    onClick={() => handleSelect(department)}
                    type="button"
                  >
                    {department || "전체"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
