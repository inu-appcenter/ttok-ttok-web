"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { MemberProfile, MemberResearchProfile } from "@/entities/member";
import { Button, Dialog, Tag, Toggle } from "@/shared/ui";

import { logout, withdrawMember } from "../api/manage-member";

export type MemberProfilePanelProps = {
  initialWithdrawalDialogOpen?: boolean;
  onChangeResearcherStatus?: () => void;
  onEdit?: () => void;
  onLogout?: () => Promise<void> | void;
  onWithdraw?: () => Promise<void> | void;
  profile: MemberProfile;
};

type ProfileViewProps = Omit<
  MemberProfilePanelProps,
  "initialWithdrawalDialogOpen" | "onWithdraw"
> & {
  isCoffeeChatPublic: boolean;
  isLoggingOut: boolean;
  logoutError?: string;
  onCoffeeChatPublicChange: (checked: boolean) => void;
  onWithdrawalDialogOpen: () => void;
};

function ResearchActivityTags({
  filled = false,
  tags,
}: {
  filled?: boolean;
  tags: string[];
}) {
  return (
    <ul
      aria-label="연구 활동 정보"
      className={filled ? "flex flex-wrap gap-x-3.5 gap-y-[5px]" : "flex flex-wrap gap-2"}
    >
      {tags.map((tag) => (
        <li
          className={
            filled
              ? "rounded-full bg-[#bfd5f3] px-2.5 py-0.5 text-[length:var(--font-size-caption1)] leading-[1.5] text-text-inverse"
              : "rounded-full border border-border-subtle px-[14px] py-0.5 text-[length:var(--font-size-body3)] leading-[1.5] text-text-subtle"
          }
          key={tag}
        >
          {tag}
        </li>
      ))}
    </ul>
  );
}

function ResearcherStatus({
  isUndergraduateResearcher,
  onChange,
}: {
  isUndergraduateResearcher: boolean;
  onChange?: () => void;
}) {
  return (
    <section className="flex w-full items-center justify-between rounded-[var(--radius-xl)] border border-bg-default bg-bg-default p-3 shadow-[0_2px_8px_var(--color-opacity-black-10)]">
      <h2 className="text-[length:var(--font-size-headline2)] font-semibold leading-[1.4] tracking-[-0.01em] text-text-subtle">
        학부연구생 여부
      </h2>
      <div className="flex items-center gap-[11px]">
        <strong className="text-[length:var(--font-size-headline1)] font-semibold leading-[1.4] tracking-[-0.01em] text-text-default">
          {isUndergraduateResearcher ? "예" : "아니요"}
        </strong>
        <button
          className="cursor-pointer text-[length:var(--font-size-caption1)] leading-[1.5] text-text-primary underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary"
          onClick={onChange}
          type="button"
        >
          변경
        </button>
      </div>
    </section>
  );
}

function DesktopProfileView({
  isCoffeeChatPublic,
  isLoggingOut,
  logoutError,
  onChangeResearcherStatus,
  onCoffeeChatPublicChange,
  onEdit,
  onLogout,
  onWithdrawalDialogOpen,
  profile,
}: ProfileViewProps) {
  const researchProfile = profile.researchProfile;

  return (
    <section className="flex w-full flex-col items-center" aria-label="회원 프로필">
      <Image
        alt="기본 프로필 이미지"
        height={130}
        priority
        src="/images/mypage/profile-placeholder.svg"
        width={130}
      />

      <div className="mt-4 flex w-full max-w-[316px] flex-col items-center">
        <p className="text-[length:var(--font-size-heading2)] font-semibold leading-[1.5] text-text-default">
          {profile.displayName ?? profile.email}
        </p>
        <p className="mt-0.5 text-[length:var(--font-size-body3)] leading-[1.5] text-text-subtle">
          {profile.displayName ? profile.email : profile.accountLabel}
        </p>
        {profile.studentNumber || profile.department ? (
          <p className="mt-1 text-[length:var(--font-size-caption1)] leading-[1.5] text-text-subtle">
            {[profile.studentNumber, profile.department].filter(Boolean).join(" · ")}
          </p>
        ) : null}
        {profile.roleLabel ? (
          <Tag className="mt-2" size="sm" tone="primary">
            {profile.roleLabel}
          </Tag>
        ) : null}
        <Button
          className="mt-5 !h-8 w-full !rounded-[var(--radius-lg)] !px-2 !text-[length:var(--font-size-body2)] !font-semibold"
          isLoading={isLoggingOut}
          onClick={onLogout}
          size="sm"
          type="button"
          variant="outline"
        >
          로그아웃
        </Button>
        {logoutError ? (
          <p
            className="mt-2 text-center text-[length:var(--font-size-caption1)] text-text-error"
            role="alert"
          >
            {logoutError}
          </p>
        ) : null}
      </div>

      {profile.isUndergraduateResearcher !== undefined ? (
        <div className="mt-4 w-full">
          <ResearcherStatus
            isUndergraduateResearcher={profile.isUndergraduateResearcher}
            onChange={onChangeResearcherStatus}
          />
        </div>
      ) : null}

      {researchProfile ? (
        <article className="mt-4 w-full rounded-[var(--radius-md)] border border-border-subtle bg-bg-default px-5 py-2.5">
          <h2 className="text-[length:var(--font-size-heading2)] font-semibold leading-[1.5] text-text-default">
            {researchProfile.laboratoryName}
          </h2>
          <p className="mt-0.5 text-[length:var(--font-size-body3)] leading-[1.5] text-text-subtle">
            {researchProfile.professorName} 교수 · {researchProfile.department}
          </p>
          <p className="mt-2 text-[length:var(--font-size-body3)] leading-[1.5] text-text-subtle">
            {researchProfile.registeredAtLabel} 등록
          </p>

          <div className="mt-2">
            <ResearchActivityTags tags={researchProfile.tags} />
          </div>

          <div className="my-3 border-t border-border-subtle" />

          <CoffeeChatVisibility
            checked={isCoffeeChatPublic}
            onChange={onCoffeeChatPublicChange}
          />

          <ProfileEditButton label="정보 수정하기" onClick={onEdit} />
        </article>
      ) : null}

      <WithdrawalButton onClick={onWithdrawalDialogOpen} />
    </section>
  );
}

