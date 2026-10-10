import assert from "node:assert/strict";
import test from "node:test";
import { getOnboardingQuestions, ONBOARDING_PURPOSE } from "../src/features/onboarding/model/onboarding-steps.ts";
import { completeOnboarding, toOnboardingRequest } from "../src/features/onboarding/api/complete-onboarding.ts";
import { saveFinderDepartment } from "../src/features/onboarding/api/save-finder-department.ts";

test("탐색자는 학과와 관심 연구를 받고 연구생 질문은 유지한다", () => {
  assert.deepEqual(getOnboardingQuestions(ONBOARDING_PURPOSE.explore).map(({ id }) => id), ["purpose", "department", "interest"]);
  assert.deepEqual(getOnboardingQuestions(ONBOARDING_PURPOSE.member).map(({ id }) => id), ["purpose", "lab", "coreTime", "meetingFrequency", "activities", "coffeeChat", "contact"]);
});

test("탐색자 학과 코드는 BFF에만 전달하고 관심 연구는 서버에 저장하지 않는다", async (context) => {
  const answers = { purpose: ONBOARDING_PURPOSE.explore, department: "컴퓨터공학부", departmentCode: "COMPUTER_ENGINEERING", interest: "추천시스템" };
  assert.deepEqual(toOnboardingRequest(answers), { purpose: "FINDER", coffeeChatAllowed: false });
  const fetch = context.mock.method(globalThis, "fetch", async () => new Response("{}"));
  assert.deepEqual(await completeOnboarding(answers), { ok: true });
  assert.deepEqual(JSON.parse(fetch.mock.calls[0].arguments[1].body), { purpose: "FINDER", coffeeChatAllowed: false, departmentCode: "COMPUTER_ENGINEERING" });
});

test("학과 저장은 본인 프로필의 학과만 수정하고 응답 실패를 보존한다", async () => {
  let request;
  const result = await saveFinderDepartment({ baseUrl: "https://api.example/", accessToken: "test-token", department: "COMPUTER_ENGINEERING", fetcher: async (url, options) => {
    request = { url, ...options }; return new Response("{}", { status: 400 });
  } });
  assert.equal(request.url, "https://api.example/api/member");
  assert.equal(request.method, "PATCH");
  assert.deepEqual(JSON.parse(request.body), { department: "COMPUTER_ENGINEERING" });
  assert.equal(result.ok, false);
});
