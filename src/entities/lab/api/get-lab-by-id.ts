import "server-only";

import type { LabDetail } from "../model/lab";
import { toLabSummary } from "../model/map-laboratory";

import { LaboratoryApiError, getLaboratoryItem } from "./laboratory-api";

/** 실제 연구실 ID로 상세 기본 정보를 조회합니다. */
export async function getLabById(labId: string): Promise<LabDetail | undefined> {
  const laboratoryId = Number(labId);

  if (!Number.isInteger(laboratoryId) || laboratoryId < 1) {
    return undefined;
  }

  try {
    const laboratory = await getLaboratoryItem(`/api/laboratory/${laboratoryId}`, {
      revalidate: 300,
    });

    return {
      ...toLabSummary(laboratory),
      aiSummary: [],
      contact: {
        email: "",
        members: [],
        openChatUrl: "",
      },
      experience: {
        coreTime: "",
        participantCount: 0,
        primaryTasks: "",
        weeklyMeeting: "",
      },
      homepageUrl: laboratory.labUrl,
      location: laboratory.location,
      memberCounts: {
        graduate: laboratory.capacity.graduateStudentCount,
        undergraduate: laboratory.capacity.undergraduateStudentCount,
      },
      papers: [],
    };
  } catch (error) {
    if (error instanceof LaboratoryApiError && error.status === 404) {
      return undefined;
    }

    throw error;
  }
}
