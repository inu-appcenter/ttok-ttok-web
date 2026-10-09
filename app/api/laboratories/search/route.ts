import { getSearchResults } from "@/features/search-lab/api";
import { parseSearchConditions } from "@/features/search-lab";

export async function GET(request: Request) {
  const params: Record<string, string[]> = {};
  new URL(request.url).searchParams.forEach((value, name) => {
    (params[name] ??= []).push(value);
  });
  const search = await getSearchResults(parseSearchConditions(params));
  return Response.json(
    search.result ?? { message: search.errorMessage },
    { status: search.result ? 200 : search.invalidConditions ? 400 : 502 },
  );
}
