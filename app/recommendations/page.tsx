import { redirect } from "next/navigation";

import { AiRecommendationsPage } from "@/_pages/recommendations";
import { getAuthSession } from "@/shared/lib/auth/session";

export default async function Page() {
  const { isAuthenticated } = await getAuthSession();

  if (!isAuthenticated) {
    redirect("/login");
  }

  return <AiRecommendationsPage />;
}
