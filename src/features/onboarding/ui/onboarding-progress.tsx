type OnboardingProgressProps = {
  currentStep: number;
  totalSteps?: number;
};

export function OnboardingProgress({
  currentStep,
  totalSteps = 8,
}: OnboardingProgressProps) {
  const safeTotalSteps = Math.max(totalSteps, 1);
  const safeCurrentStep = Math.min(Math.max(currentStep, 1), safeTotalSteps);
  const progress = (safeCurrentStep / safeTotalSteps) * 100;

  return (
    <div
      aria-label={`온보딩 ${safeCurrentStep}단계 / ${safeTotalSteps}단계`}
      aria-valuemax={safeTotalSteps}
      aria-valuemin={1}
      aria-valuenow={safeCurrentStep}
      className="h-2 w-full shrink-0 overflow-hidden bg-bg-neutral"
      role="progressbar"
    >
      <div
        className="h-full rounded-r-full bg-bg-primary transition-[width] duration-200"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export type { OnboardingProgressProps };
