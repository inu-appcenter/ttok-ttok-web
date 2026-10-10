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
import type { CollegeOption } from "@/entities/lab";

import { OnboardingHeader } from "./onboarding-header";
import { FinderResults } from "./finder-results";

type OnboardingChatProps = {
  colleges?: CollegeOption[];
  collegesError?: string;
  reviewOptions?: OnboardingReviewOptions;
  reviewOptionsError?: string;
};

export function OnboardingChat({
  colleges,
  collegesError,
  reviewOptions,
  reviewOptionsError,
}: OnboardingChatProps) {
  const router = useRouter();

  async function handleComplete(answers: OnboardingAnswers, href = "/") {
    const result = await completeOnboarding(answers);

    if (!result.ok) {
      throw new Error(result.message);
    }

    router.replace(href);
    router.refresh();
  }

  return (
    <main className="flex min-h-screen flex-col bg-bg-default max-md:h-dvh max-md:min-h-0 max-md:overflow-hidden">
      <OnboardingHeader />
      <OnboardingFlow
        colleges={colleges}
        collegesError={collegesError}
        onComplete={handleComplete}
        renderFinderResults={(props) => <FinderResults {...props} />}
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
