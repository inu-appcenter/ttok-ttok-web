import type {
  LaboratoryPage,
  LaboratorySearchParams,
} from "../model/laboratory";

import { LaboratoryApiError, getLaboratoryPage } from "./laboratory-api";

/** 연구실명 또는 교수명으로 페이지 단위 검색합니다. */
export function searchLaboratories({
  keyword,
  ...params
}: LaboratorySearchParams): Promise<LaboratoryPage> {
  const normalizedKeyword = keyword.trim();

  if (!normalizedKeyword) {
    throw new LaboratoryApiError("검색어를 입력해주세요.", 400);
  }

  return getLaboratoryPage("/api/laboratory/search", params, {
    keyword: normalizedKeyword,
  });
}
