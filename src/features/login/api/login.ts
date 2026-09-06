import type { LoginCredentials, LoginResult } from "../model/login";

const LOGIN_ERROR_MESSAGE =
  "로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";

type LoginErrorResponse = {
  message?: unknown;
};

type LoginSuccessResponse = {
  isNew?: unknown;
  memberId?: unknown;
  ok?: unknown;
};

export async function login(
  credentials: LoginCredentials,
): Promise<LoginResult> {
  try {
    const response = await fetch("/api/auth/login", {
      body: JSON.stringify(credentials),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (response.ok) {
      const result: LoginSuccessResponse = await response.json().catch(() => ({}));

      if (typeof result.isNew !== "boolean" || typeof result.memberId !== "number") {
        return { message: LOGIN_ERROR_MESSAGE, ok: false };
      }

      return { isNew: result.isNew, memberId: result.memberId, ok: true };
    }

    const error: LoginErrorResponse = await response.json().catch(() => ({}));

    return {
      message:
        typeof error.message === "string" ? error.message : LOGIN_ERROR_MESSAGE,
      ok: false,
    };
  } catch {
    return { message: LOGIN_ERROR_MESSAGE, ok: false };
  }
}
