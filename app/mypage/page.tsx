import { redirect } from "next/navigation";

import type { MemberProfile } from "@/entities/member";
import { getAuthSession } from "@/shared/lib/auth/session";

import { MyPage } from "@/_pages/mypage";

export default async function MyPageRoute() {
  const { isAuthenticated, memberId, role, studentNumber } =
    await getAuthSession();

  if (!isAuthenticated) {
    redirect("/login");
  }

  const profile: MemberProfile = {
    accountLabel: "인천대 SSO 계정",
    roleLabel: role?.includes("ADMIN") ? "관리자" : "회원",
    studentNumber,
  };

  if (!studentNumber && memberId) {
    profile.displayName = `회원 #${memberId}`;
  }

  return <MyPage profile={profile} />;
}
