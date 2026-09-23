import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getMemberProfile, MemberProfileApiError } from "@/entities/member";
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

  let profile;

  try {
    profile = await getMemberProfile(memberId, accessToken);
  } catch (error) {
    if (
      error instanceof MemberProfileApiError &&
      (error.status === 401 || error.status === 404)
    ) {
      redirect("/login");
    }

    throw error;
  }

  return <MyPage profile={profile} />;
}
