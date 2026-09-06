"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useEffect, useId } from "react";

export type DialogProps = {
  children: ReactNode;
  className?: string;
  isOpen: boolean;
  mobileBottomSheet?: boolean;
  onClose: () => void;
  title: string;
};

export function Dialog({
  children,
  className,
  isOpen,
  mobileBottomSheet = false,
  onClose,
  title,
}: DialogProps) {
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex justify-center bg-[var(--color-opacity-black-50)] ${mobileBottomSheet ? "items-end p-0 md:items-center md:p-4" : "items-center p-4"}`}
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <section
        aria-labelledby={titleId}
        aria-modal="true"
        className={`max-h-[calc(100dvh-32px)] w-full overflow-y-auto bg-bg-default shadow-[0_8px_32px_var(--color-opacity-black-10)] ${mobileBottomSheet ? "rounded-t-[var(--radius-2xl)] md:max-w-[483px] md:rounded-[var(--radius-2xl)] md:border md:border-border-subtle" : "rounded-[var(--radius-2xl)] border border-border-subtle"} ${className ?? (mobileBottomSheet ? "" : "max-w-[483px]")}`}
        role="dialog"
      >
        <header
          className={
            mobileBottomSheet
              ? "flex items-center justify-between px-5 pt-4 md:block md:pt-5"
              : "px-5 pt-5"
          }
        >
          <div className={mobileBottomSheet ? "order-2 md:flex md:justify-end" : "flex justify-end"}>
            <button
              aria-label="닫기"
              autoFocus
              className="relative size-7 cursor-pointer rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary"
              onClick={onClose}
              type="button"
            >
              <Image alt="" fill src="/icons/home/mobile/close.svg" />
            </button>
          </div>
          <div
            className={
              mobileBottomSheet
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
        {children}
      </section>
    </div>
  );
}
