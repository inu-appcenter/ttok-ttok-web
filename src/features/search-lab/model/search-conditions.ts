export type SearchRouteParams = Record<string, string | string[] | undefined>;

export type SearchConditions = {
  query: string;
  category: string;
  department?: string;
  page: number;
  error?: string;
};

export function parseSearchConditions(
  params: SearchRouteParams,
): SearchConditions {
  const first = (value: string | string[] | undefined) =>
    (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
  const query = first(params.q);
  const category = first(params.category);
  const department = first(params.department);
  const rawPage = first(params.page);
  const pageNumber = /^\d+$/.test(rawPage) ? Number(rawPage) : 0;
  const page =
    Number.isSafeInteger(pageNumber) && pageNumber <= 2147483647
      ? pageNumber
      : 0;
  let error: string | undefined;

  if (
    [params.q, params.category, params.department].some(
      (value) => Array.isArray(value) && value.length > 1,
    )
  ) {
    error = "검색 조건은 하나씩 선택해주세요.";
  } else if (category && department) {
    error = "분야와 학과는 각각 검색할 수 있어요. 하나의 조건만 선택해주세요.";
  } else if (query && category) {
    error =
      "분야와 검색어는 각각 검색할 수 있어요. 하나의 조건만 선택해주세요.";
  }

  return {
    query,
    category,
    ...(department ? { department } : {}),
    page,
    ...(error ? { error } : {}),
  };
}

export function createSearchHref({
  query = "",
  category = "",
  department = "",
  page = 0,
}: Partial<
  Pick<SearchConditions, "query" | "category" | "department" | "page">
> = {}) {
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query.trim());
  if (category.trim()) params.set("category", category.trim());
  if (department.trim()) params.set("department", department.trim());
  if (page > 0) params.set("page", String(page));
  const search = params.toString();
  return search ? `/search?${search}` : "/search";
}

export function getSearchRequest(conditions: SearchConditions) {
  if (conditions.error) return null;
  if (conditions.category) {
    return {
      path: "/api/laboratory/search/category" as const,
      params: {
        categoryName: conditions.category,
        page: String(conditions.page),
      },
    };
  }
  if (conditions.query || conditions.department) {
    return {
      path: "/api/laboratory/search" as const,
      params: {
        keyword: conditions.query,
        ...(conditions.department ? { department: conditions.department } : {}),
        page: String(conditions.page),
      },
    };
  }
  return {
    path: "/api/laboratory" as const,
    params: { page: String(conditions.page) },
  };
}
