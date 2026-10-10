import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getAuthSession } from "@/shared/lib/auth/session";
import { getOnboardingReviewOptions } from "@/features/onboarding/api";
import type { OnboardingReviewOptions } from "@/features/onboarding";
import { ACCESS_TOKEN_COOKIE } from "@/shared/lib/auth/cookies";

import { OnboardingPage } from "@/_pages/onboarding";
import { getCollegeOptions } from "@/entities/lab/api/get-college-options";

export default async function OnboardingRoute() {
  const { isAuthenticated } = await getAuthSession();

  if (!isAuthenticated) {
    redirect("/login");
  }

  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    redirect("/login");
  }

  const [reviewResult, collegeResult] = await Promise.allSettled([
    getOnboardingReviewOptions(accessToken),
    getCollegeOptions(),
  ]);
  const reviewOptions: OnboardingReviewOptions | undefined =
    reviewResult.status === "fulfilled" ? reviewResult.value : undefined;
  const reviewOptionsError =
    reviewResult.status === "rejected"
      ? "선택지를 불러오지 못했습니다. 새로고침 후 다시 시도해주세요."
      : undefined;

  return (
    <OnboardingPage
      colleges={collegeResult.status === "fulfilled" ? collegeResult.value : []}
      collegesError={
        collegeResult.status === "rejected"
          ? "학과 목록을 불러오지 못했습니다. 새로고침 후 다시 시도해주세요."
          : undefined
      }
      reviewOptions={reviewOptions}
      reviewOptionsError={reviewOptionsError}
    />
  );
}
