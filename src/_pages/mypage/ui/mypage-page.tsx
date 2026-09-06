import type { MemberProfile } from "@/entities/member";
import { MemberProfilePanel } from "@/features/manage-member-profile";
import { MobileBottomNav } from "@/widgets/mobile-bottom-nav";
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
      <main className="mx-auto w-full max-w-[456px] px-4 pb-28 pt-[27px] md:px-0 md:pb-16 md:pt-10">
        <h1 className="hidden text-[length:var(--font-size-title1)] font-bold leading-[1.5] text-text-default md:block">
          내 프로필
        </h1>
        <div className="md:mt-10">
          <MemberProfilePanel
            initialWithdrawalDialogOpen={initialWithdrawalDialogOpen}
            profile={profile}
          />
        </div>
      </main>
      <MobileBottomNav activeHref="/mypage" />
    </div>
  );
}
