"use client";

import { resetAnalytics } from "@/shared/lib/analytics";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import type { MemberProfile } from "@/entities/member";
import { notifyAuthChange } from "@/shared/lib/session-store";
import { Button, Dialog, Tag } from "@/shared/ui";
import { logout, withdrawMember } from "../api/manage-member";
import {
  CoffeeChatSettings,
  type CoffeeChatSettingsProps,
} from "./coffee-chat-settings";
import type { ResearchReviewOptions } from "../model/review-options";
import { ResearchReviewEditor } from "./research-review-editor";

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
  /** 연구실 정보 수정의 코어타임·미팅 빈도·하는 일 선택지 */
  reviewOptions?: ResearchReviewOptions;
  reviewOptionsError?: string;
};

const LAB_TITLE_CLASSES =
  "break-words text-[length:var(--font-size-headline2)] font-semibold leading-[1.4] tracking-[-0.01em] text-text-default md:text-xl md:font-bold md:leading-[1.5] md:tracking-normal";

export function MemberProfilePanel({
  initialWithdrawalDialogOpen = false,
  onChangeResearcherStatus,
  onEdit,
  onLogout,
  onWithdraw,
  onSaveContact,
  mockContacts,
  bookmarks,
  profile,
  reviewOptions,
  reviewOptionsError,
}: MemberProfilePanelProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(initialWithdrawalDialogOpen);
  const [editingReview, setEditingReview] = useState(false);
  const [pending, setPending] = useState<"logout" | "withdraw" | null>(null);
  const [error, setError] = useState("");
  const busy = useRef(false);
  const withdrawalTrigger = useRef<HTMLButtonElement>(null);
  const isProfessor = profile.userType === "PROFESSOR";
  const isResearcher =
    profile.userType === "RESEARCHER" ||
    profile.isUndergraduateResearcher === true;
  const research = profile.researchProfile;
  async function act(kind: "logout" | "withdraw") {
    if (busy.current) return;
    busy.current = true;
    notifyAuthChange();
    setPending(kind);
    setError("");
    try {
      const callback = kind === "logout" ? onLogout : onWithdraw;
      if (callback) {
        await callback();
        if (kind === "withdraw") setDialogOpen(false);
      } else {
        const result = await (kind === "logout" ? logout() : withdrawMember());
        if (!result.ok) {
          if (result.requiresLogin) {
            await resetAnalytics();
            router.replace("/login");
            router.refresh();
            return;
          }
          throw new Error(result.message);
        }
        await resetAnalytics();
        router.replace("/login");
        router.refresh();
      }
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "요청을 완료하지 못했어요.",
      );
    } finally {
      busy.current = false;
      setPending(null);
    }
  }
  function closeDialog() {
    if (!busy.current) {
      setDialogOpen(false);
      setError("");
      withdrawalTrigger.current?.focus();
    }
  }
  return (
    <>
      <div className="flex items-center justify-between gap-3 rounded-[var(--radius-xl)] bg-bg-default p-3 md:gap-4 md:rounded-none md:p-0">
        <h1 className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 md:items-baseline md:gap-x-10">
          <span className="text-[length:var(--font-size-headline1)] font-semibold leading-[1.4] tracking-[-0.01em] text-text-default md:text-[22px] md:leading-[1.5] md:tracking-normal md:text-text-subtle">
            {profile.studentNumber || profile.displayName || profile.roleLabel}
          </span>
          {profile.department ? (
            <span className="text-[length:var(--font-size-caption1)] leading-[1.5] text-text-subtle md:text-base md:leading-6">
              {profile.department}
            </span>
          ) : null}
        </h1>
        <Button
          className="!h-8 !rounded-[var(--radius-md)] !px-4 !text-[length:var(--font-size-caption1)] md:!h-[33px] md:!w-[100px] md:!rounded-lg md:!px-0 md:!text-sm"
          variant="outline"
          size="sm"
          isLoading={pending === "logout"}
          disabled={Boolean(pending)}
          onClick={() => void act("logout")}
        >
          로그아웃
        </Button>
      </div>
      {!dialogOpen && error ? (
        <p role="alert" className="mt-3 text-sm text-text-error">
          {error}
        </p>
      ) : null}
      <div className="mt-[14px] grid min-w-0 gap-[14px] md:mt-5 md:gap-[30px] lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-[14px] md:gap-[30px]">
          {!isProfessor ? (
            <section className="flex items-center justify-between gap-3 rounded-xl bg-bg-default p-3 shadow-[0_2px_4px_var(--color-opacity-black-10)] md:px-5">
              <h2 className="text-base font-semibold leading-6 text-text-subtle">
                학부연구생 여부
              </h2>
              <div className="flex items-center gap-[11px]">
                <span className="text-lg font-semibold leading-[1.4] text-text-default">
                  {isResearcher ? "예" : "아니요"}
                </span>
                {onChangeResearcherStatus ? (
                  <button
                    className="cursor-pointer text-xs text-text-primary underline md:font-bold"
                    type="button"
                    onClick={onChangeResearcherStatus}
                  >
                    변경
                  </button>
                ) : null}
              </div>
            </section>
          ) : null}
          {(isResearcher || isProfessor) && research ? (
            <div className="grid min-w-0 items-start gap-[14px] md:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)] md:gap-[30px]">
              <section className="flex min-w-0 flex-col gap-3 rounded-[var(--radius-2xl)] bg-bg-default px-4 py-[14px] shadow-[0_2px_4px_var(--color-opacity-black-10)] md:block md:rounded-xl md:px-5 md:py-[10px]">
                <div className="flex flex-col gap-0.5 md:block md:border-b md:border-border-disabled md:py-[10px]">
                  {research.laboratoryId ? (
                    <Link
                      className="hover:underline"
                      href={`/labs/${research.laboratoryId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <h2 className={LAB_TITLE_CLASSES}>
                        {research.laboratoryName}
                      </h2>
                    </Link>
                  ) : (
                    <h2 className={LAB_TITLE_CLASSES}>
                      {research.laboratoryName}
                    </h2>
                  )}
                  <p className="text-[length:var(--font-size-caption1)] leading-[1.5] text-text-subtle md:text-xs md:font-bold">
                    {[
                      research.professorName
                        ? `${research.professorName} 교수`
                        : "",
                      research.department,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                {research.tags.length ? (
                  <div className="flex flex-wrap gap-x-[14px] gap-y-[5px] md:mt-4">
                    {research.tags.map((tag) => (
                      <Tag
                        key={tag}
                        size="sm"
                        tone="primary"
                        className="!h-[22px] !bg-[#bfd5f3] max-md:!text-[length:var(--font-size-caption1)] md:!font-bold"
                      >
                        {tag}
                      </Tag>
                    ))}
                  </div>
                ) : null}
                {isResearcher ? (
                  <button
                    type="button"
                    className="cursor-pointer self-center rounded-[var(--radius-lg)] px-2 py-1.5 text-center text-xs font-bold text-bg-primary-hover underline opacity-80 focus-visible:outline-2 focus-visible:outline-border-primary md:mt-4 md:block md:w-full md:rounded-none md:px-0 md:text-text-primary md:opacity-100"
                    onClick={onEdit ?? (() => setEditingReview(true))}
                  >
                    정보 수정하기
                  </button>
                ) : null}
              </section>
              {isResearcher ? (
                <CoffeeChatSettings
                  key={JSON.stringify(research.coffeeChat ?? null)}
                  research={research}
                  onSaveContact={onSaveContact}
                  mockContacts={mockContacts}
                />
              ) : null}
            </div>
          ) : null}
          {isResearcher && !research ? (
            <p className="text-sm text-text-subtle">
              연결된 연구실 정보가 없어요.
            </p>
          ) : null}
          {!isResearcher && !isProfessor ? bookmarks : null}
        </div>
        {isResearcher || isProfessor ? (
          <div className="min-w-0">{bookmarks}</div>
        ) : null}
      </div>
      <div className="mt-[14px] text-right md:mt-20 md:text-center">
        <button
          ref={withdrawalTrigger}
          type="button"
          className="cursor-pointer text-xs text-text-subtlest underline"
          disabled={Boolean(pending)}
          onClick={() => {
            setError("");
            setDialogOpen(true);
          }}
        >
          회원탈퇴
        </button>
      </div>
      {editingReview && research ? (
        <ResearchReviewEditor
          research={research}
          onClose={() => setEditingReview(false)}
          reviewOptions={reviewOptions}
          reviewOptionsError={reviewOptionsError}
        />
      ) : null}
      <Dialog
        isOpen={dialogOpen}
        onClose={closeDialog}
        title="정말 탈퇴하시겠어요?"
        variant="confirmation"
        className="md:!max-w-[340px]"
      >
        <div className="mt-3 flex flex-col gap-3">
          <p className="text-center text-[length:var(--font-size-caption1)] leading-[1.5] text-text-subtle md:text-sm">
            {profile.hasContributedReview
              ? "제공하신 연구실 정보를 제외한 모든 기록은 삭제되며,"
              : "탈퇴하면 기록이 모두 삭제되며,"}
            <br />
            삭제된 데이터는 복구할 수 없어요.
          </p>
          <div className="flex gap-3">
            <Button
              autoFocus
              className="!h-8 flex-1 !rounded-lg !px-4 !text-sm"
              disabled={Boolean(pending)}
              variant="tertiary"
              size="sm"
              onClick={closeDialog}
            >
              취소
            </Button>
            <Button
              className="!h-8 flex-1 !rounded-lg !bg-bg-error !px-4 !text-sm !text-text-inverse hover:!bg-[var(--color-red-red-400)]"
              size="sm"
              isLoading={pending === "withdraw"}
              disabled={Boolean(pending)}
              onClick={() => void act("withdraw")}
            >
              탈퇴하기
            </Button>
          </div>
          {error ? (
            <p role="alert" className="text-center text-xs text-text-error">
              {error}
            </p>
          ) : null}
        </div>
      </Dialog>
    </>
  );
}
