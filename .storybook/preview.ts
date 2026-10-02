import type { Preview } from "@storybook/nextjs-vite";
import { createElement, Fragment } from "react";

import { SiteHeader, type HeaderActiveItem } from "../src/widgets/site-header";

import "../src/_app/styles/globals.css";

const preview: Preview = {
  decorators: [
    (Story, context) => {
      if (!context.title.startsWith("Pages/") || context.title === "Pages/Onboarding") {
        return createElement(Story);
      }

      const activeItems: Record<string, HeaderActiveItem> = {
        "Pages/Home": "home",
        "Pages/SearchPage": "search",
        "Pages/LabDetailPage": "search",
        "Pages/AiRecommendationsPage": "ai",
      };
      const isAuthenticated =
        context.parameters.siteHeaderAuthenticated === true ||
        context.title === "Pages/MyPage" ||
        context.title === "Pages/AiRecommendationsPage" ||
        context.args.isAuthenticated === true;

      return createElement(
        Fragment,
        null,
        createElement(SiteHeader, {
          activeItem: activeItems[context.title],
          isAuthenticated,
        }),
        createElement(Story),
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
