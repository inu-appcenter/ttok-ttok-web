import { LoginForm } from "@/features/login";
import { LoginRequiredNotice } from "@/shared/lib/auth/login-required";
import type { LoginNotice } from "@/shared/lib/auth/return-path";

export type LoginPageProps = {
  initialHasError?: boolean;
  notice?: LoginNotice;
  returnTo?: string;
};

export function LoginPage({
  initialHasError = false,
  notice,
  returnTo,
}: LoginPageProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg-default">
      {notice ? <LoginRequiredNotice /> : null}
      <main className="flex flex-1 items-center justify-center px-[var(--spacing-spacing-4)] py-[var(--spacing-spacing-8)]">
        <LoginForm initialHasError={initialHasError} returnTo={returnTo} />
      </main>
    </div>
  );
}
