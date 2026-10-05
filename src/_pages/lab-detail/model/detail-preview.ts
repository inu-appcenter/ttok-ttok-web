import type { LabDetail } from "@/entities/lab";

/** 랩 소식 API 도입 전 디자인 검토용 목데이터. 실제 뉴스로 연결하지 않습니다. */
export const DETAIL_NEWS_PREVIEW: NonNullable<LabDetail["news"]> = [
  {
    id: "preview-paper",
    title: "박OO 학생, KDD 2026 논문 발표",
    date: "2026.08.12",
    source: "컴퓨터공학부 홈페이지",
    url: null,
  },
  {
    id: "preview-award",
    title: "이OO 학생, 한국정보과학회 우수논문상 수상",
    date: "2026.05.02",
    source: "인천대 뉴스",
    url: null,
  },
];
