import { SearchPage } from "@/_pages/search";
import { toLabSummaryPage, type LabSummaryPage } from "@/entities/lab";
import { getLaboratories, searchLaboratories } from "@/entities/lab/api";
import { getAuthSession } from "@/shared/lib/auth/session";

const PAGE_SIZE = 20;

type SearchRouteProps = {
  searchParams: Promise<{
    page?: string | string[];
    q?: string | string[];
  }>;
};

function getSingleSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getPage(value: string | undefined) {
  if (value === undefined) {
    return 0;
  }

  const page = Number(value);

  return Number.isInteger(page) && page >= 0 ? page : 0;
}

export default async function Page({ searchParams }: SearchRouteProps) {
  const params = await searchParams;
  const query = getSingleSearchParam(params.q)?.trim() ?? "";
  const page = getPage(getSingleSearchParam(params.page));
  const { isAuthenticated } = await getAuthSession();
  let result: LabSummaryPage;

  try {
    const laboratoryPage = query
      ? await searchLaboratories({ keyword: query, page, size: PAGE_SIZE })
      : await getLaboratories(
          { page, size: PAGE_SIZE },
          { cache: "no-store", revalidate: 0 },
        );
    result = toLabSummaryPage(laboratoryPage);
  } catch {
    return (
      <SearchPage
        errorMessage="잠시 후 다시 시도해주세요."
        initialQuery={query}
        isAuthenticated={isAuthenticated}
        page={page}
        status="error"
      />
    );
  }

  return (
    <SearchPage
      initialQuery={query}
      isAuthenticated={isAuthenticated}
      result={result}
    />
  );
}