function MobileProfileView({
  isCoffeeChatPublic,
  isLoggingOut,
  logoutError,
  onChangeResearcherStatus,
  onCoffeeChatPublicChange,
  onEdit,
  onLogout,
  onWithdrawalDialogOpen,
  profile,
}: ProfileViewProps) {
  const researchProfile = profile.researchProfile;

  return (
    <section className="flex w-full flex-col gap-3.5" aria-label="회원 프로필">
      <article className="flex flex-col gap-3 rounded-[var(--radius-xl)] border border-bg-default bg-bg-default p-3 shadow-[0_2px_8px_var(--color-opacity-black-10)]">
        <div className="flex items-start gap-2.5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-[#749fda] text-[length:var(--font-size-body2)] text-text-default">
            나
          </div>
          <div>
            <p className="text-[length:var(--font-size-headline1)] font-semibold leading-[1.4] tracking-[-0.01em] text-text-default">
              {profile.displayName ?? profile.email}
            </p>
            <p className="text-[length:var(--font-size-caption1)] leading-[1.5] text-text-subtle">
              {profile.displayName ? profile.email : profile.accountLabel}
            </p>
            {profile.studentNumber || profile.department ? (
              <p className="text-[length:var(--font-size-caption1)] leading-[1.5] text-text-subtlest">
                {[profile.studentNumber, profile.department]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            ) : null}
          </div>
        </div>
        <Button
          className="!h-8 w-full !rounded-[var(--radius-md)] !px-4 !text-[length:var(--font-size-body3)]"
          isLoading={isLoggingOut}
          onClick={onLogout}
          size="sm"
          type="button"
          variant="outline"
        >
          로그아웃
        </Button>
        {logoutError ? (
          <p
            className="text-center text-[length:var(--font-size-caption1)] text-text-error"
            role="alert"
          >
            {logoutError}
          </p>
        ) : null}
      </article>

      {profile.isUndergraduateResearcher !== undefined ? (
        <ResearcherStatus
          isUndergraduateResearcher={profile.isUndergraduateResearcher}
          onChange={onChangeResearcherStatus}
        />
      ) : null}

      {researchProfile ? (
        <MobileResearchProfile
          isCoffeeChatPublic={isCoffeeChatPublic}
          onCoffeeChatPublicChange={onCoffeeChatPublicChange}
          onEdit={onEdit}
          researchProfile={researchProfile}
        />
      ) : null}

      <div className="flex justify-end">
        <WithdrawalButton onClick={onWithdrawalDialogOpen} />
      </div>
    </section>
  );
}

function MobileResearchProfile({
  isCoffeeChatPublic,
  onCoffeeChatPublicChange,
  onEdit,
  researchProfile,
}: {
  isCoffeeChatPublic: boolean;
  onCoffeeChatPublicChange: (checked: boolean) => void;
  onEdit?: () => void;
  researchProfile: MemberResearchProfile;
}) {
  return (
    <article className="flex flex-col gap-3 rounded-[var(--radius-2xl)] bg-bg-default px-4 py-3.5 shadow-[0_4px_16px_var(--color-opacity-black-10)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="truncate text-[length:var(--font-size-headline2)] font-semibold leading-[1.4] tracking-[-0.01em] text-text-default">
          {researchProfile.laboratoryName}
        </h2>
        <span className="shrink-0 text-[length:var(--font-size-caption1)] leading-[1.5] text-text-subtle">
          {researchProfile.registeredAtLabel} 등록
        </span>
      </div>
      <ResearchActivityTags filled tags={researchProfile.tags} />
      <div className="border-t border-button-tertiary py-[7px]">
        <CoffeeChatVisibility
          checked={isCoffeeChatPublic}
          onChange={onCoffeeChatPublicChange}
        />
      </div>
      <ProfileEditButton label="정보 수정" onClick={onEdit} />
    </article>
  );
}

function CoffeeChatVisibility({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[length:var(--font-size-headline2)] font-semibold leading-[1.4] tracking-[-0.01em] text-text-subtle md:text-[length:var(--font-size-body2)] md:font-medium md:leading-[1.5] md:tracking-normal md:text-text-default">
        커피챗 공개
      </span>
      <Toggle
        checked={checked}
        className="sr-only"
        onChange={(event) => onChange(event.target.checked)}
      >
        커피챗 공개 여부
      </Toggle>
    </div>
  );
}

function ProfileEditButton({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <Button
      className="!h-8 w-full !rounded-[var(--radius-md)] !px-2 !text-[length:var(--font-size-body3)] md:mt-3 md:!text-[length:var(--font-size-body2)] md:!font-semibold"
      onClick={onClick}
      size="sm"
      type="button"
      variant="outline"
    >
      {label}
    </Button>
  );
}

function WithdrawalButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="cursor-pointer text-[length:var(--font-size-caption1)] leading-[1.5] text-text-subtlest underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary md:mt-4"
      onClick={onClick}
      type="button"
    >
      회원탈퇴
    </button>
  );
}

