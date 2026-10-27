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

// 토큰 원문을 클라이언트에 넘기지 않고, 로그인마다 달라지는 단방향 식별자를 만든다.
// 클라이언트 메모리 상태를 현재 세션에 묶는 용도로만 쓴다. 토큰이 재발급되면 값이 바뀌어
// 복원이 보수적으로 무효화된다.
export async function getAuthSessionKey(): Promise<string | undefined> {
  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) return undefined;

  try {
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(accessToken),
    );

    return Array.from(new Uint8Array(digest).slice(0, 16), (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");
  } catch {
    return undefined;
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
