import assert from "node:assert/strict";
import test from "node:test";
import { getLabReturnPath } from "../src/shared/lib/auth/return-path.ts";

test("로그인 복귀는 연구실 상세 내부 경로만 허용한다", () => {
  assert.equal(getLabReturnPath("/labs/157"), "/labs/157");
  for (const value of [
    "//example.com",
    "https://example.com",
    "/labs/157?redirect=https://example.com",
    "/labs/../admin",
    "/labs/0",
    "/labs/157\\evil",
    ["/labs/157"],
    undefined,
  ]) {
    assert.equal(getLabReturnPath(value), undefined);
  }
});
