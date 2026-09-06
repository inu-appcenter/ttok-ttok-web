import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ChatMessage } from "./chat-message";

const meta = {
  title: "Features/Onboarding/ChatMessage",
  component: ChatMessage,
  args: { children: "어떤 목적으로 방문하셨나요?", sender: "bot" },
  decorators: [
    (Story) => (
      <div className="w-[375px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChatMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BotDefault: Story = {};
export const BotSubtle: Story = {
  args: {
    children: "선택하신 역할에 맞춰 가장 적합한 연구실 정보를 보여드릴게요",
    emphasis: "subtle",
    sender: "bot",
  },
};
export const User: Story = {
  args: { children: "학부연구생 / 대학원생이에요", sender: "user" },
};
