import type { MemberProfile } from "./member-profile";

export const MOCK_MEMBER_PROFILE: MemberProfile = {
  accountLabel: "인천대 SSO 계정",
  email: "username@inu.ac.kr",
  researchProfile: {
    coffeeChatPublic: true,
    department: "컴퓨터공학부",
    laboratoryName: "지능형 데이터 시스템 연구실",
    professorName: "김다윤",
    registeredAtLabel: "7/18",
    tags: ["코어타임 있음", "주 1회 미팅", "논문 리딩", "실험/코딩"],
  },
  roleLabel: "학부연구생",
};
