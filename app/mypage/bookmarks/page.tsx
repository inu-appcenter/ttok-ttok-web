import { redirect } from "next/navigation";
import { BookmarksPage } from "@/_pages/bookmarks";
import { getMyBookmarks } from "@/entities/bookmark/api";
import { AuthenticatedApiError } from "@/shared/api/authenticated-request";
import { getAuthSession } from "@/shared/lib/auth/session";

export default async function Page() {
  if (!(await getAuthSession()).isAuthenticated) redirect("/login");
  let bookmarks;
  try {
    bookmarks = await getMyBookmarks();
  } catch (error) {
    if (error instanceof AuthenticatedApiError && error.status === 401)
      redirect("/login");
  }
  return <BookmarksPage initialBookmarks={bookmarks} />;
}
