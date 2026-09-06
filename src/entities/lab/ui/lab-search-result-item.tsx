import { Tag } from "@/shared/ui";

import type { LabSummary } from "../model/lab";

type LabSearchResultItemProps = {
  active?: boolean;
  lab: LabSummary;
  onSelect: (lab: LabSummary) => void;
  optionId: string;
  selected?: boolean;
};

export function LabSearchResultItem({
  active = false,
  lab,
  onSelect,
  optionId,
  selected = false,
}: LabSearchResultItemProps) {
  return (
    <li
      aria-selected={selected}
      className={active || selected ? "bg-bg-primary-subtle" : "bg-bg-default"}
      id={optionId}
      role="option"
    >
      <button
        className="flex w-full cursor-pointer items-center gap-[var(--spacing-spacing-2)] px-[var(--spacing-spacing-4)] py-[14px] text-left hover:bg-bg-subtle focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-border-primary"
        onClick={() => onSelect(lab)}
        tabIndex={-1}
        type="button"
      >
        <span className="flex min-w-0 flex-1 flex-col items-start gap-[var(--spacing-spacing-1-5)] overflow-hidden">
          <strong className="w-full truncate text-[length:var(--font-size-body2)] font-semibold leading-[1.5] text-text-default">
            {lab.name}
          </strong>
          <span className="w-full truncate text-[length:var(--font-size-label2)] font-normal leading-[1.5] text-text-subtle">
            {lab.professorName} 교수 · {lab.department}
          </span>
          {selected ? (
            <span className="flex max-w-full gap-[var(--spacing-spacing-1-5)] overflow-hidden">
              {lab.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </span>
          ) : null}
        </span>
        {selected ? (
          <span
            aria-hidden="true"
            className="size-5 shrink-0 rounded-full bg-bg-primary"
          />
        ) : null}
      </button>
    </li>
  );
}

export type { LabSearchResultItemProps };
