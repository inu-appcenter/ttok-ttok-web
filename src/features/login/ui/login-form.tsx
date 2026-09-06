"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import { Button, Field, Logo } from "@/shared/ui";

const LOGIN_ERROR_MESSAGE = "학번 또는 비밀번호가 일치하지 않습니다.";

export type LoginFormProps = {
  initialHasError?: boolean;
};

export function LoginForm({ initialHasError = false }: LoginFormProps) {
  const [hasError, setHasError] = useState(initialHasError);

  const handleChange = () => {
    if (hasError) {
      setHasError(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasError(true);
  };

  return (
    <form
      className="flex w-full max-w-[440px] flex-col gap-[var(--spacing-spacing-4)]"
      noValidate
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col items-center gap-[var(--spacing-spacing-3)]">
        <Logo priority variant="vertical" />
        <p className="text-center text-[length:var(--font-size-body3)] leading-[1.5] text-text-subtle">
          인천대학교 포털 계정으로 로그인해주세요!
        </p>
      </div>

      <Field
        autoComplete="username"
        inputMode="numeric"
        invalid={hasError}
        label="학번"
        name="studentId"
        onChange={handleChange}
        placeholder="학번을 입력해주세요."
      />
      <Field
        autoComplete="current-password"
        invalid={hasError}
        label="비밀번호"
        name="password"
        onChange={handleChange}
        placeholder="비밀번호를 입력해주세요."
        type="password"
      />

      <Button className="w-full" size="lg" type="submit">
        로그인
      </Button>

      <p
        aria-live="polite"
        className={`h-5 text-center text-[length:var(--font-size-label2)] leading-[1.5] text-text-error ${hasError ? "visible" : "invisible"}`}
      >
        {LOGIN_ERROR_MESSAGE}
      </p>
    </form>
  );
}
