export async function saveOnboardingDepartment({
  baseUrl,
  accessToken,
  department,
  fetcher = fetch,
}: {
  baseUrl: string;
  accessToken: string;
  department: string;
  fetcher?: typeof fetch;
}) {
  return fetcher(`${baseUrl.replace(/\/$/, "")}/api/member`, {
    method: "PATCH",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ department }),
  });
}
