import type { LabSummary } from "../model/lab";
import { toLabSummaryPage } from "../model/map-laboratory";

import { getLaboratories } from "./get-laboratories";

const HOME_LAB_COUNT = 6;
const HOME_LAB_REVALIDATE_SECONDS = 300;

/** 홈에 표시할 연구실 6개를 서버 기본 정렬 순서로 조회합니다. */
export async function getHomeLabs(): Promise<LabSummary[]> {
  const page = await getLaboratories(
    { page: 0, size: HOME_LAB_COUNT },
    // 연구실 데이터는 자주 바뀌지 않으므로 5분마다 새 데이터로 갱신합니다.
    { revalidate: HOME_LAB_REVALIDATE_SECONDS },
  );

  return toLabSummaryPage(page).content.slice(0, HOME_LAB_COUNT);
}
