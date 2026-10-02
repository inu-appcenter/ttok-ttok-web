import { SearchPage } from "@/_pages/search";
import { getResearchCategories } from "@/entities/lab/api";
import { parseSearchConditions, type SearchRouteParams } from "@/features/search-lab";
import { getSearchResults } from "@/features/search-lab/api";

export default async function Page({ searchParams }: {
  searchParams: Promise<SearchRouteParams>;
}) {
  const conditions = parseSearchConditions(await searchParams);
  const [search, categories] = await Promise.all([
    getSearchResults(conditions),
    getResearchCategories().then(
      (categories) => ({ categories, categoriesError: undefined }),
      () => ({ categories: [], categoriesError: "분야 목록을 불러오지 못했어요." }),
    ),
  ]);

  return (
    <SearchPage
      {...search}
      {...categories}
      category={conditions.category}
      initialQuery={conditions.query}
      invalidConditions={Boolean(conditions.error)}
      page={conditions.page}
      status={search.result ? "ready" : "error"}
    />
  );
}
