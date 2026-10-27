import { notFound } from "next/navigation";
import { PapersPage } from "@/_pages/papers";
import {
  getPublicationBatch,
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
  const papers = await getPublicationBatch(id).catch((error: unknown) => {
    console.error("[papers] 전체 논문 조회 실패", {
      laboratoryId: id,
      message: error instanceof Error ? error.message : "Unknown error",
      status: error instanceof LaboratoryApiError ? error.status : undefined,
    });
    return null;
  });
  return (
    <PapersPage
      laboratoryId={id}
      key={`${id}-${papers?.totalElements}-${papers === null}`}
      papers={papers?.papers ?? []}
      nextPage={papers?.nextPage ?? null}
      totalElements={papers?.totalElements}
      error={papers === null}
    />
  );
}
