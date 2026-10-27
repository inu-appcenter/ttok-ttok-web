"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";

import {
  suggestKeywords,
  requestRecommendations,
  RecommendationApiError,
} from "@/features/request-ai-recommendation";
import type {
  Recommendation,
  RecommendationResult,
  RecommendationRequest,
} from "@/features/request-ai-recommendation";
import { useRouter } from "next/navigation";
import {
  clearSessionStore,
  isSessionScope,
  notifyAuthChange,
  subscribeAuthChange,
} from "@/shared/lib/session-store";
import { Checkbox, Dialog, Field } from "@/shared/ui";
import { MobileBottomNav } from "@/widgets/mobile-bottom-nav";
import {
  readRecommendationSnapshot,
  saveRecommendationSnapshot,
} from "../model/recommendation-session";
import type { PastTurn } from "../model/recommendation-session";

type Step = "interest" | "keywords" | "results";
export type AiRecommendationsPageProps = {
  memberId?: number;
  sessionKey?: string;
  initialStep?: Step;
  initialPrompt?: string;
  initialKeywords?: string[];
  initialResult?: RecommendationResult;
  onSuggest?: (interest: string, signal: AbortSignal) => Promise<string[]>;
  onRecommend?: (
    input: RecommendationRequest,
    signal: AbortSignal,
  ) => Promise<RecommendationResult>;
};
const gradient =
  "bg-[linear-gradient(90deg,#a7c0db,#b4bade,#c2aed6,#d699c5)] bg-clip-text text-transparent";
const action =
  "cursor-pointer text-[18px] font-semibold underline underline-offset-4 disabled:cursor-not-allowed disabled:text-text-disabled focus-visible:outline-2 focus-visible:outline-border-primary";
const subscribeNothing = () => () => {};

