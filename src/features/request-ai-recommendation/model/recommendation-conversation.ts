import type { RecommendationResult } from "./recommendation-contract";

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
