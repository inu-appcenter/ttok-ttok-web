import "server-only";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ACCESS_TOKEN_COOKIE } from "@/shared/lib/auth/cookies";
import { clearAuthCookies } from "@/shared/lib/auth/clear-auth-cookies";

export class AuthenticatedApiError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

/** 사용자별 응답은 Next 캐시와 브라우저 공유 캐시에 저장하지 않습니다. */
export async function authenticatedRequest(path: string, init: RequestInit = {}): Promise<unknown> {
  const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) throw new AuthenticatedApiError("로그인이 필요합니다.", 401);
  const base = process.env.API_BASE_URL;
  if (!base) throw new AuthenticatedApiError("API 서버 주소가 설정되지 않았습니다.", 500);
  let response: Response;
  try {
    response = await fetch(`${base.replace(/\/$/, "")}${path}`, {
      ...init, cache: "no-store",
      headers: { "Content-Type": "application/json", ...init.headers, Authorization: `Bearer ${token}` },
    });
  } catch { throw new AuthenticatedApiError("요청을 완료하지 못했어요. 다시 시도해주세요.", 502); }
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new AuthenticatedApiError(typeof body?.message === "string" ? body.message : "요청을 완료하지 못했어요.", response.status);
  if (!body || typeof body !== "object" || !("data" in body)) throw new AuthenticatedApiError("서버 응답이 올바르지 않습니다.", 502);
  return body.data;
}

export function authenticatedErrorResponse(error: unknown) {
  const status = error instanceof AuthenticatedApiError ? error.status : 502;
  const response = NextResponse.json({ message: error instanceof Error ? error.message : "요청을 완료하지 못했어요.", requiresLogin: status === 401 }, { status, headers: { "Cache-Control": "private, no-store" } });
  return status === 401 ? clearAuthCookies(response) : response;
}
