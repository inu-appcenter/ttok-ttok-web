import Image from "next/image";
import { useEffect, useRef, type ReactNode } from "react";
import { Checkbox, Field } from "@/shared/ui";
import type { RecommendationFlow } from "../model/use-recommendation-flow";

const ACTION_CLASS =
  "cursor-pointer text-[18px] font-semibold underline underline-offset-4 disabled:cursor-not-allowed disabled:text-text-disabled focus-visible:outline-2 focus-visible:outline-border-primary";

function Bubble({
  children,
  isUser = false,
  isSubtle = false,
}: {
  children: ReactNode;
  isUser?: boolean;
  isSubtle?: boolean;
}) {
  return (
    <p
      className={`w-fit max-w-full whitespace-pre-wrap break-words rounded-xl px-4 py-3 leading-[1.5] shadow-[0_2px_4px_#0000001a] lg:px-6 lg:py-4 ${isUser ? "ml-auto max-w-[420px] bg-bg-primary text-[16px] font-semibold text-white" : `bg-[#f5f5f5] ${isSubtle ? "text-[14px] text-text-subtle" : "text-[16px] font-semibold lg:text-[20px]"}`}`}
    >
      {children}
    </p>
  );
}

export function RecommendationConversation({
  flow,
}: {
  flow: RecommendationFlow;
}) {
  const {
    step,
    interest,
    keywords,
    suggestions,
    customKeywords,
    pastTurns,
    custom,
    isAdding,
    isPending,
    error,
    resultTitle,
    setInterest,
    setCustom,
    setIsAdding,
    handleToggleKeyword,
    handleAddKeyword,
    handleSuggestKeywords,
    handleCancelRequest,
    handleEditInterest,
    handleEditKeywords,
    handleSubmitKeywords,
  } = flow;
  const end = useRef<HTMLDivElement>(null);
  const options = [...suggestions, ...customKeywords];
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
  return (
    <div
      className="mt-7 flex flex-col gap-3 lg:mt-6 lg:max-h-[calc(100dvh-300px)] lg:gap-4 lg:overflow-y-auto lg:pb-4"
      aria-live="polite"
      aria-busy={isPending}
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
                <Bubble isSubtle>키워드만 적어도 괜찮아요</Bubble>
                <Bubble isUser>{turn.interest}</Bubble>
                {turn.keywords.length > 0 && (
                  <>
                    <Bubble>
                      좋아요! 적어주신 내용에서 키워드를 뽑아봤어요. 가까운 걸
                      골라 주세요.
                    </Bubble>
                    <Bubble isUser>{turn.keywords.join(", ")}</Bubble>
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
      <Bubble isSubtle>키워드만 적어도 괜찮아요</Bubble>
      {step === "interest" ? (
        <form
          className="ml-auto flex w-[300px] max-w-full flex-col items-end gap-3 lg:w-[400px]"
          onSubmit={(event) => {
            event.preventDefault();
            handleSuggestKeywords();
          }}
        >
          <Field
            aria-label="관심 연구 주제"
            maxLength={300}
            disabled={isPending}
            value={interest}
            onChange={(event) => setInterest(event.target.value)}
            placeholder="예: 추천시스템, 파이썬 크롤링"
          />
          <button
            className={ACTION_CLASS}
            disabled={!interest.trim() || isPending}
            type="submit"
          >
            {isPending ? "키워드 찾는 중…" : "보내기"}
          </button>
          {error && (
            <p role="alert" className="text-sm text-text-error">
              {error}
            </p>
          )}
        </form>
      ) : (
        <>
          <Bubble isUser>{interest}</Bubble>
          <Bubble>
            {suggestions.length
              ? "적어주신 내용과 가까운 키워드를 골라주세요."
              : "관련 키워드를 찾지 못했어요. 직접 입력해서 추천받을 수 있어요."}
          </Bubble>
          <Bubble isSubtle>
            최대 3개까지 고를 수 있고, 없으면 직접 입력해도 돼요
          </Bubble>
          {step === "results" && (
            <Bubble isUser>
              {keywords.length ? keywords.join(", ") : "관심 연구로 추천받기"}
            </Bubble>
          )}
          {step === "keywords" && (
            <form
              className="ml-auto flex w-[400px] max-w-full flex-col items-end gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                handleSubmitKeywords();
              }}
            >
              <fieldset
                disabled={isPending}
                className="flex flex-wrap justify-end gap-2"
              >
                <legend className="sr-only">관심 키워드</legend>
                {[...new Set(options)].map((option) => (
                  <Checkbox
                    appearance="chip"
                    key={option}
                    checked={keywords.includes(option)}
                    disabled={
                      keywords.length >= 3 && !keywords.includes(option)
                    }
                    onChange={() => handleToggleKeyword(option)}
                    className="text-[16px]"
                  >
                    {option}
                  </Checkbox>
                ))}
                <button
                  type="button"
                  className="flex items-center gap-1 rounded-full border border-border-subtle px-[14px] py-1 text-[16px] disabled:opacity-50"
                  disabled={keywords.length >= 3}
                  onClick={() => setIsAdding((value) => !value)}
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
              {isAdding && (
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
                          handleAddKeyword();
                        }
                      }}
                      placeholder="관심 키워드를 입력해 주세요"
                    />
                  </div>
                  <button
                    className={`shrink-0 whitespace-nowrap ${ACTION_CLASS}`}
                    type="button"
                    disabled={!custom.trim()}
                    onClick={handleAddKeyword}
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
                  disabled={isPending}
                  className="text-[14px] text-text-subtle underline"
                  onClick={handleEditInterest}
                >
                  이전 입력 수정
                </button>
                <button
                  type="submit"
                  className={ACTION_CLASS}
                  disabled={isPending}
                >
                  {isPending ? "찾는 중…" : "보내기"}
                </button>
              </div>
            </form>
          )}
          {step === "results" && (
            <>
              <Bubble>{resultTitle}</Bubble>
              <Bubble isSubtle>조건을 바꿔서 다시 찾아볼까요?</Bubble>
              <button
                type="button"
                className={`ml-auto ${ACTION_CLASS}`}
                onClick={handleEditKeywords}
              >
                입력 수정
              </button>
            </>
          )}
        </>
      )}
      {isPending && (
        <button
          type="button"
          className="self-end text-sm underline"
          onClick={handleCancelRequest}
        >
          요청 취소
        </button>
      )}
      <div ref={end} />
    </div>
  );
}
