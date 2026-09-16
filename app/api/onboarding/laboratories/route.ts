import { NextResponse } from "next/server";

import { searchLaboratories } from "@/entities/lab/api";
import { LaboratoryApiError } from "@/entities/lab/api";
import { toLabSummaryPage } from "@/entities/lab";

const DEFAULT_ERROR_MESSAGE = "연구실을 불러오지 못했습니다.";

export async function GET(request: Request) {
  const keyword = new URL(request.url).searchParams.get("q")?.trim() ?? "";

  if (!keyword) {
    return NextResponse.json(
      { message: "연구실 이름 또는 교수명을 입력해주세요." },
      { status: 400 },
    );
  }

  try {
    const page = await searchLaboratories({ keyword, page: 0, size: 20 });

    return NextResponse.json(toLabSummaryPage(page));
  } catch (error) {
    if (error instanceof LaboratoryApiError) {
      return NextResponse.json(
        { code: error.code, message: error.message },
        { status: error.status >= 400 && error.status < 500 ? error.status : 502 },
      );
    }

    return NextResponse.json({ message: DEFAULT_ERROR_MESSAGE }, { status: 502 });
  }
}
