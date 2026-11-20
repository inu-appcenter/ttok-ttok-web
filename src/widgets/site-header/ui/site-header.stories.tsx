import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { LOGIN_REQUIRED_MESSAGE } from "@/shared/lib/auth/login-required";
import { getLoginPath, LOGIN_REQUIRED_NOTICE } from "@/shared/lib/auth/return-path";

import { SiteHeader } from "./site-header";

const meta = {
  title: "Widgets/SiteHeader",
  component: SiteHeader,
  parameters: { layout: "fullscreen", nextjs: { navigation: { pathname: "/" } } },
} satisfies Meta<typeof SiteHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Home: Story = { args: { activeItem: "home" } };
export const Search: Story = { args: { activeItem: "search" } };
export const AiRecommendation: Story = { args: { activeItem: "ai" } };
export const Authenticated: Story = { args: { isAuthenticated: true } };

export const NavigationHover: Story = {
  args: { activeItem: "home", isAuthenticated: true },
  play: async ({ canvasElement }) => {
    if (window.matchMedia("(max-width: 767px)").matches) return;
    const canvas = within(canvasElement);
    const home = canvas.getByRole("link", { name: /^홈$/ });
    await expect(home).toHaveAttribute("aria-current", "page");
    for (const name of ["연구실 탐색", "AI 연구실 추천"]) {
      const link = canvas.getByRole("link", { name });
      const [defaultIcon, activeIcon] = link.querySelectorAll("img");
      const label = link.lastElementChild!;
      await expect(getComputedStyle(defaultIcon).opacity).toBe("1");
      await expect(getComputedStyle(activeIcon).opacity).toBe("0");
      await expect(link).toHaveClass("group");
      await expect(defaultIcon).toHaveClass("group-hover:opacity-0");
      await expect(activeIcon).toHaveClass("group-hover:opacity-100");
      if (name === "AI 연구실 추천") {
        await expect(label).toHaveClass("group-hover:bg-clip-text", "group-hover:text-transparent");
      } else {
        await expect(label).toHaveClass("group-hover:text-text-primary");
      }
    }
    home.focus();
    await expect(home).toHaveFocus();
  },
};

export const LoggedOutAiEntry: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const aiLink = canvas.getByRole("link", { name: "AI 연구실 추천" });
    await expect(aiLink).toHaveAttribute("href", getLoginPath({ notice: LOGIN_REQUIRED_NOTICE, returnTo: "/" }));
    await userEvent.click(aiLink);
    // 안내는 도착한 로그인 화면에서만 띄운다.
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
    // 별도 로그인 버튼은 안내 없이 로그인 화면으로 연결한다.
    await expect(canvas.getByRole("link", { name: "로그인" })).toHaveAttribute("href", getLoginPath({ returnTo: "/" }));
  },
};

// 로그인 화면에서 다시 보호 메뉴를 누르면 이동 없이 같은 안내 하나만 다시 보여준다.
export const LoggedOutAiEntryOnLoginPage: Story = {
  parameters: { nextjs: { navigation: { pathname: "/login" } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const aiLink = canvas.getByRole("link", { name: "AI 연구실 추천" });
    await userEvent.click(aiLink);
    await userEvent.click(aiLink);
    await expect(canvas.getAllByRole("alert")).toHaveLength(1);
    await expect(canvas.getByRole("alert")).toHaveTextContent(LOGIN_REQUIRED_MESSAGE);
    await expect(aiLink).toHaveAttribute("href", getLoginPath({ notice: LOGIN_REQUIRED_NOTICE }));
  },
};

export const AuthenticatedAiEntry: Story = {
  args: { isAuthenticated: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("link", { name: "AI 연구실 추천" }));
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
  },
};
