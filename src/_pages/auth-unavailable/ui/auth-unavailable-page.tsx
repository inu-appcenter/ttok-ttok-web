import Link from "next/link";
export async function AuthUnavailablePage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string | string[] }>;
}) {
  const { returnTo } = await searchParams;
  const retryPath =
    typeof returnTo === "string" &&
    /^\/(?:mypage(?:\/bookmarks)?|recommendations|onboarding)$/.test(returnTo)
      ? returnTo
      : "/mypage";
  return (
    <main className="flex flex-1 items-center justify-center bg-bg-default px-4 py-20 text-text-default">
      <div className="max-w-md">
        <h1 className="text-2xl font-bold">회원 정보를 확인하지 못했어요</h1>
        <p role="alert" className="mt-4 text-text-subtle">
          잠시 후 다시 시도해 주세요.
        </p>
        <Link
          className="mt-6 inline-block rounded-md text-text-primary underline focus-visible:outline-2 focus-visible:outline-border-primary"
          href={retryPath}
        >
          다시 불러오기
        </Link>
      </div>
    </main>
  );
}
