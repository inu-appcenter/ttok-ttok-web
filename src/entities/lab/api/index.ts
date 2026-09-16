/**
 * Server Component와 Route Handler 전용 연구실 조회 공개 API입니다.
 * Client Component에서는 이 진입점을 import하지 않습니다.
 */
export { getLaboratories } from "./get-laboratories";
export {
  LaboratoryApiError,
  type LaboratoryRequestOptions,
} from "./laboratory-api";
export { searchLaboratories } from "./search-laboratories";
