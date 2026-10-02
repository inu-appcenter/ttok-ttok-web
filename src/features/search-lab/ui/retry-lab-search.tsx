"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/shared/ui";

export function RetryLabSearch() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      disabled={isPending}
      onClick={() => startTransition(() => router.refresh())}
      variant="outline"
    >
      다시 시도
    </Button>
  );
}
