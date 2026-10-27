import assert from "node:assert/strict";
import test from "node:test";
import {
  getLabReturnPath,
  getLoginNotice,
  getLoginPath,
} from "../src/shared/lib/auth/return-path.ts";

const UNSAFE_RETURN_PATHS = [
  "//example.com",
  "https://example.com",
  "/labs/157?redirect=https://example.com",
  "/labs/../admin",
  "/labs/0",
  "/labs/157\\evil",
  ["/labs/157"],
  undefined,
];

test("로그인 복귀는 연구실 상세 내부 경로만 허용한다", () => {
  assert.equal(getLabReturnPath("/labs/157"), "/labs/157");
  for (const value of UNSAFE_RETURN_PATHS) {
    assert.equal(getLabReturnPath(value), undefined);
  }
});

test("로그인 안내는 고정 값만 인정하고 외부 입력을 그대로 쓰지 않는다", () => {
  assert.equal(getLoginNotice("login-required"), "login-required");
  for (const value of [
    "LOGIN-REQUIRED",
    "login-required ",
    "<script>",
    "로그인이 필요한 기능이에요.",
    ["login-required"],
    undefined,
  ]) {
    assert.equal(getLoginNotice(value), undefined);
  }
});

test("로그인 이동 경로는 안내 값과 허용된 연구실 복귀 경로만 담는다", () => {
  assert.equal(getLoginPath(), "/login");
  assert.equal(
    getLoginPath({ notice: "login-required" }),
    "/login?notice=login-required",
  );
  const fromLab = new URL(
    getLoginPath({ notice: "login-required", returnTo: "/labs/157" }),
    "http://localhost",
  );
  assert.equal(fromLab.pathname, "/login");
  assert.equal(fromLab.searchParams.get("notice"), "login-required");
  assert.equal(fromLab.searchParams.get("returnTo"), "/labs/157");
  // 보호 경로나 변형된 경로는 복귀 대상으로 전달하지 않는다.
  for (const returnTo of [...UNSAFE_RETURN_PATHS, "/recommendations", "/mypage"]) {
    assert.equal(
      getLoginPath({ notice: "login-required", returnTo }),
      "/login?notice=login-required",
    );
  }
  assert.equal(getLoginPath({ notice: "unknown", returnTo: "/labs/157" }), "/login?returnTo=%2Flabs%2F157");
});
