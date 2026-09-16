import type { LabSummary, LabSummaryPage } from "./lab";
import type { Laboratory, LaboratoryPage } from "./laboratory";

const EMPTY_INTRODUCTION = "연구실 소개 정보를 준비하고 있습니다.";

/** 서버 연구실 모델을 카드와 선택 UI에서 사용하는 모델로 변환합니다. */
export function toLabSummary(laboratory: Laboratory): LabSummary {
  return {
    department: laboratory.departmentName,
    description: laboratory.introduction ?? EMPTY_INTRODUCTION,
    labId: String(laboratory.id),
    laboratoryId: laboratory.id,
    name: laboratory.labName,
    professorName: laboratory.professor.name,
    tags: laboratory.researchAreas,
  };
}

/** 서버 페이지네이션 메타데이터를 유지하며 카드 UI 모델로 변환합니다. */
export function toLabSummaryPage(page: LaboratoryPage): LabSummaryPage {
  return {
    ...page,
    content: page.content.map(toLabSummary),
  };
}
