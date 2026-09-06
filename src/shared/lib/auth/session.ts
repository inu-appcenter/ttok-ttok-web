import { cookies } from "next/headers";

import { ACCESS_TOKEN_COOKIE } from "./cookies";

export type AuthSession = {
  isAuthenticated: boolean;
};

export async function getAuthSession(): Promise<AuthSession> {
  const cookieStore = await cookies();

  return {
    isAuthenticated: cookieStore.has(ACCESS_TOKEN_COOKIE),
  };
}
