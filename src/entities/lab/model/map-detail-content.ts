import type { LabDetailListState, LabPaper, LabResearchProject } from "./lab";

function getObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("상세 목록 응답이 올바르지 않습니다.");
  }
  return value as Record<string, unknown>;
}

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getRequiredString(value: unknown) {
  const text = getString(value);
  if (!text) throw new Error("상세 목록 항목이 올바르지 않습니다.");
  return text;
}

export function getExternalUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

export function parseDetailPage<T>(
  value: unknown,
  mapItem: (item: unknown) => T,
) {
  const result = getObject(value);
  if (
    !Array.isArray(result.content) ||
    typeof result.page !== "number" ||
    !Number.isInteger(result.page) ||
    result.page < 0 ||
    typeof result.totalPages !== "number" ||
    !Number.isInteger(result.totalPages) ||
    result.totalPages < 0
  ) {
    throw new Error("상세 목록 페이지 정보가 올바르지 않습니다.");
  }
  const state: LabDetailListState = {
    page: result.page,
    totalPages: result.totalPages,
    status: "success",
  };
  return { content: result.content.map(mapItem), state };
}

function formatDate(value: unknown) {
  const date = getString(value).replace(/[^0-9]/g, "");
  return date.length >= 6 ? `${date.slice(0, 4)}.${date.slice(4, 6)}` : "";
}

export function toResearchProject(value: unknown): LabResearchProject {
  const item = getObject(value);
  if (
    typeof item.id !== "number" ||
    !Number.isInteger(item.id) ||
    item.id < 1 ||
    typeof item.ongoing !== "boolean"
  ) {
    throw new Error("연구과제 항목이 올바르지 않습니다.");
  }
  return {
    id: String(item.id),
    title: getRequiredString(item.titleKorean),
    isOngoing: item.ongoing,
    period: [
      formatDate(item.totalPeriodStart || item.periodStart),
      formatDate(item.totalPeriodEnd || item.periodEnd),
    ]
      .filter(Boolean)
      .join(" – "),
    agency: getString(item.ministryName),
    summary: getString(item.contentSummary),
    url: getExternalUrl(item.ntisDetailUrl),
  };
}

export function toPublication(value: unknown): LabPaper {
  const item = getObject(value);
  const year = getString(item.year);
  const doi = getString(item.doi);
  return {
    title: getRequiredString(item.title),
    venue: getString(item.platform),
    year: /^\d{4}$/.test(year) ? Number(year) : null,
    url:
      getExternalUrl(item.sourceURL) ??
      (doi && /^10\.\d{4,9}\//.test(doi)
        ? getExternalUrl(`https://doi.org/${doi}`)
        : null),
  };
}
