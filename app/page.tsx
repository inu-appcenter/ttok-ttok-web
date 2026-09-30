import { HomePage } from "@/_pages/home";
import { getHomeLabs, getResearchCategories } from "@/entities/lab/api";
import { getAuthSession } from "@/shared/lib/auth/session";

export default async function Page() {
  const [{ isAuthenticated }, labsResult, categoriesResult] = await Promise.all([
    getAuthSession(),
    getHomeLabs().then(
      (labs) => ({ labs, labsError: undefined }),
      () => ({ labs: [], labsError: "연구실 정보를 불러오지 못했습니다." }),
    ),
    getResearchCategories().then(
      (categories) => ({ categories, categoriesError: undefined }),
      () => ({
        categories: [],
        categoriesError: "분야 목록을 불러오지 못했습니다. 검색어로 검색해주세요. ",
      }),
    ),
  ]);

  return (
    <HomePage
      isAuthenticated={isAuthenticated}
      {...labsResult}
      {...categoriesResult}
    />
  );
}
