import { useEffect, useRef, useState } from "react";
import {
  suggestKeywords,
  requestRecommendations,
  RecommendationApiError,
} from "./request-recommendations";
import type {
  RecommendationRequest,
  RecommendationResult,
} from "./recommendation-contract";
import type {
  PastTurn,
  RecommendationSnapshot,
  RecommendationStep,
} from "./recommendation-conversation";

export type RecommendationFlowOptions = {
  initialSnapshot?: RecommendationSnapshot;
  onUnauthorized: () => void;
  initialStep?: RecommendationStep;
  initialPrompt?: string;
  initialKeywords?: string[];
  initialResult?: RecommendationResult;
  onSuggest?: (interest: string, signal: AbortSignal) => Promise<string[]>;
  onRecommend?: (
    input: RecommendationRequest,
    signal: AbortSignal,
  ) => Promise<RecommendationResult>;
};

export function useRecommendationFlow({
  initialSnapshot: restored,
  initialStep = "interest",
  initialPrompt = "",
  initialKeywords = [],
  initialResult,
  onSuggest = suggestKeywords,
  onRecommend = requestRecommendations,
  onUnauthorized,
}: RecommendationFlowOptions) {
  const [step, setStep] = useState<RecommendationStep>(
    restored?.step ?? initialStep,
  );
  const [interest, setInterest] = useState(restored?.interest ?? initialPrompt);
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
  const [isAdding, setIsAdding] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [pastTurns, setPastTurns] = useState<PastTurn[]>(
    restored?.pastTurns ?? [],
  );
  const request = useRef<AbortController | null>(null);

  const recommendations = result?.recommendations ?? [];
  const resultTitle = result?.noMatch
    ? "조건에 맞는 연구실을 찾지 못했어요"
    : `딱 맞는 연구실 ${recommendations.length}곳을 찾았어요`;
  useEffect(() => () => request.current?.abort(), []);

  function handleToggleKeyword(value: string) {
    setKeywords((items) =>
      items.includes(value)
        ? items.filter((item) => item !== value)
        : items.length < 3
          ? [...items, value]
          : items,
    );
  }
  function handleAddKeyword() {
    const value = custom.trim();
    if (!value || value.length > 30 || keywords.length >= 3) return;
    setCustomKeywords((items) => [...new Set([...items, value])]);
    setKeywords((items) => [...new Set([...items, value])]);
    setCustom("");
    setIsAdding(false);
  }
  function handleCancelRequest() {
    request.current?.abort();
    request.current = null;
    setIsPending(false);
  }
  async function handleRequest(kind: "keywords" | "recommendations") {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setIsPending(true);
    setError("");
    try {
      if (kind === "keywords") {
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
        setStep("results");
      }
    } catch (cause) {
      if (!controller.signal.aborted && request.current === controller) {
        if (cause instanceof RecommendationApiError && cause.status === 401) {
          onUnauthorized();
          return;
        }
        setError(
          cause instanceof Error
            ? cause.message
            : "결과를 불러오지 못했어요. 다시 시도해 주세요.",
        );
      }
    } finally {
      if (request.current === controller) setIsPending(false);
    }
  }
  function handleReset() {
    handleCancelRequest();
    setStep("interest");
    setInterest("");
    setKeywords([]);
    setSuggestions([]);
    setResult(undefined);
    setCustomKeywords([]);
    setIsAdding(false);
    setCustom("");
    setError("");
    setPastTurns([]);
  }
  // 이전 대화를 흐리게 남기고 입력만 비운다. 결과 카드는 새 결과가 오기 전까지 유지한다.
  function handleStartNew() {
    handleCancelRequest();
    setPastTurns((turns) => [
      ...turns,
      { interest: interest.trim(), keywords, title: resultTitle },
    ]);
    setStep("interest");
    setInterest("");
    setKeywords([]);
    setSuggestions([]);
    setCustomKeywords([]);
    setIsAdding(false);
    setCustom("");
    setError("");
  }
  return {
    snapshot: {
      step,
      interest,
      suggestions,
      keywords,
      customKeywords,
      pastTurns,
      result,
    },
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
    result,
    resultTitle,
    setInterest,
    setCustom,
    setIsAdding,
    handleToggleKeyword,
    handleAddKeyword,
    handleCancelRequest,
    handleSuggestKeywords() {
      if (interest.trim() && !isPending) void handleRequest("keywords");
    },
    handleReset,
    handleStartNew,
    handleEditInterest() {
      setIsAdding(false);
      setCustom("");
      setError("");
      setStep("interest");
    },
    handleEditKeywords() {
      setError("");
      setStep("keywords");
    },
    handleSubmitKeywords() {
      if (isPending) return;
      setIsAdding(false);
      setCustom("");
      void handleRequest("recommendations");
    },
  };
}

export type RecommendationFlow = ReturnType<typeof useRecommendationFlow>;
