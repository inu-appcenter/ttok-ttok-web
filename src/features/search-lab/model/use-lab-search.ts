"use client";

import { useMemo, useState } from "react";

import type { LabSummary } from "@/entities/lab";

export function useLabSearch(labs: LabSummary[]) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ko-KR");

    if (!normalizedQuery) {
      return [];
    }

    return labs.filter((lab) =>
      [lab.name, lab.professorName, lab.department, ...lab.tags].some((value) =>
        value.toLocaleLowerCase("ko-KR").includes(normalizedQuery),
      ),
    );
  }, [labs, query]);

  return { query, results, setQuery };
}
