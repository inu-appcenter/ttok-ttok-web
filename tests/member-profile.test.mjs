import assert from "node:assert/strict";
import test from "node:test";
import { toMemberProfile } from "../src/entities/member/model/map-member.ts";

const base = {
  id: 1,
  studentNumber: "202501716",
  department: "COMPUTER_ENGINEERING",
  userType: "FINDER",
  laboratory: null,
  coffeeChat: null,
  labReview: null,
  professor: null,
};
test("탐색자는 연구생 정보를 생성하지 않고 학과 코드를 표시 이름으로 매핑한다", () => {
  const profile = toMemberProfile(base, "컴퓨터공학부");
  assert.equal(profile.department, "컴퓨터공학부");
  assert.equal(profile.researchProfile, undefined);
  assert.equal(profile.isUndergraduateResearcher, false);
  assert.equal(profile.hasContributedReview, false);
  assert.equal(toMemberProfile(base).department, undefined);
});
test("연구생의 커피챗 예제 값과 저장 enum 차이를 정규화하고 등록일을 만들지 않는다", () => {
  const profile = toMemberProfile({
    ...base,
    userType: "RESEARCHER",
    laboratory: { id: 157, labName: "실제 연구실" },
    coffeeChat: {
      id: 12,
      contactType: "KAKAO_OPEN_CHAT",
      contactValue: "https://open.kakao.com/o/example",
    },
    labReview: {
      coreTime: "자율",
      weeklyMeeting: "주 1회",
      doings: ["논문 리딩"],
    },
  });
  assert.equal(profile.researchProfile.coffeeChat.contactType, "KAKAO_TALK");
  assert.equal(profile.researchProfile.registeredAtLabel, "");
  assert.equal(profile.researchProfile.professorName, "");
  assert.equal(profile.hasContributedReview, true);
  assert.deepEqual(profile.researchProfile.tags, [
    "코어타임 자율",
    "주 1회",
    "논문 리딩",
  ]);
});
test("교수 계정에서 연구생 기능과 탈퇴 정보 제공 문구를 적용하지 않는다", () => {
  const profile = toMemberProfile({
    ...base,
    userType: "PROFESSOR",
    professor: { name: "김교수", departmentName: "컴퓨터공학부" },
    laboratory: { id: 157, labName: "연구실" },
    labReview: { doings: ["이전 값"] },
  });
  assert.equal(profile.isUndergraduateResearcher, false);
  assert.equal(profile.researchProfile.professorName, "김교수");
  assert.equal(profile.researchProfile.coffeeChat, undefined);
  assert.equal(profile.hasContributedReview, false);
  assert.equal(
    toMemberProfile({ ...base, userType: "PROFESSOR" }).researchProfile,
    undefined,
  );
});
test("유효하지 않은 사용자 유형·연구실 ID·커피챗 응답을 거부한다", () => {
  for (const value of [
    null,
    { ...base, userType: "OTHER" },
    { ...base, id: 0 },
    { ...base, laboratory: { id: "157", labName: "랩" } },
    {
      ...base,
      userType: "RESEARCHER",
      coffeeChat: { id: 1, contactType: "SMS", contactValue: "123" },
    },
  ])
    assert.throws(() => toMemberProfile(value));
});
