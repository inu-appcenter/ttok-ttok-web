"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { MemberResearchProfile } from "@/entities/member";
import { useLoginRequiredRedirect } from "@/shared/lib/auth/login-required";
import { useToast } from "@/shared/ui";
import type { ResearchReviewOptions } from "../model/review-options";
import {
  isResearchReviewComplete,
  ResearchReviewFormDialog,
  type ResearchReviewValue,
} from "./research-review-form-dialog";

const SAVE_FAILED_MESSAGE = "연구실 정보를 저장하지 못했어요. 다시 시도해주세요.";

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
  const [value, setValue] = useState<ResearchReviewValue>({
    coreTime: research.review?.coreTime ?? "",
    doings: research.review?.doings ?? [],
    weeklyMeeting: research.review?.weeklyMeeting ?? "",
  });
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const busy = useRef(false);

  function handleClose() {
    if (!busy.current) onClose();
  }

  async function handleSubmit() {
    if (busy.current || !reviewOptions || !isResearchReviewComplete(value))
      return;
    busy.current = true;
    setIsPending(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/member/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value),
      });
      const body: unknown = await response.json().catch(() => null);
      if (response.status === 401) {
        redirectToLogin();
        return;
      }
      if (!response.ok) {
        setErrorMessage(toMessage(body) ?? SAVE_FAILED_MESSAGE);
        return;
      }
      showToast({ state: "success", title: "연구실 정보를 저장했어요." });
      router.refresh();
      onClose();
    } catch {
      setErrorMessage(SAVE_FAILED_MESSAGE);
    } finally {
      busy.current = false;
      setIsPending(false);
    }
  }

  return (
    <ResearchReviewFormDialog
      canSubmit={Boolean(reviewOptions) && isResearchReviewComplete(value)}
      description="학부연구생으로 제공한 연구실 정보를 수정할 수 있어요."
      errorMessage={errorMessage}
      isOpen
      isPending={isPending}
      name="review"
      onChange={setValue}
      onClose={handleClose}
      onSubmit={() => void handleSubmit()}
      reviewOptions={reviewOptions}
      reviewOptionsError={reviewOptionsError}
      submitLabel="저장"
      title="연구실 정보 수정"
      value={value}
    />
  );
}
