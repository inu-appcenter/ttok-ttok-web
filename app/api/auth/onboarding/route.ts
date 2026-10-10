import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ACCESS_TOKEN_COOKIE } from "@/shared/lib/auth/cookies";
import { saveFinderDepartment } from "@/features/onboarding/api/save-finder-department";

const API_ERROR_MESSAGE = "온보딩 저장 중 문제가 발생했습니다.";

export async function POST(request: Request) {
  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return NextResponse.json(
      { code: "TOKEN_INVALID", message: "로그인이 필요합니다." },
      { status: 401 },
    );
  }

  const body: unknown = await request.json().catch(() => null);
  if (
    !body || typeof body !== "object" || Array.isArray(body) ||
    !("purpose" in body) || typeof body.purpose !== "string" ||
    !["FINDER", "RESEARCHER", "PROFESSOR"].includes(body.purpose)
  ) {
    return NextResponse.json(
      { code: "INVALID_INPUT", message: "온보딩 정보를 확인해주세요." },
      { status: 400 },
    );
  }

  const apiBaseUrl = process.env.API_BASE_URL;
  if (!apiBaseUrl) {
    return NextResponse.json({ message: API_ERROR_MESSAGE }, { status: 500 });
  }

  try {
    const { departmentCode, ...onboardingBody } = body as Record<string, unknown>;
    if (body.purpose === "FINDER" && departmentCode !== undefined) {
      if (typeof departmentCode !== "string" || !/^[A-Z][A-Z_]+$/.test(departmentCode)) {
        return NextResponse.json({ code: "INVALID_INPUT", message: "학과를 다시 선택해주세요." }, { status: 400 });
      }
      const departmentResponse = await saveFinderDepartment({ baseUrl: apiBaseUrl, accessToken, department: departmentCode });
      if (!departmentResponse.ok) {
        return NextResponse.json({ message: "학과를 저장하지 못했습니다. 다시 시도해주세요." }, { status: [400, 401, 403, 404].includes(departmentResponse.status) ? departmentResponse.status : 502 });
      }
    }
    const upstreamResponse = await fetch(
      `${apiBaseUrl.replace(/\/$/, "")}/api/onboarding`,
      {
        body: JSON.stringify(onboardingBody),
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        method: "POST",
      },
    );
    const response: unknown = await upstreamResponse.json().catch(() => ({}));

    if (upstreamResponse.ok) {
      return NextResponse.json(response);
    }

    // 완료 응답이 유실된 뒤 재시도한 FINDER는 이미 저장된 상태로 이동합니다.
    if (body.purpose === "FINDER" && response && typeof response === "object" && "code" in response && response.code === "ONBOARDING_ALREADY_DONE") {
      return NextResponse.json(response);
    }

    const status = [400, 401, 403, 404].includes(upstreamResponse.status)
      ? upstreamResponse.status
      : 502;

    return NextResponse.json(response, { status });
  } catch {
    return NextResponse.json({ message: API_ERROR_MESSAGE }, { status: 502 });
  }
}
