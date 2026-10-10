export const EMAIL_PURPOSES = [
  "학부연구생 지원",
  "대학원 진학 상담",
  "교수님께 질문",
] as const;
export type EmailPurpose = (typeof EMAIL_PURPOSES)[number];
export type EmailInput = {
  purpose: EmailPurpose;
  name: string;
  department: string;
  year: string;
  email: string;
  phone: string;
  interest: string;
  experience: string;
};
export type EmailRecipient = {
  professorName: string;
  labName: string;
  email: string | null;
};
export type EmailDraft = { recipient: string; subject: string; body: string };
export const EMPTY_EMAIL_INPUT: EmailInput = {
  purpose: "학부연구생 지원",
  name: "",
  department: "",
  year: "",
  email: "",
  phone: "",
  interest: "",
  experience: "",
};

export function validateEmailInput(input: EmailInput) {
  const errors: Partial<Record<keyof EmailInput, string>> = {};
  for (const key of [
    "name",
    "department",
    "year",
    "email",
    "interest",
    "experience",
  ] as const) {
    if (!input[key].trim()) errors[key] = "입력해 주세요.";
  }
  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email))
    errors.email = "올바른 이메일 주소를 입력해 주세요.";
  return errors;
}

// 사용자가 입력한 사실만 포함하는 로컬 예시 초안. AI 생성 결과가 아니다.
export function createMockEmailDraft(
  input: EmailInput,
  recipient: EmailRecipient,
): EmailDraft {
  const name = input.name.trim();
  const department = input.department.trim();
  const request =
    input.purpose === "학부연구생 지원"
      ? "학부연구생으로 참여할 기회가 있는지 문의드립니다."
      : input.purpose === "대학원 진학 상담"
        ? "대학원 진학과 관련하여 상담을 받을 수 있을지 문의드립니다."
        : "연구에 관하여 아래 내용을 여쭙고 싶습니다.";
  return {
    recipient: recipient.email ?? "",
    subject: `[${input.purpose} 문의] ${department} ${input.year} ${name}`,
    body: `${recipient.professorName} 교수님께,\n\n안녕하세요. ${department} ${input.year} ${name}입니다.\n${recipient.labName}의 연구에 관심이 있어 연락드립니다.\n\n관심 있는 연구는 다음과 같습니다.\n${input.interest.trim()}\n\n${input.purpose === "교수님께 질문" ? "궁금한 점은 다음과 같습니다." : "관련하여 해본 일은 다음과 같습니다."}\n${input.experience.trim()}\n\n${request}\n읽어주셔서 감사합니다.\n\n${name} 드림\n이메일: ${input.email.trim()}${input.phone.trim() ? `\n연락처: ${input.phone.trim()}` : ""}`,
  };
}

export function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  const middleEnd = digits.length === 10 ? 6 : 7;
  return `${digits.slice(0, 3)}-${digits.slice(3, middleEnd)}-${digits.slice(middleEnd)}`;
}
