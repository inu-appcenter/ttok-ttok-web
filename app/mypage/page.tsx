import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getMemberProfile } from "@/entities/member";
import { ACCESS_TOKEN_COOKIE } from "@/shared/lib/auth/cookies";
import { getAuthSession } from "@/shared/lib/auth/session";

import { MyPage } from "@/_pages/mypage";

export default async function MyPageRoute() {
  const { isAuthenticated, memberId } = await getAuthSession();

  if (!isAuthenticated || !memberId) {
    redirect("/login");
  }

  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    redirect("/login");
  }

  const profile = await getMemberProfile(memberId, accessToken);

  return <MyPage profile={profile} />;
}
