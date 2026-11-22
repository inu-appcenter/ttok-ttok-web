"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { SelectedLabCard, type LabSummary } from "@/entities/lab";
import {
  searchOnboardingLaboratories,
  type OnboardingReviewOptions,
} from "@/features/onboarding";
import { MAX_REVIEW_DOINGS } from "@/features/manage-member-profile";
import { LabSearchCombobox } from "@/features/search-lab";
import { EXTERNAL_LINKS } from "@/shared/config";
import { Button, ChoiceChipGroup, Dialog, useToast } from "@/shared/ui";

export type ResearcherRegistrationDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  reviewOptions?: OnboardingReviewOptions;
  reviewOptionsError?: string;
};

type RegistrationResponse = {
  message?: string;
  ok?: boolean;
  registered?: boolean;
};

function toRegistrationResponse(value: unknown): RegistrationResponse {
  if (!value || typeof value !== "object") return {};
  return {
    message: "message" in value && typeof value.message === "string" ? value.message : undefined,
    ok: "ok" in value && value.ok === true,
    registered: "registered" in value && value.registered === true,
  };
}

const LABEL_CLASSES =
  "text-[length:var(--font-size-label1)] font-semibold leading-[1.5] text-text-default";

export function ResearcherRegistrationDialog({
  isOpen,
  onClose,
  reviewOptions,
  reviewOptionsError,
}: ResearcherRegistrationDialogProps) {
  const router = useRouter();
  const showToast = useToast();
  const [selectedLab, setSelectedLab] = useState<LabSummary | null>(null);
  const [coreTime, setCoreTime] = useState("");
  const [weeklyMeeting, setWeeklyMeeting] = useState("");
  const [doings, setDoings] = useState<string[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const busy = useRef(false);
  const canSubmit = Boolean(selectedLab && coreTime && weeklyMeeting && doings.length > 0) && !isPending;

  function reset() {
    setSelectedLab(null);
    setCoreTime("");
    setWeeklyMeeting("");
    setDoings([]);
    setErrorMessage("");
  }

  function handleClose() {
    if (busy.current) return;
    reset();
    onClose();
  }

  async function handleSubmit() {
    if (busy.current || !selectedLab || !coreTime || !weeklyMeeting || doings.length === 0) return;
    busy.current = true;
    setIsPending(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/member/researcher", {
        body: JSON.stringify({
          coreTime,
          doings,
          laboratoryId: selectedLab.laboratoryId,
          weeklyMeeting,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const result = toRegistrationResponse(await response.json().catch(() => null));
      if (response.status === 401) {
        router.replace("/login");
        router.refresh();
        return;
      }
      if (response.ok && result.ok) {
        reset();
        onClose();
        showToast({ state: "success", title: "학부연구생으로 등록했어요." });
        router.refresh();
        return;
      }
      if (result.registered) {
        // 등록은 됐지만 코어타임·미팅·하는 일 저장에 실패한 경우: 등록 상태를 반영하고 다시 입력할 곳을 안내한다.
        reset();
        onClose();
        showToast({
          description: result.message,
          state: "warning",
          title: "학부연구생으로 등록했어요.",
        });
        router.refresh();
        return;
      }
      setErrorMessage(result.message ?? "등록하지 못했어요. 다시 시도해주세요.");
    } catch {
      setErrorMessage("등록하지 못했어요. 다시 시도해주세요.");
    } finally {
      busy.current = false;
      setIsPending(false);
    }
  }

  return (
    <Dialog
      className="md:max-w-[520px] md:rounded-[var(--radius-3xl)] md:border-0"
      description="연구실을 고르면 학부연구생으로 저장돼요."
      headerLayout="form"
      isOpen={isOpen}
      mobileBottomSheet
      onClose={handleClose}
      title="소속 연구실을 알려주세요"
    >
      <div className="flex flex-col gap-[var(--spacing-spacing-4)] px-[var(--spacing-spacing-5)] pt-[var(--spacing-spacing-4)] md:px-9 md:pb-9">
        <div className="flex flex-col gap-[var(--spacing-spacing-2)]">
          <p className={LABEL_CLASSES}>연구실 정보</p>
          <LabSearchCombobox
            className="!max-w-none"
            clearQueryOnSelect
            emptyContent={
              <p className="flex flex-wrap items-center gap-1 px-[var(--spacing-spacing-5)] py-[14px] text-[length:var(--font-size-body3)] leading-[1.5]">
                <span className="text-text-subtlest">찾는 연구실이 없나요?</span>
                <a
                  className="rounded-sm text-text-subtle underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary"
                  href={EXTERNAL_LINKS.report}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  제보하기
                </a>
              </p>
            }
            onSearch={searchOnboardingLaboratories}
            onSelect={setSelectedLab}
            overlayResults
            placeholder="연구실 이름을 입력해주세요."
            selectedLabId={selectedLab?.labId}
          />
          {selectedLab ? <SelectedLabCard className="" lab={selectedLab} /> : null}
        </div>
        {reviewOptions ? (
          <>
            <ChoiceChipGroup
              disabled={isPending}
              label="코어타임"
              name="researcher-core-time"
              onChange={setCoreTime}
              options={reviewOptions.coreTime}
              value={coreTime}
            />
            <ChoiceChipGroup
              disabled={isPending}
              label="미팅 빈도"
              name="researcher-weekly-meeting"
              onChange={setWeeklyMeeting}
              options={reviewOptions.weeklyMeeting}
              value={weeklyMeeting}
            />
            <ChoiceChipGroup
              disabled={isPending}
              hint={`최대 ${MAX_REVIEW_DOINGS}개까지 선택할 수 있어요`}
              label="주로 하는 일"
              maxSelected={MAX_REVIEW_DOINGS}
              multiple
              name="researcher-doings"
              onChange={setDoings}
              options={reviewOptions.works}
              value={doings}
            />
          </>
        ) : (
          <p className="text-[length:var(--font-size-body3)] text-text-error" role="alert">
            {reviewOptionsError ?? "선택지를 불러오지 못했어요. 새로고침 후 다시 시도해주세요."}
          </p>
        )}
        {errorMessage ? (
          <p className="text-[length:var(--font-size-body3)] text-text-error" role="alert">
            {errorMessage}
          </p>
        ) : null}
        <div className="flex gap-[var(--spacing-spacing-3)]">
          <Button className="flex-1" disabled={isPending} onClick={handleClose} variant="tertiary">
            취소
          </Button>
          <Button
            className="flex-1"
            disabled={!canSubmit}
            isLoading={isPending}
            onClick={() => void handleSubmit()}
          >
            학부연구생으로 저장
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
