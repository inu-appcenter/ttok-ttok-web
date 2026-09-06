import { HomePage } from "@/_pages/home";
import { getPopularLabs } from "@/entities/lab";

export default async function Page() {
  const labs = await getPopularLabs();

  return <HomePage labs={labs} />;
}
