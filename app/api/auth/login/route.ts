import { NextResponse } from "next/server";

import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "@/shared/lib/auth/cookies";
const INVALID_CREDENTIALS_MESSAGE =
  "학번 또는 비밀번호가 일치하지 않습니다.";
const INVALID_INPUT_MESSAGE = "학번과 비밀번호를 모두 입력해주세요.";
const SERVER_ERROR_MESSAGE =
  "로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";

type LoginRequest = {
  password: string;
  studentNumber: string;
};

type LoginTokenData = {
  accessToken: string;
  accessTokenExpiresAt: string;
  isNew: boolean;
  memberId: number;
  refreshToken: string;
  refreshTokenExpiresAt: string;
};

type ApiResponse = {
  code?: unknown;
  data?: unknown;
  message?: unknown;
};

function isLoginRequest(value: unknown): value is LoginRequest {
  if (!value || typeof value !== "object") {
    return false;
  }

  const request = value as Record<string, unknown>;

  return (
    typeof request.studentNumber === "string" &&
    request.studentNumber.trim().length > 0 &&
    typeof request.password === "string" &&
    request.password.length > 0
  );
}

function isLoginTokenData(value: unknown): value is LoginTokenData {
  if (!value || typeof value !== "object") {
    return false;
  }

  const data = value as Record<string, unknown>;

  return (
    typeof data.accessToken === "string" &&
    typeof data.accessTokenExpiresAt === "string" &&
    typeof data.isNew === "boolean" &&
    typeof data.memberId === "number" &&
    typeof data.refreshToken === "string" &&
    typeof data.refreshTokenExpiresAt === "string"
  );
}

function getJwtExpiresAt(token: string) {
  const payload = token.split(".")[1];

  if (!payload) {
    return undefined;
  }

  try {
    const base64Payload = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(payload.length / 4) * 4, "=");
    const decodedPayload: unknown = JSON.parse(atob(base64Payload));

    if (
      !decodedPayload ||
      typeof decodedPayload !== "object" ||
      typeof (decodedPayload as Record<string, unknown>).exp !== "number"
    ) {
      return undefined;
    }

    const expiresAt = new Date(
      (decodedPayload as Record<string, number>).exp * 1000,
    );

    return Number.isNaN(expiresAt.getTime()) ? undefined : expiresAt;
  } catch {
    return undefined;
  }
}

function getExpiresAt(token: string, fallbackExpiresAt: string) {
  const jwtExpiresAt = getJwtExpiresAt(token);

  if (jwtExpiresAt) {
    return jwtExpiresAt;
  }

  const expiresAt = new Date(fallbackExpiresAt);

  return Number.isNaN(expiresAt.getTime()) ? undefined : expiresAt;
}

function getErrorMessage(status: number, response: ApiResponse) {
  if (status === 401 || response.code === "INVALID_CREDENTIALS") {
    return INVALID_CREDENTIALS_MESSAGE;
  }

  if (status === 400 || response.code === "INVALID_INPUT") {
    return INVALID_INPUT_MESSAGE;
  }

  return SERVER_ERROR_MESSAGE;
}

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);

  if (!isLoginRequest(body)) {
    return NextResponse.json(
      { message: INVALID_INPUT_MESSAGE },
      { status: 400 },
    );
  }

  const apiBaseUrl = process.env.API_BASE_URL;

  if (!apiBaseUrl) {
    return NextResponse.json(
      { message: SERVER_ERROR_MESSAGE },
      { status: 500 },
    );
  }

  try {
    const upstreamResponse = await fetch(
      `${apiBaseUrl.replace(/\/$/, "")}/api/member/login`,
      {
        body: JSON.stringify({
          password: body.password,
          studentNumber: body.studentNumber.trim(),
        }),
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      },
    );
    const response: ApiResponse = await upstreamResponse
      .json()
      .catch(() => ({}));

    if (!upstreamResponse.ok) {
      const status =
        upstreamResponse.status === 400 || upstreamResponse.status === 401
          ? upstreamResponse.status
          : 502;

      return NextResponse.json(
        { message: getErrorMessage(upstreamResponse.status, response) },
        { status },
      );
    }

    if (!isLoginTokenData(response.data)) {
      return NextResponse.json(
        { message: SERVER_ERROR_MESSAGE },
        { status: 502 },
      );
    }

    const accessTokenExpiresAt = getExpiresAt(
      response.data.accessToken,
      response.data.accessTokenExpiresAt,
    );
    const refreshTokenExpiresAt = getExpiresAt(
      response.data.refreshToken,
      response.data.refreshTokenExpiresAt,
    );

    if (
      !accessTokenExpiresAt ||
      !refreshTokenExpiresAt ||
      accessTokenExpiresAt.getTime() <= Date.now() ||
      refreshTokenExpiresAt.getTime() <= Date.now()
    ) {
      return NextResponse.json(
        { message: SERVER_ERROR_MESSAGE },
        { status: 502 },
      );
    }

    const nextResponse = NextResponse.json({
      isNew: response.data.isNew,
      memberId: response.data.memberId,
      ok: true,
    });
    const cookieOptions = {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
    };

    nextResponse.cookies.set(ACCESS_TOKEN_COOKIE, response.data.accessToken, {
      ...cookieOptions,
      expires: accessTokenExpiresAt,
      path: "/",
    });
    nextResponse.cookies.set(REFRESH_TOKEN_COOKIE, response.data.refreshToken, {
      ...cookieOptions,
      expires: refreshTokenExpiresAt,
      path: "/api/auth",
    });

    return nextResponse;
  } catch {
    return NextResponse.json(
      { message: SERVER_ERROR_MESSAGE },
      { status: 502 },
    );
  }
}
