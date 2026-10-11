const PURPOSE_CODES = {
  "학부연구생 지원": "UNDERGRADUATE_RESEARCH",
  "대학원 진학 상담": "GRADUATE_CONSULTING",
  "교수님께 질문": "QUESTION",
} as const;
const GRADE_CODES = {
  "1학년": "FIRST",
  "2학년": "SECOND",
  "3학년": "THIRD",
  "4학년": "FOURTH",
  "5학년 +": "FIFTHPLUS",
} as const;
export type EmailRequest = {
  laboratoryId: number;
  purpose: (typeof PURPOSE_CODES)[keyof typeof PURPOSE_CODES];
  name: string;
  department: string;
  grade: (typeof GRADE_CODES)[keyof typeof GRADE_CODES];
  email: string;
  phoneNumber?: string;
  interest: string;
  content?: string;
};
type FormInput = {
  purpose: keyof typeof PURPOSE_CODES;
  name: string;
  department: string;
  year: string;
  email: string;
  phone: string;
  interest: string;
  experience: string;
};
export function toEmailRequest(
  input: FormInput,
  laboratoryId: number,
): EmailRequest {
  const grade = Object.entries(GRADE_CODES).find(
    ([label]) => label === input.year,
  )?.[1];
  if (!grade) throw new Error("학년을 선택해 주세요.");
  return {
    laboratoryId,
    purpose: PURPOSE_CODES[input.purpose],
    name: input.name.trim(),
    department: input.department,
    grade,
    email: input.email.trim(),
    interest: input.interest.trim(),
    ...(input.phone.trim() ? { phoneNumber: input.phone.trim() } : {}),
    ...(input.experience.trim() ? { content: input.experience.trim() } : {}),
  };
}
function text(value: unknown, max: number, required = true): value is string {
  return (
    typeof value === "string" &&
    (!required || Boolean(value.trim())) &&
    value.length <= max
  );
}
export function isEmailRequest(value: unknown): value is EmailRequest {
  if (!isRecord(value)) return false;
  const data = value;
  return (
    Number.isSafeInteger(data.laboratoryId) &&
    Number(data.laboratoryId) > 0 &&
    Object.values(PURPOSE_CODES).some((code) => code === data.purpose) &&
    Object.values(GRADE_CODES).some((code) => code === data.grade) &&
    text(data.name, 20) &&
    text(data.department, 100) &&
    text(data.email, 254) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) &&
    text(data.interest, 300) &&
    (data.phoneNumber === undefined || text(data.phoneNumber, 13, false)) &&
    (data.content === undefined || text(data.content, 1200, false))
  );
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
export function parseEmailContent(value: unknown): {
  subject: string;
  body: string;
} {
  if (
    !value ||
    typeof value !== "object" ||
    !("subject" in value) ||
    !("body" in value) ||
    typeof value.subject !== "string" ||
    !value.subject.trim() ||
    typeof value.body !== "string" ||
    !value.body.trim()
  ) {
    throw new Error("메일 응답을 확인하지 못했어요. 다시 시도해 주세요.");
  }
  return { subject: value.subject, body: value.body };
}
