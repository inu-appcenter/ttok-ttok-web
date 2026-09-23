import { cookies } from "next/headers";

import { ACCESS_TOKEN_COOKIE, MEMBER_ID_COOKIE } from "./cookies";

export type AuthSession = {
  isAuthenticated: boolean;
  memberId?: number;
  role?: string;
  studentNumber?: string;
};

function getPositiveInteger(value: unknown) {
  const number = typeof value === "string" ? Number(value) : value;

  return typeof number === "number" && Number.isSafeInteger(number) && number > 0
    ? number
    : undefined;
}

type AccessTokenClaims = {
  memberId?: number;
  role?: string;
  studentNumber?: string;
};

function getAccessTokenClaims(accessToken: string): AccessTokenClaims {
  const payload = accessToken.split(".")[1];

  if (!payload) return {};

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
      return {};
    }

    const claims = decodedPayload as Record<string, unknown>;

    return {
      memberId:
        getPositiveInteger(claims.memberId) ??
        getPositiveInteger(claims.member_id) ??
        getPositiveInteger(claims.id) ??
        getPositiveInteger(claims.sub),
      role: typeof claims.role === "string" ? claims.role : undefined,
      studentNumber:
        typeof claims.studentNumber === "string"
          ? claims.studentNumber
          : undefined,
    };
  } catch {
    return {};
  }
}

export async function getAuthSession(): Promise<AuthSession> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const claims = accessToken ? getAccessTokenClaims(accessToken) : {};
  const memberId =
    getPositiveInteger(cookieStore.get(MEMBER_ID_COOKIE)?.value) ??
    claims.memberId;

  return {
    isAuthenticated: Boolean(accessToken),
    memberId,
    role: claims.role,
    studentNumber: claims.studentNumber,
  };
}
