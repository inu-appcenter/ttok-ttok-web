export type RecommendationInput = {
  interest: string;
  keywords: string[];
  atmosphere: string[];
};

export const KEYWORD_OPTIONS = [
  "데이터마이닝",
  "추천시스템",
  "웹 크롤링",
  "빅데이터",
  "자연어 처리",
];
export const ATMOSPHERE_OPTIONS = [
  "자율적인 분위기",
  "코어타임 없음",
  "쾌적한 연구실",
  "주 1회 미팅",
];

// 미리보기 전용 결과. 실제 추천 순위나 연구실 분위기에 대한 판단이 아니다.
export const MOCK_RECOMMENDATIONS = [
  {
    id: 124,
    name: "인공지능 응용시스템 연구실",
    professor: "황광일",
    tags: ["Embedded AI", "Machine Learning"],
    reasons: [
      "인공지능 응용 연구를 살펴볼 수 있어요",
      "소프트웨어 관련 연구 주제를 확인해 보세요",
    ],
  },
  {
    id: 47,
    name: "의료인공지능 연구실",
    professor: "조환호",
    tags: ["Medical AI", "Image Computing"],
    reasons: [
      "의료 분야의 인공지능 연구를 살펴볼 수 있어요",
      "영상 데이터를 다루는 연구 주제를 확인해 보세요",
    ],
  },
  {
    id: 20,
    name: "인공지능 응용 유체공학 연구실",
    professor: "신창훈",
    tags: ["유체공학", "인공지능 응용"],
    reasons: [
      "공학 분야의 응용 연구를 살펴볼 수 있어요",
      "연구실 상세 정보에서 연구 주제를 확인해 보세요",
    ],
  },
];

export async function getMockRecommendations(
  input: RecommendationInput,
  signal: AbortSignal,
) {
  if (
    !input.interest.trim() ||
    !input.keywords.length ||
    !input.atmosphere.length
  ) {
    throw new Error("관심 주제와 선호 조건을 입력해 주세요.");
  }
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, 500);
    function abort() {
      clearTimeout(timeout);
      reject(new DOMException("추천 요청을 취소했습니다.", "AbortError"));
    }
    if (signal.aborted) abort();
    else signal.addEventListener("abort", abort, { once: true });
  });
  return MOCK_RECOMMENDATIONS;
}
