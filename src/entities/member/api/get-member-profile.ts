import type { MemberProfile } from "../model/member-profile";

const MEMBER_PROFILE_ERROR_MESSAGE = "회원 정보를 불러오지 못했습니다.";

export class MemberProfileApiError extends Error {
  status: number;

  constructor(status: number) {
    super(MEMBER_PROFILE_ERROR_MESSAGE);
    this.name = "MemberProfileApiError";
    this.status = status;
  }
}

type MemberResponse = {
  department?: unknown;
  email?: unknown;
  id?: unknown;
  nickName?: unknown;
  studentNumber?: unknown;
};

type ApiResponse = {
  data?: unknown;
};

function getRequiredString(value: unknown, fieldName: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${fieldName} 정보가 올바르지 않습니다.`);
  }

  return value.trim();
}

function formatDepartment(department: string) {
  const departmentLabels: Record<string, string> = {
    COMPUTER_ENGINEERING: "컴퓨터공학부",
    DATA_SCIENCE: "데이터과학과",
    EMBEDDED_SYSTEM: "임베디드시스템공학과",
    INFORMATION_COMMUNICATION_ENGINEERING: "정보통신공학과",
  };

  return departmentLabels[department] ?? department.replaceAll("_", " ");
}

function mapMemberProfile(value: unknown): MemberProfile {
  if (!value || typeof value !== "object") {
    throw new Error(MEMBER_PROFILE_ERROR_MESSAGE);
  }

  const member = value as MemberResponse;
  const department = getRequiredString(member.department, "학과");
  const studentNumber = getRequiredString(member.studentNumber, "학번");

  return {
    accountLabel: "인천대 SSO 계정",
    department: formatDepartment(department),
    displayName: getRequiredString(member.nickName, "이름"),
    email:
      typeof member.email === "string" && member.email.trim()
        ? member.email.trim()
        : "이메일 정보 없음",
    studentNumber,
  };
}

export async function getMemberProfile(
  memberId: number,
  accessToken: string,
): Promise<MemberProfile> {
  const apiBaseUrl = process.env.API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error(MEMBER_PROFILE_ERROR_MESSAGE);
  }

  const response = await fetch(
    `${apiBaseUrl.replace(/\/$/, "")}/api/member/${memberId}`,
    {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  const result: ApiResponse = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new MemberProfileApiError(response.status);
  }

  return mapMemberProfile(result.data);
}
