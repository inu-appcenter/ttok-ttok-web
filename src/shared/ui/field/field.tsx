"use client";

import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import { useId } from "react";

type FieldBaseProps = {
  label?: string;
  error?: string;
  invalid?: boolean;
  trailing?: ReactNode;
};

export type FieldProps = InputHTMLAttributes<HTMLInputElement> & FieldBaseProps;
export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> &
  Omit<FieldBaseProps, "trailing">;

const labelClassName =
  "text-[length:var(--font-size-label1)] font-[600] leading-[1.5]";

const fieldStateClassName =
  "border-border-subtle bg-bg-default hover:bg-bg-subtle focus-within:border-border-primary";

function ErrorMessage({ error, id }: { error?: string; id: string }) {
  return error ? (
    <span
      className="text-[length:var(--font-size-caption1)] leading-[1.5] text-text-error"
      id={id}
    >
      {error}
    </span>
  ) : null;
}

export function Field({
  className,
  disabled,
  error,
  id,
  invalid = false,
  label,
  trailing,
  ...props
}: FieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const hasError = Boolean(error) || invalid;

  return (
    <label
      className="flex w-full flex-col gap-[var(--spacing-spacing-1)] text-text-default"
      htmlFor={inputId}
    >
      {label ? <span className={labelClassName}>{label}</span> : null}
      <span
        className={`flex h-[44px] items-center overflow-hidden rounded-[var(--radius-xl)] border py-[var(--spacing-spacing-3)] pl-[var(--spacing-spacing-4)] pr-[var(--spacing-spacing-3)] transition-colors ${fieldStateClassName} ${hasError ? "border-border-error focus-within:border-border-error" : ""} ${disabled ? "border-border-disabled bg-bg-disabled" : ""}`}
      >
        <input
          aria-describedby={error ? errorId : undefined}
          aria-invalid={hasError}
          className={`min-w-0 flex-1 bg-transparent text-[length:var(--font-size-label2)] font-normal leading-[1.5] text-text-default outline-none placeholder:text-text-subtle disabled:cursor-not-allowed disabled:text-text-disabled disabled:placeholder:text-text-disabled ${className ?? ""}`}
          disabled={disabled}
          id={inputId}
          {...props}
        />
        {trailing ? (
          <span className="ml-[var(--spacing-spacing-1)] flex shrink-0 items-center">
            {trailing}
          </span>
        ) : null}
      </span>
      <ErrorMessage error={error} id={errorId} />
    </label>
  );
}

export function Textarea({
  className,
  disabled,
  error,
  id,
  invalid = false,
  label,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const errorId = `${textareaId}-error`;
  const hasError = Boolean(error) || invalid;

  return (
    <label
      className="flex w-full flex-col gap-[var(--spacing-spacing-1)] text-text-default"
      htmlFor={textareaId}
    >
      {label ? <span className={labelClassName}>{label}</span> : null}
      <textarea
        aria-describedby={error ? errorId : undefined}
        aria-invalid={hasError}
        className={`h-[96px] w-full resize-none rounded-[var(--radius-xl)] border p-[var(--spacing-spacing-3)] text-[length:var(--font-size-caption1)] font-normal leading-[1.5] text-text-default outline-none transition-colors placeholder:text-text-subtle hover:bg-bg-subtle focus:border-border-primary disabled:cursor-not-allowed disabled:border-border-disabled disabled:bg-bg-disabled disabled:text-text-disabled disabled:placeholder:text-text-disabled ${hasError ? "border-border-error focus:border-border-error" : "border-border-subtle"} ${className ?? ""}`}
        disabled={disabled}
        id={textareaId}
        {...props}
      />
      <ErrorMessage error={error} id={errorId} />
    </label>
  );
}
