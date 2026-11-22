/** GET /api/lab-review/options 응답 중 연구실 정보 수정에 쓰는 선택지 */
export type ResearchReviewOptions = {
  coreTime: readonly string[];
  weeklyMeeting: readonly string[];
  works: readonly string[];
};

/** 온보딩·학부연구생 등록과 같은 기준으로 하는 일은 최대 3개까지 고른다. */
export const MAX_REVIEW_DOINGS = 3;
