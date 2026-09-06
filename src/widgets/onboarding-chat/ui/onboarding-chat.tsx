"use client";

import { OnboardingFlow } from "@/features/onboarding";
import { LabSearchCombobox } from "@/features/search-lab";

import { OnboardingHeader } from "./onboarding-header";

export function OnboardingChat() {
  return (
    <main className="flex min-h-screen flex-col bg-bg-default max-md:h-dvh max-md:min-h-0 max-md:overflow-hidden">
      <OnboardingHeader />
      <OnboardingFlow
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
