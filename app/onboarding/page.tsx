import { redirect } from "next/navigation";

import { getAuthSession } from "@/shared/lib/auth/session";

import { OnboardingPage } from "@/_pages/onboarding";

export default async function OnboardingRoute() {
  const { isAuthenticated } = await getAuthSession();

  if (!isAuthenticated) {
    redirect("/login");
  }

  return <OnboardingPage />;
}
