import type {
  LaboratoryPage,
  LaboratorySearchParams,
} from "../model/laboratory";

import { getLaboratoryPage } from "./laboratory-api";

/** 선택한 조건은 AND로 결합하며, 조건이 없으면 전체 연구실을 조회합니다. */
export function searchLaboratories({
  keyword = "",
  category = "",
  college = "",
  department = "",
  ...params
}: LaboratorySearchParams): Promise<LaboratoryPage> {
  const conditions = { keyword, category, college, department };
  const searchParams: Record<string, string> = {};
  for (const [name, value] of Object.entries(conditions)) {
    if (value.trim()) searchParams[name] = value.trim();
  }

  return getLaboratoryPage(
    "/api/laboratory/search",
    params,
    searchParams,
    { cache: "no-store", revalidate: 0 },
  );
}
