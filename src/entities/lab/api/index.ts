/**
 * Server Component와 Route Handler 전용 연구실 조회 공개 API입니다.
 * Client Component에서는 이 진입점을 import하지 않습니다.
 */
export { getLaboratories } from "./get-laboratories";
export { getHomeLabs } from "./get-home-labs";
export { getLabById } from "./get-lab-by-id";
export {
  LaboratoryApiError,
  type LaboratoryRequestOptions,
} from "./laboratory-api";
export { searchLaboratories } from "./search-laboratories";
export { getResearchCategories } from "./get-research-categories";
export { searchLaboratoriesByCategory } from "./search-laboratories-by-category";

export { getDepartmentDirectory } from "./get-department-directory";
