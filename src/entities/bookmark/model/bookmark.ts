export type Bookmark = {
  id: number;
  laboratory: {
    labId: string;
    laboratoryId: number;
    name: string;
    department: string;
    professorName: string;
    tags: string[];
    description: string;
  };
};

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("관심 연구실 응답이 올바르지 않습니다.");
  return value as Record<string, unknown>;
}
function id(value: unknown): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 1)
    throw new Error("관심 연구실 ID가 올바르지 않습니다.");
  return value;
}
function text(value: unknown): string {
  if (typeof value !== "string" || !value.trim())
    throw new Error("관심 연구실 정보가 올바르지 않습니다.");
  return value;
}
export function toBookmarks(value: unknown): Bookmark[] {
  if (!Array.isArray(value))
    throw new Error("관심 연구실 목록이 올바르지 않습니다.");
  const labIds = new Set<number>();
  return value.map((item) => {
    const bookmark = record(item),
      lab = record(bookmark.laboratory),
      professor = record(lab.professor);
    const laboratoryId = id(lab.id);
    if (labIds.has(laboratoryId))
      throw new Error("관심 연구실이 중복되었습니다.");
    labIds.add(laboratoryId);
    if (
      !Array.isArray(lab.researchAreas) ||
      !lab.researchAreas.every((tag) => typeof tag === "string")
    )
      throw new Error("관심 연구실 키워드가 올바르지 않습니다.");
    return {
      id: id(bookmark.id),
      laboratory: {
        laboratoryId,
        labId: String(laboratoryId),
        name: text(lab.labName),
        department: text(lab.departmentName),
        professorName: text(professor.name),
        tags: lab.researchAreas as string[],
        description:
          typeof lab.introduction === "string" ? lab.introduction : "",
      },
    };
  });
}
