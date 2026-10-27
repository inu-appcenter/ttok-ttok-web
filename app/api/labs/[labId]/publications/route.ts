import { getPublicationBatch } from "@/entities/lab/api";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ labId: string }> },
) {
  const { labId } = await params;
  const id = Number(labId);
  const rawPage = new URL(request.url).searchParams.get("page");
  const page = Number(rawPage);
  if (
    !Number.isSafeInteger(id) ||
    id < 1 ||
    rawPage === null ||
    !/^\d+$/.test(rawPage) ||
    !Number.isSafeInteger(page) ||
    page < 0
  ) {
    return Response.json({ message: "잘못된 요청입니다." }, { status: 400 });
  }
  try {
    return Response.json(await getPublicationBatch(id, page), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json(
      { message: "논문을 불러오지 못했어요." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
