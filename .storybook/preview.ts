import type { Preview } from "@storybook/nextjs-vite";
import { createElement, Fragment, type ReactNode } from "react";

import { AuthStatusProvider } from "../src/shared/lib/auth/login-required";
import { ToastProvider } from "../src/shared/ui";
import { SiteHeader, type HeaderActiveItem } from "../src/widgets/site-header";

import "../src/_app/styles/globals.css";

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
