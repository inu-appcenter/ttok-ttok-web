import Link from "next/link";

import { Tag } from "@/shared/ui";

import type { LabSummary } from "../model/lab";

export type LabCardProps = {
  lab: LabSummary;
};

export function LabCard({ lab }: LabCardProps) {
  return (
    <Link
      aria-label={`${lab.name} 상세 보기`}
      className="group block min-w-0 rounded-[var(--radius-xl)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary"
      href={`/labs/${encodeURIComponent(lab.labId)}`}
    >
      <article className="flex min-w-0 flex-col gap-1 rounded-[var(--radius-xl)] border border-bg-default bg-bg-default p-3 shadow-[0_2px_4px_var(--color-opacity-black-10)] transition-[border-color,box-shadow] group-hover:border-border-primary group-hover:shadow-[0_2px_8px_var(--color-opacity-black-10)] group-active:border-[color:var(--color-bg-primary-press)] md:gap-[var(--spacing-spacing-2-5)] md:border-[1.5px] md:border-border-primary md:bg-bg-primary-subtle md:px-[var(--spacing-spacing-6)] md:py-[var(--spacing-spacing-5)] md:shadow-none">
        <h3 className="truncate text-[length:var(--font-size-headline1)] font-semibold leading-[1.4] tracking-[-0.01em] text-text-default">
          {lab.name}
        </h3>
        <p className="truncate text-[length:var(--font-size-caption1)] font-normal leading-[1.5] text-text-subtle md:text-[length:var(--font-size-body3)]">
          {lab.professorName} 교수 · {lab.department}
        </p>
        <div className="flex flex-wrap gap-[14px] md:gap-[var(--spacing-spacing-1-5)]">
          {lab.tags.map((tag) => (
            <Tag className="max-md:py-0 max-md:text-[12px]" key={tag} tone="primary">
              {tag}
            </Tag>
          ))}
        </div>
      </article>
    </Link>
  );
}
