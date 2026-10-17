import assert from "node:assert/strict";
import test from "node:test";
import {
  getSessionStatus,
  isInvalidSessionResponse,
  requiresCompleteSession,
} from "../src/shared/lib/auth/session-status.ts";
test("미완료 계정은 회원 유형이 없어도 isNew로 판단하고 요청을 캐시하지 않는다", async () => {
  let init;
  const status = await getSessionStatus(
    "test-token",
    "https://api.example/",
    async (_url, options) => {
      init = options;
      return Response.json({ data: { id: 1, isNew: true, userType: null } });
    },
  );
  assert.deepEqual(status, { state: "valid", isNew: true });
  assert.equal(init.cache, "no-store");
  assert.equal(init.headers.Authorization, "Bearer test-token");
});
test("삭제·만료만 무효 세션으로 판정하고 일반 404·5xx·비정상 응답은 장애로 유지한다", async () => {
  for (const [status, code, expected] of [
    [401, "TOKEN_INVALID", "invalid"],
    [404, "MEMBER_NOT_FOUND", "invalid"],
    [404, "LABORATORY_NOT_FOUND", "unavailable"],
    [500, "INTERNAL_ERROR", "unavailable"],
  ]) {
    assert.deepEqual(
      await getSessionStatus("token", "https://api.example", async () =>
        Response.json({ data: null, code }, { status }),
      ),
      { state: expected },
    );
  }
  for (const data of [
    null,
    { id: 1 },
    { id: 0, isNew: true },
    { id: 1, isNew: "true" },
  ])
    assert.deepEqual(
      await getSessionStatus("token", "https://api.example", async () =>
        Response.json({ data }),
      ),
      { state: "unavailable" },
    );
  assert.deepEqual(
    await getSessionStatus("token", "https://api.example", async () => {
      throw new Error("offline");
    }),
    { state: "unavailable" },
  );
  assert.equal(isInvalidSessionResponse(404, "LABORATORY_NOT_FOUND"), false);
});
test("마이페이지 하위 경로까지 보호하고 비슷한 공개 경로는 포함하지 않는다", () => {
  for (const path of [
    "/mypage",
    "/mypage/bookmarks",
    "/onboarding",
    "/recommendations",
  ])
    assert.equal(requiresCompleteSession(path), true);
  for (const path of ["/", "/login", "/mypage-other", "/labs/15"])
    assert.equal(requiresCompleteSession(path), false);
});
