import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { LabDetailPage } from "@/_pages/lab-detail";
import { getLabById } from "@/entities/lab/api";
import { ACCESS_TOKEN_COOKIE } from "@/shared/lib/auth/cookies";
import { getAuthSession } from "@/shared/lib/auth/session";

type LabPageProps = {
  params: Promise<{ labId: string }>;
};

export async function generateMetadata({ params }: LabPageProps): Promise<Metadata> {
  const { labId } = await params;
  const lab = await getLabById(labId);

  return {
    title: lab ? `${lab.name} | 똑똑` : "연구실을 찾을 수 없어요 | 똑똑",
    description: lab
      ? `${lab.professorName} 교수의 ${lab.name} 연구실 정보`
      : undefined,
  };
}

export default async function Page({ params }: LabPageProps) {
  const { labId } = await params;
  const [{ isAuthenticated }, cookieStore] = await Promise.all([
    getAuthSession(),
    cookies(),
  ]);
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const lab = await getLabById(labId, accessToken);

  if (!lab) notFound();

  return <LabDetailPage isAuthenticated={isAuthenticated} lab={lab} />;
}
