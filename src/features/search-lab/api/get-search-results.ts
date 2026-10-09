import "server-only";

import { toLabSummaryPage } from "@/entities/lab";
import { LaboratoryApiError, searchLaboratories } from "@/entities/lab/api";

import {
  getSearchRequest,
  type SearchConditions,
} from "../model/search-conditions";

export async function getSearchResults(conditions: SearchConditions) {
  const request = getSearchRequest(conditions);
  if (!request) {
    return { errorMessage: conditions.error, invalidConditions: true, result: undefined };
  }

  try {
    const laboratoryPage = await searchLaboratories({
      ...request.params,
      page: Number(request.params.page),
    });
    return {
      result: toLabSummaryPage(laboratoryPage),
      errorMessage: undefined,
      invalidConditions: false,
    };
  } catch (error) {
    const invalidConditions = error instanceof LaboratoryApiError && error.status === 400;
    return {
      errorMessage: invalidConditions
        ? "선택한 검색 조건을 확인해주세요."
        : "잠시 후 다시 시도해주세요.",
      invalidConditions,
      result: undefined,
    };
  }
}
