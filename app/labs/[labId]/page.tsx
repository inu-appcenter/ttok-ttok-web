import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { LabDetailPage } from "@/_pages/lab-detail";
import { getLabById } from "@/entities/lab/api";
import { ACCESS_TOKEN_COOKIE } from "@/shared/lib/auth/cookies";
import { getAuthSession } from "@/shared/lib/auth/session";

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

  return {
    title: lab ? `${lab.name} | 똑똑` : "연구실을 찾을 수 없어요 | 똑똑",
    description: lab
      ? `${lab.professorName} 교수의 ${lab.name} 연구실 정보`
      : undefined,
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
  const lab = await getLabById(labId, accessToken, {
    projects: getPage(query.projects),
    publications: getPage(query.publications),
  });

  if (!lab) notFound();

  return <LabDetailPage isAuthenticated={isAuthenticated} lab={lab} />;
}
