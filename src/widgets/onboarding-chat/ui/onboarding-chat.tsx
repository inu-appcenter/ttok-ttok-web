"use client";

import { useRouter } from "next/navigation";

import {
  completeOnboarding,
  OnboardingFlow,
  type OnboardingAnswers,
} from "@/features/onboarding";
import { LabSearchCombobox } from "@/features/search-lab";

import { OnboardingHeader } from "./onboarding-header";

export function OnboardingChat() {
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
        renderLabSearch={({ onSelect, selectedLabId }) => (
          <LabSearchCombobox
            onClearSelection={() => onSelect("")}
            onSelect={(lab) => onSelect(lab.labId)}
            selectedLabId={selectedLabId}
          />
        )}
      />
    </main>
  );
}