function Bubble({
  children,
  user = false,
  subtle = false,
}: {
  children: ReactNode;
  user?: boolean;
  subtle?: boolean;
}) {
  return (
    <p
      className={`w-fit max-w-full whitespace-pre-wrap break-words rounded-xl px-4 py-3 leading-[1.5] shadow-[0_2px_4px_#0000001a] lg:px-6 lg:py-4 ${user ? "ml-auto max-w-[420px] bg-bg-primary text-[16px] font-semibold text-white" : `bg-[#f5f5f5] ${subtle ? "text-[14px] text-text-subtle" : "text-[16px] font-semibold lg:text-[20px]"}`}`}
    >
      {children}
    </p>
  );
}

type StepStatus = "done" | "loading" | "current" | "waiting";

// 완료는 파란 원+흰 체크, AI 요청 중은 로더, 대기는 빈 원으로 구분한다.
function StepIcon({ status }: { status: StepStatus }) {
  if (status === "done") {
    return (
      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-bg-primary">
        <Image
          src="/icons/recommendations/step-check.svg"
          width={12}
          height={12}
          alt=""
        />
      </span>
    );
  }
  if (status === "loading") {
    return (
      <Image
        className="shrink-0 animate-spin"
        src="/icons/email-editor/loader.svg"
        width={20}
        height={20}
        alt=""
      />
    );
  }
  if (status === "current") {
    return (
      <Image
        className="shrink-0"
        src="/icons/recommendations/step-target.svg"
        width={20}
        height={20}
        alt=""
      />
    );
  }
  return (
    <span className="size-5 shrink-0 rounded-full border border-border-subtle" />
  );
}

function ResultCards({
  recommendations,
  mobile = false,
}: {
  recommendations: Recommendation[];
  mobile?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      {recommendations.map((lab, index) => (
        <article
          key={lab.id}
          className="rounded-xl bg-white px-4 py-[13px] shadow-[0_2px_4px_#0000001a]"
        >
          {index === 0 && (
            <span className="mb-2 inline-block rounded-full bg-[linear-gradient(90deg,#a7c0db,#c2aed6,#d699c5)] px-3 py-1 text-[14px] font-semibold text-white">
              가장 잘 맞아요
            </span>
          )}
          <h3 className="text-[20px] font-semibold leading-[1.5]">
            {lab.name}
          </h3>
          <p className="text-[13px] text-text-subtle">
            {lab.professor} 교수 · {lab.department}
          </p>
          <div className="my-2 flex flex-wrap gap-1">
            {lab.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-bg-primary px-2 py-0.5 text-[13px] text-white"
              >
                {tag}
              </span>
            ))}
          </div>
          {!mobile && (
            <ul className="space-y-1 text-[14px] leading-[1.5] text-text-subtle">
              {lab.reasons.map((reason) => (
                <li key={reason} className="flex gap-2">
                  <span className="text-text-primary">•</span>
                  {reason}
                </li>
              ))}
            </ul>
          )}
          <Link
            href={`/labs/${lab.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center justify-end gap-1 text-[14px] text-text-primary"
          >
            연구실 보기
            <Image
              src="/icons/recommendations/chevron-right.svg"
              width={13}
              height={13}
              alt=""
            />
          </Link>
        </article>
      ))}
    </div>
  );
}

export function AiRecommendationsPage({
  memberId,
  sessionKey,
  initialStep = "interest",
  initialPrompt = "",
  initialKeywords = [],
  initialResult,
  onSuggest = suggestKeywords,
  onRecommend = requestRecommendations,
}: AiRecommendationsPageProps) {
  // 하이드레이션 중에는 false를 돌려 서버 HTML과 같은 초기 상태로 렌더한다.
  // 클라이언트 이동으로 새로 마운트될 때만 true다.
  const isClientMount = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
  // 회원 ID와 검증된 세션 키가 모두 확인되고 클라이언트에서 마운트될 때만 복원한다.
  const [restored] = useState(() => {
    const scope = { memberId, sessionKey };
    return isClientMount && isSessionScope(scope)
      ? readRecommendationSnapshot(scope)
      : undefined;
  });
  // 인증이 바뀐 뒤에는 이 화면의 상태를 다시 저장하지 않는다.
  const isInvalidated = useRef(false);
  const [step, setStep] = useState<Step>(restored?.step ?? initialStep);
  const [interest, setInterest] = useState(restored?.interest ?? initialPrompt);
  const router = useRouter();
  const [keywords, setKeywords] = useState<string[]>(
    restored
      ? restored.keywords
      : initialStep === "results"
        ? initialKeywords.slice(0, 3)
        : [],
  );
  const [suggestions, setSuggestions] = useState(
    restored?.suggestions ?? initialKeywords,
  );
  const [result, setResult] = useState<RecommendationResult | undefined>(
    restored ? restored.result : initialResult,
  );
  const [customKeywords, setCustomKeywords] = useState<string[]>(
    restored?.customKeywords ?? [],
  );
  const [custom, setCustom] = useState("");
  const [adding, setAdding] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [hasResults, setHasResults] = useState(
    (restored ? restored.result : initialResult) !== undefined,
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [pastTurns, setPastTurns] = useState<PastTurn[]>(
    restored?.pastTurns ?? [],
  );
  const request = useRef<AbortController | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const resultTrigger = useRef<HTMLButtonElement>(null);
  const stepIndex = ["interest", "keywords", "results"].indexOf(step);

  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => {
    const scope = { memberId, sessionKey };
    if (isInvalidated.current || !isSessionScope(scope)) return;
    saveRecommendationSnapshot(scope, {
      step,
      interest,
      suggestions,
      keywords,
      customKeywords,
      pastTurns,
      result,
    });
  }, [
    memberId,
    sessionKey,
    step,
    interest,
    suggestions,
    keywords,
    customKeywords,
    pastTurns,
    result,
  ]);
  useEffect(() => {
    if (step === "interest") return;
    if (window.matchMedia("(min-width: 1024px)").matches) {
      const conversation = end.current?.parentElement;
      conversation?.scrollTo({
        top: conversation.scrollHeight,
        behavior: "smooth",
      });
    } else {
      end.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [step]);
  useEffect(() => {
    if (!sheetOpen) return;
    const trigger = resultTrigger.current;
    function trap(event: KeyboardEvent) {
      if (event.key !== "Tab") return;
      const items = sheet.current?.querySelectorAll<HTMLElement>(
        "button:not(:disabled), a[href]",
      );
      if (!items?.length) return;
      const first = items[0],
        last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", trap);
    return () => {
      document.removeEventListener("keydown", trap);
      trigger?.focus();
    };
  }, [sheetOpen]);

  function toggle(value: string) {
    setKeywords((items) =>
      items.includes(value)
        ? items.filter((item) => item !== value)
        : items.length < 3
          ? [...items, value]
          : items,
    );
  }
  function addCustom() {
    const value = custom.trim();
    if (!value || value.length > 30 || keywords.length >= 3) return;
    setCustomKeywords((items) => [...new Set([...items, value])]);
    setKeywords((items) => [...new Set([...items, value])]);
    setCustom("");
    setAdding(false);
  }
  function cancelRequest() {
    request.current?.abort();
    request.current = null;
    setPending(false);
  }
  async function runRequest(keywordsOnly: boolean) {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setPending(true);
    setError("");
    try {
      if (keywordsOnly) {
        const items = await onSuggest(interest.trim(), controller.signal);
        if (controller.signal.aborted || request.current !== controller) return;
        setSuggestions(items);
        setKeywords([]);
        setCustomKeywords([]);
        setStep("keywords");
      } else {
        const data = await onRecommend(
          { interest: interest.trim(), selectedKeywords: keywords },
          controller.signal,
        );
        if (controller.signal.aborted || request.current !== controller) return;
        setResult(data);
        setHasResults(true);
        setStep("results");
      }
    } catch (cause) {
      if (!controller.signal.aborted && request.current === controller) {
        if (cause instanceof RecommendationApiError && cause.status === 401) {
          isInvalidated.current = true;
          notifyAuthChange();
          router.replace("/login");
          return;
        }
        setError(
          cause instanceof Error
            ? cause.message
            : "결과를 불러오지 못했어요. 다시 시도해 주세요.",
        );
      }
    } finally {
      if (request.current === controller) setPending(false);
    }
  }
  function restart() {
    cancelRequest();
    setStep("interest");
    setInterest("");
    setKeywords([]);
    setSuggestions([]);
    setResult(undefined);
    setHasResults(false);
    setCustomKeywords([]);
    setAdding(false);
    setCustom("");
    setError("");
    setSheetOpen(false);
    setPastTurns([]);
  }
  // 이전 대화를 흐리게 남기고 입력만 비운다. 결과 카드는 새 결과가 오기 전까지 유지한다.
  function startNew() {
    cancelRequest();
    setPastTurns((turns) => [
      ...turns,
      { interest: interest.trim(), keywords, title: resultTitle },
    ]);
    setStep("interest");
    setInterest("");
    setKeywords([]);
    setSuggestions([]);
    setCustomKeywords([]);
    setAdding(false);
    setCustom("");
    setError("");
    setSheetOpen(false);
  }
  // 인증 변경(다른 탭 포함)이나 bfcache 복귀 시 화면 상태를 비우고 서버에서
  // 세션을 다시 확인한다. 유효하지 않으면 서버가 로그인으로 보낸다.
  const handleSessionUncertain = useEffectEvent(() => {
    isInvalidated.current = true;
    clearSessionStore();
    restart();
    router.refresh();
  });
  useEffect(() => subscribeAuthChange(handleSessionUncertain), []);
  useEffect(() => {
    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) handleSessionUncertain();
    }
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);
  const progressLabels = [
    "관심 주제 파악하는 중…",
    "키워드 정리하는 중…",
    "딱 맞는 연구실 찾기",
  ];
  const options = [...suggestions, ...customKeywords];
  const selected = keywords;
  const recommendations = result?.recommendations ?? [];
  const resultTitle = result?.noMatch
    ? "조건에 맞는 연구실을 찾지 못했어요"
    : `딱 맞는 연구실 ${recommendations.length}곳을 찾았어요`;
  const resultsFooter = (
    <div className="mt-5 text-center">
      <p className="mb-2 text-[13px] text-text-subtle">
        원하는 연구실이 없나요?
      </p>
      <button type="button" className={action} onClick={startNew}>
        연구실 추천 다시 받기
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-[calc(180px_+_env(safe-area-inset-bottom))] text-text-default lg:pb-0">
      <main className="mx-auto flex max-w-[1248px] gap-[60px] px-4 pt-5 lg:px-8 lg:py-12">
        <section className="min-w-0 flex-1">
          <h1
            className={`text-[24px] font-bold leading-[1.3] lg:text-[32px] ${gradient}`}
          >
            AI 연구실 추천
          </h1>
          <p className="mt-1 text-[16px] font-semibold text-text-subtle lg:text-[20px]">
            몇 가지만 답하면 나에게 맞는 연구실을 찾아드려요.
          </p>
          {step !== "results" && (
            <div className="mt-5 rounded-2xl bg-[#f5f5f5] px-4 py-3 lg:hidden">
              <div className="flex items-center gap-2 text-[16px] font-semibold">
                <StepIcon status={pending ? "loading" : "current"} />
                {progressLabels[stepIndex]}
              </div>
              <div className="mt-2 flex gap-1">
                {progressLabels.map((label, index) => (
                  <span
                    key={label}
                    className={`h-1 flex-1 rounded-full ${index <= stepIndex ? "bg-bg-primary" : "bg-border-subtle"}`}
                  />
                ))}
              </div>
            </div>
          )}
          <div
            className="mt-7 flex flex-col gap-3 lg:mt-6 lg:max-h-[calc(100dvh-300px)] lg:gap-4 lg:overflow-y-auto lg:pb-4"
            aria-live="polite"
            aria-busy={pending}
          >
            {pastTurns.length > 0 && (
              <>
                <div
                  role="group"
                  aria-label="이전 추천 대화"
                  className="flex flex-col gap-3 opacity-40 lg:gap-4"
                >
                  {pastTurns.map((turn, index) => (
                    <div key={index} className="flex flex-col gap-3 lg:gap-4">
                      <Bubble>먼저, 요즘 어떤 연구에 관심이 가세요?</Bubble>
                      <Bubble subtle>키워드만 적어도 괜찮아요</Bubble>
                      <Bubble user>{turn.interest}</Bubble>
                      {turn.keywords.length > 0 && (
                        <>
                          <Bubble>좋아요! 적어주신 내용에서 키워드를 뽑아봤어요. 가까운 걸 골라 주세요.</Bubble>
                          <Bubble user>{turn.keywords.join(", ")}</Bubble>
                        </>
                      )}
                      <Bubble>{turn.title}</Bubble>
                    </div>
                  ))}
                </div>
                <div
                  role="separator"
                  className="flex items-center gap-3 text-[13px] text-text-subtle"
                >
                  <span className="h-px flex-1 bg-border-subtle" />
                  새로운 추천
                  <span className="h-px flex-1 bg-border-subtle" />
                </div>
              </>
            )}
            <Bubble>연구실 추천을 위해 몇 가지 물어볼게요!</Bubble>
            <Bubble>먼저, 요즘 어떤 연구에 관심이 가세요?</Bubble>
            <Bubble subtle>키워드만 적어도 괜찮아요</Bubble>
            {step === "interest" ? (
              <form
                className="ml-auto flex w-[300px] max-w-full flex-col items-end gap-3 lg:w-[400px]"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (interest.trim() && !pending) void runRequest(true);
                }}
              >
                <Field
                  aria-label="관심 연구 주제"
                  maxLength={300}
                  disabled={pending}
                  value={interest}
                  onChange={(event) => setInterest(event.target.value)}
                  placeholder="예: 추천시스템, 파이썬 크롤링"
                />
                <button
                  className={action}
                  disabled={!interest.trim() || pending}
                  type="submit"
                >
                  {pending ? "키워드 찾는 중…" : "보내기"}
                </button>
                {error && (
                  <p role="alert" className="text-sm text-text-error">
                    {error}
                  </p>
                )}
              </form>
            ) : (
              <>
                <Bubble user>{interest}</Bubble>
                <Bubble>
                  {suggestions.length
                    ? "적어주신 내용과 가까운 키워드를 골라주세요."
                    : "관련 키워드를 찾지 못했어요. 직접 입력해서 추천받을 수 있어요."}
                </Bubble>
                <Bubble subtle>
                  최대 3개까지 고를 수 있고, 없으면 직접 입력해도 돼요
                </Bubble>
                {step === "results" && (
                  <Bubble user>
                    {keywords.length
                      ? keywords.join(", ")
                      : "관심 연구로 추천받기"}
                  </Bubble>
                )}
                {step === "keywords" && (
                  <form
                    className="ml-auto flex w-[400px] max-w-full flex-col items-end gap-3"
                    onSubmit={(event) => {
                      event.preventDefault();
                      if (!pending) {
                        setAdding(false);
                        setCustom("");
                        void runRequest(false);
                      }
                    }}
                  >
                    <fieldset
                      disabled={pending}
                      className="flex flex-wrap justify-end gap-2"
                    >
                      <legend className="sr-only">관심 키워드</legend>
                      {[...new Set(options)].map((option) => (
                        <Checkbox
                          appearance="chip"
                          key={option}
                          checked={selected.includes(option)}
                          disabled={
                            keywords.length >= 3 && !keywords.includes(option)
                          }
                          onChange={() => toggle(option)}
                          className="text-[16px]"
                        >
                          {option}
                        </Checkbox>
                      ))}
                      <button
                        type="button"
                        className="flex items-center gap-1 rounded-full border border-border-subtle px-[14px] py-1 text-[16px] disabled:opacity-50"
                        disabled={keywords.length >= 3}
                        onClick={() => setAdding((value) => !value)}
                      >
                        <Image
                          src="/icons/recommendations/plus.svg"
                          width={16}
                          height={16}
                          alt=""
                        />
                        직접 입력
                      </button>
                    </fieldset>
                    {adding && (
                      <div className="flex w-full gap-2">
                        <div className="min-w-0 flex-1">
                          <Field
                            aria-label="직접 입력"
                            maxLength={30}
                            value={custom}
                            onChange={(event) => setCustom(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                addCustom();
                              }
                            }}
                            placeholder="관심 키워드를 입력해 주세요"
                          />
                        </div>
                        <button
                          className={`shrink-0 whitespace-nowrap ${action}`}
                          type="button"
                          disabled={!custom.trim()}
                          onClick={addCustom}
                        >
                          추가
                        </button>
                      </div>
                    )}
                    {error && (
                      <p role="alert" className="text-[14px] text-red-600">
                        {error}
                      </p>
                    )}
                    <div className="flex gap-4">
                      <button
                        type="button"
                        disabled={pending}
                        className="text-[14px] text-text-subtle underline"
                        onClick={() => {
                          setAdding(false);
                          setCustom("");
                          setError("");
                          setStep("interest");
                        }}
                      >
                        이전 입력 수정
                      </button>
                      <button
                        type="submit"
                        className={action}
                        disabled={pending}
                      >
                        {pending ? "찾는 중…" : "보내기"}
                      </button>
                    </div>
                  </form>
                )}
                {step === "results" && (
                  <>
                    <Bubble>{resultTitle}</Bubble>
                    <Bubble subtle>조건을 바꿔서 다시 찾아볼까요?</Bubble>
                    <button
                      type="button"
                      className={`ml-auto ${action}`}
                      onClick={() => {
                        setError("");
                        setStep("keywords");
                      }}
                    >
                      입력 수정
                    </button>
                  </>
                )}
              </>
            )}
            {pending && (
              <button
                type="button"
                className="self-end text-sm underline"
                onClick={cancelRequest}
              >
                요청 취소
              </button>
            )}
            <div ref={end} />
          </div>
        </section>
        <aside className="hidden h-[calc(100dvh-168px)] w-[440px] overflow-y-auto shrink-0 rounded-[20px] bg-[#f5f5f5] p-9 shadow-[0_4px_16px_#0000001a] lg:block">
          {hasResults ? (
            <>
              <h2
                className={`flex items-center gap-2 text-[20px] font-semibold ${gradient}`}
              >
                <Image
                  src="/icons/recommendations/result-sparkles.svg"
                  width={24}
                  height={24}
                  alt=""
                />
                {resultTitle}
              </h2>
              <p className="mb-6 mt-2 text-[14px] text-text-subtle">
                {result?.noMatch
                  ? "관심 연구나 키워드를 바꿔 다시 시도해보세요."
                  : "나눈 이야기를 바탕으로 골랐어요"}
              </p>
              <ResultCards recommendations={recommendations} />
              {resultsFooter}
            </>
          ) : (
            <>
              <h2 className="text-[20px] font-semibold">
                어떤 연구실이 잘 맞을까요?
              </h2>
              <p className="mt-2 text-[14px] text-text-subtle">
                나눈 이야기로 잘 맞는 연구실을 찾아볼게요
              </p>
              <ol className="mt-8 space-y-[22px]">
                {[
                  "관심 주제 파악하기",
                  "키워드 정리하기",
                  "딱 맞는 연구실 찾기",
                ].map((label, index) => (
                  <li
                    key={label}
                    className={`flex items-center gap-3 text-[20px] ${index <= stepIndex ? "font-semibold text-text-primary" : "text-text-subtle"}`}
                  >
                    <StepIcon
                      status={
                        index < stepIndex
                          ? "done"
                          : index === stepIndex
                            ? pending
                              ? "loading"
                              : "current"
                            : "waiting"
                      }
                    />
                    {index === stepIndex ? progressLabels[index] : label}
                  </li>
                ))}
              </ol>
            </>
          )}
        </aside>
      </main>
      {hasResults && (
        <button
          ref={resultTrigger}
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-haspopup="dialog"
          className="fixed bottom-[calc(108px_+_env(safe-area-inset-bottom))] left-1/2 flex w-[calc(100%_-_32px)] max-w-[343px] -translate-x-1/2 items-center justify-between rounded-2xl bg-white p-4 shadow-[0_4px_16px_#00000026] lg:hidden"
        >
          <span
            className={`flex items-center gap-2 text-[13px] font-semibold ${gradient}`}
          >
            <Image
              src="/icons/recommendations/result-sparkles.svg"
              width={20}
              height={20}
              alt=""
            />
            {step === "results"
              ? resultTitle
              : `이전 추천 ${recommendations.length}곳`}
          </span>
          <span className="text-[13px]">결과 보기 ⌃</span>
        </button>
      )}
      <div ref={sheet}>
        <Dialog
          isOpen={sheetOpen}
          mobileBottomSheet
          onClose={() => setSheetOpen(false)}
          title={resultTitle}
          className="max-h-[82dvh] [&_h2]:text-[18px] [&_h2]:text-text-primary"
        >
          <div className="px-5 pt-2 pb-5">
            <p className="mb-5 text-[14px] text-text-subtle">
              {result?.noMatch
                ? "관심 연구나 키워드를 바꿔 다시 시도해보세요."
                : "나눈 이야기를 바탕으로 골랐어요"}
            </p>
            <ResultCards recommendations={recommendations} mobile />
            {resultsFooter}
          </div>
        </Dialog>
      </div>
      <MobileBottomNav activeHref="/recommendations" />
    </div>
  );
}
