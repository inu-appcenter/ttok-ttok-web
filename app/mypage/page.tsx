import { redirect } from "next/navigation";

import { MOCK_MEMBER_PROFILE } from "@/entities/member";
import { getAuthSession } from "@/shared/lib/auth/session";

import { MyPage } from "@/_pages/mypage";

export default async function MyPageRoute() {
  const { isAuthenticated } = await getAuthSession();

  if (!isAuthenticated) {
    redirect("/login");
  }

  return <MyPage profile={MOCK_MEMBER_PROFILE} />;
}
