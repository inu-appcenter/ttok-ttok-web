import { SearchPage } from "@/_pages/search";
import { getResearchCategories } from "@/entities/lab/api";
import {
  parseSearchConditions,
  type SearchRouteParams,
} from "@/features/search-lab";
import { getSearchResults } from "@/features/search-lab/api";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchRouteParams>;
}) {
  const conditions = parseSearchConditions(await searchParams);
  const [search, categories] = await Promise.all([
    getSearchResults(conditions),
    getResearchCategories().then(
      (categories) => ({ categories, categoriesError: undefined }),
      () => ({
        categories: [],
        categoriesError: "분야 목록을 불러오지 못했어요.",
      }),
    ),
  ]);

  // 빈 결과에서 보여줄 대체 카드는 일반 목록의 서버 기본 순서 상위 3개입니다.
  // 개인화/연관 검색 API가 없으므로 별도의 추천 순위를 만들지 않습니다.
  const alternativeLabs =
    search.result?.totalElements === 0 &&
    (conditions.query || conditions.category || conditions.college || conditions.department)
      ? ((
          await getSearchResults({ query: "", category: "", page: 0 })
        ).result?.content.slice(0, 3) ?? [])
      : [];

  return (
    <SearchPage
      alternativeLabs={alternativeLabs}
      {...search}
      {...categories}
      category={conditions.category}
      college={conditions.college}
      department={conditions.department}
      initialQuery={conditions.query}
      invalidConditions={search.invalidConditions}
      page={conditions.page}
      status={search.result ? "ready" : "error"}
    />
  );
}
