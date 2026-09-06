import type { MemberProfile } from "@/entities/member";
import { MemberProfilePanel } from "@/features/manage-member-profile";
import { SiteHeader } from "@/widgets/site-header";

export type MyPageProps = {
  initialWithdrawalDialogOpen?: boolean;
  profile: MemberProfile;
};

export function MyPage({
  initialWithdrawalDialogOpen = false,
  profile,
}: MyPageProps) {
  return (
    <div className="min-h-screen bg-bg-default">
      <SiteHeader isAuthenticated />
      <main className="mx-auto w-full max-w-[456px] px-4 pb-16 pt-10 md:px-0">
        <h1 className="text-[length:var(--font-size-title1)] font-bold leading-[1.5] text-text-default">
          내 프로필
        </h1>
        <div className="mt-10">
          <MemberProfilePanel
            initialWithdrawalDialogOpen={initialWithdrawalDialogOpen}
            profile={profile}
          />
        </div>
      </main>
    </div>
  );
}
