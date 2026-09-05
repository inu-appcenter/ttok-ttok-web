import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ACCESS_TOKEN_COOKIE } from "@/shared/lib/auth/cookies";

import { OnboardingPage } from "@/_pages/onboarding";

export default async function OnboardingRoute() {
  const hasAccessToken = (await cookies()).has(ACCESS_TOKEN_COOKIE);

  if (!hasAccessToken) {
    redirect("/login");
  }

  return <OnboardingPage />;
}
