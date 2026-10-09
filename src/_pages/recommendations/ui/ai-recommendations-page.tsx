"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import {
  ATMOSPHERE_OPTIONS,
  KEYWORD_OPTIONS,
  MOCK_RECOMMENDATIONS,
  getMockRecommendations,
} from "@/features/request-ai-recommendation";
import { Checkbox, Dialog, Field } from "@/shared/ui";
import { MobileBottomNav } from "@/widgets/mobile-bottom-nav";

type Step = "interest" | "keywords" | "atmosphere" | "results";
export type AiRecommendationsPageProps = {
  initialStep?: Step;
  initialPrompt?: string;
};
const gradient =
  "bg-[linear-gradient(90deg,#a7c0db,#b4bade,#c2aed6,#d699c5)] bg-clip-text text-transparent";
const action =
  "cursor-pointer text-[18px] font-semibold underline underline-offset-4 disabled:cursor-not-allowed disabled:text-text-disabled focus-visible:outline-2 focus-visible:outline-border-primary";

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

function ResultCards({ mobile = false }: { mobile?: boolean }) {
  return (
    <div className="flex flex-col gap-3">
      {MOCK_RECOMMENDATIONS.map((lab, index) => (
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
          <p className="text-[13px] text-text-subtle">{lab.professor} 교수</p>
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
  initialStep = "interest",
  initialPrompt = "",
}: AiRecommendationsPageProps) {
  const [step, setStep] = useState<Step>(initialStep);
  const [interest, setInterest] = useState(initialPrompt);
  const [keywords, setKeywords] = useState<string[]>(
    initialStep === "interest" ? [] : KEYWORD_OPTIONS.slice(0, 2),
  );
  const [atmosphere, setAtmosphere] = useState<string[]>(
    initialStep === "results" ? ATMOSPHERE_OPTIONS.slice(0, 2) : [],
  );
  const [customKeywords, setCustomKeywords] = useState<string[]>([]);
  const [customAtmosphere, setCustomAtmosphere] = useState<string[]>([]);
  const [custom, setCustom] = useState("");
  const [adding, setAdding] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [hasResults, setHasResults] = useState(initialStep === "results");
  const [sheetOpen, setSheetOpen] = useState(false);
  const request = useRef<AbortController | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const resultTrigger = useRef<HTMLButtonElement>(null);
  const stepIndex = ["interest", "keywords", "atmosphere", "results"].indexOf(
    step,
  );

  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => {
    if (step !== initialStep)
      end.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [step, initialStep]);
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
    const selected = step === "keywords" ? keywords : atmosphere;
    const setter = step === "keywords" ? setKeywords : setAtmosphere;
    setter(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : step === "keywords" && selected.length >= 3
          ? selected
          : [...selected, value],
    );
  }
  function addCustom() {
    const value = custom.trim();
    if (!value || (step === "keywords" && keywords.length >= 3)) return;
    if (step === "keywords") {
      setCustomKeywords((items) => [...new Set([...items, value])]);
      setKeywords((items) => [...new Set([...items, value])]);
    } else {
      setCustomAtmosphere((items) => [...new Set([...items, value])]);
      setAtmosphere((items) => [...new Set([...items, value])]);
    }
    setCustom("");
    setAdding(false);
  }
  async function recommend() {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setPending(true);
    setError("");
    try {
      await getMockRecommendations(
        { interest, keywords, atmosphere },
        controller.signal,
      );
      if (controller.signal.aborted) return;
      setHasResults(true);
      setStep("results");
    } catch (cause) {
      if (!controller.signal.aborted)
        setError(
          cause instanceof Error
            ? cause.message
            : "결과를 불러오지 못했어요. 다시 시도해 주세요.",
        );
    } finally {
      if (request.current === controller) setPending(false);
    }
  }
  function restart() {
    request.current?.abort();
    setPending(false);
    setStep("interest");
    setInterest("");
    setKeywords([]);
    setAtmosphere([]);
    setAdding(false);
    setCustom("");
    setError("");
    setSheetOpen(false);
  }
  const progressLabels = [
    "관심 주제 파악하는 중…",
    "키워드 정리하는 중…",
    "선호하는 분위기 알아내는 중…",
    "딱 맞는 연구실 찾기",
  ];
  const options =
    step === "keywords"
      ? [...KEYWORD_OPTIONS, ...customKeywords]
      : [...ATMOSPHERE_OPTIONS, ...customAtmosphere];
  const selected = step === "keywords" ? keywords : atmosphere;
  const resultsFooter = (
    <div className="mt-5 text-center">
      <p className="mb-2 text-[13px] text-text-subtle">
        원하는 연구실이 없나요?
      </p>
      <button type="button" className={action} onClick={restart}>
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
          <p className="mt-2 text-[12px] text-text-subtle">
            미리보기 · 예시 키워드와 추천 결과입니다.
          </p>
          {step !== "results" && (
            <div className="mt-5 rounded-2xl bg-[#f5f5f5] px-4 py-3 lg:hidden">
              <div className="flex items-center gap-2 text-[16px] font-semibold">
                <Image
                  src="/icons/recommendations/step-target.svg"
                  width={20}
                  height={20}
                  alt=""
                />
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
            className="mt-7 flex flex-col gap-3 lg:mt-6 lg:max-h-[calc(100dvh-270px)] lg:gap-4 lg:overflow-y-auto lg:pb-4"
            aria-live="polite"
            aria-busy={pending}
          >
            <Bubble>연구실 추천을 위해 몇 가지 물어볼게요!</Bubble>
            <Bubble>먼저, 요즘 어떤 연구에 관심이 가세요?</Bubble>
            <Bubble subtle>키워드만 적어도 괜찮아요</Bubble>
            {step === "interest" ? (
              <form
                className="ml-auto flex w-[300px] max-w-full flex-col items-end gap-3 lg:w-[400px]"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (interest.trim()) setStep("keywords");
                }}
              >
                <Field
                  aria-label="관심 연구 주제"
                  maxLength={1000}
                  value={interest}
                  onChange={(event) => setInterest(event.target.value)}
                  placeholder="예: 추천시스템, 파이썬 크롤링"
                />
                <button
                  className={action}
                  disabled={!interest.trim()}
                  type="submit"
                >
                  보내기
                </button>
              </form>
            ) : (
              <>
                <Bubble user>{interest}</Bubble>
                <Bubble>
                  좋아요! 적어주신 내용에서 키워드를 뽑아봤어요. 가까운 걸 골라
                  주세요.
                </Bubble>
                <Bubble subtle>
                  최대 3개까지 고를 수 있고, 없으면 직접 입력해도 돼요
                </Bubble>
                {step !== "keywords" && (
                  <>
                    <Bubble user>{keywords.join(", ")}</Bubble>
                    <Bubble>
                      거의 다 왔어요. 마지막으로, 어떤 분위기의 연구실이
                      좋으세요?
                    </Bubble>
                    <Bubble subtle>여러 개 골라도 돼요</Bubble>
                  </>
                )}
                {(step === "keywords" || step === "atmosphere") && (
                  <form
                    className="ml-auto flex w-[400px] max-w-full flex-col items-end gap-3"
                    onSubmit={(event) => {
                      event.preventDefault();
                      if (selected.length) {
                        setAdding(false);
                        setCustom("");
                        if (step === "keywords") setStep("atmosphere");
                        else void recommend();
                      }
                    }}
                  >
                    <fieldset
                      disabled={pending}
                      className="flex flex-wrap justify-end gap-2"
                    >
                      <legend className="sr-only">
                        {step === "keywords"
                          ? "관심 키워드"
                          : "선호하는 연구실 분위기"}
                      </legend>
                      {options.map((option) => (
                        <Checkbox
                          appearance="chip"
                          key={option}
                          checked={selected.includes(option)}
                          disabled={
                            step === "keywords" &&
                            keywords.length >= 3 &&
                            !keywords.includes(option)
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
                        disabled={step === "keywords" && keywords.length >= 3}
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
                        <Field
                          aria-label="직접 입력"
                          maxLength={40}
                          value={custom}
                          onChange={(event) => setCustom(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              addCustom();
                            }
                          }}
                          placeholder="원하는 조건을 입력해 주세요"
                        />
                        <button
                          className={action}
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
                          setStep(
                            step === "keywords" ? "interest" : "keywords",
                          );
                        }}
                      >
                        이전 입력 수정
                      </button>
                      <button
                        type="submit"
                        className={action}
                        disabled={!selected.length || pending}
                      >
                        {pending ? "찾는 중…" : "보내기"}
                      </button>
                    </div>
                  </form>
                )}
                {step === "results" && (
                  <>
                    <Bubble user>{atmosphere.join(", ")}</Bubble>
                    <Bubble>
                      찾았어요! 잘 맞을 것 같은 연구실 3곳을 정리했어요.
                    </Bubble>
                    <Bubble subtle>조건을 바꿔서 다시 찾아볼까요?</Bubble>
                    <button
                      type="button"
                      className={`ml-auto ${action}`}
                      onClick={() => setStep("atmosphere")}
                    >
                      입력 수정
                    </button>
                  </>
                )}
              </>
            )}
            <div ref={end} />
          </div>
        </section>
        <aside className="hidden min-h-[720px] w-[440px] shrink-0 rounded-[20px] bg-[#f5f5f5] p-9 shadow-[0_4px_16px_#0000001a] lg:block">
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
                딱 맞는 연구실 3곳을 찾았어요
              </h2>
              <p className="mb-6 mt-2 text-[14px] text-text-subtle">
                나눈 이야기를 바탕으로 골랐어요 · 예시 결과
              </p>
              <ResultCards />
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
                  "선호하는 분위기 알아내기",
                  "딱 맞는 연구실 찾기",
                ].map((label, index) => (
                  <li
                    key={label}
                    className={`flex items-center gap-3 text-[20px] ${index <= stepIndex ? "font-semibold text-text-primary" : "text-text-subtle"}`}
                  >
                    {index <= stepIndex ? (
                      <Image
                        src={`/icons/recommendations/${index < stepIndex ? "step-check" : "step-target"}.svg`}
                        width={20}
                        height={20}
                        alt=""
                      />
                    ) : (
                      <span className="size-5 rounded-full border border-border-subtle" />
                    )}
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
          className="fixed right-4 bottom-[calc(108px_+_env(safe-area-inset-bottom))] left-4 flex items-center justify-between rounded-2xl bg-white p-4 shadow-[0_4px_16px_#00000026] lg:hidden"
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
              ? "딱 맞는 연구실 3곳을 찾았어요"
              : "이전 추천 3곳"}
          </span>
          <span className="text-[13px]">결과 보기 ⌃</span>
        </button>
      )}
      <div ref={sheet}>
        <Dialog
          isOpen={sheetOpen}
          mobileBottomSheet
          onClose={() => setSheetOpen(false)}
          title="딱 맞는 연구실 3곳을 찾았어요"
          className="max-h-[82dvh] [&_h2]:text-[18px] [&_h2]:text-text-primary"
        >
          <div className="px-5 pt-2 pb-5">
            <p className="mb-5 text-[14px] text-text-subtle">
              나눈 이야기를 바탕으로 골랐어요 · 예시 결과
            </p>
            <ResultCards mobile />
            {resultsFooter}
          </div>
        </Dialog>
      </div>
      <MobileBottomNav activeHref="/recommendations" />
    </div>
  );
}
