"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

import { Toast, type ToastState } from "./toast";

export const TOAST_DURATION = 3000;

export type ToastOptions = {
  description?: string;
  state?: ToastState;
  title: string;
};

type ActiveToast = ToastOptions & { id: number };

const ToastContext = createContext<((toast: ToastOptions) => void) | null>(null);

// 화면 전체에서 토스트를 하나만 띄운다. 새 요청은 이전 토스트를 대체하고 표시 시간을 다시 센다.
export function ToastProvider({ children }: { children?: ReactNode }) {
  const pathname = usePathname() ?? "";
  const [toast, setToast] = useState<ActiveToast | null>(null);
  const [toastPathname, setToastPathname] = useState(pathname);
  const nextId = useRef(0);

  // 경로가 바뀌면 이전 화면에서 띄운 토스트를 남기지 않는다.
  if (toastPathname !== pathname) {
    setToastPathname(pathname);
    setToast(null);
  }

  const showToast = useCallback((options: ToastOptions) => {
    nextId.current += 1;
    setToast({ ...options, id: nextId.current });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), TOAST_DURATION);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast ? (
        <div className="pointer-events-none fixed left-1/2 top-3 z-[120] flex w-max max-w-[calc(100vw-32px)] -translate-x-1/2 justify-center">
          <Toast
            description={toast.description}
            key={toast.id}
            state={toast.state}
            title={toast.title}
          />
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const showToast = useContext(ToastContext);
  if (!showToast) throw new Error("useToast는 ToastProvider 안에서 사용해야 합니다.");
  return showToast;
}
