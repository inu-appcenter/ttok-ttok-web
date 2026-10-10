"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useEffect, useId, useRef } from "react";

export type DialogProps = {
  children: ReactNode;
  className?: string;
  isOpen: boolean;
  headerLayout?: "default" | "inline";
  closeIconSrc?: string;
  mobileBottomSheet?: boolean;
  onClose: () => void;
  title: string;
  variant?: "confirmation" | "default";
};

export function Dialog({
  children,
  className,
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
        className={`max-h-[calc(100dvh-32px)] w-full overflow-y-auto bg-bg-default shadow-[0_8px_32px_var(--color-opacity-black-10)] ${isConfirmation ? "max-w-[320px] rounded-[var(--radius-xl)] p-[var(--spacing-spacing-6)]" : mobileBottomSheet ? "rounded-t-[var(--radius-2xl)] md:max-w-[483px] md:rounded-[var(--radius-2xl)] md:border md:border-border-subtle" : "rounded-[var(--radius-2xl)] border border-border-subtle"} ${className ?? (isConfirmation || mobileBottomSheet ? "" : "max-w-[483px]")}`}
        role="dialog"
      >
        {isConfirmation ? (
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
                    ? "order-2 md:flex md:justify-end"
                    : "flex justify-end"
              }
            >
              <button
                aria-label="닫기"
                autoFocus
                className="relative size-7 cursor-pointer rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary"
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
