import { toCollegeOptions } from "../model/search-classifications";
import { getLaboratoryReferenceData, LaboratoryApiError } from "./laboratory-api";

export async function getCollegeOptions() {
  const [colleges, departments] = await Promise.all([
    getLaboratoryReferenceData("/api/college"),
    getLaboratoryReferenceData("/api/college/department"),
  ]);
  try {
    return toCollegeOptions(colleges, departments);
  } catch {
    throw new LaboratoryApiError("단과대·학과 목록 응답이 올바르지 않습니다.", 502);
  }
}
