import type { Metadata } from "next";

export const SITE_URL = "https://ttokttok.inuappcenter.kr";

const title = "똑똑";
const description = "인천대학교 연구실 정보 서비스";
const image = {
  url: "/images/og/ttok-og.png",
  width: 1920,
  height: 1080,
  alt: "똑똑 — 인천대생들을 위한 연구실 서비스",
};

export const DEFAULT_OPEN_GRAPH = {
  type: "website",
  locale: "ko_KR",
  siteName: title,
  title,
  description,
  url: SITE_URL,
  images: [{ ...image, type: "image/png" }],
} satisfies Metadata["openGraph"];

export const DEFAULT_TWITTER = {
  card: "summary_large_image",
  title,
  description,
  images: [image],
} satisfies Metadata["twitter"];
