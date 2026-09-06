import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { QuickReplies } from "./quick-replies";

const meta = {
  title: "Features/Onboarding/QuickReplies",
  component: QuickReplies,
  args: {
    options: [
      { label: "연구실을 알아보고 있어요", value: "explore" },
      { label: "학부연구생 / 대학원생이에요", value: "member" },
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-[375px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof QuickReplies>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Selected: Story = { args: { value: "member" } };
