"use client";

import Image from "next/image";
import { useState } from "react";

import type { MemberProfile } from "@/entities/member";
import { Button, Dialog, Tag, Toggle } from "@/shared/ui";

export type MemberProfilePanelProps = {
  initialWithdrawalDialogOpen?: boolean;
  onEdit?: () => void;
  onLogout?: () => void;
  onWithdraw?: () => void;
  profile: MemberProfile;
};

export function MemberProfilePanel({
  initialWithdrawalDialogOpen = false,
  onEdit,
  onLogout,
  onWithdraw,
  profile,
}: MemberProfilePanelProps) {
  const [isCoffeeChatPublic, setIsCoffeeChatPublic] = useState(
    profile.researchProfile?.coffeeChatPublic ?? false,
  );
  const [isWithdrawalDialogOpen, setIsWithdrawalDialogOpen] = useState(
    initialWithdrawalDialogOpen,
  );

  const researchProfile = profile.researchProfile;

  function handleWithdraw() {
    onWithdraw?.();
    setIsWithdrawalDialogOpen(false);
  }

  return (
    <>
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
            {profile.email}
          </p>
          <p className="mt-0.5 text-[length:var(--font-size-body3)] leading-[1.5] text-text-subtle">
            {profile.accountLabel}
          </p>
          <Tag className="mt-2 !py-0" tone="primary">
            {profile.roleLabel}
          </Tag>
          <Button
            className="mt-5 !h-8 w-full !rounded-[var(--radius-lg)] !px-2 !text-[length:var(--font-size-body2)] !font-semibold"
            onClick={onLogout}
            size="sm"
            type="button"
            variant="outline"
          >
            로그아웃
          </Button>
        </div>

        {researchProfile ? (
          <article className="mt-10 w-full rounded-[var(--radius-md)] border border-border-subtle bg-bg-default px-5 py-2.5">
            <h2 className="text-[length:var(--font-size-heading2)] font-semibold leading-[1.5] text-text-default">
              {researchProfile.laboratoryName}
            </h2>
            <p className="mt-0.5 text-[length:var(--font-size-body3)] leading-[1.5] text-text-subtle">
              {researchProfile.professorName} 교수 · {researchProfile.department}
            </p>
            <p className="mt-2 text-[length:var(--font-size-body3)] leading-[1.5] text-text-subtle">
              {researchProfile.registeredAtLabel} 등록
            </p>

            <ul className="mt-2 flex flex-wrap gap-2" aria-label="연구 활동 정보">
              {researchProfile.tags.map((tag) => (
                <li
                  className="rounded-full border border-border-subtle px-[14px] py-0.5 text-[length:var(--font-size-body3)] leading-[1.5] text-text-subtle"
                  key={tag}
                >
                  {tag}
                </li>
              ))}
            </ul>

            <div className="my-3 border-t border-border-subtle" />

            <div className="flex items-center justify-between">
              <span className="text-[length:var(--font-size-body2)] font-medium leading-[1.5] text-text-default">
                커피챗 공개
              </span>
              <Toggle
                checked={isCoffeeChatPublic}
                className="sr-only"
                onChange={(event) => setIsCoffeeChatPublic(event.target.checked)}
              >
                커피챗 공개 여부
              </Toggle>
            </div>

            <Button
              className="mt-3 !h-8 w-full !rounded-[var(--radius-lg)] !px-2 !text-[length:var(--font-size-body2)] !font-semibold"
              onClick={onEdit}
              size="sm"
              type="button"
              variant="outline"
            >
              정보 수정하기
            </Button>
          </article>
        ) : null}

        <button
          className="mt-4 cursor-pointer text-[length:var(--font-size-caption1)] leading-[1.5] text-text-subtlest underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary"
          onClick={() => setIsWithdrawalDialogOpen(true)}
          type="button"
        >
          회원탈퇴
        </button>
      </section>

      <Dialog
        isOpen={isWithdrawalDialogOpen}
        onClose={() => setIsWithdrawalDialogOpen(false)}
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
              onClick={() => setIsWithdrawalDialogOpen(false)}
              size="sm"
              type="button"
              variant="tertiary"
            >
              취소
            </Button>
            <Button
              className="!h-8 flex-1 !rounded-[var(--radius-md)] !border-border-error !px-4 !text-[length:var(--font-size-body3)] !text-text-error hover:!bg-[color:var(--color-red-red-50)]"
              onClick={handleWithdraw}
              size="sm"
              type="button"
              variant="outline"
            >
              탈퇴하기
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
