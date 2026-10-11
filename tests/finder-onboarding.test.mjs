import assert from "node:assert/strict";
import test from "node:test";
import {
  getOnboardingQuestions,
  ONBOARDING_PURPOSE,
} from "../src/features/onboarding/model/onboarding-steps.ts";
import {
  completeOnboarding,
  toOnboardingRequest,
} from "../src/features/onboarding/api/complete-onboarding.ts";
import { saveOnboardingDepartment } from "../src/features/onboarding/api/save-onboarding-department.ts";

test("탐색자는 학과와 관심 연구를 받고 연구생 질문은 유지한다", () => {
  assert.deepEqual(
    getOnboardingQuestions(ONBOARDING_PURPOSE.explore).map(({ id }) => id),
    ["purpose", "department", "interest"],
  );
  assert.deepEqual(
    getOnboardingQuestions(ONBOARDING_PURPOSE.member).map(({ id }) => id),
    [
      "purpose",
      "lab",
      "departmentConfirmation",
      "coreTime",
      "meetingFrequency",
      "activities",
      "coffeeChat",
      "contact",
    ],
  );
});

test("탐색자 학과 코드는 BFF에만 전달하고 관심 연구는 서버에 저장하지 않는다", async (context) => {
  const answers = {
    purpose: ONBOARDING_PURPOSE.explore,
    department: "컴퓨터공학부",
    departmentCode: "COMPUTER_ENGINEERING",
    interest: "추천시스템",
  };
  assert.deepEqual(toOnboardingRequest(answers), {
    purpose: "FINDER",
    coffeeChatAllowed: false,
  });
  const fetch = context.mock.method(
    globalThis,
    "fetch",
    async () => new Response("{}"),
  );
  assert.deepEqual(await completeOnboarding(answers), { ok: true });
  assert.deepEqual(JSON.parse(fetch.mock.calls[0].arguments[1].body), {
    purpose: "FINDER",
    coffeeChatAllowed: false,
    departmentCode: "COMPUTER_ENGINEERING",
  });
});

test("학과 저장은 본인 프로필의 학과만 수정하고 응답 실패를 보존한다", async () => {
  let request;
  const result = await saveOnboardingDepartment({
    baseUrl: "https://api.example/",
    accessToken: "test-token",
    department: "COMPUTER_ENGINEERING",
    fetcher: async (url, options) => {
      request = { url, ...options };
      return new Response("{}", { status: 400 });
    },
  });
  assert.equal(request.url, "https://api.example/api/member");
  assert.equal(request.method, "PATCH");
  assert.deepEqual(JSON.parse(request.body), {
    department: "COMPUTER_ENGINEERING",
  });
  assert.equal(result.ok, false);
});

test("다른 학과 선택 단계와 커피챗 연락처 단계는 확인 답변에 따라 구성한다", () => {
  const ids = (answers) =>
    getOnboardingQuestions(ONBOARDING_PURPOSE.member, undefined, answers).map(
      ({ id }) => id,
    );
  assert.equal(
    ids({ departmentConfirmation: "네, 맞아요" }).includes("department"),
    false,
  );
  assert.equal(
    ids({ departmentConfirmation: "아니요, 다른 학과에요" }).includes(
      "department",
    ),
    true,
  );
  assert.equal(
    ids({ coffeeChat: "아니요, 괜찮아요" }).includes("contact"),
    false,
  );
  assert.equal(ids({ coffeeChat: "네, 좋아요" }).includes("contact"), true);
});

test("비허용 연구생은 이전 연락처를 보내지 않고 선택 학과는 BFF로 전달한다", async (context) => {
  const answers = {
    purpose: ONBOARDING_PURPOSE.member,
    laboratoryId: 157,
    departmentCode: "COMPUTER_ENGINEERING",
    coreTime: "있음",
    meetingFrequency: "주 1회",
    activities: ["논문 리딩"],
    coffeeChat: "아니요, 괜찮아요",
    contact: "https://open.kakao.com/o/old",
  };
  const fetch = context.mock.method(
    globalThis,
    "fetch",
    async () => new Response("{}"),
  );
  assert.equal((await completeOnboarding(answers)).ok, true);
  const body = JSON.parse(fetch.mock.calls[0].arguments[1].body);
  assert.equal(body.departmentCode, "COMPUTER_ENGINEERING");
  assert.equal(body.coffeeChatAllowed, false);
  assert.equal("contactValue" in body, false);
  assert.equal("contactType" in body, false);
});
