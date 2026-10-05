import type { ReactNode } from "react";

export function PolicyTable({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className="my-6 overflow-x-auto rounded-xl border border-border-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary"
    >
      <table className="w-full min-w-[600px] border-collapse text-left text-sm leading-7 [&_td]:border-t [&_td]:border-border-subtle [&_td]:px-4 [&_td]:py-3 [&_td]:align-top [&_th]:px-4 [&_th]:py-3 [&_th]:align-top [&_th]:font-medium [&_thead]:bg-bg-subtle [&_tbody_th]:w-1/4 [&_tbody_th]:border-t [&_tbody_th]:border-border-subtle">
        {children}
      </table>
    </div>
  );
}
