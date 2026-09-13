import "server-only";

import type {
  Laboratory,
  LaboratoryPage,
  LaboratoryPageParams,
} from "../model/laboratory";

type ApiResponse<T> = {
  code: string | null;
  data: T;
  message: string;
};

type ApiLaboratory = {
  capacity?: {
    graduateStudentCount?: unknown;
    undergraduateStudentCount?: unknown;
  };
  college?: unknown;
  collegeName?: unknown;
  department?: unknown;
  departmentName?: unknown;
  id?: unknown;
  introduction?: unknown;
  labName?: unknown;
  labUrl?: unknown;
  location?: unknown;
  professor?: {
    email?: unknown;
    id?: unknown;
    name?: unknown;
    phoneNumber?: unknown;
    positionRaw?: unknown;
  };
  researchAreas?: unknown;
};

type ApiLaboratoryPage = {
  content?: unknown;
  hasNext?: unknown;
  last?: unknown;
  page?: unknown;
  size?: unknown;
  totalElements?: unknown;
  totalPages?: unknown;
};

export class LaboratoryApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "LaboratoryApiError";
    this.status = status;
  }
}

function getApiBaseUrl() {
  const apiBaseUrl = process.env.API_BASE_URL;

  if (!apiBaseUrl) {
    throw new LaboratoryApiError("API 서버 주소가 설정되지 않았습니다.", 500);
  }

  return apiBaseUrl.replace(/\/$/, "");
}

function getString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function getNullableString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function getNumber(value: unknown, fieldName: string) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new LaboratoryApiError(`${fieldName} 응답이 올바르지 않습니다.`, 502);
  }

  return value;
}

function getNullableNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getBoolean(value: unknown, fieldName: string) {
  if (typeof value !== "boolean") {
    throw new LaboratoryApiError(`${fieldName} 응답이 올바르지 않습니다.`, 502);
  }

  return value;
}

function toLaboratory(value: unknown): Laboratory {
  if (!value || typeof value !== "object") {
    throw new LaboratoryApiError("연구실 응답이 올바르지 않습니다.", 502);
  }

  const laboratory = value as ApiLaboratory;
  const professor = laboratory.professor;

  if (!professor || typeof professor !== "object") {
    throw new LaboratoryApiError("연구실 교수 응답이 올바르지 않습니다.", 502);
  }

  return {
    capacity: {
      graduateStudentCount: getNullableNumber(
        laboratory.capacity?.graduateStudentCount,
      ),
      undergraduateStudentCount: getNullableNumber(
        laboratory.capacity?.undergraduateStudentCount,
      ),
    },
    college: getString(laboratory.college),
    collegeName: getString(laboratory.collegeName),
    department: getString(laboratory.department),
    departmentName: getString(laboratory.departmentName),
    id: getNumber(laboratory.id, "연구실 ID"),
    introduction: getNullableString(laboratory.introduction),
    labName: getString(laboratory.labName),
    labUrl: getNullableString(laboratory.labUrl),
    location: getNullableString(laboratory.location),
    professor: {
      email: getNullableString(professor.email),
      id: getNumber(professor.id, "교수 ID"),
      name: getString(professor.name),
      phoneNumber: getNullableString(professor.phoneNumber),
      position: getNullableString(professor.positionRaw),
    },
    researchAreas: Array.isArray(laboratory.researchAreas)
      ? laboratory.researchAreas.filter(
          (researchArea): researchArea is string =>
            typeof researchArea === "string",
        )
      : [],
  };
}

function toLaboratoryPage(value: unknown): LaboratoryPage {
  if (!value || typeof value !== "object") {
    throw new LaboratoryApiError("연구실 목록 응답이 올바르지 않습니다.", 502);
  }

  const page = value as ApiLaboratoryPage;

  if (!Array.isArray(page.content)) {
    throw new LaboratoryApiError("연구실 목록이 올바르지 않습니다.", 502);
  }

  return {
    content: page.content.map(toLaboratory),
    hasNext: getBoolean(page.hasNext, "다음 페이지 여부"),
    isLast: getBoolean(page.last, "마지막 페이지 여부"),
    page: getNumber(page.page, "페이지 번호"),
    size: getNumber(page.size, "페이지 크기"),
    totalElements: getNumber(page.totalElements, "전체 연구실 수"),
    totalPages: getNumber(page.totalPages, "전체 페이지 수"),
  };
}

function createSearchParams(params: LaboratoryPageParams) {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  if (params.size !== undefined) {
    searchParams.set("size", String(params.size));
  }

  params.sort?.forEach((sort) => searchParams.append("sort", sort));

  return searchParams;
}

export async function getLaboratoryPage(
  path: string,
  params: LaboratoryPageParams = {},
  additionalSearchParams?: Record<string, string>,
): Promise<LaboratoryPage> {
  const searchParams = createSearchParams(params);
  Object.entries(additionalSearchParams ?? {}).forEach(([key, value]) => {
    searchParams.set(key, value);
  });
  const requestUrl = new URL(`${getApiBaseUrl()}${path}`);
  requestUrl.search = searchParams.toString();

  let response: Response;

  try {
    response = await fetch(requestUrl, { next: { revalidate: 300 } });
  } catch {
    throw new LaboratoryApiError("연구실 정보를 불러오지 못했습니다.", 502);
  }

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      body && typeof body === "object" && "message" in body
        ? getString(body.message, "연구실 정보를 불러오지 못했습니다.")
        : "연구실 정보를 불러오지 못했습니다.";

    throw new LaboratoryApiError(message, response.status);
  }

  if (!body || typeof body !== "object" || !("data" in body)) {
    throw new LaboratoryApiError("연구실 API 응답이 올바르지 않습니다.", 502);
  }

  return toLaboratoryPage((body as ApiResponse<unknown>).data);
}
