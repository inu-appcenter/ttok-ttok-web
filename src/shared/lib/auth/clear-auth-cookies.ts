import type { NextResponse } from "next/server";

import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_COOKIE_PATH,
  MEMBER_ID_COOKIE,
  MEMBER_ID_COOKIE_PATH,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE_PATH,
} from "./cookies";

export function clearAuthCookies(response: NextResponse) {
  const cookieOptions = {
    expires: new Date(0),
    httpOnly: true,
    maxAge: 0,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };

  response.cookies.set(ACCESS_TOKEN_COOKIE, "", {
    ...cookieOptions,
    path: ACCESS_TOKEN_COOKIE_PATH,
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", {
    ...cookieOptions,
    path: REFRESH_TOKEN_COOKIE_PATH,
  });
  response.cookies.set(MEMBER_ID_COOKIE, "", {
    ...cookieOptions,
    path: MEMBER_ID_COOKIE_PATH,
  });

  return response;
}
