import "server-only";

import type { LabDetail } from "../model/lab";
import {
  parseDetailPage,
  toPublication,
  toResearchProject,
  toResearchMetrics,
} from "../model/map-detail-content";
import { toLabSummary } from "../model/map-laboratory";

import {
  LaboratoryApiError,
  getLaboratoryItem,
  getLaboratoryReferenceData,
  getLaboratoryRelatedData,
} from "./laboratory-api";

type ApiLabReview = {
  coreTime?: unknown;
  doings?: unknown;
  weeklyMeeting?: unknown;
};

type ApiCoffeeChat = {
  contactType?: unknown;
  contactValue?: unknown;
  id?: unknown;
};

function getObjects(value: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(value)) {
    throw new LaboratoryApiError(
      "연구실 부가 정보 응답이 올바르지 않습니다.",
      502,
    );
  }

  return value.map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new LaboratoryApiError(
        "연구실 부가 정보 응답이 올바르지 않습니다.",
        502,
      );
    }

    return item as Record<string, unknown>;
  });
}

function getReviews(value: unknown): ApiLabReview[] {
  return getObjects(value).map((review) => ({
    coreTime: review.coreTime,
    doings: review.doings,
    weeklyMeeting: review.weeklyMeeting,
  }));
}

function getCoffeeChats(value: unknown): ApiCoffeeChat[] {
  return getObjects(value).map((coffeeChat) => ({
    contactType: coffeeChat.contactType,
    contactValue: coffeeChat.contactValue,
    id: coffeeChat.id,
  }));
}

function summarizeValues(values: string[], separator: string) {
  const counts = new Map<string, number>();

  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));

  return [...counts.entries()]
    .sort((first, second) => second[1] - first[1])
    .map(([value, count]) => `${value} (${count})`)
    .join(separator);
}

function toExperience(reviews: ApiLabReview[]): LabDetail["experience"] {
  const coreTimes = reviews.flatMap((review) =>
    typeof review.coreTime === "string" ? [review.coreTime] : [],
  );
  const weeklyMeetings = reviews.flatMap((review) =>
    typeof review.weeklyMeeting === "string" ? [review.weeklyMeeting] : [],
  );
  const doings = reviews.flatMap((review) =>
    Array.isArray(review.doings)
      ? review.doings.filter(
          (doing): doing is string => typeof doing === "string",
        )
      : [],
  );

  return {
    coreTime: summarizeValues(coreTimes, " / "),
    participantCount: reviews.length,
    primaryTasks: summarizeValues(doings, " · "),
    weeklyMeeting: summarizeValues(weeklyMeetings, " / "),
  };
}

function toContact(coffeeChats: ApiCoffeeChat[]): LabDetail["contact"] {
  const members = coffeeChats.flatMap((coffeeChat) => {
    if (
      typeof coffeeChat.id !== "number" ||
      typeof coffeeChat.contactValue !== "string" ||
      (coffeeChat.contactType !== "EMAIL" &&
        coffeeChat.contactType !== "KAKAO_TALK")
    ) {
      return [];
    }

    const isKakaoTalk = coffeeChat.contactType === "KAKAO_TALK";

    return [
      {
        contact: isKakaoTalk ? "오픈채팅 열기 ↗" : coffeeChat.contactValue,
        id: String(coffeeChat.id),
        name: "연구실 구성원",
        ...(isKakaoTalk ? { url: coffeeChat.contactValue } : {}),
      },
    ];
  });
  const email = coffeeChats.find(
    (coffeeChat) =>
      coffeeChat.contactType === "EMAIL" &&
      typeof coffeeChat.contactValue === "string",
  )?.contactValue;
  const openChatUrl = coffeeChats.find(
    (coffeeChat) =>
      coffeeChat.contactType === "KAKAO_TALK" &&
      typeof coffeeChat.contactValue === "string",
  )?.contactValue;

  return {
    email: typeof email === "string" ? email : "",
    members,
    openChatUrl: typeof openChatUrl === "string" ? openChatUrl : "",
  };
}

async function getAuthenticatedDetailData(
  laboratoryId: number,
  accessToken?: string,
) {
  if (!accessToken) {
    return { coffeeChats: [], reviews: [] };
  }

  const [reviewResult, coffeeChatResult] = await Promise.allSettled([
    getLaboratoryRelatedData(
      "/api/lab-review",
      { laboratoryId: String(laboratoryId) },
      accessToken,
    ),
    getLaboratoryRelatedData(
      "/api/coffee-chat/laboratory",
      { laboratoryId: String(laboratoryId) },
      accessToken,
    ),
  ]);

  return {
    coffeeChats:
      coffeeChatResult.status === "fulfilled"
        ? getCoffeeChats(coffeeChatResult.value)
        : [],
    reviews:
      reviewResult.status === "fulfilled" ? getReviews(reviewResult.value) : [],
  };
}

/** 실제 연구실 ID로 상세 기본 정보를 조회합니다. */
export async function getLabById(
  labId: string,
  accessToken?: string,
  pages: { projects?: number; publications?: number } = {},
): Promise<LabDetail | undefined> {
  const laboratoryId = Number(labId);

  if (!Number.isInteger(laboratoryId) || laboratoryId < 1) {
    return undefined;
  }

  try {
    const laboratory = await getLaboratoryItem(
      `/api/laboratory/${laboratoryId}`,
      {
        revalidate: 300,
      },
    );
    const [
      { coffeeChats, reviews },
      projectsResult,
      publicationsResult,
      metricsResult,
    ] = await Promise.all([
      getAuthenticatedDetailData(laboratoryId, accessToken),
      getLaboratoryReferenceData(
        `/api/laboratory/${laboratoryId}/research-projects`,
        { page: String(pages.projects ?? 0) },
      )
        .then((data) => parseDetailPage(data, toResearchProject))
        .catch(() => null),
      getLaboratoryReferenceData(
        `/api/laboratory/${laboratoryId}/publications`,
        { page: String(pages.publications ?? 0) },
      )
        .then((data) => parseDetailPage(data, toPublication))
        .catch(() => null),
      getLaboratoryReferenceData(
        `/api/research-metric/laboratory/${laboratoryId}/metrics`,
      )
        .then(toResearchMetrics)
        .catch(() => toResearchMetrics(null)),
    ]);

    return {
      ...toLabSummary(laboratory),
      aiSummary: (laboratory.introduction ?? "")
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean),
      metrics: metricsResult,
      contact: toContact(coffeeChats),
      experience: toExperience(reviews),
      homepageUrl: laboratory.labUrl,
      location: laboratory.location,
      memberCounts: {
        graduate: laboratory.capacity.graduateStudentCount,
        undergraduate: laboratory.capacity.undergraduateStudentCount,
      },
      professor: {
        name: laboratory.professor.name,
        position: laboratory.professor.position,
        email: laboratory.professor.email,
        phone: laboratory.professor.phoneNumber,
      },
      projects: projectsResult?.content ?? [],
      projectState: projectsResult?.state ?? {
        page: pages.projects ?? 0,
        totalPages: 0,
        status: "error",
      },
      papers: publicationsResult?.content ?? [],
      publicationState: publicationsResult?.state ?? {
        page: pages.publications ?? 0,
        totalPages: 0,
        status: "error",
      },
    };
  } catch (error) {
    if (error instanceof LaboratoryApiError && error.status === 404) {
      return undefined;
    }

    throw error;
  }
}
