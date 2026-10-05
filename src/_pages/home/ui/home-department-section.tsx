import { getDepartmentDirectory } from "@/entities/lab/api";

import { HomeDepartmentDirectory } from "./home-department-directory";

export async function HomeDepartmentSection() {
  const result = await getDepartmentDirectory().then(
    (colleges) => ({ colleges, status: "ready" as const }),
    () => ({ colleges: [], status: "error" as const }),
  );
  return <HomeDepartmentDirectory {...result} />;
}
