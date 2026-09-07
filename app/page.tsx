import { HomePage } from "@/_pages/home";
import { getPopularLabs } from "@/entities/lab";
import { getAuthSession } from "@/shared/lib/auth/session";

export default async function Page() {
  const [labs, { isAuthenticated }] = await Promise.all([
    getPopularLabs(),
    getAuthSession(),
  ]);

  return <HomePage isAuthenticated={isAuthenticated} labs={labs} />;
}
