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
      className="my-6 rounded-xl border border-border-subtle"
    >
      <table className="w-full table-fixed border-collapse text-left text-sm leading-7 [&_td]:[overflow-wrap:anywhere] [&_th]:[overflow-wrap:anywhere] [&_td]:border-t [&_td]:border-border-subtle [&_td]:px-2 md:[&_td]:px-4 [&_td]:py-3 [&_td]:align-top [&_th]:px-2 md:[&_th]:px-4 [&_th]:py-3 [&_th]:align-top [&_th]:font-medium [&_thead]:bg-bg-subtle [&_tbody_th]:border-t [&_tbody_th]:border-border-subtle">
        {children}
      </table>
    </div>
  );
}
