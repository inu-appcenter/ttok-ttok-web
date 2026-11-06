"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { LabSummary } from "@/entities/lab";
import type { MemberProfile } from "@/entities/member";
import { LabSearchCombobox } from "@/features/search-lab";
import { searchOnboardingLaboratories } from "@/features/onboarding";
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
  const router = useRouter();
  const showToast = useToast();
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedLab, setSelectedLab] = useState<LabSummary | null>(null);
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  const [statusError, setStatusError] = useState("");
  const isResearcher = profile.userType === "RESEARCHER";

  async function handleChangeStatus() {
    if (busy.current || (!isResearcher && !selectedLab)) return;
    busy.current = true;
    setPending(true);
    setStatusError("");
    try {
      const response = await fetch("/api/member/researcher", {
        method: isResearcher ? "DELETE" : "POST",
        ...(!isResearcher ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify({ laboratoryId: selectedLab?.laboratoryId }) } : {}),
      });
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok || !body || typeof body !== "object" || !("ok" in body) || body.ok !== true) {
        if (response.status === 401) { router.replace("/login"); router.refresh(); return; }
        throw new Error(body && typeof body === "object" && "message" in body && typeof body.message === "string" ? body.message : "변경하지 못했어요. 다시 확인해주세요.");
      }
      setStatusDialogOpen(false);
      setSelectedLab(null);
      showToast({ state: "success", title: isResearcher ? "연구생 등록을 해제했어요." : "연구생으로 등록했어요." });
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
            onChangeResearcherStatus={actions.onChangeResearcherStatus ?? (() => { setStatusError(""); setSelectedLab(null); setStatusDialogOpen(true); })}
          />
        </div>
      </main>
      <Dialog isOpen={statusDialogOpen} onClose={closeStatusDialog} title={isResearcher ? "연구생 등록을 해제하시겠어요?" : "소속 연구실을 선택해주세요"}>
        <div className="mt-4 flex flex-col gap-4">
          {isResearcher ? <p className="text-sm text-text-subtle">등록을 해제하면 커피챗 정보가 삭제되고, 작성한 연구실 리뷰는 익명으로 남아요.</p> : <LabSearchCombobox className="!max-w-none" onSearch={searchOnboardingLaboratories} onSelect={setSelectedLab} onClearSelection={() => setSelectedLab(null)} selectedLabId={selectedLab?.labId} />}
          {statusError ? <p role="alert" className="text-sm text-text-error">{statusError}</p> : null}
          <div className="flex gap-3"><Button className="flex-1" variant="tertiary" disabled={pending} onClick={() => setStatusDialogOpen(false)}>취소</Button><Button className="flex-1" disabled={pending || (!isResearcher && !selectedLab)} isLoading={pending} onClick={() => void handleChangeStatus()}>{isResearcher ? "등록 해제" : "등록"}</Button></div>
        </div>
      </Dialog>
      <MobileBottomNav activeHref="/mypage" />
    </div>
  );
}
