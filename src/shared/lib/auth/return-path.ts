/** 로그인 복귀는 연구실 상세의 내부 경로만 허용합니다. */
export function getLabReturnPath(value: unknown): string | undefined {
  return typeof value === "string" && /^\/labs\/[1-9]\d*$/.test(value)
    ? value
    : undefined;
}

/** 검증된 서비스 화면만 로그인 및 온보딩의 복귀 대상으로 허용합니다. */
export function getLoginReturnPath(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  if (["/", "/search", "/recommendations", "/mypage", "/mypage/bookmarks"].includes(value)) return value;
  if (value.startsWith("/search?") && !value.includes("#")) {
    const params = new URLSearchParams(value.slice("/search?".length));
    if ([...params.keys()].every((key) => ["q", "category", "college", "department", "page"].includes(key))) {
      const query = params.toString();
      return query ? `/search?${query}` : "/search";
    }
  }
  if (/^\/labs\/[1-9]\d*(?:\/(?:papers|projects))?$/.test(value)) return value;
  return undefined;
}

export const LOGIN_NOTICE_PARAM = "notice";
export const LOGIN_REQUIRED_NOTICE = "login-required";
export type LoginNotice = typeof LOGIN_REQUIRED_NOTICE;

/** 로그인 화면 안내는 고정된 값만 인정합니다. 입력값을 문구로 표시하지 않습니다. */
export function getLoginNotice(value: unknown): LoginNotice | undefined {
  return value === LOGIN_REQUIRED_NOTICE ? LOGIN_REQUIRED_NOTICE : undefined;
}

/** 로그인 이동 경로에는 알려진 안내 값과 허용된 복귀 경로만 담습니다. */
export function getLoginPath({
  notice,
  returnTo,
}: { notice?: LoginNotice; returnTo?: unknown } = {}): string {
  const params = new URLSearchParams();
  if (getLoginNotice(notice)) params.set(LOGIN_NOTICE_PARAM, LOGIN_REQUIRED_NOTICE);
  const path = getLoginReturnPath(returnTo);
  if (path) params.set("returnTo", path);
  const query = params.toString();
  return query ? `/login?${query}` : "/login";
}
