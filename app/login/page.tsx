import { LoginPage } from "@/_pages/login";
import { getLoginReturnPath, getLoginNotice } from "@/shared/lib/auth/return-path";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    notice?: string | string[];
    returnTo?: string | string[];
  }>;
}) {
  const { notice, returnTo } = await searchParams;
  return (
    <LoginPage
      notice={getLoginNotice(notice)}
      returnTo={getLoginReturnPath(returnTo)}
    />
  );
}
