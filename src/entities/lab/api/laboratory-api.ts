import "server-only";

import type {
  Laboratory,
  LaboratoryPage,
  LaboratoryPageParams,
} from "../model/laboratory";

type ApiLaboratory = {
  capacity?: unknown;
  college?: unknown;
  collegeName?: unknown;
  department?: unknown;
  departmentName?: unknown;
  id?: unknown;
  introduction?: unknown;
  labName?: unknown;
  labUrl?: unknown;
  location?: unknown;
  professor?: unknown;
  researchAreas?: unknown;
};

type ApiLaboratoryCapacity = {
  graduateStudentCount?: unknown;
  undergraduateStudentCount?: unknown;
};

type ApiLaboratoryProfessor = {
  email?: unknown;
  id?: unknown;
  name?: unknown;
  phoneNumber?: unknown;
  positionRaw?: unknown;
};

type LaboratoryRequestOptions = {
  cache?: RequestCache;
  revalidate?: number | false;
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

type ApiResponse<T> = {
  code: string | null;
  data: T;
  message: string;
};

type ApiErrorResponse = {
  code?: unknown;
  message?: unknown;
};

export type { LaboratoryRequestOptions };

export class LaboratoryApiError extends Error {
  readonly code: string | null;
  readonly status: number;

  constructor(message: string, status: number, code: string | null = null) {
    super(message);
    this.name = "LaboratoryApiError";
    this.code = code;
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

function getRequiredString(value: unknown, fieldName: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new LaboratoryApiError(`${fieldName} 응답이 올바르지 않습니다.`, 502);
  }

  return value;
}

function getNullableString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  return !normalizedValue || normalizedValue.toLowerCase() === "null"
    ? null
    : value;
}

function getNumber(value: unknown, fieldName: string) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new LaboratoryApiError(`${fieldName} 응답이 올바르지 않습니다.`, 502);
  }

  return value;
}

function getNonNegativeInteger(value: unknown, fieldName: string) {
  const number = getNumber(value, fieldName);

  if (!Number.isInteger(number) || number < 0) {
    throw new LaboratoryApiError(`${fieldName} 응답이 올바르지 않습니다.`, 502);
  }

  return number;
}

function getPositiveInteger(value: unknown, fieldName: string) {
  const number = getNumber(value, fieldName);

  if (!Number.isInteger(number) || number < 1) {
    throw new LaboratoryApiError(`${fieldName} 응답이 올바르지 않습니다.`, 502);
  }

  return number;
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

function getObject<T extends object>(value: unknown, fieldName: string): T {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new LaboratoryApiError(`${fieldName} 응답이 올바르지 않습니다.`, 502);
  }

  return value as T;
}

function toLaboratory(value: unknown): Laboratory {
  const laboratory = getObject<ApiLaboratory>(value, "연구실");
  const capacity = getObject<ApiLaboratoryCapacity>(laboratory.capacity, "연구실 수용 인원");
  const professor = getObject<ApiLaboratoryProfessor>(laboratory.professor, "연구실 교수");

  if (!Array.isArray(laboratory.researchAreas)) {
    throw new LaboratoryApiError("연구 분야 응답이 올바르지 않습니다.", 502);
  }

  if (!laboratory.researchAreas.every((researchArea) => typeof researchArea === "string")) {
    throw new LaboratoryApiError("연구 분야 응답이 올바르지 않습니다.", 502);
  }

  return {
    capacity: {
      graduateStudentCount: getNullableNumber(capacity.graduateStudentCount),
      undergraduateStudentCount: getNullableNumber(
        capacity.undergraduateStudentCount,
      ),
    },
    college: getRequiredString(laboratory.college, "단과대"),
    collegeName: getRequiredString(laboratory.collegeName, "단과대명"),
    department: getRequiredString(laboratory.department, "학과"),
    departmentName: getRequiredString(laboratory.departmentName, "학과명"),
    id: getPositiveInteger(laboratory.id, "연구실 ID"),
    introduction: getNullableString(laboratory.introduction),
    labName: getRequiredString(laboratory.labName, "연구실명"),
    labUrl: getNullableString(laboratory.labUrl),
    location: getNullableString(laboratory.location),
    professor: {
      email: getNullableString(professor.email),
      id: getPositiveInteger(professor.id, "교수 ID"),
      name: getRequiredString(professor.name, "교수명"),
      phoneNumber: getNullableString(professor.phoneNumber),
      position: getNullableString(professor.positionRaw),
    },
    researchAreas: laboratory.researchAreas,
  };
}

function toLaboratoryPage(value: unknown): LaboratoryPage {
  const page = getObject<ApiLaboratoryPage>(value, "연구실 목록");

  if (!Array.isArray(page.content)) {
    throw new LaboratoryApiError("연구실 목록이 올바르지 않습니다.", 502);
  }

  const hasNext = getBoolean(page.hasNext, "다음 페이지 여부");
  const isLast = getBoolean(page.last, "마지막 페이지 여부");
  const size = getPositiveInteger(page.size, "페이지 크기");
  const content = page.content.map(toLaboratory);

  if (content.length > size || hasNext === isLast) {
    throw new LaboratoryApiError("연구실 페이지 정보가 올바르지 않습니다.", 502);
  }

  return {
    content,
    hasNext,
    isLast,
    page: getNonNegativeInteger(page.page, "페이지 번호"),
    size,
    totalElements: getNonNegativeInteger(page.totalElements, "전체 연구실 수"),
    totalPages: getNonNegativeInteger(page.totalPages, "전체 페이지 수"),
  };
}

function validatePageParams(params: LaboratoryPageParams) {
  if (params.page !== undefined && (!Number.isInteger(params.page) || params.page < 0)) {
    throw new LaboratoryApiError("페이지 번호를 확인해주세요.", 400);
  }

  if (params.size !== undefined && (!Number.isInteger(params.size) || params.size < 1)) {
    throw new LaboratoryApiError("페이지 크기를 확인해주세요.", 400);
  }

  if (params.sort?.some((sort) => !sort.trim())) {
    throw new LaboratoryApiError("정렬 조건을 확인해주세요.", 400);
  }
}

function createSearchParams(params: LaboratoryPageParams) {
  validatePageParams(params);

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
  options: LaboratoryRequestOptions = {},
): Promise<LaboratoryPage> {
  const searchParams = createSearchParams(params);
  Object.entries(additionalSearchParams ?? {}).forEach(([key, value]) => {
    searchParams.set(key, value);
  });
  const requestUrl = new URL(`${getApiBaseUrl()}${path}`);
  requestUrl.search = searchParams.toString();

  let response: Response;

  try {
    response = await fetch(requestUrl, {
      cache: options.cache,
      next: { revalidate: options.revalidate ?? 300 },
    });
  } catch {
    throw new LaboratoryApiError("연구실 정보를 불러오지 못했습니다.", 502);
  }

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const errorResponse = getObject<ApiErrorResponse>(body, "연구실 API 오류");
    const message =
      typeof errorResponse.message === "string"
        ? errorResponse.message
        : "연구실 정보를 불러오지 못했습니다.";
    const code = typeof errorResponse.code === "string" ? errorResponse.code : null;

    throw new LaboratoryApiError(message, response.status, code);
  }

  const apiResponse = getObject<ApiResponse<unknown>>(body, "연구실 API");

  return toLaboratoryPage(apiResponse.data);
}
