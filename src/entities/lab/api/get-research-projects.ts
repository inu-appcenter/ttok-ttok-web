import "server-only";

import { parseDetailPage, toResearchProject } from "../model/map-detail-content";
import { getLaboratoryReferenceData, LaboratoryApiError } from "./laboratory-api";

export async function getResearchProjects(laboratoryId: number, page: number) {
  const data = await getLaboratoryReferenceData(
    `/api/laboratory/${laboratoryId}/research-projects`,
    { page: String(page) },
    { cache: "no-store", revalidate: 0 },
  );
  const result = parseDetailPage(data, toResearchProject);
  if (result.state.page !== page) {
    throw new LaboratoryApiError("연구과제 페이지 응답이 올바르지 않습니다.", 502);
  }
  return result;
}
