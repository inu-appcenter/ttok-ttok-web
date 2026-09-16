import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getAuthSession } from "@/shared/lib/auth/session";
import { getOnboardingReviewOptions } from "@/features/onboarding/api";
import type { OnboardingReviewOptions } from "@/features/onboarding";
import { ACCESS_TOKEN_COOKIE } from "@/shared/lib/auth/cookies";

import { OnboardingPage } from "@/_pages/onboarding";

export default async function OnboardingRoute() {
  const { isAuthenticated } = await getAuthSession();

  if (!isAuthenticated) {
    redirect("/login");
  }

  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    redirect("/login");
  }

  let reviewOptions: OnboardingReviewOptions | undefined;
  let reviewOptionsError: string | undefined;

  try {
    reviewOptions = await getOnboardingReviewOptions(accessToken);
  } catch {
    reviewOptionsError = "선택지를 불러오지 못했습니다. 새로고침 후 다시 시도해주세요.";
  }

  return (
    <OnboardingPage
      reviewOptions={reviewOptions}
      reviewOptionsError={reviewOptionsError}
    />
  );
}
