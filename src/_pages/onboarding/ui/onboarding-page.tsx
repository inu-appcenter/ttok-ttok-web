import { OnboardingChat } from "@/widgets/onboarding-chat";
import type { OnboardingReviewOptions } from "@/features/onboarding";

export type OnboardingPageProps = {
  reviewOptions?: OnboardingReviewOptions;
  reviewOptionsError?: string;
};

export function OnboardingPage({
  reviewOptions,
  reviewOptionsError,
}: OnboardingPageProps) {
  return (
    <OnboardingChat
      reviewOptions={reviewOptions}
      reviewOptionsError={reviewOptionsError}
    />
  );
}
