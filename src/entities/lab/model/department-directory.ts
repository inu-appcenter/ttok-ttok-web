export type DepartmentLabCount = {
  department: string;
  departmentName: string;
  count: number;
};

export type CollegeLabCount = {
  college: string;
  collegeName: string;
  departments: DepartmentLabCount[];
};

export function parseDepartmentDirectory(value: unknown): CollegeLabCount[] {
  const fail = () => {
    throw new Error("학과별 연구실 응답이 올바르지 않습니다.");
  };
  const object = (item: unknown): Record<string, unknown> =>
    item && typeof item === "object" && !Array.isArray(item)
      ? (item as Record<string, unknown>)
      : fail();
  const name = (item: unknown) =>
    typeof item === "string" && item.trim() ? item : fail();
  if (!Array.isArray(value)) return fail();
  return value
    .map((item) => {
      const college = object(item);
      if (!Array.isArray(college.departments)) return fail();
      return {
        college: name(college.college),
        collegeName: name(college.collegeName),
        departments: college.departments
          .map((item: unknown) => {
            const department = object(item);
            if (
              typeof department.count !== "number" ||
              !Number.isSafeInteger(department.count) ||
              department.count < 0
            )
              return fail();
            return {
              department: name(department.department),
              departmentName: name(department.departmentName),
              count: department.count,
            };
          })
          .filter((department) => department.count > 0)
          .sort((left, right) => right.count - left.count),
      };
    })
    .filter((college) => college.departments.length > 0);
}
