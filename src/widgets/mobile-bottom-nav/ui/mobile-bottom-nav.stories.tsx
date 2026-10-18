import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { MobileBottomNav } from "./mobile-bottom-nav";

const meta = {
  title: "Widgets/MobileBottomNav",
  component: MobileBottomNav,
  parameters: {
    layout: "fullscreen",
    nextjs: { navigation: { pathname: "/" } },
    viewport: {
      options: { mobile375: { name: "Mobile 375", styles: { width: "375px", height: "812px" }, type: "mobile" } },
    },
  },
  globals: { viewport: { value: "mobile375", isRotated: false } },
} satisfies Meta<typeof MobileBottomNav>;

export default meta;

type Story = StoryObj<typeof meta>;

async function verifyActiveLink(canvasElement: HTMLElement, activeLabel: string) {
  const nav = within(within(canvasElement).getByRole("navigation", { name: "모바일 주요 메뉴" }));
  await expect(nav.getAllByRole("link")).toHaveLength(4);
  for (const [label, href] of [["홈", "/"], ["탐색", "/search"], ["AI추천", "/recommendations"], ["마이", "/mypage"]]) {
    const link = nav.getByRole("link", { name: label });
    await expect(link).toHaveAttribute("href", href);
    if (label === activeLabel) await expect(link).toHaveAttribute("aria-current", "page");
    else await expect(link).not.toHaveAttribute("aria-current");
  }
}

export const Default: Story = {
  play: async ({ canvasElement }) => verifyActiveLink(canvasElement, "홈"),
};

export const Explore: Story = {
  parameters: { nextjs: { navigation: { pathname: "/search" } } },
  play: async ({ canvasElement }) => verifyActiveLink(canvasElement, "탐색"),
};

export const LabDetail: Story = {
  parameters: { nextjs: { navigation: { pathname: "/labs/15" } } },
  play: async ({ canvasElement }) => verifyActiveLink(canvasElement, "탐색"),
};

export const AiRecommendations: Story = {
  parameters: { nextjs: { navigation: { pathname: "/recommendations" } } },
  play: async ({ canvasElement }) => verifyActiveLink(canvasElement, "AI추천"),
};

export const MyPage: Story = {
  parameters: { nextjs: { navigation: { pathname: "/mypage" } } },
  play: async ({ canvasElement }) => verifyActiveLink(canvasElement, "마이"),
};

export const Bookmarks: Story = {
  parameters: { nextjs: { navigation: { pathname: "/mypage/bookmarks" } } },
  play: async ({ canvasElement }) => verifyActiveLink(canvasElement, "마이"),
};
