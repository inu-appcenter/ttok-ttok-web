"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function DetailRetryButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  return (
    <button
      className="mt-2 cursor-pointer rounded-sm text-[length:var(--font-size-caption1)] text-text-primary hover:underline focus-visible:outline-2 focus-visible:outline-border-primary disabled:opacity-50"
      disabled={isPending}
      onClick={() => startTransition(() => router.refresh())}
      type="button"
    >
      다시 시도
    </button>
  );
}
