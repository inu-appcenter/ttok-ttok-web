/** 로그인 복귀는 연구실 상세의 내부 경로만 허용합니다. */
export function getLabReturnPath(value: unknown): string | undefined {
  return typeof value === "string" && /^\/labs\/[1-9]\d*$/.test(value)
    ? value
    : undefined;
}
