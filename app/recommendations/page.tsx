import { redirect } from "next/navigation";

import { AiRecommendationsPage } from "@/_pages/recommendations";
import { getPopularLabs } from "@/entities/lab";
import { getAuthSession } from "@/shared/lib/auth/session";

export default async function Page() {
  const { isAuthenticated } = await getAuthSession();

  if (!isAuthenticated) {
    redirect("/login");
  }

  const labs = await getPopularLabs();

  return <AiRecommendationsPage isAuthenticated={isAuthenticated} labs={labs} />;
}
