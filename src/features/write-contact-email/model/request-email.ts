import type { DepartmentOption } from "@/entities/lab";
import { parseEmailContent, type EmailRequest } from "./email-contract";
export class EmailApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}
export async function requestEmailDraft(
  input: EmailRequest,
  signal: AbortSignal,
) {
  const response = await fetch("/api/email-drafts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal,
  });
  const body = await response.json().catch(() => null);
  if (!response.ok)
    throw new EmailApiError(
      typeof body?.message === "string"
        ? body.message
        : "메일을 생성하지 못했어요. 다시 시도해 주세요.",
      response.status,
    );
  return parseEmailContent(body?.data);
}
export async function loadEmailDepartments(
  signal: AbortSignal,
): Promise<DepartmentOption[]> {
  const response = await fetch("/api/email-drafts/departments", { signal });
  const body = await response.json().catch(() => null);
  if (
    !response.ok ||
    !Array.isArray(body?.data) ||
    !body.data.every(
      (option: unknown) =>
        option &&
        typeof option === "object" &&
        "department" in option &&
        typeof option.department === "string" &&
        "departmentName" in option &&
        typeof option.departmentName === "string",
    )
  ) {
    throw new Error("학과 목록을 불러오지 못했어요. 다시 시도해 주세요.");
  }
  return body.data;
}
