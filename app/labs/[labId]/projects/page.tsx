import { notFound } from "next/navigation";
import { ProjectsPage } from "@/_pages/projects";
import { getLaboratoryItem, getResearchProjects, LaboratoryApiError } from "@/entities/lab/api";

export default async function Page({ params, searchParams }: {
  params: Promise<{ labId: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { labId } = await params;
  const id = Number(labId);
  const { page: rawPage } = await searchParams;
  const page = rawPage && /^\d+$/.test(rawPage) ? Number(rawPage) : 0;
  if (!Number.isSafeInteger(id) || id < 1 || !Number.isSafeInteger(page)) notFound();
  try {
    await getLaboratoryItem(`/api/laboratory/${id}`, { revalidate: 300 });
  } catch (error) {
    if (error instanceof LaboratoryApiError && error.status === 404) notFound();
    throw error;
  }
  const result = await getResearchProjects(id, page).catch(() => null);
  if (result && page > 0 && page >= result.state.totalPages) notFound();
  return <ProjectsPage laboratoryId={id} projects={result?.content ?? []} state={result?.state} error={!result} />;
}
