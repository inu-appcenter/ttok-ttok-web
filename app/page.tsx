import { HomePage } from "@/_pages/home";
import { getHomeLabs } from "@/entities/lab/api";
import { getAuthSession } from "@/shared/lib/auth/session";

export default async function Page() {
  const { isAuthenticated } = await getAuthSession();
  let labs: Awaited<ReturnType<typeof getHomeLabs>> = [];
  let labsError: string | undefined;

  try {
    labs = await getHomeLabs();
  } catch {
    labsError = "연구실 정보를 불러오지 못했습니다.";
  }

  return (
    <HomePage
      isAuthenticated={isAuthenticated}
      labs={labs}
      labsError={labsError}
    />
  );
}
