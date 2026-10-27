"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent, ReactNode } from "react";
import { createContext, useCallback, useContext } from "react";

import { useToast } from "@/shared/ui";

export const LOGIN_REQUIRED_MESSAGE = "로그인이 필요한 기능이에요.";

// 서버에서 판별한 로그인 여부만 전달한다. 토큰·쿠키 값은 클라이언트로 넘기지 않는다.
const AuthStatusContext = createContext(false);

export function AuthStatusProvider({
  children,
  isAuthenticated,
}: {
  children?: ReactNode;
  isAuthenticated: boolean;
}) {
  return (
    <AuthStatusContext.Provider value={isAuthenticated}>
      {children}
    </AuthStatusContext.Provider>
  );
}

export function useIsAuthenticated() {
  return useContext(AuthStatusContext);
}

export function useLoginRequiredToast() {
  const showToast = useToast();
  return useCallback(
    (description?: string) =>
      showToast({ description, state: "warning", title: LOGIN_REQUIRED_MESSAGE }),
    [showToast],
  );
}

export type LoginRequiredLinkProps = ComponentProps<typeof Link> & {
  isAuthenticated?: boolean;
};

// 비로그인 클릭은 현재 화면에 머물며 안내만 띄운다. href는 그대로 두어 직접 접근은 서버 guard가 막는다.
export function LoginRequiredLink({
  isAuthenticated,
  onClick,
  prefetch,
  ...props
}: LoginRequiredLinkProps) {
  const contextAuthenticated = useIsAuthenticated();
  const showLoginRequired = useLoginRequiredToast();
  const canNavigate = isAuthenticated ?? contextAuthenticated;

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!canNavigate) {
      event.preventDefault();
      showLoginRequired();
      return;
    }
    onClick?.(event);
  }

  return (
    <Link
      {...props}
      onClick={handleClick}
      prefetch={canNavigate ? prefetch : false}
    />
  );
}
