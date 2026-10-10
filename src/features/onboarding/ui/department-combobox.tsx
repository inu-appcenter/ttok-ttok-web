"use client";

import { useId, useState } from "react";
import Image from "next/image";
import type { CollegeOption, DepartmentOption } from "@/entities/lab";

type Props = {
  colleges: CollegeOption[];
  value: string;
  selectedCode?: string;
  onChange: (value: string) => void;
  onSelect: (department: DepartmentOption) => void;
};

export function DepartmentCombobox({ colleges, value, selectedCode, onChange, onSelect }: Props) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const options = colleges.flatMap((college) => college.departments.map((department) => ({
    ...department, collegeName: college.collegeName,
  }))).filter((option) => option.departmentName.includes(value.trim()));

  function select(option: DepartmentOption) {
    onSelect(option);
    setOpen(false);
    setActive(-1);
  }

  return (
    <div className="ml-auto w-full max-w-[444px] rounded-xl bg-bg-default shadow-[0_4px_16px_var(--color-opacity-black-10)] max-md:max-w-[300px]">
      <div className="flex items-center gap-2 rounded-xl border border-border-primary px-5 py-3">
        <input
          aria-activedescendant={open && active >= 0 ? `${id}-${active}` : undefined}
          aria-autocomplete="list"
          aria-controls={`${id}-list`}
          aria-expanded={open}
          aria-label="학과 검색"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-base leading-6 outline-none placeholder:text-text-subtle"
          onBlur={() => setOpen(false)}
          onChange={(event) => { onChange(event.target.value); setActive(-1); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") { event.preventDefault(); setOpen(false); }
            else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault(); setOpen(true);
              setActive((index) => options.length ? Math.max(0, Math.min(options.length - 1, index + (event.key === "ArrowDown" ? 1 : -1))) : -1);
            } else if (event.key === "Enter" && open) {
              event.preventDefault();
              if (options[active]) select(options[active]);
            }
          }}
          placeholder="학과를 입력해주세요."
          role="combobox"
          value={value}
        />
        <Image alt="" height={18} src="/icons/search.svg" width={18} />
      </div>
      {open ? (
        <ul aria-label="학과 검색 결과" className="max-h-[248px] overflow-y-auto py-1" id={`${id}-list`} role="listbox">
          {options.map((option, index) => (
            <li
              aria-selected={selectedCode === option.department}
              className={`flex cursor-pointer items-center justify-between px-4 py-3.5 ${active === index || selectedCode === option.department ? "bg-bg-primary-subtle" : "hover:bg-bg-subtle"}`}
              id={`${id}-${index}`}
              key={option.department}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => select(option)}
              role="option"
            >
              <span className="flex min-w-0 flex-col gap-1.5">
                <span className="text-base font-semibold">{option.departmentName}</span>
                <span className="text-[13px] text-text-subtle">{option.collegeName}</span>
              </span>
              {selectedCode === option.department ? <span className="size-5 shrink-0 rounded-full border-[5px] border-border-primary bg-bg-default" /> : null}
            </li>
          ))}
          {!options.length ? <li className="px-4 py-4 text-sm text-text-subtle">일치하는 학과가 없어요.</li> : null}
        </ul>
      ) : null}
    </div>
  );
}
