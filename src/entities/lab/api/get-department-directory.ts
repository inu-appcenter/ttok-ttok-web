import { parseDepartmentDirectory } from "../model/department-directory";
import {
  getLaboratoryReferenceData,
  LaboratoryApiError,
} from "./laboratory-api";

export async function getDepartmentDirectory() {
  const data = await getLaboratoryReferenceData(
    "/api/laboratory/college-department/count",
  );
  try {
    return parseDepartmentDirectory(data);
  } catch {
    throw new LaboratoryApiError(
      "학과별 연구실 응답이 올바르지 않습니다.",
      502,
    );
  }
}
