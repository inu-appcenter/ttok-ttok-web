import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { LabDetailPage } from "@/_pages/lab-detail";
import { getLabById } from "@/entities/lab/api";
import { getMyBookmarks } from "@/entities/bookmark/api";
import { getMyMember } from "@/entities/member/api";
import { ACCESS_TOKEN_COOKIE } from "@/shared/lib/auth/cookies";
import { getAuthSession } from "@/shared/lib/auth/session";
import { DEFAULT_OPEN_GRAPH, DEFAULT_TWITTER } from "@/shared/config";

type LabPageProps = {
  params: Promise<{ labId: string }>;
  searchParams: Promise<{
    projects?: string | string[];
    publications?: string | string[];
  }>;
};

export async function generateMetadata({
  params,
}: LabPageProps): Promise<Metadata> {
  const { labId } = await params;
  const lab = await getLabById(labId);
  const title = lab ? `${lab.name} | 똑똑` : "연구실을 찾을 수 없어요 | 똑똑";
  const description = lab
    ? `${lab.professorName} 교수의 ${lab.name} 연구실 정보`
    : DEFAULT_OPEN_GRAPH.description;

  return {
    title,
    description,
    openGraph: { ...DEFAULT_OPEN_GRAPH, title, description, url: `/labs/${encodeURIComponent(labId)}` },
    twitter: { ...DEFAULT_TWITTER, title, description },
  };
}

function getPage(value?: string | string[]) {
  if (typeof value !== "string") return 0;
  const page = Number(value);
  return value && /^\d+$/.test(value) && Number.isSafeInteger(page) ? page : 0;
}

export default async function Page({ params, searchParams }: LabPageProps) {
  const { labId } = await params;
  const [{ isAuthenticated }, cookieStore] = await Promise.all([
    getAuthSession(),
    cookies(),
  ]);
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const query = await searchParams;
  const [lab, bookmarks, member] = await Promise.all([
    getLabById(labId, accessToken, {
      projects: getPage(query.projects),
      publications: getPage(query.publications),
    }),
    isAuthenticated
      ? getMyBookmarks().catch(() => undefined)
      : Promise.resolve([]),
    isAuthenticated ? getMyMember().catch(() => null) : Promise.resolve(null),
  ]);

  if (!lab) notFound();

  return (
    <LabDetailPage
      isAuthenticated={isAuthenticated}
      lab={lab}
      memberDepartmentCode={member?.departmentCode}
      canContribute={
        member?.userType === "RESEARCHER" &&
        member.researchProfile?.laboratoryId === lab.laboratoryId
      }
      bookmarkActions={{ initialBookmarks: bookmarks }}
    />
  );
}
