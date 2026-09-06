import { MOCK_LAB_DETAILS } from "../model/mock-labs";
import type { LabDetail } from "../model/lab";

/** API 연결 전 labId 기반 상세 조회 경계입니다. */
export async function getLabById(labId: string): Promise<LabDetail | undefined> {
  return MOCK_LAB_DETAILS.find((lab) => lab.labId === labId);
}
