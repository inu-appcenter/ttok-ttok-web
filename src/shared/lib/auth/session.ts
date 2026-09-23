import { cookies } from "next/headers";

import { ACCESS_TOKEN_COOKIE, MEMBER_ID_COOKIE } from "./cookies";

export type AuthSession = {
  isAuthenticated: boolean;
  memberId?: number;
};

function getPositiveInteger(value: unknown) {
  const number = typeof value === "string" ? Number(value) : value;

  return typeof number === "number" && Number.isSafeInteger(number) && number > 0
    ? number
    : undefined;
}

function getMemberIdFromAccessToken(accessToken: string) {
  const payload = accessToken.split(".")[1];

  if (!payload) return undefined;

  try {
    const decodedPayload: unknown = JSON.parse(
      atob(
        payload
          .replace(/-/g, "+")
          .replace(/_/g, "/")
          .padEnd(Math.ceil(payload.length / 4) * 4, "="),
      ),
    );

    if (!decodedPayload || typeof decodedPayload !== "object") {
      return undefined;
    }

    const claims = decodedPayload as Record<string, unknown>;

    return (
      getPositiveInteger(claims.memberId) ??
      getPositiveInteger(claims.member_id) ??
      getPositiveInteger(claims.id)
    );
  } catch {
    return undefined;
  }
}

export async function getAuthSession(): Promise<AuthSession> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const memberId =
    getPositiveInteger(cookieStore.get(MEMBER_ID_COOKIE)?.value) ??
    (accessToken ? getMemberIdFromAccessToken(accessToken) : undefined);

  return {
    isAuthenticated: Boolean(accessToken),
    memberId,
  };
}
