import { LoginPage } from "@/_pages/login";
import { getAuthSession } from "@/shared/lib/auth/session";

export default async function Page() {
  const { isAuthenticated } = await getAuthSession();

  return <LoginPage isAuthenticated={isAuthenticated} />;
}
