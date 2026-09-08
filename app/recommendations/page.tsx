import { AiRecommendationsPage } from "@/_pages/recommendations";
import { getPopularLabs } from "@/entities/lab";
import { getAuthSession } from "@/shared/lib/auth/session";

export default async function Page() {
  const [labs, { isAuthenticated }] = await Promise.all([
    getPopularLabs(),
    getAuthSession(),
  ]);

  return <AiRecommendationsPage isAuthenticated={isAuthenticated} labs={labs} />;
}
