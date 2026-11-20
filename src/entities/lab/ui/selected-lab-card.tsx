import { Tag } from "@/shared/ui";

import type { LabSummary } from "../model/lab";

type SelectedLabCardProps = {
  /** 기본값은 온보딩 대화의 오른쪽 정렬 폭 */
  className?: string;
  lab: LabSummary;
};

export function SelectedLabCard({
  className = "ml-auto max-w-[300px] md:max-w-[420px]",
  lab,
}: SelectedLabCardProps) {
  return (
    <article className={`w-full rounded-[var(--radius-xl)] border-[1.5px] border-border-primary bg-bg-primary-subtle px-[var(--spacing-spacing-6)] py-[var(--spacing-spacing-5)] ${className}`}>
      <h2 className="truncate text-[length:var(--font-size-headline1)] font-semibold leading-[1.4] text-text-default">
        {lab.name}
      </h2>
      <p className="mt-[var(--spacing-spacing-2)] text-[length:var(--font-size-body3)] leading-[1.5] text-text-subtle">
        {lab.professorName} 교수 · {lab.department}
      </p>
      <div className="mt-[var(--spacing-spacing-2-5)] flex flex-wrap gap-[var(--spacing-spacing-1-5)]">
        {lab.tags.map((tag) => (
          <Tag key={tag} tone="primary">
            {tag}
          </Tag>
        ))}
      </div>
    </article>
  );
}

export type { SelectedLabCardProps };
