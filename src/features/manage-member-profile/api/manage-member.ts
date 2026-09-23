const LOGOUT_ERROR_MESSAGE =
  "로그아웃하지 못했습니다. 잠시 후 다시 시도해주세요.";
const WITHDRAWAL_ERROR_MESSAGE =
  "회원 탈퇴를 완료하지 못했습니다. 잠시 후 다시 시도해주세요.";

type ActionResponse = {
  message?: unknown;
  ok?: unknown;
  requiresLogin?: unknown;
};

export type MemberActionResult =
  | { ok: true }
  | { message: string; ok: false; requiresLogin?: boolean };

async function requestMemberAction(
  url: string,
  method: "DELETE" | "POST",
  fallbackMessage: string,
): Promise<MemberActionResult> {
  try {
    const response = await fetch(url, { method });
    const result: ActionResponse = await response.json().catch(() => ({}));

    if (response.ok && result.ok === true) {
      return { ok: true };
    }

    return {
      message:
        typeof result.message === "string" ? result.message : fallbackMessage,
      ok: false,
      requiresLogin: result.requiresLogin === true,
    };
  } catch {
    return { message: fallbackMessage, ok: false };
  }
}

export function logout() {
  return requestMemberAction("/api/auth/logout", "POST", LOGOUT_ERROR_MESSAGE);
}

export function withdrawMember() {
  return requestMemberAction(
    "/api/member",
    "DELETE",
    WITHDRAWAL_ERROR_MESSAGE,
  );
}
