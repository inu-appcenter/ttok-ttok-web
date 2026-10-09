"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { Button, Dialog, Field, Radio, Textarea } from "@/shared/ui";

import {
  createMockEmailDraft,
  EMAIL_PURPOSES,
  EMPTY_EMAIL_INPUT,
  formatPhone,
  validateEmailInput,
} from "../model/email-draft";
import type {
  EmailDraft,
  EmailInput,
  EmailRecipient,
} from "../model/email-draft";

export type ContactEmailComposerProps = {
  recipient: EmailRecipient;
  isOpen: boolean;
  onClose: () => void;
  initialInput?: EmailInput;
  initialDraft?: EmailDraft;
};
const copyClass =
  "shrink-0 cursor-pointer rounded-full border border-[#d4e1f4] bg-bg-primary-subtle px-3 py-1 text-[14px] font-semibold text-text-primary focus-visible:outline-2 focus-visible:outline-border-primary disabled:cursor-not-allowed disabled:opacity-50";

export function ContactEmailComposer({
  recipient,
  isOpen,
  onClose,
  initialInput = EMPTY_EMAIL_INPUT,
  initialDraft,
}: ContactEmailComposerProps) {
  const [input, setInput] = useState(initialInput);
  const [draft, setDraft] = useState<EmailDraft | undefined>(initialDraft);
  const [errors, setErrors] = useState<
    Partial<Record<keyof EmailInput, string>>
  >({});
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState("");
  const wrapper = useRef<HTMLDivElement>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyVersion = useRef(0);
  const purposeName = useId();
  const yearName = useId();

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    function trap(event: KeyboardEvent) {
      if (event.key !== "Tab") return;
      const elements = wrapper.current?.querySelectorAll<HTMLElement>(
        "button:not(:disabled), input:not(:disabled), textarea:not(:disabled), a[href]",
      );
      if (!elements?.length) return;
      const first = elements[0],
        last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", trap);
    return () => {
      document.removeEventListener("keydown", trap);
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = null;
      copyVersion.current += 1;
      previousFocus?.focus();
    };
  }, [isOpen]);
  const close = useCallback(() => {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = null;
    setPending(false);
    setNotice("");
    onClose();
  }, [onClose]);

  function update<K extends keyof EmailInput>(key: K, value: EmailInput[K]) {
    setInput((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }
  function generate() {
    const nextErrors = validateEmailInput(input);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setPending(true);
    setNotice("");
    // 로컬 목 요청. 입력을 외부 AI 서버에 전송하지 않는다.
    const nextDraft = createMockEmailDraft(input, recipient);
    timeout.current = setTimeout(() => {
      setDraft(nextDraft);
      setPending(false);
      timeout.current = null;
    }, 500);
  }
  async function copy(label: string, value: string) {
    const version = ++copyVersion.current;
    try {
      await navigator.clipboard.writeText(value);
      if (version === copyVersion.current) setNotice(`${label}을 복사했어요.`);
    } catch {
      if (version === copyVersion.current)
        setNotice("복사하지 못했어요. 내용을 선택해 직접 복사해 주세요.");
    }
  }
  const expanded = Boolean(draft || pending);
  const inputField = (
    key: "name" | "department" | "email" | "phone" | "interest",
    label: string,
    placeholder: string,
  ) => (
    <Field
      label={label}
      placeholder={placeholder}
      value={input[key]}
      error={errors[key]}
      maxLength={key === "interest" ? 500 : 100}
      type={key === "email" ? "email" : key === "phone" ? "tel" : "text"}
      onChange={(event) =>
        update(
          key,
          key === "phone"
            ? formatPhone(event.target.value)
            : event.target.value,
        )
      }
    />
  );

  return (
    <div ref={wrapper}>
      <Dialog
        isOpen={isOpen}
        onClose={close}
        title="교수님께 메일 쓰기"
        headerLayout="inline"
        closeIconSrc="/icons/email-editor/close.svg"
        className={`relative !rounded-[24px] !border-0 !bg-[#f5f5f5] [&>header]:px-6 [&>header]:pt-6 md:[&>header]:px-9 md:[&>header]:pt-9 [&_h2]:!text-[22px] [&_h2]:!font-semibold [&_header_button]:!size-6 [&_header_button]:relative [&_header_button]:z-10 ${expanded ? "max-w-[824px]" : "max-w-[460px]"}`}
      >
        <div
          className={`flex flex-col gap-3 p-3 pt-0 ${expanded ? "md:flex-row" : ""}`}
        >
          <form
            className="flex min-w-0 flex-1 flex-col gap-3 p-3 pt-3 md:p-6 md:pt-3"
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              generate();
            }}
          >
            <p className="text-[12px] text-text-subtle">예시 초안</p>
            <fieldset disabled={pending}>
              <legend className="mb-1 text-[14px] font-semibold">목적</legend>
              <div className="flex flex-wrap gap-1">
                {EMAIL_PURPOSES.map((purpose) => (
                  <Radio
                    appearance="chip"
                    className="!text-[14px]"
                    key={purpose}
                    name={purposeName}
                    value={purpose}
                    checked={input.purpose === purpose}
                    onChange={() => update("purpose", purpose)}
                  >
                    {purpose}
                  </Radio>
                ))}
              </div>
            </fieldset>
            <fieldset
              disabled={pending}
              className="flex min-w-0 flex-col gap-3"
            >
              <div className="grid min-w-0 grid-cols-2 gap-2">
                {inputField("name", "이름", "홍길동")}
                {inputField("department", "학과", "국어국문학과")}
              </div>
              <fieldset>
                <legend className="mb-1 text-[14px] font-semibold">학년</legend>
                <div className="flex flex-wrap gap-1">
                  {["1학년", "2학년", "3학년", "4학년", "5학년 +"].map(
                    (year) => (
                      <Radio
                        appearance="chip"
                        name={yearName}
                        key={year}
                        checked={input.year === year}
                        value={year}
                        onChange={() => update("year", year)}
                      >
                        {year}
                      </Radio>
                    ),
                  )}
                </div>
                {errors.year && (
                  <p role="alert" className="mt-1 text-[12px] text-text-error">
                    학년을 선택해 주세요.
                  </p>
                )}
              </fieldset>
              <div className="grid min-w-0 grid-cols-2 gap-2">
                {inputField("email", "이메일", "ttokttok@gmail.com")}
                {inputField("phone", "연락처 (선택)", "010-1234-5678")}
              </div>
              {inputField(
                "interest",
                "관심 있는 연구",
                "이 연구실에서 어떤 연구에 관심이 있나요?",
              )}
              <Textarea
                label={
                  input.purpose === "교수님께 질문"
                    ? "구체적으로 궁금한 점"
                    : "관련해서 해본 일"
                }
                value={input.experience}
                error={errors.experience}
                maxLength={3000}
                placeholder={
                  input.purpose === "교수님께 질문"
                    ? "교수님께 전달할 내용을 구체적으로 작성해 주세요."
                    : "수업·과제·프로젝트에 관한 내용을 적어주세요."
                }
                onChange={(event) => update("experience", event.target.value)}
              />
            </fieldset>
            <Button
              className="w-full"
              variant="outline"
              disabled={pending}
              type="submit"
            >
              {pending
                ? "메일 생성중"
                : draft
                  ? "메일 수정하기"
                  : "AI로 메일 초안 만들기"}
            </Button>
            {notice && (
              <p role="status" className="text-[13px] text-text-primary">
                {notice}
              </p>
            )}
          </form>
          {expanded && (
            <section
              aria-label="메일 초안"
              aria-busy={pending}
              className="min-w-0 overflow-hidden rounded-xl bg-white shadow-[0_2px_8px_#0000001a] md:mt-[-45px] md:w-[360px] md:shrink-0"
            >
              {pending ? (
                <div className="flex min-h-[380px] items-center justify-center p-6">
                  <ol className="space-y-4 text-[16px] font-semibold">
                    <li className="flex items-center gap-[10px] text-text-subtle">
                      <span className="flex size-5 items-center justify-center rounded-full bg-bg-primary">
                        <Image
                          src="/icons/email-editor/check.svg"
                          width={12}
                          height={12}
                          alt=""
                        />
                      </span>
                      연구실 정보를 불러왔어요
                    </li>
                    <li className="flex items-center gap-[10px]" role="status">
                      <Image
                        className="animate-spin"
                        src="/icons/email-editor/loader.svg"
                        width={20}
                        height={20}
                        alt=""
                      />
                      제목 짓는 중...
                    </li>
                    <li className="flex items-center gap-[10px] text-text-subtlest">
                      <span className="size-5 rounded-full border-2 border-border-subtle" />
                      정중한 문장으로 다듬기
                    </li>
                  </ol>
                </div>
              ) : (
                draft && (
                  <>
                    <h3 className="flex h-12 items-center bg-bg-primary-subtle px-[18px] text-[14px] font-semibold">
                      메일 초안
                    </h3>
                    {[
                      ["받는 사람", draft.recipient],
                      ["제목", draft.subject],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="flex min-h-[52px] items-center gap-[10px] border-b border-border-subtlest px-[18px]"
                      >
                        <span className="w-[58px] shrink-0 text-[14px] font-semibold text-text-subtle">
                          {label}
                        </span>
                        <p
                          className="min-w-0 flex-1 truncate text-[13px]"
                          title={value}
                        >
                          {value || "공개된 이메일 없음"}
                        </p>
                        <button
                          type="button"
                          aria-label={`${label} 복사`}
                          className={copyClass}
                          disabled={!value}
                          onClick={() => void copy(label, value)}
                        >
                          복사
                        </button>
                      </div>
                    ))}
                    <div className="px-[18px] pt-3 pb-6">
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="text-[14px] font-semibold text-text-subtle">
                          본문
                        </h4>
                        <button
                          type="button"
                          className={copyClass}
                          onClick={() => void copy("본문", draft.body)}
                        >
                          복사
                        </button>
                      </div>
                      <p className="max-h-[400px] overflow-y-auto whitespace-pre-wrap break-words text-[13px] leading-[1.5]">
                        {draft.body}
                      </p>
                    </div>
                  </>
                )
              )}
            </section>
          )}
        </div>
      </Dialog>
    </div>
  );
}

export function ContactEmailButton({
  recipient,
}: {
  recipient: EmailRecipient;
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button
        variant="outline"
        className="mt-3 w-full"
        onClick={() => setIsOpen(true)}
      >
        교수님께 메일 쓰기
      </Button>
      <ContactEmailComposer
        recipient={recipient}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
