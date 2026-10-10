import "server-only";
import { parseDetailPage, toPublication } from "../model/map-detail-content";
import type { LabPaper } from "../model/lab";
import {
  getLaboratoryReferenceData,
  LaboratoryApiError,
} from "./laboratory-api";

export async function getAllPublications(
  laboratoryId: number,
): Promise<LabPaper[]> {
  async function getPage(page: number) {
    const data = await getLaboratoryReferenceData(
      `/api/laboratory/${laboratoryId}/publications`,
      { page: String(page) },
    );
    const result = parseDetailPage(data, toPublication);
    const totalElements =
      data && typeof data === "object" && "totalElements" in data
        ? data.totalElements
        : undefined;
    if (
      result.state.page !== page ||
      !Number.isSafeInteger(result.state.totalPages) ||
      typeof totalElements !== "number" ||
      !Number.isSafeInteger(totalElements) ||
      totalElements < 0
    )
      throw new LaboratoryApiError(
        "논문 페이지 응답이 올바르지 않습니다.",
        502,
      );
    return { ...result, totalElements };
  }
  const first = await getPage(0);
  const papers = [...first.content];
  // 이름순은 전체 목록을 대상으로 적용합니다. 동시 요청 수는 4개로 제한합니다.
  for (let start = 1; start < first.state.totalPages; start += 4) {
    const pages = await Promise.all(
      Array.from(
        { length: Math.min(4, first.state.totalPages - start) },
        (_, index) => getPage(start + index),
      ),
    );
    for (const page of pages) {
      if (
        page.state.totalPages !== first.state.totalPages ||
        page.totalElements !== first.totalElements
      )
        throw new LaboratoryApiError(
          "논문 목록이 변경되었습니다. 다시 불러와주세요.",
          502,
        );
      papers.push(...page.content);
    }
  }
  if (papers.length !== first.totalElements)
    throw new LaboratoryApiError(
      "논문 전체 목록을 확인하지 못했어요. 다시 불러와주세요.",
      502,
    );
  return papers;
}
