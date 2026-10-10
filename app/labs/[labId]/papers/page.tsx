import { notFound } from "next/navigation";
import { PapersPage } from "@/_pages/papers";
import {
  getAllPublications,
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
  const papers = await getAllPublications(id).catch(() => null);
  return (
    <PapersPage
      laboratoryId={id}
      papers={papers ?? []}
      error={papers === null}
    />
  );
}
