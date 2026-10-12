import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within, waitFor } from "storybook/test";
import { getRouter } from "@storybook/nextjs-vite/navigation.mock";
import { AppHeader } from "./app-header";

const meta = {
  title: "Widgets/AppHeader",
  component: AppHeader,
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true, navigation: { pathname: "/login" } },
  },
} satisfies Meta<typeof AppHeader>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ClearedSession: Story = {
  args: { isAuthenticated: true },
  beforeEach: () => {
    getRouter().refresh.mockClear();
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("link", { name: "로그인" }),
    ).toBeInTheDocument();
    await expect(
      canvas.queryByRole("link", { name: "마이페이지" }),
    ).not.toBeInTheDocument();
    await waitFor(() => expect(getRouter().refresh).toHaveBeenCalledTimes(1));
  },
};
