import type { HTMLAttributes } from "react";

export type ToastState = "default" | "error" | "loading" | "success" | "warning";

export type ToastProps = HTMLAttributes<HTMLDivElement> & {
  description?: string;
  state?: ToastState;
  title: string;
};

function ToastIcon({ state }: { state: Exclude<ToastState, "default"> }) {
  if (state === "success") {
    return (
      <svg aria-hidden="true" className="size-[18px] shrink-0" fill="none" viewBox="0 0 18 18">
        <path d="M15 4.5 6.75 12.75 3 9" stroke="#16A34A" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      </svg>
    );
  }

  if (state === "warning") {
    return (
      <svg aria-hidden="true" className="size-[18px] shrink-0" fill="none" viewBox="0 0 18 18">
        <path d="M9 6.75v3M9 12.75h.008M16.298 13.5l-6-10.5a1.5 1.5 0 0 0-2.61 0l-6 10.5a1.5 1.5 0 0 0 1.312 2.25h12a1.5 1.5 0 0 0 1.298-2.25Z" stroke="#EAB308" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      </svg>
    );
  }

  if (state === "error") {
    return (
      <svg aria-hidden="true" className="size-[18px] shrink-0" fill="none" viewBox="0 0 18 18">
        <path d="m13.5 4.5-9 9m0-9 9 9" stroke="#DC2626" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="size-[18px] shrink-0 animate-spin" fill="none" viewBox="0 0 18 18">
      <path d="M15.75 9a6.75 6.75 0 1 1-4.664-6.42" stroke="#737373" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  );
}

export function Toast({
  className,
  description,
  state = "default",
  title,
  ...props
}: ToastProps) {
  return (
    <div
      {...props}
      className={`inline-flex max-w-full items-center gap-[var(--spacing-spacing-2)] overflow-hidden rounded-[var(--radius-full)] border border-border-subtlest bg-bg-default px-[var(--spacing-spacing-4)] py-[var(--spacing-spacing-2)] shadow-[0_2px_8px_var(--color-opacity-black-10)] ${className ?? ""}`}
      role={state === "error" || state === "warning" ? "alert" : "status"}
    >
      {state === "default" ? null : <ToastIcon state={state} />}
      <span className="flex min-w-0 flex-col justify-center leading-[1.5]">
        <span className="truncate text-[length:var(--font-size-label1)] font-semibold text-black">
          {title}
        </span>
        {description ? (
          <span className="truncate text-[length:var(--font-size-caption2)] font-normal text-text-subtle">
            {description}
          </span>
        ) : null}
      </span>
    </div>
  );
}
