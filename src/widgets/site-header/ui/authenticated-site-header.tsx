import { cookies } from "next/headers";

import { ACCESS_TOKEN_COOKIE } from "@/shared/lib/auth/cookies";

import {
  SiteHeader,
  type SiteHeaderProps,
} from "./site-header";

export async function AuthenticatedSiteHeader(
  props: Omit<SiteHeaderProps, "isAuthenticated">,
) {
  const cookieStore = await cookies();

  return (
    <SiteHeader
      {...props}
      isAuthenticated={cookieStore.has(ACCESS_TOKEN_COOKIE)}
    />
  );
}
