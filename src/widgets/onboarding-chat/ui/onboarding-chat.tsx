"use client";

import { useRouter } from "next/navigation";

import {
  completeOnboarding,
  OnboardingFlow,
  searchOnboardingLaboratories,
  type OnboardingAnswers,
  type OnboardingReviewOptions,
} from "@/features/onboarding";
import { LabSearchCombobox } from "@/features/search-lab";

import { OnboardingHeader } from "./onboarding-header";

type OnboardingChatProps = {
  reviewOptions?: OnboardingReviewOptions;
  reviewOptionsError?: string;
};

export function OnboardingChat({
  reviewOptions,
  reviewOptionsError,
}: OnboardingChatProps) {
  const router = useRouter();

  async function handleComplete(answers: OnboardingAnswers) {
    const result = await completeOnboarding(answers);

    if (!result.ok) {
      throw new Error(result.message);
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen flex-col bg-bg-default max-md:h-dvh max-md:min-h-0 max-md:overflow-hidden">
      <OnboardingHeader />
      <OnboardingFlow
        onComplete={handleComplete}
        renderLabSearch={({ onClearSelection, onSelect, selectedLaboratoryId }) => (
          <LabSearchCombobox
            onClearSelection={onClearSelection}
            onSearch={searchOnboardingLaboratories}
            onSelect={onSelect}
            selectedLabId={
              selectedLaboratoryId ? String(selectedLaboratoryId) : undefined
            }
          />
        )}
        reviewOptions={reviewOptions}
        reviewOptionsError={reviewOptionsError}
      />
    </main>
  );
}

export type { OnboardingChatProps };
