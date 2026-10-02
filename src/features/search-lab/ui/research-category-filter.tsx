"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Radio } from "@/shared/ui";

import { createSearchHref } from "../model/search-conditions";

export function ResearchCategoryFilter({
  categories,
  category,
}: {
  categories: string[];
  category: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const options = [...new Set(["", ...categories, ...(category ? [category] : [])])];

  return (
    <div aria-label="연구 분야" aria-busy={isPending} className="flex w-full flex-wrap gap-2" role="radiogroup">
      {options.map((value) => (
        <Radio
          appearance="chip"
          checked={category === value}
          disabled={isPending}
          key={value}
          name="research-field"
          onChange={() => startTransition(() => router.push(createSearchHref({ category: value })))}
          value={value}
        >
          {value || "전체"}
        </Radio>
      ))}
    </div>
  );
}
