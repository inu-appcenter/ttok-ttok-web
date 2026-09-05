import { NextResponse } from "next/server";

const ACCESS_TOKEN_COOKIE = "ttok_access_token";
const REFRESH_TOKEN_COOKIE = "ttok_refresh_token";
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
    typeof data.refreshToken === "string" &&
    typeof data.refreshTokenExpiresAt === "string"
  );
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

    const accessTokenExpiresAt = new Date(response.data.accessTokenExpiresAt);
    const refreshTokenExpiresAt = new Date(response.data.refreshTokenExpiresAt);

    if (
      Number.isNaN(accessTokenExpiresAt.getTime()) ||
      Number.isNaN(refreshTokenExpiresAt.getTime())
    ) {
      return NextResponse.json(
        { message: SERVER_ERROR_MESSAGE },
        { status: 502 },
      );
    }

    const nextResponse = NextResponse.json({ ok: true });
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
