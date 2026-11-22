"use client";
import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { MemberResearchProfile } from "@/entities/member";
import { useLoginRequiredRedirect } from "@/shared/lib/auth/login-required";
import { Button, ChoiceChipGroup, Dialog, useToast } from "@/shared/ui";
import {
  MAX_REVIEW_DOINGS,
  type ResearchReviewOptions,
} from "../model/review-options";

const SAVE_FAILED_MESSAGE = "연구실 정보를 저장하지 못했어요.";

function toMessage(value: unknown) {
  return value &&
    typeof value === "object" &&
    "message" in value &&
    typeof value.message === "string"
    ? value.message
    : null;
}

export function ResearchReviewEditor({
  research,
  onClose,
  reviewOptions,
  reviewOptionsError,
}: {
  research: MemberResearchProfile;
  onClose: () => void;
  reviewOptions?: ResearchReviewOptions;
  reviewOptionsError?: string;
}) {
  const router = useRouter();
  const showToast = useToast();
  const redirectToLogin = useLoginRequiredRedirect();
  // 저장된 값이 현재 선택지에 없어도 칩 그룹이 덧붙여 보여주므로 그대로 미리 선택한다.
  const [coreTime, setCoreTime] = useState(research.review?.coreTime ?? "");
  const [weeklyMeeting, setWeeklyMeeting] = useState(
    research.review?.weeklyMeeting ?? "",
  );
  const [doings, setDoings] = useState<string[]>(
    research.review?.doings ?? [],
  );
  const [pending, setPending] = useState(false),
    [error, setError] = useState("");
  const busy = useRef(false);
  const canSave =
    Boolean(reviewOptions && coreTime && weeklyMeeting) &&
    doings.length > 0 &&
    doings.length <= MAX_REVIEW_DOINGS &&
    !pending;

  function handleClose() {
    if (!busy.current) onClose();
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (busy.current || !canSave) return;
    busy.current = true;
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/member/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coreTime, weeklyMeeting, doings }),
      });
      const body: unknown = await response.json().catch(() => null);
      if (response.status === 401) {
        redirectToLogin();
        return;
      }
      if (!response.ok) throw new Error(toMessage(body) ?? SAVE_FAILED_MESSAGE);
      showToast({ state: "success", title: "연구실 정보를 저장했어요." });
      router.refresh();
      onClose();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : SAVE_FAILED_MESSAGE);
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  return (
    <Dialog
      className="md:max-w-[520px] md:rounded-[var(--radius-3xl)] md:border-0"
      headerLayout="form"
      isOpen
      mobileBottomSheet
      onClose={handleClose}
      title="연구실 정보 수정"
    >
      <form
        className="flex flex-col gap-[var(--spacing-spacing-4)] px-[var(--spacing-spacing-5)] pt-[var(--spacing-spacing-4)] md:px-9 md:pb-9"
        noValidate
        onSubmit={handleSubmit}
      >
        {reviewOptions ? null : (
          <p
            className="text-[length:var(--font-size-body3)] text-text-error"
            role="alert"
          >
            {reviewOptionsError ??
              "선택지를 불러오지 못했어요. 새로고침 후 다시 시도해주세요."}
          </p>
        )}
        <ChoiceChipGroup
          disabled={pending || !reviewOptions}
          label="코어타임"
          name="review-core-time"
          onChange={setCoreTime}
          options={reviewOptions?.coreTime ?? []}
          value={coreTime}
        />
        <ChoiceChipGroup
          disabled={pending || !reviewOptions}
          label="미팅 빈도"
          name="review-weekly-meeting"
          onChange={setWeeklyMeeting}
          options={reviewOptions?.weeklyMeeting ?? []}
          value={weeklyMeeting}
        />
        <ChoiceChipGroup
          disabled={pending || !reviewOptions}
          hint={`최대 ${MAX_REVIEW_DOINGS}개까지 선택할 수 있어요`}
          label="주로 하는 일"
          maxSelected={MAX_REVIEW_DOINGS}
          multiple
          name="review-doings"
          onChange={setDoings}
          options={reviewOptions?.works ?? []}
          value={doings}
        />
        {error ? (
          <p
            className="text-[length:var(--font-size-body3)] text-text-error"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        <div className="flex gap-[var(--spacing-spacing-3)]">
          <Button
            className="flex-1"
            disabled={pending}
            onClick={handleClose}
            type="button"
            variant="tertiary"
          >
            취소
          </Button>
          <Button
            className="flex-1"
            disabled={!canSave}
            isLoading={pending}
            type="submit"
          >
            저장
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
