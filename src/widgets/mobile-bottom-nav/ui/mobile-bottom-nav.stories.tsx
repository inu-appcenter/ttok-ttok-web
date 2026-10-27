import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { getLoginPath, LOGIN_REQUIRED_NOTICE } from "@/shared/lib/auth/return-path";

import { MobileBottomNav } from "./mobile-bottom-nav";

const meta = {
  title: "Widgets/MobileBottomNav",
  component: MobileBottomNav,
  parameters: {
    // 활성 메뉴 확인은 로그인 상태 기준이다. 비로그인 이동은 별도 스토리에서 확인한다.
    authenticated: true,
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

export const LoggedOutProtectedEntries: Story = {
  parameters: { authenticated: false, nextjs: { navigation: { pathname: "/labs/15" } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = within(canvas.getByRole("navigation", { name: "모바일 주요 메뉴" }));
    const aiLink = nav.getByRole("link", { name: "AI추천" });
    const myLink = nav.getByRole("link", { name: "마이" });
    // 보호 메뉴는 새 탭에서도 같은 흐름이 되도록 href 자체가 로그인 안내와 상세 복귀 경로를 가진다.
    const loginPath = getLoginPath({ notice: LOGIN_REQUIRED_NOTICE, returnTo: "/labs/15" });
    await expect(aiLink).toHaveAttribute("href", loginPath);
    await expect(myLink).toHaveAttribute("href", loginPath);
    await expect(nav.getByRole("link", { name: "홈" })).toHaveAttribute("href", "/");
    await expect(nav.getByRole("link", { name: "탐색" })).toHaveAttribute("href", "/search");
    await userEvent.click(aiLink);
    myLink.focus();
    await userEvent.keyboard("{Enter}");
    // 안내는 로그인 화면에서만 띄우므로 현재 화면에는 토스트가 없다.
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
  },
};

export const AuthenticatedProtectedEntries: Story = {
  parameters: { authenticated: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = within(canvas.getByRole("navigation", { name: "모바일 주요 메뉴" }));
    await userEvent.click(nav.getByRole("link", { name: "AI추천" }));
    await userEvent.click(nav.getByRole("link", { name: "마이" }));
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
  },
};
