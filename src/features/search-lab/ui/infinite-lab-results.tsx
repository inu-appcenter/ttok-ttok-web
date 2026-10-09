"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LabCard, type LabSummaryPage } from "@/entities/lab";
import { createSearchHref, type SearchConditions } from "../model/search-conditions";
import { appendSearchPage } from "../model/append-search-page";

export type SearchPageLoader = (conditions: SearchConditions, signal: AbortSignal) => Promise<LabSummaryPage>;

async function fetchSearchPage(conditions: SearchConditions, signal: AbortSignal): Promise<LabSummaryPage> {
  const query = createSearchHref(conditions).split("?")[1] ?? "";
  const response = await fetch(`/api/laboratories/search?${query}`, { signal, cache: "no-store" });
  if (!response.ok) throw new Error("추가 연구실을 불러오지 못했어요.");
  return response.json();
}

type SavedResults = { result: LabSummaryPage; scrollY: number; savedAt: number };
// 상세 화면 복귀에만 사용하는 제한된 메모리 기록입니다. 새로고침하면 초기화합니다.
const savedResults = new Map<string, SavedResults>();

export type InfiniteLabResultsProps = {
  conditions: SearchConditions;
  initialResult: LabSummaryPage;
  loadPage?: SearchPageLoader;
};

export function InfiniteLabResults({ conditions, initialResult, loadPage = fetchSearchPage }: InfiniteLabResultsProps) {
  const searchKey = createSearchHref(conditions);
  const [restored] = useState(() => {
    const saved = savedResults.get(searchKey);
    return saved && Date.now() - saved.savedAt < 5 * 60_000 ? saved : undefined;
  });
  const [result, setResult] = useState(restored?.result ?? initialResult);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const resultRef = useRef(result);
  const requestRef = useRef<AbortController | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame: number | undefined;
    if (restored) {
      frame = requestAnimationFrame(() => window.scrollTo(0, restored.scrollY));
    }
    return () => {
      if (frame !== undefined) cancelAnimationFrame(frame);
      requestRef.current?.abort();
      requestRef.current = null;
    };
  }, [restored]);

  const handleLoadMore = useCallback(async () => {
    const current = resultRef.current;
    if (requestRef.current || !current.hasNext || current.isLast) return;
    const controller = new AbortController();
    requestRef.current = controller;
    setStatus("loading");
    try {
      const next = await loadPage({ ...conditions, page: current.page + 1 }, controller.signal);
      if (controller.signal.aborted) return;
      const combined = appendSearchPage(current, next);
      resultRef.current = combined;
      setResult(combined);
      setStatus("idle");
    } catch {
      if (!controller.signal.aborted) setStatus("error");
    } finally {
      if (requestRef.current === controller) requestRef.current = null;
    }
  }, [conditions, loadPage]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || status !== "idle" || !result.hasNext || result.isLast || !window.IntersectionObserver) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) void handleLoadMore();
    }, { rootMargin: "200px" });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleLoadMore, result.hasNext, result.isLast, result.page, status]);

  function handleSavePosition() {
    savedResults.delete(searchKey);
    savedResults.set(searchKey, { result: resultRef.current, scrollY: window.scrollY, savedAt: Date.now() });
    const oldestKey = savedResults.keys().next().value;
    if (savedResults.size > 5 && oldestKey) savedResults.delete(oldestKey);
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3" onClickCapture={handleSavePosition}>
        {result.content.map((lab) => <LabCard key={lab.labId} lab={lab} />)}
      </div>
      <div aria-live="polite" className="mt-6 flex min-h-12 flex-col items-center gap-3 pb-24 md:pb-0" ref={sentinelRef}>
        {status === "loading" ? <p role="status" className="text-sm text-text-subtle">연구실을 불러오는 중</p> : null}
        {status === "error" ? <p role="alert" className="text-sm text-text-subtle">추가 연구실을 불러오지 못했어요.</p> : null}
        {result.hasNext && !result.isLast ? (
          <button className="rounded-md border border-border-subtle px-4 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary disabled:text-text-disabled" disabled={status === "loading"} onClick={() => void handleLoadMore()} type="button">
            {status === "error" ? "다시 시도" : "더 보기"}
          </button>
        ) : <span className="sr-only">모든 검색 결과를 표시했어요.</span>}
      </div>
    </div>
  );
}
