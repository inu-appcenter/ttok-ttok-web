import { getAuthSession } from "@/shared/lib/auth/session";

import {
  SiteHeader,
  type SiteHeaderProps,
} from "./site-header";

export async function AuthenticatedSiteHeader(
  props: Omit<SiteHeaderProps, "isAuthenticated">,
) {
  const { isAuthenticated } = await getAuthSession();

  return (
    <SiteHeader
      {...props}
      isAuthenticated={isAuthenticated}
    />
  );
}
