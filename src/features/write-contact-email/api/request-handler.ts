import "server-only";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/shared/lib/auth/cookies";
import { getCollegeOptions } from "@/entities/lab/api";
import { getMyMember } from "@/entities/member/api";
import {
  authenticatedRequest,
  authenticatedErrorResponse,
  AuthenticatedApiError,
} from "@/shared/api/authenticated-request";
import { isEmailRequest, parseEmailContent } from "../model/email-contract";

export async function getEmailDepartments() {
  try {
    const colleges = await getCollegeOptions();
    return NextResponse.json({
      data: colleges.flatMap((college) => college.departments),
    });
  } catch {
    return NextResponse.json(
      { message: "학과 목록을 불러오지 못했어요. 다시 시도해 주세요." },
      { status: 502 },
    );
  }
}
export async function handleEmailRequest(request: Request) {
  if (!(await cookies()).get(ACCESS_TOKEN_COOKIE)?.value) {
    return authenticatedErrorResponse(
      new AuthenticatedApiError("로그인이 필요합니다.", 401),
    );
  }
  const input: unknown = await request.json().catch(() => null);
  if (!isEmailRequest(input))
    return NextResponse.json(
      { message: "메일 입력 항목을 확인해 주세요." },
      { status: 400 },
    );
  try {
    const [colleges, member] = await Promise.all([getCollegeOptions(), getMyMember()]);
    if (!member.departmentCode || input.department !== member.departmentCode) {
      return NextResponse.json(
        { message: "회원 학과 정보를 다시 불러온 후 시도해 주세요." },
        { status: 400 },
      );
    }
    if (
      !colleges.some((college) =>
        college.departments.some(
          (option) => option.department === member.departmentCode,
        ),
      )
    ) {
      return NextResponse.json(
        { message: "회원 학과와 일치하는 정보를 찾지 못했어요." },
        { status: 400 },
      );
    }
    const response = await authenticatedRequest("/api/chat/email-editor", {
      method: "POST",
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(60000)]),
      body: JSON.stringify({
        purpose: input.purpose,
        laboratoryId: input.laboratoryId,
        name: input.name.trim(),
        department: member.departmentCode,
        grade: input.grade,
        email: input.email.trim(),
        interest: input.interest.trim(),
        ...(input.phoneNumber ? { phoneNumber: input.phoneNumber.trim() } : {}),
        ...(input.content ? { content: input.content.trim() } : {}),
      }),
    });
    let data;
    try {
      data = parseEmailContent(response);
    } catch {
      throw new AuthenticatedApiError(
        "메일 응답을 확인하지 못했어요. 다시 시도해 주세요.",
        502,
      );
    }
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return authenticatedErrorResponse(error);
  }
}
