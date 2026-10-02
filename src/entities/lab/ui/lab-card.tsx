import Link from "next/link";

import { Tag } from "@/shared/ui";

import type { LabSummary } from "../model/lab";

export type LabCardProps = {
  lab: LabSummary;
};

const cardClasses = "flex h-full min-h-[131px] min-w-0 flex-col justify-between rounded-[var(--radius-xl)] border border-bg-default bg-bg-default p-3 shadow-[0_2px_4px_var(--color-opacity-black-10)] md:min-h-[140px] md:shadow-[0_4px_8px_var(--color-opacity-black-10)]";

export function LabCardSkeleton() {
  return (
    <div aria-label="연구실 정보 불러오는 중" className={cardClasses} role="status">
      <div aria-hidden="true" className="flex flex-col gap-2">
        <div className="h-[18px] w-[190px] max-w-full rounded bg-bg-neutral md:h-5 md:w-[220px]" />
        <div className="h-[11px] w-[120px] rounded bg-bg-neutral md:h-3 md:w-[140px]" />
        <div className="h-[10px] w-full rounded bg-bg-neutral" />
        <div className="h-[10px] w-2/3 rounded bg-bg-neutral" />
      </div>
      <div aria-hidden="true" className="flex gap-2">
        <div className="h-5 w-[72px] rounded-full bg-bg-neutral" />
        <div className="h-5 w-[56px] rounded-full bg-bg-neutral" />
      </div>
    </div>
  );
}

export function LabCard({ lab }: LabCardProps) {
  const visibleTags = lab.tags.slice(0, 3);
  const hiddenTagCount = lab.tags.length - visibleTags.length;

  return (
    <Link
      aria-label={`${lab.name} 상세 보기`}
      className="group block min-w-0 rounded-[var(--radius-xl)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary"
      href={`/labs/${encodeURIComponent(lab.labId)}`}
    >
      <article className={`${cardClasses} transition-[background-color,border-color,box-shadow] group-hover:border-border-primary group-hover:bg-bg-primary-subtle group-active:border-[color:var(--color-bg-primary-press)]`}>
        <div className="flex min-w-0 flex-col">
          <h3 className="break-words text-[length:var(--font-size-headline1)] font-semibold leading-[1.4] tracking-[-0.01em] text-text-default md:text-[length:var(--font-size-heading2)] md:leading-[1.5]">
            {lab.name}
          </h3>
          <p className="break-words text-[length:var(--font-size-caption1)] font-medium leading-[1.5] text-text-subtle md:text-[length:var(--font-size-label2)]">
            {lab.professorName} 교수 · {lab.department}
          </p>
          <p className="mt-1 line-clamp-2 text-[11px] leading-[1.5] text-text-subtlest md:text-[12px]">
            {lab.description}
          </p>
        </div>
        <div className="mt-1 flex min-w-0 flex-wrap gap-[var(--spacing-spacing-2)]">
          {visibleTags.map((tag) => (
            <Tag className="max-w-full truncate" key={tag} size="sm" tone="primary">
              {tag}
            </Tag>
          ))}
          {hiddenTagCount > 0 ? <Tag size="sm" tone="primary">외 {hiddenTagCount}개</Tag> : null}
        </div>
      </article>
    </Link>
  );
}
