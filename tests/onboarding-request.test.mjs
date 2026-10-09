import assert from "node:assert/strict";
import test from "node:test";
import { completeOnboarding, toOnboardingRequest } from "../src/features/onboarding/api/complete-onboarding.ts";

const finder = { purpose: "연구실을 알아보고 있어요" };
const researcher = {
  purpose: "학부연구생 / 대학원생이에요", laboratoryId: 95,
  coreTime: "없어요", meetingFrequency: "주 1회", activities: ["논문 읽기"],
  coffeeChat: "네, 좋아요", contact: " https://open.kakao.com/example ",
};

test("탐색자는 FINDER로 보내며 연구생 전용 필드를 전달하지 않는다", () => {
  assert.deepEqual(toOnboardingRequest({ ...researcher, ...finder }), {
    purpose: "FINDER", coffeeChatAllowed: false,
  });
});

test("연구생의 역할·연구실·리뷰·커피챗 연락처를 유지한다", () => {
  assert.deepEqual(toOnboardingRequest(researcher), {
    purpose: "RESEARCHER", laboratoryId: 95, coreTime: "없어요",
    weeklyMeeting: "주 1회", doings: ["논문 읽기"], coffeeChatAllowed: true,
    contactType: "KAKAO_TALK", contactValue: "https://open.kakao.com/example",
  });
  const email = toOnboardingRequest({ ...researcher, contact: "member@example.test" });
  assert.equal(email.contactType, "EMAIL");
});

test("FINDER 저장 성공·서버 실패·네트워크 실패를 구분한다", async (context) => {
  const requests = [];
  context.mock.method(globalThis, "fetch", async (url, options) => {
    requests.push({ url, ...options });
    return new Response("{}", { status: 200 });
  });
  assert.deepEqual(await completeOnboarding(finder), { ok: true });
  assert.equal(requests[0].url, "/api/auth/onboarding");
  assert.equal(requests[0].method, "POST");
  assert.equal(JSON.parse(requests[0].body).purpose, "FINDER");
  globalThis.fetch.mock.mockImplementation(async () => new Response(
    JSON.stringify({ code: "TOKEN_INVALID" }), { status: 401 },
  ));
  assert.deepEqual(await completeOnboarding(finder), {
    ok: false, message: "로그인이 만료되었습니다. 다시 로그인해주세요.",
  });
  globalThis.fetch.mock.mockImplementation(async () => { throw new Error("offline"); });
  assert.equal((await completeOnboarding(finder)).ok, false);
});

test("연구생 필수 입력 누락은 저장 요청 전에 차단한다", async (context) => {
  const fetch = context.mock.method(globalThis, "fetch", async () => new Response("{}"));
  assert.equal((await completeOnboarding({ purpose: researcher.purpose })).ok, false);
  assert.equal(fetch.mock.callCount(), 0);
});
