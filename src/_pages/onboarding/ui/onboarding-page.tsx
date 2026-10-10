import { OnboardingChat } from "@/widgets/onboarding-chat";
import type { OnboardingReviewOptions } from "@/features/onboarding";
import type { CollegeOption } from "@/entities/lab";

export type OnboardingPageProps = {
  colleges?: CollegeOption[];
  collegesError?: string;
  reviewOptions?: OnboardingReviewOptions;
  reviewOptionsError?: string;
};

export function OnboardingPage({
  colleges,
  collegesError,
  reviewOptions,
  reviewOptionsError,
}: OnboardingPageProps) {
  return (
    <OnboardingChat
      colleges={colleges}
      collegesError={collegesError}
      reviewOptions={reviewOptions}
      reviewOptionsError={reviewOptionsError}
    />
  );
}
