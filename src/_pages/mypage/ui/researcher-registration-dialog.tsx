"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { SelectedLabCard, type LabSummary } from "@/entities/lab";
import {
  searchOnboardingLaboratories,
  type OnboardingReviewOptions,
} from "@/features/onboarding";
import { LabSearchCombobox } from "@/features/search-lab";
import { EXTERNAL_LINKS } from "@/shared/config";
import { Button, Dialog, Radio, useToast } from "@/shared/ui";

export type ResearcherRegistrationDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  reviewOptions?: Pick<OnboardingReviewOptions, "coreTime" | "weeklyMeeting">;
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

function ChoiceGroup({
  disabled,
  label,
  name,
  onChange,
  options,
  value,
}: {
  disabled: boolean;
  label: string;
  name: string;
  onChange: (value: string) => void;
  options: string[];
  value: string;
}) {
  return (
    <fieldset className="flex flex-col gap-[var(--spacing-spacing-2)]">
      <legend className={`${LABEL_CLASSES} mb-[var(--spacing-spacing-2)]`}>{label}</legend>
      <div className="flex flex-wrap gap-[var(--spacing-spacing-2)]">
        {options.map((option) => (
          <Radio
            appearance="chip"
            checked={value === option}
            disabled={disabled}
            key={option}
            name={name}
            onChange={() => onChange(option)}
            value={option}
          >
            {option}
          </Radio>
        ))}
      </div>
    </fieldset>
  );
}

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
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const busy = useRef(false);
  const canSubmit = Boolean(selectedLab && coreTime && weeklyMeeting) && !isPending;

  function reset() {
    setSelectedLab(null);
    setCoreTime("");
    setWeeklyMeeting("");
    setErrorMessage("");
  }

  function handleClose() {
    if (busy.current) return;
    reset();
    onClose();
  }

  async function handleSubmit() {
    if (busy.current || !selectedLab || !coreTime || !weeklyMeeting) return;
    busy.current = true;
    setIsPending(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/member/researcher", {
        body: JSON.stringify({
          coreTime,
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
        // 등록은 됐지만 코어타임·미팅 저장에 실패한 경우: 등록 상태를 반영하고 다시 입력할 곳을 안내한다.
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
      className="max-w-[520px] rounded-[var(--radius-3xl)] border-0"
      description="연구실을 고르면 학부연구생으로 저장돼요."
      headerLayout="form"
      isOpen={isOpen}
      onClose={handleClose}
      title="소속 연구실을 알려주세요"
    >
      <div className="flex flex-col gap-[var(--spacing-spacing-4)] px-6 pb-6 pt-[var(--spacing-spacing-4)] md:px-9 md:pb-9">
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
            <ChoiceGroup
              disabled={isPending}
              label="코어타임"
              name="researcher-core-time"
              onChange={setCoreTime}
              options={reviewOptions.coreTime}
              value={coreTime}
            />
            <ChoiceGroup
              disabled={isPending}
              label="미팅 빈도"
              name="researcher-weekly-meeting"
              onChange={setWeeklyMeeting}
              options={reviewOptions.weeklyMeeting}
              value={weeklyMeeting}
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
            정보 제공하기
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
