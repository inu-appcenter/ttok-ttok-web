import { LoginForm } from "@/features/login";

export type LoginPageProps = {
  initialHasError?: boolean;
  returnTo?: string;
};

export function LoginPage({
  initialHasError = false,
  returnTo,
}: LoginPageProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg-default">
      <main className="flex flex-1 items-center justify-center px-[var(--spacing-spacing-4)] py-[var(--spacing-spacing-8)]">
        <LoginForm initialHasError={initialHasError} returnTo={returnTo} />
      </main>
    </div>
  );
}
