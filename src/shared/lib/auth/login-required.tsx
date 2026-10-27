"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ComponentProps, MouseEvent, ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect } from "react";

import { useToast } from "@/shared/ui";

import {
  getLoginNotice,
  getLoginPath,
  LOGIN_NOTICE_PARAM,
  LOGIN_REQUIRED_NOTICE,
} from "./return-path";

export const LOGIN_REQUIRED_MESSAGE = "로그인이 필요한 기능이에요.";

const LOGIN_PATH = "/login";

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

function useShowLoginRequiredToast() {
  const showToast = useToast();
  return useCallback(
    () => showToast({ state: "warning", title: LOGIN_REQUIRED_MESSAGE }),
    [showToast],
  );
}

/** 현재 연구실 상세로 돌아올 수 있게 로그인 안내 경로를 만든다. */
function useLoginRequiredPath() {
  const pathname = usePathname() ?? "";
  return {
    isLoginPage: pathname === LOGIN_PATH,
    loginPath: getLoginPath({ notice: LOGIN_REQUIRED_NOTICE, returnTo: pathname }),
  };
}

// 로그인이 필요한 동작은 로그인 화면으로 보내고, 안내는 도착한 로그인 화면에서 띄운다.
export function useLoginRequiredRedirect() {
  const router = useRouter();
  const showLoginRequired = useShowLoginRequiredToast();
  const { isLoginPage, loginPath } = useLoginRequiredPath();
  return useCallback(
    ({ replace = false }: { replace?: boolean } = {}) => {
      // 이미 로그인 화면이면 같은 화면에서 안내만 다시 보여준다.
      if (isLoginPage) showLoginRequired();
      else if (replace) router.replace(loginPath);
      else router.push(loginPath);
    },
    [isLoginPage, loginPath, router, showLoginRequired],
  );
}

export type LoginRequiredLinkProps = ComponentProps<typeof Link> & {
  isAuthenticated?: boolean;
};

function isPlainLeftClick(event: MouseEvent<HTMLAnchorElement>) {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

// 비로그인 상태에서는 href 자체를 로그인 안내 경로로 바꿔 새 탭·키보드 이동도 같은 흐름을 따른다.
export function LoginRequiredLink({
  href,
  isAuthenticated,
  onClick,
  prefetch,
  ...props
}: LoginRequiredLinkProps) {
  const contextAuthenticated = useIsAuthenticated();
  const showLoginRequired = useShowLoginRequiredToast();
  const { isLoginPage, loginPath } = useLoginRequiredPath();
  const canNavigate = isAuthenticated ?? contextAuthenticated;

  if (canNavigate)
    return <Link {...props} href={href} onClick={onClick} prefetch={prefetch} />;

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!isLoginPage || !isPlainLeftClick(event)) return;
    event.preventDefault();
    showLoginRequired();
  }

  return (
    <Link {...props} href={loginPath} onClick={handleClick} prefetch={false} />
  );
}

// 서버가 확인한 안내 값이 현재 URL에도 남아 있을 때만 한 번 띄우고 URL에서 제거한다.
// 뒤로가기로 캐시된 화면이 다시 보여도 이미 제거된 URL이면 안내를 반복하지 않는다.
export function LoginRequiredNotice() {
  const searchParams = useSearchParams();
  const showLoginRequired = useShowLoginRequiredToast();
  const hasNotice = Boolean(
    getLoginNotice(searchParams?.get(LOGIN_NOTICE_PARAM)),
  );

  useEffect(() => {
    if (!hasNotice) return;
    // 실제 URL에 알려진 안내 값이 남아 있을 때만 먼저 소비하고 띄운다. 재실행된 effect는 이미 소비된 값을 무시한다.
    const url = new URL(window.location.href);
    if (!getLoginNotice(url.searchParams.get(LOGIN_NOTICE_PARAM))) return;
    url.searchParams.delete(LOGIN_NOTICE_PARAM);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    showLoginRequired();
  }, [hasNotice, showLoginRequired]);

  return null;
}
