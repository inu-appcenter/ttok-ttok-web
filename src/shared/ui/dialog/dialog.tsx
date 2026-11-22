"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useEffect, useId, useRef } from "react";

export type DialogProps = {
  children: ReactNode;
  className?: string;
  /** 제목 아래 보조 설명. headerLayout="form"에서 표시한다. */
  description?: ReactNode;
  isOpen: boolean;
  /** form: 왼쪽 정렬 제목·설명과 오른쪽 닫기 버튼을 쓰는 입력형 모달 머리글 */
  headerLayout?: "default" | "form" | "inline";
  closeIconSrc?: string;
  /** 모바일(md 미만)에서는 화면 아래에 붙는 바텀시트로, PC에서는 가운데 모달로 보여준다. */
  mobileBottomSheet?: boolean;
  onClose: () => void;
  title: string;
  variant?: "confirmation" | "default";
};

/** 18px 닫기 아이콘의 터치 영역을 모바일에서 32px 이상으로 넓힌다. */
const MOBILE_HIT_AREA =
  "after:absolute after:-inset-2 after:content-[''] md:after:hidden";

export function Dialog({
  children,
  className,
  description,
  isOpen,
  headerLayout = "default",
  closeIconSrc = "/icons/home/mobile/close.svg",
  mobileBottomSheet = false,
  onClose,
  title,
  variant = "default",
}: DialogProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previousFocus =
      document.activeElement instanceof HTMLElement &&
      !dialogRef.current?.contains(document.activeElement)
        ? document.activeElement
        : null;
    document.body.style.overflow = "hidden";

    function focusableElements() {
      return [
        ...(dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
        ) ?? []),
      ].filter((element) => element.getClientRects().length > 0);
    }
    if (!dialogRef.current?.contains(document.activeElement))
      (focusableElements()[0] ?? dialogRef.current)?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") {
        const elements = focusableElements(),
          first = elements[0],
          last = elements.at(-1);
        if (!first) {
          event.preventDefault();
          dialogRef.current?.focus();
        } else if (
          event.shiftKey &&
          (document.activeElement === first ||
            !dialogRef.current?.contains(document.activeElement))
        ) {
          event.preventDefault();
          last?.focus();
        } else if (
          !event.shiftKey &&
          (document.activeElement === last ||
            !dialogRef.current?.contains(document.activeElement))
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isConfirmation = variant === "confirmation";
  const inlineHeader = headerLayout === "inline";
  const formHeader = headerLayout === "form";

  const formSheet = formHeader && mobileBottomSheet;
  // 모바일 바텀시트 쉘: 둥근 위쪽 모서리, 18px 닫기, 하단 34px 또는 safe area 여백
  const sectionClasses = isConfirmation
    ? "max-w-[320px] rounded-[var(--radius-xl)] p-[var(--spacing-spacing-6)] shadow-[0_8px_32px_var(--color-opacity-black-10)]"
    : formSheet
      ? "rounded-t-[var(--radius-2xl)] pb-[max(34px,env(safe-area-inset-bottom))] shadow-[0_2px_8px_var(--color-opacity-black-10)] md:rounded-[var(--radius-2xl)] md:border md:border-border-subtle md:pb-0 md:shadow-[0_8px_32px_var(--color-opacity-black-10)]"
      : mobileBottomSheet
        ? "rounded-t-[var(--radius-2xl)] shadow-[0_8px_32px_var(--color-opacity-black-10)] md:max-w-[483px] md:rounded-[var(--radius-2xl)] md:border md:border-border-subtle"
        : "rounded-[var(--radius-2xl)] border border-border-subtle shadow-[0_8px_32px_var(--color-opacity-black-10)]";
  const defaultWidth = isConfirmation || (mobileBottomSheet && !formSheet)
    ? ""
    : formSheet
      ? "md:max-w-[483px]"
      : "max-w-[483px]";

  return (
    <div
      className={`fixed inset-0 z-[100] flex justify-center bg-[var(--color-opacity-black-50)] ${mobileBottomSheet ? "items-end p-0 md:items-center md:p-4" : "items-center p-4"}`}
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <section
        ref={dialogRef}
        tabIndex={-1}
        aria-labelledby={titleId}
        aria-modal="true"
        className={`max-h-[calc(100dvh-32px)] w-full overflow-y-auto bg-bg-default ${sectionClasses} ${className ?? defaultWidth}`}
        role="dialog"
      >
        {formHeader ? (
          <header
            className={
              formSheet
                ? "flex items-center gap-[var(--spacing-spacing-2)] px-[var(--spacing-spacing-5)] pt-[var(--spacing-spacing-4)] md:items-start md:px-9 md:pt-9"
                : "flex items-start gap-[var(--spacing-spacing-2)] px-6 pt-6 md:px-9 md:pt-9"
            }
          >
            <div className="flex min-w-0 flex-1 flex-col gap-[var(--spacing-spacing-1)]">
              <h2
                className={`font-semibold tracking-[-0.01em] text-text-default ${formSheet ? "text-[length:var(--font-size-headline1)] leading-[1.4] md:text-[length:var(--font-size-heading1)] md:leading-[1.5]" : "text-[length:var(--font-size-heading1)] leading-[1.5]"}`}
                id={titleId}
              >
                {title}
              </h2>
              {description ? (
                <p
                  className={`text-[length:var(--font-size-body3)] leading-[1.5] text-text-subtle ${formSheet ? "hidden md:block" : ""}`}
                >
                  {description}
                </p>
              ) : null}
            </div>
            <button
              aria-label="닫기"
              className={`relative shrink-0 cursor-pointer rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary ${formSheet ? `size-[18px] md:size-6 ${MOBILE_HIT_AREA}` : "size-6"}`}
              onClick={onClose}
              type="button"
            >
              <Image alt="" fill src={closeIconSrc} />
            </button>
          </header>
        ) : isConfirmation ? (
          <h2
            className="text-center text-[length:var(--font-size-headline1)] font-semibold leading-[1.4] tracking-[-0.01em] text-text-default"
            id={titleId}
          >
            {title}
          </h2>
        ) : (
          <header
            className={
              inlineHeader
                ? "flex items-center justify-between px-6 pt-6"
                : mobileBottomSheet
                  ? "flex items-center justify-between px-5 pt-4 md:block md:pt-5"
                  : "px-5 pt-5"
            }
          >
            <div
              className={
                inlineHeader
                  ? "order-2"
                  : mobileBottomSheet
                    ? "order-2 flex md:justify-end"
                    : "flex justify-end"
              }
            >
              <button
                aria-label="닫기"
                autoFocus
                className={`relative cursor-pointer rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary ${mobileBottomSheet && !inlineHeader ? `size-[18px] md:size-7 ${MOBILE_HIT_AREA}` : "size-7"}`}
                onClick={onClose}
                type="button"
              >
                <Image alt="" fill src={closeIconSrc} />
              </button>
            </div>
            <div
              className={
                inlineHeader
                  ? "order-1 text-left"
                  : mobileBottomSheet
                    ? "order-1 text-left md:order-2 md:border-b md:border-border-subtle md:pb-[22px] md:text-center"
                    : "border-b border-border-subtle pb-[22px] text-center"
              }
            >
              <h2
                className={`${mobileBottomSheet ? "text-[length:var(--font-size-headline1)] font-semibold leading-[1.4] md:text-[length:var(--font-size-title1)] md:font-bold md:leading-[1.5]" : "text-[length:var(--font-size-title1)] font-bold leading-[1.5]"} text-text-default`}
                id={titleId}
              >
                {title}
              </h2>
            </div>
          </header>
        )}
        {children}
      </section>
    </div>
  );
}
