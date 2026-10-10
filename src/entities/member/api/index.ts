import "server-only";
import { authenticatedRequest } from "@/shared/api/authenticated-request";
import { toMemberProfile } from "../model/map-member";

export async function getMyMember(
  departments: Array<{ department: string; departmentName: string }> = [],
) {
  const data = await authenticatedRequest("/api/member/me");
  const code =
    data && typeof data === "object" && "department" in data
      ? data.department
      : undefined;
  return toMemberProfile(
    data,
    departments.find((item) => item.department === code)?.departmentName,
  );
}
