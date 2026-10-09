import type { LabSummaryPage } from "@/entities/lab";

export function appendSearchPage(current: LabSummaryPage, next: LabSummaryPage): LabSummaryPage {
  if (!current.hasNext || current.isLast || next.page !== current.page + 1) {
    throw new Error("검색 페이지 순서가 올바르지 않습니다.");
  }
  const seen = new Set(current.content.map((lab) => lab.labId));
  const added = next.content.filter((lab) => {
    if (seen.has(lab.labId)) return false;
    seen.add(lab.labId);
    return true;
  });
  return { ...next, content: [...current.content, ...added] };
}