export function MemberProfilePanel({
  initialWithdrawalDialogOpen = false,
  onChangeResearcherStatus,
  onEdit,
  onLogout,
  onWithdraw,
  profile,
}: MemberProfilePanelProps) {
  const router = useRouter();
  const [isCoffeeChatPublic, setIsCoffeeChatPublic] = useState(
    profile.researchProfile?.coffeeChatPublic ?? false,
  );
  const [isWithdrawalDialogOpen, setIsWithdrawalDialogOpen] = useState(
    initialWithdrawalDialogOpen,
  );
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [logoutError, setLogoutError] = useState<string>();
  const [withdrawalError, setWithdrawalError] = useState<string>();

  async function handleLogout() {
    if (isLoggingOut || isWithdrawing) return;

    setLogoutError(undefined);
    setIsLoggingOut(true);

    if (onLogout) {
      await onLogout();
      setIsLoggingOut(false);
      return;
    }

    const result = await logout();

    if (result.ok) {
      router.replace("/login");
      router.refresh();
      return;
    }

    setLogoutError(result.message);
    setIsLoggingOut(false);
  }

  const sharedProps: ProfileViewProps = {
    isCoffeeChatPublic,
    isLoggingOut,
    logoutError,
    onChangeResearcherStatus,
    onCoffeeChatPublicChange: setIsCoffeeChatPublic,
    onEdit,
    onLogout: handleLogout,
    onWithdrawalDialogOpen: () => {
      setWithdrawalError(undefined);
      setIsWithdrawalDialogOpen(true);
    },
    profile,
  };

  async function handleWithdraw() {
    if (isWithdrawing || isLoggingOut) return;

    setWithdrawalError(undefined);
    setIsWithdrawing(true);

    if (onWithdraw) {
      await onWithdraw();
      setIsWithdrawing(false);
      setIsWithdrawalDialogOpen(false);
      return;
    }

    const result = await withdrawMember();

    if (result.ok || result.requiresLogin) {
      router.replace("/login");
      router.refresh();
      return;
    }

    setWithdrawalError(result.message);
    setIsWithdrawing(false);
  }

  function closeWithdrawalDialog() {
    if (isWithdrawing) return;

    setWithdrawalError(undefined);
    setIsWithdrawalDialogOpen(false);
  }

  return (
    <>
      <div className="md:hidden">
        <MobileProfileView {...sharedProps} />
      </div>
      <div className="hidden md:block">
        <DesktopProfileView {...sharedProps} />
      </div>

      <Dialog
        isOpen={isWithdrawalDialogOpen}
        onClose={closeWithdrawalDialog}
        title="정말 탈퇴하시겠어요?"
        variant="confirmation"
      >
        <div className="mt-3 flex flex-col gap-3">
          <p className="text-center text-[length:var(--font-size-body3)] leading-[1.5] text-text-subtle">
            탈퇴하면 기록이 모두 삭제되며,
            <br />
            삭제된 데이터는 복구할 수 없어요.
          </p>
          <div className="flex gap-3">
            <Button
              autoFocus
              className="!h-8 flex-1 !rounded-[var(--radius-md)] !px-4 !text-[length:var(--font-size-body3)]"
              disabled={isWithdrawing}
              onClick={closeWithdrawalDialog}
              size="sm"
              type="button"
              variant="tertiary"
            >
              취소
            </Button>
            <Button
              className="!h-8 flex-1 !rounded-[var(--radius-md)] !border-border-error !px-4 !text-[length:var(--font-size-body3)] !text-text-error hover:!bg-[color:var(--color-red-red-50)]"
              isLoading={isWithdrawing}
              onClick={handleWithdraw}
              size="sm"
              type="button"
              variant="outline"
            >
              탈퇴하기
            </Button>
          </div>
          {withdrawalError ? (
            <p
              className="text-center text-[length:var(--font-size-caption1)] text-text-error"
              role="alert"
            >
              {withdrawalError}
            </p>
          ) : null}
        </div>
      </Dialog>
    </>
  );
}
