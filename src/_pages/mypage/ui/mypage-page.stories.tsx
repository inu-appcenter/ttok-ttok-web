import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { MOCK_MEMBER_PROFILE } from "@/entities/member";

import { MyPage } from "./mypage-page";

const meta = {
  title: "Pages/MyPage",
  component: MyPage,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    profile: MOCK_MEMBER_PROFILE,
  },
} satisfies Meta<typeof MyPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithdrawalDialogOpen: Story = {
  args: {
    initialWithdrawalDialogOpen: true,
  },
};
