import type { Preview } from "@storybook/nextjs-vite";
import isChromatic from "chromatic/isChromatic";
import { createElement, Fragment, type ReactNode } from "react";

import { AuthStatusProvider } from "../src/shared/lib/auth/login-required";
import { ToastProvider } from "../src/shared/ui";
import { SiteHeader, type HeaderActiveItem } from "../src/widgets/site-header";

import "../src/_app/styles/globals.css";

// Chromatic 스냅샷은 반복 재생되는 JS 모션이 멈추지 않아 캡처가 끝나지 않을 수 있다.
// Chromatic에서만 모션 줄이기 설정을 켠 것처럼 응답해 완성 상태를 바로 그리게 한다.
if (typeof window !== "undefined" && isChromatic()) {
  const matchMedia = window.matchMedia.bind(window);
  window.matchMedia = (query: string) =>
    query.includes("prefers-reduced-motion")
      ? ({
          addEventListener: () => {},
          addListener: () => {},
          dispatchEvent: () => false,
          matches: true,
          media: query,
          onchange: null,
          removeEventListener: () => {},
          removeListener: () => {},
        } as MediaQueryList)
      : matchMedia(query);
}

// 로그인한 사용자만 진입하는 화면은 기본으로 로그인 상태를 준다.
const AUTHENTICATED_PAGE_TITLES = new Set([
  "Pages/AiRecommendationsPage",
  "Pages/BookmarksPage",
  "Pages/MyPage",
]);

const preview: Preview = {
  decorators: [
    (Story, context) => {
      const isAuthenticated =
        context.parameters.authenticated === true ||
        AUTHENTICATED_PAGE_TITLES.has(context.title) ||
        context.args.isAuthenticated === true;
      const withProviders = (children: ReactNode) =>
        createElement(
          AuthStatusProvider,
          { isAuthenticated },
          createElement(ToastProvider, null, children),
        );

      if (!context.title.startsWith("Pages/") || context.title === "Pages/Onboarding") {
        return withProviders(createElement(Story));
      }

      const activeItems: Record<string, HeaderActiveItem> = {
        "Pages/Home": "home",
        "Pages/SearchPage": "search",
        "Pages/LabDetailPage": "search",
        "Pages/AiRecommendationsPage": "ai",
      };

      return withProviders(
        createElement(
          Fragment,
          null,
          createElement(SiteHeader, {
            activeItem: activeItems[context.title],
            isAuthenticated,
          }),
          createElement(Story),
        ),
      );
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: ["Shared", "Entities", "Features", "Widgets", "Pages"],
      },
    },
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ["autodocs"],
};

export default preview;
