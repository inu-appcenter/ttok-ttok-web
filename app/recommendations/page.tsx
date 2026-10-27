import { redirect } from "next/navigation";

import { AiRecommendationsPage } from "@/_pages/recommendations";
import { getAuthSession, getAuthSessionKey } from "@/shared/lib/auth/session";

export default async function Page() {
  const [{ isAuthenticated, memberId }, sessionKey] = await Promise.all([
    getAuthSession(),
    getAuthSessionKey(),
  ]);

  if (!isAuthenticated) {
    redirect("/login");
  }

  // 세션이 바뀌면 다시 마운트해 이전 세션의 화면 상태를 남기지 않는다.
  return (
    <AiRecommendationsPage
      key={`${memberId ?? ""}:${sessionKey ?? ""}`}
      memberId={memberId}
      sessionKey={sessionKey}
    />
  );
}
