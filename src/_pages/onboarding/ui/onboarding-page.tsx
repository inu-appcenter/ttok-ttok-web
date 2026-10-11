import { OnboardingChat } from "@/widgets/onboarding-chat";
import type { OnboardingReviewOptions } from "@/features/onboarding";
import type { CollegeOption } from "@/entities/lab";

export type OnboardingPageProps = {
  completionHref?: string;
  colleges?: CollegeOption[];
  collegesError?: string;
  reviewOptions?: OnboardingReviewOptions;
  reviewOptionsError?: string;
};

export function OnboardingPage({
  completionHref,
  colleges,
  collegesError,
  reviewOptions,
  reviewOptionsError,
}: OnboardingPageProps) {
  return (
    <OnboardingChat
      completionHref={completionHref}
      colleges={colleges}
      collegesError={collegesError}
      reviewOptions={reviewOptions}
      reviewOptionsError={reviewOptionsError}
    />
  );
}
