import assert from "node:assert/strict";
import test from "node:test";
import {
  toEmailRequest,
  isEmailRequest,
  parseEmailContent,
} from "../src/features/write-contact-email/model/email-contract.ts";
const input = {
  purpose: "학부연구생 지원",
  name: " 홍길동 ",
  department: "COMPUTER_ENGINEERING",
  year: "3학년",
  email: "student@example.com",
  phone: "",
  interest: " 촉매 연구 ",
  experience: "",
};
test("목적과 학년을 서버 enum으로 변환하고 선택 항목은 생략한다", () => {
  const request = toEmailRequest(input, 157);
  assert.deepEqual(request, {
    purpose: "UNDERGRADUATE_RESEARCH",
    laboratoryId: 157,
    name: "홍길동",
    department: "COMPUTER_ENGINEERING",
    grade: "THIRD",
    email: "student@example.com",
    interest: "촉매 연구",
  });
  assert.equal(isEmailRequest(request), true);
  assert.equal(
    toEmailRequest({ ...input, purpose: "교수님께 질문", year: "5학년 +" }, 157)
      .grade,
    "FIFTHPLUS",
  );
  assert.equal(
    toEmailRequest({ ...input, purpose: "대학원 진학 상담" }, 157).purpose,
    "GRADUATE_CONSULTING",
  );
});
test("메일 입력의 서버 길이 제한과 필수 값 경계를 검증한다", () => {
  const request = toEmailRequest(input, 157);
  assert.equal(
    isEmailRequest({
      ...request,
      name: "가".repeat(20),
      interest: "가".repeat(300),
      content: "가".repeat(1200),
      phoneNumber: "010-1234-5678",
    }),
    true,
  );
  for (const patch of [
    { name: "" },
    { name: "가".repeat(21) },
    { interest: " " },
    { interest: "가".repeat(301) },
    { content: "가".repeat(1201) },
    { email: "invalid" },
    { phoneNumber: "1".repeat(14) },
    { grade: "3학년" },
    { purpose: "unknown" },
    { laboratoryId: 1.5 },
  ])
    assert.equal(isEmailRequest({ ...request, ...patch }), false);
});
test("제목과 본문만 수용하고 서버 본문의 줄바꿈을 보존한다", () => {
  assert.deepEqual(
    parseEmailContent({ subject: "제목", body: "첫 줄\n\n마지막 줄" }),
    { subject: "제목", body: "첫 줄\n\n마지막 줄" },
  );
  for (const value of [
    null,
    { answer: "제목: 예시" },
    { subject: " ", body: "본문" },
    { subject: "제목", body: "" },
  ])
    assert.throws(() => parseEmailContent(value));
});
