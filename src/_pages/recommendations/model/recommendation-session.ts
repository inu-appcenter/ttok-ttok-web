import type { RecommendationResult } from "@/features/request-ai-recommendation";
import {
  clearSessionEntry,
  readSessionEntry,
  writeSessionEntry,
} from "@/shared/lib/session-store";
import type { SessionScope } from "@/shared/lib/session-store";

export type RecommendationStep = "interest" | "keywords" | "results";

// 새 추천을 시작하며 흐리게 남긴 이전 대화.
export type PastTurn = { interest: string; keywords: string[]; title: string };

// AI 추천 화면이 연구실 상세로 이동했다 돌아올 때 복원하는 대화 상태.
export type RecommendationSnapshot = {
  step: RecommendationStep;
  interest: string;
  suggestions: string[];
  keywords: string[];
  customKeywords: string[];
  pastTurns: PastTurn[];
  result?: RecommendationResult;
};

function isPastTurn(value: unknown): value is PastTurn {
  if (!value || typeof value !== "object") return false;

  const turn = value as Record<string, unknown>;

  return (
    typeof turn.interest === "string" &&
    isStringArray(turn.keywords) &&
    typeof turn.title === "string"
  );
}

const SESSION_KEY = "recommendations";
const STEPS: RecommendationStep[] = ["interest", "keywords", "results"];

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isRecommendationSnapshot(
  value: unknown,
): value is RecommendationSnapshot {
  if (!value || typeof value !== "object") return false;

  const snapshot = value as Record<string, unknown>;

  return (
    typeof snapshot.step === "string" &&
    STEPS.includes(snapshot.step as RecommendationStep) &&
    typeof snapshot.interest === "string" &&
    isStringArray(snapshot.suggestions) &&
    isStringArray(snapshot.keywords) &&
    isStringArray(snapshot.customKeywords) &&
    Array.isArray(snapshot.pastTurns) &&
    snapshot.pastTurns.every(isPastTurn)
  );
}

export function isPristineSnapshot(snapshot: RecommendationSnapshot): boolean {
  return (
    snapshot.step === "interest" &&
    snapshot.interest.length === 0 &&
    snapshot.suggestions.length === 0 &&
    snapshot.keywords.length === 0 &&
    snapshot.customKeywords.length === 0 &&
    snapshot.pastTurns.length === 0 &&
    snapshot.result === undefined
  );
}

export function readRecommendationSnapshot(
  scope: SessionScope,
): RecommendationSnapshot | undefined {
  return readSessionEntry(SESSION_KEY, scope, isRecommendationSnapshot);
}

// 입력 전 기본 상태는 저장하지 않고 비워, 복귀 시 불필요한 복원을 막는다.
export function saveRecommendationSnapshot(
  scope: SessionScope,
  snapshot: RecommendationSnapshot,
): void {
  if (isPristineSnapshot(snapshot)) {
    clearSessionEntry(SESSION_KEY);
    return;
  }

  writeSessionEntry(SESSION_KEY, scope, snapshot);
}
