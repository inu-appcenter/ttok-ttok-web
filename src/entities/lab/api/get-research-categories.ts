import { getLaboratoryReferenceData, LaboratoryApiError } from "./laboratory-api";

export async function getResearchCategories(): Promise<string[]> {
  const data = await getLaboratoryReferenceData("/api/research-area-category");

  if (!Array.isArray(data)) {
    throw new LaboratoryApiError("연구 분야 목록 응답이 올바르지 않습니다.", 502);
  }

  return data.map((item: unknown) => {
    if (
      typeof item !== "object" || item === null ||
      !("categoryName" in item) || typeof item.categoryName !== "string" ||
      !item.categoryName.trim()
    ) {
      throw new LaboratoryApiError("연구 분야 항목이 올바르지 않습니다.", 502);
    }
    return item.categoryName;
  });
}
