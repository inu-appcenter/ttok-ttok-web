import { redirect } from "next/navigation";

import { getAuthSession } from "@/shared/lib/auth/session";
import { getOnboardingReviewOptions } from "@/features/onboarding/api";
import type { OnboardingReviewOptions } from "@/features/onboarding";

import { OnboardingPage } from "@/_pages/onboarding";

export default async function OnboardingRoute() {
  const { isAuthenticated } = await getAuthSession();

  if (!isAuthenticated) {
    redirect("/login");
  }

  let reviewOptions: OnboardingReviewOptions | undefined;
  let reviewOptionsError: string | undefined;

  try {
    reviewOptions = await getOnboardingReviewOptions();
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
