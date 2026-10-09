"use client";

import Image from "next/image";
import type { CollegeOption } from "@/entities/lab";
import { useEffect, useId, useRef, useState } from "react";

import {
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
  colleges?: CollegeOption[];
  error?: string;
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
  colleges = [],
  error,
  disabled,
  onChange,
}: SearchConditionDropdownProps) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileSheet, setIsMobileSheet] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState("");
  const [activeCollege, setActiveCollege] = useState(college || colleges.find((group) => group.departments.some((department) => department.departmentName === value))?.collegeName || "전체");
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
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const previousOverflow = document.body.style.overflow;
    if (isMobile) document.body.style.overflow = "hidden";
    function handleModalKeyboard(event: KeyboardEvent) {
      if (!isMobile || event.key !== "Tab") return;
      const controls = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input:not(:disabled), [tabindex="0"]',
      ) ?? []).filter((element) => element.getClientRects().length);
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
    document.addEventListener("pointerdown", handleOutsidePointer);
    document.addEventListener("keydown", handleModalKeyboard);
    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointer);
      document.removeEventListener("keydown", handleModalKeyboard);
      if (isMobile) document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, kind]);
  const selectedLabel = value || (kind === "department" ? college : "");
  const label = kind === "category" ? "분야" : "학과";
  const fields = [...new Set(options)].sort(
    (left, right) => left.localeCompare(right, "ko"),
  );
  const visibleFields = fields.filter((field) => matchesField(field, query));
  const groups = FIELD_INDEX.map((index) => ({
    index,
    fields: visibleFields.filter((field) => getFieldIndex(field) === index),
  }));
  const departments =
    activeCollege === "전체"
      ? colleges.flatMap((college) => college.departments.map((department) => department.departmentName))
      : (colleges.find((college) => college.collegeName === activeCollege)
          ?.departments.map((department) => department.departmentName) ?? []);

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
          setIsMobileSheet(window.matchMedia("(max-width: 767px)").matches);
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
        const columns = group === "category" ? (window.matchMedia("(max-width: 767px)").matches ? 2 : 3) : 1;
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
        className={`flex h-[42px] items-center rounded-lg md:h-[54px] hover:bg-bg-primary-subtle ${isOpen ? "bg-bg-primary-subtle" : ""}`}
      >
        <button
          aria-controls={id}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-label={`${label}: ${selectedLabel || "전체"}`}
          className="flex h-full min-w-0 flex-1 cursor-pointer items-center gap-1 rounded-lg pl-2 pr-4 text-left focus-visible:outline-2 focus-visible:outline-border-primary"
          disabled={disabled}
          onClick={() => {
            setIsMobileSheet(window.matchMedia("(max-width: 767px)").matches);
            setIsOpen(!isOpen);
            setQuery("");
            setActiveIndex("");
          }}
          ref={triggerRef}
          type="button"
        >
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-[13px] leading-[1.5] text-text-subtle md:text-[length:var(--font-size-body2)]">
              {kind === "department" ? <><span className="md:hidden">단과대학 / 학과</span><span className="hidden md:inline">학과</span></> : label}
            </span>
            <span
              className={`truncate text-[16px] font-semibold leading-[1.4] md:text-[20px] md:leading-[1.5] tracking-[-0.01em] ${selectedLabel ? "text-text-primary" : "text-text-default"}`}
            >
              {selectedLabel || "전체"}
            </span>
          </span>
          <Image
            alt=""
            className={`hidden md:block ${isOpen ? "rotate-180" : ""}`}
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
        <div className="fixed inset-0 z-[100] flex items-end bg-[var(--color-opacity-black-50)] md:contents" onClick={(event) => {
          if (event.target === event.currentTarget) {
            setIsOpen(false);
            triggerRef.current?.focus();
          }
        }}>
        <div
          aria-label={`${label} 선택`}
          className={`relative flex max-h-[calc(100dvh-60px)] w-full flex-col overflow-hidden rounded-t-[var(--radius-2xl)] bg-bg-default pb-[env(safe-area-inset-bottom)] shadow-[0_2px_8px_var(--color-opacity-black-10)] md:absolute md:left-0 md:top-[calc(100%+20px)] md:z-30 md:block md:rounded-[var(--radius-xl)] md:pb-0 md:shadow-[0_8px_24px_var(--color-opacity-black-10)] ${kind === "category" ? "md:w-[min(502px,calc(100vw-56px))]" : "md:w-[min(400px,calc(100vw-56px))] md:max-xl:left-auto md:max-xl:right-0"}`}
          id={id}
          ref={dialogRef}
          aria-modal={isMobileSheet || undefined}
          role="dialog"
        >
          <header className="flex shrink-0 items-center justify-between px-5 pb-4 pt-4 md:hidden">
            <h2 className="text-[length:var(--font-size-headline1)] font-semibold">{kind === "category" ? "연구 분야" : "소속 학과"}</h2>
            <button aria-label="닫기" className="rounded-sm focus-visible:outline-2 focus-visible:outline-border-primary" type="button" onClick={() => { setIsOpen(false); triggerRef.current?.focus(); }}>
              <Image alt="" height={18} src="/icons/home/mobile/close.svg" width={18} />
            </button>
          </header>
          {kind === "category" ? (
            <>
              <label className="mx-5 flex h-9 shrink-0 items-center gap-2 rounded-[var(--radius-xl)] border border-border-disabled px-3 shadow-[0_2px_8px_var(--color-opacity-black-10)] md:mx-0 md:h-[42px] md:rounded-none md:border-x-0 md:border-t-0 md:shadow-none">
                <Image
                  alt=""
                  className="order-2 md:order-none"
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
                  className="mt-1 flex shrink-0 gap-0.5 overflow-x-auto border-b border-border-disabled px-5 py-2 md:mt-0 md:px-3"
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
                className="relative h-[255px] min-h-0 overflow-y-auto px-4 py-2 md:h-auto md:max-h-[400px] md:p-2"
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
                      <div className="grid grid-cols-2 gap-x-1 px-0 pb-1.5 md:grid-cols-3 md:px-1">
                        {group.fields.map((field) => (
                          <button
                            data-option-group="category"
                            aria-pressed={value === field}
                            className="truncate rounded-md px-2.5 py-[9px] text-left text-[14px] leading-[1.5] text-text-default hover:bg-bg-primary-subtle aria-pressed:bg-bg-primary-subtle aria-pressed:font-semibold aria-pressed:text-text-primary focus-visible:outline-2 focus-visible:outline-border-primary"
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
                    {error || (options.length ? `‘${query}’에 맞는 분야가 없어요` : "등록된 분야가 없어요")}
                  </p>
                ) : null}
              </div>
            </>
          ) : (
            <div className="flex h-[360px] min-h-0 border-t border-border-subtle md:h-auto md:max-h-[400px] md:border-t-0">
              <div
                aria-label="단과대학"
                className="w-[33%] shrink-0 overflow-y-auto border-r border-border-subtle bg-bg-subtle px-1 py-2 md:w-[124px] md:border-r-0 md:p-2"
              >
                {[
                  "전체",
                  ...colleges.map((college) => college.collegeName),
                ].map((college) => (
                  <button
                    data-option-group="college"
                    aria-pressed={activeCollege === college}
                    className="flex min-h-[37px] w-full items-center justify-between rounded-lg px-2 py-2 text-left text-[14px] text-text-subtle md:px-3 aria-pressed:bg-bg-default aria-pressed:font-semibold aria-pressed:text-text-primary aria-pressed:shadow-sm focus-visible:outline-2 focus-visible:outline-border-primary"
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
                className="min-w-0 flex-1 overflow-y-auto px-1 py-2 md:p-2"
              >
                {!departments.length ? (
                  <p role="status" className="px-3 py-2 text-[14px] text-text-subtle">
                    {error || "등록된 학과가 없어요"}
                  </p>
                ) : null}
                {["", ...departments].map((department) => (
                  <button
                    data-option-group="department"
                    aria-pressed={department === value && (department !== "" || college === (activeCollege === "전체" ? "" : activeCollege))}
                    className="flex min-h-[44px] w-full items-center justify-between gap-2 rounded-lg px-3 py-2 md:min-h-[37px] text-left text-[14px] leading-[1.5] text-text-default hover:bg-bg-primary-subtle aria-pressed:bg-bg-primary-subtle aria-pressed:font-semibold aria-pressed:text-text-primary focus-visible:outline-2 focus-visible:outline-border-primary"
                    key={department}
                    onClick={() => handleSelect(department)}
                    type="button"
                  >
                    <span className="min-w-0 break-words">{department || <><span className="md:hidden">{activeCollege === "전체" ? "전체" : `${activeCollege} 전체`}</span><span className="hidden md:inline">전체</span></>}</span>
                    {!department && activeCollege !== "전체" ? <span className="shrink-0 text-[11px] text-text-subtlest md:hidden">{departments.length}개 학과</span> : null}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        </div>
      ) : null}
    </div>
  );
}
