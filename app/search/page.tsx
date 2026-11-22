import { AnalyticsView } from "@/shared/lib/analytics/view";
import type { Metadata } from "next";
import { SearchPage } from "@/_pages/search";
import { DEFAULT_OPEN_GRAPH } from "@/shared/config";
import { getResearchCategories, getCollegeOptions } from "@/entities/lab/api";
import {
  getSearchAnalyticsProperties,
  parseSearchConditions,
  type SearchRouteParams,
} from "@/features/search-lab";
import { getSearchResults } from "@/features/search-lab/api";

export const metadata: Metadata = {
  openGraph: { ...DEFAULT_OPEN_GRAPH, url: "/search" },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchRouteParams>;
}) {
  const conditions = parseSearchConditions(await searchParams);
  const [search, categories, collegesResult] = await Promise.all([
    getSearchResults(conditions),
    getResearchCategories().then(
      (categories) => ({ categories, categoriesError: undefined }),
      () => ({
        categories: [],
        categoriesError: "분야 목록을 불러오지 못했어요.",
      }),
    ),
    getCollegeOptions().then(
      (colleges) => ({ colleges, collegesError: undefined }),
      () => ({ colleges: [], collegesError: "학과 목록을 불러오지 못했어요." }),
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

  const searchProperties = getSearchAnalyticsProperties(conditions, categories.categories, collegesResult.colleges);

  return (
    <>
      <AnalyticsView event="view_search" properties={{ ...searchProperties, result_count: search.result?.totalElements ?? null }} />
      {search.result?.totalElements === 0 && (
        <AnalyticsView
          key={JSON.stringify(conditions)}
          event="view_search_no_result"
          properties={searchProperties}
        />
      )}
      <SearchPage
        alternativeLabs={alternativeLabs}
        {...search}
        {...categories}
        {...collegesResult}
        category={conditions.category}
        college={conditions.college}
        department={conditions.department}
        initialQuery={conditions.query}
        invalidConditions={search.invalidConditions}
        page={conditions.page}
        status={search.result ? "ready" : "error"}
      />
    </>
  );
}
