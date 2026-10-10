import "server-only";
import { authenticatedRequest } from "@/shared/api/authenticated-request";
import { toBookmarks } from "../model/bookmark";
export async function getMyBookmarks() {
  return toBookmarks(await authenticatedRequest("/api/bookmark/me"));
}
