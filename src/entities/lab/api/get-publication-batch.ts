import "server-only";
import { parseDetailPage, toPublication } from "../model/map-detail-content";
import {
  getLaboratoryReferenceData,
  LaboratoryApiError,
} from "./laboratory-api";

export async function getPublicationBatch(laboratoryId: number, startPage = 0) {
  async function getPage(page: number) {
    try {
      const data = await getLaboratoryReferenceData(
        `/api/laboratory/${laboratoryId}/publications`,
        { page: String(page) },
        // 전체 개수를 검증하므로 서로 다른 시점의 페이지 캐시를 섞지 않습니다.
        { cache: "no-store", revalidate: 0 },
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
    } catch (error) {
      console.error("[papers] 논문 페이지 조회 실패", {
        laboratoryId,
        page,
        name: error instanceof Error ? error.name : "UnknownError",
        message: error instanceof Error ? error.message : "Unknown failure",
        status: error instanceof LaboratoryApiError ? error.status : undefined,
      });
      throw error;
    }
  }
  const first = await getPage(startPage);
  if (startPage > 0 && startPage >= first.state.totalPages)
    throw new LaboratoryApiError("논문 페이지 범위를 벗어났습니다.", 502);
  const endPage = Math.min(startPage + 20, first.state.totalPages);
  const papers = [...first.content];
  // 이름순은 전체 목록을 대상으로 적용합니다. 동시 요청 수는 4개로 제한합니다.
  for (let start = startPage + 1; start < endPage; start += 4) {
    const pages = await Promise.all(
      Array.from({ length: Math.min(4, endPage - start) }, (_, index) =>
        getPage(start + index),
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
  // Swagger는 페이지당 5편 고정입니다. 누락된 페이지를 성공으로 취급하지 않습니다.
  if (
    papers.length !==
    Math.max(0, Math.min(first.totalElements, endPage * 5) - startPage * 5)
  )
    throw new LaboratoryApiError(
      "논문 전체 목록을 확인하지 못했어요. 다시 불러와주세요.",
      502,
    );
  return {
    papers,
    totalElements: first.totalElements,
    nextPage: endPage < first.state.totalPages ? endPage : null,
  };
}
