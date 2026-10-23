import type { Metadata } from "next";

import "@/_app/styles/globals.css";
import { getAuthSession } from "@/shared/lib/auth/session";
import { AppHeader } from "@/widgets/site-header";
import { DEFAULT_OPEN_GRAPH, DEFAULT_TWITTER, SITE_URL } from "@/shared/config";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "똑똑",
  description: "인천대학교 연구실 정보 서비스",
  openGraph: DEFAULT_OPEN_GRAPH,
  twitter: DEFAULT_TWITTER,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAuthenticated } = await getAuthSession();

  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AppHeader isAuthenticated={isAuthenticated} />
        {children}
      </body>
    </html>
  );
}
