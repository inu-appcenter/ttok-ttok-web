import { LoginForm } from "@/features/login";
import { SiteHeader } from "@/widgets/site-header";

export type LoginPageProps = {
  initialHasError?: boolean;
  isAuthenticated?: boolean;
};

export function LoginPage({
  initialHasError = false,
  isAuthenticated = false,
}: LoginPageProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg-default">
      <SiteHeader isAuthenticated={isAuthenticated} />
      <main className="flex flex-1 items-center justify-center px-[var(--spacing-spacing-4)] py-[var(--spacing-spacing-8)]">
        <LoginForm initialHasError={initialHasError} />
      </main>
    </div>
  );
}
