"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Bookmark } from "@/entities/bookmark";

export type BookmarkActions = { initialBookmarks?: Bookmark[]; onToggle?: (laboratoryId: number) => Promise<Bookmark[]>; onLoad?: () => Promise<Bookmark[]>; };

export function useBookmarks({ initialBookmarks, onToggle, onLoad }: BookmarkActions) {
  const [bookmarks, setBookmarks] = useState(initialBookmarks ?? []);
  const [loaded, setLoaded] = useState(initialBookmarks !== undefined);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const busy = useRef(false), needsRefresh = useRef(false);
  const router = useRouter();
  const read = useCallback(async () => {
    if (onLoad) return onLoad();
    const response = await fetch("/api/bookmarks", { cache: "no-store" });
    const body = await response.json();
    if (response.status === 401) { router.push("/login"); throw new Error("로그인이 필요합니다."); }
    if (!response.ok || !Array.isArray(body.data)) throw new Error(body.message || "관심 연구실을 불러오지 못했어요.");
    return body.data as Bookmark[];
  }, [onLoad, router]);
  const refresh = useCallback(async () => {
    if (busy.current) return;
    busy.current = true; setPending(true);
    try { setBookmarks(await read()); setLoaded(true); setError(""); needsRefresh.current = false; }
    catch { setError("관심 연구실을 불러오지 못했어요. 다시 시도해주세요."); }
    finally { busy.current = false; setPending(false); }
  }, [read]);
  useEffect(() => {
    if (initialBookmarks === undefined) void refresh();
    function revalidate() { if (document.visibilityState === "visible") void refresh(); }
    window.addEventListener("pageshow", revalidate);
    document.addEventListener("visibilitychange", revalidate);
    return () => { window.removeEventListener("pageshow", revalidate); document.removeEventListener("visibilitychange", revalidate); };
  }, [initialBookmarks, refresh]);
  async function toggle(laboratoryId: number) {
    if (busy.current) return;
    if (needsRefresh.current) { await refresh(); return; }
    busy.current = true; setPending(true); setError("");
    try {
      if (onToggle) { setBookmarks(await onToggle(laboratoryId)); setLoaded(true); }
      else {
        const response = await fetch("/api/bookmarks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ laboratoryId }) });
        const body = await response.json();
        if (response.status === 401) router.push("/login");
        if (!response.ok) throw new Error(body.message || "관심 연구실을 변경하지 못했어요.");
        needsRefresh.current = true;
        setBookmarks(await read()); setLoaded(true); needsRefresh.current = false;
        router.refresh();
      }
    } catch (failure) { setError(needsRefresh.current ? "변경 후 목록을 확인하지 못했어요. 목록을 다시 불러와주세요." : failure instanceof Error ? failure.message : "관심 연구실을 변경하지 못했어요."); }
    finally { busy.current = false; setPending(false); }
  }
  return { bookmarks, loaded, pending, error, refresh, toggle, needsRefresh: needsRefresh.current };
}
