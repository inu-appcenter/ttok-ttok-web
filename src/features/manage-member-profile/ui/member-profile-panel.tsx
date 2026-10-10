"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import type { MemberProfile } from "@/entities/member";
import { Button, Dialog, Tag } from "@/shared/ui";
import { logout, withdrawMember } from "../api/manage-member";
import { CoffeeChatSettings, type CoffeeChatSettingsProps } from "./coffee-chat-settings";

export type MemberProfilePanelProps = {
  initialWithdrawalDialogOpen?: boolean;
  onChangeResearcherStatus?: () => void;
  onEdit?: () => void;
  onLogout?: () => Promise<void> | void;
  onWithdraw?: () => Promise<void> | void;
  onSaveContact?: CoffeeChatSettingsProps["onSaveContact"];
  mockContacts?: CoffeeChatSettingsProps["mockContacts"];
  bookmarks?: ReactNode;
  profile: MemberProfile;
};

export function MemberProfilePanel({ initialWithdrawalDialogOpen = false, onChangeResearcherStatus, onEdit, onLogout, onWithdraw, onSaveContact, mockContacts, bookmarks, profile }: MemberProfilePanelProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(initialWithdrawalDialogOpen);
  const [pending, setPending] = useState<"logout" | "withdraw" | null>(null);
  const [error, setError] = useState("");
  const busy = useRef(false);
  const isProfessor = profile.userType === "PROFESSOR";
  const isResearcher = profile.userType === "RESEARCHER" || profile.isUndergraduateResearcher === true;
  const research = profile.researchProfile;
  async function act(kind: "logout" | "withdraw") {
    if (busy.current) return;
    busy.current = true; setPending(kind); setError("");
    try {
      const callback = kind === "logout" ? onLogout : onWithdraw;
      if (callback) { await callback(); if (kind === "withdraw") setDialogOpen(false); }
      else {
        const result = await (kind === "logout" ? logout() : withdrawMember());
        if (!result.ok) { if (result.requiresLogin) { router.replace("/login"); router.refresh(); return; } throw new Error(result.message); }
        router.replace("/login"); router.refresh();
      }
    } catch (failure) { setError(failure instanceof Error ? failure.message : "요청을 완료하지 못했어요."); }
    finally { busy.current = false; setPending(null); }
  }
  function closeDialog() { if (!busy.current) { setDialogOpen(false); setError(""); } }
  return <>
    <div className="flex items-center justify-between gap-4">
      <h1 className="flex min-w-0 flex-wrap items-baseline gap-x-10 gap-y-1">
        <span className="text-[22px] font-semibold leading-[1.5] text-text-subtle">{profile.studentNumber || profile.displayName || profile.roleLabel}</span>
        {profile.department ? <span className="text-base leading-6 text-text-subtle">{profile.department}</span> : null}
      </h1>
      <Button className="!h-[33px] !w-[100px] !rounded-lg !px-0 !text-sm" variant="outline" size="sm" isLoading={pending === "logout"} disabled={Boolean(pending)} onClick={() => void act("logout")}>로그아웃</Button>
    </div>
    {!dialogOpen && error ? <p role="alert" className="mt-3 text-sm text-text-error">{error}</p> : null}
    <div className="mt-5 grid min-w-0 gap-[30px] lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="flex min-w-0 flex-col gap-[30px]">
        {!isProfessor ? <section className="flex items-center justify-between gap-3 rounded-xl bg-bg-default px-5 py-3 shadow-[0_2px_4px_var(--color-opacity-black-10)]">
          <h2 className="text-base font-semibold leading-6 text-text-subtle">학부연구생 여부</h2>
          <div className="flex items-center gap-2"><span className="text-lg font-semibold leading-[1.4] text-text-subtle">{isResearcher ? "예" : "아니요"}</span>{onChangeResearcherStatus ? <button className="cursor-pointer text-xs text-text-subtlest underline" type="button" onClick={onChangeResearcherStatus}>변경</button> : null}</div>
        </section> : null}
        {(isResearcher || isProfessor) && research ? <div className="grid min-w-0 gap-[30px] sm:grid-cols-2">
          <section className="min-w-0 rounded-xl bg-bg-default px-5 py-3 shadow-[0_2px_4px_var(--color-opacity-black-10)]">
            {research.laboratoryId ? <Link className="hover:underline" href={`/labs/${research.laboratoryId}`}><h2 className="break-words text-xl font-bold leading-[1.5] text-text-subtle">{research.laboratoryName}</h2></Link> : <h2 className="break-words text-xl font-bold text-text-subtle">{research.laboratoryName}</h2>}
            <p className="mt-1 text-sm font-semibold leading-[1.5] text-text-subtlest">{[research.professorName ? `${research.professorName} 교수` : "", research.department].filter(Boolean).join(" · ")}</p>
            {research.tags.length ? <div className="mt-3 flex flex-wrap gap-2 border-t border-border-subtlest pt-3">{research.tags.map((tag) => <Tag key={tag} size="sm" tone="primary" className="!bg-[#bfd5f3]">{tag}</Tag>)}</div> : null}
            {onEdit ? <button type="button" className="mt-3 block w-full cursor-pointer text-center text-xs text-text-primary underline" onClick={onEdit}>정보 수정하기</button> : null}
          </section>
          {isResearcher ? <CoffeeChatSettings research={research} onSaveContact={onSaveContact} mockContacts={mockContacts} /> : null}
        </div> : null}
        {isResearcher && !research ? <p className="text-sm text-text-subtle">연결된 연구실 정보가 없어요.</p> : null}
        {!isResearcher && !isProfessor ? bookmarks : null}
      </div>
      {isResearcher || isProfessor ? <div className="min-w-0">{bookmarks}</div> : null}
    </div>
    <div className="mt-20 text-center"><button type="button" className="cursor-pointer text-xs text-text-subtlest underline" disabled={Boolean(pending)} onClick={() => { setError(""); setDialogOpen(true); }}>탈퇴하기</button></div>
    <Dialog isOpen={dialogOpen} onClose={closeDialog} title="정말 탈퇴하시겠어요?" variant="confirmation">
      <div className="mt-3 flex flex-col gap-3">
        <p className="text-center text-sm leading-[1.5] text-text-subtle">{profile.hasContributedReview ? "제공하신 연구실 정보를 제외한 모든 기록은 삭제되며," : "탈퇴하면 기록이 모두 삭제되며,"}<br />삭제된 데이터는 복구할 수 없어요.</p>
        <div className="flex gap-3"><Button autoFocus className="!h-8 flex-1 !rounded-lg !px-4 !text-sm" disabled={Boolean(pending)} variant="tertiary" size="sm" onClick={closeDialog}>취소</Button><Button className="!h-8 flex-1 !rounded-lg !bg-bg-error !px-4 !text-sm !text-text-inverse hover:!bg-[var(--color-red-red-400)]" size="sm" isLoading={pending === "withdraw"} disabled={Boolean(pending)} onClick={() => void act("withdraw")}>탈퇴하기</Button></div>
        {error ? <p role="alert" className="text-center text-xs text-text-error">{error}</p> : null}
      </div>
    </Dialog>
  </>;
}
