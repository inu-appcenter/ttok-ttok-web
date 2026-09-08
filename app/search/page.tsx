import { SearchPage } from "@/_pages/search";
import { getPopularLabs } from "@/entities/lab";
import { getAuthSession } from "@/shared/lib/auth/session";

type SearchRouteProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function Page({ searchParams }: SearchRouteProps) {
  const [{ q }, labs, { isAuthenticated }] = await Promise.all([
    searchParams,
    getPopularLabs(),
    getAuthSession(),
  ]);

  return <SearchPage initialQuery={q} isAuthenticated={isAuthenticated} labs={labs} />;
}
