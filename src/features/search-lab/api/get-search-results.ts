import "server-only";

import { toLabSummaryPage } from "@/entities/lab";
import { getLaboratories, searchLaboratories, searchLaboratoriesByCategory } from "@/entities/lab/api";

import { getSearchRequest, type SearchConditions } from "../model/search-conditions";

export async function getSearchResults(conditions: SearchConditions) {
  const request = getSearchRequest(conditions);
  if (!request) return { errorMessage: conditions.error, result: undefined };

  try {
    const page = Number(request.params.page);
    const laboratoryPage = request.path === "/api/laboratory/search/category"
      ? await searchLaboratoriesByCategory(request.params.categoryName, page)
      : request.path === "/api/laboratory/search"
        ? await searchLaboratories({ keyword: request.params.keyword, page })
        : await getLaboratories({ page }, { cache: "no-store", revalidate: 0 });

    return { result: toLabSummaryPage(laboratoryPage), errorMessage: undefined };
  } catch {
    return { errorMessage: "잠시 후 다시 시도해주세요.", result: undefined };
  }
}
