"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { MemberResearchProfile } from "@/entities/member";
import { Button, Dialog } from "@/shared/ui";

export function ResearchReviewEditor({
  research,
  onClose,
}: {
  research: MemberResearchProfile;
  onClose: () => void;
}) {
  const router = useRouter();
  const [coreTime, setCoreTime] = useState(research.review?.coreTime ?? "");
  const [weeklyMeeting, setWeeklyMeeting] = useState(
    research.review?.weeklyMeeting ?? "",
  );
  const [doings, setDoings] = useState(
    research.review?.doings.join(", ") ?? "",
  );
  const [pending, setPending] = useState(false),
    [error, setError] = useState("");
  const busy = useRef(false);
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/member/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coreTime,
          weeklyMeeting,
          doings: doings
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        }),
      });
      const body = await response.json();
      if (response.status === 401) router.push("/login");
      if (!response.ok)
        throw new Error(body.message || "연구실 정보를 저장하지 못했어요.");
      router.refresh();
      onClose();
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "연구실 정보를 저장하지 못했어요.",
      );
    } finally {
      busy.current = false;
      setPending(false);
    }
  }
  return (
    <Dialog
      isOpen
      title="연구실 정보 수정"
      onClose={() => {
        if (!busy.current) onClose();
      }}
    >
      <form onSubmit={save} className="flex flex-col gap-4 p-6">
        {(
          [
            ["코어타임", coreTime, setCoreTime],
            ["주간 미팅", weeklyMeeting, setWeeklyMeeting],
            ["하는 일 (쉼표로 구분)", doings, setDoings],
          ] as const
        ).map(([label, value, setter], index) => (
          <label
            key={label}
            className="flex flex-col gap-2 text-sm text-text-subtle"
          >
            {label}
            <input
              autoFocus={index === 0}
              required
              maxLength={index < 2 ? 30 : 1000}
              value={value}
              disabled={pending}
              onChange={(event) => setter(event.target.value)}
              className="h-11 rounded-lg border border-border-primary px-3 text-text-default focus-visible:outline-2 focus-visible:outline-border-primary"
            />
          </label>
        ))}
        {error ? (
          <p role="alert" className="text-sm text-text-error">
            {error}
          </p>
        ) : null}
        <Button type="submit" isLoading={pending}>
          저장
        </Button>
      </form>
    </Dialog>
  );
}
