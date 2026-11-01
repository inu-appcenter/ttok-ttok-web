import { notFound } from "next/navigation";
import { ProjectsPage } from "@/_pages/projects";
import {
  getResearchProjectBatch,
  getLaboratoryItem,
  LaboratoryApiError,
} from "@/entities/lab/api";

export default async function Page({
  params,
}: {
  params: Promise<{ labId: string }>;
}) {
  const { labId } = await params;
  const id = Number(labId);
  if (!Number.isSafeInteger(id) || id < 1) notFound();
  try {
    await getLaboratoryItem(`/api/laboratory/${id}`, { revalidate: 300 });
  } catch (error) {
    if (error instanceof LaboratoryApiError && error.status === 404) notFound();
    throw error;
  }
  const projects = await getResearchProjectBatch(id).catch((error: unknown) => {
    console.error("[projects] 전체 연구과제 조회 실패", {
      laboratoryId: id,
      message: error instanceof Error ? error.message : "Unknown error",
      status: error instanceof LaboratoryApiError ? error.status : undefined,
    });
    return null;
  });
  return (
    <ProjectsPage
      laboratoryId={id}
      key={`${id}-${projects?.totalElements}-${projects === null}`}
      projects={projects?.projects ?? []}
      nextPage={projects?.nextPage ?? null}
      totalElements={projects?.totalElements}
      error={projects === null}
    />
  );
}
