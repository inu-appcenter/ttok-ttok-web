import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { LOGIN_REQUIRED_MESSAGE } from "@/shared/lib/auth/login-required";
import {
  LOGIN_NOTICE_PARAM,
  LOGIN_REQUIRED_NOTICE,
} from "@/shared/lib/auth/return-path";

import { LoginPage } from "./login-page";

const meta = {
  title: "Pages/Login",
  component: LoginPage,
  parameters: {
    layout: "fullscreen",
    nextjs: { navigation: { pathname: "/login" } },
  },
} satisfies Meta<typeof LoginPage>;

export default meta;

type Story = StoryObj<typeof meta>;

// 직접 방문한 로그인 화면에는 경고를 띄우지 않는다.
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).queryByRole("alert"),
    ).not.toBeInTheDocument();
  },
};

export const Error: Story = {
  args: {
    initialHasError: true,
  },
};

// 로그인 필요 기능에서 이동해 온 경우 도착한 로그인 화면에서 안내를 한 번 띄우고 URL의 안내 값을 지운다.
export const LoginRequiredArrival: Story = {
  args: { notice: LOGIN_REQUIRED_NOTICE, returnTo: "/labs/157" },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/login",
        query: { [LOGIN_NOTICE_PARAM]: LOGIN_REQUIRED_NOTICE, returnTo: "/labs/157" },
      },
    },
  },
  beforeEach: () => {
    const original = window.location.href;
    const url = new URL(original);
    url.searchParams.set(LOGIN_NOTICE_PARAM, LOGIN_REQUIRED_NOTICE);
    window.history.replaceState(window.history.state, "", url);
    return () => window.history.replaceState(window.history.state, "", original);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alert = await canvas.findByRole("alert");
    await expect(alert).toHaveTextContent(LOGIN_REQUIRED_MESSAGE);
    await expect(canvas.getAllByRole("alert")).toHaveLength(1);
    // 새로고침해도 안내가 반복되지 않도록 소비한 안내 값만 제거한다.
    await expect(
      new URL(window.location.href).searchParams.has(LOGIN_NOTICE_PARAM),
    ).toBe(false);
  },
};

// 뒤로가기 등으로 이전 화면 데이터가 다시 보여도 현재 URL에 안내 값이 없으면 띄우지 않는다.
export const ConsumedLoginRequiredNotice: Story = {
  args: { notice: LOGIN_REQUIRED_NOTICE },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).queryByRole("alert"),
    ).not.toBeInTheDocument();
  },
};

// 로그인 화면에서 다시 로그인 필요 메뉴를 누르면 이동 없이 같은 안내 하나만 다시 보여준다.
export const RepeatedLoginRequiredAttempt: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
    const aiLink = canvas.getByRole("link", { name: "AI 연구실 추천" });
    await userEvent.click(aiLink);
    await userEvent.click(aiLink);
    await expect(canvas.getAllByRole("alert")).toHaveLength(1);
    await expect(canvas.getByRole("alert")).toHaveTextContent(LOGIN_REQUIRED_MESSAGE);
  },
};
