import Image from "next/image";

export function OnboardingHeader() {
  return (
    <header className="flex shrink-0 items-center justify-center border-b border-border-subtlest bg-bg-default py-7">
      <h1>
        <Image
          alt="똑똑"
          height={41.7008}
          priority
          src="/icons/onboarding/wordmark.svg"
          width={73.9}
        />
      </h1>
    </header>
  );
}
