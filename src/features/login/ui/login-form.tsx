"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button, Field, Logo } from "@/shared/ui";

import { login } from "../api/login";

const LOGIN_ERROR_MESSAGE = "학번 또는 비밀번호가 일치하지 않습니다.";

export type LoginFormProps = {
  initialHasError?: boolean;
};

export function LoginForm({ initialHasError = false }: LoginFormProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState(
    initialHasError ? LOGIN_ERROR_MESSAGE : "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = () => {
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const studentNumber = formData.get("studentNumber");
    const password = formData.get("password");

    if (typeof studentNumber !== "string" || typeof password !== "string") {
      setErrorMessage("학번과 비밀번호를 모두 입력해주세요.");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    const result = await login({ password, studentNumber });

    if (!result.ok) {
      setErrorMessage(result.message);
      setIsSubmitting(false);
      return;
    }

    router.replace(result.isNew ? "/onboarding" : "/");
    router.refresh();
  };

  const hasError = Boolean(errorMessage);

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
        name="studentNumber"
        onChange={handleChange}
        placeholder="학번을 입력해주세요."
        required
      />
      <Field
        autoComplete="current-password"
        invalid={hasError}
        label="비밀번호"
        name="password"
        onChange={handleChange}
        placeholder="비밀번호를 입력해주세요."
        required
        type="password"
      />

      <Button
        className="w-full"
        isLoading={isSubmitting}
        size="lg"
        type="submit"
      >
        로그인
      </Button>

      <p
        aria-live="polite"
        className={`h-5 text-center text-[length:var(--font-size-label2)] leading-[1.5] text-text-error ${hasError ? "visible" : "invisible"}`}
      >
        {errorMessage || LOGIN_ERROR_MESSAGE}
      </p>
    </form>
  );
}
