import type { MemberProfile } from "./member-profile";

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("회원 정보 응답이 올바르지 않습니다.");
  return value as Record<string, unknown>;
}
const text = (value: unknown) => typeof value === "string" ? value : "";

export function toMemberProfile(value: unknown, departmentName?: string): MemberProfile {
  const member = record(value);
  const userType = member.userType;
  if (!["FINDER", "RESEARCHER", "PROFESSOR"].includes(String(userType)) || typeof member.id !== "number" || !Number.isSafeInteger(member.id) || member.id < 1) throw new Error("회원 유형 또는 ID가 올바르지 않습니다.");
  const isResearcher = userType === "RESEARCHER";
  const lab = member.laboratory == null ? null : record(member.laboratory);
  const review = isResearcher && member.labReview != null ? record(member.labReview) : null;
  const coffee = isResearcher && member.coffeeChat != null ? record(member.coffeeChat) : null;
  const professor = userType === "PROFESSOR" && member.professor != null ? record(member.professor) : null;
  const contactType = coffee?.contactType === "KAKAO_OPEN_CHAT" ? "KAKAO_TALK" : coffee?.contactType;
  if (coffee && (typeof coffee.id !== "number" || !Number.isSafeInteger(coffee.id) || coffee.id < 1 || !["EMAIL", "KAKAO_TALK"].includes(String(contactType)) || !text(coffee.contactValue))) throw new Error("커피챗 응답이 올바르지 않습니다.");
  if (lab && (typeof lab.id !== "number" || !Number.isSafeInteger(lab.id) || lab.id < 1 || !text(lab.labName))) throw new Error("회원 연구실 응답이 올바르지 않습니다.");
  return {
    accountLabel: "인천대 SSO 계정", userType: userType as MemberProfile["userType"],
    studentNumber: text(member.studentNumber), displayName: text(member.nickName), email: text(member.email),
    department: departmentName || text(professor?.departmentName) || undefined,
    roleLabel: isResearcher ? "학부연구생" : userType === "PROFESSOR" ? "교수" : "탐색자",
    isUndergraduateResearcher: isResearcher, hasContributedReview: Boolean(review),
    ...(lab ? { researchProfile: {
      laboratoryId: lab.id as number, laboratoryName: text(lab.labName), professorName: text(professor?.name),
      department: departmentName || text(professor?.departmentName), registeredAtLabel: "",
      coffeeChatPublic: Boolean(coffee),
      tags: review ? [text(review.coreTime) ? `코어타임 ${text(review.coreTime)}` : "", text(review.weeklyMeeting), ...(Array.isArray(review.doings) ? review.doings.filter((v): v is string => typeof v === "string") : [])].filter(Boolean) : [],
      ...(coffee ? { coffeeChat: { id: coffee.id as number, contactType: contactType as "EMAIL" | "KAKAO_TALK", contactValue: text(coffee.contactValue) } } : {}),
    } } : {}),
  };
}
