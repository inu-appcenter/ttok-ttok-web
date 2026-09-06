import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { RecruitmentStatusTag, Tag } from "./tag";

const meta = {
  title: "Shared/UI/Tag",
  component: Tag,
  args: { children: "데이터베이스" },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Subtle: Story = { args: { tone: "subtle" } };
export const Secondary: Story = { args: { tone: "secondary" } };
export const Primary: Story = { args: { tone: "primary" } };
export const Neutral: Story = { args: { tone: "neutral" } };
export const RecruitmentStatuses: Story = {
  render: () => (
    <div className="flex gap-2">
      <RecruitmentStatusTag status="open" />
      <RecruitmentStatusTag status="upcoming" />
      <RecruitmentStatusTag status="closed" />
    </div>
  ),
};
