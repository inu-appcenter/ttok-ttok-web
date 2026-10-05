import type {
  LaboratoryPage,
  LaboratorySearchParams,
} from "../model/laboratory";

import { LaboratoryApiError, getLaboratoryPage } from "./laboratory-api";

/** 연구실명·교수명 키워드와 학과명으로 페이지 단위 검색합니다. */
export function searchLaboratories({
  keyword = "",
  department = "",
  ...params
}: LaboratorySearchParams): Promise<LaboratoryPage> {
  const normalizedKeyword = keyword.trim();

  const normalizedDepartment = department.trim();

  if (!normalizedKeyword && !normalizedDepartment) {
    throw new LaboratoryApiError("검색어를 입력해주세요.", 400);
  }

  return getLaboratoryPage(
    "/api/laboratory/search",
    params,
    {
      ...(normalizedKeyword ? { keyword: normalizedKeyword } : {}),
      ...(normalizedDepartment ? { department: normalizedDepartment } : {}),
    },
    { cache: "no-store", revalidate: 0 },
  );
}
