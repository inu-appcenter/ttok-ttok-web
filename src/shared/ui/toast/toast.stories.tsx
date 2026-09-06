import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Toast } from "./toast";

const meta = {
  title: "Shared/UI/Toast",
  component: Toast,
  args: { title: "토스트 메시지" },
  parameters: { layout: "centered" },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Success: Story = { args: { state: "success" } };
export const Warning: Story = { args: { state: "warning" } };
export const Error: Story = { args: { state: "error" } };
export const Loading: Story = { args: { state: "loading" } };
export const WithDescription: Story = {
  args: { description: "토스트 설명 메시지가 들어갑니다.", state: "success" },
};
