import { Logo } from "@/shared/ui";

export function OnboardingHeader() {
  return (
    <header className="flex h-[90px] shrink-0 items-center justify-center border-b border-border-subtlest bg-bg-default">
      <h1>
        <Logo priority variant="wordmark" />
      </h1>
    </header>
  );
}
