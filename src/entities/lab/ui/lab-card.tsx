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
      <article className="flex min-h-[131px] min-w-0 flex-col justify-between rounded-[var(--radius-xl)] border border-bg-default bg-bg-default p-3 shadow-[0_2px_8px_var(--color-opacity-black-10)] transition-[background-color,border-color,box-shadow] group-hover:border-border-primary group-hover:bg-bg-primary-subtle group-active:border-[color:var(--color-bg-primary-press)] md:min-h-[140px] md:shadow-[0_4px_16px_var(--color-opacity-black-10)]">
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="break-words text-[length:var(--font-size-headline1)] font-semibold leading-[1.4] tracking-[-0.01em] text-text-default md:text-[length:var(--font-size-heading2)] md:leading-[1.5]">
            {lab.name}
          </h3>
          <p className="break-words text-[length:var(--font-size-caption1)] font-medium leading-[1.5] text-text-subtle md:text-[length:var(--font-size-label2)]">
            {lab.professorName} 교수 · {lab.department}
          </p>
          <p className="line-clamp-2 text-[11px] leading-[1.5] text-text-subtlest md:text-[12px]">
            {lab.description}
          </p>
        </div>
        <div className="mt-2 flex flex-wrap gap-[var(--spacing-spacing-2)]">
          {lab.tags.map((tag) => (
            <Tag key={tag} size="sm" tone="primary">
              {tag}
            </Tag>
          ))}
        </div>
      </article>
    </Link>
  );
}
