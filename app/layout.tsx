import type { Metadata } from "next";

import "@/_app/styles/globals.css";

export const metadata: Metadata = {
  title: "똑똑",
  description: "인천대학교 연구실 정보 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
