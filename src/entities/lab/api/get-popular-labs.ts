import { MOCK_LABS } from "../model/mock-labs";
import type { LabSummary } from "../model/lab";

/**
 * 인기 연구실 데이터의 서버 조회 경계입니다.
 * API가 연결되면 이 함수 내부에서 응답을 LabSummary로 변환합니다.
 */
export async function getPopularLabs(): Promise<LabSummary[]> {
  return MOCK_LABS;
}
