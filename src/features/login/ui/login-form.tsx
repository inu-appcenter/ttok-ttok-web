"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button, Field, Logo, useToast } from "@/shared/ui";
import { getLabReturnPath } from "@/shared/lib/auth/return-path";
import { notifyAuthChange } from "@/shared/lib/session-store";

import { login } from "../api/login";

const LOGIN_ERROR_MESSAGE = "학번 또는 비밀번호가 일치하지 않습니다.";

export type LoginFormProps = {
  initialHasError?: boolean;
  returnTo?: string;
};

export function LoginForm({
  initialHasError = false,
  returnTo,
}: LoginFormProps) {
  const router = useRouter();
  const showToast = useToast();
  const [errorMessage, setErrorMessage] = useState(
    initialHasError ? LOGIN_ERROR_MESSAGE : "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialHasError) showToast({ state: "error", title: LOGIN_ERROR_MESSAGE });
  }, [initialHasError, showToast]);

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
      showToast({ state: "error", title: "학번과 비밀번호를 모두 입력해주세요." });
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    const result = await login({ password, studentNumber });

    if (!result.ok) {
      setErrorMessage(result.message);
      showToast({ state: "error", title: result.message });
      setIsSubmitting(false);
      return;
    }

    notifyAuthChange();
    const destination = getLabReturnPath(returnTo);
    router.replace(
      result.isNew
        ? `/onboarding${destination ? `?returnTo=${encodeURIComponent(destination)}` : ""}`
        : (destination ?? "/"),
    );
    router.refresh();
  };

  const hasError = Boolean(errorMessage);

  return (
    <form
      className="flex w-full max-w-[275px] flex-col gap-6 md:max-w-[440px] md:gap-[var(--spacing-spacing-4)]"
      noValidate
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col items-center gap-6 md:gap-[var(--spacing-spacing-3)]">
        <Logo priority variant="vertical" />
        <p className="text-center text-[length:var(--font-size-body3)] leading-[1.5] text-text-subtle">
          인천대학교 포털 계정으로 로그인해주세요!
        </p>
      </div>

      <div className="flex w-full flex-col gap-2 md:gap-[var(--spacing-spacing-4)]">
      <Field
        autoComplete="username"
        inputMode="text"
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
      </div>

      <Button
        className="w-full max-md:!h-[51px] max-md:!text-[length:var(--font-size-body1)]"
        isLoading={isSubmitting}
        size="lg"
        type="submit"
      >
        로그인
      </Button>

      <div className="-mt-2 text-center text-xs leading-[1.5] text-text-subtlest md:mt-0">
        비밀번호를 잊어버리셨나요?{" "}
      <a
        className="rounded-sm font-bold underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-border-primary"
        href="https://portal.inu.ac.kr:444/enview/user/pwHelp.face"
        rel="noopener noreferrer"
        target="_blank"
      >
        비밀번호 찾기
        <span className="sr-only"> (새 창에서 열림)</span>
      </a>
      </div>
    </form>
  );
}
