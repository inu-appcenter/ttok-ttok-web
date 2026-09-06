"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";

import type { LabDetail } from "@/entities/lab";
import {
  Button,
  Checkbox,
  Dialog,
  Field,
  Radio,
  Textarea,
  Toast,
} from "@/shared/ui";

function SubmissionToast({
  onDismiss,
  title,
}: {
  onDismiss: () => void;
  title: string;
}) {
  useEffect(() => {
    const timeout = window.setTimeout(onDismiss, 3000);
    return () => window.clearTimeout(timeout);
  }, [onDismiss]);

  return (
    <div className="fixed left-1/2 top-3 z-[120] -translate-x-1/2">
      <Toast state="success" title={title} />
    </div>
  );
}

export function LabContactCard({
  contact,
  isAuthenticated = false,
}: {
  contact: LabDetail["contact"];
  isAuthenticated?: boolean;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const hasContact = Boolean(
    contact.email || contact.openChatUrl || contact.members.length,
  );

  return (
    <>
      <section className="w-full rounded-[var(--radius-2xl)] bg-bg-default px-4 py-[14px] shadow-[0_4px_16px_var(--color-opacity-black-10)] md:px-0 md:py-2">
        <h2 className="text-[length:var(--font-size-label1)] font-semibold leading-[1.5] text-text-default md:px-[15px] md:text-[length:var(--font-size-heading2)] md:font-bold md:text-text-subtle">
          커피챗
        </h2>
        {!hasContact ? (
          <p className="mt-[10px] py-1 text-[length:var(--font-size-caption1)] leading-[1.5] text-text-subtle md:px-4">
            공개된 연락처가 아직 없어요.
          </p>
        ) : isAuthenticated ? (
          <ul className="mt-[10px] flex flex-col text-[length:var(--font-size-caption1)] leading-[1.5] text-text-subtle md:px-4">
            {contact.members.map((member) => (
              <li className="flex items-center justify-between gap-4 border-b border-border-subtlest py-1 last:border-0" key={member.name}>
                <span>{member.name}</span>
                {member.url ? (
                  <a className="text-text-primary hover:underline" href={member.url} rel="noreferrer" target="_blank">
                    {member.contact}
                  </a>
                ) : (
                  <span className="text-text-primary">{member.contact}</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="relative mt-[10px] flex min-h-[62px] items-center justify-center overflow-hidden py-[10px] md:mx-4">
            <div
              aria-hidden="true"
              className="text-[length:var(--font-size-label1)] font-semibold leading-[1.5] text-text-subtle blur-[2px]"
            >
              <p>오픈채팅 · {contact.openChatUrl}</p>
              <p>이메일 · {contact.email}</p>
            </div>
            <Button
              className="absolute !h-8 !rounded-[var(--radius-md)] !px-4 !text-[length:var(--font-size-body3)]"
              onClick={() => setIsDialogOpen(true)}
              size="sm"
            >
              로그인하고 연락처 보기
            </Button>
          </div>
        )}
      </section>

      <Dialog
        className="max-w-[418px]"
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="로그인 필요"
      >
        <div className="flex flex-col items-center px-6 pb-[30px] pt-[30px] text-center">
          <p className="text-[24px] font-semibold leading-[1.22] text-text-primary">
            커피챗 연락처를 보려면
            <br />
            로그인이 필요해요
          </p>
          <Link
            className="mt-[34px] inline-flex min-h-10 w-full items-center justify-center rounded-[var(--radius-md)] bg-bg-primary px-4 py-2 text-[length:var(--font-size-heading2)] font-semibold leading-[1.5] text-text-inverse transition-colors hover:bg-bg-primary-hover active:bg-bg-primary-press focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary"
            href="/login"
          >
            인천대학교 포털 로그인 ↗
          </Link>
          <p className="mt-[22px] text-[length:var(--font-size-label1)] font-medium leading-[1.5] text-text-subtle">
            로그인 후 지금 화면으로 돌아와요.
          </p>
        </div>
      </Dialog>
    </>
  );
}

const CORE_TIME_OPTIONS = ["있음", "없음"];
const MEETING_OPTIONS = ["주 2회 이상", "주 1회", "격주", "월 1회 이하", "없음"];
const TASK_OPTIONS = ["논문 리딩", "실험/코딩", "데이터 라벨링", "세미나 발표", "과제 참여"];

export function ProvideLabInfoCard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [toastTitle, setToastTitle] = useState("");
  const [coreTime, setCoreTime] = useState("");
  const [meetingFrequency, setMeetingFrequency] = useState("");
  const [tasks, setTasks] = useState<string[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  function resetForm() {
    setCoreTime("");
    setMeetingFrequency("");
    setTasks([]);
    setHasSubmitted(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasSubmitted(true);

    if (!coreTime || !meetingFrequency || tasks.length === 0) return;

    setIsDialogOpen(false);
    resetForm();
    setToastTitle("정보 제공이 완료되었습니다");
  }

  return (
    <>
      <button
        className="flex w-full cursor-pointer flex-col items-center justify-center rounded-[var(--radius-2xl)] border border-border-primary bg-bg-default px-3 py-2 text-center transition-colors hover:bg-bg-primary-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary"
        onClick={() => setIsDialogOpen(true)}
        type="button"
      >
        <span className="text-[length:var(--font-size-body3)] leading-[1.5] text-text-subtle">
          이 랩 학부연구생이신가요?
        </span>
        <strong className="text-[22px] leading-[1.3] tracking-[-0.02em] text-text-primary">
          정보 제공하기
        </strong>
      </button>

      <Dialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          resetForm();
        }}
        title="정보 제공하기"
      >
        <form className="px-7 pb-[30px]" noValidate onSubmit={handleSubmit}>
          <p className="pt-[18px] text-center text-[24px] font-semibold leading-[1.5] text-text-primary">
            랩 생활을 알려주세요
          </p>
          <div className="mt-[30px] flex flex-col gap-5">
            <fieldset>
              <legend className="mb-1 text-[length:var(--font-size-heading2)] font-medium leading-[1.5] text-text-subtle">
                코어타임
              </legend>
              <div className="flex flex-wrap gap-2">
                {CORE_TIME_OPTIONS.map((option) => (
                  <Radio
                    appearance="chip"
                    checked={coreTime === option}
                    key={option}
                    name="coreTime"
                    onChange={() => setCoreTime(option)}
                    value={option}
                  >
                    {option}
                  </Radio>
                ))}
              </div>
              {hasSubmitted && !coreTime ? (
                <p className="mt-1 text-[length:var(--font-size-caption1)] text-text-error" role="alert">
                  코어타임 여부를 선택해 주세요.
                </p>
              ) : null}
            </fieldset>

            <fieldset>
              <legend className="mb-1 text-[length:var(--font-size-heading2)] font-medium leading-[1.5] text-text-subtle">
                주간 미팅 빈도
              </legend>
              <div className="flex flex-wrap gap-2">
                {MEETING_OPTIONS.map((option) => (
                  <Radio
                    appearance="chip"
                    checked={meetingFrequency === option}
                    key={option}
                    name="meetingFrequency"
                    onChange={() => setMeetingFrequency(option)}
                    value={option}
                  >
                    {option}
                  </Radio>
                ))}
              </div>
              {hasSubmitted && !meetingFrequency ? (
                <p className="mt-1 text-[length:var(--font-size-caption1)] text-text-error" role="alert">
                  미팅 빈도를 선택해 주세요.
                </p>
              ) : null}
            </fieldset>

            <fieldset>
              <legend className="mb-1 flex items-center gap-2 text-[length:var(--font-size-heading2)] font-medium leading-[1.5] text-text-subtle">
                주로 하는 일
                <span className="text-[length:var(--font-size-label1)]">복수 선택</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {TASK_OPTIONS.map((option) => (
                  <Checkbox
                    appearance="chip"
                    checked={tasks.includes(option)}
                    key={option}
                    name="tasks"
                    onChange={(event) => {
                      setTasks((currentTasks) =>
                        event.target.checked
                          ? [...currentTasks, option]
                          : currentTasks.filter((task) => task !== option),
                      );
                    }}
                    value={option}
                  >
                    {option}
                  </Checkbox>
                ))}
              </div>
              {hasSubmitted && tasks.length === 0 ? (
                <p className="mt-1 text-[length:var(--font-size-caption1)] text-text-error" role="alert">
                  주로 하는 일을 한 개 이상 선택해 주세요.
                </p>
              ) : null}
            </fieldset>
          </div>
          <Button className="mt-[30px] !h-10 w-full !font-semibold" type="submit">
            완료
          </Button>
        </form>
      </Dialog>

      {toastTitle ? (
        <SubmissionToast onDismiss={() => setToastTitle("")} title={toastTitle} />
      ) : null}
    </>
  );
}

const REPORT_CATEGORIES = ["허위 정보", "버그 / 오류", "기타"];

export function ReportLabButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [toastTitle, setToastTitle] = useState("");
  const [category, setCategory] = useState("허위 정보");
  const [detail, setDetail] = useState("");
  const [email, setEmail] = useState("");
  const [detailError, setDetailError] = useState("");
  const [emailError, setEmailError] = useState("");

  function resetForm() {
    setCategory("허위 정보");
    setDetail("");
    setEmail("");
    setDetailError("");
    setEmailError("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextDetailError = detail.trim() ? "" : "상세 내용을 작성해 주세요.";
    const nextEmailError =
      email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ? "올바른 이메일 주소를 입력해 주세요."
        : "";

    setDetailError(nextDetailError);
    setEmailError(nextEmailError);
    if (nextDetailError || nextEmailError) return;

    setIsDialogOpen(false);
    resetForm();
    setToastTitle("접수가 완료되었습니다");
  }

  return (
    <>
      <button
        className="cursor-pointer text-[length:var(--font-size-body3)] leading-[1.5] text-text-subtlest underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary"
        onClick={() => setIsDialogOpen(true)}
        type="button"
      >
        이 정보가 잘못되었나요? 제보하기
      </button>

      <Dialog
        isOpen={isDialogOpen}
        mobileBottomSheet
        onClose={() => {
          setIsDialogOpen(false);
          resetForm();
        }}
        title="제보하기"
      >
        <form className="flex flex-col gap-[19px] px-5 pb-5 pt-[19px]" noValidate onSubmit={handleSubmit}>
          <fieldset>
            <legend className="mb-1 text-[length:var(--font-size-label1)] font-semibold leading-[1.5] text-text-default">
              카테고리
            </legend>
            <div className="flex flex-wrap gap-3">
              {REPORT_CATEGORIES.map((option) => (
                <Radio
                  appearance="chip"
                  checked={category === option}
                  key={option}
                  name="reportCategory"
                  onChange={() => setCategory(option)}
                  value={option}
                >
                  {option}
                </Radio>
              ))}
            </div>
          </fieldset>
          <Textarea
            error={detailError}
            label="상세 내용"
            onChange={(event) => {
              setDetail(event.target.value);
              if (detailError) setDetailError("");
            }}
            placeholder="상세 내용을 작성해 주세요"
            value={detail}
          />
          <Field
            error={emailError}
            label="이메일 (선택)"
            onChange={(event) => {
              setEmail(event.target.value);
              if (emailError) setEmailError("");
            }}
            placeholder="답변 받을 메일을 작성해 주세요"
            type="email"
            value={email}
          />
          <Button className="!h-10 w-full !font-semibold" type="submit">
            접수하기
          </Button>
        </form>
      </Dialog>

      {toastTitle ? (
        <SubmissionToast onDismiss={() => setToastTitle("")} title={toastTitle} />
      ) : null}
    </>
  );
}
