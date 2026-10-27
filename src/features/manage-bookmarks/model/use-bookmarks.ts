"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Bookmark } from "@/entities/bookmark";
import { useLoginRequiredRedirect } from "@/shared/lib/auth/login-required";
import { useToast } from "@/shared/ui";

export type BookmarkActions = {
  initialBookmarks?: Bookmark[];
  onToggle?: (laboratoryId: number) => Promise<Bookmark[]>;
  onLoad?: () => Promise<Bookmark[]>;
};

export function useBookmarks({
  initialBookmarks,
  onToggle,
  onLoad,
}: BookmarkActions) {
  const [bookmarks, setBookmarks] = useState(initialBookmarks ?? []);
  const [loaded, setLoaded] = useState(initialBookmarks !== undefined);
  const [previousInitial, setPreviousInitial] = useState(initialBookmarks);
  if (previousInitial !== initialBookmarks) {
    setPreviousInitial(initialBookmarks);
    if (initialBookmarks !== undefined) {
      setBookmarks(initialBookmarks);
      setLoaded(true);
    }
  }
  const [error, setError] = useState("");
  const [pending, setPending] = useState(initialBookmarks === undefined);
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const busy = useRef(false),
    needsRefreshRef = useRef(false);
  const router = useRouter();
  const showToast = useToast();
  const redirectToLogin = useLoginRequiredRedirect();
  const read = useCallback(async () => {
    if (onLoad) return onLoad();
    const response = await fetch("/api/bookmarks", { cache: "no-store" });
    const body = await response.json();
    if (response.status === 401) {
      redirectToLogin();
      throw new Error("로그인이 필요합니다.");
    }
    if (!response.ok || !Array.isArray(body.data))
      throw new Error(body.message || "관심 연구실을 불러오지 못했어요.");
    return body.data as Bookmark[];
  }, [onLoad, redirectToLogin]);
  const refresh = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    try {
      setBookmarks(await read());
      setLoaded(true);
      setError("");
      needsRefreshRef.current = false;
      setNeedsRefresh(false);
    } catch {
      setError("관심 연구실을 불러오지 못했어요. 다시 시도해주세요.");
    } finally {
      busy.current = false;
      setPending(false);
    }
  }, [read]);
  useEffect(() => {
    let active = true;
    if (initialBookmarks === undefined) {
      busy.current = true;
      void read()
        .then((items) => {
          if (active) {
            setBookmarks(items);
            setLoaded(true);
            setError("");
          }
        })
        .catch(() => {
          if (active)
            setError("관심 연구실을 불러오지 못했어요. 다시 시도해주세요.");
        })
        .finally(() => {
          if (active) {
            busy.current = false;
            setPending(false);
          }
        });
    }
    function revalidate() {
      if (document.visibilityState === "visible") void refresh();
    }
    window.addEventListener("pageshow", revalidate);
    document.addEventListener("visibilitychange", revalidate);
    window.addEventListener("ttok:bookmarks-changed", revalidate);
    return () => {
      active = false;
      window.removeEventListener("pageshow", revalidate);
      document.removeEventListener("visibilitychange", revalidate);
      window.removeEventListener("ttok:bookmarks-changed", revalidate);
    };
  }, [initialBookmarks, read, refresh]);
  async function toggle(laboratoryId: number) {
    if (busy.current) return;
    if (needsRefreshRef.current) {
      await refresh();
      return;
    }
    busy.current = true;
    setPending(true);
    setError("");
    try {
      let items: Bookmark[];
      if (onToggle) {
        items = await onToggle(laboratoryId);
      } else {
        // 응답 유실 시에도 토글을 다시 보내지 않고 먼저 서버 상태를 확인합니다.
        needsRefreshRef.current = true;
        setNeedsRefresh(true);
        const response = await fetch("/api/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ laboratoryId }),
        });
        if (response.status === 401) redirectToLogin();
        if (!response.ok && response.status >= 400 && response.status < 500) {
          needsRefreshRef.current = false;
          setNeedsRefresh(false);
        }
        if (!response.ok) {
          const body: unknown = await response.json().catch(() => null);
          throw new Error(
            body && typeof body === "object" && "message" in body &&
              typeof body.message === "string"
              ? body.message
              : "",
          );
        }
        // 서버 목록을 다시 받은 뒤에만 결과를 확정합니다.
        items = await read();
      }
      setBookmarks(items);
      setLoaded(true);
      needsRefreshRef.current = false;
      setNeedsRefresh(false);
      showToast({
        state: "success",
        title: items.some((item) => item.laboratory.laboratoryId === laboratoryId)
          ? "관심 연구실에 등록했어요."
          : "관심 연구실에서 해제했어요.",
      });
      if (!onToggle) {
        window.dispatchEvent(new Event("ttok:bookmarks-changed"));
        router.refresh();
      }
    } catch (failure) {
      if (needsRefreshRef.current) {
        setError("변경 후 목록을 확인하지 못했어요. 목록을 다시 불러와주세요.");
        showToast({
          state: "warning",
          title: "변경 결과를 확인하지 못했어요.",
          description: "목록을 다시 불러와 확인해주세요.",
        });
      } else {
        showToast({
          state: "error",
          title: "관심 연구실을 변경하지 못했어요.",
          description:
            failure instanceof Error && failure.message
              ? failure.message
              : undefined,
        });
      }
    } finally {
      busy.current = false;
      setPending(false);
    }
  }
  return { bookmarks, loaded, pending, error, refresh, toggle, needsRefresh };
}
