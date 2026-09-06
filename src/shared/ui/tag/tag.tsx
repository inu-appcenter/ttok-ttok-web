import type { HTMLAttributes, ReactNode } from "react";

type TagTone = "default" | "neutral" | "primary" | "secondary" | "subtle" | "success" | "warning" | "error";

export type TagProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  tone?: TagTone;
};

const toneClasses: Record<TagTone, string> = {
  default: "bg-text-default text-text-inverse text-[length:var(--font-size-label1)] font-semibold",
  subtle: "bg-text-subtlest text-text-inverse text-[length:var(--font-size-label1)] font-semibold",
  secondary: "bg-[var(--color-secondary-secondary-500)] text-text-inverse text-[length:var(--font-size-label1)] font-semibold",
  primary: "bg-bg-primary text-text-inverse text-[length:var(--font-size-label2)] font-normal",
  neutral: "bg-bg-neutral text-text-subtle text-[length:var(--font-size-label2)] font-semibold",
  success: "bg-bg-success text-text-success text-[length:var(--font-size-label2)] font-semibold",
  warning: "bg-bg-warning text-text-warning text-[length:var(--font-size-label2)] font-semibold",
  error: "bg-bg-error text-text-error text-[length:var(--font-size-label2)] font-semibold",
};

export function Tag({ children, className, tone = "default", ...props }: TagProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-[var(--spacing-spacing-2-5)] py-[var(--spacing-spacing-0-5)] leading-[1.5] ${toneClasses[tone]} ${className ?? ""}`}
      {...props}
    >
      {children}
    </span>
  );
}

export type RecruitmentStatus = "open" | "upcoming" | "closed";

const recruitmentStatus: Record<RecruitmentStatus, { label: string; tone: TagTone }> = {
  open: { label: "모집 중", tone: "success" },
  upcoming: { label: "모집 예정", tone: "warning" },
  closed: { label: "모집 마감", tone: "error" },
};

export function RecruitmentStatusTag({ status }: { status: RecruitmentStatus }) {
  const currentStatus = recruitmentStatus[status];

  return <Tag tone={currentStatus.tone}>{currentStatus.label}</Tag>;
}
