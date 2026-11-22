import type { CollegeOption } from "@/entities/lab";

import type { SearchConditions } from "./search-conditions";

export function getSearchAnalyticsProperties(
  conditions: SearchConditions,
  categories: readonly string[],
  colleges: readonly CollegeOption[],
) {
  const college = colleges.find(
    (option) => option.college === conditions.college || option.collegeName === conditions.college,
  );
  const department = (college ? [college] : colleges)
    .flatMap((option) => option.departments)
    .find(
      (option) => option.department === conditions.department || option.departmentName === conditions.department,
    );

  return {
    category: categories.includes(conditions.category) ? conditions.category : null,
    college: college?.college ?? null,
    department: department?.department ?? null,
    has_query: conditions.query.length > 0,
    query_length: conditions.query.length,
  };
}
