import type { LaboratoryPage, LaboratoryPageParams } from "../model/laboratory";

import {
  getLaboratoryPage,
  type LaboratoryRequestOptions,
} from "./laboratory-api";

/** 페이지 단위로 연구실 목록을 조회합니다. */
export function getLaboratories(
  params?: LaboratoryPageParams,
  options?: LaboratoryRequestOptions,
): Promise<LaboratoryPage> {
  return getLaboratoryPage("/api/laboratory", params, undefined, options);
}
