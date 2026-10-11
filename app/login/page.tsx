import { LoginPage } from "@/_pages/login";
import { getLabReturnPath } from "@/shared/lib/auth/return-path";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string | string[] }>;
}) {
  const { returnTo } = await searchParams;
  return <LoginPage returnTo={getLabReturnPath(returnTo)} />;
}
