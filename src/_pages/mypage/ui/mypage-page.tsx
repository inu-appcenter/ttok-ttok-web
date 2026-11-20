"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { MemberProfile } from "@/entities/member";
import { Button, Dialog, useToast } from "@/shared/ui";
import {
  MemberProfilePanel,
  type MemberProfilePanelProps,
} from "@/features/manage-member-profile";
import {
  BookmarkPreview,
  type BookmarkActions,
} from "@/features/manage-bookmarks";
import { MobileBottomNav } from "@/widgets/mobile-bottom-nav";

import {
  ResearcherRegistrationDialog,
  type ResearcherRegistrationDialogProps,
} from "./researcher-registration-dialog";

export type MyPageProps = Omit<MemberProfilePanelProps, "bookmarks"> &
  BookmarkActions &
  Pick<ResearcherRegistrationDialogProps, "reviewOptions" | "reviewOptionsError"> & {
    profile: MemberProfile;
  };

export function MyPage({
  initialWithdrawalDialogOpen = false,
  profile,
  initialBookmarks,
  onToggle,
  onLoad,
  reviewOptions,
  reviewOptionsError,
  ...actions
}: MyPageProps) {
  const router = useRouter();
  const showToast = useToast();
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  const [statusError, setStatusError] = useState("");
  const isResearcher = profile.userType === "RESEARCHER";

  // 등록 해제만 처리한다. 등록은 ResearcherRegistrationDialog가 담당한다.
  async function handleUnregister() {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setStatusError("");
    try {
      const response = await fetch("/api/member/researcher", { method: "DELETE" });
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok || !body || typeof body !== "object" || !("ok" in body) || body.ok !== true) {
        if (response.status === 401) { router.replace("/login"); router.refresh(); return; }
        throw new Error(body && typeof body === "object" && "message" in body && typeof body.message === "string" ? body.message : "변경하지 못했어요. 다시 확인해주세요.");
      }
      setStatusDialogOpen(false);
      showToast({ state: "success", title: "연구생 등록을 해제했어요." });
      router.refresh();
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : "변경하지 못했어요. 다시 확인해주세요.");
      router.refresh();
    } finally { busy.current = false; setPending(false); }
  }
  const closeStatusDialog = useCallback(() => {
    if (!busy.current) setStatusDialogOpen(false);
  }, []);
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
            onChangeResearcherStatus={actions.onChangeResearcherStatus ?? (() => { setStatusError(""); setStatusDialogOpen(true); })}
          />
        </div>
      </main>
      {isResearcher ? (
        <Dialog isOpen={statusDialogOpen} onClose={closeStatusDialog} title="연구생 등록을 해제하시겠어요?">
          <div className="mt-4 flex flex-col gap-4">
            <p className="text-sm text-text-subtle">등록을 해제하면 커피챗 정보가 삭제되고, 작성한 연구실 리뷰는 익명으로 남아요.</p>
            {statusError ? <p role="alert" className="text-sm text-text-error">{statusError}</p> : null}
            <div className="flex gap-3"><Button className="flex-1" variant="tertiary" disabled={pending} onClick={() => setStatusDialogOpen(false)}>취소</Button><Button className="flex-1" disabled={pending} isLoading={pending} onClick={() => void handleUnregister()}>등록 해제</Button></div>
          </div>
        </Dialog>
      ) : (
        <ResearcherRegistrationDialog
          isOpen={statusDialogOpen}
          onClose={closeStatusDialog}
          reviewOptions={reviewOptions}
          reviewOptionsError={reviewOptionsError}
        />
      )}
      <MobileBottomNav activeHref="/mypage" />
    </div>
  );
}
