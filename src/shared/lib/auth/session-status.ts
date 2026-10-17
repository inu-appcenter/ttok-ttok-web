export type SessionStatus =
  | { state: "valid"; isNew: boolean }
  | { state: "invalid" }
  | { state: "unavailable" };

export function isInvalidSessionResponse(status: number, code: unknown) {
  return status === 401 || (status === 404 && code === "MEMBER_NOT_FOUND");
}

/** Cookie presence is insufficient: verify the account and onboarding state. */
export async function getSessionStatus(
  accessToken: string,
  baseUrl: string | undefined,
  fetcher: typeof fetch = fetch,
): Promise<SessionStatus> {
  if (!baseUrl) return { state: "unavailable" };
  try {
    const response = await fetcher(
      `${baseUrl.replace(/\/$/, "")}/api/member/me`,
      {
        cache: "no-store",
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: AbortSignal.timeout(5000),
      },
    );
    const body = await response.json().catch(() => null);
    if (isInvalidSessionResponse(response.status, body?.code))
      return { state: "invalid" };
    if (
      !response.ok ||
      !body?.data ||
      !Number.isSafeInteger(body.data.id) ||
      body.data.id < 1 ||
      typeof body.data.isNew !== "boolean"
    ) {
      return { state: "unavailable" };
    }
    return { state: "valid", isNew: body.data.isNew };
  } catch {
    return { state: "unavailable" };
  }
}

export function requiresCompleteSession(path: string) {
  return (
    path === "/onboarding" ||
    path === "/recommendations" ||
    path === "/mypage" ||
    path.startsWith("/mypage/")
  );
}
