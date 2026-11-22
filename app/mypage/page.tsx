import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MyPage } from "@/_pages/mypage";
import { getMyMember } from "@/entities/member/api";
import { getMyBookmarks } from "@/entities/bookmark/api";
import { getCollegeOptions, getLaboratoryItem } from "@/entities/lab/api";
import { getOnboardingReviewOptions } from "@/features/onboarding/api";
import { AuthenticatedApiError } from "@/shared/api/authenticated-request";
import { ACCESS_TOKEN_COOKIE } from "@/shared/lib/auth/cookies";
import { getAuthSession } from "@/shared/lib/auth/session";

export default async function MyPageRoute() {
  if (!(await getAuthSession()).isAuthenticated) redirect("/login");
  const [colleges, bookmarkResult] = await Promise.allSettled([
    getCollegeOptions(),
    getMyBookmarks(),
  ]);
  let profile;
  try {
    profile = await getMyMember(
      colleges.status === "fulfilled"
        ? colleges.value.flatMap((item) => item.departments)
        : [],
    );
  } catch (error) {
    if (error instanceof AuthenticatedApiError && error.status === 401)
      redirect("/login");
    return (
      <main className="mx-auto max-w-[1264px] px-4 py-20 md:px-10">
        <h1 className="text-2xl font-bold">마이페이지</h1>
        <p role="alert" className="mt-5 text-text-error">
          회원 정보를 불러오지 못했어요.
        </p>
        <Link
          className="mt-3 inline-block text-text-primary underline"
          href="/mypage"
        >
          다시 불러오기
        </Link>
      </main>
    );
  }
  if (profile.researchProfile?.laboratoryId) {
    const lab = await getLaboratoryItem(
      `/api/laboratory/${profile.researchProfile.laboratoryId}`,
      { revalidate: 300 },
    ).catch(() => null);
    if (lab)
      profile.researchProfile = {
        ...profile.researchProfile,
        professorName: lab.professor.name,
        department: lab.departmentName,
      };
  }
  // 탐색자는 학부연구생 등록, 연구생은 연구실 정보 수정에서 코어타임·미팅 빈도·하는 일 선택지를 사용한다.
  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  const usesReviewOptions =
    profile.userType === "FINDER" ||
    profile.userType === "RESEARCHER" ||
    profile.isUndergraduateResearcher === true;
  const reviewOptionsResult =
    usesReviewOptions && accessToken
      ? await getOnboardingReviewOptions(accessToken).then(
          (value) => ({ value }),
          () => ({ value: undefined }),
        )
      : { value: undefined };
  return (
    <MyPage
      profile={profile}
      reviewOptions={reviewOptionsResult.value}
      initialBookmarks={
        bookmarkResult.status === "fulfilled" ? bookmarkResult.value : undefined
      }
    />
  );
}
