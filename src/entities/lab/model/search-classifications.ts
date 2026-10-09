export type DepartmentOption = {
  department: string;
  departmentName: string;
};

export type CollegeOption = {
  college: string;
  collegeName: string;
  departments: DepartmentOption[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function field(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("분류 목록의 코드 또는 이름이 올바르지 않습니다.");
  }
  return value.trim();
}

/** 참조 목록의 순서와 빈 단과대를 유지하고 코드로 소속 관계를 연결합니다. */
export function toCollegeOptions(colleges: unknown, departments: unknown): CollegeOption[] {
  if (!Array.isArray(colleges) || !Array.isArray(departments)) {
    throw new Error("분류 목록 응답이 올바르지 않습니다.");
  }
  const byCode = new Map<string, CollegeOption>();
  for (const value of colleges) {
    if (!isRecord(value)) throw new Error("단과대 항목이 올바르지 않습니다.");
    const college = field(value.college);
    if (byCode.has(college)) throw new Error("중복 단과대 코드입니다.");
    byCode.set(college, { college, collegeName: field(value.collegeName), departments: [] });
  }
  const departmentCodes = new Set<string>();
  for (const value of departments) {
    if (!isRecord(value)) throw new Error("학과 항목이 올바르지 않습니다.");
    const college = byCode.get(field(value.college));
    const department = field(value.department);
    if (!college || college.collegeName !== field(value.collegeName) || departmentCodes.has(department)) {
      throw new Error("학과 소속 또는 코드가 올바르지 않습니다.");
    }
    departmentCodes.add(department);
    college.departments.push({ department, departmentName: field(value.departmentName) });
  }
  return [...byCode.values()];
}
