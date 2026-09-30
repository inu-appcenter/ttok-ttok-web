import { getLaboratoryPage, LaboratoryApiError } from "./laboratory-api";

/** 서버 계약: 상위 카테고리 단독 검색, 페이지 크기는 20건으로 고정됩니다. */
export function searchLaboratoriesByCategory(categoryName: string, page = 0) {
  if (!categoryName.trim()) {
    throw new LaboratoryApiError("연구 분야를 선택해주세요.", 400);
  }
  return getLaboratoryPage("/api/laboratory/search/category", { page }, {
    categoryName: categoryName.trim(),
  }, { cache: "no-store", revalidate: 0 });
}
