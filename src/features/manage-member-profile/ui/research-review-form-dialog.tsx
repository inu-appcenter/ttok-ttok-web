"use client";

import type { ReactNode } from "react";
import { Button, ChoiceChipGroup, Dialog } from "@/shared/ui";
import {
  MAX_REVIEW_DOINGS,
  type ResearchReviewOptions,
} from "../model/review-options";

export type ResearchReviewValue = {
  coreTime: string;
  doings: string[];
  weeklyMeeting: string;
};

export type ResearchReviewFormDialogProps = {
  canSubmit: boolean;
  /** 리뷰 선택지 앞에 붙는 입력. 예: 학부연구생 등록의 연구실 검색 */
  children?: ReactNode;
  /** PC 모달에서만 보이는 설명. 모바일 바텀시트에서는 숨긴다. */
  description?: string;
  errorMessage?: string;
  isOpen: boolean;
  isPending: boolean;
  name: string;
  onChange: (value: ResearchReviewValue) => void;
  onClose: () => void;
  onSubmit: () => void;
  reviewOptions?: ResearchReviewOptions;
  reviewOptionsError?: string;
  submitLabel: string;
  title: string;
  value: ResearchReviewValue;
};

/** 학부연구생 등록과 연구실 정보 수정이 함께 쓰는 모달(PC)·바텀시트(모바일) 폼 */
export function ResearchReviewFormDialog({
  canSubmit,
  children,
  description,
  errorMessage,
  isOpen,
  isPending,
  name,
  onChange,
  onClose,
  onSubmit,
  reviewOptions,
  reviewOptionsError,
  submitLabel,
  title,
  value,
}: ResearchReviewFormDialogProps) {
  return (
    <Dialog
      className="md:max-w-[520px] md:rounded-[var(--radius-3xl)] md:border-0"
      description={description}
      headerLayout="form"
      isOpen={isOpen}
      mobileBottomSheet
      onClose={onClose}
      title={title}
    >
      <div className="flex flex-col gap-[var(--spacing-spacing-4)] px-[var(--spacing-spacing-5)] pt-[var(--spacing-spacing-4)] md:px-9 md:pb-9">
        {children}
        {reviewOptions ? (
          <>
            <ChoiceChipGroup
              disabled={isPending}
              label="코어타임"
              name={`${name}-core-time`}
              onChange={(coreTime) => onChange({ ...value, coreTime })}
              options={reviewOptions.coreTime}
              value={value.coreTime}
            />
            <ChoiceChipGroup
              disabled={isPending}
              label="미팅 빈도"
              name={`${name}-weekly-meeting`}
              onChange={(weeklyMeeting) => onChange({ ...value, weeklyMeeting })}
              options={reviewOptions.weeklyMeeting}
              value={value.weeklyMeeting}
            />
            <ChoiceChipGroup
              disabled={isPending}
              hint={`최대 ${MAX_REVIEW_DOINGS}개까지 선택할 수 있어요`}
              label="주로 하는 일"
              maxSelected={MAX_REVIEW_DOINGS}
              multiple
              name={`${name}-doings`}
              onChange={(doings) => onChange({ ...value, doings })}
              options={reviewOptions.works}
              value={value.doings}
            />
          </>
        ) : (
          <p
            className="text-[length:var(--font-size-body3)] text-text-error"
            role="alert"
          >
            {reviewOptionsError ??
              "선택지를 불러오지 못했어요. 새로고침 후 다시 시도해주세요."}
          </p>
        )}
        {errorMessage ? (
          <p
            className="text-[length:var(--font-size-body3)] text-text-error"
            role="alert"
          >
            {errorMessage}
          </p>
        ) : null}
        <div className="flex gap-[var(--spacing-spacing-3)]">
          <Button
            className="flex-1"
            disabled={isPending}
            onClick={onClose}
            variant="tertiary"
          >
            취소
          </Button>
          <Button
            className="flex-1"
            disabled={!canSubmit || isPending}
            isLoading={isPending}
            onClick={onSubmit}
          >
            {submitLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

/** 하는 일 1~3개와 코어타임·미팅 빈도를 모두 골랐는지 확인한다. */
export function isResearchReviewComplete(value: ResearchReviewValue) {
  return Boolean(
    value.coreTime &&
      value.weeklyMeeting &&
      value.doings.length > 0 &&
      value.doings.length <= MAX_REVIEW_DOINGS,
  );
}
