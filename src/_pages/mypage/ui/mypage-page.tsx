import type { MemberProfile } from "@/entities/member";
import {
  MemberProfilePanel,
  type MemberProfilePanelProps,
} from "@/features/manage-member-profile";
import {
  BookmarkPreview,
  type BookmarkActions,
} from "@/features/manage-bookmarks";
import { MobileBottomNav } from "@/widgets/mobile-bottom-nav";

export type MyPageProps = Omit<MemberProfilePanelProps, "bookmarks"> &
  BookmarkActions & { profile: MemberProfile };

export function MyPage({
  initialWithdrawalDialogOpen = false,
  profile,
  initialBookmarks,
  onToggle,
  onLoad,
  ...actions
}: MyPageProps) {
  return (
    <div className="min-h-[calc(100dvh-53px)] bg-bg-default md:min-h-[calc(100dvh-72px)]">
      <main className="mx-auto w-full max-w-[1264px] px-4 pb-28 pt-[27px] md:px-10 md:pb-20 md:pt-20">
        <div>
          <MemberProfilePanel
            initialWithdrawalDialogOpen={initialWithdrawalDialogOpen}
            profile={profile}
            bookmarks={
              <BookmarkPreview
                initialBookmarks={initialBookmarks}
                onToggle={onToggle}
                onLoad={onLoad}
              />
            }
            {...actions}
          />
        </div>
      </main>
      <MobileBottomNav activeHref="/mypage" />
    </div>
  );
}
